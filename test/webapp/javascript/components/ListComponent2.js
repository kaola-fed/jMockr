define([
    './BaseComponent.js'
],
    function(BaseComponent) {
        var ListComponent = BaseComponent.extend({
            watchedAttr: ['currentPage'],
            config: function(data) {
                Object.assign(data, {
                    total: 1,
                    currentPage: 1,
                    limit: 10,
                    list: [],
                    condition: {}
                });

                this.$watch(this.watchedAttr, function() {
                    if (this.shouldUpdateList()) {
                        this.getList();
                    }
                });
            },
            shouldUpdateList: function(data) {
                return true;
            },

            getExtraParam: function() {
                return this.data.condition;
            },
            refresh: function(_data) {
                this.data.currentPage = 1;
                this.data.condition = _data || this.data.condition;
                this.$emit('updatelist');
            },

            getListParam: function() {
                var data = this.data;
                return Object.assign({
                    recordPerPage: data.limit,
                    currentPage: data.currentPage
                }, this.getExtraParam(data));
            },
            checkDataBeforeGetList: function() {
                return true;
            },
            onnav: function(page) {
                this.data.currentPage = page;
            },
            showTips: function(message) {
                console.info(message);
            }
        });

        return ListComponent;

    });
