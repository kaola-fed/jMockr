define([
    'pro/javascript/components/BaseComponent',
    'text!./page.html',
    './modal/edit.js',
    'pro/javascript/components/modal',
], function(base, tpl, EditModal, Modal) {
    var m = base.extend({
        template: tpl,
        data: {
            params: {
                status: 0,
                distance: 10,
            },
            number1: window.number1,
            number2: window.number2,
            sentence1: window.sentence1,
            sentence2: window.sentence2,
            arr: window.arr
        },
        config: function(data) {
            this.getConfigData();
            this.supr();
        },
        getConfigData: function() {
            this.request({
                url: '/tanks/params.do',
                norest: true,
                not200Tips: '通信失败:',
                successCb: function(res) {
                    Object.assign(this.data.params, res.params);
                }.bind(this)
            });
        },
        edit: function() {
            new EditModal({
                data: {
                    params: Object.assign({}, this.data.params)
                }
            }).$on('confirm', this.getConfigData.bind(this));
        },
        publish: function() {
            new Modal({
                data: {
                    content: '确定发布吗?'
                }
            }).$on('confirm', function() {
                this.request({
                    url: '/tanks/publish.do',
                    norest: true,
                    not200Tips: '发布失败:',
                    successTips: '发布成功',
                    successCb: function(res) {
                        this.data.params.status = 1;
                    }.bind(this)
                });
            }.bind(this));
        },
        showTips: console.info
    });

    m.filter('yesOrNo', function(val) {
        if (val == 1) return '是';
        return '否';
    });

    m.filter('status', function(val) {
        var names = ['未发布', '已发布'];
        return names[val] || val;
    });

    return m;
});
