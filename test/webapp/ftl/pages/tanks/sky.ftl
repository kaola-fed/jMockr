<#include "../../wrap/common.ftl">
<#escape x as x?html>
<!DOCTYPE html>
<html>
<head>
    <@meta/>
    <@title text="天启坦克"/>
    <@css/>
    <link rel="stylesheet" href="/css/common4modal.css">
</head>
<body class="hold-transition skin-blue layout-top-nav">

<div class="wrapper">
    <@topnav menuObj=menu curMenuId=menuId!0 />
    <div class="content-wrapper">
        <div class="container-fluid">
            <section class="content-header">
                <b id="pagename">坦克参数设置</b>
                <span id="request-parameter">${RequestParameters['ybq']!error}</span>
            </section>
            <section>
                <div class="box box-primary">
                    <div id="box"></div>
                </div>
            </section>
        </div>
    </div>
</div>
<script>
    window.sentence1 = '${sentence1!'error'}';
    window.sentence2 = '${sentence2!'error'}';
    window.number1 = ${number1!-1};
    window.number2 = ${number2!-2};
    window.arr = [
        <#list arr![] as item>
        '${item}',
        </#list>
    ];
</script>

<@entryjs src="/javascript/tanks/sky/page.js" />

</body>
</html>
</#escape>
