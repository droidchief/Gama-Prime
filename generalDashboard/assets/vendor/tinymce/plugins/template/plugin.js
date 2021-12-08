/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 *
 * Version: 5.10.2 (2021-11-17)
 */
(function() {
    'use strict';

    var global$4 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var typeOf = function(x) {
        var t = typeof x;
        if (x === null) {
            return 'null';
        } else if (t === 'object' && (Array.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'Array')) {
            return 'array';
        } else if (t === 'object' && (String.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'String')) {
            return 'string';
        } else {
            return t;
        }
    };
    var isType = function(type) {
        return function(value) {
            return typeOf(value) === type;
        };
    };
    var isSimpleType = function(type) {
        return function(value) {
            return typeof value === type;
        };
    };
    var isString = isType('string');
    var isFunction = isSimpleType('function');

    var noop = function() {};
    var constant = function(value) {
        return function() {
            return value;
        };
    };
    var identity = function(x) {
        return x;
    };

    function curry(fn) {
        var initialArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            initialArgs[_i - 1] = arguments[_i];
        }
        return function() {
            var restArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                restArgs[_i] = arguments[_i];
            }
            var all = initialArgs.concat(restArgs);
            return fn.apply(null, all);
        };
    }
    var never = constant(false);
    var always = constant(true);

    var global$3 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var global$2 = tinymce.util.Tools.resolve('tinymce.util.XHR');

    var getCreationDateClasses = function(editor) {
        return editor.getParam('_cdate_classes', 'cdate');
    };
    var getModificationDateClasses = function(editor) {
        return editor.getParam('_mdate_classes', 'mdate');
    };
    var getSelectedContentClasses = function(editor) {
        return editor.getParam('_selected_content_classes', 'selcontent');
    };
    var getPreviewReplaceValues = function(editor) {
        return editor.getParam('_preview_replace_values');
    };
    var getContentStyle = function(editor) {
        return editor.getParam('content_style', '', 'string');
    };
    var shouldUseContentCssCors = function(editor) {
        return editor.getParam('content_css_cors', false, 'boolean');
    };
    var getReplaceValues = function(editor) {
        return editor.getParam('_replace_values');
    };
    var gets = function(editor) {
        return editor.getParam('s');
    };
    var getCdateFormat = function(editor) {
        return editor.getParam('_cdate_format', editor.translate('%Y-%m-%d'));
    };
    var getMdateFormat = function(editor) {
        return editor.getParam('_mdate_format', editor.translate('%Y-%m-%d'));
    };
    var getBodyClassFromHash = function(editor) {
        var bodyClass = editor.getParam('body_class', '', 'hash');
        return bodyClass[editor.id] || '';
    };
    var getBodyClass = function(editor) {
        var bodyClass = editor.getParam('body_class', '', 'string');
        if (bodyClass.indexOf('=') === -1) {
            return bodyClass;
        } else {
            return getBodyClassFromHash(editor);
        }
    };

    var addZeros = function(value, len) {
        value = '' + value;
        if (value.length < len) {
            for (var i = 0; i < len - value.length; i++) {
                value = '0' + value;
            }
        }
        return value;
    };
    var getDateTime = function(editor, fmt, date) {
        if (date === void 0) {
            date = new Date();
        }
        var daysShort = 'Sun Mon Tue Wed Thu Fri Sat Sun'.split(' ');
        var daysLong = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(' ');
        var monthsShort = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
        var monthsLong = 'January February March April May June July August September October November December'.split(' ');
        fmt = fmt.replace('%D', '%m/%d/%Y');
        fmt = fmt.replace('%r', '%I:%M:%S %p');
        fmt = fmt.replace('%Y', '' + date.getFullYear());
        fmt = fmt.replace('%y', '' + date.getYear());
        fmt = fmt.replace('%m', addZeros(date.getMonth() + 1, 2));
        fmt = fmt.replace('%d', addZeros(date.getDate(), 2));
        fmt = fmt.replace('%H', '' + addZeros(date.getHours(), 2));
        fmt = fmt.replace('%M', '' + addZeros(date.getMinutes(), 2));
        fmt = fmt.replace('%S', '' + addZeros(date.getSeconds(), 2));
        fmt = fmt.replace('%I', '' + ((date.getHours() + 11) % 12 + 1));
        fmt = fmt.replace('%p', '' + (date.getHours() < 12 ? 'AM' : 'PM'));
        fmt = fmt.replace('%B', '' + editor.translate(monthsLong[date.getMonth()]));
        fmt = fmt.replace('%b', '' + editor.translate(monthsShort[date.getMonth()]));
        fmt = fmt.replace('%A', '' + editor.translate(daysLong[date.getDay()]));
        fmt = fmt.replace('%a', '' + editor.translate(daysShort[date.getDay()]));
        fmt = fmt.replace('%%', '%');
        return fmt;
    };

    var createList = function(editor, callback) {
        return function() {
            var List = gets(editor);
            if (isFunction(List)) {
                List(callback);
            } else if (isString(List)) {
                global$2.send({
                    url: List,
                    success: function(text) {
                        callback(JSON.parse(text));
                    }
                });
            } else {
                callback(List);
            }
        };
    };
    var replaceValues = function(html, Values) {
        global$3.each(Values, function(v, k) {
            if (isFunction(v)) {
                v = v(k);
            }
            html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
        });
        return html;
    };
    var replaceVals = function(editor, scope) {
        var dom = editor.dom,
            vl = getReplaceValues(editor);
        global$3.each(dom.select('*', scope), function(e) {
            global$3.each(vl, function(v, k) {
                if (dom.hasClass(e, k)) {
                    if (isFunction(v)) {
                        v(e);
                    }
                }
            });
        });
    };
    var hasClass = function(n, c) {
        return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
    };
    var insert = function(editor, _ui, html) {
        var dom = editor.dom;
        var sel = editor.selection.getContent();
        html = replaceValues(html, getReplaceValues(editor));
        var el = dom.create('div', null, html);
        var n = dom.select('.mceTmpl', el);
        if (n && n.length > 0) {
            el = dom.create('div', null);
            el.appendChild(n[0].cloneNode(true));
        }
        global$3.each(dom.select('*', el), function(n) {
            if (hasClass(n, getCreationDateClasses(editor).replace(/\s+/g, '|'))) {
                n.innerHTML = getDateTime(editor, getCdateFormat(editor));
            }
            if (hasClass(n, getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
                n.innerHTML = getDateTime(editor, getMdateFormat(editor));
            }
            if (hasClass(n, getSelectedContentClasses(editor).replace(/\s+/g, '|'))) {
                n.innerHTML = sel;
            }
        });
        replaceVals(editor, el);
        editor.execCommand('mceInsertContent', false, el.innerHTML);
        editor.addVisual();
    };

    var none = function() {
        return NONE;
    };
    var NONE = function() {
        var call = function(thunk) {
            return thunk();
        };
        var id = identity;
        var me = {
            fold: function(n, _s) {
                return n();
            },
            isSome: never,
            isNone: always,
            getOr: id,
            getOrThunk: call,
            getOrDie: function(msg) {
                throw new Error(msg || 'error: getOrDie called on none.');
            },
            getOrNull: constant(null),
            getOrUndefined: constant(undefined),
            or: id,
            orThunk: call,
            map: none,
            each: noop,
            bind: none,
            exists: never,
            forall: always,
            filter: function() {
                return none();
            },
            toArray: function() {
                return [];
            },
            toString: constant('none()')
        };
        return me;
    }();
    var some = function(a) {
        var constant_a = constant(a);
        var self = function() {
            return me;
        };
        var bind = function(f) {
            return f(a);
        };
        var me = {
            fold: function(n, s) {
                return s(a);
            },
            isSome: always,
            isNone: never,
            getOr: constant_a,
            getOrThunk: constant_a,
            getOrDie: constant_a,
            getOrNull: constant_a,
            getOrUndefined: constant_a,
            or: self,
            orThunk: self,
            map: function(f) {
                return some(f(a));
            },
            each: function(f) {
                f(a);
            },
            bind: bind,
            exists: bind,
            forall: bind,
            filter: function(f) {
                return f(a) ? me : NONE;
            },
            toArray: function() {
                return [a];
            },
            toString: function() {
                return 'some(' + a + ')';
            }
        };
        return me;
    };
    var from = function(value) {
        return value === null || value === undefined ? NONE : some(value);
    };
    var Optional = {
        some: some,
        none: none,
        from: from
    };

    var map = function(xs, f) {
        var len = xs.length;
        var r = new Array(len);
        for (var i = 0; i < len; i++) {
            var x = xs[i];
            r[i] = f(x, i);
        }
        return r;
    };
    var findUntil = function(xs, pred, until) {
        for (var i = 0, len = xs.length; i < len; i++) {
            var x = xs[i];
            if (pred(x, i)) {
                return Optional.some(x);
            } else if (until(x, i)) {
                break;
            }
        }
        return Optional.none();
    };
    var find = function(xs, pred) {
        return findUntil(xs, pred, never);
    };

    var global$1 = tinymce.util.Tools.resolve('tinymce.Env');

    var global = tinymce.util.Tools.resolve('tinymce.util.Promise');

    var hasOwnProperty = Object.hasOwnProperty;
    var get = function(obj, key) {
        return has(obj, key) ? Optional.from(obj[key]) : Optional.none();
    };
    var has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    var entitiesAttr = {
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '\'': '&#039;'
    };
    var htmlEscape = function(html) {
        return html.replace(/["'<>&]/g, function(match) {
            return get(entitiesAttr, match).getOr(match);
        });
    };

    var getPreviewContent = function(editor, html) {
        if (html.indexOf('<html>') === -1) {
            var contentCssEntries_1 = '';
            var contentStyle = getContentStyle(editor);
            var cors_1 = shouldUseContentCssCors(editor) ? ' crossorigin="anonymous"' : '';
            global$3.each(editor.contentCSS, function(url) {
                contentCssEntries_1 += '<link type="text/css" rel="stylesheet" href="' + editor.documentBaseURI.toAbsolute(url) + '"' + cors_1 + '>';
            });
            if (contentStyle) {
                contentCssEntries_1 += '<style type="text/css">' + contentStyle + '</style>';
            }
            var bodyClass = getBodyClass(editor);
            var encode = editor.dom.encode;
            var isMetaKeyPressed = global$1.mac ? 'e.metaKey' : 'e.ctrlKey && !e.altKey';
            var preventClicksOnLinksScript = '<script>' + 'document.addEventListener && document.addEventListener("click", function(e) {' + 'for (var elm = e.target; elm; elm = elm.parentNode) {' + 'if (elm.nodeName === "A" && !(' + isMetaKeyPressed + ')) {' + 'e.preventDefault();' + '}' + '}' + '}, false);' + '</script> ';
            var directionality = editor.getBody().dir;
            var dirAttr = directionality ? ' dir="' + encode(directionality) + '"' : '';
            html = '<!DOCTYPE html>' + '<html>' + '<head>' + '<base href="' + encode(editor.documentBaseURI.getURI()) + '">' + contentCssEntries_1 + preventClicksOnLinksScript + '</head>' + '<body class="' + encode(bodyClass) + '"' + dirAttr + '>' + html + '</body>' + '</html>';
        }
        return replaceValues(html, getPreviewReplaceValues(editor));
    };
    var open = function(editor, List) {
        var creates = function() {
            if (!List || List.length === 0) {
                var message = editor.translate('No s defined.');
                editor.notificationManager.open({
                    text: message,
                    type: 'info'
                });
                return Optional.none();
            }
            return Optional.from(global$3.map(List, function(, index) {
                var isUrl = function(t) {
                    return t.url !== undefined;
                };
                return {
                    selected: index === 0,
                    text: .title,
                    value: {
                        url: isUrl() ? Optional.from(.url) : Optional.none(),
                        content: !isUrl() ? Optional.from(.content) : Optional.none(),
                        description: .description
                    }
                };
            }));
        };
        var createSelectBoxItems = function(s) {
            return map(s, function(t) {
                return {
                    text: t.text,
                    value: t.text
                };
            });
        };
        var find = function(s, Title) {
            return find(s, function(t) {
                return t.text === Title;
            });
        };
        var loadFailedAlert = function(api) {
            editor.windowManager.alert('Could not load the specified .', function() {
                return api.focus('');
            });
        };
        var getContent = function(t) {
            return new global(function(resolve, reject) {
                t.value.url.fold(function() {
                    return resolve(t.value.content.getOr(''));
                }, function(url) {
                    return global$2.send({
                        url: url,
                        success: function(html) {
                            resolve(html);
                        },
                        error: function(e) {
                            reject(e);
                        }
                    });
                });
            });
        };
        var onChange = function(s, updateDialog) {
            return function(api, change) {
                if (change.name === '') {
                    var newTitle = api.getData().;
                    find(s, newTitle).each(function(t) {
                        api.block('Loading...');
                        getContent(t).then(function(previewHtml) {
                            updateDialog(api, t, previewHtml);
                        }).catch(function() {
                            updateDialog(api, t, '');
                            api.disable('save');
                            loadFailedAlert(api);
                        });
                    });
                }
            };
        };
        var onSubmit = function(s) {
            return function(api) {
                var data = api.getData();
                find(s, data.).each(function(t) {
                    getContent(t).then(function(previewHtml) {
                        editor.execCommand('mceInsert', false, previewHtml);
                        api.close();
                    }).catch(function() {
                        api.disable('save');
                        loadFailedAlert(api);
                    });
                });
            };
        };
        var openDialog = function(s) {
            var selectBoxItems = createSelectBoxItems(s);
            var buildDialogSpec = function(bodyItems, initialData) {
                return {
                    title: 'Insert ',
                    size: 'large',
                    body: {
                        type: 'panel',
                        items: bodyItems
                    },
                    initialData: initialData,
                    buttons: [{
                            type: 'cancel',
                            name: 'cancel',
                            text: 'Cancel'
                        },
                        {
                            type: 'submit',
                            name: 'save',
                            text: 'Save',
                            primary: true
                        }
                    ],
                    onSubmit: onSubmit(s),
                    onChange: onChange(s, updateDialog)
                };
            };
            var updateDialog = function(dialogApi, , previewHtml) {
                var content = getPreviewContent(editor, previewHtml);
                var bodyItems = [{
                        type: 'selectbox',
                        name: '',
                        label: 's',
                        items: selectBoxItems
                    },
                    {
                        type: 'htmlpanel',
                        html: '<p aria-live="polite">' + htmlEscape(.value.description) + '</p>'
                    },
                    {
                        label: 'Preview',
                        type: 'iframe',
                        name: 'preview',
                        sandboxed: false
                    }
                ];
                var initialData = {: .text,
                    preview: content
                };
                dialogApi.unblock();
                dialogApi.redial(buildDialogSpec(bodyItems, initialData));
                dialogApi.focus('');
            };
            var dialogApi = editor.windowManager.open(buildDialogSpec([], {: '',
                preview: ''
            }));
            dialogApi.block('Loading...');
            getContent(s[0]).then(function(previewHtml) {
                updateDialog(dialogApi, s[0], previewHtml);
            }).catch(function() {
                updateDialog(dialogApi, s[0], '');
                dialogApi.disable('save');
                loadFailedAlert(dialogApi);
            });
        };
        var opts = creates();
        opts.each(openDialog);
    };

    var showDialog = function(editor) {
        return function(s) {
            open(editor, s);
        };
    };
    var register$1 = function(editor) {
        editor.addCommand('mceInsert', curry(insert, editor));
        editor.addCommand('mce', createList(editor, showDialog(editor)));
    };

    var setup = function(editor) {
        editor.on('PreProcess', function(o) {
            var dom = editor.dom,
                dateFormat = getMdateFormat(editor);
            global$3.each(dom.select('div', o.node), function(e) {
                if (dom.hasClass(e, 'mceTmpl')) {
                    global$3.each(dom.select('*', e), function(e) {
                        if (dom.hasClass(e, getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
                            e.innerHTML = getDateTime(editor, dateFormat);
                        }
                    });
                    replaceVals(editor, e);
                }
            });
        });
    };

    var register = function(editor) {
        var onAction = function() {
            return editor.execCommand('mce');
        };
        editor.ui.registry.addButton('', {
            icon: '',
            tooltip: 'Insert ',
            onAction: onAction
        });
        editor.ui.registry.addMenuItem('', {
            icon: '',
            text: 'Insert ...',
            onAction: onAction
        });
    };

    function Plugin() {
        global$4.add('', function(editor) {
            register(editor);
            register$1(editor);
            setup(editor);
        });
    }

    Plugin();

}());