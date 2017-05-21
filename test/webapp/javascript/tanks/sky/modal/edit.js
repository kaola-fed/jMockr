define([
    'pro/javascript/components/modal',
    'text!./edit.html',
], function(base, tpl) {
    return base.extend({
        content: tpl,
        data: {
            width: 600,
            top: 100,
            title: '坦克参数设置',
            ruleMsg: {
                constantEntryUrl: '请填写参数'
            },
            rules: {
            }
        },
        confirm: function() {
            this.request({
                url: '/config/setTankConfig.do',
                method: 'post',
                data: {
                    distance: this.data.params.distance
                },
                norest: true,
                failTips: '保存保存参数失败:',
                successTips: '保存成功',
                successCb: this.supr.bind(this)
            });
        }
    });
});
