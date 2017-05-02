
# jmockr 使用说明

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/jmockr.svg?style=flat-square
[npm-url]: http://npmjs.org/package/jmockr
[download-image]: https://img.shields.io/npm/dm/jmockr.svg?style=flat-square
[download-url]: https://npmjs.org/package/jmockr


## 1. 安装


[![dom-scroll-into-view](https://nodei.co/npm/jmockr.png)](https://npmjs.org/package/jmockr)

`npm install jmockr`

## 2. 配置文件

配置文件名为jmockr.config.json, 放置在jmockr所在的文件夹中(即执行npm install jmockr 的文件夹).

配置文件内容:

以下是一份示例

 ```
{
    "authConfig": {
        "username": "xxxxx", //测试环境登录用的账号和口令
        "password": "xxxxx_"
    },
    "proxyConfig": {
        "enable": true, //是否将ajax请求代理到测试环境
        "useIP": false, //代理时使用IP还是域名
        "protocol": "https",
        "domain": "globalms.netease.com", //测试环境的域名
        "ip": "127.0.0.1", //测试环境的IP
        "enablePort": false, //是否声明端口号
        "port": 4000
    },
    "dataPath": {
        "urlMap": "mock/urlMap.json", // 1.[文件地址]
        "commonFtl": "mock/commonFtlData", // 2.[文件夹地址]
        "url200": "mock/ajax/retCode200.json", // 3.[文件地址]
        "pageFtl": "mock/ftlMockData", // 4.[文件夹地址]
        "ajax": "mock/ajax" // 5.[文件夹地址]
    },
    "serverConfig": {
        "port": 3000, //jmockr监听的端口
        "static": "./webapp", //前端静态文件位置 包括css/js/图片资源等
        "noOpenPage": false, //服务器启动之后, 是否禁止自动在浏览器中打开默认页面, 如果设置了initialURL, 此配置项无效
        "initialURL": 'www.test.com' //服务器启动后默认打开的页面地址, 如果不填, 将打开 http://localhost:port
    },
    "ftlFilePath": "xxxx", // 6.[文件夹地址]
    "liveReload": { //liveReload 模式的配置
        "watch": [ //监听变化的文件或路径
             "**/*.css",
             "**/*.js",
             "**/*.html",
             "**/*.ftl"
        ],
        "ignore": [ //不监听的文件或路径
             "../ignore/**/*.*"
        ]
    }
}
 ```

 1. 页面地址映射到的ftl文件相对路径, 内容为一个数组, 形如`[{"entry": "xxxxx", "ftlPath": "yyyyy"}, {"entry": "xxxxx2", "ftlPath": "yyyyy2"}]`
 2. 存放通用ftl mock数据(即所有页面均会使用的ftl数据)文件的目录, 每个文件是json文件
 3. 此文件为一个url数组, 数组中所有url的ajax返回数据为 `{retCode: 200}`
 4. 每个页面中独有的ftl mock 数据的文件目录, 每个文件是json文件, 文件的命名规则见<a href="#mmgz">命名规则</a>
 5. 页面中每个ajax接口的mock数据放在一个json文件中, 每个页面的所有mock数据的json文件放在一个ajax文件夹(ajax文件夹的命名规则见<a href="#mmgz">命名规则</a>)中, 所有页面的ajax文件夹放在此目录下
 6. 存放所有ftl文件的相对路径

**注意: 所有的相对路径, 都是相对于jmockr.config.json文件**


<div id="mmgz">命名规则</div>
已页面地址为`/abc/def.do`为例,

下面以一个路径为`/abc/def.do`的新页面为例

去掉, 第一个斜杠, 把剩下的斜杠换成点即可. 所以页面ftl的mock数据文件名为`abc.def.do.json`
页面的ajax mock数据文件夹名为`abc.def.do`, 在此文件夹下, 所有ajax接口的mock文件名格式无格式要求(随便起名), 但必须是json文件或导出数据的.js文件, 如`1.json`, `abc.json`均为合法文件名

以下举例:

#### a. 页面入口及同步数据配置

新建一个页面时，如

> 页面地址：/abc/def.do

> ftl文件位置：new_template/pages/aaa/bbb/ccc.ftl

则向mock/urlMap.json文件中的数组添加一项

    {
	    entry: '/abc/def.do',
	    ftlPath: 'new_template/pages/aaa/bbb/ccc.ftl'
	}
如果需要在ftl中渲染同步数据的话, 在mock/ftlMockData/路径下新建文件`abc.def.do.json`,  同步数据, 如下:

    {
        sentence: "Hello World",
        sentence2: 'abcdefg',
        arr: [1, 2, 3, 4, 5, 6, 7]
    }

#### b.异步接口配置

##### 1.完整配置

在`mock_server/mock/ajax/`路径下添加文件夹`abc.def.do`

文件夹名为entry的值(即页面地址)去掉第一个斜杠

页面中每添加一个异步接口，就在abc.def.do路径下添加一个json文件, 文件名随意，json结构如下：

    {
	    "url": "/cms/album/searchTag.do",   //异步接口地址
	    "method": "post",                   //接口调用方法(get/post/put/delete) 不写时默认为post.
	    //如果需要支持多种请求方式返回同样的结果, 可以将请求方式用逗号分开 如"method": "get,post"
	    "result": {                         //接口返回值
	        "abc": "def"
	    }
	}

##### 2.简化配置

对于只需要server返回`{retCode: 200}`的接口(如发布数据, 删除数据的接口), 只需将接口的地址直接添加到`retCode200.json`中即可, 不需要其他配置

#### c.proxy配置

异步数据除了在本地的json文件中配置外, 还可以直接调用测试环境的接口获取, 即代理功能.

此功能的相关配置放在/config/proxy.json文件中, 将`enable`属性设置为true, 即可开启代理功能.

代理功能支持两种方式配置转发地址: **ip:端口**和**域名**. 默认情况下使用域名模式. 将`enablePort`属性设置为true即开启ip:端口模式.

测试环境的账号和口令配置放在/auth/config.json中, 可根据具体情况进行修改.

**如果开启代理, 请确认当前host或者ip是自己需要调试的目标地址, 避免产生环境不对造成接口访问不到的问题**

## 3. 启动命令

    jmockr -n 或 jmockr --normal 普通启动, 修改mock数据或页面代码, 不会重启服务器
    jmockr -s 或 jmockr --start 热启动, 修改mock数据会触发jmockr更新mock数据
    jmockr -l 或 jmockr --live 带有live reload功能的热启动, 修改页面代码时会自动刷新浏览器

## 4.tips

1. jmockr支持json5风格的json文件, 如下:

```
{
    foo: 'bar',
    while: true,

    this: 'is a \
multi-line string',

    // this is an inline comment
    here: 'is another', // inline comment

    /* this is a block comment
       that continues on another line */

    hex: 0xDEADbeef,
    half: .5,
    delta: +10,
    to: Infinity,   // and beyond!

    finally: 'a trailing comma',
    oh: [
        "we shouldn't forget",
        'arrays can have',
        'trailing commas too',
    ],
}
```


 详见[JSON5](https://github.com/json5/json5)


## *. TODO

#### a. 自定义异步接口返回数据的逻辑:

	/**
	 * query代表`req.query`
	 * body代表`req.body`
	 * params代表`req.params`
	 * /

	result: function(query, body, params) {
		return xxx;
	}

#### b.mock 文件中的数据支持正则编辑规则:
可能如下
```
{
	url: 'xxx',
	method: 'post',
	result: {
		a: '1number10', //介于1到10之间的整数
		b: '5string20'  //介于5到10字母长度的字符串
	}
}
```
参考资料:
[nuysoft/Mock](https://github.com/nuysoft/Mock/wiki/Syntax-Specification)


## License

jMockr is released under the ISC license.
