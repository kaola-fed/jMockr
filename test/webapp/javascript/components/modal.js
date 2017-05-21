
define([
    "./BaseComponent.js",
    'text!./modal.html',
    'text!./modal.css',
    'text!pro/css/animation.css'
], function(BaseComponent, tpl, style, animationStyle) {
    var $ = window.jQuery;
    var styleEle = $('<style></style>');
    styleEle.html(style + animationStyle);
    $(document.head).append(styleEle);
    var Modal = BaseComponent.extend({
        template: tpl,
        init: function(){
            this.data.destroying = false;
            this.supr();
            var destroy = this.destroy.bind(this);
            if (this.$root == this) this.$inject(document.body);
            this.data.bModalId = +new Date();
        },
        confirm: function(){
            this.data.confirmCB && this.data.confirmCB();
            this.$emit("confirm", this.data);
            this.destroy();
        },
        close: function(){
            this.$emit("close", this.data);
            this.destroy();
        },
        destroy: function() {
            var body = this.$refs.body;
            $(body).removeClass('bounceInRight');
            $(body).addClass('fadeOutLeft');
            this.data.destroying = true;
            setTimeout(this.supr.bind(this), 500);
        },
        showTips: function(message) {
            console.info(message);
        }
    });

    return Modal;

});
