/**
 * Created by Chen Zhiqiang on 2015/9/28
 * 瀑布流
 *
 * 使用：
 * var f = new WaterFail(el, opt);
 * f.append(obj)
 *      obj: 类型： element元素，element数组，字符串(html)
 * f.reset();   瀑布流重置，清空元素
 * f.reLayout(); 重新排列已有元素 test
 */
 
 
(function(win){
    var checkScrollTimeId,
        waterFailLayoutTimeId,
        oBoxesHeights = [];

    /**
     * @param el  瀑布流容器，html元素，**必填
     * @param opt  配置
     *      perWidth：    每列宽度，**必填
     *      knownHeight： 图片高度是否已知
     *      onScrollEnd： 滚到最底部的回调函数
     *      onComplete:  瀑布流执行结束的回调函数
     * @constructor
     */
    var WaterFail = function (el, opt) {
        this.el = el;
        this.options = opt;
        this.imgLoadingNum = 0;
        this.init();
        return this;
    };
    WaterFail.prototype.appendChild = function (arr) {
        var self = this;

        self.loadingImgs = arr;
        self.imgLoadingNum = arr.length;

        this.removeScroll();
        if (this.options.knownHeight) {
            this.layoutByKnownHeight(arr);
        } else {
            this.layoutByNoHeight(arr);
        }
    };
    WaterFail.prototype.appendHtml = function (html) {
        var ele = document.createElement("div");
        ele.innerHTML = html;

        this.loadingImgs = ele.childNodes;
        this.imgLoadingNum = this.loadingImgs.length;

        this.removeScroll();
        if (this.options.knownHeight) {
            this.layoutByKnownHeight(this.loadingImgs);
        } else {
            this.layoutByNoHeight(this.loadingImgs);
        }
    };
    WaterFail.prototype.append = function (obj) {
        var type = checkParamType(obj);

        switch (type) {
            case "string":
                this.appendHtml(obj);
                break;

            case "element":
                this.appendChild([obj]);
                break;

            case "elements":
                this.appendChild(obj);
                break;

            default :
                break;
        }
    };
    WaterFail.prototype.updateChildLayout = function () {
        var _arr = this.el.childNodes;

        for (var i = 0; i < _arr.length; i++) {
            this.updateElementLayout(_arr[i]);
        }
        this.el.style.height = Math.max.apply(null, oBoxesHeights) + "px";
    };
    WaterFail.prototype.init = function () {
        this.initStyle();
        this.addImageListener();
        this.setupScroll();
        this.initData();
    };
    WaterFail.prototype.initStyle = function () {
        this.el.className = this.el.className + " waterfail-container clearfix";
        this.el.style.position = "relative";
        this.el.style.overflow = "hidden";
    };
    WaterFail.prototype.initData = function () {
        var len = Math.floor(this.el.offsetWidth / this.options.perWidth);

        oBoxesHeights = [];
        for (var i = 0; i < len; i++) {
            oBoxesHeights.push(0);
        }

        this.imgLoadingNum = 0;
        this.loadingImgs = [];
    };
    WaterFail.prototype.addImageListener = function () {
        var self = this;

        window.imgOnLoad = function () {
            self.imgLoadingNum--;
            if (self.imgLoadingNum == 0) {
                clearTimeout(waterFailLayoutTimeId);
                self.loadImgsComplete();
            }
        };
        window.imgOnError = function () {
            self.imgLoadingNum--;
            if (self.imgLoadingNum == 0) {
                clearTimeout(waterFailLayoutTimeId);
                self.loadImgsComplete();
            }
        };
    };
    WaterFail.prototype.setupScroll = function () {
        var self = this;

        window.onscroll = function () {
            clearTimeout(checkScrollTimeId);
            checkScrollTimeId = setTimeout(function () {
                if (checkScrollSide(self.el)) {
                    if (self.options.onScrollEnd) {
                        self.options.onScrollEnd();
                    }
                }
            }, 500);
        };
    };
    WaterFail.prototype.removeScroll = function () {
        window.onscroll = null;
    };
    WaterFail.prototype.layoutByKnownHeight = function () {
        var self = this;

        for (var i = 0; i < this.imgLoadingNum; i++) {
            self.appendElement(this.loadingImgs[0]);
        }
        this.el.style.height = Math.max.apply(null, oBoxesHeights) + "px";
        this.setupScroll();
        this.options.onComplete && this.options.onComplete();
    };
    WaterFail.prototype.layoutByNoHeight = function () {
        var self = this;

        for (var j = 0; j < this.imgLoadingNum; j++) {
            self.el.appendChild(this.loadingImgs[0]);
            var img = arr[j].getElementsByTagName("img")[0];
            img.setAttribute("onload", "imgOnLoad()");
            img.setAttribute("onerror", "imgOnError()");
        }

        clearTimeout(waterFailLayoutTimeId);
        waterFailLayoutTimeId = setTimeout(function () {
            self.loadImgsComplete();
        }, this.imgLoadingNum * 3 * 1000);
    };
    WaterFail.prototype.loadImgsComplete = function () {
        for (var k = 0; k < this.imgLoadingNum; k++) {
            this.appendElement(this.loadingImgs[0]);
        }
        this.el.style.height = Math.max.apply(null, oBoxesHeights) + "px";
        this.setupScroll();
        this.options.onComplete && this.options.onComplete();
    };
    WaterFail.prototype.appendElement = function (ele) {
        var min = getMinByArray(oBoxesHeights);

        ele.style.float = "left";
        ele.style.position = "absolute";
        ele.style.left = this.options.perWidth * (min.index % oBoxesHeights.length) + "px";
        ele.style.top = min.data + "px";
        this.el.appendChild(ele);
        oBoxesHeights[min.index] += ele.offsetHeight;
    };
    WaterFail.prototype.updateElementLayout = function (ele) {
        var min = getMinByArray(oBoxesHeights);

        ele.style.float = "left";
        ele.style.position = "absolute";
        ele.style.left = this.options.perWidth * (min.index % oBoxesHeights.length) + "px";
        ele.style.top = min.data + "px";
        oBoxesHeights[min.index] += ele.offsetHeight;
    };
    WaterFail.prototype.reset = function () {
        this.el.innerHTML = "";
        this.el.style.height = "0px";
        this.initData();
    };
    WaterFail.prototype.reLayout = function () {
        this.initData();
        this.updateChildLayout();
    };


    function checkParamType(obj) {
        if (typeof  obj == "string") {
            return "string";
        } else if (typeof obj == "object") {
            if (obj instanceof Element) {
                return "element";
            } else if (obj instanceof Array) {
                return "elements";
            } else {
                return "object";
            }
        } else {
            return undefined;
        }
    }

    function getMinByArray(arr) {
        var idx = 0,
            temp = arr[0];

        for (var i = 0; i < arr.length; i++) {
            if (temp > arr[i]) {
                temp = arr[i];
                idx = i;
            }
        }

        return {
            index: idx,
            data: temp
        }
    }

    function checkScrollSide(ele) {
        var lastPinH = ele.offsetTop + Math.floor(ele.offsetHeight);
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var documentH = document.documentElement.clientHeight;
        return (lastPinH < scrollTop + documentH + 100) ? true : false;
    }

    if(typeof define === "function" && define.amd){
        define(function (require, exports, module) {
            module.exports = WaterFail;
        });
    }else{
        if(!win.WaterFail){
            win.WaterFail = WaterFail;
        }
    }

})(window);
