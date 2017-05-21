(function(d, p) {
    var __config = {
            root: {}
        },
        __xqueue = [],
        __scache = {},
        __rcache = {},
        __stack = [],
        __platform;

    var _doInit = function() {
        var _list = d.getElementsByTagName('script');
        if (!_list || !_list.length) return;
        var _reg = /\/define(?:\.cmp)?\.js(?=\?|#|$)/;
        for (var i = _list.length - 1, _script; i >= 0; i--) {
            _script = _list[i];
            _script.xxx = !0;
            _reg.test(_script.src) ?
                _doParseConfig(_script.src) :
                _doScriptLoaded(_script, !0);
        }
        if (!__config.global && !p.define) {
            p.define = NEJ.define;
            p.define.nej = !0;
        }
    };
    var _doParseConfig = function(_uri) {
        _uri = _doFormatURI(_uri);
        if (!_uri) return;
        var _arr = _uri.split(/[?#]/),
            _brr = _arr[0].split('/');
        _brr.pop(); // splice define.js
        var _lib = _brr.join('/') + '/';
        if (_lib.indexOf('://') < 0) {
            // absolute lib path
            _lib = _doAbsoluteURI(_lib);
        }
        __config.root.lib = _lib;
        var _obj = _doStr2Obj(_arr[1]);
        __config.charset = _obj.c || 'utf-8';
        __config.global = _obj.g == 'true';
        delete _obj.c;
        delete _obj.g;
        delete _obj.p;
        var _deps = _obj.d;
        delete _obj.d;
        var _root = __config.root;
        for (var x in _obj) {
            _root[x] = _obj[x];
        }
        _root.platform = './platform/';
        if (!_root.pro) {
            _root.pro = '../javascript/';
        }
        if (!!_deps) {
            d.write('<script src="' + _deps + '"></scr' + 'ipt>');
        }
    };

    var _doParsePlugin = (function() {
        var _pmap = {
            text: function(_uri) {
                _doLoadText(_uri);
            }
        };
        return function(_uri) {
            var _brr = [],
                _type = null,
                _arr = _uri.split('!'),
                _fun = _pmap[_arr[0].toLowerCase()];
            if (!!_fun) {
                _type = _arr.shift();
            }
            _brr.push(_arr.join('!'));
            _brr.push(_fun || _doLoadScript);
            _brr.push(_type);
            return _brr;
        };
    })();

    var _doParseCharset = function(_uri) {
        return _uri.indexOf(__config.root.lib) >= 0 ? 'utf-8' : __config.charset;
    };

    var _doMergePlatform = (function() {
        return function(_deps) {
            return {};
        };
    })();

    var _isTypeOf = function(_data, _type) {
        return Object.prototype.toString.call(_data) === '[object ' + _type + ']';
    };

    var _getElement = function(_event) {
        return !_event ? null : (_event.target || _event.srcElement);
    };

    var _doStr2Obj = function(_query) {
        var _result = {},
            _list = (_query || '').split('&');
        if (!!_list && !!_list.length)
            for (var i = 0, l = _list.length, _brr, _key; i < l; i++) {
                _brr = _list[i].split('=');
                _key = _brr.shift();
                if (!_key) continue;
                _result[decodeURIComponent(_key)] =
                    decodeURIComponent(_brr.join('='));
            }
        return _result;
    };

    var _doAbsoluteURI = (function() {
        var _xxx = !1,
            _anchor = d.createElement('a');
        var _append = function() {
            if (_xxx) return;
            _xxx = !0;
            _anchor.style.display = 'none';
            (d.body || d.getElementsByTagName('head')[0]).appendChild(_anchor);
        };
        return function(_uri) {
            _append();
            _anchor.href = _uri;
            _uri = _anchor.href;
            return _uri.indexOf('://') > 0 && _uri.indexOf('./') < 0 ?
                _uri : _anchor.getAttribute('href', 4); // ie6/7
        };
    })();

    var _doFormatURI = (function() {
        var _reg = /{(.*?)}/gi,
            _reg1 = /([^:])\/+/g,
            _reg3 = /[^\/]*$/,
            _reg4 = /\.js$/i,
            _reg5 = /^[{\/\.]/,
            _reg6 = /(file:\/\/)([^\/])/i,
            _reg7 = /([^:])\/\//g;
        var _absolute = function(_uri) {
            return _uri.indexOf('://') > 0;
        };
        var _slash = function(_uri) {
            return _uri.replace(_reg1, '$1/');
        };

        var _root = function(_uri) {
            return _uri.replace(_reg3, '');
        };
        var _format = function(_uri) {
            return _doAbsoluteURI(
                _uri.replace(_reg7, '$1/') // fix ie8 http://a.b.com:80/a//b//c/d.js error
                .replace(_reg6, '$1/$2') // fix mac file:// error
            );
        };
        var _amdpath = function(_uri, _type) {
            if (_reg4.test(_uri) ||
                _reg5.test(_uri) ||
                _absolute(_uri)) {
                return _uri;
            }
            var _arr = _uri.split('/'),
                _path = __config.root[_arr[0]],
                _sufx = !_type ? '.js' : '';
            if (!!_path) {
                _arr.shift();
                return _path + _arr.join('/') + _sufx;
            }
            return '{lib}' + _arr.join('/') + _sufx;
        };
        return function(_uri, _base, _type) {
            if (_isTypeOf(_uri, 'Array')) {
                var _list = [];
                for (var i = 0; i < _uri.length; i++) {
                    _list.push(
                        _doFormatURI(_uri[i], _base, _type)
                    );
                }
                return _list;
            }
            if (!_uri) return '';
            if (_absolute(_uri)) {
                return _format(_uri);
            }
            if (_base && _uri.indexOf('.') == 0) {
                _uri = _root(_base) + _uri;
            }
            _uri = _slash(_amdpath(_uri, _type));
            var _uri = _uri.replace(
                _reg,
                function($1, $2) {
                    return __config.root[$2] || $2;
                }
            );
            return _format(_uri);
        };
    })();

    var _doFormatARG = function(_str, _arr, _fun) {
        var _args = [null, null, null],
            _kfun = [
                function(_arg) {
                    return _isTypeOf(_arg, 'String');
                },
                function(_arg) {
                    return _isTypeOf(_arg, 'Array');
                },
                function(_arg) {
                    return _isTypeOf(_arg, 'Function');
                }
            ];
        for (var i = 0, l = arguments.length, _it; i < l; i++) {
            _it = arguments[i];
            for (var j = 0, k = _kfun.length; j < k; j++) {
                if (_kfun[j](_it)) {
                    _args[j] = _it;
                    break;
                }
            }
        }
        return _args;
    };
    var _doAddListener = (function() {
        var _statechange = function(_event) {
            var _element = _getElement(_event) || this;
            if (!_element) return;
            var _state = _element.readyState;
            if (_state === 'loaded' ||
                _state === 'complete')
                _doScriptLoaded(_element, !0);
        };
        return function(_script) {
            if (!_script.onload) {
                _script.onload = function(e) {
                    _doScriptLoaded(_getElement(e), !0);
                };
                _script.onerror = function(e) {
                    _doScriptLoaded(_getElement(e), !1);
                };
                _script.onreadystatechange = _statechange;
            } else {
                _script.xxx = !0;
            }
        };
    })();

    var _doAddAllListener = (function() {
        var _reg = /(?:NEJ\.)?define\s*\(/;
        var _isNEJInline = function(_script) {
            var _code = _script.innerHTML;
            return _code.search(_reg) >= 0;
        };
        return function() {
            var _list = d.getElementsByTagName('script');
            for (var i = _list.length - 1, _script; i >= 0; i--) {
                _script = _list[i];
                if (!_script.xxx) {
                    _script.xxx = !0;
                    if (!_script.src && _isNEJInline(_script)) {
                        _doClearStack();
                    } else {
                        _doAddListener(_list[i]);
                    }
                }
            }
        };
    })();

    var _doClearScript = function(_script) {
        if (!_script || !_script.parentNode) return;
        _script.onload = null;
        _script.onerror = null;
        _script.onreadystatechange = null;
        _script.parentNode.removeChild(_script);
    };

    var _isListLoaded = function(_list) {
        if (!!_list && !!_list.length) {
            for (var i = _list.length - 1; i >= 0; i--) {
                if (__scache[_list[i]] !== 2) {
                    return !1;
                }
            }
        }
        return !0;
    };

    var _isMapLoaded = function(_map) {
        if (!!_map) {
            for (var x in _map) {
                if (__scache[_map[x]] !== 2) {
                    return !1;
                }
            }
        }
        return !0;
    };
    var _doLoadText = (function() {
        return function(_uri, _callback) {
            if (!_uri) return;
            var _state = __scache[_uri];
            if (_state != null) return;
            // load text
            __scache[_uri] = 0;
            var _xhr = new p.XMLHttpRequest();
            _xhr.onreadystatechange = function() {
                if (_xhr.readyState == 4) {
                    var _text = _xhr.responseText || '';
                    __scache[_uri] = 2;
                    __rcache[_uri] = _text;
                    if (!!_callback) {
                        _callback(_text);
                    }
                    _doCheckLoading();
                }
            };
            _xhr.open('GET', _uri, !0);
            _xhr.send(null);
        };
    })();
    var _doLoadScript = function(_uri) {
        if (!_uri) return;
        var _state = __scache[_uri];
        if (_state != null) return;
        __scache[_uri] = 0;
        var _script = d.createElement('script');
        _script.xxx = !0;
        _script.type = 'text/javascript';
        _script.charset = _doParseCharset(_uri);
        _doAddListener(_script);
        _script.src = _uri;
        (d.getElementsByTagName('head')[0] || d.body).appendChild(_script);
    };

    var _doScriptLoaded = function(_script, _isok) {
        var _uri = _doFormatURI(_script.src);
        if (!_uri) return;
        var _arr = __stack.pop();
        if (!!_arr) {
            _arr.unshift(_uri);
            _doDefine.apply(p, _arr);
        }
        if (!!_uri && __scache[_uri] != 1) {
            __scache[_uri] = 2;
        }
        _doClearScript(_script);
        _doCheckLoading();
    };

    var _doExecFunction = (function() {
        var _f = function() {
            return !1;
        };
        var _doMergeDI = function(_dep, _map) {
            var _arr = [];
            if (!!_dep) {
                // merge dependency list result
                for (var i = 0, l = _dep.length, _it; i < l; i++) {
                    _it = _dep[i];
                    // except for 404 platform
                    if (!__rcache[_it] && !_map[_it]) {
                        __rcache[_it] = {};
                    }
                    _arr.push(__rcache[_it] || __rcache[_map[_it]] || {});
                }
            }
            _arr.push({}, {}, _f, []); // p,o,f,r
            return _arr;
        };
        var _doMergeResult = function(_uri, _result) {
            // return;
            var _ret = __rcache[_uri],
                _iso = {}.toString.call(_result) == '[object Object]';
            if (!!_result) {
                if (!_ret || !_iso) {
                    // for other type of return
                    _ret = _result;
                } else {
                    // for namespace return
                    _ret = _ret || {};
                    for (var x in _result) {
                        _ret[x] = _result[x];
                    }
                }
            }
            __rcache[_uri] = _ret;
        };
        return function(_item) {
            var _args = _doMergeDI(
                _item.d, _item.p
            );
            if (!!_item.f) {
                var _result = _item.f.apply(p, _args) ||
                    _args[_args.length - 4];
                _doMergeResult(_item.n, _result);
            }
            __scache[_item.n] = 2;
            console.log('do ' + _item.n);
        };
    })();

    var _doCheckLoading = function() {
        if (!__xqueue.length) return;
        for (var i = __xqueue.length - 1, _item; i >= 0;) {
            _item = __xqueue[i];
            if (__scache[_item.n] !== 2 &&
                (!_isMapLoaded(_item.p) ||
                    !_isListLoaded(_item.h) ||
                    !_isListLoaded(_item.d))) {
                i--;
                continue;
            }
            // for loaded
            __xqueue.splice(i, 1);
            if (__scache[_item.n] !== 2) {
                _doExecFunction(_item);
            }
            i = __xqueue.length - 1;
        }

    };

    var _doClearStack = function() {
        var _args = __stack.pop();
        while (!!_args) {
            _doDefine.apply(p, _args);
            _args = __stack.pop();
        }
    };

    var _doFindScriptRunning = function() {
        // for ie8+
        var _list = d.getElementsByTagName('script');
        for (var i = _list.length - 1, _script; i >= 0; i--) {
            _script = _list[i];
            if (_script.readyState == 'interactive') {
                return _script;
            }
        }
    };

    var _doDefine = (function() {
        var _seed = +new Date,
            _keys = ['d', 'h'];
        var _doComplete = function(_list, _base) {
            if (!_list || !_list.length) return;
            for (var i = 0, l = _list.length, _it; i < l; i++) {
                _it = _list[i] || '';
                if (_it.indexOf('.') != 0) continue;
                _list[i] = _doFormatURI(_it, _base);
            }
        };
        return function(_uri, _deps, _callback) {
            // check input
            var _args = _doFormatARG.apply(
                p, arguments
            );
            _uri = _args[0] ||
                _doFormatURI('./' + (_seed++) + '.js');
            _deps = _args[1];
            _callback = _args[2];
            // check module defined in file
            _uri = _doFormatURI(_uri);
            if (__scache[_uri] === 2) {
                return; // duplication
            }
            // for {platform}
            var _plts = function() {
                return {};
            };
            var _pths;
            _doComplete(_deps, _uri);
            __scache[_uri] = 1;
            var _xmap = {
                n: _uri,
                d: _deps,
                h: _pths,
                f: _callback
            };
            __xqueue.push(_xmap);
            for (var i = 0, l = _keys.length, _it, _list; i < l; i++) {
                _it = _keys[i];
                _list = _xmap[_it];
                if (!!_list && !!_list.length) {
                    var _kmap = {};
                    for (var k = 0, j = _list.length, _itt, _itm, _arr, _type; k < j; k++) {
                        _itt = _list[k];
                        if (!_itt) {
                            console.warn('empty dep uri for ' + _uri);
                        }
                        _arr = _doParsePlugin(_itt);
                        _itm = _doFormatURI(_arr[0], _uri, _arr[2]);
                        _kmap[_itt] = _itm;
                        _list[k] = _itm;
                        _arr[1](_itm);
                    }
                }
            }
            if (!!_plts) {
                var _pmap = {};
                for (var x in _plts) {
                    _it = _doFormatURI(_plts[x], _uri);
                    _pmap[_doFormatURI(x, _uri)] = _it;
                    _doLoadScript(_it);
                }
                _xmap.p = _pmap;
            }
            // check state
            _doCheckLoading();
        };
    })();

    p.NEJ = {};
    // only for test
    p.NEJ.dump = function() {
        return {
            state: __scache,
            result: __rcache,
            queue: __xqueue
        };
    };

    NEJ.define = function(_uri, _deps, _callback) {
        if (_isTypeOf(_uri, 'String'))
            return _doDefine.apply(p, arguments);
        var _args = [].slice.call(arguments, 0),
            _script = _doFindScriptRunning();
        if (!!_script) {
            var _src = _script.src;
            if (!!_src)
                _args.unshift(_doFormatURI(_src));
            return _doDefine.apply(p, _args);
        }
        __stack.push(_args);
        _doAddAllListener();
    };
    _doInit();
})(document, window);
