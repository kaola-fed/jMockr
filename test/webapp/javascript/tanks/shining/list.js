
define([
    'text!./list.html',
    'pro/javascript/components/ListComponent2',
    'pro/javascript/components/modal',
], function(tpl, ListComponent, Modal) {
    var List = ListComponent.extend({
        template: tpl,
        config: function(data){
            this.$watch('searchType', function(searchType) {
                data.searchContent = '';
            });
            this.supr(data);
        },
        data: {
            total: 0,
            currentPage: 1,
            list: [],
            limit: 20,
            tagStatus: 0,
            opStatus: 0,
            searchType: 0,
            searchContent: '',
            condition: {
                startTime: '',
                endTime: ''
            }
        },
        getListParam: function() {
            var data = this.data;
            return {
                recordPerPage: data.limit,
                currentPage: data.currentPage,
                tagStatus: data.tagStatus,
                opStatus: data.opStatus,
                searchType: data.searchType,
                searchContent: data.searchContent,
                createTimeStart: data.condition.startTime,
                createTimeEnd: data.condition.endTime
            };
        },
        getList: function() {
            var data = this.data;
            this.request({
                url: '/cms/tank/searchTag.do',
                norest: true,
                data: this.getListParam(),
                not200Tips: '请求列表数据失败:',
                successCb: function(resp) {
                    data.list = resp.list || [];
                    data.total = resp.paginationInfo.totalRecord;
                    this.$update();
                }.bind(this)
            });
        },
        publishItems: function() {
            new Modal({
                data: {
                    content: '确定发布吗?'
                }
            }).$on('confirm', function() {
                this.request({
                    url: '/cms/tank/batchPublishTag.do',
                    successTips: '发布成功!',
                    not200Tips: '发布失败:',
                    successCb: this.getList.bind(this)
                });
            }.bind(this));
        },
        removeItem: function(item) {
            new Modal({
                data: {
                    noIcon: true,
                    content: '确定删除这条数据吗',
                    title: '删除'
                }
            }).$on('confirm', function() {
                this.request({
                    url: '/cms/tank/deleteTag.do',
                    data: {
                        id: item.id
                    },
                    norest: true,
                    successTips: '删除成功!',
                    successCb: this.getList.bind(this),
                    not200Tips: '删除失败:'
                });
            }.bind(this));
        }
    });

    List.filter('opStatus', function(val) {
        return [null, '研发中', '已投产'][val] || val;
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
