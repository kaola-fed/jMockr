# jmockr introduction

[中文文档](https://github.com/yubaoquan/jMockr/blob/master/readme.zh-CN.md)
[![NPM version][npm-image]][npm-url]
[![Build Status](https://travis-ci.org/yubaoquan/jMockr.svg?branch=master)](https://travis-ci.org/yubaoquan/jMockr)
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/jmockr.svg?style=flat-square
[npm-url]: http://npmjs.org/package/jmockr
[download-image]: https://img.shields.io/npm/dm/jmockr.svg?style=flat-square
[download-url]: https://npmjs.org/package/jmockr


## 1. Install


[![dom-scroll-into-view](https://nodei.co/npm/jmockr.png)](https://npmjs.org/package/jmockr)

`npm install jmockr`

## 2. Config

The config file is named `jmockr.config.json`, located in the folder where jmockr in.(the folder where you run `npm install jmockr`)


Here is a demo:

 ```
{
    "authConfig": {
        "username": "xxxxx", //useless now
        "password": "xxxxx_" //useless now
    },
    "proxyConfig": { // proxy config
        "enable": true, // whether proxy the ajax request to other server
        "useIP": false, // use IP to locate the target server, if set to true, the `domain` is omitted, otherwise `ip` is omitted
        "protocol": "https",
        "domain": "xxx.yyy.com",
        "ip": "127.0.0.1",
        "enablePort": false, // whether send request to a specific port of target server, if set to false, the `port` is omitted
        "port": 4000
    },
    "dataPath": {
        "urlMap": "mock/urlMap.json", // 1.[file]
        "commonFtl": "mock/commonFtlData", // 2.[folder]
        "commonAjax": "mock/commonAjax", // 3.[folder]
        "pageFtl": "mock/ftlMockData", // 4.[folder]
        "ajax": "mock/ajax" // 5.[folder]
    },
    "serverConfig": {
        "port": 3000, // port jmockr listens on
        "static": "./webapp", // static files are put here, like css or js files
        "noOpenPage": false, // whether open the default page in browser. if initialURL is set, this option is omitted
        "initialURL": 'www.test.com' // Default page to open after server launched. If ommited, will set to `http://localhost:port`
    },
    "ftlFilePath": "xxxx", // Folder
    "moduleFtlPathes": ["aaa", "bbb"], // Folder
    "liveReload": { // live reload config
        "watch": [ // paths to watch, if file under these has changed, server will refresh the browser
             "**/*.css",
             "**/*.js",
             "**/*.html",
             "**/*.ftl"
        ],
        "ignore": [ //paths not watch
             "../ignore/**/*.*"
        ]
    }
}
 ```

 1. Array of map, the map is pages url to page template file , like`[{"entry": "/this/is/a/page", "ftlPath": "/the/template/file.ftl"}, {"entry": "xxxxx2", "ftlPath": "yyyyy2"}]`

 2. A folder stores common freemarker mock data(the mock data that all pages need to use), files under the folder are json files.

 3. A root folder stores common ajax config folders, each subfolder in root folder contains two file: one file (its name could be `url.js`, `url.json` or `url.json5`) contains the urls of the ajax, another file (its name could be `data.js`, `data.json` or `data.json5`) contains the response data of the urls, below is an example:
 ```
 // structure
 /mock/commonAjax/
                |
                -------api1
                |        |
                |        |--url.json
                |        |--data.json
                |
                |------api2
                |        |
                |        |--url.json
                |        |--data.json

// url.json

[
    '/the/first/url.do',
    '/the/second/url.do',
    //...
]

// data.json

{
    someKey1: someVal1,
    someKey2: someVal2,
    //...
}

// All the ajax of url in url.json will response data in data.json which in the same folder of url.json.
 ```

 4. Folder stores page scoped freemarker mock data ftl mock. Every file in this folder is json file, see<a href="#mmgz">naming rule</a>

 5. Each ajax mock data is put in a json file. All ajax mock data file are put in a page scoped ajax folder (to name this folder, see <a href="#mmgz">naming rule</a>), all the folders is in this folder.

 6. Store all ftl files or subfolders(ralative to jmockr config file).

 7. Other ftl's root path(on the same level or out of `ftlFilePath`, for example ftl in node_modules)

**Tips: all relative paths are relative to `jmockr.config.json`**


<div id="mmgz">Naming rule</div>
Take a page who's url is `/abc/def.do` for instance,

1. Remove the first slash in url
2. Replace rest slashes in url to dot. so filename of sync data for the page is `abc.def.do.json`
3. Under ajax mock data folder, all ajax config files have no limit of naming rule, but must be json file or exportable .js file, such as `1.json`, `abc.json` are valid.

Example:

#### a. Page route and sync mock data config

When you create a page, like

> page url：/abc/def.do

> freemarker file location：new_template/pages/aaa/bbb/ccc.ftl

You need to add one config item to array in `mock/urlMap.json`

    {
        entry: '/abc/def.do',
        ftlPath: 'new_template/pages/aaa/bbb/ccc.ftl'
    }
If you need to put some sync data to freemarker, create a new file named`abc.def.do.json`, put it to `mock/ftlMockData/` fill the sync mock data in this file, like:

    {
        sentence: "Hello World",
        sentence2: 'abcdefg',
        arr: [1, 2, 3, 4, 5, 6, 7]
    }

#### b. AJAX config

##### 1.Complete config

Add `abc.def.do` to `mock_server/mock/ajax/`

File name is entry(the page url) exclude the first slash.

When add an ajax config to the page，add a json file to `abc.def.do`, file name is not limited，data structure like this：

    {
        "url": "/cms/album/searchTag.do",   // the ajax url
        "method": "post",                   // (get/post/put/delete) if omitted, set to post.
        //if want to support multi methods to a ajax, split the methods with comma. like"method": "get,post"
        "result": {                         // response data from ajax
            "abc": "def"
        }
    }

#### c.Proxy config

异步数据除了在本地的json文件中配置外, 还可以直接调用测试环境的接口获取, 即代理功能.

此功能的相关配置放在/config/proxy.json文件中, 将`enable`属性设置为true, 即可开启代理功能.

代理功能支持两种方式配置转发地址: **ip:端口**和**域名**. 默认情况下使用域名模式. 将`enablePort`属性设置为true即开启ip:端口模式.

测试环境的账号和口令配置放在/auth/config.json中, 可根据具体情况进行修改.

**如果开启代理, 请确认当前host或者ip是自己需要调试的目标地址, 避免产生环境不对造成接口访问不到的问题**

## 3. Start up command

    `jmockr -n` or `jmockr --normal` normal start, modifying mock data or page code will not trigger restart
    `jmockr -s` or `jmockr --start` hot start, modifying mock data will trigger server to reload routes and mock data
    `jmockr -l` or `jmockr --live` hot start with live reload, modifying page code such as js /css /html will trigger browser to reload the page

## 4.tips

1. jmockr support json5 file and json5 style in json file, like below:

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


 More about [JSON5](https://github.com/json5/json5)

## License

jMockr is released under the ISC license.
