<#escape x as x?html>
<#assign jslib ="/javascript/lib/"/>
<#macro title text>
    <title>${text}-战车工厂</title>
</#macro>

<#macro meta>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, minimal-ui" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="format-detection" content="telephone=no, email=no" />
    <meta name="keywords" content="战车工厂,坦克,装甲运兵车,扫雷车,加农炮,火炮">
    <meta name="description" content="战车工厂,特别厉害!">
    <link rel="shortcut icon" href="/favicon.ico?v=2" />
</#macro>

<#macro css>
    <link rel="stylesheet" type="text/css" href="/css/bootstrap/bootstrap.css"/>
    <link rel="stylesheet" type="text/css" href="/css/Font-Awesome/font-awesome.css"/>
    <link rel="stylesheet" type="text/css" href="/css/AdminLTE/AdminLTE.css"/>
    <link rel="stylesheet" type="text/css" href="/css/ionicons/ionicons.css"/>
    <link rel="stylesheet" type="text/css" href="/css/skin/all-skins.css">
    <style media="screen">
    .navlogout {
        padding: 0 15px 10px 0;
        text-align: right;
        color: #f6f6f6;
        background-color: #3c8dbc;
    }
    .dropdown:hover .dropdown-menu {
        display: block;
    }
    ul li {
        list-style: none;
    }
    .container-fluid {
        min-height: 500px;
    }
    </style>
</#macro>

<#macro entryjs src>
    <script src="/javascript/lib/jquery.js"></script>
    <script src="${jslib}define.js?pro=/"></script>
    <script>
        define([
            '${src}'
        ], function(Module) {
            new Module().$inject('#box');
        });
    </script>
</#macro>

<#macro topnav tab="home" subTab="" internal=false menuObj={"childsList":[],"id":0} curMenuId=-1>
<#local menuList = menuObj.childsList![]/>
<header class="main-header" style="max-height: inherit;">
  <nav class="navbar navbar-static-top">
    <div class="">
      <div class="collapse navbar-collapse pull-left" id="navbar-collapse">
        <ul class="nav navbar-nav">
        <li class="dropdown <#if !activeName?? || activeName == '首页'>active</#if>">
          <a href="/index.do" class="dropdown-toggle" data-toggle="dropdown">首页</a>
        </li>
        <#list menuList as menu>
		      <#local subMenuList = menu.childsList![]/>
		      <#if subMenuList?size gt 0>
      			<li class="dropdown <#if activeName?? && activeName == menu.name>active</#if>">
      				<a href="#" class="dropdown-toggle" data-toggle="dropdown">${menu.name} <span class="caret"></span></a>
      				<ul class="dropdown-menu" role="menu">
      				<#list subMenuList as subMenu>
      					<li><a<#if curMenuId==subMenu.id> class="active"</#if> href="${subMenu.url}"><span>${subMenu.name}</span></a></li>
      				</#list>
      				</ul>
      			</li>
		     </#if>
	      </#list>
        </ul>
      </div>
    </div>
  </nav>
</header>
</#macro>
</#escape>
