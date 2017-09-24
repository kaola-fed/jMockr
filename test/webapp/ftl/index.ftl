<#include "./wrap/common.ftl">
<#escape x as x?html>
<!DOCTYPE html>
<html>
<head>
    <@title text="战车工厂首页"/>
    <@css/>
    <style media="screen">


    .m-topMenu {
        background: white;
        margin-bottom:40px;
        padding-bottom:40px;
    }

    .m-topMenu .menuCnt {
        margin-top: 22px;
        padding: 0 10px 10px;
    }

    .m-topMenu .menuCnt .subMenuCnt{
        position:relative;
        min-height: 32px;
    }

    .m-topMenu .menuCnt .menuName {
        font-weight: bold;
        font-family: 'microsoft yahei', 'Helvetica', simhei, simsun, sans-serif;
        padding-bottom: 9px;
        margin: 40px 0 10px;
        border-bottom: 1px solid #eeeeee;
    }
    .m-topMenu .subMenu{  position:relative;height: 32px;}
    .m-topMenu .subMenu a {
        display: block;
        color: #222222;
        line-height: 32px;
        height: 32px;
        padding:0 10px;
        border-radius: 4px;
        transition: all 0.05s;
        overflow: hidden;
    }

    .m-topMenu .subMenu:hover a{
        position: absolute;
        min-width: 100%;
        background-color: #3c8dbc;
        color: #ffffff;
        text-decoration: none;
        font-size: 20px;
        z-index: 2;
        white-space: nowrap;
    }

    </style>
</head>
    <#assign activityShow=activityShow!{} />
<body class="hold-transition skin-blue layout-top-nav">
<div class="wrapper">
    <@topnav menuObj=menu curMenuId=menuId!0 />
    <div class="content-wrapper">
        <div class="container-fluid">
            <div class="m-topMenu container">
                <#list menu.childsList as m>
                    <#assign _subMenu = m.childsList![]/>
                    <#if _subMenu?size gt 0>
                        <div class="menuCnt">
                            <h4 class="menuName">${m.name}（${_subMenu?size}）</h4>
                            <div class="row subMenuCnt">
                                <#list _subMenu as s>
                                    <span class="subMenu col-md-2 col-sm-3">
                                        <a href="${s.url}">${s.name}</a>
                                    </span>
                                </#list>
                            </div>
                        </div>
                    </#if>
                </#list>
            </div>
        </div>
    </div>
</div>
</body>
</html>
</#escape>
