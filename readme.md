# mock server 使用说明
(持续改进中...)

## 1. 安装

进入mock server文件夹, 运行npm install

## 2. 模拟数据配置

一个新页面对应的完整mock数据涉及到的文件结构如下:

    --mock_server
        |
        |--commonFtlData
        |    |
        |    |--navMenu
        |         |
        |         |--xxx.js         页面所属的MS模块的url映射关系(影响顶部导航条)
        |
        |--ftlMockData
        |    |
        |    |--abc.def.json        页面中用到的同步数据
        |
        |--ajax
        |   |
        |   |--abc.def.do           定义页面中每个ajax接口的文件夹
        |   |     |
        |   |     |
        |   |     |--aaa.do.json     接口aaa.do对应的定义
        |   |     |--bbb.do.json     接口bbb.do对应的定义
        |   |
        |   |
        |   |--retCode200.json       只需要返回retCode=200 信息的接口地址全部放在这个文件
        |
        |
        |--urlMap.json              所有页面的url和ftl对应关系

说明: 有些页面是从其他页面取数据后跳转过去的, 并不出现在导航条中, 所以navMenu中的配置和urlMap.json都要保留, 并不重复.

**注意: mock_server 初始化路由配置是通过urlMap进行初始化的, navMenu只作为页面中的一种展示数据使用.**

**所以, 新增页面时可以不修改navMenu, 但一定要在urlMap.json中增加对应关系**

下面以一个路径为`/abc/def.do`的新页面为例

#### a. 页面入口及同步数据配置

新建一个页面时，如

> 页面地址：/abc/def.do

> ftl文件位置：new_template/pages/aaa/bbb/ccc.ftl

则向mock_server/mock/urlMap.json文件中的数组添加一项

    {
	    entry: '/abc/def.do',
	    ftlPath: 'new_template/pages/aaa/bbb/ccc.ftl'
	}
如果需要在ftl中渲染同步数据的话, 在mock_server/mock/ftlMockData/路径下新建文件`abc.def.do.json`,  同步数据, 如下:

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

## 3. 启动

双击mock_server/路径下的startNode.bat，即可启动mock server。修改mock数据后可以直接生效，不需要重启。

**tips: idea可以安装一个插件`CMD support`, 然后就可以在IDE中右键脚本文件, 在菜单中选择`run cmd script`选项运行脚本**

**注意: idea自带的cmd环境无法直接运行启动脚本**

## 4. 注意

1. 如果ftl中存在语法错误或ftl中引用了不存在的ftl(如fackData/xxxx)时, mock server 会默默的将其吞掉. mock server会在命令行中提示渲染对应的模板出错并返回<div>error</div>, 请观察ftl代码和模拟数据是否有误


## 5.页面实时刷新

如果想在开发中启动实时刷新功能, 在mock server启动后,双击f5.bat即可(此时请使用localhost:3001的地址查看网页, 实时刷新功能开启时, 首屏渲染时间反而比不开时长)

mock server中使用的实时刷新插件来自browsersync

使用过程中发现, browserSync会出现某些文件改动后不自动刷新的问题, 并偶尔出现请求时间变长的问题. 如果影响使用, 请关闭browserSync的代理服务器, 直接用node的3000地址访问

参考: [browsersync中文文档](http://www.browsersync.cn/)
[官网](https://www.browsersync.io/)

## 6.tips

目前使用中常见的错误造成的异常(mock文件数据格式错误, ftl文件找不到, 渲染出错等), 都可以在mockserver 的cmd中或页面上打印出来, 如果页面出现加载不出来的情况, 请留意cmd中的信息

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
