

define([
    'text!./list.html',
    'pro/javascript/components/ListComponent2',
    'pro/javascript/components/modal'
], function(tpl, ListComponent, Modal){
    var List = ListComponent.extend({
        template: tpl,
        config: function(data){
            this.supr(data);
            this.getTabRights();
            this.getStatusNumber();
            this.$watch('tab', function(tab, oldValue) {
                this.data.condition.auditStatus = tab;
                if (oldValue === undefined) return;//初始化过程中, 默认会调用一次getList, 所以此处直接返回
                data.currentPage= 1;
                if (data.condition.auditStatus == 0) {
                    data.condition.timeType = 0;
                }
                this.cleanCondition();
                this.getStatusNumber();
                this.getList();
            }.bind(this));
        },
        getTabRights: function() {
            this.request({
                url: '/tank/permissionRight.do',
                not200Tips: '获取权限信息失败:',
                successCb: function(res) {
                    this.data.categories.forEach(function(category) {
                        category.show = res.opCategory.filter(function(opc) {
                            return opc == category.id;
                        }).length;
                    });
                    this.data.showActivityTab = res.opCategory.filter(function(opc) {
                        return opc == 0;
                    }).length;
                    this.data.condition.opCategory = res.opCategory[0];
                    !this.data.condition.opCategory && (this.data.topTips = '对不起, 您没有任何类目的查看权限');
                    this.getList();
                    this.getStatusNumber();
                }.bind(this)
            });
        },
        data: {
            topTips: '权限信息查询中...',
            total: 0,
            tab: 0,
            currentPage: 1,
            list: [],
            categories: [
                {id: 1, name: '核辐射型'},
                {id: 2, name: '爆炸型'},
                {id: 3, name: '电子干扰型'},
                {id: 4, name: '侦察型'},
                {id: 5, name: '运载型'},
                {id: 6, name: '排雷型'}
            ],
            condition: {
                auditStatus: 0,
                recordPerPage: 20,
                timeStart: '',
                timeEnd: '',
                timeType: 0,
                searchType: 1,
                searchContent: '',
                numberType: 'favorNum',
                favorNum: '',
                productNum: '',
                // opCategory: 1
            }
        },
        cleanCondition: function() {
            var condition = this.data.condition;
            [
                'startTime', 'endTime',
                'searchContent',
                'favorNum', 'productNum'
            ].forEach(function(p) {
                condition[p] = '';
            });
            condition.ifOpEditStatus = 2;
        },
        getStatusNumber: function() {
            if (!this.data.condition.opCategory) return;
            this.request({
                url: '/tank/audit/getAuditTankCount.do',
                data: {
                    opCategory: this.data.condition.opCategory
                },
                norest: true,
                not200Tips: '获取统计数据失败：',
                successCb: function(res) {
                    Object.assign(this.data, res.count);
                }.bind(this)
            });
        },
        getListParam: function() {
            var data = this.data;
            var result = Object.assign({}, data.condition);
            result.currentPage = data.currentPage;
            return result;
        },
        getList: function() {
            if (!this.data.condition.opCategory) return;
            var data = this.data;
            this.request({
                url: '/tank/audit/listTank.do',
                data: this.getListParam(),
                norest: true,
                not200Tips: '请求列表数据失败:',
                successCb: function(resp) {
                    data.list = resp.list || [];
                    data.total = resp.paginationInfo.totalRecord;
                    this.$update();
                }.bind(this)
            });
        },
        removeItem: function(item) {
            new Modal({
                data: {
                    content: '确认删除吗?'
                }
            }).$on('confirm', function() {
                this.request({
                    url: '/tank/deleteTank.do',
                    data: {
                        id: item.id,
                        version: item.version
                    },
                    norest: true,
                    successTips: '删除成功',
                    not200Tips: '删除失败:',
                    successCb: function() {
                        this.getList(this);
                        this.getStatusNumber();
                    }.bind(this)
                });
            }.bind(this));
        },
        submit: function(item) {
            new Modal({
                data: {
                    content: '确认提交吗?'
                }
            }).$on('confirm', function() {
                this.request({
                    url: '/tank/audit/auditTank.do',
                    data: {
                        tankId: item.id,
                        auditStatus: 1,
                        version: item.version
                    },
                    norest: true,
                    not200Tips: '提交失败',
                    successTips: '提交成功',
                    successCb: function() {
                        this.getList();
                        this.getStatusNumber();
                    }.bind(this)
                });
            }.bind(this));
        },
        changeOpCategory: function(categoryId) {
            this.data.condition.opCategory = categoryId;
        },
        computed: {
            selectAll: {
                get: function(data){
                    return data.list.every(function(p) {
                        return p.selected;
                    });
                },
                set: function(val, data){
                    data.list.forEach(function(p) {
                        p.selected = val;
                    });
                }
            }
        }
    });
    // {id: 1, name: '核辐射型'},
    // {id: 2, name: '爆炸型'},
    // {id: 3, name: '电子干扰型'},
    // {id: 4, name: '侦察型'},
    // {id: 5, name: '运载型'},
    // {id: 6, name: '排雷型'}
    List.filter('category', function(item) {
        return [
            '', '核辐射型', '爆炸型', '电子干扰型', '侦察型',
            '运载型', '排雷型',
        ][item.opCategory] || item.opCategory;
    });
    List.filter('favorNum', function(item) {
        return (+item.favorNum || 0) + (+item.defaultFavorNum || 0);
    });
    List.filter('auditStatus', function(item) {
        return ['未提交', '未审核', '不通过', '已通过'][item.auditStatus] || item.auditStatus;
    });
    List.filter('opStatus', function(item) {
        return [
            '未发布',
            '已发布'
        ][item.publish];
    });
    List.filter({
        number: {
            get: function(value) {
                return value;
            },
            set: function(value) {
                return value.replace(/\D/g, '');
            }
        }
    });
    return List;

});
