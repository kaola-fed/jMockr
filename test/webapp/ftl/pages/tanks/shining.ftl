<#include "../../wrap/common.ftl">
<#escape x as x?html>
<!DOCTYPE html>
<html>
<head>
    <@meta/>
    <@title text="坦克管理"/>
    <@css/>
    <link rel="stylesheet" href="/css/common4modal.css">
</head>
<body class="hold-transition skin-blue layout-top-nav">

<div class="wrapper">
    <@topnav menuObj=menu curMenuId=menuId!0 />
    <div class="content-wrapper">
        <div class="container-fluid">
            <section class="content-header">
                <b id="pagename">坦克管理</b>
            </section>
            <section>
                <div class="box box-primary">
                    <div id="box"></div>
                </div>
            </section>
        </div>
    </div>
</div>

<@entryjs  src="/javascript/tanks/shining/list.js" />

</body>
</html>
</#escape>
