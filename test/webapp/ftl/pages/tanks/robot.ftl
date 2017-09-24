<#include "../../wrap/common.ftl">
<#escape x as x?html>
<!DOCTYPE html>
<html>
<head>
    <@meta/>
    <@title text="恐怖机器人"/>
    <@css/>
    <link rel="stylesheet" href="/css/common4modal.css">
</head>
<body class="hold-transition skin-blue layout-top-nav">

<div class="wrapper">
    <@topnav menuObj=menu curMenuId=menuId!0 />
    <div class="content-wrapper">
        <div class="container-fluid">
            <section class="content-header">
                <b>战车工厂&gt;恐怖机器人</b>
            </section>
            <section>
                <div class="box box-primary">
                    <div id="box"></div>
                </div>
            </section>
        </div>
    </div>
</div>

<@entryjs src="/javascript/tanks/robot/list.js" />

</body>
</html>
</#escape>
