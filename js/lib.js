function GlRenderer(e, t, i, s, h) {
    if (this.canvas = e, this.maxVertexCnt = t, this.isImg = i, i) var r = h;
    else this.video = s, this.videoWidth = h.videoWidth, this.videoHeight = h.videoHeight, this.videoElement = h;
    this.init(), this.updateImage(s, r), this.hasWireframe = !1
}
GlRenderer.prototype.init = function() {
    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: !0
    }), this.renderer.setClearColor(0), this.scene = new THREE.Scene, this.finalScene = new THREE.Scene, this.camera = new THREE.OrthographicCamera(-this.canvas.width / 2, this.canvas.width / 2, this.canvas.height / 2, -this.canvas.height / 2, 0, 10), this.camera.position.set(0, 0, 5), this.scene.add(this.camera), this.finalScene.add(this.camera);
    var e = new THREE.RenderPass(this.scene, this.camera),
        t = new THREE.ShaderPass(THREE.EdgeShader),
        i = new THREE.ShaderPass(THREE.CopyShader);
    if (i.renderToScreen = !0, this.composer = new THREE.EffectComposer(this.renderer), this.composer.addPass(e), this.composer.addPass(t), this.composer.addPass(i), this.wireframeMaterial = new THREE.MeshBasicMaterial({
            wireframe: !0,
            color: 16776960
        }), this.wireframeMesh = null, this.faceMaterial = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            color: 16777215
        }), this.faceMesh = null, !this.isImg) {
        this.videoImage = document.createElement("canvas"), this.videoImage.width = this.canvas.width, this.videoImage.height = this.canvas.height;
        var s = document.createElement("canvas");
        s.width = this.videoWidth, s.height = this.videoHeight, this.videoSrcCtx = s.getContext("2d"), this.videoImageContext = this.videoImage.getContext("2d"), this.videoImageContext.fillStyle = "#000000", this.videoImageContext.fillRect(0, 0, this.videoImage.width, this.videoImage.height), this.videoTexture = new THREE.Texture(this.videoImage), this.videoTexture.minFilter = THREE.LinearFilter, this.videoTexture.magFilter = THREE.LinearFilter;
        var h = new THREE.MeshBasicMaterial({
                map: this.videoTexture,
                overdraw: !0
            }),
            r = new THREE.PlaneGeometry(this.videoImage.width, this.videoImage.height);
        this.videoMesh = new THREE.Mesh(r, h), this.videoMesh.position.set(0, 0, -1), this.scene.add(this.videoMesh), this.lastSelected = {}, this.thisSelected = {}
    }
}, GlRenderer.prototype.setVertexCnt = function(e) {
    this.maxVertexCnt = e
}, GlRenderer.prototype._isLastSelected = function(e, t) {
    var i = this.lastSelected[e];
    if (i)
        for (var s = i.length - 1; s >= 0; --s)
            if (i[s] == t) return !0;
    return !1
}, GlRenderer.prototype._setThisSelected = function(e, t) {
    var i = this.thisSelected[e];
    i ? i.push(t) : this.thisSelected[e] = [t]
}, GlRenderer.prototype.setWireframe = function(e) {
    this.wireframeMesh && (this.wireframeMesh.visible = e, this.hasWireframe != e && (this.renderer.render(this.finalScene, this.camera), this.hasWireframe = e))
}, GlRenderer.prototype.updateImage = function(e, t) {
    this.imgPath = e, this._renderSize = null, this.clear(), this.imgMesh && (this.scene.remove(this.imgMesh), this.imgMesh = null), this.preRender(t)
}, GlRenderer.prototype.clear = function() {
    this.faceMesh && (this.finalScene.remove(this.faceMesh), this.faceMesh = null), this.wireframeMesh && (this.finalScene.remove(this.wireframeMesh), this.wireframeMesh = null)
}, GlRenderer.prototype.render = function(e) {
    function t() {
        s.composer.render();
        var e = s.renderer.getContext();
        if (s.isImg) {
            var t = i.w,
                h = i.h,
                r = new Uint8Array(t * h * 4);
            e.readPixels(i.ow, i.oh, i.w, i.h, e.RGBA, e.UNSIGNED_BYTE, r)
        } else {
            var t = s.videoWidth,
                h = s.videoHeight,
                r = new Uint8Array(t * h * 4);
            e.readPixels(0, s.canvas.height - h, t, h, e.RGBA, e.UNSIGNED_BYTE, r)
        }
        s.vertices = [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1]
        ];
        var a = t * h,
            n = 0,
            o = 4;
        for (var d in s.lastSelected) {
            var c = parseInt(d, 10);
            if (void 0 != s.lastSelected[d])
                for (var l = s.lastSelected[d].length; l >= 0; --l) {
                    var m = s.lastSelected[d][l],
                        v = m * t + c,
                        g = r[4 * v];
                    g > 40 && Math.random() > .2 && (s._setThisSelected(d, m), s.vertices.push([c / t, m / h]), ++o)
                }
        }
        for (var f = Math.floor(.95 * s.maxVertexCnt), E = 100 * s.maxVertexCnt; o < f && n < E; ++o, ++n) {
            var v = Math.floor(Math.random() * a),
                c = v % t,
                m = Math.floor(v / t),
                g = r[4 * v];
            g > 100 || g > 100 * Math.random() ? (s.isImg || s._setThisSelected(c, m), s.vertices.push([c / t, m / h])) : --o
        }
        for (; o < s.maxVertexCnt; ++o) {
            var w = Math.random(),
                M = Math.random();
            s.vertices.push([w, M]), s.isImg || s._setThisSelected(Math.floor(w * t), Math.floor(M * h))
        }
        s.triangles = Delaunay.triangulate(s.vertices), s.renderTriangles(t, h)
    }
    this.clear(), this.isImg || this.preRender();
    var i = this.getRenderSize(),
        s = this;
    if (this.isImg) {
        var h = THREE.ImageUtils.loadTexture(this.imgPath, {}, t);
        h.magFilter = THREE.LinearFilter, h.minFilter = THREE.LinearFilter, this.imgMesh = new THREE.Mesh(new THREE.PlaneGeometry(i.w, i.h), new THREE.MeshBasicMaterial({
            map: h
        })), this.imgMesh.position.z = -1, this.scene.add(this.imgMesh)
    } else this.videoImageContext.drawImage(this.video, 0, 0), this.videoTexture && (this.videoTexture.needsUpdate = !0), t(), this.lastSelected = this.thisSelected, this.thisSelected = {};
    e && e()
}, GlRenderer.prototype.renderTriangles = function(e, t) {
    this.faceMesh = [];
    var i = (new THREE.Geometry, this.vertices),
        s = this.triangles,
        h = this.getRenderSize();
    if (this.isImg) var r = this.srcImg.width,
        a = this.srcImg.height;
    else var r = e,
        a = t;
    for (var n = new THREE.Geometry, o = s.length, d = 0, c = s.length - 1; c > 2; c -= 3) {
        var l = [i[s[c]][0] * h.w + h.dw, i[s[c]][1] * h.h + h.dh],
            m = [i[s[c - 1]][0] * h.w + h.dw, i[s[c - 1]][1] * h.h + h.dh],
            v = [i[s[c - 2]][0] * h.w + h.dw, i[s[c - 2]][1] * h.h + h.dh],
            g = Math.floor((i[s[c]][0] + i[s[c - 1]][0] + i[s[c - 2]][0]) / 3 * r),
            f = a - Math.floor((i[s[c]][1] + i[s[c - 1]][1] + i[s[c - 2]][1]) / 3 * a);
        g = Math.min(r, Math.max(0, g - 1)), f = Math.min(a, Math.max(0, f - 1));
        var E = 4 * (f * r + g),
            w = "rgb(" + this.srcPixel[E] + ", " + this.srcPixel[E + 1] + ", " + this.srcPixel[E + 2] + ")";
        n.vertices.push(new THREE.Vector3(l[0], l[1], 1)), n.vertices.push(new THREE.Vector3(m[0], m[1], 1)), n.vertices.push(new THREE.Vector3(v[0], v[1], 1)), n.faces.push(new THREE.Face3(o - c - 1, o - c, o - c + 1)), n.faces[d++].color = new THREE.Color(w)
    }
    this.faceMesh = new THREE.Mesh(n, this.faceMaterial), this.finalScene.add(this.faceMesh), this.wireframeMesh = new THREE.Mesh(n, this.wireframeMaterial), this.wireframeMesh.position.z = 2, this.hasWireframe || (this.wireframeMesh.visible = !1), this.finalScene.add(this.wireframeMesh), this.renderer.render(this.finalScene, this.camera)
}, GlRenderer.prototype.resize = function() {
    var e = this.canvas.height,
        t = this.canvas.width;
    this.camera.aspect = t / e, this.camera.updateProjectionMatrix(), this.renderer.setSize(t, e), this.composer.setSize(t, e), this._renderSize = null
}, GlRenderer.prototype.preRender = function(e) {
    if (this.isImg) {
        this.srcImg = new Image, this.srcImg.src = this.imgPath;
        var t = this,
            i = this.srcImg;
        this.srcImg.onload = function() {
            var s = document.createElement("canvas");
            s.width = i.width, s.height = i.height;
            var h = s.getContext("2d");
            h.drawImage(i, 0, 0, i.width, i.height), t.srcPixel = h.getImageData(0, 0, i.width, i.height).data, t.render(), e && e()
        }
    } else this.videoSrcCtx.drawImage(this.videoElement, 0, 0, this.videoWidth, this.videoHeight), this.srcPixel = this.videoSrcCtx.getImageData(0, 0, this.videoWidth, this.videoHeight).data
}, GlRenderer.prototype.getRenderSize = function(e, t) {
    if (this._renderSize) return this._renderSize;
    var e = this.isImg ? this.srcImg.width : this.videoWidth,
        t = this.isImg ? this.srcImg.height : this.videoHeight,
        i = this.canvas.width,
        s = this.canvas.height,
        h = e,
        r = t;
    if (i / s > h / r) var a = Math.floor(s / r * h),
        n = s,
        o = Math.floor((i - a) / 2),
        d = 0;
    else var a = i,
        n = Math.floor(i / h * r),
        o = 0,
        d = Math.floor((s - n) / 2);
    return this._renderSize = {
        w: a,
        h: n,
        dw: Math.floor(o - i / 2),
        dh: Math.floor(d - s / 2),
        ow: o,
        oh: d
    }, this._renderSize
};
var dat = dat || {};
dat.gui = dat.gui || {}, dat.utils = dat.utils || {}, dat.controllers = dat.controllers || {}, dat.dom = dat.dom || {}, dat.color = dat.color || {}, dat.utils.css = function() {
    return {
        load: function(e, t) {
            t = t || document;
            var n = t.createElement("link");
            n.type = "text/css", n.rel = "stylesheet", n.href = e, t.getElementsByTagName("head")[0].appendChild(n)
        },
        inject: function(e, t) {
            t = t || document;
            var n = document.createElement("style");
            n.type = "text/css", n.innerHTML = e, t.getElementsByTagName("head")[0].appendChild(n)
        }
    }
}(), dat.utils.common = function() {
    var e = Array.prototype.forEach,
        t = Array.prototype.slice;
    return {
        BREAK: {},
        extend: function(e) {
            return this.each(t.call(arguments, 1), function(t) {
                for (var n in t) this.isUndefined(t[n]) || (e[n] = t[n])
            }, this), e
        },
        defaults: function(e) {
            return this.each(t.call(arguments, 1), function(t) {
                for (var n in t) this.isUndefined(e[n]) && (e[n] = t[n])
            }, this), e
        },
        compose: function() {
            var e = t.call(arguments);
            return function() {
                for (var n = t.call(arguments), o = e.length - 1; o >= 0; o--) n = [e[o].apply(this, n)];
                return n[0]
            }
        },
        each: function(t, n, o) {
            if (e && t.forEach === e) t.forEach(n, o);
            else if (t.length === t.length + 0) {
                for (var i = 0, r = t.length; i < r; i++)
                    if (i in t && n.call(o, t[i], i) === this.BREAK) return
            } else
                for (var i in t)
                    if (n.call(o, t[i], i) === this.BREAK) return
        },
        defer: function(e) {
            setTimeout(e, 0)
        },
        toArray: function(e) {
            return e.toArray ? e.toArray() : t.call(e)
        },
        isUndefined: function(e) {
            return void 0 === e
        },
        isNull: function(e) {
            return null === e
        },
        isNaN: function(e) {
            return e !== e
        },
        isArray: Array.isArray || function(e) {
            return e.constructor === Array
        },
        isObject: function(e) {
            return e === Object(e)
        },
        isNumber: function(e) {
            return e === e + 0
        },
        isString: function(e) {
            return e === e + ""
        },
        isBoolean: function(e) {
            return e === !1 || e === !0
        },
        isFunction: function(e) {
            return "[object Function]" === Object.prototype.toString.call(e)
        }
    }
}(), dat.controllers.Controller = function(e) {
    var t = function(e, t) {
        this.initialValue = e[t], this.domElement = document.createElement("div"), this.object = e, this.property = t, this.__onChange = void 0, this.__onFinishChange = void 0
    };
    return e.extend(t.prototype, {
        onChange: function(e) {
            return this.__onChange = e, this
        },
        onFinishChange: function(e) {
            return this.__onFinishChange = e, this
        },
        setValue: function(e) {
            return this.object[this.property] = e, this.__onChange && this.__onChange.call(this, e), this.updateDisplay(), this
        },
        getValue: function() {
            return this.object[this.property]
        },
        updateDisplay: function() {
            return this
        },
        isModified: function() {
            return this.initialValue !== this.getValue()
        }
    }), t
}(dat.utils.common), dat.dom.dom = function(e) {
    function t(t) {
        if ("0" === t || e.isUndefined(t)) return 0;
        var n = t.match(i);
        return e.isNull(n) ? 0 : parseFloat(n[1])
    }
    var n = {
            HTMLEvents: ["change"],
            MouseEvents: ["click", "mousemove", "mousedown", "mouseup", "mouseover"],
            KeyboardEvents: ["keydown"]
        },
        o = {};
    e.each(n, function(t, n) {
        e.each(t, function(e) {
            o[e] = n
        })
    });
    var i = /(\d+(\.\d+)?)px/,
        r = {
            makeSelectable: function(e, t) {
                void 0 !== e && void 0 !== e.style && (e.onselectstart = t ? function() {
                    return !1
                } : function() {}, e.style.MozUserSelect = t ? "auto" : "none", e.style.KhtmlUserSelect = t ? "auto" : "none", e.unselectable = t ? "on" : "off")
            },
            makeFullscreen: function(t, n, o) {
                e.isUndefined(n) && (n = !0), e.isUndefined(o) && (o = !0), t.style.position = "absolute", n && (t.style.left = 0, t.style.right = 0), o && (t.style.top = 0, t.style.bottom = 0)
            },
            fakeEvent: function(t, n, i, r) {
                i = i || {};
                var s = o[n];
                if (!s) throw new Error("Event type " + n + " not supported.");
                var a = document.createEvent(s);
                switch (s) {
                    case "MouseEvents":
                        var l = i.x || i.clientX || 0,
                            d = i.y || i.clientY || 0;
                        a.initMouseEvent(n, i.bubbles || !1, i.cancelable || !0, window, i.clickCount || 1, 0, 0, l, d, !1, !1, !1, !1, 0, null);
                        break;
                    case "KeyboardEvents":
                        var c = a.initKeyboardEvent || a.initKeyEvent;
                        e.defaults(i, {
                            cancelable: !0,
                            ctrlKey: !1,
                            altKey: !1,
                            shiftKey: !1,
                            metaKey: !1,
                            keyCode: void 0,
                            charCode: void 0
                        }), c(n, i.bubbles || !1, i.cancelable, window, i.ctrlKey, i.altKey, i.shiftKey, i.metaKey, i.keyCode, i.charCode);
                        break;
                    default:
                        a.initEvent(n, i.bubbles || !1, i.cancelable || !0)
                }
                e.defaults(a, r), t.dispatchEvent(a)
            },
            bind: function(e, t, n, o) {
                return o = o || !1, e.addEventListener ? e.addEventListener(t, n, o) : e.attachEvent && e.attachEvent("on" + t, n), r
            },
            unbind: function(e, t, n, o) {
                return o = o || !1, e.removeEventListener ? e.removeEventListener(t, n, o) : e.detachEvent && e.detachEvent("on" + t, n), r
            },
            addClass: function(e, t) {
                if (void 0 === e.className) e.className = t;
                else if (e.className !== t) {
                    var n = e.className.split(/ +/);
                    n.indexOf(t) == -1 && (n.push(t), e.className = n.join(" ").replace(/^\s+/, "").replace(/\s+$/, ""))
                }
                return r
            },
            removeClass: function(e, t) {
                if (t)
                    if (void 0 === e.className);
                    else if (e.className === t) e.removeAttribute("class");
                else {
                    var n = e.className.split(/ +/),
                        o = n.indexOf(t);
                    o != -1 && (n.splice(o, 1), e.className = n.join(" "))
                } else e.className = void 0;
                return r
            },
            hasClass: function(e, t) {
                return new RegExp("(?:^|\\s+)" + t + "(?:\\s+|$)").test(e.className) || !1
            },
            getWidth: function(e) {
                var n = getComputedStyle(e);
                return t(n["border-left-width"]) + t(n["border-right-width"]) + t(n["padding-left"]) + t(n["padding-right"]) + t(n.width)
            },
            getHeight: function(e) {
                var n = getComputedStyle(e);
                return t(n["border-top-width"]) + t(n["border-bottom-width"]) + t(n["padding-top"]) + t(n["padding-bottom"]) + t(n.height)
            },
            getOffset: function(e) {
                var t = {
                    left: 0,
                    top: 0
                };
                if (e.offsetParent)
                    do t.left += e.offsetLeft, t.top += e.offsetTop; while (e = e.offsetParent);
                return t
            },
            isActive: function(e) {
                return e === document.activeElement && (e.type || e.href)
            }
        };
    return r
}(dat.utils.common), dat.controllers.OptionController = function(e, t, n) {
    var o = function(e, i, r) {
        o.superclass.call(this, e, i);
        var s = this;
        if (this.__select = document.createElement("select"), n.isArray(r)) {
            var a = {};
            n.each(r, function(e) {
                a[e] = e
            }), r = a
        }
        n.each(r, function(e, t) {
            var n = document.createElement("option");
            n.innerHTML = t, n.setAttribute("value", e), s.__select.appendChild(n)
        }), this.updateDisplay(), t.bind(this.__select, "change", function() {
            var e = this.options[this.selectedIndex].value;
            s.setValue(e)
        }), this.domElement.appendChild(this.__select)
    };
    return o.superclass = e, n.extend(o.prototype, e.prototype, {
        setValue: function(e) {
            var t = o.superclass.prototype.setValue.call(this, e);
            return this.__onFinishChange && this.__onFinishChange.call(this, this.getValue()), t
        },
        updateDisplay: function() {
            return this.__select.value = this.getValue(), o.superclass.prototype.updateDisplay.call(this)
        }
    }), o
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.controllers.NumberController = function(e, t) {
    function n(e) {
        return e = e.toString(), e.indexOf(".") > -1 ? e.length - e.indexOf(".") - 1 : 0
    }
    var o = function(e, i, r) {
        o.superclass.call(this, e, i), r = r || {}, this.__min = r.min, this.__max = r.max, this.__step = r.step, t.isUndefined(this.__step) ? 0 == this.initialValue ? this.__impliedStep = 1 : this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue) / Math.LN10)) / 10 : this.__impliedStep = this.__step, this.__precision = n(this.__impliedStep)
    };
    return o.superclass = e, t.extend(o.prototype, e.prototype, {
        setValue: function(e) {
            return void 0 !== this.__min && e < this.__min ? e = this.__min : void 0 !== this.__max && e > this.__max && (e = this.__max), void 0 !== this.__step && e % this.__step != 0 && (e = Math.round(e / this.__step) * this.__step), o.superclass.prototype.setValue.call(this, e)
        },
        min: function(e) {
            return this.__min = e, this
        },
        max: function(e) {
            return this.__max = e, this
        },
        step: function(e) {
            return this.__step = e, this
        }
    }), o
}(dat.controllers.Controller, dat.utils.common), dat.controllers.NumberControllerBox = function(e, t, n) {
    function o(e, t) {
        var n = Math.pow(10, t);
        return Math.round(e * n) / n
    }
    var i = function(e, o, r) {
        function s() {
            var e = parseFloat(h.__input.value);
            n.isNaN(e) || h.setValue(e)
        }

        function a() {
            s(), h.__onFinishChange && h.__onFinishChange.call(h, h.getValue())
        }

        function l(e) {
            t.bind(window, "mousemove", d), t.bind(window, "mouseup", c), u = e.clientY
        }

        function d(e) {
            var t = u - e.clientY;
            h.setValue(h.getValue() + t * h.__impliedStep), u = e.clientY
        }

        function c() {
            t.unbind(window, "mousemove", d), t.unbind(window, "mouseup", c)
        }
        this.__truncationSuspended = !1, i.superclass.call(this, e, o, r);
        var u, h = this;
        this.__input = document.createElement("input"), this.__input.setAttribute("type", "text"), t.bind(this.__input, "change", s), t.bind(this.__input, "blur", a), t.bind(this.__input, "mousedown", l), t.bind(this.__input, "keydown", function(e) {
            13 === e.keyCode && (h.__truncationSuspended = !0, this.blur(), h.__truncationSuspended = !1)
        }), this.updateDisplay(), this.domElement.appendChild(this.__input)
    };
    return i.superclass = e, n.extend(i.prototype, e.prototype, {
        updateDisplay: function() {
            return this.__input.value = this.__truncationSuspended ? this.getValue() : o(this.getValue(), this.__precision), i.superclass.prototype.updateDisplay.call(this)
        }
    }), i
}(dat.controllers.NumberController, dat.dom.dom, dat.utils.common), dat.controllers.NumberControllerSlider = function(e, t, n, o, i) {
    function r(e, t, n, o, i) {
        return o + (i - o) * ((e - t) / (n - t))
    }
    var s = function(e, n, o, i, a) {
        function l(e) {
            t.bind(window, "mousemove", d), t.bind(window, "mouseup", c), d(e)
        }

        function d(e) {
            e.preventDefault();
            var n = t.getOffset(u.__background),
                o = t.getWidth(u.__background);
            return u.setValue(r(e.clientX, n.left, n.left + o, u.__min, u.__max)), !1
        }

        function c() {
            t.unbind(window, "mousemove", d), t.unbind(window, "mouseup", c), u.__onFinishChange && u.__onFinishChange.call(u, u.getValue())
        }
        s.superclass.call(this, e, n, {
            min: o,
            max: i,
            step: a
        });
        var u = this;
        this.__background = document.createElement("div"), this.__foreground = document.createElement("div"), t.bind(this.__background, "mousedown", l), t.addClass(this.__background, "slider"), t.addClass(this.__foreground, "slider-fg"), this.updateDisplay(), this.__background.appendChild(this.__foreground), this.domElement.appendChild(this.__background)
    };
    return s.superclass = e, s.useDefaultStyles = function() {
        n.inject(i)
    }, o.extend(s.prototype, e.prototype, {
        updateDisplay: function() {
            var e = (this.getValue() - this.__min) / (this.__max - this.__min);
            return this.__foreground.style.width = 100 * e + "%", s.superclass.prototype.updateDisplay.call(this)
        }
    }), s
}(dat.controllers.NumberController, dat.dom.dom, dat.utils.css, dat.utils.common, "/**\n * dat-gui JavaScript Controller Library\n * http://code.google.com/p/dat-gui\n *\n * Copyright 2011 Data Arts Team, Google Creative Lab\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n */\n\n.slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}"), dat.controllers.FunctionController = function(e, t, n) {
    var o = function(e, n, i) {
        o.superclass.call(this, e, n);
        var r = this;
        this.__button = document.createElement("div"), this.__button.innerHTML = void 0 === i ? "Fire" : i, t.bind(this.__button, "click", function(e) {
            return e.preventDefault(), r.fire(), !1
        }), t.addClass(this.__button, "button"), this.domElement.appendChild(this.__button)
    };
    return o.superclass = e, n.extend(o.prototype, e.prototype, {
        fire: function() {
            this.__onChange && this.__onChange.call(this), this.__onFinishChange && this.__onFinishChange.call(this, this.getValue()), this.getValue().call(this.object)
        }
    }), o
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.controllers.BooleanController = function(e, t, n) {
    var o = function(e, n) {
        function i() {
            r.setValue(!r.__prev)
        }
        o.superclass.call(this, e, n);
        var r = this;
        this.__prev = this.getValue(), this.__checkbox = document.createElement("input"), this.__checkbox.setAttribute("type", "checkbox"), t.bind(this.__checkbox, "change", i, !1), this.domElement.appendChild(this.__checkbox), this.updateDisplay()
    };
    return o.superclass = e, n.extend(o.prototype, e.prototype, {
        setValue: function(e) {
            var t = o.superclass.prototype.setValue.call(this, e);
            return this.__onFinishChange && this.__onFinishChange.call(this, this.getValue()), this.__prev = this.getValue(), t
        },
        updateDisplay: function() {
            return this.getValue() === !0 ? (this.__checkbox.setAttribute("checked", "checked"), this.__checkbox.checked = !0) : this.__checkbox.checked = !1, o.superclass.prototype.updateDisplay.call(this)
        }
    }), o
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.color.toString = function(e) {
    return function(t) {
        if (1 == t.a || e.isUndefined(t.a)) {
            for (var n = t.hex.toString(16); n.length < 6;) n = "0" + n;
            return "#" + n
        }
        return "rgba(" + Math.round(t.r) + "," + Math.round(t.g) + "," + Math.round(t.b) + "," + t.a + ")"
    }
}(dat.utils.common), dat.color.interpret = function(e, t) {
    var n, o, i = function() {
            o = !1;
            var e = arguments.length > 1 ? t.toArray(arguments) : arguments[0];
            return t.each(r, function(i) {
                if (i.litmus(e)) return t.each(i.conversions, function(i, r) {
                    if (n = i.read(e), o === !1 && n !== !1) return o = n, n.conversionName = r, n.conversion = i, t.BREAK
                }), t.BREAK
            }), o
        },
        r = [{
            litmus: t.isString,
            conversions: {
                THREE_CHAR_HEX: {
                    read: function(e) {
                        var t = e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
                        return null !== t && {
                            space: "HEX",
                            hex: parseInt("0x" + t[1].toString() + t[1].toString() + t[2].toString() + t[2].toString() + t[3].toString() + t[3].toString())
                        }
                    },
                    write: e
                },
                SIX_CHAR_HEX: {
                    read: function(e) {
                        var t = e.match(/^#([A-F0-9]{6})$/i);
                        return null !== t && {
                            space: "HEX",
                            hex: parseInt("0x" + t[1].toString())
                        }
                    },
                    write: e
                },
                CSS_RGB: {
                    read: function(e) {
                        var t = e.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
                        return null !== t && {
                            space: "RGB",
                            r: parseFloat(t[1]),
                            g: parseFloat(t[2]),
                            b: parseFloat(t[3])
                        }
                    },
                    write: e
                },
                CSS_RGBA: {
                    read: function(e) {
                        var t = e.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
                        return null !== t && {
                            space: "RGB",
                            r: parseFloat(t[1]),
                            g: parseFloat(t[2]),
                            b: parseFloat(t[3]),
                            a: parseFloat(t[4])
                        }
                    },
                    write: e
                }
            }
        }, {
            litmus: t.isNumber,
            conversions: {
                HEX: {
                    read: function(e) {
                        return {
                            space: "HEX",
                            hex: e,
                            conversionName: "HEX"
                        }
                    },
                    write: function(e) {
                        return e.hex
                    }
                }
            }
        }, {
            litmus: t.isArray,
            conversions: {
                RGB_ARRAY: {
                    read: function(e) {
                        return 3 == e.length && {
                            space: "RGB",
                            r: e[0],
                            g: e[1],
                            b: e[2]
                        }
                    },
                    write: function(e) {
                        return [e.r, e.g, e.b]
                    }
                },
                RGBA_ARRAY: {
                    read: function(e) {
                        return 4 == e.length && {
                            space: "RGB",
                            r: e[0],
                            g: e[1],
                            b: e[2],
                            a: e[3]
                        }
                    },
                    write: function(e) {
                        return [e.r, e.g, e.b, e.a]
                    }
                }
            }
        }, {
            litmus: t.isObject,
            conversions: {
                RGBA_OBJ: {
                    read: function(e) {
                        return !!(t.isNumber(e.r) && t.isNumber(e.g) && t.isNumber(e.b) && t.isNumber(e.a)) && {
                            space: "RGB",
                            r: e.r,
                            g: e.g,
                            b: e.b,
                            a: e.a
                        }
                    },
                    write: function(e) {
                        return {
                            r: e.r,
                            g: e.g,
                            b: e.b,
                            a: e.a
                        }
                    }
                },
                RGB_OBJ: {
                    read: function(e) {
                        return !!(t.isNumber(e.r) && t.isNumber(e.g) && t.isNumber(e.b)) && {
                            space: "RGB",
                            r: e.r,
                            g: e.g,
                            b: e.b
                        }
                    },
                    write: function(e) {
                        return {
                            r: e.r,
                            g: e.g,
                            b: e.b
                        }
                    }
                },
                HSVA_OBJ: {
                    read: function(e) {
                        return !!(t.isNumber(e.h) && t.isNumber(e.s) && t.isNumber(e.v) && t.isNumber(e.a)) && {
                            space: "HSV",
                            h: e.h,
                            s: e.s,
                            v: e.v,
                            a: e.a
                        }
                    },
                    write: function(e) {
                        return {
                            h: e.h,
                            s: e.s,
                            v: e.v,
                            a: e.a
                        }
                    }
                },
                HSV_OBJ: {
                    read: function(e) {
                        return !!(t.isNumber(e.h) && t.isNumber(e.s) && t.isNumber(e.v)) && {
                            space: "HSV",
                            h: e.h,
                            s: e.s,
                            v: e.v
                        }
                    },
                    write: function(e) {
                        return {
                            h: e.h,
                            s: e.s,
                            v: e.v
                        }
                    }
                }
            }
        }];
    return i
}(dat.color.toString, dat.utils.common), dat.GUI = dat.gui.GUI = function(e, t, n, o, i, r, s, a, l, d, c, u, h, p, _) {
    function f(e, t, n, r) {
        if (void 0 === t[n]) throw new Error("Object " + t + ' has no property "' + n + '"');
        var s;
        if (r.color) s = new c(t, n);
        else {
            var a = [t, n].concat(r.factoryArgs);
            s = o.apply(e, a)
        }
        r.before instanceof i && (r.before = r.before.__li), b(e, s), p.addClass(s.domElement, "c");
        var l = document.createElement("span");
        p.addClass(l, "property-name"), l.innerHTML = s.property;
        var d = document.createElement("div");
        d.appendChild(l), d.appendChild(s.domElement);
        var u = m(e, d, r.before);
        return p.addClass(u, I.CLASS_CONTROLLER_ROW), p.addClass(u, typeof s.getValue()), g(e, u, s), e.__controllers.push(s), s
    }

    function m(e, t, n) {
        var o = document.createElement("li");
        return t && o.appendChild(t), n ? e.__ul.insertBefore(o, params.before) : e.__ul.appendChild(o), e.onResize(), o
    }

    function g(e, t, n) {
        if (n.__li = t, n.__gui = e, _.extend(n, {
                options: function(t) {
                    return arguments.length > 1 ? (n.remove(), f(e, n.object, n.property, {
                        before: n.__li.nextElementSibling,
                        factoryArgs: [_.toArray(arguments)]
                    })) : _.isArray(t) || _.isObject(t) ? (n.remove(), f(e, n.object, n.property, {
                        before: n.__li.nextElementSibling,
                        factoryArgs: [t]
                    })) : void 0
                },
                name: function(e) {
                    return n.__li.firstElementChild.firstElementChild.innerHTML = e, n
                },
                listen: function() {
                    return n.__gui.listen(n), n
                },
                remove: function() {
                    return n.__gui.remove(n), n
                }
            }), n instanceof l) {
            var o = new a(n.object, n.property, {
                min: n.__min,
                max: n.__max,
                step: n.__step
            });
            _.each(["updateDisplay", "onChange", "onFinishChange"], function(e) {
                var t = n[e],
                    i = o[e];
                n[e] = o[e] = function() {
                    var e = Array.prototype.slice.call(arguments);
                    return t.apply(n, e), i.apply(o, e)
                }
            }), p.addClass(t, "has-slider"), n.domElement.insertBefore(o.domElement, n.domElement.firstElementChild)
        } else if (n instanceof a) {
            var i = function(t) {
                return _.isNumber(n.__min) && _.isNumber(n.__max) ? (n.remove(), f(e, n.object, n.property, {
                    before: n.__li.nextElementSibling,
                    factoryArgs: [n.__min, n.__max, n.__step]
                })) : t
            };
            n.min = _.compose(i, n.min), n.max = _.compose(i, n.max)
        } else n instanceof r ? (p.bind(t, "click", function() {
            p.fakeEvent(n.__checkbox, "click")
        }), p.bind(n.__checkbox, "click", function(e) {
            e.stopPropagation()
        })) : n instanceof s ? (p.bind(t, "click", function() {
            p.fakeEvent(n.__button, "click")
        }), p.bind(t, "mouseover", function() {
            p.addClass(n.__button, "hover")
        }), p.bind(t, "mouseout", function() {
            p.removeClass(n.__button, "hover")
        })) : n instanceof c && (p.addClass(t, "color"), n.updateDisplay = _.compose(function(e) {
            return t.style.borderLeftColor = n.__color.toString(), e
        }, n.updateDisplay), n.updateDisplay());
        n.setValue = _.compose(function(t) {
            return e.getRoot().__preset_select && n.isModified() && k(e.getRoot(), !0), t
        }, n.setValue)
    }

    function b(e, t) {
        var n = e.getRoot(),
            o = n.__rememberedObjects.indexOf(t.object);
        if (o != -1) {
            var i = n.__rememberedObjectIndecesToControllers[o];
            if (void 0 === i && (i = {}, n.__rememberedObjectIndecesToControllers[o] = i), i[t.property] = t, n.load && n.load.remembered) {
                var r, s = n.load.remembered;
                if (s[e.preset]) r = s[e.preset];
                else {
                    if (!s[B]) return;
                    r = s[B]
                }
                if (r[o] && void 0 !== r[o][t.property]) {
                    var a = r[o][t.property];
                    t.initialValue = a, t.setValue(a)
                }
            }
        }
    }

    function v(e, t) {
        return document.location.href + "." + t
    }

    function y(e) {
        function t() {
            d.style.display = e.useLocalStorage ? "block" : "none"
        }
        var n = e.__save_row = document.createElement("li");
        p.addClass(e.domElement, "has-save"), e.__ul.insertBefore(n, e.__ul.firstChild), p.addClass(n, "save-row");
        var o = document.createElement("span");
        o.innerHTML = "&nbsp;", p.addClass(o, "button gears");
        var i = document.createElement("span");
        i.innerHTML = "Save", p.addClass(i, "button"), p.addClass(i, "save");
        var r = document.createElement("span");
        r.innerHTML = "New", p.addClass(r, "button"), p.addClass(r, "save-as");
        var s = document.createElement("span");
        s.innerHTML = "Revert", p.addClass(s, "button"), p.addClass(s, "revert");
        var a = e.__preset_select = document.createElement("select");
        if (e.load && e.load.remembered ? _.each(e.load.remembered, function(t, n) {
                E(e, n, n == e.preset)
            }) : E(e, B, !1), p.bind(a, "change", function() {
                for (var t = 0; t < e.__preset_select.length; t++) e.__preset_select[t].innerHTML = e.__preset_select[t].value;
                e.preset = this.value
            }), n.appendChild(a), n.appendChild(o), n.appendChild(i), n.appendChild(r), n.appendChild(s), D) {
            var l = document.getElementById("dg-save-locally"),
                d = document.getElementById("dg-local-explain");
            l.style.display = "block";
            var c = document.getElementById("dg-local-storage");
            "true" === localStorage.getItem(v(e, "isLocal")) && c.setAttribute("checked", "checked"), t(), p.bind(c, "change", function() {
                e.useLocalStorage = !e.useLocalStorage, t()
            })
        }
        var u = document.getElementById("dg-new-constructor");
        p.bind(u, "keydown", function(e) {
            !e.metaKey || 67 !== e.which && 67 != e.keyCode || O.hide()
        }), p.bind(o, "click", function() {
            u.innerHTML = JSON.stringify(e.getSaveObject(), void 0, 2), O.show(), u.focus(), u.select()
        }), p.bind(i, "click", function() {
            e.save()
        }), p.bind(r, "click", function() {
            var t = prompt("Enter a new preset name.");
            t && e.saveAs(t)
        }), p.bind(s, "click", function() {
            e.revert()
        })
    }

    function x(e) {
        function t(t) {
            return t.preventDefault(), i = t.clientX, p.addClass(e.__closeButton, I.CLASS_DRAG), p.bind(window, "mousemove", n), p.bind(window, "mouseup", o), !1
        }

        function n(t) {
            return t.preventDefault(), e.width += i - t.clientX, e.onResize(), i = t.clientX, !1
        }

        function o() {
            p.removeClass(e.__closeButton, I.CLASS_DRAG), p.unbind(window, "mousemove", n), p.unbind(window, "mouseup", o)
        }
        e.__resize_handle = document.createElement("div"), _.extend(e.__resize_handle.style, {
            width: "6px",
            marginLeft: "-3px",
            height: "200px",
            cursor: "ew-resize",
            position: "absolute"
        });
        var i;
        p.bind(e.__resize_handle, "mousedown", t), p.bind(e.__closeButton, "mousedown", t), e.domElement.insertBefore(e.__resize_handle, e.domElement.firstElementChild)
    }

    function w(e, t) {
        e.domElement.style.width = t + "px", e.__save_row && e.autoPlace && (e.__save_row.style.width = t + "px"), e.__closeButton && (e.__closeButton.style.width = t + "px")
    }

    function C(e, t) {
        var n = {};
        return _.each(e.__rememberedObjects, function(o, i) {
            var r = {},
                s = e.__rememberedObjectIndecesToControllers[i];
            _.each(s, function(e, n) {
                r[n] = t ? e.initialValue : e.getValue()
            }), n[i] = r
        }), n
    }

    function E(e, t, n) {
        var o = document.createElement("option");
        o.innerHTML = t, o.value = t, e.__preset_select.appendChild(o), n && (e.__preset_select.selectedIndex = e.__preset_select.length - 1)
    }

    function A(e) {
        for (var t = 0; t < e.__preset_select.length; t++) e.__preset_select[t].value == e.preset && (e.__preset_select.selectedIndex = t)
    }

    function k(e, t) {
        var n = e.__preset_select[e.__preset_select.selectedIndex];
        t ? n.innerHTML = n.value + "*" : n.innerHTML = n.value
    }

    function S(e) {
        0 != e.length && u(function() {
            S(e)
        }), _.each(e, function(e) {
            e.updateDisplay()
        })
    }
    e.inject(n);
    var O, T, L = "dg",
        N = 72,
        R = 20,
        B = "Default",
        D = function() {
            try {
                return "localStorage" in window && null !== window.localStorage
            } catch (e) {
                return !1
            }
        }(),
        F = !0,
        V = !1,
        H = [],
        I = function(e) {
            function t() {
                localStorage.setItem(v(o, "gui"), JSON.stringify(o.getSaveObject()))
            }

            function n() {
                var e = o.getRoot();
                e.width += 1, _.defer(function() {
                    e.width -= 1
                })
            }
            var o = this;
            this.domElement = document.createElement("div"), this.__ul = document.createElement("ul"), this.domElement.appendChild(this.__ul), p.addClass(this.domElement, L), this.__folders = {}, this.__controllers = [], this.__rememberedObjects = [], this.__rememberedObjectIndecesToControllers = [], this.__listening = [], e = e || {}, e = _.defaults(e, {
                autoPlace: !0,
                width: I.DEFAULT_WIDTH
            }), e = _.defaults(e, {
                resizable: e.autoPlace,
                hideable: e.autoPlace
            }), _.isUndefined(e.load) ? e.load = {
                preset: B
            } : e.preset && (e.load.preset = e.preset), _.isUndefined(e.parent) && e.hideable && H.push(this), e.resizable = _.isUndefined(e.parent) && e.resizable, e.autoPlace && _.isUndefined(e.scrollable) && (e.scrollable = !0);
            var i = D && "true" === localStorage.getItem(v(this, "isLocal"));
            if (Object.defineProperties(this, {
                    parent: {
                        get: function() {
                            return e.parent
                        }
                    },
                    scrollable: {
                        get: function() {
                            return e.scrollable
                        }
                    },
                    autoPlace: {
                        get: function() {
                            return e.autoPlace
                        }
                    },
                    preset: {
                        get: function() {
                            return o.parent ? o.getRoot().preset : e.load.preset
                        },
                        set: function(t) {
                            o.parent ? o.getRoot().preset = t : e.load.preset = t, A(this), o.revert()
                        }
                    },
                    width: {
                        get: function() {
                            return e.width
                        },
                        set: function(t) {
                            e.width = t, w(o, t)
                        }
                    },
                    name: {
                        get: function() {
                            return e.name
                        },
                        set: function(t) {
                            e.name = t, s && (s.innerHTML = e.name)
                        }
                    },
                    closed: {
                        get: function() {
                            return e.closed
                        },
                        set: function(t) {
                            e.closed = t, e.closed ? p.addClass(o.__ul, I.CLASS_CLOSED) : p.removeClass(o.__ul, I.CLASS_CLOSED), this.onResize(), o.__closeButton && (o.__closeButton.innerHTML = t ? I.TEXT_OPEN : I.TEXT_CLOSED)
                        }
                    },
                    load: {
                        get: function() {
                            return e.load
                        }
                    },
                    useLocalStorage: {
                        get: function() {
                            return i
                        },
                        set: function(e) {
                            D && (i = e, e ? p.bind(window, "unload", t) : p.unbind(window, "unload", t), localStorage.setItem(v(o, "isLocal"), e))
                        }
                    }
                }), _.isUndefined(e.parent)) {
                if (e.closed = !1, p.addClass(this.domElement, I.CLASS_MAIN), p.makeSelectable(this.domElement, !1), D && i) {
                    o.useLocalStorage = !0;
                    var r = localStorage.getItem(v(this, "gui"));
                    r && (e.load = JSON.parse(r))
                }
                this.__closeButton = document.createElement("div"), this.__closeButton.innerHTML = I.TEXT_CLOSED, p.addClass(this.__closeButton, I.CLASS_CLOSE_BUTTON), this.domElement.appendChild(this.__closeButton), p.bind(this.__closeButton, "click", function() {
                    o.closed = !o.closed
                })
            } else {
                void 0 === e.closed && (e.closed = !0);
                var s = document.createTextNode(e.name);
                p.addClass(s, "controller-name");
                var a = m(o, s),
                    l = function(e) {
                        return e.preventDefault(), o.closed = !o.closed, !1
                    };
                p.addClass(this.__ul, I.CLASS_CLOSED), p.addClass(a, "title"), p.bind(a, "click", l), e.closed || (this.closed = !1)
            }
            e.autoPlace && (_.isUndefined(e.parent) && (F && (T = document.createElement("div"), p.addClass(T, L), p.addClass(T, I.CLASS_AUTO_PLACE_CONTAINER), document.body.appendChild(T), F = !1), T.appendChild(this.domElement), p.addClass(this.domElement, I.CLASS_AUTO_PLACE)), this.parent || w(o, e.width)), p.bind(window, "resize", function() {
                o.onResize()
            }), p.bind(this.__ul, "webkitTransitionEnd", function() {
                o.onResize()
            }), p.bind(this.__ul, "transitionend", function() {
                o.onResize()
            }), p.bind(this.__ul, "oTransitionEnd", function() {
                o.onResize()
            }), this.onResize(), e.resizable && x(this);
            o.getRoot();
            e.parent || n()
        };
    return I.toggleHide = function() {
        V = !V, _.each(H, function(e) {
            e.domElement.style.zIndex = V ? -999 : 999, e.domElement.style.opacity = V ? 0 : 1
        })
    }, I.CLASS_AUTO_PLACE = "a", I.CLASS_AUTO_PLACE_CONTAINER = "ac", I.CLASS_MAIN = "main", I.CLASS_CONTROLLER_ROW = "cr", I.CLASS_TOO_TALL = "taller-than-window", I.CLASS_CLOSED = "closed", I.CLASS_CLOSE_BUTTON = "close-button", I.CLASS_DRAG = "drag", I.DEFAULT_WIDTH = 245, I.TEXT_CLOSED = "Close Controls", I.TEXT_OPEN = "Open Controls", p.bind(window, "keydown", function(e) {
        "text" === document.activeElement.type || e.which !== N && e.keyCode != N || I.toggleHide()
    }, !1), _.extend(I.prototype, {
        add: function(e, t) {
            return f(this, e, t, {
                factoryArgs: Array.prototype.slice.call(arguments, 2)
            })
        },
        addColor: function(e, t) {
            return f(this, e, t, {
                color: !0
            })
        },
        remove: function(e) {
            this.__ul.removeChild(e.__li), this.__controllers.slice(this.__controllers.indexOf(e), 1);
            var t = this;
            _.defer(function() {
                t.onResize()
            })
        },
        destroy: function() {
            this.autoPlace && T.removeChild(this.domElement)
        },
        addFolder: function(e) {
            if (void 0 !== this.__folders[e]) throw new Error('You already have a folder in this GUI by the name "' + e + '"');
            var t = {
                name: e,
                parent: this
            };
            t.autoPlace = this.autoPlace, this.load && this.load.folders && this.load.folders[e] && (t.closed = this.load.folders[e].closed, t.load = this.load.folders[e]);
            var n = new I(t);
            this.__folders[e] = n;
            var o = m(this, n.domElement);
            return p.addClass(o, "folder"), n
        },
        open: function() {
            this.closed = !1
        },
        close: function() {
            this.closed = !0
        },
        onResize: function() {
            var e = this.getRoot();
            if (e.scrollable) {
                var t = p.getOffset(e.__ul).top,
                    n = 0;
                _.each(e.__ul.childNodes, function(t) {
                    e.autoPlace && t === e.__save_row || (n += p.getHeight(t))
                }), window.innerHeight - t - R < n ? (p.addClass(e.domElement, I.CLASS_TOO_TALL), e.__ul.style.height = window.innerHeight - t - R + "px") : (p.removeClass(e.domElement, I.CLASS_TOO_TALL), e.__ul.style.height = "auto")
            }
            e.__resize_handle && _.defer(function() {
                e.__resize_handle.style.height = e.__ul.offsetHeight + "px"
            }), e.__closeButton && (e.__closeButton.style.width = e.width + "px")
        },
        remember: function() {
            if (_.isUndefined(O) && (O = new h, O.domElement.innerHTML = t), this.parent) throw new Error("You can only call remember on a top level GUI.");
            var e = this;
            _.each(Array.prototype.slice.call(arguments), function(t) {
                0 == e.__rememberedObjects.length && y(e), e.__rememberedObjects.indexOf(t) == -1 && e.__rememberedObjects.push(t)
            }), this.autoPlace && w(this, this.width)
        },
        getRoot: function() {
            for (var e = this; e.parent;) e = e.parent;
            return e
        },
        getSaveObject: function() {
            var e = this.load;
            return e.closed = this.closed, this.__rememberedObjects.length > 0 && (e.preset = this.preset, e.remembered || (e.remembered = {}), e.remembered[this.preset] = C(this)), e.folders = {}, _.each(this.__folders, function(t, n) {
                e.folders[n] = t.getSaveObject()
            }), e
        },
        save: function() {
            this.load.remembered || (this.load.remembered = {}), this.load.remembered[this.preset] = C(this), k(this, !1)
        },
        saveAs: function(e) {
            this.load.remembered || (this.load.remembered = {}, this.load.remembered[B] = C(this, !0)), this.load.remembered[e] = C(this), this.preset = e, E(this, e, !0)
        },
        revert: function(e) {
            _.each(this.__controllers, function(t) {
                this.getRoot().load.remembered ? b(e || this.getRoot(), t) : t.setValue(t.initialValue)
            }, this), _.each(this.__folders, function(e) {
                e.revert(e)
            }), e || k(this.getRoot(), !1)
        },
        listen: function(e) {
            var t = 0 == this.__listening.length;
            this.__listening.push(e), t && S(this.__listening)
        }
    }), I
}(dat.utils.css, '<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>', ".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save > ul {\n      margin-top: 27px; }\n      .dg.a.has-save > ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid rgba(0, 0, 0, 0); }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function,\n  .dg .cr.function .property-name,\n  .dg .cr.function *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: black url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2fa1d6; }\n    .dg .cr.number input[type=text] {\n      color: #2fa1d6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.function:hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2fa1d6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n", dat.controllers.factory = function(e, t, n, o, i, r, s) {
    return function(a, l) {
        var d = a[l];
        return s.isArray(arguments[2]) || s.isObject(arguments[2]) ? new e(a, l, arguments[2]) : s.isNumber(d) ? s.isNumber(arguments[2]) && s.isNumber(arguments[3]) ? new n(a, l, arguments[2], arguments[3]) : new t(a, l, {
            min: arguments[2],
            max: arguments[3]
        }) : s.isString(d) ? new o(a, l) : s.isFunction(d) ? new i(a, l, "") : s.isBoolean(d) ? new r(a, l) : void 0
    }
}(dat.controllers.OptionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.StringController = function(e, t, n) {
    var o = function(e, n) {
        function i() {
            s.setValue(s.__input.value)
        }

        function r() {
            s.__onFinishChange && s.__onFinishChange.call(s, s.getValue())
        }
        o.superclass.call(this, e, n);
        var s = this;
        this.__input = document.createElement("input"), this.__input.setAttribute("type", "text"), t.bind(this.__input, "keyup", i), t.bind(this.__input, "change", i), t.bind(this.__input, "blur", r), t.bind(this.__input, "keydown", function(e) {
            13 === e.keyCode && this.blur()
        }), this.updateDisplay(), this.domElement.appendChild(this.__input)
    };
    return o.superclass = e, n.extend(o.prototype, e.prototype, {
        updateDisplay: function() {
            return t.isActive(this.__input) || (this.__input.value = this.getValue()), o.superclass.prototype.updateDisplay.call(this)
        }
    }), o
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.controllers.FunctionController, dat.controllers.BooleanController, dat.utils.common), dat.controllers.Controller, dat.controllers.BooleanController, dat.controllers.FunctionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.OptionController, dat.controllers.ColorController = function(e, t, n, o, i) {
    function r(e, t, n, o) {
        e.style.background = "", i.each(l, function(i) {
            e.style.cssText += "background: " + i + "linear-gradient(" + t + ", " + n + " 0%, " + o + " 100%); "
        })
    }

    function s(e) {
        e.style.background = "", e.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);", e.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);", e.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);", e.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);", e.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"
    }
    var a = function(e, l) {
        function d(e) {
            p(e), t.bind(window, "mousemove", p), t.bind(window, "mouseup", c)
        }

        function c() {
            t.unbind(window, "mousemove", p), t.unbind(window, "mouseup", c)
        }

        function u() {
            var e = o(this.value);
            e !== !1 ? (f.__color.__state = e, f.setValue(f.__color.toOriginal())) : this.value = f.__color.toString()
        }

        function h() {
            t.unbind(window, "mousemove", _), t.unbind(window, "mouseup", h)
        }

        function p(e) {
            e.preventDefault();
            var n = t.getWidth(f.__saturation_field),
                o = t.getOffset(f.__saturation_field),
                i = (e.clientX - o.left + document.body.scrollLeft) / n,
                r = 1 - (e.clientY - o.top + document.body.scrollTop) / n;
            return r > 1 ? r = 1 : r < 0 && (r = 0), i > 1 ? i = 1 : i < 0 && (i = 0), f.__color.v = r, f.__color.s = i, f.setValue(f.__color.toOriginal()), !1
        }

        function _(e) {
            e.preventDefault();
            var n = t.getHeight(f.__hue_field),
                o = t.getOffset(f.__hue_field),
                i = 1 - (e.clientY - o.top + document.body.scrollTop) / n;
            return i > 1 ? i = 1 : i < 0 && (i = 0), f.__color.h = 360 * i, f.setValue(f.__color.toOriginal()), !1
        }
        a.superclass.call(this, e, l), this.__color = new n(this.getValue()), this.__temp = new n(0);
        var f = this;
        this.domElement = document.createElement("div"), t.makeSelectable(this.domElement, !1), this.__selector = document.createElement("div"), this.__selector.className = "selector", this.__saturation_field = document.createElement("div"), this.__saturation_field.className = "saturation-field", this.__field_knob = document.createElement("div"), this.__field_knob.className = "field-knob", this.__field_knob_border = "2px solid ", this.__hue_knob = document.createElement("div"), this.__hue_knob.className = "hue-knob", this.__hue_field = document.createElement("div"), this.__hue_field.className = "hue-field", this.__input = document.createElement("input"), this.__input.type = "text", this.__input_textShadow = "0 1px 1px ", t.bind(this.__input, "keydown", function(e) {
            13 === e.keyCode && u.call(this)
        }), t.bind(this.__input, "blur", u), t.bind(this.__selector, "mousedown", function(e) {
            t.addClass(this, "drag").bind(window, "mouseup", function(e) {
                t.removeClass(f.__selector, "drag")
            })
        });
        var m = document.createElement("div");
        i.extend(this.__selector.style, {
            width: "122px",
            height: "102px",
            padding: "3px",
            backgroundColor: "#222",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
        }), i.extend(this.__field_knob.style, {
            position: "absolute",
            width: "12px",
            height: "12px",
            border: this.__field_knob_border + (this.__color.v < .5 ? "#fff" : "#000"),
            boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
            borderRadius: "12px",
            zIndex: 1
        }), i.extend(this.__hue_knob.style, {
            position: "absolute",
            width: "15px",
            height: "2px",
            borderRight: "4px solid #fff",
            zIndex: 1
        }), i.extend(this.__saturation_field.style, {
            width: "100px",
            height: "100px",
            border: "1px solid #555",
            marginRight: "3px",
            display: "inline-block",
            cursor: "pointer"
        }), i.extend(m.style, {
            width: "100%",
            height: "100%",
            background: "none"
        }), r(m, "top", "rgba(0,0,0,0)", "#000"), i.extend(this.__hue_field.style, {
            width: "15px",
            height: "100px",
            display: "inline-block",
            border: "1px solid #555",
            cursor: "ns-resize"
        }), s(this.__hue_field), i.extend(this.__input.style, {
            outline: "none",
            textAlign: "center",
            color: "#fff",
            border: 0,
            fontWeight: "bold",
            textShadow: this.__input_textShadow + "rgba(0,0,0,0.7)"
        }), t.bind(this.__saturation_field, "mousedown", d), t.bind(this.__field_knob, "mousedown", d), t.bind(this.__hue_field, "mousedown", function(e) {
            _(e), t.bind(window, "mousemove", _), t.bind(window, "mouseup", h)
        }), this.__saturation_field.appendChild(m), this.__selector.appendChild(this.__field_knob), this.__selector.appendChild(this.__saturation_field), this.__selector.appendChild(this.__hue_field), this.__hue_field.appendChild(this.__hue_knob), this.domElement.appendChild(this.__input), this.domElement.appendChild(this.__selector), this.updateDisplay()
    };
    a.superclass = e, i.extend(a.prototype, e.prototype, {
        updateDisplay: function() {
            var e = o(this.getValue());
            if (e !== !1) {
                var t = !1;
                i.each(n.COMPONENTS, function(n) {
                    if (!i.isUndefined(e[n]) && !i.isUndefined(this.__color.__state[n]) && e[n] !== this.__color.__state[n]) return t = !0, {}
                }, this), t && i.extend(this.__color.__state, e)
            }
            i.extend(this.__temp.__state, this.__color.__state), this.__temp.a = 1;
            var s = this.__color.v < .5 || this.__color.s > .5 ? 255 : 0,
                a = 255 - s;
            i.extend(this.__field_knob.style, {
                marginLeft: 100 * this.__color.s - 7 + "px",
                marginTop: 100 * (1 - this.__color.v) - 7 + "px",
                backgroundColor: this.__temp.toString(),
                border: this.__field_knob_border + "rgb(" + s + "," + s + "," + s + ")"
            }), this.__hue_knob.style.marginTop = 100 * (1 - this.__color.h / 360) + "px", this.__temp.s = 1, this.__temp.v = 1, r(this.__saturation_field, "left", "#fff", this.__temp.toString()), i.extend(this.__input.style, {
                backgroundColor: this.__input.value = this.__color.toString(),
                color: "rgb(" + s + "," + s + "," + s + ")",
                textShadow: this.__input_textShadow + "rgba(" + a + "," + a + "," + a + ",.7)"
            })
        }
    });
    var l = ["-moz-", "-o-", "-webkit-", "-ms-", ""];
    return a
}(dat.controllers.Controller, dat.dom.dom, dat.color.Color = function(e, t, n, o) {
    function i(e, t, n) {
        Object.defineProperty(e, t, {
            get: function() {
                return "RGB" === this.__state.space ? this.__state[t] : (s(this, t, n), this.__state[t])
            },
            set: function(e) {
                "RGB" !== this.__state.space && (s(this, t, n), this.__state.space = "RGB"), this.__state[t] = e
            }
        })
    }

    function r(e, t) {
        Object.defineProperty(e, t, {
            get: function() {
                return "HSV" === this.__state.space ? this.__state[t] : (a(this), this.__state[t])
            },
            set: function(e) {
                "HSV" !== this.__state.space && (a(this), this.__state.space = "HSV"), this.__state[t] = e
            }
        })
    }

    function s(e, n, i) {
        if ("HEX" === e.__state.space) e.__state[n] = t.component_from_hex(e.__state.hex, i);
        else {
            if ("HSV" !== e.__state.space) throw "Corrupted color state";
            o.extend(e.__state, t.hsv_to_rgb(e.__state.h, e.__state.s, e.__state.v))
        }
    }

    function a(e) {
        var n = t.rgb_to_hsv(e.r, e.g, e.b);
        o.extend(e.__state, {
            s: n.s,
            v: n.v
        }), o.isNaN(n.h) ? o.isUndefined(e.__state.h) && (e.__state.h = 0) : e.__state.h = n.h
    }
    var l = function() {
        if (this.__state = e.apply(this, arguments), this.__state === !1) throw "Failed to interpret color arguments";
        this.__state.a = this.__state.a || 1
    };
    return l.COMPONENTS = ["r", "g", "b", "h", "s", "v", "hex", "a"], o.extend(l.prototype, {
        toString: function() {
            return n(this)
        },
        toOriginal: function() {
            return this.__state.conversion.write(this)
        }
    }), i(l.prototype, "r", 2), i(l.prototype, "g", 1), i(l.prototype, "b", 0), r(l.prototype, "h"), r(l.prototype, "s"), r(l.prototype, "v"), Object.defineProperty(l.prototype, "a", {
        get: function() {
            return this.__state.a
        },
        set: function(e) {
            this.__state.a = e
        }
    }), Object.defineProperty(l.prototype, "hex", {
        get: function() {
            return "HEX" !== !this.__state.space && (this.__state.hex = t.rgb_to_hex(this.r, this.g, this.b)), this.__state.hex
        },
        set: function(e) {
            this.__state.space = "HEX", this.__state.hex = e
        }
    }), l
}(dat.color.interpret, dat.color.math = function() {
    var e;
    return {
        hsv_to_rgb: function(e, t, n) {
            var o = Math.floor(e / 60) % 6,
                i = e / 60 - Math.floor(e / 60),
                r = n * (1 - t),
                s = n * (1 - i * t),
                a = n * (1 - (1 - i) * t),
                l = [
                    [n, a, r],
                    [s, n, r],
                    [r, n, a],
                    [r, s, n],
                    [a, r, n],
                    [n, r, s]
                ][o];
            return {
                r: 255 * l[0],
                g: 255 * l[1],
                b: 255 * l[2]
            }
        },
        rgb_to_hsv: function(e, t, n) {
            var o, i, r = Math.min(e, t, n),
                s = Math.max(e, t, n),
                a = s - r;
            return 0 == s ? {
                h: NaN,
                s: 0,
                v: 0
            } : (i = a / s, o = e == s ? (t - n) / a : t == s ? 2 + (n - e) / a : 4 + (e - t) / a, o /= 6, o < 0 && (o += 1), {
                h: 360 * o,
                s: i,
                v: s / 255
            })
        },
        rgb_to_hex: function(e, t, n) {
            var o = this.hex_with_component(0, 2, e);
            return o = this.hex_with_component(o, 1, t), o = this.hex_with_component(o, 0, n)
        },
        component_from_hex: function(e, t) {
            return e >> 8 * t & 255
        },
        hex_with_component: function(t, n, o) {
            return o << (e = 8 * n) | t & ~(255 << e)
        }
    }
}(), dat.color.toString, dat.utils.common), dat.color.interpret, dat.utils.common), dat.utils.requestAnimationFrame = function() {
    return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e, t) {
        window.setTimeout(e, 1e3 / 60)
    }
}(), dat.dom.CenteredDiv = function(e, t) {
    var n = function() {
        this.backgroundElement = document.createElement("div"), t.extend(this.backgroundElement.style, {
            backgroundColor: "rgba(0,0,0,0.8)",
            top: 0,
            left: 0,
            display: "none",
            zIndex: "1000",
            opacity: 0,
            WebkitTransition: "opacity 0.2s linear"
        }), e.makeFullscreen(this.backgroundElement), this.backgroundElement.style.position = "fixed", this.domElement = document.createElement("div"), t.extend(this.domElement.style, {
            position: "fixed",
            display: "none",
            zIndex: "1001",
            opacity: 0,
            WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear"
        }), document.body.appendChild(this.backgroundElement), document.body.appendChild(this.domElement);
        var n = this;
        e.bind(this.backgroundElement, "click", function() {
            n.hide()
        })
    };
    return n.prototype.show = function() {
        var e = this;
        this.backgroundElement.style.display = "block", this.domElement.style.display = "block", this.domElement.style.opacity = 0, this.domElement.style.webkitTransform = "scale(1.1)", this.layout(), t.defer(function() {
            e.backgroundElement.style.opacity = 1, e.domElement.style.opacity = 1, e.domElement.style.webkitTransform = "scale(1)"
        })
    }, n.prototype.hide = function() {
        var t = this,
            n = function() {
                t.domElement.style.display = "none", t.backgroundElement.style.display = "none", e.unbind(t.domElement, "webkitTransitionEnd", n), e.unbind(t.domElement, "transitionend", n), e.unbind(t.domElement, "oTransitionEnd", n)
            };
        e.bind(this.domElement, "webkitTransitionEnd", n), e.bind(this.domElement, "transitionend", n), e.bind(this.domElement, "oTransitionEnd", n), this.backgroundElement.style.opacity = 0, this.domElement.style.opacity = 0, this.domElement.style.webkitTransform = "scale(1.1)"
    }, n.prototype.layout = function() {
        this.domElement.style.left = window.innerWidth / 2 - e.getWidth(this.domElement) / 2 + "px", this.domElement.style.top = window.innerHeight / 2 - e.getHeight(this.domElement) / 2 + "px"
    }, n
}(dat.dom.dom, dat.utils.common), dat.dom.dom, dat.utils.common);
var Delaunay;
! function() {
    "use strict";

    function r(r) {
        var n, e, t, u, l, i, a = Number.POSITIVE_INFINITY,
            f = Number.POSITIVE_INFINITY,
            o = Number.NEGATIVE_INFINITY,
            h = Number.NEGATIVE_INFINITY;
        for (n = r.length; n--;) r[n][0] < a && (a = r[n][0]), r[n][0] > o && (o = r[n][0]), r[n][1] < f && (f = r[n][1]), r[n][1] > h && (h = r[n][1]);
        return e = o - a, t = h - f, u = Math.max(e, t), l = a + .5 * e, i = f + .5 * t, [
            [l - 20 * u, i - u],
            [l, i + 20 * u],
            [l + 20 * u, i - u]
        ]
    }

    function n(r, n, e, u) {
        var l, i, a, f, o, h, s, I, c, N, p = r[n][0],
            g = r[n][1],
            v = r[e][0],
            T = r[e][1],
            b = r[u][0],
            m = r[u][1],
            y = Math.abs(g - T),
            k = Math.abs(T - m);
        return y < t ? (f = -((b - v) / (m - T)), h = (v + b) / 2, I = (T + m) / 2, l = (v + p) / 2, i = f * (l - h) + I) : k < t ? (a = -((v - p) / (T - g)), o = (p + v) / 2, s = (g + T) / 2, l = (b + v) / 2, i = a * (l - o) + s) : (a = -((v - p) / (T - g)), f = -((b - v) / (m - T)), o = (p + v) / 2, h = (v + b) / 2, s = (g + T) / 2, I = (T + m) / 2, l = (a * o - f * h + I - s) / (a - f), i = y > k ? a * (l - o) + s : f * (l - h) + I), c = v - l, N = T - i, {
            i: n,
            j: e,
            k: u,
            x: l,
            y: i,
            r: c * c + N * N
        }
    }

    function e(r) {
        var n, e, t, u, l, i;
        for (e = r.length; e;)
            for (u = r[--e], t = r[--e], n = e; n;)
                if (i = r[--n], l = r[--n], t === l && u === i || t === i && u === l) {
                    r.splice(e, 2), r.splice(n, 2);
                    break
                }
    }
    var t = 1 / 1048576;
    Delaunay = {
        triangulate: function(u, l) {
            var i, a, f, o, h, s, I, c, N, p, g, v, T = u.length;
            if (T < 3) return [];
            if (u = u.slice(0), l)
                for (i = T; i--;) u[i] = u[i][l];
            for (f = new Array(T), i = T; i--;) f[i] = i;
            for (f.sort(function(r, n) {
                    return u[n][0] - u[r][0]
                }), o = r(u), u.push(o[0], o[1], o[2]), h = [n(u, T + 0, T + 1, T + 2)], s = [], I = [], i = f.length; i--; I.length = 0) {
                for (v = f[i], a = h.length; a--;) c = u[v][0] - h[a].x, c > 0 && c * c > h[a].r ? (s.push(h[a]), h.splice(a, 1)) : (N = u[v][1] - h[a].y, c * c + N * N - h[a].r > t || (I.push(h[a].i, h[a].j, h[a].j, h[a].k, h[a].k, h[a].i), h.splice(a, 1)));
                for (e(I), a = I.length; a;) g = I[--a], p = I[--a], h.push(n(u, p, g, v))
            }
            for (i = h.length; i--;) s.push(h[i]);
            for (h.length = 0, i = s.length; i--;) s[i].i < T && s[i].j < T && s[i].k < T && h.push(s[i].i, s[i].j, s[i].k);
            return h
        },
        contains: function(r, n) {
            if (n[0] < r[0][0] && n[0] < r[1][0] && n[0] < r[2][0] || n[0] > r[0][0] && n[0] > r[1][0] && n[0] > r[2][0] || n[1] < r[0][1] && n[1] < r[1][1] && n[1] < r[2][1] || n[1] > r[0][1] && n[1] > r[1][1] && n[1] > r[2][1]) return null;
            var e = r[1][0] - r[0][0],
                t = r[2][0] - r[0][0],
                u = r[1][1] - r[0][1],
                l = r[2][1] - r[0][1],
                i = e * l - t * u;
            if (0 === i) return null;
            var a = (l * (n[0] - r[0][0]) - t * (n[1] - r[0][1])) / i,
                f = (e * (n[1] - r[0][1]) - u * (n[0] - r[0][0])) / i;
            return a < 0 || f < 0 || a + f > 1 ? null : [a, f]
        }
    }, "undefined" != typeof module && (module.exports = Delaunay)
}();
var Stats = function() {
    function e(e, n, t) {
        return e = document.createElement(e), e.id = n, e.style.cssText = t, e
    }

    function n(n, t, i) {
        var r = e("div", n, "padding:0 0 3px 3px;text-align:left;background:" + i),
            a = e("div", n + "Text", "font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px;color:" + t);
        for (a.innerHTML = n.toUpperCase(), r.appendChild(a), n = e("div", n + "Graph", "width:74px;height:30px;background:" + t), r.appendChild(n), t = 0; 74 > t; t++) n.appendChild(e("span", "", "width:1px;height:30px;float:left;opacity:0.9;background:" + i));
        return r
    }

    function t(e) {
        for (var n = h.children, t = 0; t < n.length; t++) n[t].style.display = t === e ? "block" : "none";
        p = e
    }

    function i(e, n) {
        e.appendChild(e.firstChild).style.height = Math.min(30, 30 - 30 * n) + "px"
    }
    var r = performance && performance.now ? performance.now.bind(performance) : Date.now,
        a = r(),
        o = a,
        d = 0,
        p = 0,
        h = e("div", "stats", "width:80px;opacity:0.9;cursor:pointer");
    h.addEventListener("mousedown", function(e) {
        e.preventDefault(), t(++p % h.children.length)
    }, !1);
    var c = 0,
        l = 1 / 0,
        f = 0,
        m = n("fps", "#0ff", "#002"),
        s = m.children[0],
        u = m.children[1];
    h.appendChild(m);
    var x = 0,
        v = 1 / 0,
        g = 0,
        m = n("ms", "#0f0", "#020"),
        M = m.children[0],
        C = m.children[1];
    if (h.appendChild(m), performance && performance.memory) {
        var y = 0,
            b = 1 / 0,
            w = 0,
            m = n("mb", "#f08", "#201"),
            S = m.children[0],
            k = m.children[1];
        h.appendChild(m)
    }
    return t(p), {
        REVISION: 14,
        domElement: h,
        setMode: t,
        begin: function() {
            a = r()
        },
        end: function() {
            var e = r();
            if (x = e - a, v = Math.min(v, x), g = Math.max(g, x), M.textContent = (0 | x) + " MS (" + (0 | v) + "-" + (0 | g) + ")", i(C, x / 200), d++, e > o + 1e3 && (c = Math.round(1e3 * d / (e - o)), l = Math.min(l, c), f = Math.max(f, c), s.textContent = c + " FPS (" + l + "-" + f + ")", i(u, c / 100), o = e, d = 0, void 0 !== y)) {
                var n = performance.memory.usedJSHeapSize,
                    t = performance.memory.jsHeapSizeLimit;
                y = Math.round(9.54e-7 * n), b = Math.min(b, y), w = Math.max(w, y), S.textContent = y + " MB (" + b + "-" + w + ")", i(k, n / t)
            }
            return e
        },
        update: function() {
            a = this.end()
        }
    }
};
"object" == typeof module && (module.exports = Stats);
var THREE = {
    REVISION: "71"
};
"object" == typeof module && (module.exports = THREE), void 0 === Math.sign && (Math.sign = function(t) {
        return t < 0 ? -1 : t > 0 ? 1 : +t
    }), THREE.log = function() {
        console.log.apply(console, arguments)
    }, THREE.warn = function() {
        console.warn.apply(console, arguments)
    }, THREE.error = function() {
        console.error.apply(console, arguments)
    }, THREE.MOUSE = {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2
    }, THREE.CullFaceNone = 0, THREE.CullFaceBack = 1, THREE.CullFaceFront = 2, THREE.CullFaceFrontBack = 3, THREE.FrontFaceDirectionCW = 0, THREE.FrontFaceDirectionCCW = 1, THREE.BasicShadowMap = 0, THREE.PCFShadowMap = 1, THREE.PCFSoftShadowMap = 2, THREE.FrontSide = 0, THREE.BackSide = 1, THREE.DoubleSide = 2, THREE.NoShading = 0, THREE.FlatShading = 1, THREE.SmoothShading = 2, THREE.NoColors = 0, THREE.FaceColors = 1, THREE.VertexColors = 2, THREE.NoBlending = 0, THREE.NormalBlending = 1, THREE.AdditiveBlending = 2, THREE.SubtractiveBlending = 3, THREE.MultiplyBlending = 4, THREE.CustomBlending = 5, THREE.AddEquation = 100, THREE.SubtractEquation = 101, THREE.ReverseSubtractEquation = 102, THREE.MinEquation = 103, THREE.MaxEquation = 104, THREE.ZeroFactor = 200, THREE.OneFactor = 201, THREE.SrcColorFactor = 202, THREE.OneMinusSrcColorFactor = 203, THREE.SrcAlphaFactor = 204, THREE.OneMinusSrcAlphaFactor = 205, THREE.DstAlphaFactor = 206, THREE.OneMinusDstAlphaFactor = 207, THREE.DstColorFactor = 208, THREE.OneMinusDstColorFactor = 209, THREE.SrcAlphaSaturateFactor = 210, THREE.MultiplyOperation = 0, THREE.MixOperation = 1, THREE.AddOperation = 2, THREE.UVMapping = 300, THREE.CubeReflectionMapping = 301, THREE.CubeRefractionMapping = 302, THREE.EquirectangularReflectionMapping = 303, THREE.EquirectangularRefractionMapping = 304, THREE.SphericalReflectionMapping = 305, THREE.RepeatWrapping = 1e3, THREE.ClampToEdgeWrapping = 1001, THREE.MirroredRepeatWrapping = 1002, THREE.NearestFilter = 1003, THREE.NearestMipMapNearestFilter = 1004, THREE.NearestMipMapLinearFilter = 1005, THREE.LinearFilter = 1006, THREE.LinearMipMapNearestFilter = 1007, THREE.LinearMipMapLinearFilter = 1008, THREE.UnsignedByteType = 1009, THREE.ByteType = 1010, THREE.ShortType = 1011, THREE.UnsignedShortType = 1012, THREE.IntType = 1013, THREE.UnsignedIntType = 1014, THREE.FloatType = 1015, THREE.HalfFloatType = 1025, THREE.UnsignedShort4444Type = 1016, THREE.UnsignedShort5551Type = 1017, THREE.UnsignedShort565Type = 1018, THREE.AlphaFormat = 1019, THREE.RGBFormat = 1020, THREE.RGBAFormat = 1021, THREE.LuminanceFormat = 1022, THREE.LuminanceAlphaFormat = 1023, THREE.RGBEFormat = THREE.RGBAFormat, THREE.RGB_S3TC_DXT1_Format = 2001, THREE.RGBA_S3TC_DXT1_Format = 2002, THREE.RGBA_S3TC_DXT3_Format = 2003, THREE.RGBA_S3TC_DXT5_Format = 2004, THREE.RGB_PVRTC_4BPPV1_Format = 2100, THREE.RGB_PVRTC_2BPPV1_Format = 2101, THREE.RGBA_PVRTC_4BPPV1_Format = 2102, THREE.RGBA_PVRTC_2BPPV1_Format = 2103, THREE.Projector = function() {
        THREE.error("THREE.Projector has been moved to /examples/js/renderers/Projector.js."), this.projectVector = function(t, e) {
            THREE.warn("THREE.Projector: .projectVector() is now vector.project()."), t.project(e)
        }, this.unprojectVector = function(t, e) {
            THREE.warn("THREE.Projector: .unprojectVector() is now vector.unproject()."), t.unproject(e)
        }, this.pickingRay = function(t, e) {
            THREE.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().")
        }
    }, THREE.CanvasRenderer = function() {
        THREE.error("THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js"), this.domElement = document.createElement("canvas"), this.clear = function() {}, this.render = function() {}, this.setClearColor = function() {}, this.setSize = function() {}
    }, THREE.Color = function(t) {
        return 3 === arguments.length ? this.setRGB(arguments[0], arguments[1], arguments[2]) : this.set(t)
    }, THREE.Color.prototype = {
        constructor: THREE.Color,
        r: 1,
        g: 1,
        b: 1,
        set: function(t) {
            return t instanceof THREE.Color ? this.copy(t) : "number" == typeof t ? this.setHex(t) : "string" == typeof t && this.setStyle(t), this
        },
        setHex: function(t) {
            return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (255 & t) / 255, this
        },
        setRGB: function(t, e, r) {
            return this.r = t, this.g = e, this.b = r, this
        },
        setHSL: function(t, e, r) {
            if (0 === e) this.r = this.g = this.b = r;
            else {
                var i = function(t, e, r) {
                        return r < 0 && (r += 1), r > 1 && (r -= 1), r < 1 / 6 ? t + 6 * (e - t) * r : r < .5 ? e : r < 2 / 3 ? t + 6 * (e - t) * (2 / 3 - r) : t
                    },
                    n = r <= .5 ? r * (1 + e) : r + e - r * e,
                    a = 2 * r - n;
                this.r = i(a, n, t + 1 / 3), this.g = i(a, n, t), this.b = i(a, n, t - 1 / 3)
            }
            return this
        },
        setStyle: function(t) {
            if (/^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.test(t)) {
                var e = /^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.exec(t);
                return this.r = Math.min(255, parseInt(e[1], 10)) / 255, this.g = Math.min(255, parseInt(e[2], 10)) / 255, this.b = Math.min(255, parseInt(e[3], 10)) / 255, this
            }
            if (/^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.test(t)) {
                var e = /^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.exec(t);
                return this.r = Math.min(100, parseInt(e[1], 10)) / 100, this.g = Math.min(100, parseInt(e[2], 10)) / 100, this.b = Math.min(100, parseInt(e[3], 10)) / 100, this
            }
            if (/^\#([0-9a-f]{6})$/i.test(t)) {
                var e = /^\#([0-9a-f]{6})$/i.exec(t);
                return this.setHex(parseInt(e[1], 16)), this
            }
            if (/^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(t)) {
                var e = /^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(t);
                return this.setHex(parseInt(e[1] + e[1] + e[2] + e[2] + e[3] + e[3], 16)), this
            }
            if (/^(\w+)$/i.test(t)) return this.setHex(THREE.ColorKeywords[t]), this
        },
        copy: function(t) {
            return this.r = t.r, this.g = t.g, this.b = t.b, this
        },
        copyGammaToLinear: function(t, e) {
            return void 0 === e && (e = 2), this.r = Math.pow(t.r, e), this.g = Math.pow(t.g, e), this.b = Math.pow(t.b, e), this
        },
        copyLinearToGamma: function(t, e) {
            void 0 === e && (e = 2);
            var r = e > 0 ? 1 / e : 1;
            return this.r = Math.pow(t.r, r), this.g = Math.pow(t.g, r), this.b = Math.pow(t.b, r), this
        },
        convertGammaToLinear: function() {
            var t = this.r,
                e = this.g,
                r = this.b;
            return this.r = t * t, this.g = e * e, this.b = r * r, this
        },
        convertLinearToGamma: function() {
            return this.r = Math.sqrt(this.r), this.g = Math.sqrt(this.g), this.b = Math.sqrt(this.b), this
        },
        getHex: function() {
            return 255 * this.r << 16 ^ 255 * this.g << 8 ^ 255 * this.b << 0
        },
        getHexString: function() {
            return ("000000" + this.getHex().toString(16)).slice(-6)
        },
        getHSL: function(t) {
            var e, r, i = t || {
                    h: 0,
                    s: 0,
                    l: 0
                },
                n = this.r,
                a = this.g,
                o = this.b,
                s = Math.max(n, a, o),
                h = Math.min(n, a, o),
                l = (h + s) / 2;
            if (h === s) e = 0, r = 0;
            else {
                var c = s - h;
                switch (r = l <= .5 ? c / (s + h) : c / (2 - s - h), s) {
                    case n:
                        e = (a - o) / c + (a < o ? 6 : 0);
                        break;
                    case a:
                        e = (o - n) / c + 2;
                        break;
                    case o:
                        e = (n - a) / c + 4
                }
                e /= 6
            }
            return i.h = e, i.s = r, i.l = l, i
        },
        getStyle: function() {
            return "rgb(" + (255 * this.r | 0) + "," + (255 * this.g | 0) + "," + (255 * this.b | 0) + ")"
        },
        offsetHSL: function(t, e, r) {
            var i = this.getHSL();
            return i.h += t, i.s += e, i.l += r, this.setHSL(i.h, i.s, i.l), this
        },
        add: function(t) {
            return this.r += t.r, this.g += t.g, this.b += t.b, this
        },
        addColors: function(t, e) {
            return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this
        },
        addScalar: function(t) {
            return this.r += t, this.g += t, this.b += t, this
        },
        multiply: function(t) {
            return this.r *= t.r, this.g *= t.g, this.b *= t.b, this
        },
        multiplyScalar: function(t) {
            return this.r *= t, this.g *= t, this.b *= t, this
        },
        lerp: function(t, e) {
            return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, this
        },
        equals: function(t) {
            return t.r === this.r && t.g === this.g && t.b === this.b
        },
        fromArray: function(t) {
            return this.r = t[0], this.g = t[1], this.b = t[2], this
        },
        toArray: function(t, e) {
            return void 0 === t && (t = []), void 0 === e && (e = 0), t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t
        },
        clone: function() {
            return (new THREE.Color).setRGB(this.r, this.g, this.b)
        }
    }, THREE.ColorKeywords = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
    }, THREE.Quaternion = function(t, e, r, i) {
        this._x = t || 0, this._y = e || 0, this._z = r || 0, this._w = void 0 !== i ? i : 1
    }, THREE.Quaternion.prototype = {
        constructor: THREE.Quaternion,
        _x: 0,
        _y: 0,
        _z: 0,
        _w: 0,
        get x() {
            return this._x
        },
        set x(t) {
            this._x = t, this.onChangeCallback()
        },
        get y() {
            return this._y
        },
        set y(t) {
            this._y = t, this.onChangeCallback()
        },
        get z() {
            return this._z
        },
        set z(t) {
            this._z = t, this.onChangeCallback()
        },
        get w() {
            return this._w
        },
        set w(t) {
            this._w = t, this.onChangeCallback()
        },
        set: function(t, e, r, i) {
            return this._x = t, this._y = e, this._z = r, this._w = i, this.onChangeCallback(), this
        },
        copy: function(t) {
            return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this.onChangeCallback(), this
        },
        setFromEuler: function(t, e) {
            if (t instanceof THREE.Euler == !1) throw new Error("THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
            var r = Math.cos(t._x / 2),
                i = Math.cos(t._y / 2),
                n = Math.cos(t._z / 2),
                a = Math.sin(t._x / 2),
                o = Math.sin(t._y / 2),
                s = Math.sin(t._z / 2);
            return "XYZ" === t.order ? (this._x = a * i * n + r * o * s, this._y = r * o * n - a * i * s, this._z = r * i * s + a * o * n, this._w = r * i * n - a * o * s) : "YXZ" === t.order ? (this._x = a * i * n + r * o * s, this._y = r * o * n - a * i * s, this._z = r * i * s - a * o * n, this._w = r * i * n + a * o * s) : "ZXY" === t.order ? (this._x = a * i * n - r * o * s, this._y = r * o * n + a * i * s, this._z = r * i * s + a * o * n, this._w = r * i * n - a * o * s) : "ZYX" === t.order ? (this._x = a * i * n - r * o * s, this._y = r * o * n + a * i * s, this._z = r * i * s - a * o * n, this._w = r * i * n + a * o * s) : "YZX" === t.order ? (this._x = a * i * n + r * o * s, this._y = r * o * n + a * i * s, this._z = r * i * s - a * o * n, this._w = r * i * n - a * o * s) : "XZY" === t.order && (this._x = a * i * n - r * o * s, this._y = r * o * n - a * i * s, this._z = r * i * s + a * o * n, this._w = r * i * n + a * o * s), e !== !1 && this.onChangeCallback(), this
        },
        setFromAxisAngle: function(t, e) {
            var r = e / 2,
                i = Math.sin(r);
            return this._x = t.x * i, this._y = t.y * i, this._z = t.z * i, this._w = Math.cos(r), this.onChangeCallback(), this
        },
        setFromRotationMatrix: function(t) {
            var e, r = t.elements,
                i = r[0],
                n = r[4],
                a = r[8],
                o = r[1],
                s = r[5],
                h = r[9],
                l = r[2],
                c = r[6],
                u = r[10],
                E = i + s + u;
            return E > 0 ? (e = .5 / Math.sqrt(E + 1), this._w = .25 / e, this._x = (c - h) * e, this._y = (a - l) * e, this._z = (o - n) * e) : i > s && i > u ? (e = 2 * Math.sqrt(1 + i - s - u), this._w = (c - h) / e, this._x = .25 * e, this._y = (n + o) / e, this._z = (a + l) / e) : s > u ? (e = 2 * Math.sqrt(1 + s - i - u), this._w = (a - l) / e, this._x = (n + o) / e, this._y = .25 * e, this._z = (h + c) / e) : (e = 2 * Math.sqrt(1 + u - i - s), this._w = (o - n) / e, this._x = (a + l) / e, this._y = (h + c) / e, this._z = .25 * e), this.onChangeCallback(), this
        },
        setFromUnitVectors: function() {
            var t, e, r = 1e-6;
            return function(i, n) {
                return void 0 === t && (t = new THREE.Vector3), e = i.dot(n) + 1, e < r ? (e = 0, Math.abs(i.x) > Math.abs(i.z) ? t.set(-i.y, i.x, 0) : t.set(0, -i.z, i.y)) : t.crossVectors(i, n), this._x = t.x, this._y = t.y, this._z = t.z, this._w = e, this.normalize(), this
            }
        }(),
        inverse: function() {
            return this.conjugate().normalize(), this
        },
        conjugate: function() {
            return this._x *= -1, this._y *= -1, this._z *= -1, this.onChangeCallback(), this
        },
        dot: function(t) {
            return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w
        },
        lengthSq: function() {
            return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
        },
        length: function() {
            return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
        },
        normalize: function() {
            var t = this.length();
            return 0 === t ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), this.onChangeCallback(), this
        },
        multiply: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."), this.multiplyQuaternions(t, e)) : this.multiplyQuaternions(this, t)
        },
        multiplyQuaternions: function(t, e) {
            var r = t._x,
                i = t._y,
                n = t._z,
                a = t._w,
                o = e._x,
                s = e._y,
                h = e._z,
                l = e._w;
            return this._x = r * l + a * o + i * h - n * s, this._y = i * l + a * s + n * o - r * h, this._z = n * l + a * h + r * s - i * o, this._w = a * l - r * o - i * s - n * h, this.onChangeCallback(), this
        },
        multiplyVector3: function(t) {
            return THREE.warn("THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead."), t.applyQuaternion(this)
        },
        slerp: function(t, e) {
            if (0 === e) return this;
            if (1 === e) return this.copy(t);
            var r = this._x,
                i = this._y,
                n = this._z,
                a = this._w,
                o = a * t._w + r * t._x + i * t._y + n * t._z;
            if (o < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, o = -o) : this.copy(t), o >= 1) return this._w = a, this._x = r, this._y = i, this._z = n, this;
            var s = Math.acos(o),
                h = Math.sqrt(1 - o * o);
            if (Math.abs(h) < .001) return this._w = .5 * (a + this._w), this._x = .5 * (r + this._x), this._y = .5 * (i + this._y), this._z = .5 * (n + this._z), this;
            var l = Math.sin((1 - e) * s) / h,
                c = Math.sin(e * s) / h;
            return this._w = a * l + this._w * c, this._x = r * l + this._x * c, this._y = i * l + this._y * c, this._z = n * l + this._z * c, this.onChangeCallback(), this
        },
        equals: function(t) {
            return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w
        },
        fromArray: function(t, e) {
            return void 0 === e && (e = 0), this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], this.onChangeCallback(), this
        },
        toArray: function(t, e) {
            return void 0 === t && (t = []), void 0 === e && (e = 0), t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, t
        },
        onChange: function(t) {
            return this.onChangeCallback = t, this
        },
        onChangeCallback: function() {},
        clone: function() {
            return new THREE.Quaternion(this._x, this._y, this._z, this._w)
        }
    }, THREE.Quaternion.slerp = function(t, e, r, i) {
        return r.copy(t).slerp(e, i)
    }, THREE.Vector2 = function(t, e) {
        this.x = t || 0, this.y = e || 0
    }, THREE.Vector2.prototype = {
        constructor: THREE.Vector2,
        set: function(t, e) {
            return this.x = t, this.y = e, this
        },
        setX: function(t) {
            return this.x = t, this
        },
        setY: function(t) {
            return this.y = t, this
        },
        setComponent: function(t, e) {
            switch (t) {
                case 0:
                    this.x = e;
                    break;
                case 1:
                    this.y = e;
                    break;
                default:
                    throw new Error("index is out of range: " + t)
            }
        },
        getComponent: function(t) {
            switch (t) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                default:
                    throw new Error("index is out of range: " + t)
            }
        },
        copy: function(t) {
            return this.x = t.x, this.y = t.y, this
        },
        add: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(t, e)) : (this.x += t.x, this.y += t.y, this)
        },
        addScalar: function(t) {
            return this.x += t, this.y += t, this
        },
        addVectors: function(t, e) {
            return this.x = t.x + e.x, this.y = t.y + e.y, this
        },
        sub: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(t, e)) : (this.x -= t.x, this.y -= t.y, this)
        },
        subScalar: function(t) {
            return this.x -= t, this.y -= t, this
        },
        subVectors: function(t, e) {
            return this.x = t.x - e.x, this.y = t.y - e.y, this
        },
        multiply: function(t) {
            return this.x *= t.x, this.y *= t.y, this
        },
        multiplyScalar: function(t) {
            return this.x *= t, this.y *= t, this
        },
        divide: function(t) {
            return this.x /= t.x, this.y /= t.y, this
        },
        divideScalar: function(t) {
            if (0 !== t) {
                var e = 1 / t;
                this.x *= e, this.y *= e
            } else this.x = 0, this.y = 0;
            return this
        },
        min: function(t) {
            return this.x > t.x && (this.x = t.x), this.y > t.y && (this.y = t.y), this
        },
        max: function(t) {
            return this.x < t.x && (this.x = t.x), this.y < t.y && (this.y = t.y), this
        },
        clamp: function(t, e) {
            return this.x < t.x ? this.x = t.x : this.x > e.x && (this.x = e.x), this.y < t.y ? this.y = t.y : this.y > e.y && (this.y = e.y), this
        },
        clampScalar: function() {
            var t, e;
            return function(r, i) {
                return void 0 === t && (t = new THREE.Vector2, e = new THREE.Vector2), t.set(r, r), e.set(i, i), this.clamp(t, e)
            }
        }(),
        floor: function() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
        },
        ceil: function() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
        },
        round: function() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this
        },
        roundToZero: function() {
            return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this
        },
        negate: function() {
            return this.x = -this.x, this.y = -this.y, this
        },
        dot: function(t) {
            return this.x * t.x + this.y * t.y
        },
        lengthSq: function() {
            return this.x * this.x + this.y * this.y
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y)
        },
        normalize: function() {
            return this.divideScalar(this.length())
        },
        distanceTo: function(t) {
            return Math.sqrt(this.distanceToSquared(t))
        },
        distanceToSquared: function(t) {
            var e = this.x - t.x,
                r = this.y - t.y;
            return e * e + r * r
        },
        setLength: function(t) {
            var e = this.length();
            return 0 !== e && t !== e && this.multiplyScalar(t / e), this
        },
        lerp: function(t, e) {
            return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this
        },
        lerpVectors: function(t, e, r) {
            return this.subVectors(e, t).multiplyScalar(r).add(t), this
        },
        equals: function(t) {
            return t.x === this.x && t.y === this.y
        },
        fromArray: function(t, e) {
            return void 0 === e && (e = 0), this.x = t[e], this.y = t[e + 1], this
        },
        toArray: function(t, e) {
            return void 0 === t && (t = []), void 0 === e && (e = 0), t[e] = this.x, t[e + 1] = this.y, t
        },
        fromAttribute: function(t, e, r) {
            return void 0 === r && (r = 0), e = e * t.itemSize + r, this.x = t.array[e], this.y = t.array[e + 1], this
        },
        clone: function() {
            return new THREE.Vector2(this.x, this.y)
        }
    }, THREE.Vector3 = function(t, e, r) {
        this.x = t || 0, this.y = e || 0, this.z = r || 0
    }, THREE.Vector3.prototype = {
        constructor: THREE.Vector3,
        set: function(t, e, r) {
            return this.x = t, this.y = e, this.z = r, this
        },
        setX: function(t) {
            return this.x = t, this
        },
        setY: function(t) {
            return this.y = t, this
        },
        setZ: function(t) {
            return this.z = t, this
        },
        setComponent: function(t, e) {
            switch (t) {
                case 0:
                    this.x = e;
                    break;
                case 1:
                    this.y = e;
                    break;
                case 2:
                    this.z = e;
                    break;
                default:
                    throw new Error("index is out of range: " + t)
            }
        },
        getComponent: function(t) {
            switch (t) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                case 2:
                    return this.z;
                default:
                    throw new Error("index is out of range: " + t)
            }
        },
        copy: function(t) {
            return this.x = t.x, this.y = t.y, this.z = t.z, this
        },
        add: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(t, e)) : (this.x += t.x, this.y += t.y, this.z += t.z, this)
        },
        addScalar: function(t) {
            return this.x += t, this.y += t, this.z += t, this
        },
        addVectors: function(t, e) {
            return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this
        },
        sub: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(t, e)) : (this.x -= t.x, this.y -= t.y, this.z -= t.z, this)
        },
        subScalar: function(t) {
            return this.x -= t, this.y -= t, this.z -= t, this
        },
        subVectors: function(t, e) {
            return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this
        },
        multiply: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."), this.multiplyVectors(t, e)) : (this.x *= t.x, this.y *= t.y, this.z *= t.z, this)
        },
        multiplyScalar: function(t) {
            return this.x *= t, this.y *= t, this.z *= t, this
        },
        multiplyVectors: function(t, e) {
            return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this
        },
        applyEuler: function() {
            var t;
            return function(e) {
                return e instanceof THREE.Euler == !1 && THREE.error("THREE.Vector3: .applyEuler() now expects a Euler rotation rather than a Vector3 and order."), void 0 === t && (t = new THREE.Quaternion), this.applyQuaternion(t.setFromEuler(e)), this
            }
        }(),
        applyAxisAngle: function() {
            var t;
            return function(e, r) {
                return void 0 === t && (t = new THREE.Quaternion), this.applyQuaternion(t.setFromAxisAngle(e, r)), this
            }
        }(),
        applyMatrix3: function(t) {
            var e = this.x,
                r = this.y,
                i = this.z,
                n = t.elements;
            return this.x = n[0] * e + n[3] * r + n[6] * i, this.y = n[1] * e + n[4] * r + n[7] * i, this.z = n[2] * e + n[5] * r + n[8] * i, this
        },
        applyMatrix4: function(t) {
            var e = this.x,
                r = this.y,
                i = this.z,
                n = t.elements;
            return this.x = n[0] * e + n[4] * r + n[8] * i + n[12], this.y = n[1] * e + n[5] * r + n[9] * i + n[13], this.z = n[2] * e + n[6] * r + n[10] * i + n[14], this
        },
        applyProjection: function(t) {
            var e = this.x,
                r = this.y,
                i = this.z,
                n = t.elements,
                a = 1 / (n[3] * e + n[7] * r + n[11] * i + n[15]);
            return this.x = (n[0] * e + n[4] * r + n[8] * i + n[12]) * a, this.y = (n[1] * e + n[5] * r + n[9] * i + n[13]) * a, this.z = (n[2] * e + n[6] * r + n[10] * i + n[14]) * a, this
        },
        applyQuaternion: function(t) {
            var e = this.x,
                r = this.y,
                i = this.z,
                n = t.x,
                a = t.y,
                o = t.z,
                s = t.w,
                h = s * e + a * i - o * r,
                l = s * r + o * e - n * i,
                c = s * i + n * r - a * e,
                u = -n * e - a * r - o * i;
            return this.x = h * s + u * -n + l * -o - c * -a, this.y = l * s + u * -a + c * -n - h * -o, this.z = c * s + u * -o + h * -a - l * -n, this
        },
        project: function() {
            var t;
            return function(e) {
                return void 0 === t && (t = new THREE.Matrix4), t.multiplyMatrices(e.projectionMatrix, t.getInverse(e.matrixWorld)), this.applyProjection(t)
            }
        }(),
        unproject: function() {
            var t;
            return function(e) {
                return void 0 === t && (t = new THREE.Matrix4), t.multiplyMatrices(e.matrixWorld, t.getInverse(e.projectionMatrix)), this.applyProjection(t)
            }
        }(),
        transformDirection: function(t) {
            var e = this.x,
                r = this.y,
                i = this.z,
                n = t.elements;
            return this.x = n[0] * e + n[4] * r + n[8] * i, this.y = n[1] * e + n[5] * r + n[9] * i, this.z = n[2] * e + n[6] * r + n[10] * i, this.normalize(), this
        },
        divide: function(t) {
            return this.x /= t.x, this.y /= t.y, this.z /= t.z, this
        },
        divideScalar: function(t) {
            if (0 !== t) {
                var e = 1 / t;
                this.x *= e, this.y *= e, this.z *= e
            } else this.x = 0, this.y = 0, this.z = 0;
            return this
        },
        min: function(t) {
            return this.x > t.x && (this.x = t.x), this.y > t.y && (this.y = t.y), this.z > t.z && (this.z = t.z), this
        },
        max: function(t) {
            return this.x < t.x && (this.x = t.x), this.y < t.y && (this.y = t.y), this.z < t.z && (this.z = t.z), this
        },
        clamp: function(t, e) {
            return this.x < t.x ? this.x = t.x : this.x > e.x && (this.x = e.x), this.y < t.y ? this.y = t.y : this.y > e.y && (this.y = e.y), this.z < t.z ? this.z = t.z : this.z > e.z && (this.z = e.z), this
        },
        clampScalar: function() {
            var t, e;
            return function(r, i) {
                return void 0 === t && (t = new THREE.Vector3, e = new THREE.Vector3), t.set(r, r, r), e.set(i, i, i), this.clamp(t, e)
            }
        }(),
        floor: function() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this
        },
        ceil: function() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this
        },
        round: function() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this
        },
        roundToZero: function() {
            return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this
        },
        negate: function() {
            return this.x = -this.x, this.y = -this.y, this.z = -this.z, this
        },
        dot: function(t) {
            return this.x * t.x + this.y * t.y + this.z * t.z
        },
        lengthSq: function() {
            return this.x * this.x + this.y * this.y + this.z * this.z
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        },
        lengthManhattan: function() {
            return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
        },
        normalize: function() {
            return this.divideScalar(this.length())
        },
        setLength: function(t) {
            var e = this.length();
            return 0 !== e && t !== e && this.multiplyScalar(t / e), this
        },
        lerp: function(t, e) {
            return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this
        },
        lerpVectors: function(t, e, r) {
            return this.subVectors(e, t).multiplyScalar(r).add(t), this
        },
        cross: function(t, e) {
            if (void 0 !== e) return THREE.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."), this.crossVectors(t, e);
            var r = this.x,
                i = this.y,
                n = this.z;
            return this.x = i * t.z - n * t.y, this.y = n * t.x - r * t.z, this.z = r * t.y - i * t.x, this
        },
        crossVectors: function(t, e) {
            var r = t.x,
                i = t.y,
                n = t.z,
                a = e.x,
                o = e.y,
                s = e.z;
            return this.x = i * s - n * o, this.y = n * a - r * s, this.z = r * o - i * a, this
        },
        projectOnVector: function() {
            var t, e;
            return function(r) {
                return void 0 === t && (t = new THREE.Vector3), t.copy(r).normalize(), e = this.dot(t), this.copy(t).multiplyScalar(e)
            }
        }(),
        projectOnPlane: function() {
            var t;
            return function(e) {
                return void 0 === t && (t = new THREE.Vector3), t.copy(this).projectOnVector(e), this.sub(t)
            }
        }(),
        reflect: function() {
            var t;
            return function(e) {
                return void 0 === t && (t = new THREE.Vector3), this.sub(t.copy(e).multiplyScalar(2 * this.dot(e)))
            }
        }(),
        angleTo: function(t) {
            var e = this.dot(t) / (this.length() * t.length());
            return Math.acos(THREE.Math.clamp(e, -1, 1))
        },
        distanceTo: function(t) {
            return Math.sqrt(this.distanceToSquared(t))
        },
        distanceToSquared: function(t) {
            var e = this.x - t.x,
                r = this.y - t.y,
                i = this.z - t.z;
            return e * e + r * r + i * i
        },
        setEulerFromRotationMatrix: function(t, e) {
            THREE.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.")
        },
        setEulerFromQuaternion: function(t, e) {
            THREE.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.")
        },
        getPositionFromMatrix: function(t) {
            return THREE.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition()."), this.setFromMatrixPosition(t)
        },
        getScaleFromMatrix: function(t) {
            return THREE.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale()."), this.setFromMatrixScale(t)
        },
        getColumnFromMatrix: function(t, e) {
            return THREE.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn()."), this.setFromMatrixColumn(t, e)
        },
        setFromMatrixPosition: function(t) {
            return this.x = t.elements[12], this.y = t.elements[13], this.z = t.elements[14], this
        },
        setFromMatrixScale: function(t) {
            var e = this.set(t.elements[0], t.elements[1], t.elements[2]).length(),
                r = this.set(t.elements[4], t.elements[5], t.elements[6]).length(),
                i = this.set(t.elements[8], t.elements[9], t.elements[10]).length();
            return this.x = e, this.y = r, this.z = i, this
        },
        setFromMatrixColumn: function(t, e) {
            var r = 4 * t,
                i = e.elements;
            return this.x = i[r], this.y = i[r + 1], this.z = i[r + 2], this
        },
        equals: function(t) {
            return t.x === this.x && t.y === this.y && t.z === this.z
        },
        fromArray: function(t, e) {
            return void 0 === e && (e = 0), this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this
        },
        toArray: function(t, e) {
            return void 0 === t && (t = []), void 0 === e && (e = 0), t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t
        },
        fromAttribute: function(t, e, r) {
            return void 0 === r && (r = 0), e = e * t.itemSize + r, this.x = t.array[e], this.y = t.array[e + 1], this.z = t.array[e + 2], this
        },
        clone: function() {
            return new THREE.Vector3(this.x, this.y, this.z)
        }
    }, THREE.Vector4 = function(t, e, r, i) {
        this.x = t || 0, this.y = e || 0, this.z = r || 0, this.w = void 0 !== i ? i : 1
    }, THREE.Vector4.prototype = {
        constructor: THREE.Vector4,
        set: function(t, e, r, i) {
            return this.x = t, this.y = e, this.z = r, this.w = i, this
        },
        setX: function(t) {
            return this.x = t, this
        },
        setY: function(t) {
            return this.y = t, this
        },
        setZ: function(t) {
            return this.z = t, this
        },
        setW: function(t) {
            return this.w = t, this
        },
        setComponent: function(t, e) {
            switch (t) {
                case 0:
                    this.x = e;
                    break;
                case 1:
                    this.y = e;
                    break;
                case 2:
                    this.z = e;
                    break;
                case 3:
                    this.w = e;
                    break;
                default:
                    throw new Error("index is out of range: " + t)
            }
        },
        getComponent: function(t) {
            switch (t) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                case 2:
                    return this.z;
                case 3:
                    return this.w;
                default:
                    throw new Error("index is out of range: " + t)
            }
        },
        copy: function(t) {
            return this.x = t.x, this.y = t.y, this.z = t.z, this.w = void 0 !== t.w ? t.w : 1, this
        },
        add: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(t, e)) : (this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this)
        },
        addScalar: function(t) {
            return this.x += t, this.y += t, this.z += t, this.w += t, this
        },
        addVectors: function(t, e) {
            return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, this
        },
        sub: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(t, e)) : (this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this)
        },
        subScalar: function(t) {
            return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this
        },
        subVectors: function(t, e) {
            return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, this
        },
        multiplyScalar: function(t) {
            return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this
        },
        applyMatrix4: function(t) {
            var e = this.x,
                r = this.y,
                i = this.z,
                n = this.w,
                a = t.elements;
            return this.x = a[0] * e + a[4] * r + a[8] * i + a[12] * n, this.y = a[1] * e + a[5] * r + a[9] * i + a[13] * n, this.z = a[2] * e + a[6] * r + a[10] * i + a[14] * n, this.w = a[3] * e + a[7] * r + a[11] * i + a[15] * n, this
        },
        divideScalar: function(t) {
            if (0 !== t) {
                var e = 1 / t;
                this.x *= e, this.y *= e, this.z *= e, this.w *= e
            } else this.x = 0, this.y = 0, this.z = 0, this.w = 1;
            return this
        },
        setAxisAngleFromQuaternion: function(t) {
            this.w = 2 * Math.acos(t.w);
            var e = Math.sqrt(1 - t.w * t.w);
            return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, this.z = t.z / e), this
        },
        setAxisAngleFromRotationMatrix: function(t) {
            var e, r, i, n, a = .01,
                o = .1,
                s = t.elements,
                h = s[0],
                l = s[4],
                c = s[8],
                u = s[1],
                E = s[5],
                f = s[9],
                p = s[2],
                d = s[6],
                m = s[10];
            if (Math.abs(l - u) < a && Math.abs(c - p) < a && Math.abs(f - d) < a) {
                if (Math.abs(l + u) < o && Math.abs(c + p) < o && Math.abs(f + d) < o && Math.abs(h + E + m - 3) < o) return this.set(1, 0, 0, 0), this;
                e = Math.PI;
                var T = (h + 1) / 2,
                    g = (E + 1) / 2,
                    v = (m + 1) / 2,
                    R = (l + u) / 4,
                    y = (c + p) / 4,
                    H = (f + d) / 4;
                return T > g && T > v ? T < a ? (r = 0, i = .707106781, n = .707106781) : (r = Math.sqrt(T), i = R / r, n = y / r) : g > v ? g < a ? (r = .707106781, i = 0, n = .707106781) : (i = Math.sqrt(g), r = R / i, n = H / i) : v < a ? (r = .707106781, i = .707106781, n = 0) : (n = Math.sqrt(v), r = y / n, i = H / n), this.set(r, i, n, e), this
            }
            var x = Math.sqrt((d - f) * (d - f) + (c - p) * (c - p) + (u - l) * (u - l));
            return Math.abs(x) < .001 && (x = 1), this.x = (d - f) / x, this.y = (c - p) / x, this.z = (u - l) / x, this.w = Math.acos((h + E + m - 1) / 2), this
        },
        min: function(t) {
            return this.x > t.x && (this.x = t.x), this.y > t.y && (this.y = t.y), this.z > t.z && (this.z = t.z), this.w > t.w && (this.w = t.w), this
        },
        max: function(t) {
            return this.x < t.x && (this.x = t.x), this.y < t.y && (this.y = t.y), this.z < t.z && (this.z = t.z), this.w < t.w && (this.w = t.w), this
        },
        clamp: function(t, e) {
            return this.x < t.x ? this.x = t.x : this.x > e.x && (this.x = e.x), this.y < t.y ? this.y = t.y : this.y > e.y && (this.y = e.y), this.z < t.z ? this.z = t.z : this.z > e.z && (this.z = e.z), this.w < t.w ? this.w = t.w : this.w > e.w && (this.w = e.w), this
        },
        clampScalar: function() {
            var t, e;
            return function(r, i) {
                return void 0 === t && (t = new THREE.Vector4, e = new THREE.Vector4), t.set(r, r, r, r), e.set(i, i, i, i), this.clamp(t, e)
            }
        }(),
        floor: function() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this
        },
        ceil: function() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this
        },
        round: function() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this
        },
        roundToZero: function() {
            return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w), this
        },
        negate: function() {
            return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this
        },
        dot: function(t) {
            return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w
        },
        lengthSq: function() {
            return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
        },
        lengthManhattan: function() {
            return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
        },
        normalize: function() {
            return this.divideScalar(this.length())
        },
        setLength: function(t) {
            var e = this.length();
            return 0 !== e && t !== e && this.multiplyScalar(t / e), this
        },
        lerp: function(t, e) {
            return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this
        },
        lerpVectors: function(t, e, r) {
            return this.subVectors(e, t).multiplyScalar(r).add(t), this
        },
        equals: function(t) {
            return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w
        },
        fromArray: function(t, e) {
            return void 0 === e && (e = 0), this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this
        },
        toArray: function(t, e) {
            return void 0 === t && (t = []), void 0 === e && (e = 0), t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t
        },
        fromAttribute: function(t, e, r) {
            return void 0 === r && (r = 0), e = e * t.itemSize + r, this.x = t.array[e], this.y = t.array[e + 1], this.z = t.array[e + 2], this.w = t.array[e + 3], this
        },
        clone: function() {
            return new THREE.Vector4(this.x, this.y, this.z, this.w)
        }
    }, THREE.Euler = function(t, e, r, i) {
        this._x = t || 0, this._y = e || 0, this._z = r || 0, this._order = i || THREE.Euler.DefaultOrder
    }, THREE.Euler.RotationOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"], THREE.Euler.DefaultOrder = "XYZ", THREE.Euler.prototype = {
        constructor: THREE.Euler,
        _x: 0,
        _y: 0,
        _z: 0,
        _order: THREE.Euler.DefaultOrder,
        get x() {
            return this._x
        },
        set x(t) {
            this._x = t, this.onChangeCallback()
        },
        get y() {
            return this._y
        },
        set y(t) {
            this._y = t, this.onChangeCallback()
        },
        get z() {
            return this._z
        },
        set z(t) {
            this._z = t, this.onChangeCallback()
        },
        get order() {
            return this._order
        },
        set order(t) {
            this._order = t, this.onChangeCallback()
        },
        set: function(t, e, r, i) {
            return this._x = t, this._y = e, this._z = r, this._order = i || this._order, this.onChangeCallback(), this
        },
        copy: function(t) {
            return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this.onChangeCallback(), this
        },
        setFromRotationMatrix: function(t, e, r) {
            var i = THREE.Math.clamp,
                n = t.elements,
                a = n[0],
                o = n[4],
                s = n[8],
                h = n[1],
                l = n[5],
                c = n[9],
                u = n[2],
                E = n[6],
                f = n[10];
            return e = e || this._order, "XYZ" === e ? (this._y = Math.asin(i(s, -1, 1)), Math.abs(s) < .99999 ? (this._x = Math.atan2(-c, f), this._z = Math.atan2(-o, a)) : (this._x = Math.atan2(E, l), this._z = 0)) : "YXZ" === e ? (this._x = Math.asin(-i(c, -1, 1)), Math.abs(c) < .99999 ? (this._y = Math.atan2(s, f), this._z = Math.atan2(h, l)) : (this._y = Math.atan2(-u, a), this._z = 0)) : "ZXY" === e ? (this._x = Math.asin(i(E, -1, 1)), Math.abs(E) < .99999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-o, l)) : (this._y = 0, this._z = Math.atan2(h, a))) : "ZYX" === e ? (this._y = Math.asin(-i(u, -1, 1)), Math.abs(u) < .99999 ? (this._x = Math.atan2(E, f), this._z = Math.atan2(h, a)) : (this._x = 0, this._z = Math.atan2(-o, l))) : "YZX" === e ? (this._z = Math.asin(i(h, -1, 1)), Math.abs(h) < .99999 ? (this._x = Math.atan2(-c, l), this._y = Math.atan2(-u, a)) : (this._x = 0, this._y = Math.atan2(s, f))) : "XZY" === e ? (this._z = Math.asin(-i(o, -1, 1)), Math.abs(o) < .99999 ? (this._x = Math.atan2(E, l), this._y = Math.atan2(s, a)) : (this._x = Math.atan2(-c, f), this._y = 0)) : THREE.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: " + e), this._order = e, r !== !1 && this.onChangeCallback(), this
        },
        setFromQuaternion: function() {
            var t;
            return function(e, r, i) {
                return void 0 === t && (t = new THREE.Matrix4), t.makeRotationFromQuaternion(e), this.setFromRotationMatrix(t, r, i), this
            }
        }(),
        setFromVector3: function(t, e) {
            return this.set(t.x, t.y, t.z, e || this._order)
        },
        reorder: function() {
            var t = new THREE.Quaternion;
            return function(e) {
                t.setFromEuler(this), this.setFromQuaternion(t, e)
            }
        }(),
        equals: function(t) {
            return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order
        },
        fromArray: function(t) {
            return this._x = t[0], this._y = t[1], this._z = t[2], void 0 !== t[3] && (this._order = t[3]), this.onChangeCallback(), this
        },
        toArray: function(t, e) {
            return void 0 === t && (t = []), void 0 === e && (e = 0), t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, t
        },
        toVector3: function(t) {
            return t ? t.set(this._x, this._y, this._z) : new THREE.Vector3(this._x, this._y, this._z)
        },
        onChange: function(t) {
            return this.onChangeCallback = t, this
        },
        onChangeCallback: function() {},
        clone: function() {
            return new THREE.Euler(this._x, this._y, this._z, this._order)
        }
    }, THREE.Line3 = function(t, e) {
        this.start = void 0 !== t ? t : new THREE.Vector3, this.end = void 0 !== e ? e : new THREE.Vector3
    }, THREE.Line3.prototype = {
        constructor: THREE.Line3,
        set: function(t, e) {
            return this.start.copy(t), this.end.copy(e), this
        },
        copy: function(t) {
            return this.start.copy(t.start), this.end.copy(t.end), this
        },
        center: function(t) {
            var e = t || new THREE.Vector3;
            return e.addVectors(this.start, this.end).multiplyScalar(.5)
        },
        delta: function(t) {
            var e = t || new THREE.Vector3;
            return e.subVectors(this.end, this.start)
        },
        distanceSq: function() {
            return this.start.distanceToSquared(this.end)
        },
        distance: function() {
            return this.start.distanceTo(this.end)
        },
        at: function(t, e) {
            var r = e || new THREE.Vector3;
            return this.delta(r).multiplyScalar(t).add(this.start)
        },
        closestPointToPointParameter: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3;
            return function(r, i) {
                t.subVectors(r, this.start), e.subVectors(this.end, this.start);
                var n = e.dot(e),
                    a = e.dot(t),
                    o = a / n;
                return i && (o = THREE.Math.clamp(o, 0, 1)), o
            }
        }(),
        closestPointToPoint: function(t, e, r) {
            var i = this.closestPointToPointParameter(t, e),
                n = r || new THREE.Vector3;
            return this.delta(n).multiplyScalar(i).add(this.start)
        },
        applyMatrix4: function(t) {
            return this.start.applyMatrix4(t), this.end.applyMatrix4(t), this
        },
        equals: function(t) {
            return t.start.equals(this.start) && t.end.equals(this.end)
        },
        clone: function() {
            return (new THREE.Line3).copy(this)
        }
    }, THREE.Box2 = function(t, e) {
        this.min = void 0 !== t ? t : new THREE.Vector2(1 / 0, 1 / 0), this.max = void 0 !== e ? e : new THREE.Vector2((-(1 / 0)), (-(1 / 0)))
    }, THREE.Box2.prototype = {
        constructor: THREE.Box2,
        set: function(t, e) {
            return this.min.copy(t), this.max.copy(e), this
        },
        setFromPoints: function(t) {
            this.makeEmpty();
            for (var e = 0, r = t.length; e < r; e++) this.expandByPoint(t[e]);
            return this
        },
        setFromCenterAndSize: function() {
            var t = new THREE.Vector2;
            return function(e, r) {
                var i = t.copy(r).multiplyScalar(.5);
                return this.min.copy(e).sub(i), this.max.copy(e).add(i), this
            }
        }(),
        copy: function(t) {
            return this.min.copy(t.min), this.max.copy(t.max), this
        },
        makeEmpty: function() {
            return this.min.x = this.min.y = 1 / 0, this.max.x = this.max.y = -(1 / 0), this
        },
        empty: function() {
            return this.max.x < this.min.x || this.max.y < this.min.y
        },
        center: function(t) {
            var e = t || new THREE.Vector2;
            return e.addVectors(this.min, this.max).multiplyScalar(.5)
        },
        size: function(t) {
            var e = t || new THREE.Vector2;
            return e.subVectors(this.max, this.min)
        },
        expandByPoint: function(t) {
            return this.min.min(t), this.max.max(t), this
        },
        expandByVector: function(t) {
            return this.min.sub(t), this.max.add(t), this
        },
        expandByScalar: function(t) {
            return this.min.addScalar(-t), this.max.addScalar(t), this
        },
        containsPoint: function(t) {
            return !(t.x < this.min.x || t.x > this.max.x || t.y < this.min.y || t.y > this.max.y)
        },
        containsBox: function(t) {
            return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y
        },
        getParameter: function(t, e) {
            var r = e || new THREE.Vector2;
            return r.set((t.x - this.min.x) / (this.max.x - this.min.x), (t.y - this.min.y) / (this.max.y - this.min.y))
        },
        isIntersectionBox: function(t) {
            return !(t.max.x < this.min.x || t.min.x > this.max.x || t.max.y < this.min.y || t.min.y > this.max.y)
        },
        clampPoint: function(t, e) {
            var r = e || new THREE.Vector2;
            return r.copy(t).clamp(this.min, this.max)
        },
        distanceToPoint: function() {
            var t = new THREE.Vector2;
            return function(e) {
                var r = t.copy(e).clamp(this.min, this.max);
                return r.sub(e).length()
            }
        }(),
        intersect: function(t) {
            return this.min.max(t.min), this.max.min(t.max), this
        },
        union: function(t) {
            return this.min.min(t.min), this.max.max(t.max), this
        },
        translate: function(t) {
            return this.min.add(t), this.max.add(t), this
        },
        equals: function(t) {
            return t.min.equals(this.min) && t.max.equals(this.max)
        },
        clone: function() {
            return (new THREE.Box2).copy(this)
        }
    }, THREE.Box3 = function(t, e) {
        this.min = void 0 !== t ? t : new THREE.Vector3(1 / 0, 1 / 0, 1 / 0), this.max = void 0 !== e ? e : new THREE.Vector3((-(1 / 0)), (-(1 / 0)), (-(1 / 0)))
    }, THREE.Box3.prototype = {
        constructor: THREE.Box3,
        set: function(t, e) {
            return this.min.copy(t), this.max.copy(e), this
        },
        setFromPoints: function(t) {
            this.makeEmpty();
            for (var e = 0, r = t.length; e < r; e++) this.expandByPoint(t[e]);
            return this
        },
        setFromCenterAndSize: function() {
            var t = new THREE.Vector3;
            return function(e, r) {
                var i = t.copy(r).multiplyScalar(.5);
                return this.min.copy(e).sub(i), this.max.copy(e).add(i), this
            }
        }(),
        setFromObject: function() {
            var t = new THREE.Vector3;
            return function(e) {
                var r = this;
                return e.updateMatrixWorld(!0), this.makeEmpty(), e.traverse(function(e) {
                    var i = e.geometry;
                    if (void 0 !== i)
                        if (i instanceof THREE.Geometry)
                            for (var n = i.vertices, a = 0, o = n.length; a < o; a++) t.copy(n[a]), t.applyMatrix4(e.matrixWorld), r.expandByPoint(t);
                        else if (i instanceof THREE.BufferGeometry && void 0 !== i.attributes.position)
                        for (var s = i.attributes.position.array, a = 0, o = s.length; a < o; a += 3) t.set(s[a], s[a + 1], s[a + 2]), t.applyMatrix4(e.matrixWorld), r.expandByPoint(t)
                }), this
            }
        }(),
        copy: function(t) {
            return this.min.copy(t.min), this.max.copy(t.max), this
        },
        makeEmpty: function() {
            return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -(1 / 0), this
        },
        empty: function() {
            return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
        },
        center: function(t) {
            var e = t || new THREE.Vector3;
            return e.addVectors(this.min, this.max).multiplyScalar(.5)
        },
        size: function(t) {
            var e = t || new THREE.Vector3;
            return e.subVectors(this.max, this.min)
        },
        expandByPoint: function(t) {
            return this.min.min(t), this.max.max(t), this
        },
        expandByVector: function(t) {
            return this.min.sub(t), this.max.add(t), this
        },
        expandByScalar: function(t) {
            return this.min.addScalar(-t), this.max.addScalar(t), this
        },
        containsPoint: function(t) {
            return !(t.x < this.min.x || t.x > this.max.x || t.y < this.min.y || t.y > this.max.y || t.z < this.min.z || t.z > this.max.z)
        },
        containsBox: function(t) {
            return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z
        },
        getParameter: function(t, e) {
            var r = e || new THREE.Vector3;
            return r.set((t.x - this.min.x) / (this.max.x - this.min.x), (t.y - this.min.y) / (this.max.y - this.min.y), (t.z - this.min.z) / (this.max.z - this.min.z))
        },
        isIntersectionBox: function(t) {
            return !(t.max.x < this.min.x || t.min.x > this.max.x || t.max.y < this.min.y || t.min.y > this.max.y || t.max.z < this.min.z || t.min.z > this.max.z)
        },
        clampPoint: function(t, e) {
            var r = e || new THREE.Vector3;
            return r.copy(t).clamp(this.min, this.max)
        },
        distanceToPoint: function() {
            var t = new THREE.Vector3;
            return function(e) {
                var r = t.copy(e).clamp(this.min, this.max);
                return r.sub(e).length()
            }
        }(),
        getBoundingSphere: function() {
            var t = new THREE.Vector3;
            return function(e) {
                var r = e || new THREE.Sphere;
                return r.center = this.center(), r.radius = .5 * this.size(t).length(), r
            }
        }(),
        intersect: function(t) {
            return this.min.max(t.min), this.max.min(t.max), this
        },
        union: function(t) {
            return this.min.min(t.min), this.max.max(t.max), this
        },
        applyMatrix4: function() {
            var t = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3];
            return function(e) {
                return t[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), t[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), t[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), t[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), t[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), t[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), t[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), t[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.makeEmpty(), this.setFromPoints(t), this
            }
        }(),
        translate: function(t) {
            return this.min.add(t), this.max.add(t), this
        },
        equals: function(t) {
            return t.min.equals(this.min) && t.max.equals(this.max)
        },
        clone: function() {
            return (new THREE.Box3).copy(this)
        }
    }, THREE.Matrix3 = function() {
        this.elements = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), arguments.length > 0 && THREE.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.")
    }, THREE.Matrix3.prototype = {
        constructor: THREE.Matrix3,
        set: function(t, e, r, i, n, a, o, s, h) {
            var l = this.elements;
            return l[0] = t, l[3] = e, l[6] = r, l[1] = i, l[4] = n, l[7] = a, l[2] = o, l[5] = s, l[8] = h, this
        },
        identity: function() {
            return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
        },
        copy: function(t) {
            var e = t.elements;
            return this.set(e[0], e[3], e[6], e[1], e[4], e[7], e[2], e[5], e[8]), this
        },
        multiplyVector3: function(t) {
            return THREE.warn("THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead."), t.applyMatrix3(this)
        },
        multiplyVector3Array: function(t) {
            return THREE.warn("THREE.Matrix3: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), this.applyToVector3Array(t)
        },
        applyToVector3Array: function() {
            var t = new THREE.Vector3;
            return function(e, r, i) {
                void 0 === r && (r = 0), void 0 === i && (i = e.length);
                for (var n = 0, a = r; n < i; n += 3, a += 3) t.x = e[a], t.y = e[a + 1], t.z = e[a + 2], t.applyMatrix3(this), e[a] = t.x, e[a + 1] = t.y, e[a + 2] = t.z;
                return e
            }
        }(),
        multiplyScalar: function(t) {
            var e = this.elements;
            return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this
        },
        determinant: function() {
            var t = this.elements,
                e = t[0],
                r = t[1],
                i = t[2],
                n = t[3],
                a = t[4],
                o = t[5],
                s = t[6],
                h = t[7],
                l = t[8];
            return e * a * l - e * o * h - r * n * l + r * o * s + i * n * h - i * a * s
        },
        getInverse: function(t, e) {
            var r = t.elements,
                i = this.elements;
            i[0] = r[10] * r[5] - r[6] * r[9], i[1] = -r[10] * r[1] + r[2] * r[9], i[2] = r[6] * r[1] - r[2] * r[5], i[3] = -r[10] * r[4] + r[6] * r[8], i[4] = r[10] * r[0] - r[2] * r[8], i[5] = -r[6] * r[0] + r[2] * r[4], i[6] = r[9] * r[4] - r[5] * r[8], i[7] = -r[9] * r[0] + r[1] * r[8], i[8] = r[5] * r[0] - r[1] * r[4];
            var n = r[0] * i[0] + r[1] * i[3] + r[2] * i[6];
            if (0 === n) {
                var a = "Matrix3.getInverse(): can't invert matrix, determinant is 0";
                if (e) throw new Error(a);
                return THREE.warn(a), this.identity(), this
            }
            return this.multiplyScalar(1 / n), this
        },
        transpose: function() {
            var t, e = this.elements;
            return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this
        },
        flattenToArrayOffset: function(t, e) {
            var r = this.elements;
            return t[e] = r[0], t[e + 1] = r[1], t[e + 2] = r[2], t[e + 3] = r[3], t[e + 4] = r[4], t[e + 5] = r[5], t[e + 6] = r[6], t[e + 7] = r[7], t[e + 8] = r[8], t
        },
        getNormalMatrix: function(t) {
            return this.getInverse(t).transpose(), this
        },
        transposeIntoArray: function(t) {
            var e = this.elements;
            return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], t[6] = e[2], t[7] = e[5], t[8] = e[8], this
        },
        fromArray: function(t) {
            return this.elements.set(t), this
        },
        toArray: function() {
            var t = this.elements;
            return [t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]]
        },
        clone: function() {
            return (new THREE.Matrix3).fromArray(this.elements)
        }
    }, THREE.Matrix4 = function() {
        this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), arguments.length > 0 && THREE.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.")
    }, THREE.Matrix4.prototype = {
        constructor: THREE.Matrix4,
        set: function(t, e, r, i, n, a, o, s, h, l, c, u, E, f, p, d) {
            var m = this.elements;
            return m[0] = t, m[4] = e, m[8] = r, m[12] = i, m[1] = n, m[5] = a, m[9] = o, m[13] = s, m[2] = h, m[6] = l, m[10] = c, m[14] = u, m[3] = E, m[7] = f, m[11] = p, m[15] = d, this
        },
        identity: function() {
            return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
        },
        copy: function(t) {
            return this.elements.set(t.elements), this
        },
        extractPosition: function(t) {
            return THREE.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."), this.copyPosition(t)
        },
        copyPosition: function(t) {
            var e = this.elements,
                r = t.elements;
            return e[12] = r[12], e[13] = r[13], e[14] = r[14], this
        },
        extractBasis: function(t, e, r) {
            var i = this.elements;
            return t.set(i[0], i[1], i[2]), e.set(i[4], i[5], i[6]), r.set(i[8], i[9], i[10]), this
        },
        makeBasis: function(t, e, r) {
            return this.set(t.x, e.x, r.x, 0, t.y, e.y, r.y, 0, t.z, e.z, r.z, 0, 0, 0, 0, 1), this
        },
        extractRotation: function() {
            var t = new THREE.Vector3;
            return function(e) {
                var r = this.elements,
                    i = e.elements,
                    n = 1 / t.set(i[0], i[1], i[2]).length(),
                    a = 1 / t.set(i[4], i[5], i[6]).length(),
                    o = 1 / t.set(i[8], i[9], i[10]).length();
                return r[0] = i[0] * n, r[1] = i[1] * n, r[2] = i[2] * n, r[4] = i[4] * a, r[5] = i[5] * a, r[6] = i[6] * a, r[8] = i[8] * o, r[9] = i[9] * o, r[10] = i[10] * o, this
            }
        }(),
        makeRotationFromEuler: function(t) {
            t instanceof THREE.Euler == !1 && THREE.error("THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
            var e = this.elements,
                r = t.x,
                i = t.y,
                n = t.z,
                a = Math.cos(r),
                o = Math.sin(r),
                s = Math.cos(i),
                h = Math.sin(i),
                l = Math.cos(n),
                c = Math.sin(n);
            if ("XYZ" === t.order) {
                var u = a * l,
                    E = a * c,
                    f = o * l,
                    p = o * c;
                e[0] = s * l, e[4] = -s * c, e[8] = h, e[1] = E + f * h, e[5] = u - p * h, e[9] = -o * s, e[2] = p - u * h, e[6] = f + E * h, e[10] = a * s
            } else if ("YXZ" === t.order) {
                var d = s * l,
                    m = s * c,
                    T = h * l,
                    g = h * c;
                e[0] = d + g * o, e[4] = T * o - m, e[8] = a * h, e[1] = a * c, e[5] = a * l, e[9] = -o, e[2] = m * o - T, e[6] = g + d * o, e[10] = a * s
            } else if ("ZXY" === t.order) {
                var d = s * l,
                    m = s * c,
                    T = h * l,
                    g = h * c;
                e[0] = d - g * o, e[4] = -a * c, e[8] = T + m * o, e[1] = m + T * o, e[5] = a * l, e[9] = g - d * o, e[2] = -a * h, e[6] = o, e[10] = a * s
            } else if ("ZYX" === t.order) {
                var u = a * l,
                    E = a * c,
                    f = o * l,
                    p = o * c;
                e[0] = s * l, e[4] = f * h - E, e[8] = u * h + p, e[1] = s * c, e[5] = p * h + u, e[9] = E * h - f, e[2] = -h, e[6] = o * s, e[10] = a * s
            } else if ("YZX" === t.order) {
                var v = a * s,
                    R = a * h,
                    y = o * s,
                    H = o * h;
                e[0] = s * l, e[4] = H - v * c, e[8] = y * c + R, e[1] = c, e[5] = a * l, e[9] = -o * l, e[2] = -h * l, e[6] = R * c + y, e[10] = v - H * c
            } else if ("XZY" === t.order) {
                var v = a * s,
                    R = a * h,
                    y = o * s,
                    H = o * h;
                e[0] = s * l, e[4] = -c, e[8] = h * l, e[1] = v * c + H, e[5] = a * l, e[9] = R * c - y, e[2] = y * c - R, e[6] = o * l, e[10] = H * c + v
            }
            return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this
        },
        setRotationFromQuaternion: function(t) {
            return THREE.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion()."), this.makeRotationFromQuaternion(t)
        },
        makeRotationFromQuaternion: function(t) {
            var e = this.elements,
                r = t.x,
                i = t.y,
                n = t.z,
                a = t.w,
                o = r + r,
                s = i + i,
                h = n + n,
                l = r * o,
                c = r * s,
                u = r * h,
                E = i * s,
                f = i * h,
                p = n * h,
                d = a * o,
                m = a * s,
                T = a * h;
            return e[0] = 1 - (E + p), e[4] = c - T, e[8] = u + m, e[1] = c + T, e[5] = 1 - (l + p), e[9] = f - d, e[2] = u - m, e[6] = f + d, e[10] = 1 - (l + E), e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this
        },
        lookAt: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3,
                r = new THREE.Vector3;
            return function(i, n, a) {
                var o = this.elements;
                return r.subVectors(i, n).normalize(), 0 === r.length() && (r.z = 1), t.crossVectors(a, r).normalize(), 0 === t.length() && (r.x += 1e-4, t.crossVectors(a, r).normalize()), e.crossVectors(r, t), o[0] = t.x, o[4] = e.x, o[8] = r.x, o[1] = t.y, o[5] = e.y, o[9] = r.y, o[2] = t.z, o[6] = e.z, o[10] = r.z, this
            }
        }(),
        multiply: function(t, e) {
            return void 0 !== e ? (THREE.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."), this.multiplyMatrices(t, e)) : this.multiplyMatrices(this, t)
        },
        multiplyMatrices: function(t, e) {
            var r = t.elements,
                i = e.elements,
                n = this.elements,
                a = r[0],
                o = r[4],
                s = r[8],
                h = r[12],
                l = r[1],
                c = r[5],
                u = r[9],
                E = r[13],
                f = r[2],
                p = r[6],
                d = r[10],
                m = r[14],
                T = r[3],
                g = r[7],
                v = r[11],
                R = r[15],
                y = i[0],
                H = i[4],
                x = i[8],
                b = i[12],
                _ = i[1],
                w = i[5],
                M = i[9],
                S = i[13],
                A = i[2],
                C = i[6],
                L = i[10],
                P = i[14],
                F = i[3],
                U = i[7],
                B = i[11],
                D = i[15];
            return n[0] = a * y + o * _ + s * A + h * F, n[4] = a * H + o * w + s * C + h * U, n[8] = a * x + o * M + s * L + h * B, n[12] = a * b + o * S + s * P + h * D, n[1] = l * y + c * _ + u * A + E * F, n[5] = l * H + c * w + u * C + E * U, n[9] = l * x + c * M + u * L + E * B, n[13] = l * b + c * S + u * P + E * D, n[2] = f * y + p * _ + d * A + m * F, n[6] = f * H + p * w + d * C + m * U, n[10] = f * x + p * M + d * L + m * B, n[14] = f * b + p * S + d * P + m * D, n[3] = T * y + g * _ + v * A + R * F, n[7] = T * H + g * w + v * C + R * U, n[11] = T * x + g * M + v * L + R * B, n[15] = T * b + g * S + v * P + R * D, this
        },
        multiplyToArray: function(t, e, r) {
            var i = this.elements;
            return this.multiplyMatrices(t, e), r[0] = i[0], r[1] = i[1], r[2] = i[2], r[3] = i[3], r[4] = i[4], r[5] = i[5], r[6] = i[6], r[7] = i[7], r[8] = i[8], r[9] = i[9], r[10] = i[10], r[11] = i[11], r[12] = i[12], r[13] = i[13], r[14] = i[14], r[15] = i[15], this
        },
        multiplyScalar: function(t) {
            var e = this.elements;
            return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this
        },
        multiplyVector3: function(t) {
            return THREE.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead."), t.applyProjection(this)
        },
        multiplyVector4: function(t) {
            return THREE.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead."), t.applyMatrix4(this)
        },
        multiplyVector3Array: function(t) {
            return THREE.warn("THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), this.applyToVector3Array(t)
        },
        applyToVector3Array: function() {
            var t = new THREE.Vector3;
            return function(e, r, i) {
                void 0 === r && (r = 0), void 0 === i && (i = e.length);
                for (var n = 0, a = r; n < i; n += 3, a += 3) t.x = e[a], t.y = e[a + 1], t.z = e[a + 2], t.applyMatrix4(this), e[a] = t.x, e[a + 1] = t.y, e[a + 2] = t.z;
                return e
            }
        }(),
        rotateAxis: function(t) {
            THREE.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead."), t.transformDirection(this)
        },
        crossVector: function(t) {
            return THREE.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead."), t.applyMatrix4(this)
        },
        determinant: function() {
            var t = this.elements,
                e = t[0],
                r = t[4],
                i = t[8],
                n = t[12],
                a = t[1],
                o = t[5],
                s = t[9],
                h = t[13],
                l = t[2],
                c = t[6],
                u = t[10],
                E = t[14],
                f = t[3],
                p = t[7],
                d = t[11],
                m = t[15];
            return f * (+n * s * c - i * h * c - n * o * u + r * h * u + i * o * E - r * s * E) + p * (+e * s * E - e * h * u + n * a * u - i * a * E + i * h * l - n * s * l) + d * (+e * h * c - e * o * E - n * a * c + r * a * E + n * o * l - r * h * l) + m * (-i * o * l - e * s * c + e * o * u + i * a * c - r * a * u + r * s * l)
        },
        transpose: function() {
            var t, e = this.elements;
            return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this
        },
        flattenToArrayOffset: function(t, e) {
            var r = this.elements;
            return t[e] = r[0], t[e + 1] = r[1], t[e + 2] = r[2], t[e + 3] = r[3], t[e + 4] = r[4], t[e + 5] = r[5], t[e + 6] = r[6], t[e + 7] = r[7], t[e + 8] = r[8], t[e + 9] = r[9], t[e + 10] = r[10], t[e + 11] = r[11], t[e + 12] = r[12], t[e + 13] = r[13], t[e + 14] = r[14], t[e + 15] = r[15], t
        },
        getPosition: function() {
            var t = new THREE.Vector3;
            return function() {
                THREE.warn("THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.");
                var e = this.elements;
                return t.set(e[12], e[13], e[14])
            }
        }(),
        setPosition: function(t) {
            var e = this.elements;
            return e[12] = t.x, e[13] = t.y, e[14] = t.z, this
        },
        getInverse: function(t, e) {
            var r = this.elements,
                i = t.elements,
                n = i[0],
                a = i[4],
                o = i[8],
                s = i[12],
                h = i[1],
                l = i[5],
                c = i[9],
                u = i[13],
                E = i[2],
                f = i[6],
                p = i[10],
                d = i[14],
                m = i[3],
                T = i[7],
                g = i[11],
                v = i[15];
            r[0] = c * d * T - u * p * T + u * f * g - l * d * g - c * f * v + l * p * v, r[4] = s * p * T - o * d * T - s * f * g + a * d * g + o * f * v - a * p * v, r[8] = o * u * T - s * c * T + s * l * g - a * u * g - o * l * v + a * c * v, r[12] = s * c * f - o * u * f - s * l * p + a * u * p + o * l * d - a * c * d, r[1] = u * p * m - c * d * m - u * E * g + h * d * g + c * E * v - h * p * v, r[5] = o * d * m - s * p * m + s * E * g - n * d * g - o * E * v + n * p * v, r[9] = s * c * m - o * u * m - s * h * g + n * u * g + o * h * v - n * c * v, r[13] = o * u * E - s * c * E + s * h * p - n * u * p - o * h * d + n * c * d, r[2] = l * d * m - u * f * m + u * E * T - h * d * T - l * E * v + h * f * v, r[6] = s * f * m - a * d * m - s * E * T + n * d * T + a * E * v - n * f * v, r[10] = a * u * m - s * l * m + s * h * T - n * u * T - a * h * v + n * l * v, r[14] = s * l * E - a * u * E - s * h * f + n * u * f + a * h * d - n * l * d, r[3] = c * f * m - l * p * m - c * E * T + h * p * T + l * E * g - h * f * g, r[7] = a * p * m - o * f * m + o * E * T - n * p * T - a * E * g + n * f * g, r[11] = o * l * m - a * c * m - o * h * T + n * c * T + a * h * g - n * l * g, r[15] = a * c * E - o * l * E + o * h * f - n * c * f - a * h * p + n * l * p;
            var R = n * r[0] + h * r[4] + E * r[8] + m * r[12];
            if (0 == R) {
                var y = "THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0";
                if (e) throw new Error(y);
                return THREE.warn(y), this.identity(), this
            }
            return this.multiplyScalar(1 / R), this
        },
        translate: function(t) {
            THREE.error("THREE.Matrix4: .translate() has been removed.")
        },
        rotateX: function(t) {
            THREE.error("THREE.Matrix4: .rotateX() has been removed.")
        },
        rotateY: function(t) {
            THREE.error("THREE.Matrix4: .rotateY() has been removed.")
        },
        rotateZ: function(t) {
            THREE.error("THREE.Matrix4: .rotateZ() has been removed.")
        },
        rotateByAxis: function(t, e) {
            THREE.error("THREE.Matrix4: .rotateByAxis() has been removed.")
        },
        scale: function(t) {
            var e = this.elements,
                r = t.x,
                i = t.y,
                n = t.z;
            return e[0] *= r, e[4] *= i, e[8] *= n, e[1] *= r, e[5] *= i, e[9] *= n, e[2] *= r, e[6] *= i, e[10] *= n, e[3] *= r, e[7] *= i, e[11] *= n, this
        },
        getMaxScaleOnAxis: function() {
            var t = this.elements,
                e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2],
                r = t[4] * t[4] + t[5] * t[5] + t[6] * t[6],
                i = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
            return Math.sqrt(Math.max(e, Math.max(r, i)))
        },
        makeTranslation: function(t, e, r) {
            return this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, r, 0, 0, 0, 1), this
        },
        makeRotationX: function(t) {
            var e = Math.cos(t),
                r = Math.sin(t);
            return this.set(1, 0, 0, 0, 0, e, -r, 0, 0, r, e, 0, 0, 0, 0, 1), this
        },
        makeRotationY: function(t) {
            var e = Math.cos(t),
                r = Math.sin(t);
            return this.set(e, 0, r, 0, 0, 1, 0, 0, -r, 0, e, 0, 0, 0, 0, 1), this
        },
        makeRotationZ: function(t) {
            var e = Math.cos(t),
                r = Math.sin(t);
            return this.set(e, -r, 0, 0, r, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
        },
        makeRotationAxis: function(t, e) {
            var r = Math.cos(e),
                i = Math.sin(e),
                n = 1 - r,
                a = t.x,
                o = t.y,
                s = t.z,
                h = n * a,
                l = n * o;
            return this.set(h * a + r, h * o - i * s, h * s + i * o, 0, h * o + i * s, l * o + r, l * s - i * a, 0, h * s - i * o, l * s + i * a, n * s * s + r, 0, 0, 0, 0, 1), this
        },
        makeScale: function(t, e, r) {
            return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, r, 0, 0, 0, 0, 1), this
        },
        compose: function(t, e, r) {
            return this.makeRotationFromQuaternion(e), this.scale(r), this.setPosition(t), this
        },
        decompose: function() {
            var t = new THREE.Vector3,
                e = new THREE.Matrix4;
            return function(r, i, n) {
                var a = this.elements,
                    o = t.set(a[0], a[1], a[2]).length(),
                    s = t.set(a[4], a[5], a[6]).length(),
                    h = t.set(a[8], a[9], a[10]).length(),
                    l = this.determinant();
                l < 0 && (o = -o), r.x = a[12], r.y = a[13], r.z = a[14], e.elements.set(this.elements);
                var c = 1 / o,
                    u = 1 / s,
                    E = 1 / h;
                return e.elements[0] *= c, e.elements[1] *= c, e.elements[2] *= c, e.elements[4] *= u, e.elements[5] *= u, e.elements[6] *= u, e.elements[8] *= E, e.elements[9] *= E, e.elements[10] *= E, i.setFromRotationMatrix(e), n.x = o, n.y = s, n.z = h, this
            }
        }(),
        makeFrustum: function(t, e, r, i, n, a) {
            var o = this.elements,
                s = 2 * n / (e - t),
                h = 2 * n / (i - r),
                l = (e + t) / (e - t),
                c = (i + r) / (i - r),
                u = -(a + n) / (a - n),
                E = -2 * a * n / (a - n);
            return o[0] = s, o[4] = 0, o[8] = l, o[12] = 0, o[1] = 0, o[5] = h, o[9] = c, o[13] = 0, o[2] = 0, o[6] = 0, o[10] = u, o[14] = E, o[3] = 0, o[7] = 0, o[11] = -1, o[15] = 0, this
        },
        makePerspective: function(t, e, r, i) {
            var n = r * Math.tan(THREE.Math.degToRad(.5 * t)),
                a = -n,
                o = a * e,
                s = n * e;
            return this.makeFrustum(o, s, a, n, r, i)
        },
        makeOrthographic: function(t, e, r, i, n, a) {
            var o = this.elements,
                s = e - t,
                h = r - i,
                l = a - n,
                c = (e + t) / s,
                u = (r + i) / h,
                E = (a + n) / l;
            return o[0] = 2 / s, o[4] = 0, o[8] = 0, o[12] = -c, o[1] = 0, o[5] = 2 / h, o[9] = 0, o[13] = -u, o[2] = 0, o[6] = 0, o[10] = -2 / l, o[14] = -E, o[3] = 0, o[7] = 0, o[11] = 0, o[15] = 1, this
        },
        fromArray: function(t) {
            return this.elements.set(t), this
        },
        toArray: function() {
            var t = this.elements;
            return [t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]]
        },
        clone: function() {
            return (new THREE.Matrix4).fromArray(this.elements)
        }
    }, THREE.Ray = function(t, e) {
        this.origin = void 0 !== t ? t : new THREE.Vector3, this.direction = void 0 !== e ? e : new THREE.Vector3
    }, THREE.Ray.prototype = {
        constructor: THREE.Ray,
        set: function(t, e) {
            return this.origin.copy(t), this.direction.copy(e), this
        },
        copy: function(t) {
            return this.origin.copy(t.origin), this.direction.copy(t.direction), this
        },
        at: function(t, e) {
            var r = e || new THREE.Vector3;
            return r.copy(this.direction).multiplyScalar(t).add(this.origin)
        },
        recast: function() {
            var t = new THREE.Vector3;
            return function(e) {
                return this.origin.copy(this.at(e, t)), this
            }
        }(),
        closestPointToPoint: function(t, e) {
            var r = e || new THREE.Vector3;
            r.subVectors(t, this.origin);
            var i = r.dot(this.direction);
            return i < 0 ? r.copy(this.origin) : r.copy(this.direction).multiplyScalar(i).add(this.origin)
        },
        distanceToPoint: function() {
            var t = new THREE.Vector3;
            return function(e) {
                var r = t.subVectors(e, this.origin).dot(this.direction);
                return r < 0 ? this.origin.distanceTo(e) : (t.copy(this.direction).multiplyScalar(r).add(this.origin), t.distanceTo(e))
            }
        }(),
        distanceSqToSegment: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3,
                r = new THREE.Vector3;
            return function(i, n, a, o) {
                t.copy(i).add(n).multiplyScalar(.5), e.copy(n).sub(i).normalize(), r.copy(this.origin).sub(t);
                var s, h, l, c, u = .5 * i.distanceTo(n),
                    E = -this.direction.dot(e),
                    f = r.dot(this.direction),
                    p = -r.dot(e),
                    d = r.lengthSq(),
                    m = Math.abs(1 - E * E);
                if (m > 0)
                    if (s = E * p - f, h = E * f - p, c = u * m, s >= 0)
                        if (h >= -c)
                            if (h <= c) {
                                var T = 1 / m;
                                s *= T, h *= T, l = s * (s + E * h + 2 * f) + h * (E * s + h + 2 * p) + d
                            } else h = u, s = Math.max(0, -(E * h + f)), l = -s * s + h * (h + 2 * p) + d;
                else h = -u, s = Math.max(0, -(E * h + f)), l = -s * s + h * (h + 2 * p) + d;
                else h <= -c ? (s = Math.max(0, -(-E * u + f)), h = s > 0 ? -u : Math.min(Math.max(-u, -p), u), l = -s * s + h * (h + 2 * p) + d) : h <= c ? (s = 0, h = Math.min(Math.max(-u, -p), u), l = h * (h + 2 * p) + d) : (s = Math.max(0, -(E * u + f)), h = s > 0 ? u : Math.min(Math.max(-u, -p), u), l = -s * s + h * (h + 2 * p) + d);
                else h = E > 0 ? -u : u, s = Math.max(0, -(E * h + f)), l = -s * s + h * (h + 2 * p) + d;
                return a && a.copy(this.direction).multiplyScalar(s).add(this.origin), o && o.copy(e).multiplyScalar(h).add(t), l
            }
        }(),
        isIntersectionSphere: function(t) {
            return this.distanceToPoint(t.center) <= t.radius
        },
        intersectSphere: function() {
            var t = new THREE.Vector3;
            return function(e, r) {
                t.subVectors(e.center, this.origin);
                var i = t.dot(this.direction),
                    n = t.dot(t) - i * i,
                    a = e.radius * e.radius;
                if (n > a) return null;
                var o = Math.sqrt(a - n),
                    s = i - o,
                    h = i + o;
                return s < 0 && h < 0 ? null : s < 0 ? this.at(h, r) : this.at(s, r)
            }
        }(),
        isIntersectionPlane: function(t) {
            var e = t.distanceToPoint(this.origin);
            if (0 === e) return !0;
            var r = t.normal.dot(this.direction);
            return r * e < 0
        },
        distanceToPlane: function(t) {
            var e = t.normal.dot(this.direction);
            if (0 == e) return 0 == t.distanceToPoint(this.origin) ? 0 : null;
            var r = -(this.origin.dot(t.normal) + t.constant) / e;
            return r >= 0 ? r : null
        },
        intersectPlane: function(t, e) {
            var r = this.distanceToPlane(t);
            return null === r ? null : this.at(r, e)
        },
        isIntersectionBox: function() {
            var t = new THREE.Vector3;
            return function(e) {
                return null !== this.intersectBox(e, t)
            }
        }(),
        intersectBox: function(t, e) {
            var r, i, n, a, o, s, h = 1 / this.direction.x,
                l = 1 / this.direction.y,
                c = 1 / this.direction.z,
                u = this.origin;
            return h >= 0 ? (r = (t.min.x - u.x) * h, i = (t.max.x - u.x) * h) : (r = (t.max.x - u.x) * h, i = (t.min.x - u.x) * h), l >= 0 ? (n = (t.min.y - u.y) * l, a = (t.max.y - u.y) * l) : (n = (t.max.y - u.y) * l, a = (t.min.y - u.y) * l), r > a || n > i ? null : ((n > r || r !== r) && (r = n), (a < i || i !== i) && (i = a), c >= 0 ? (o = (t.min.z - u.z) * c, s = (t.max.z - u.z) * c) : (o = (t.max.z - u.z) * c, s = (t.min.z - u.z) * c), r > s || o > i ? null : ((o > r || r !== r) && (r = o), (s < i || i !== i) && (i = s), i < 0 ? null : this.at(r >= 0 ? r : i, e)))
        },
        intersectTriangle: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3,
                r = new THREE.Vector3,
                i = new THREE.Vector3;
            return function(n, a, o, s, h) {
                e.subVectors(a, n), r.subVectors(o, n), i.crossVectors(e, r);
                var l, c = this.direction.dot(i);
                if (c > 0) {
                    if (s) return null;
                    l = 1
                } else {
                    if (!(c < 0)) return null;
                    l = -1, c = -c
                }
                t.subVectors(this.origin, n);
                var u = l * this.direction.dot(r.crossVectors(t, r));
                if (u < 0) return null;
                var E = l * this.direction.dot(e.cross(t));
                if (E < 0) return null;
                if (u + E > c) return null;
                var f = -l * t.dot(i);
                return f < 0 ? null : this.at(f / c, h)
            }
        }(),
        applyMatrix4: function(t) {
            return this.direction.add(this.origin).applyMatrix4(t), this.origin.applyMatrix4(t), this.direction.sub(this.origin), this.direction.normalize(), this
        },
        equals: function(t) {
            return t.origin.equals(this.origin) && t.direction.equals(this.direction)
        },
        clone: function() {
            return (new THREE.Ray).copy(this)
        }
    }, THREE.Sphere = function(t, e) {
        this.center = void 0 !== t ? t : new THREE.Vector3, this.radius = void 0 !== e ? e : 0
    }, THREE.Sphere.prototype = {
        constructor: THREE.Sphere,
        set: function(t, e) {
            return this.center.copy(t), this.radius = e, this
        },
        setFromPoints: function() {
            var t = new THREE.Box3;
            return function(e, r) {
                var i = this.center;
                void 0 !== r ? i.copy(r) : t.setFromPoints(e).center(i);
                for (var n = 0, a = 0, o = e.length; a < o; a++) n = Math.max(n, i.distanceToSquared(e[a]));
                return this.radius = Math.sqrt(n), this
            }
        }(),
        copy: function(t) {
            return this.center.copy(t.center), this.radius = t.radius, this
        },
        empty: function() {
            return this.radius <= 0
        },
        containsPoint: function(t) {
            return t.distanceToSquared(this.center) <= this.radius * this.radius
        },
        distanceToPoint: function(t) {
            return t.distanceTo(this.center) - this.radius
        },
        intersectsSphere: function(t) {
            var e = this.radius + t.radius;
            return t.center.distanceToSquared(this.center) <= e * e
        },
        clampPoint: function(t, e) {
            var r = this.center.distanceToSquared(t),
                i = e || new THREE.Vector3;
            return i.copy(t), r > this.radius * this.radius && (i.sub(this.center).normalize(), i.multiplyScalar(this.radius).add(this.center)), i
        },
        getBoundingBox: function(t) {
            var e = t || new THREE.Box3;
            return e.set(this.center, this.center), e.expandByScalar(this.radius), e
        },
        applyMatrix4: function(t) {
            return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), this
        },
        translate: function(t) {
            return this.center.add(t), this
        },
        equals: function(t) {
            return t.center.equals(this.center) && t.radius === this.radius
        },
        clone: function() {
            return (new THREE.Sphere).copy(this)
        }
    }, THREE.Frustum = function(t, e, r, i, n, a) {
        this.planes = [void 0 !== t ? t : new THREE.Plane, void 0 !== e ? e : new THREE.Plane, void 0 !== r ? r : new THREE.Plane, void 0 !== i ? i : new THREE.Plane, void 0 !== n ? n : new THREE.Plane, void 0 !== a ? a : new THREE.Plane]
    }, THREE.Frustum.prototype = {
        constructor: THREE.Frustum,
        set: function(t, e, r, i, n, a) {
            var o = this.planes;
            return o[0].copy(t), o[1].copy(e), o[2].copy(r), o[3].copy(i), o[4].copy(n), o[5].copy(a), this
        },
        copy: function(t) {
            for (var e = this.planes, r = 0; r < 6; r++) e[r].copy(t.planes[r]);
            return this
        },
        setFromMatrix: function(t) {
            var e = this.planes,
                r = t.elements,
                i = r[0],
                n = r[1],
                a = r[2],
                o = r[3],
                s = r[4],
                h = r[5],
                l = r[6],
                c = r[7],
                u = r[8],
                E = r[9],
                f = r[10],
                p = r[11],
                d = r[12],
                m = r[13],
                T = r[14],
                g = r[15];
            return e[0].setComponents(o - i, c - s, p - u, g - d).normalize(), e[1].setComponents(o + i, c + s, p + u, g + d).normalize(), e[2].setComponents(o + n, c + h, p + E, g + m).normalize(), e[3].setComponents(o - n, c - h, p - E, g - m).normalize(), e[4].setComponents(o - a, c - l, p - f, g - T).normalize(), e[5].setComponents(o + a, c + l, p + f, g + T).normalize(), this
        },
        intersectsObject: function() {
            var t = new THREE.Sphere;
            return function(e) {
                var r = e.geometry;
                return null === r.boundingSphere && r.computeBoundingSphere(), t.copy(r.boundingSphere), t.applyMatrix4(e.matrixWorld), this.intersectsSphere(t)
            }
        }(),
        intersectsSphere: function(t) {
            for (var e = this.planes, r = t.center, i = -t.radius, n = 0; n < 6; n++) {
                var a = e[n].distanceToPoint(r);
                if (a < i) return !1
            }
            return !0
        },
        intersectsBox: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3;
            return function(r) {
                for (var i = this.planes, n = 0; n < 6; n++) {
                    var a = i[n];
                    t.x = a.normal.x > 0 ? r.min.x : r.max.x, e.x = a.normal.x > 0 ? r.max.x : r.min.x, t.y = a.normal.y > 0 ? r.min.y : r.max.y, e.y = a.normal.y > 0 ? r.max.y : r.min.y, t.z = a.normal.z > 0 ? r.min.z : r.max.z, e.z = a.normal.z > 0 ? r.max.z : r.min.z;
                    var o = a.distanceToPoint(t),
                        s = a.distanceToPoint(e);
                    if (o < 0 && s < 0) return !1
                }
                return !0
            }
        }(),
        containsPoint: function(t) {
            for (var e = this.planes, r = 0; r < 6; r++)
                if (e[r].distanceToPoint(t) < 0) return !1;
            return !0
        },
        clone: function() {
            return (new THREE.Frustum).copy(this)
        }
    }, THREE.Plane = function(t, e) {
        this.normal = void 0 !== t ? t : new THREE.Vector3(1, 0, 0), this.constant = void 0 !== e ? e : 0
    }, THREE.Plane.prototype = {
        constructor: THREE.Plane,
        set: function(t, e) {
            return this.normal.copy(t), this.constant = e, this
        },
        setComponents: function(t, e, r, i) {
            return this.normal.set(t, e, r), this.constant = i, this
        },
        setFromNormalAndCoplanarPoint: function(t, e) {
            return this.normal.copy(t), this.constant = -e.dot(this.normal), this
        },
        setFromCoplanarPoints: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3;
            return function(r, i, n) {
                var a = t.subVectors(n, i).cross(e.subVectors(r, i)).normalize();
                return this.setFromNormalAndCoplanarPoint(a, r), this
            }
        }(),
        copy: function(t) {
            return this.normal.copy(t.normal), this.constant = t.constant, this
        },
        normalize: function() {
            var t = 1 / this.normal.length();
            return this.normal.multiplyScalar(t), this.constant *= t, this
        },
        negate: function() {
            return this.constant *= -1, this.normal.negate(), this
        },
        distanceToPoint: function(t) {
            return this.normal.dot(t) + this.constant
        },
        distanceToSphere: function(t) {
            return this.distanceToPoint(t.center) - t.radius
        },
        projectPoint: function(t, e) {
            return this.orthoPoint(t, e).sub(t).negate()
        },
        orthoPoint: function(t, e) {
            var r = this.distanceToPoint(t),
                i = e || new THREE.Vector3;
            return i.copy(this.normal).multiplyScalar(r)
        },
        isIntersectionLine: function(t) {
            var e = this.distanceToPoint(t.start),
                r = this.distanceToPoint(t.end);
            return e < 0 && r > 0 || r < 0 && e > 0
        },
        intersectLine: function() {
            var t = new THREE.Vector3;
            return function(e, r) {
                var i = r || new THREE.Vector3,
                    n = e.delta(t),
                    a = this.normal.dot(n);
                if (0 != a) {
                    var o = -(e.start.dot(this.normal) + this.constant) / a;
                    if (!(o < 0 || o > 1)) return i.copy(n).multiplyScalar(o).add(e.start)
                } else if (0 == this.distanceToPoint(e.start)) return i.copy(e.start)
            }
        }(),
        coplanarPoint: function(t) {
            var e = t || new THREE.Vector3;
            return e.copy(this.normal).multiplyScalar(-this.constant)
        },
        applyMatrix4: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3,
                r = new THREE.Matrix3;
            return function(i, n) {
                var a = n || r.getNormalMatrix(i),
                    o = t.copy(this.normal).applyMatrix3(a),
                    s = this.coplanarPoint(e);
                return s.applyMatrix4(i), this.setFromNormalAndCoplanarPoint(o, s), this
            }
        }(),
        translate: function(t) {
            return this.constant = this.constant - t.dot(this.normal), this
        },
        equals: function(t) {
            return t.normal.equals(this.normal) && t.constant == this.constant
        },
        clone: function() {
            return (new THREE.Plane).copy(this)
        }
    }, THREE.Math = {
        generateUUID: function() {
            var t, e = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
                r = new Array(36),
                i = 0;
            return function() {
                for (var n = 0; n < 36; n++) 8 == n || 13 == n || 18 == n || 23 == n ? r[n] = "-" : 14 == n ? r[n] = "4" : (i <= 2 && (i = 33554432 + 16777216 * Math.random() | 0), t = 15 & i, i >>= 4, r[n] = e[19 == n ? 3 & t | 8 : t]);
                return r.join("")
            }
        }(),
        clamp: function(t, e, r) {
            return t < e ? e : t > r ? r : t
        },
        clampBottom: function(t, e) {
            return t < e ? e : t
        },
        mapLinear: function(t, e, r, i, n) {
            return i + (t - e) * (n - i) / (r - e)
        },
        smoothstep: function(t, e, r) {
            return t <= e ? 0 : t >= r ? 1 : (t = (t - e) / (r - e), t * t * (3 - 2 * t))
        },
        smootherstep: function(t, e, r) {
            return t <= e ? 0 : t >= r ? 1 : (t = (t - e) / (r - e), t * t * t * (t * (6 * t - 15) + 10))
        },
        random16: function() {
            return (65280 * Math.random() + 255 * Math.random()) / 65535
        },
        randInt: function(t, e) {
            return Math.floor(this.randFloat(t, e))
        },
        randFloat: function(t, e) {
            return t + Math.random() * (e - t)
        },
        randFloatSpread: function(t) {
            return t * (.5 - Math.random())
        },
        degToRad: function() {
            var t = Math.PI / 180;
            return function(e) {
                return e * t
            }
        }(),
        radToDeg: function() {
            var t = 180 / Math.PI;
            return function(e) {
                return e * t
            }
        }(),
        isPowerOfTwo: function(t) {
            return 0 === (t & t - 1) && 0 !== t
        },
        nextPowerOfTwo: function(t) {
            return t--, t |= t >> 1, t |= t >> 2, t |= t >> 4, t |= t >> 8, t |= t >> 16, t++, t
        }
    }, THREE.Spline = function(t) {
        function e(t, e, r, i, n, a, o) {
            var s = .5 * (r - t),
                h = .5 * (i - e);
            return (2 * (e - r) + s + h) * o + (-3 * (e - r) - 2 * s - h) * a + s * n + e
        }
        this.points = t;
        var r, i, n, a, o, s, h, l, c, u = [],
            E = {
                x: 0,
                y: 0,
                z: 0
            };
        this.initFromArray = function(t) {
            this.points = [];
            for (var e = 0; e < t.length; e++) this.points[e] = {
                x: t[e][0],
                y: t[e][1],
                z: t[e][2]
            }
        }, this.getPoint = function(t) {
            return r = (this.points.length - 1) * t, i = Math.floor(r), n = r - i, u[0] = 0 === i ? i : i - 1, u[1] = i, u[2] = i > this.points.length - 2 ? this.points.length - 1 : i + 1, u[3] = i > this.points.length - 3 ? this.points.length - 1 : i + 2, s = this.points[u[0]], h = this.points[u[1]], l = this.points[u[2]], c = this.points[u[3]], a = n * n, o = n * a, E.x = e(s.x, h.x, l.x, c.x, n, a, o), E.y = e(s.y, h.y, l.y, c.y, n, a, o), E.z = e(s.z, h.z, l.z, c.z, n, a, o), E
        }, this.getControlPointsArray = function() {
            var t, e, r = this.points.length,
                i = [];
            for (t = 0; t < r; t++) e = this.points[t], i[t] = [e.x, e.y, e.z];
            return i
        }, this.getLength = function(t) {
            var e, r, i, n, a = 0,
                o = 0,
                s = 0,
                h = new THREE.Vector3,
                l = new THREE.Vector3,
                c = [],
                u = 0;
            for (c[0] = 0, t || (t = 100), i = this.points.length * t, h.copy(this.points[0]), e = 1; e < i; e++) r = e / i, n = this.getPoint(r), l.copy(n), u += l.distanceTo(h), h.copy(n), a = (this.points.length - 1) * r, o = Math.floor(a), o != s && (c[o] = u, s = o);
            return c[c.length] = u, {
                chunks: c,
                total: u
            }
        }, this.reparametrizeByArcLength = function(t) {
            var e, r, i, n, a, o, s, h, l = [],
                c = new THREE.Vector3,
                u = this.getLength();
            for (l.push(c.copy(this.points[0]).clone()), e = 1; e < this.points.length; e++) {
                for (o = u.chunks[e] - u.chunks[e - 1], s = Math.ceil(t * o / u.total), n = (e - 1) / (this.points.length - 1), a = e / (this.points.length - 1), r = 1; r < s - 1; r++) i = n + r * (1 / s) * (a - n), h = this.getPoint(i), l.push(c.copy(h).clone());
                l.push(c.copy(this.points[e]).clone())
            }
            this.points = l
        }
    }, THREE.Triangle = function(t, e, r) {
        this.a = void 0 !== t ? t : new THREE.Vector3, this.b = void 0 !== e ? e : new THREE.Vector3, this.c = void 0 !== r ? r : new THREE.Vector3
    }, THREE.Triangle.normal = function() {
        var t = new THREE.Vector3;
        return function(e, r, i, n) {
            var a = n || new THREE.Vector3;
            a.subVectors(i, r), t.subVectors(e, r), a.cross(t);
            var o = a.lengthSq();
            return o > 0 ? a.multiplyScalar(1 / Math.sqrt(o)) : a.set(0, 0, 0)
        }
    }(), THREE.Triangle.barycoordFromPoint = function() {
        var t = new THREE.Vector3,
            e = new THREE.Vector3,
            r = new THREE.Vector3;
        return function(i, n, a, o, s) {
            t.subVectors(o, n), e.subVectors(a, n), r.subVectors(i, n);
            var h = t.dot(t),
                l = t.dot(e),
                c = t.dot(r),
                u = e.dot(e),
                E = e.dot(r),
                f = h * u - l * l,
                p = s || new THREE.Vector3;
            if (0 == f) return p.set(-2, -1, -1);
            var d = 1 / f,
                m = (u * c - l * E) * d,
                T = (h * E - l * c) * d;
            return p.set(1 - m - T, T, m)
        }
    }(), THREE.Triangle.containsPoint = function() {
        var t = new THREE.Vector3;
        return function(e, r, i, n) {
            var a = THREE.Triangle.barycoordFromPoint(e, r, i, n, t);
            return a.x >= 0 && a.y >= 0 && a.x + a.y <= 1
        }
    }(), THREE.Triangle.prototype = {
        constructor: THREE.Triangle,
        set: function(t, e, r) {
            return this.a.copy(t), this.b.copy(e), this.c.copy(r), this
        },
        setFromPointsAndIndices: function(t, e, r, i) {
            return this.a.copy(t[e]), this.b.copy(t[r]), this.c.copy(t[i]), this
        },
        copy: function(t) {
            return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this
        },
        area: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3;
            return function() {
                return t.subVectors(this.c, this.b), e.subVectors(this.a, this.b), .5 * t.cross(e).length()
            }
        }(),
        midpoint: function(t) {
            var e = t || new THREE.Vector3;
            return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3)
        },
        normal: function(t) {
            return THREE.Triangle.normal(this.a, this.b, this.c, t)
        },
        plane: function(t) {
            var e = t || new THREE.Plane;
            return e.setFromCoplanarPoints(this.a, this.b, this.c)
        },
        barycoordFromPoint: function(t, e) {
            return THREE.Triangle.barycoordFromPoint(t, this.a, this.b, this.c, e)
        },
        containsPoint: function(t) {
            return THREE.Triangle.containsPoint(t, this.a, this.b, this.c)
        },
        equals: function(t) {
            return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c)
        },
        clone: function() {
            return (new THREE.Triangle).copy(this)
        }
    }, THREE.Clock = function(t) {
        this.autoStart = void 0 === t || t, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1
    }, THREE.Clock.prototype = {
        constructor: THREE.Clock,
        start: function() {
            this.startTime = void 0 !== self.performance && void 0 !== self.performance.now ? self.performance.now() : Date.now(), this.oldTime = this.startTime, this.running = !0
        },
        stop: function() {
            this.getElapsedTime(), this.running = !1
        },
        getElapsedTime: function() {
            return this.getDelta(), this.elapsedTime
        },
        getDelta: function() {
            var t = 0;
            if (this.autoStart && !this.running && this.start(), this.running) {
                var e = void 0 !== self.performance && void 0 !== self.performance.now ? self.performance.now() : Date.now();
                t = .001 * (e - this.oldTime), this.oldTime = e, this.elapsedTime += t
            }
            return t
        }
    }, THREE.EventDispatcher = function() {}, THREE.EventDispatcher.prototype = {
        constructor: THREE.EventDispatcher,
        apply: function(t) {
            t.addEventListener = THREE.EventDispatcher.prototype.addEventListener, t.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener, t.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener, t.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent
        },
        addEventListener: function(t, e) {
            void 0 === this._listeners && (this._listeners = {});
            var r = this._listeners;
            void 0 === r[t] && (r[t] = []), r[t].indexOf(e) === -1 && r[t].push(e)
        },
        hasEventListener: function(t, e) {
            if (void 0 === this._listeners) return !1;
            var r = this._listeners;
            return void 0 !== r[t] && r[t].indexOf(e) !== -1
        },
        removeEventListener: function(t, e) {
            if (void 0 !== this._listeners) {
                var r = this._listeners,
                    i = r[t];
                if (void 0 !== i) {
                    var n = i.indexOf(e);
                    n !== -1 && i.splice(n, 1)
                }
            }
        },
        dispatchEvent: function(t) {
            if (void 0 !== this._listeners) {
                var e = this._listeners,
                    r = e[t.type];
                if (void 0 !== r) {
                    t.target = this;
                    for (var i = [], n = r.length, a = 0; a < n; a++) i[a] = r[a];
                    for (var a = 0; a < n; a++) i[a].call(this, t)
                }
            }
        }
    },
    function(t) {
        t.Raycaster = function(e, r, i, n) {
            this.ray = new t.Ray(e, r), this.near = i || 0, this.far = n || 1 / 0, this.params = {
                Sprite: {},
                Mesh: {},
                PointCloud: {
                    threshold: 1
                },
                LOD: {},
                Line: {}
            }
        };
        var e = function(t, e) {
                return t.distance - e.distance
            },
            r = function(t, e, i, n) {
                if (t.raycast(e, i), n === !0)
                    for (var a = t.children, o = 0, s = a.length; o < s; o++) r(a[o], e, i, !0)
            };
        t.Raycaster.prototype = {
            constructor: t.Raycaster,
            precision: 1e-4,
            linePrecision: 1,
            set: function(t, e) {
                this.ray.set(t, e)
            },
            setFromCamera: function(e, r) {
                r instanceof t.PerspectiveCamera ? (this.ray.origin.copy(r.position), this.ray.direction.set(e.x, e.y, .5).unproject(r).sub(r.position).normalize()) : r instanceof t.OrthographicCamera ? (this.ray.origin.set(e.x, e.y, -1).unproject(r), this.ray.direction.set(0, 0, -1).transformDirection(r.matrixWorld)) : t.error("THREE.Raycaster: Unsupported camera type.")
            },
            intersectObject: function(t, i) {
                var n = [];
                return r(t, this, n, i), n.sort(e), n
            },
            intersectObjects: function(i, n) {
                var a = [];
                if (i instanceof Array == !1) return t.warn("THREE.Raycaster.intersectObjects: objects is not an Array."), a;
                for (var o = 0, s = i.length; o < s; o++) r(i[o], this, a, n);
                return a.sort(e), a
            }
        }
    }(THREE), THREE.Object3D = function() {
        Object.defineProperty(this, "id", {
            value: THREE.Object3DIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Object3D", this.parent = void 0, this.children = [], this.up = THREE.Object3D.DefaultUp.clone();
        var t = new THREE.Vector3,
            e = new THREE.Euler,
            r = new THREE.Quaternion,
            i = new THREE.Vector3(1, 1, 1),
            n = function() {
                r.setFromEuler(e, !1)
            },
            a = function() {
                e.setFromQuaternion(r, void 0, !1)
            };
        e.onChange(n), r.onChange(a), Object.defineProperties(this, {
            position: {
                enumerable: !0,
                value: t
            },
            rotation: {
                enumerable: !0,
                value: e
            },
            quaternion: {
                enumerable: !0,
                value: r
            },
            scale: {
                enumerable: !0,
                value: i
            }
        }), this.rotationAutoUpdate = !0, this.matrix = new THREE.Matrix4, this.matrixWorld = new THREE.Matrix4, this.matrixAutoUpdate = !0, this.matrixWorldNeedsUpdate = !1, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.userData = {}
    }, THREE.Object3D.DefaultUp = new THREE.Vector3(0, 1, 0), THREE.Object3D.prototype = {
        constructor: THREE.Object3D,
        get eulerOrder() {
            return THREE.warn("THREE.Object3D: .eulerOrder has been moved to .rotation.order."), this.rotation.order
        },
        set eulerOrder(t) {
            THREE.warn("THREE.Object3D: .eulerOrder has been moved to .rotation.order."), this.rotation.order = t
        },
        get useQuaternion() {
            THREE.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")
        },
        set useQuaternion(t) {
            THREE.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")
        },
        applyMatrix: function(t) {
            this.matrix.multiplyMatrices(t, this.matrix), this.matrix.decompose(this.position, this.quaternion, this.scale)
        },
        setRotationFromAxisAngle: function(t, e) {
            this.quaternion.setFromAxisAngle(t, e)
        },
        setRotationFromEuler: function(t) {
            this.quaternion.setFromEuler(t, !0)
        },
        setRotationFromMatrix: function(t) {
            this.quaternion.setFromRotationMatrix(t)
        },
        setRotationFromQuaternion: function(t) {
            this.quaternion.copy(t)
        },
        rotateOnAxis: function() {
            var t = new THREE.Quaternion;
            return function(e, r) {
                return t.setFromAxisAngle(e, r), this.quaternion.multiply(t), this
            }
        }(),
        rotateX: function() {
            var t = new THREE.Vector3(1, 0, 0);
            return function(e) {
                return this.rotateOnAxis(t, e)
            }
        }(),
        rotateY: function() {
            var t = new THREE.Vector3(0, 1, 0);
            return function(e) {
                return this.rotateOnAxis(t, e)
            }
        }(),
        rotateZ: function() {
            var t = new THREE.Vector3(0, 0, 1);
            return function(e) {
                return this.rotateOnAxis(t, e)
            }
        }(),
        translateOnAxis: function() {
            var t = new THREE.Vector3;
            return function(e, r) {
                return t.copy(e).applyQuaternion(this.quaternion), this.position.add(t.multiplyScalar(r)), this
            }
        }(),
        translate: function(t, e) {
            return THREE.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead."), this.translateOnAxis(e, t)
        },
        translateX: function() {
            var t = new THREE.Vector3(1, 0, 0);
            return function(e) {
                return this.translateOnAxis(t, e)
            }
        }(),
        translateY: function() {
            var t = new THREE.Vector3(0, 1, 0);
            return function(e) {
                return this.translateOnAxis(t, e)
            }
        }(),
        translateZ: function() {
            var t = new THREE.Vector3(0, 0, 1);
            return function(e) {
                return this.translateOnAxis(t, e)
            }
        }(),
        localToWorld: function(t) {
            return t.applyMatrix4(this.matrixWorld)
        },
        worldToLocal: function() {
            var t = new THREE.Matrix4;
            return function(e) {
                return e.applyMatrix4(t.getInverse(this.matrixWorld))
            }
        }(),
        lookAt: function() {
            var t = new THREE.Matrix4;
            return function(e) {
                t.lookAt(e, this.position, this.up), this.quaternion.setFromRotationMatrix(t)
            }
        }(),
        add: function(t) {
            if (arguments.length > 1) {
                for (var e = 0; e < arguments.length; e++) this.add(arguments[e]);
                return this
            }
            return t === this ? (THREE.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t instanceof THREE.Object3D ? (void 0 !== t.parent && t.parent.remove(t), t.parent = this, t.dispatchEvent({
                type: "added"
            }), this.children.push(t)) : THREE.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this)
        },
        remove: function(t) {
            if (arguments.length > 1)
                for (var e = 0; e < arguments.length; e++) this.remove(arguments[e]);
            var r = this.children.indexOf(t);
            r !== -1 && (t.parent = void 0, t.dispatchEvent({
                type: "removed"
            }), this.children.splice(r, 1))
        },
        getChildByName: function(t) {
            return THREE.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName()."), this.getObjectByName(t)
        },
        getObjectById: function(t) {
            return this.getObjectByProperty("id", t)
        },
        getObjectByName: function(t) {
            return this.getObjectByProperty("name", t)
        },
        getObjectByProperty: function(t, e) {
            if (this[t] === e) return this;
            for (var r = 0, i = this.children.length; r < i; r++) {
                var n = this.children[r],
                    a = n.getObjectByProperty(t, e);
                if (void 0 !== a) return a
            }
        },
        getWorldPosition: function(t) {
            var e = t || new THREE.Vector3;
            return this.updateMatrixWorld(!0), e.setFromMatrixPosition(this.matrixWorld)
        },
        getWorldQuaternion: function() {
            var t = new THREE.Vector3,
                e = new THREE.Vector3;
            return function(r) {
                var i = r || new THREE.Quaternion;
                return this.updateMatrixWorld(!0), this.matrixWorld.decompose(t, i, e), i
            }
        }(),
        getWorldRotation: function() {
            var t = new THREE.Quaternion;
            return function(e) {
                var r = e || new THREE.Euler;
                return this.getWorldQuaternion(t), r.setFromQuaternion(t, this.rotation.order, !1)
            }
        }(),
        getWorldScale: function() {
            var t = new THREE.Vector3,
                e = new THREE.Quaternion;
            return function(r) {
                var i = r || new THREE.Vector3;
                return this.updateMatrixWorld(!0), this.matrixWorld.decompose(t, e, i), i
            }
        }(),
        getWorldDirection: function() {
            var t = new THREE.Quaternion;
            return function(e) {
                var r = e || new THREE.Vector3;
                return this.getWorldQuaternion(t), r.set(0, 0, 1).applyQuaternion(t)
            }
        }(),
        raycast: function() {},
        traverse: function(t) {
            t(this);
            for (var e = 0, r = this.children.length; e < r; e++) this.children[e].traverse(t)
        },
        traverseVisible: function(t) {
            if (this.visible !== !1) {
                t(this);
                for (var e = 0, r = this.children.length; e < r; e++) this.children[e].traverseVisible(t)
            }
        },
        traverseAncestors: function(t) {
            this.parent && (t(this.parent), this.parent.traverseAncestors(t))
        },
        updateMatrix: function() {
            this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0
        },
        updateMatrixWorld: function(t) {
            this.matrixAutoUpdate === !0 && this.updateMatrix(), this.matrixWorldNeedsUpdate !== !0 && t !== !0 || (void 0 === this.parent ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorldNeedsUpdate = !1, t = !0);
            for (var e = 0, r = this.children.length; e < r; e++) this.children[e].updateMatrixWorld(t)
        },
        toJSON: function() {
            var t = {
                    metadata: {
                        version: 4.3,
                        type: "Object",
                        generator: "ObjectExporter"
                    }
                },
                e = {},
                r = function(r) {
                    if (void 0 === t.geometries && (t.geometries = []), void 0 === e[r.uuid]) {
                        var i = r.toJSON();
                        delete i.metadata, e[r.uuid] = i, t.geometries.push(i)
                    }
                    return r.uuid
                },
                i = {},
                n = function(e) {
                    if (void 0 === t.materials && (t.materials = []), void 0 === i[e.uuid]) {
                        var r = e.toJSON();
                        delete r.metadata, i[e.uuid] = r, t.materials.push(r)
                    }
                    return e.uuid
                },
                a = function(t) {
                    var e = {};
                    if (e.uuid = t.uuid, e.type = t.type, "" !== t.name && (e.name = t.name), "{}" !== JSON.stringify(t.userData) && (e.userData = t.userData), t.visible !== !0 && (e.visible = t.visible), t instanceof THREE.PerspectiveCamera ? (e.fov = t.fov, e.aspect = t.aspect, e.near = t.near, e.far = t.far) : t instanceof THREE.OrthographicCamera ? (e.left = t.left, e.right = t.right, e.top = t.top, e.bottom = t.bottom, e.near = t.near, e.far = t.far) : t instanceof THREE.AmbientLight ? e.color = t.color.getHex() : t instanceof THREE.DirectionalLight ? (e.color = t.color.getHex(), e.intensity = t.intensity) : t instanceof THREE.PointLight ? (e.color = t.color.getHex(), e.intensity = t.intensity, e.distance = t.distance, e.decay = t.decay) : t instanceof THREE.SpotLight ? (e.color = t.color.getHex(), e.intensity = t.intensity, e.distance = t.distance, e.angle = t.angle, e.exponent = t.exponent, e.decay = t.decay) : t instanceof THREE.HemisphereLight ? (e.color = t.color.getHex(), e.groundColor = t.groundColor.getHex()) : t instanceof THREE.Mesh || t instanceof THREE.Line || t instanceof THREE.PointCloud ? (e.geometry = r(t.geometry), e.material = n(t.material), t instanceof THREE.Line && (e.mode = t.mode)) : t instanceof THREE.Sprite && (e.material = n(t.material)), e.matrix = t.matrix.toArray(), t.children.length > 0) {
                        e.children = [];
                        for (var i = 0; i < t.children.length; i++) e.children.push(a(t.children[i]))
                    }
                    return e
                };
            return t.object = a(this), t
        },
        clone: function(t, e) {
            if (void 0 === t && (t = new THREE.Object3D), void 0 === e && (e = !0), t.name = this.name, t.up.copy(this.up), t.position.copy(this.position), t.quaternion.copy(this.quaternion), t.scale.copy(this.scale), t.rotationAutoUpdate = this.rotationAutoUpdate, t.matrix.copy(this.matrix), t.matrixWorld.copy(this.matrixWorld), t.matrixAutoUpdate = this.matrixAutoUpdate, t.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate, t.visible = this.visible, t.castShadow = this.castShadow, t.receiveShadow = this.receiveShadow, t.frustumCulled = this.frustumCulled, t.userData = JSON.parse(JSON.stringify(this.userData)), e === !0)
                for (var r = 0; r < this.children.length; r++) {
                    var i = this.children[r];
                    t.add(i.clone())
                }
            return t
        }
    }, THREE.EventDispatcher.prototype.apply(THREE.Object3D.prototype), THREE.Object3DIdCount = 0, THREE.Face3 = function(t, e, r, i, n, a) {
        this.a = t, this.b = e, this.c = r, this.normal = i instanceof THREE.Vector3 ? i : new THREE.Vector3, this.vertexNormals = i instanceof Array ? i : [], this.color = n instanceof THREE.Color ? n : new THREE.Color, this.vertexColors = n instanceof Array ? n : [], this.vertexTangents = [], this.materialIndex = void 0 !== a ? a : 0
    }, THREE.Face3.prototype = {
        constructor: THREE.Face3,
        clone: function() {
            var t = new THREE.Face3(this.a, this.b, this.c);
            t.normal.copy(this.normal), t.color.copy(this.color), t.materialIndex = this.materialIndex;
            for (var e = 0, r = this.vertexNormals.length; e < r; e++) t.vertexNormals[e] = this.vertexNormals[e].clone();
            for (var e = 0, r = this.vertexColors.length; e < r; e++) t.vertexColors[e] = this.vertexColors[e].clone();
            for (var e = 0, r = this.vertexTangents.length; e < r; e++) t.vertexTangents[e] = this.vertexTangents[e].clone();
            return t
        }
    }, THREE.Face4 = function(t, e, r, i, n, a, o) {
        return THREE.warn("THREE.Face4 has been removed. A THREE.Face3 will be created instead."), new THREE.Face3(t, e, r, n, a, o)
    }, THREE.BufferAttribute = function(t, e) {
        this.array = t, this.itemSize = e, this.needsUpdate = !1
    }, THREE.BufferAttribute.prototype = {
        constructor: THREE.BufferAttribute,
        get length() {
            return this.array.length
        },
        copyAt: function(t, e, r) {
            t *= this.itemSize, r *= e.itemSize;
            for (var i = 0, n = this.itemSize; i < n; i++) this.array[t + i] = e.array[r + i];
            return this
        },
        set: function(t, e) {
            return void 0 === e && (e = 0), this.array.set(t, e), this
        },
        setX: function(t, e) {
            return this.array[t * this.itemSize] = e, this
        },
        setY: function(t, e) {
            return this.array[t * this.itemSize + 1] = e, this
        },
        setZ: function(t, e) {
            return this.array[t * this.itemSize + 2] = e, this
        },
        setXY: function(t, e, r) {
            return t *= this.itemSize, this.array[t] = e, this.array[t + 1] = r, this
        },
        setXYZ: function(t, e, r, i) {
            return t *= this.itemSize, this.array[t] = e, this.array[t + 1] = r, this.array[t + 2] = i, this
        },
        setXYZW: function(t, e, r, i, n) {
            return t *= this.itemSize, this.array[t] = e, this.array[t + 1] = r, this.array[t + 2] = i, this.array[t + 3] = n, this
        },
        clone: function() {
            return new THREE.BufferAttribute(new this.array.constructor(this.array), this.itemSize)
        }
    }, THREE.Int8Attribute = function(t, e) {
        return THREE.warn("THREE.Int8Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Uint8Attribute = function(t, e) {
        return THREE.warn("THREE.Uint8Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Uint8ClampedAttribute = function(t, e) {
        return THREE.warn("THREE.Uint8ClampedAttribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Int16Attribute = function(t, e) {
        return THREE.warn("THREE.Int16Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Uint16Attribute = function(t, e) {
        return THREE.warn("THREE.Uint16Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Int32Attribute = function(t, e) {
        return THREE.warn("THREE.Int32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Uint32Attribute = function(t, e) {
        return THREE.warn("THREE.Uint32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Float32Attribute = function(t, e) {
        return THREE.warn("THREE.Float32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.Float64Attribute = function(t, e) {
        return THREE.warn("THREE.Float64Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), new THREE.BufferAttribute(t, e)
    }, THREE.DynamicBufferAttribute = function(t, e) {
        THREE.BufferAttribute.call(this, t, e), this.updateRange = {
            offset: 0,
            count: -1
        }
    }, THREE.DynamicBufferAttribute.prototype = Object.create(THREE.BufferAttribute.prototype), THREE.DynamicBufferAttribute.prototype.constructor = THREE.DynamicBufferAttribute, THREE.DynamicBufferAttribute.prototype.clone = function() {
        return new THREE.DynamicBufferAttribute(new this.array.constructor(this.array), this.itemSize)
    }, THREE.BufferGeometry = function() {
        Object.defineProperty(this, "id", {
            value: THREE.GeometryIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "BufferGeometry", this.attributes = {}, this.attributesKeys = [], this.drawcalls = [], this.offsets = this.drawcalls, this.boundingBox = null, this.boundingSphere = null
    }, THREE.BufferGeometry.prototype = {
        constructor: THREE.BufferGeometry,
        addAttribute: function(t, e) {
            return e instanceof THREE.BufferAttribute == !1 ? (THREE.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."), void(this.attributes[t] = {
                array: arguments[1],
                itemSize: arguments[2]
            })) : (this.attributes[t] = e, void(this.attributesKeys = Object.keys(this.attributes)))
        },
        getAttribute: function(t) {
            return this.attributes[t]
        },
        addDrawCall: function(t, e, r) {
            this.drawcalls.push({
                start: t,
                count: e,
                index: void 0 !== r ? r : 0
            })
        },
        applyMatrix: function(t) {
            var e = this.attributes.position;
            void 0 !== e && (t.applyToVector3Array(e.array), e.needsUpdate = !0);
            var r = this.attributes.normal;
            if (void 0 !== r) {
                var i = (new THREE.Matrix3).getNormalMatrix(t);
                i.applyToVector3Array(r.array), r.needsUpdate = !0
            }
            null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere()
        },
        center: function() {
            this.computeBoundingBox();
            var t = this.boundingBox.center().negate();
            return this.applyMatrix((new THREE.Matrix4).setPosition(t)), t
        },
        fromGeometry: function(t, e) {
            e = e || {
                vertexColors: THREE.NoColors
            };
            var r = t.vertices,
                i = t.faces,
                n = t.faceVertexUvs,
                a = e.vertexColors,
                o = n[0].length > 0,
                s = 3 == i[0].vertexNormals.length,
                h = new Float32Array(3 * i.length * 3);
            this.addAttribute("position", new THREE.BufferAttribute(h, 3));
            var l = new Float32Array(3 * i.length * 3);
            if (this.addAttribute("normal", new THREE.BufferAttribute(l, 3)), a !== THREE.NoColors) {
                var c = new Float32Array(3 * i.length * 3);
                this.addAttribute("color", new THREE.BufferAttribute(c, 3))
            }
            if (o === !0) {
                var u = new Float32Array(3 * i.length * 2);
                this.addAttribute("uv", new THREE.BufferAttribute(u, 2))
            }
            for (var E = 0, f = 0, p = 0; E < i.length; E++, f += 6, p += 9) {
                var d = i[E],
                    m = r[d.a],
                    T = r[d.b],
                    g = r[d.c];
                if (h[p] = m.x, h[p + 1] = m.y, h[p + 2] = m.z, h[p + 3] = T.x, h[p + 4] = T.y, h[p + 5] = T.z, h[p + 6] = g.x, h[p + 7] = g.y, h[p + 8] = g.z, s === !0) {
                    var v = d.vertexNormals[0],
                        R = d.vertexNormals[1],
                        y = d.vertexNormals[2];
                    l[p] = v.x, l[p + 1] = v.y, l[p + 2] = v.z, l[p + 3] = R.x, l[p + 4] = R.y, l[p + 5] = R.z, l[p + 6] = y.x, l[p + 7] = y.y, l[p + 8] = y.z
                } else {
                    var H = d.normal;
                    l[p] = H.x, l[p + 1] = H.y, l[p + 2] = H.z, l[p + 3] = H.x, l[p + 4] = H.y, l[p + 5] = H.z, l[p + 6] = H.x, l[p + 7] = H.y, l[p + 8] = H.z
                }
                if (a === THREE.FaceColors) {
                    var x = d.color;
                    c[p] = x.r, c[p + 1] = x.g, c[p + 2] = x.b, c[p + 3] = x.r, c[p + 4] = x.g, c[p + 5] = x.b, c[p + 6] = x.r, c[p + 7] = x.g, c[p + 8] = x.b
                } else if (a === THREE.VertexColors) {
                    var b = d.vertexColors[0],
                        _ = d.vertexColors[1],
                        w = d.vertexColors[2];
                    c[p] = b.r, c[p + 1] = b.g, c[p + 2] = b.b, c[p + 3] = _.r, c[p + 4] = _.g, c[p + 5] = _.b, c[p + 6] = w.r, c[p + 7] = w.g, c[p + 8] = w.b
                }
                if (o === !0) {
                    var M = n[0][E][0],
                        S = n[0][E][1],
                        A = n[0][E][2];
                    u[f] = M.x, u[f + 1] = M.y, u[f + 2] = S.x, u[f + 3] = S.y, u[f + 4] = A.x, u[f + 5] = A.y
                }
            }
            return this.computeBoundingSphere(), this
        },
        computeBoundingBox: function() {
            var t = new THREE.Vector3;
            return function() {
                null === this.boundingBox && (this.boundingBox = new THREE.Box3);
                var e = this.attributes.position.array;
                if (e) {
                    var r = this.boundingBox;
                    r.makeEmpty();
                    for (var i = 0, n = e.length; i < n; i += 3) t.set(e[i], e[i + 1], e[i + 2]), r.expandByPoint(t)
                }
                void 0 !== e && 0 !== e.length || (this.boundingBox.min.set(0, 0, 0), this.boundingBox.max.set(0, 0, 0)), (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && THREE.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.')
            }
        }(),
        computeBoundingSphere: function() {
            var t = new THREE.Box3,
                e = new THREE.Vector3;
            return function() {
                null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere);
                var r = this.attributes.position.array;
                if (r) {
                    t.makeEmpty();
                    for (var i = this.boundingSphere.center, n = 0, a = r.length; n < a; n += 3) e.set(r[n], r[n + 1], r[n + 2]), t.expandByPoint(e);
                    t.center(i);
                    for (var o = 0, n = 0, a = r.length; n < a; n += 3) e.set(r[n], r[n + 1], r[n + 2]), o = Math.max(o, i.distanceToSquared(e));
                    this.boundingSphere.radius = Math.sqrt(o), isNaN(this.boundingSphere.radius) && THREE.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.')
                }
            }
        }(),
        computeFaceNormals: function() {},
        computeVertexNormals: function() {
            var t = this.attributes;
            if (t.position) {
                var e = t.position.array;
                if (void 0 === t.normal) this.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(e.length), 3));
                else
                    for (var r = t.normal.array, i = 0, n = r.length; i < n; i++) r[i] = 0;
                var a, o, s, r = t.normal.array,
                    h = new THREE.Vector3,
                    l = new THREE.Vector3,
                    c = new THREE.Vector3,
                    u = new THREE.Vector3,
                    E = new THREE.Vector3;
                if (t.index)
                    for (var f = t.index.array, p = this.offsets.length > 0 ? this.offsets : [{
                            start: 0,
                            count: f.length,
                            index: 0
                        }], d = 0, m = p.length; d < m; ++d)
                        for (var T = p[d].start, g = p[d].count, v = p[d].index, i = T, n = T + g; i < n; i += 3) a = 3 * (v + f[i]), o = 3 * (v + f[i + 1]), s = 3 * (v + f[i + 2]), h.fromArray(e, a), l.fromArray(e, o), c.fromArray(e, s), u.subVectors(c, l), E.subVectors(h, l), u.cross(E), r[a] += u.x, r[a + 1] += u.y, r[a + 2] += u.z, r[o] += u.x, r[o + 1] += u.y, r[o + 2] += u.z, r[s] += u.x, r[s + 1] += u.y, r[s + 2] += u.z;
                else
                    for (var i = 0, n = e.length; i < n; i += 9) h.fromArray(e, i), l.fromArray(e, i + 3), c.fromArray(e, i + 6), u.subVectors(c, l), E.subVectors(h, l), u.cross(E), r[i] = u.x, r[i + 1] = u.y, r[i + 2] = u.z, r[i + 3] = u.x, r[i + 4] = u.y, r[i + 5] = u.z, r[i + 6] = u.x, r[i + 7] = u.y, r[i + 8] = u.z;
                this.normalizeNormals(), t.normal.needsUpdate = !0
            }
        },
        computeTangents: function() {
            function t(t, e, r) {
                A.fromArray(i, 3 * t), C.fromArray(i, 3 * e), L.fromArray(i, 3 * r), P.fromArray(a, 2 * t), F.fromArray(a, 2 * e), U.fromArray(a, 2 * r), u = C.x - A.x, E = L.x - A.x, f = C.y - A.y, p = L.y - A.y, d = C.z - A.z, m = L.z - A.z, T = F.x - P.x, g = U.x - P.x, v = F.y - P.y, R = U.y - P.y, y = 1 / (T * R - g * v), B.set((R * u - v * E) * y, (R * f - v * p) * y, (R * d - v * m) * y), D.set((T * E - g * u) * y, (T * p - g * f) * y, (T * m - g * d) * y), h[t].add(B), h[e].add(B), h[r].add(B), l[t].add(D), l[e].add(D), l[r].add(D)
            }

            function e(t) {
                X.fromArray(n, 3 * t), q.copy(X), G = h[t], W.copy(G), W.sub(X.multiplyScalar(X.dot(G))).normalize(), j.crossVectors(q, G), I = j.dot(l[t]), O = I < 0 ? -1 : 1, s[4 * t] = W.x, s[4 * t + 1] = W.y, s[4 * t + 2] = W.z, s[4 * t + 3] = O
            }
            if (void 0 === this.attributes.index || void 0 === this.attributes.position || void 0 === this.attributes.normal || void 0 === this.attributes.uv) return void THREE.warn("THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()");
            var r = this.attributes.index.array,
                i = this.attributes.position.array,
                n = this.attributes.normal.array,
                a = this.attributes.uv.array,
                o = i.length / 3;
            void 0 === this.attributes.tangent && this.addAttribute("tangent", new THREE.BufferAttribute(new Float32Array(4 * o), 4));
            for (var s = this.attributes.tangent.array, h = [], l = [], c = 0; c < o; c++) h[c] = new THREE.Vector3, l[c] = new THREE.Vector3;
            var u, E, f, p, d, m, T, g, v, R, y, H, x, b, _, w, M, S, A = new THREE.Vector3,
                C = new THREE.Vector3,
                L = new THREE.Vector3,
                P = new THREE.Vector2,
                F = new THREE.Vector2,
                U = new THREE.Vector2,
                B = new THREE.Vector3,
                D = new THREE.Vector3;
            0 === this.drawcalls.length && this.addDrawCall(0, r.length, 0);
            var V = this.drawcalls;
            for (b = 0, _ = V.length; b < _; ++b) {
                var z = V[b].start,
                    k = V[b].count,
                    N = V[b].index;
                for (H = z, x = z + k; H < x; H += 3) w = N + r[H], M = N + r[H + 1], S = N + r[H + 2], t(w, M, S)
            }
            var O, G, I, W = new THREE.Vector3,
                j = new THREE.Vector3,
                X = new THREE.Vector3,
                q = new THREE.Vector3;
            for (b = 0, _ = V.length; b < _; ++b) {
                var z = V[b].start,
                    k = V[b].count,
                    N = V[b].index;
                for (H = z, x = z + k; H < x; H += 3) w = N + r[H], M = N + r[H + 1], S = N + r[H + 2], e(w), e(M), e(S)
            }
        },
        computeOffsets: function(t) {
            void 0 === t && (t = 65535);
            for (var e = this.attributes.index.array, r = this.attributes.position.array, i = e.length / 3, n = new Uint16Array(e.length), a = 0, o = 0, s = [{
                    start: 0,
                    count: 0,
                    index: 0
                }], h = s[0], l = 0, c = 0, u = new Int32Array(6), E = new Int32Array(r.length), f = new Int32Array(r.length), p = 0; p < r.length; p++) E[p] = -1, f[p] = -1;
            for (var d = 0; d < i; d++) {
                c = 0;
                for (var m = 0; m < 3; m++) {
                    var T = e[3 * d + m];
                    E[T] == -1 ? (u[2 * m] = T, u[2 * m + 1] = -1, c++) : E[T] < h.index ? (u[2 * m] = T, u[2 * m + 1] = -1, l++) : (u[2 * m] = T, u[2 * m + 1] = E[T])
                }
                var g = o + c;
                if (g > h.index + t) {
                    var v = {
                        start: a,
                        count: 0,
                        index: o
                    };
                    s.push(v), h = v;
                    for (var R = 0; R < 6; R += 2) {
                        var y = u[R + 1];
                        y > -1 && y < h.index && (u[R + 1] = -1)
                    }
                }
                for (var R = 0; R < 6; R += 2) {
                    var T = u[R],
                        y = u[R + 1];
                    y === -1 && (y = o++), E[T] = y, f[y] = T, n[a++] = y - h.index, h.count++
                }
            }
            return this.reorderBuffers(n, f, o), this.offsets = s, this.drawcalls = s, s
        },
        merge: function(t, e) {
            if (t instanceof THREE.BufferGeometry == !1) return void THREE.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.", t);
            void 0 === e && (e = 0);
            var r = this.attributes;
            for (var i in r)
                if (void 0 !== t.attributes[i])
                    for (var n = r[i], a = n.array, o = t.attributes[i], s = o.array, h = o.itemSize, l = 0, c = h * e; l < s.length; l++, c++) a[c] = s[l];
            return this
        },
        normalizeNormals: function() {
            for (var t, e, r, i, n = this.attributes.normal.array, a = 0, o = n.length; a < o; a += 3) t = n[a], e = n[a + 1], r = n[a + 2], i = 1 / Math.sqrt(t * t + e * e + r * r), n[a] *= i, n[a + 1] *= i, n[a + 2] *= i
        },
        reorderBuffers: function(t, e, r) {
            var i = {};
            for (var n in this.attributes)
                if ("index" != n) {
                    var a = this.attributes[n].array;
                    i[n] = new a.constructor(this.attributes[n].itemSize * r)
                }
            for (var o = 0; o < r; o++) {
                var s = e[o];
                for (var n in this.attributes)
                    if ("index" != n)
                        for (var h = this.attributes[n].array, l = this.attributes[n].itemSize, c = i[n], u = 0; u < l; u++) c[o * l + u] = h[s * l + u]
            }
            this.attributes.index.array = t;
            for (var n in this.attributes) "index" != n && (this.attributes[n].array = i[n], this.attributes[n].numItems = this.attributes[n].itemSize * r)
        },
        toJSON: function() {
            var t = {
                    metadata: {
                        version: 4,
                        type: "BufferGeometry",
                        generator: "BufferGeometryExporter"
                    },
                    uuid: this.uuid,
                    type: this.type,
                    data: {
                        attributes: {}
                    }
                },
                e = this.attributes,
                r = this.offsets,
                i = this.boundingSphere;
            for (var n in e) {
                var a = e[n],
                    o = Array.prototype.slice.call(a.array);
                t.data.attributes[n] = {
                    itemSize: a.itemSize,
                    type: a.array.constructor.name,
                    array: o
                }
            }
            return r.length > 0 && (t.data.offsets = JSON.parse(JSON.stringify(r))), null !== i && (t.data.boundingSphere = {
                center: i.center.toArray(),
                radius: i.radius
            }), t
        },
        clone: function() {
            var t = new THREE.BufferGeometry;
            for (var e in this.attributes) {
                var r = this.attributes[e];
                t.addAttribute(e, r.clone())
            }
            for (var i = 0, n = this.offsets.length; i < n; i++) {
                var a = this.offsets[i];
                t.offsets.push({
                    start: a.start,
                    index: a.index,
                    count: a.count
                })
            }
            return t
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }, THREE.EventDispatcher.prototype.apply(THREE.BufferGeometry.prototype), THREE.Geometry = function() {
        Object.defineProperty(this, "id", {
            value: THREE.GeometryIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Geometry", this.vertices = [], this.colors = [], this.faces = [], this.faceVertexUvs = [
            []
        ], this.morphTargets = [], this.morphColors = [], this.morphNormals = [], this.skinWeights = [], this.skinIndices = [], this.lineDistances = [], this.boundingBox = null, this.boundingSphere = null, this.hasTangents = !1, this.dynamic = !0, this.verticesNeedUpdate = !1, this.elementsNeedUpdate = !1, this.uvsNeedUpdate = !1, this.normalsNeedUpdate = !1, this.tangentsNeedUpdate = !1, this.colorsNeedUpdate = !1, this.lineDistancesNeedUpdate = !1, this.groupsNeedUpdate = !1
    }, THREE.Geometry.prototype = {
        constructor: THREE.Geometry,
        applyMatrix: function(t) {
            for (var e = (new THREE.Matrix3).getNormalMatrix(t), r = 0, i = this.vertices.length; r < i; r++) {
                var n = this.vertices[r];
                n.applyMatrix4(t)
            }
            for (var r = 0, i = this.faces.length; r < i; r++) {
                var a = this.faces[r];
                a.normal.applyMatrix3(e).normalize();
                for (var o = 0, s = a.vertexNormals.length; o < s; o++) a.vertexNormals[o].applyMatrix3(e).normalize()
            }
            null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere(), this.verticesNeedUpdate = !0, this.normalsNeedUpdate = !0
        },
        fromBufferGeometry: function(t) {
            for (var e = this, r = t.attributes, i = r.position.array, n = void 0 !== r.index ? r.index.array : void 0, a = void 0 !== r.normal ? r.normal.array : void 0, o = void 0 !== r.color ? r.color.array : void 0, s = void 0 !== r.uv ? r.uv.array : void 0, h = [], l = [], c = 0, u = 0; c < i.length; c += 3, u += 2) e.vertices.push(new THREE.Vector3(i[c], i[c + 1], i[c + 2])), void 0 !== a && h.push(new THREE.Vector3(a[c], a[c + 1], a[c + 2])), void 0 !== o && e.colors.push(new THREE.Color(o[c], o[c + 1], o[c + 2])), void 0 !== s && l.push(new THREE.Vector2(s[u], s[u + 1]));
            var E = function(t, r, i) {
                var n = void 0 !== a ? [h[t].clone(), h[r].clone(), h[i].clone()] : [],
                    c = void 0 !== o ? [e.colors[t].clone(), e.colors[r].clone(), e.colors[i].clone()] : [];
                e.faces.push(new THREE.Face3(t, r, i, n, c)), void 0 !== s && e.faceVertexUvs[0].push([l[t].clone(), l[r].clone(), l[i].clone()])
            };
            if (void 0 !== n) {
                var f = t.drawcalls;
                if (f.length > 0)
                    for (var c = 0; c < f.length; c++)
                        for (var p = f[c], d = p.start, m = p.count, T = p.index, u = d, g = d + m; u < g; u += 3) E(T + n[u], T + n[u + 1], T + n[u + 2]);
                else
                    for (var c = 0; c < n.length; c += 3) E(n[c], n[c + 1], n[c + 2])
            } else
                for (var c = 0; c < i.length / 3; c += 3) E(c, c + 1, c + 2);
            return this.computeFaceNormals(), null !== t.boundingBox && (this.boundingBox = t.boundingBox.clone()), null !== t.boundingSphere && (this.boundingSphere = t.boundingSphere.clone()), this
        },
        center: function() {
            this.computeBoundingBox();
            var t = this.boundingBox.center().negate();
            return this.applyMatrix((new THREE.Matrix4).setPosition(t)), t
        },
        computeFaceNormals: function() {
            for (var t = new THREE.Vector3, e = new THREE.Vector3, r = 0, i = this.faces.length; r < i; r++) {
                var n = this.faces[r],
                    a = this.vertices[n.a],
                    o = this.vertices[n.b],
                    s = this.vertices[n.c];
                t.subVectors(s, o), e.subVectors(a, o), t.cross(e), t.normalize(), n.normal.copy(t)
            }
        },
        computeVertexNormals: function(t) {
            var e, r, i, n, a, o;
            for (o = new Array(this.vertices.length), e = 0, r = this.vertices.length; e < r; e++) o[e] = new THREE.Vector3;
            if (t) {
                var s, h, l, c = new THREE.Vector3,
                    u = new THREE.Vector3;
                for (i = 0, n = this.faces.length; i < n; i++) a = this.faces[i], s = this.vertices[a.a], h = this.vertices[a.b], l = this.vertices[a.c], c.subVectors(l, h), u.subVectors(s, h), c.cross(u), o[a.a].add(c), o[a.b].add(c), o[a.c].add(c)
            } else
                for (i = 0, n = this.faces.length; i < n; i++) a = this.faces[i], o[a.a].add(a.normal), o[a.b].add(a.normal), o[a.c].add(a.normal);
            for (e = 0, r = this.vertices.length; e < r; e++) o[e].normalize();
            for (i = 0, n = this.faces.length; i < n; i++) a = this.faces[i], a.vertexNormals[0] = o[a.a].clone(), a.vertexNormals[1] = o[a.b].clone(), a.vertexNormals[2] = o[a.c].clone()
        },
        computeMorphNormals: function() {
            var t, e, r, i, n;
            for (r = 0, i = this.faces.length; r < i; r++)
                for (n = this.faces[r], n.__originalFaceNormal ? n.__originalFaceNormal.copy(n.normal) : n.__originalFaceNormal = n.normal.clone(), n.__originalVertexNormals || (n.__originalVertexNormals = []), t = 0, e = n.vertexNormals.length; t < e; t++) n.__originalVertexNormals[t] ? n.__originalVertexNormals[t].copy(n.vertexNormals[t]) : n.__originalVertexNormals[t] = n.vertexNormals[t].clone();
            var a = new THREE.Geometry;
            for (a.faces = this.faces, t = 0, e = this.morphTargets.length; t < e; t++) {
                if (!this.morphNormals[t]) {
                    this.morphNormals[t] = {}, this.morphNormals[t].faceNormals = [], this.morphNormals[t].vertexNormals = [];
                    var o, s, h = this.morphNormals[t].faceNormals,
                        l = this.morphNormals[t].vertexNormals;
                    for (r = 0, i = this.faces.length; r < i; r++) o = new THREE.Vector3, s = {
                        a: new THREE.Vector3,
                        b: new THREE.Vector3,
                        c: new THREE.Vector3
                    }, h.push(o), l.push(s)
                }
                var c = this.morphNormals[t];
                a.vertices = this.morphTargets[t].vertices, a.computeFaceNormals(), a.computeVertexNormals();
                var o, s;
                for (r = 0, i = this.faces.length; r < i; r++) n = this.faces[r], o = c.faceNormals[r], s = c.vertexNormals[r], o.copy(n.normal), s.a.copy(n.vertexNormals[0]), s.b.copy(n.vertexNormals[1]), s.c.copy(n.vertexNormals[2])
            }
            for (r = 0, i = this.faces.length; r < i; r++) n = this.faces[r], n.normal = n.__originalFaceNormal, n.vertexNormals = n.__originalVertexNormals
        },
        computeTangents: function() {
            function t(t, e, r, i, n, a, o) {
                l = t.vertices[e], c = t.vertices[r], u = t.vertices[i], E = h[n], f = h[a], p = h[o], d = c.x - l.x, m = u.x - l.x, T = c.y - l.y, g = u.y - l.y, v = c.z - l.z, R = u.z - l.z, y = f.x - E.x, H = p.x - E.x, x = f.y - E.y, b = p.y - E.y, _ = 1 / (y * b - H * x), L.set((b * d - x * m) * _, (b * T - x * g) * _, (b * v - x * R) * _), P.set((y * m - H * d) * _, (y * g - H * T) * _, (y * R - H * v) * _), A[e].add(L), A[r].add(L), A[i].add(L), C[e].add(P), C[r].add(P), C[i].add(P)
            }
            var e, r, i, n, a, o, s, h, l, c, u, E, f, p, d, m, T, g, v, R, y, H, x, b, _, w, M, S, A = [],
                C = [],
                L = new THREE.Vector3,
                P = new THREE.Vector3,
                F = new THREE.Vector3,
                U = new THREE.Vector3,
                B = new THREE.Vector3;
            for (i = 0, n = this.vertices.length; i < n; i++) A[i] = new THREE.Vector3, C[i] = new THREE.Vector3;
            for (e = 0, r = this.faces.length; e < r; e++) s = this.faces[e], h = this.faceVertexUvs[0][e], t(this, s.a, s.b, s.c, 0, 1, 2);
            var D = ["a", "b", "c", "d"];
            for (e = 0, r = this.faces.length; e < r; e++)
                for (s = this.faces[e], a = 0; a < Math.min(s.vertexNormals.length, 3); a++) B.copy(s.vertexNormals[a]), o = s[D[a]], w = A[o], F.copy(w), F.sub(B.multiplyScalar(B.dot(w))).normalize(), U.crossVectors(s.vertexNormals[a], w), M = U.dot(C[o]), S = M < 0 ? -1 : 1, s.vertexTangents[a] = new THREE.Vector4(F.x, F.y, F.z, S);
            this.hasTangents = !0
        },
        computeLineDistances: function() {
            for (var t = 0, e = this.vertices, r = 0, i = e.length; r < i; r++) r > 0 && (t += e[r].distanceTo(e[r - 1])), this.lineDistances[r] = t
        },
        computeBoundingBox: function() {
            null === this.boundingBox && (this.boundingBox = new THREE.Box3), this.boundingBox.setFromPoints(this.vertices)
        },
        computeBoundingSphere: function() {
            null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere), this.boundingSphere.setFromPoints(this.vertices)
        },
        merge: function(t, e, r) {
            if (t instanceof THREE.Geometry == !1) return void THREE.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.", t);
            var i, n = this.vertices.length,
                a = this.vertices,
                o = t.vertices,
                s = this.faces,
                h = t.faces,
                l = this.faceVertexUvs[0],
                c = t.faceVertexUvs[0];
            void 0 === r && (r = 0), void 0 !== e && (i = (new THREE.Matrix3).getNormalMatrix(e));
            for (var u = 0, E = o.length; u < E; u++) {
                var f = o[u],
                    p = f.clone();
                void 0 !== e && p.applyMatrix4(e), a.push(p)
            }
            for (u = 0, E = h.length; u < E; u++) {
                var d, m, T, g = h[u],
                    v = g.vertexNormals,
                    R = g.vertexColors;
                d = new THREE.Face3(g.a + n, g.b + n, g.c + n), d.normal.copy(g.normal), void 0 !== i && d.normal.applyMatrix3(i).normalize();
                for (var y = 0, H = v.length; y < H; y++) m = v[y].clone(), void 0 !== i && m.applyMatrix3(i).normalize(), d.vertexNormals.push(m);
                d.color.copy(g.color);
                for (var y = 0, H = R.length; y < H; y++) T = R[y], d.vertexColors.push(T.clone());
                d.materialIndex = g.materialIndex + r, s.push(d)
            }
            for (u = 0, E = c.length; u < E; u++) {
                var x = c[u],
                    b = [];
                if (void 0 !== x) {
                    for (var y = 0, H = x.length; y < H; y++) b.push(x[y].clone());
                    l.push(b)
                }
            }
        },
        mergeMesh: function(t) {
            return t instanceof THREE.Mesh == !1 ? void THREE.error("THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.", t) : (t.matrixAutoUpdate && t.updateMatrix(), void this.merge(t.geometry, t.matrix))
        },
        mergeVertices: function() {
            var t, e, r, i, n, a, o, s, h = {},
                l = [],
                c = [],
                u = 4,
                E = Math.pow(10, u);
            for (r = 0, i = this.vertices.length; r < i; r++) t = this.vertices[r], e = Math.round(t.x * E) + "_" + Math.round(t.y * E) + "_" + Math.round(t.z * E), void 0 === h[e] ? (h[e] = r, l.push(this.vertices[r]), c[r] = l.length - 1) : c[r] = c[h[e]];
            var f = [];
            for (r = 0, i = this.faces.length; r < i; r++) {
                n = this.faces[r], n.a = c[n.a], n.b = c[n.b], n.c = c[n.c], a = [n.a, n.b, n.c];
                for (var p = -1, d = 0; d < 3; d++)
                    if (a[d] == a[(d + 1) % 3]) {
                        p = d, f.push(r);
                        break
                    }
            }
            for (r = f.length - 1; r >= 0; r--) {
                var m = f[r];
                for (this.faces.splice(m, 1), o = 0, s = this.faceVertexUvs.length; o < s; o++) this.faceVertexUvs[o].splice(m, 1)
            }
            var T = this.vertices.length - l.length;
            return this.vertices = l, T
        },
        toJSON: function() {
            function t(t, e, r) {
                return r ? t | 1 << e : t & ~(1 << e)
            }

            function e(t) {
                var e = t.x.toString() + t.y.toString() + t.z.toString();
                return void 0 !== E[e] ? E[e] : (E[e] = u.length / 3, u.push(t.x, t.y, t.z), E[e])
            }

            function r(t) {
                var e = t.r.toString() + t.g.toString() + t.b.toString();
                return void 0 !== p[e] ? p[e] : (p[e] = f.length, f.push(t.getHex()), p[e])
            }

            function i(t) {
                var e = t.x.toString() + t.y.toString();
                return void 0 !== m[e] ? m[e] : (m[e] = d.length / 2, d.push(t.x, t.y), m[e])
            }
            var n = {
                metadata: {
                    version: 4,
                    type: "BufferGeometry",
                    generator: "BufferGeometryExporter"
                },
                uuid: this.uuid,
                type: this.type
            };
            if ("" !== this.name && (n.name = this.name), void 0 !== this.parameters) {
                var a = this.parameters;
                for (var o in a) void 0 !== a[o] && (n[o] = a[o]);
                return n
            }
            for (var s = [], h = 0; h < this.vertices.length; h++) {
                var l = this.vertices[h];
                s.push(l.x, l.y, l.z)
            }
            for (var c = [], u = [], E = {}, f = [], p = {}, d = [], m = {}, h = 0; h < this.faces.length; h++) {
                var T = this.faces[h],
                    g = !1,
                    v = !1,
                    R = void 0 !== this.faceVertexUvs[0][h],
                    y = T.normal.length() > 0,
                    H = T.vertexNormals.length > 0,
                    x = 1 !== T.color.r || 1 !== T.color.g || 1 !== T.color.b,
                    b = T.vertexColors.length > 0,
                    _ = 0;
                if (_ = t(_, 0, 0), _ = t(_, 1, g), _ = t(_, 2, v), _ = t(_, 3, R), _ = t(_, 4, y), _ = t(_, 5, H), _ = t(_, 6, x), _ = t(_, 7, b), c.push(_), c.push(T.a, T.b, T.c), R) {
                    var w = this.faceVertexUvs[0][h];
                    c.push(i(w[0]), i(w[1]), i(w[2]))
                }
                if (y && c.push(e(T.normal)), H) {
                    var M = T.vertexNormals;
                    c.push(e(M[0]), e(M[1]), e(M[2]))
                }
                if (x && c.push(r(T.color)), b) {
                    var S = T.vertexColors;
                    c.push(r(S[0]), r(S[1]), r(S[2]))
                }
            }
            return n.data = {}, n.data.vertices = s, n.data.normals = u, f.length > 0 && (n.data.colors = f), d.length > 0 && (n.data.uvs = [d]), n.data.faces = c, n
        },
        clone: function() {
            for (var t = new THREE.Geometry, e = this.vertices, r = 0, i = e.length; r < i; r++) t.vertices.push(e[r].clone());
            for (var n = this.faces, r = 0, i = n.length; r < i; r++) t.faces.push(n[r].clone());
            for (var r = 0, i = this.faceVertexUvs.length; r < i; r++) {
                var a = this.faceVertexUvs[r];
                void 0 === t.faceVertexUvs[r] && (t.faceVertexUvs[r] = []);
                for (var o = 0, s = a.length; o < s; o++) {
                    for (var h = a[o], l = [], c = 0, u = h.length; c < u; c++) {
                        var E = h[c];
                        l.push(E.clone())
                    }
                    t.faceVertexUvs[r].push(l)
                }
            }
            return t
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }, THREE.EventDispatcher.prototype.apply(THREE.Geometry.prototype), THREE.GeometryIdCount = 0, THREE.Camera = function() {
        THREE.Object3D.call(this), this.type = "Camera", this.matrixWorldInverse = new THREE.Matrix4, this.projectionMatrix = new THREE.Matrix4
    }, THREE.Camera.prototype = Object.create(THREE.Object3D.prototype), THREE.Camera.prototype.constructor = THREE.Camera, THREE.Camera.prototype.getWorldDirection = function() {
        var t = new THREE.Quaternion;
        return function(e) {
            var r = e || new THREE.Vector3;
            return this.getWorldQuaternion(t), r.set(0, 0, -1).applyQuaternion(t)
        }
    }(), THREE.Camera.prototype.lookAt = function() {
        var t = new THREE.Matrix4;
        return function(e) {
            t.lookAt(this.position, e, this.up), this.quaternion.setFromRotationMatrix(t)
        }
    }(), THREE.Camera.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.Camera), THREE.Object3D.prototype.clone.call(this, t), t.matrixWorldInverse.copy(this.matrixWorldInverse), t.projectionMatrix.copy(this.projectionMatrix), t
    }, THREE.CubeCamera = function(t, e, r) {
        THREE.Object3D.call(this), this.type = "CubeCamera";
        var i = 90,
            n = 1,
            a = new THREE.PerspectiveCamera(i, n, t, e);
        a.up.set(0, -1, 0), a.lookAt(new THREE.Vector3(1, 0, 0)), this.add(a);
        var o = new THREE.PerspectiveCamera(i, n, t, e);
        o.up.set(0, -1, 0), o.lookAt(new THREE.Vector3((-1), 0, 0)), this.add(o);
        var s = new THREE.PerspectiveCamera(i, n, t, e);
        s.up.set(0, 0, 1), s.lookAt(new THREE.Vector3(0, 1, 0)), this.add(s);
        var h = new THREE.PerspectiveCamera(i, n, t, e);
        h.up.set(0, 0, -1), h.lookAt(new THREE.Vector3(0, (-1), 0)), this.add(h);
        var l = new THREE.PerspectiveCamera(i, n, t, e);
        l.up.set(0, -1, 0), l.lookAt(new THREE.Vector3(0, 0, 1)), this.add(l);
        var c = new THREE.PerspectiveCamera(i, n, t, e);
        c.up.set(0, -1, 0), c.lookAt(new THREE.Vector3(0, 0, (-1))), this.add(c), this.renderTarget = new THREE.WebGLRenderTargetCube(r, r, {
            format: THREE.RGBFormat,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter
        }), this.updateCubeMap = function(t, e) {
            var r = this.renderTarget,
                i = r.generateMipmaps;
            r.generateMipmaps = !1, r.activeCubeFace = 0, t.render(e, a, r), r.activeCubeFace = 1, t.render(e, o, r), r.activeCubeFace = 2, t.render(e, s, r), r.activeCubeFace = 3, t.render(e, h, r), r.activeCubeFace = 4, t.render(e, l, r), r.generateMipmaps = i, r.activeCubeFace = 5, t.render(e, c, r)
        }
    }, THREE.CubeCamera.prototype = Object.create(THREE.Object3D.prototype), THREE.CubeCamera.prototype.constructor = THREE.CubeCamera, THREE.OrthographicCamera = function(t, e, r, i, n, a) {
        THREE.Camera.call(this), this.type = "OrthographicCamera", this.zoom = 1, this.left = t, this.right = e, this.top = r, this.bottom = i, this.near = void 0 !== n ? n : .1, this.far = void 0 !== a ? a : 2e3, this.updateProjectionMatrix()
    }, THREE.OrthographicCamera.prototype = Object.create(THREE.Camera.prototype), THREE.OrthographicCamera.prototype.constructor = THREE.OrthographicCamera, THREE.OrthographicCamera.prototype.updateProjectionMatrix = function() {
        var t = (this.right - this.left) / (2 * this.zoom),
            e = (this.top - this.bottom) / (2 * this.zoom),
            r = (this.right + this.left) / 2,
            i = (this.top + this.bottom) / 2;
        this.projectionMatrix.makeOrthographic(r - t, r + t, i + e, i - e, this.near, this.far)
    }, THREE.OrthographicCamera.prototype.clone = function() {
        var t = new THREE.OrthographicCamera;
        return THREE.Camera.prototype.clone.call(this, t), t.zoom = this.zoom, t.left = this.left, t.right = this.right, t.top = this.top, t.bottom = this.bottom, t.near = this.near, t.far = this.far, t.projectionMatrix.copy(this.projectionMatrix), t
    }, THREE.PerspectiveCamera = function(t, e, r, i) {
        THREE.Camera.call(this), this.type = "PerspectiveCamera", this.zoom = 1, this.fov = void 0 !== t ? t : 50, this.aspect = void 0 !== e ? e : 1, this.near = void 0 !== r ? r : .1, this.far = void 0 !== i ? i : 2e3, this.updateProjectionMatrix()
    }, THREE.PerspectiveCamera.prototype = Object.create(THREE.Camera.prototype), THREE.PerspectiveCamera.prototype.constructor = THREE.PerspectiveCamera, THREE.PerspectiveCamera.prototype.setLens = function(t, e) {
        void 0 === e && (e = 24), this.fov = 2 * THREE.Math.radToDeg(Math.atan(e / (2 * t))), this.updateProjectionMatrix()
    }, THREE.PerspectiveCamera.prototype.setViewOffset = function(t, e, r, i, n, a) {
        this.fullWidth = t, this.fullHeight = e, this.x = r, this.y = i, this.width = n, this.height = a, this.updateProjectionMatrix()
    }, THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function() {
        var t = THREE.Math.radToDeg(2 * Math.atan(Math.tan(.5 * THREE.Math.degToRad(this.fov)) / this.zoom));
        if (this.fullWidth) {
            var e = this.fullWidth / this.fullHeight,
                r = Math.tan(THREE.Math.degToRad(.5 * t)) * this.near,
                i = -r,
                n = e * i,
                a = e * r,
                o = Math.abs(a - n),
                s = Math.abs(r - i);
            this.projectionMatrix.makeFrustum(n + this.x * o / this.fullWidth, n + (this.x + this.width) * o / this.fullWidth, r - (this.y + this.height) * s / this.fullHeight, r - this.y * s / this.fullHeight, this.near, this.far)
        } else this.projectionMatrix.makePerspective(t, this.aspect, this.near, this.far)
    }, THREE.PerspectiveCamera.prototype.clone = function() {
        var t = new THREE.PerspectiveCamera;
        return THREE.Camera.prototype.clone.call(this, t), t.zoom = this.zoom, t.fov = this.fov, t.aspect = this.aspect, t.near = this.near, t.far = this.far, t.projectionMatrix.copy(this.projectionMatrix), t
    }, THREE.Light = function(t) {
        THREE.Object3D.call(this), this.type = "Light", this.color = new THREE.Color(t)
    }, THREE.Light.prototype = Object.create(THREE.Object3D.prototype), THREE.Light.prototype.constructor = THREE.Light, THREE.Light.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.Light), THREE.Object3D.prototype.clone.call(this, t), t.color.copy(this.color), t
    }, THREE.AmbientLight = function(t) {
        THREE.Light.call(this, t), this.type = "AmbientLight"
    }, THREE.AmbientLight.prototype = Object.create(THREE.Light.prototype), THREE.AmbientLight.prototype.constructor = THREE.AmbientLight, THREE.AmbientLight.prototype.clone = function() {
        var t = new THREE.AmbientLight;
        return THREE.Light.prototype.clone.call(this, t), t
    }, THREE.AreaLight = function(t, e) {
        THREE.Light.call(this, t), this.type = "AreaLight", this.normal = new THREE.Vector3(0, (-1), 0), this.right = new THREE.Vector3(1, 0, 0), this.intensity = void 0 !== e ? e : 1, this.width = 1, this.height = 1, this.constantAttenuation = 1.5, this.linearAttenuation = .5, this.quadraticAttenuation = .1
    }, THREE.AreaLight.prototype = Object.create(THREE.Light.prototype), THREE.AreaLight.prototype.constructor = THREE.AreaLight, THREE.DirectionalLight = function(t, e) {
        THREE.Light.call(this, t), this.type = "DirectionalLight", this.position.set(0, 1, 0), this.target = new THREE.Object3D, this.intensity = void 0 !== e ? e : 1, this.castShadow = !1, this.onlyShadow = !1, this.shadowCameraNear = 50, this.shadowCameraFar = 5e3, this.shadowCameraLeft = -500, this.shadowCameraRight = 500, this.shadowCameraTop = 500, this.shadowCameraBottom = -500, this.shadowCameraVisible = !1, this.shadowBias = 0, this.shadowDarkness = .5, this.shadowMapWidth = 512, this.shadowMapHeight = 512, this.shadowCascade = !1, this.shadowCascadeOffset = new THREE.Vector3(0, 0, (-1e3)), this.shadowCascadeCount = 2, this.shadowCascadeBias = [0, 0, 0], this.shadowCascadeWidth = [512, 512, 512], this.shadowCascadeHeight = [512, 512, 512], this.shadowCascadeNearZ = [-1, .99, .998], this.shadowCascadeFarZ = [.99, .998, 1], this.shadowCascadeArray = [], this.shadowMap = null, this.shadowMapSize = null, this.shadowCamera = null, this.shadowMatrix = null
    }, THREE.DirectionalLight.prototype = Object.create(THREE.Light.prototype), THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight, THREE.DirectionalLight.prototype.clone = function() {
        var t = new THREE.DirectionalLight;
        return THREE.Light.prototype.clone.call(this, t), t.target = this.target.clone(), t.intensity = this.intensity, t.castShadow = this.castShadow, t.onlyShadow = this.onlyShadow, t.shadowCameraNear = this.shadowCameraNear, t.shadowCameraFar = this.shadowCameraFar, t.shadowCameraLeft = this.shadowCameraLeft, t.shadowCameraRight = this.shadowCameraRight, t.shadowCameraTop = this.shadowCameraTop, t.shadowCameraBottom = this.shadowCameraBottom, t.shadowCameraVisible = this.shadowCameraVisible, t.shadowBias = this.shadowBias, t.shadowDarkness = this.shadowDarkness, t.shadowMapWidth = this.shadowMapWidth, t.shadowMapHeight = this.shadowMapHeight, t.shadowCascade = this.shadowCascade, t.shadowCascadeOffset.copy(this.shadowCascadeOffset), t.shadowCascadeCount = this.shadowCascadeCount, t.shadowCascadeBias = this.shadowCascadeBias.slice(0), t.shadowCascadeWidth = this.shadowCascadeWidth.slice(0), t.shadowCascadeHeight = this.shadowCascadeHeight.slice(0), t.shadowCascadeNearZ = this.shadowCascadeNearZ.slice(0), t.shadowCascadeFarZ = this.shadowCascadeFarZ.slice(0), t
    }, THREE.HemisphereLight = function(t, e, r) {
        THREE.Light.call(this, t), this.type = "HemisphereLight", this.position.set(0, 100, 0), this.groundColor = new THREE.Color(e), this.intensity = void 0 !== r ? r : 1
    }, THREE.HemisphereLight.prototype = Object.create(THREE.Light.prototype), THREE.HemisphereLight.prototype.constructor = THREE.HemisphereLight, THREE.HemisphereLight.prototype.clone = function() {
        var t = new THREE.HemisphereLight;
        return THREE.Light.prototype.clone.call(this, t), t.groundColor.copy(this.groundColor), t.intensity = this.intensity, t
    }, THREE.PointLight = function(t, e, r, i) {
        THREE.Light.call(this, t), this.type = "PointLight", this.intensity = void 0 !== e ? e : 1, this.distance = void 0 !== r ? r : 0, this.decay = void 0 !== i ? i : 1
    }, THREE.PointLight.prototype = Object.create(THREE.Light.prototype), THREE.PointLight.prototype.constructor = THREE.PointLight, THREE.PointLight.prototype.clone = function() {
        var t = new THREE.PointLight;
        return THREE.Light.prototype.clone.call(this, t), t.intensity = this.intensity, t.distance = this.distance, t.decay = this.decay, t
    }, THREE.SpotLight = function(t, e, r, i, n, a) {
        THREE.Light.call(this, t), this.type = "SpotLight", this.position.set(0, 1, 0), this.target = new THREE.Object3D, this.intensity = void 0 !== e ? e : 1, this.distance = void 0 !== r ? r : 0, this.angle = void 0 !== i ? i : Math.PI / 3, this.exponent = void 0 !== n ? n : 10, this.decay = void 0 !== a ? a : 1, this.castShadow = !1, this.onlyShadow = !1, this.shadowCameraNear = 50, this.shadowCameraFar = 5e3, this.shadowCameraFov = 50, this.shadowCameraVisible = !1, this.shadowBias = 0, this.shadowDarkness = .5, this.shadowMapWidth = 512, this.shadowMapHeight = 512, this.shadowMap = null, this.shadowMapSize = null, this.shadowCamera = null, this.shadowMatrix = null
    }, THREE.SpotLight.prototype = Object.create(THREE.Light.prototype), THREE.SpotLight.prototype.constructor = THREE.SpotLight, THREE.SpotLight.prototype.clone = function() {
        var t = new THREE.SpotLight;
        return THREE.Light.prototype.clone.call(this, t), t.target = this.target.clone(), t.intensity = this.intensity, t.distance = this.distance, t.angle = this.angle, t.exponent = this.exponent, t.decay = this.decay, t.castShadow = this.castShadow, t.onlyShadow = this.onlyShadow, t.shadowCameraNear = this.shadowCameraNear, t.shadowCameraFar = this.shadowCameraFar, t.shadowCameraFov = this.shadowCameraFov, t.shadowCameraVisible = this.shadowCameraVisible, t.shadowBias = this.shadowBias, t.shadowDarkness = this.shadowDarkness, t.shadowMapWidth = this.shadowMapWidth, t.shadowMapHeight = this.shadowMapHeight, t
    }, THREE.Cache = {
        files: {},
        add: function(t, e) {
            this.files[t] = e
        },
        get: function(t) {
            return this.files[t]
        },
        remove: function(t) {
            delete this.files[t]
        },
        clear: function() {
            this.files = {}
        }
    }, THREE.Loader = function(t) {
        this.showStatus = t, this.statusDomElement = t ? THREE.Loader.prototype.addStatusElement() : null, this.imageLoader = new THREE.ImageLoader, this.onLoadStart = function() {}, this.onLoadProgress = function() {}, this.onLoadComplete = function() {}
    }, THREE.Loader.prototype = {
        constructor: THREE.Loader,
        crossOrigin: void 0,
        addStatusElement: function() {
            var t = document.createElement("div");
            return t.style.position = "absolute", t.style.right = "0px", t.style.top = "0px", t.style.fontSize = "0.8em", t.style.textAlign = "left", t.style.background = "rgba(0,0,0,0.25)", t.style.color = "#fff", t.style.width = "120px", t.style.padding = "0.5em 0.5em 0.5em 0.5em", t.style.zIndex = 1e3, t.innerHTML = "Loading ...", t
        },
        updateProgress: function(t) {
            var e = "Loaded ";
            e += t.total ? (100 * t.loaded / t.total).toFixed(0) + "%" : (t.loaded / 1024).toFixed(2) + " KB", this.statusDomElement.innerHTML = e
        },
        extractUrlBase: function(t) {
            var e = t.split("/");
            return 1 === e.length ? "./" : (e.pop(), e.join("/") + "/")
        },
        initMaterials: function(t, e) {
            for (var r = [], i = 0; i < t.length; ++i) r[i] = this.createMaterial(t[i], e);
            return r
        },
        needsTangents: function(t) {
            for (var e = 0, r = t.length; e < r; e++) {
                var i = t[e];
                if (i instanceof THREE.ShaderMaterial) return !0
            }
            return !1
        },
        createMaterial: function(t, e) {
            function r(t) {
                var e = Math.log(t) / Math.LN2;
                return Math.pow(2, Math.round(e))
            }

            function i(t, i, n, o, s, h, l) {
                var c, u = e + n,
                    E = THREE.Loader.Handlers.get(u);
                if (null !== E ? c = E.load(u) : (c = new THREE.Texture, E = a.imageLoader, E.crossOrigin = a.crossOrigin, E.load(u, function(t) {
                        if (THREE.Math.isPowerOfTwo(t.width) === !1 || THREE.Math.isPowerOfTwo(t.height) === !1) {
                            var e = r(t.width),
                                i = r(t.height),
                                n = document.createElement("canvas");
                            n.width = e, n.height = i;
                            var a = n.getContext("2d");
                            a.drawImage(t, 0, 0, e, i), c.image = n
                        } else c.image = t;
                        c.needsUpdate = !0
                    })), c.sourceFile = n, o && (c.repeat.set(o[0], o[1]), 1 !== o[0] && (c.wrapS = THREE.RepeatWrapping), 1 !== o[1] && (c.wrapT = THREE.RepeatWrapping)), s && c.offset.set(s[0], s[1]), h) {
                    var f = {
                        repeat: THREE.RepeatWrapping,
                        mirror: THREE.MirroredRepeatWrapping
                    };
                    void 0 !== f[h[0]] && (c.wrapS = f[h[0]]), void 0 !== f[h[1]] && (c.wrapT = f[h[1]])
                }
                l && (c.anisotropy = l), t[i] = c
            }

            function n(t) {
                return (255 * t[0] << 16) + (255 * t[1] << 8) + 255 * t[2]
            }
            var a = this,
                o = "MeshLambertMaterial",
                s = {
                    color: 15658734,
                    opacity: 1,
                    map: null,
                    lightMap: null,
                    normalMap: null,
                    bumpMap: null,
                    wireframe: !1
                };
            if (t.shading) {
                var h = t.shading.toLowerCase();
                "phong" === h ? o = "MeshPhongMaterial" : "basic" === h && (o = "MeshBasicMaterial")
            }
            void 0 !== t.blending && void 0 !== THREE[t.blending] && (s.blending = THREE[t.blending]), void 0 !== t.transparent && (s.transparent = t.transparent), void 0 !== t.opacity && t.opacity < 1 && (s.transparent = !0), void 0 !== t.depthTest && (s.depthTest = t.depthTest), void 0 !== t.depthWrite && (s.depthWrite = t.depthWrite), void 0 !== t.visible && (s.visible = t.visible), void 0 !== t.flipSided && (s.side = THREE.BackSide), void 0 !== t.doubleSided && (s.side = THREE.DoubleSide), void 0 !== t.wireframe && (s.wireframe = t.wireframe), void 0 !== t.vertexColors && ("face" === t.vertexColors ? s.vertexColors = THREE.FaceColors : t.vertexColors && (s.vertexColors = THREE.VertexColors)), t.colorDiffuse ? s.color = n(t.colorDiffuse) : t.DbgColor && (s.color = t.DbgColor), t.colorSpecular && (s.specular = n(t.colorSpecular)), t.colorEmissive && (s.emissive = n(t.colorEmissive)), void 0 !== t.transparency && (console.warn("THREE.Loader: transparency has been renamed to opacity"), t.opacity = t.transparency), void 0 !== t.opacity && (s.opacity = t.opacity), t.specularCoef && (s.shininess = t.specularCoef), t.mapDiffuse && e && i(s, "map", t.mapDiffuse, t.mapDiffuseRepeat, t.mapDiffuseOffset, t.mapDiffuseWrap, t.mapDiffuseAnisotropy), t.mapLight && e && i(s, "lightMap", t.mapLight, t.mapLightRepeat, t.mapLightOffset, t.mapLightWrap, t.mapLightAnisotropy), t.mapBump && e && i(s, "bumpMap", t.mapBump, t.mapBumpRepeat, t.mapBumpOffset, t.mapBumpWrap, t.mapBumpAnisotropy), t.mapNormal && e && i(s, "normalMap", t.mapNormal, t.mapNormalRepeat, t.mapNormalOffset, t.mapNormalWrap, t.mapNormalAnisotropy), t.mapSpecular && e && i(s, "specularMap", t.mapSpecular, t.mapSpecularRepeat, t.mapSpecularOffset, t.mapSpecularWrap, t.mapSpecularAnisotropy), t.mapAlpha && e && i(s, "alphaMap", t.mapAlpha, t.mapAlphaRepeat, t.mapAlphaOffset, t.mapAlphaWrap, t.mapAlphaAnisotropy), t.mapBumpScale && (s.bumpScale = t.mapBumpScale), t.mapNormalFactor && (s.normalScale = new THREE.Vector2(t.mapNormalFactor, t.mapNormalFactor));
            var l = new THREE[o](s);
            return void 0 !== t.DbgName && (l.name = t.DbgName), l
        }
    }, THREE.Loader.Handlers = {
        handlers: [],
        add: function(t, e) {
            this.handlers.push(t, e)
        },
        get: function(t) {
            for (var e = 0, r = this.handlers.length; e < r; e += 2) {
                var i = this.handlers[e],
                    n = this.handlers[e + 1];
                if (i.test(t)) return n
            }
            return null
        }
    }, THREE.XHRLoader = function(t) {
        this.manager = void 0 !== t ? t : THREE.DefaultLoadingManager
    }, THREE.XHRLoader.prototype = {
        constructor: THREE.XHRLoader,
        load: function(t, e, r, i) {
            var n = this,
                a = THREE.Cache.get(t);
            if (void 0 !== a) return void(e && e(a));
            var o = new XMLHttpRequest;
            o.open("GET", t, !0), o.addEventListener("load", function(r) {
                THREE.Cache.add(t, this.response), e && e(this.response), n.manager.itemEnd(t)
            }, !1), void 0 !== r && o.addEventListener("progress", function(t) {
                r(t)
            }, !1), void 0 !== i && o.addEventListener("error", function(t) {
                i(t)
            }, !1), void 0 !== this.crossOrigin && (o.crossOrigin = this.crossOrigin), void 0 !== this.responseType && (o.responseType = this.responseType), o.send(null), n.manager.itemStart(t)
        },
        setResponseType: function(t) {
            this.responseType = t
        },
        setCrossOrigin: function(t) {
            this.crossOrigin = t
        }
    }, THREE.ImageLoader = function(t) {
        this.manager = void 0 !== t ? t : THREE.DefaultLoadingManager
    }, THREE.ImageLoader.prototype = {
        constructor: THREE.ImageLoader,
        load: function(t, e, r, i) {
            var n = this,
                a = THREE.Cache.get(t);
            if (void 0 !== a) return void e(a);
            var o = document.createElement("img");
            return o.addEventListener("load", function(r) {
                THREE.Cache.add(t, this), e && e(this), n.manager.itemEnd(t)
            }, !1), void 0 !== r && o.addEventListener("progress", function(t) {
                r(t)
            }, !1), void 0 !== i && o.addEventListener("error", function(t) {
                i(t)
            }, !1), void 0 !== this.crossOrigin && (o.crossOrigin = this.crossOrigin), o.src = t, n.manager.itemStart(t), o
        },
        setCrossOrigin: function(t) {
            this.crossOrigin = t
        }
    }, THREE.JSONLoader = function(t) {
        THREE.Loader.call(this, t), this.withCredentials = !1
    }, THREE.JSONLoader.prototype = Object.create(THREE.Loader.prototype), THREE.JSONLoader.prototype.constructor = THREE.JSONLoader, THREE.JSONLoader.prototype.load = function(t, e, r) {
        r = r && "string" == typeof r ? r : this.extractUrlBase(t), this.onLoadStart(), this.loadAjaxJSON(this, t, e, r)
    }, THREE.JSONLoader.prototype.loadAjaxJSON = function(t, e, r, i, n) {
        var a = new XMLHttpRequest,
            o = 0;
        a.onreadystatechange = function() {
            if (a.readyState === a.DONE)
                if (200 === a.status || 0 === a.status) {
                    if (a.responseText) {
                        var s = JSON.parse(a.responseText),
                            h = s.metadata;
                        if (void 0 !== h) {
                            if ("object" === h.type) return void THREE.error("THREE.JSONLoader: " + e + " should be loaded with THREE.ObjectLoader instead.");
                            if ("scene" === h.type) return void THREE.error("THREE.JSONLoader: " + e + " seems to be a Scene. Use THREE.SceneLoader instead.")
                        }
                        var l = t.parse(s, i);
                        r(l.geometry, l.materials)
                    } else THREE.error("THREE.JSONLoader: " + e + " seems to be unreachable or the file is empty.");
                    t.onLoadComplete()
                } else THREE.error("THREE.JSONLoader: Couldn't load " + e + " (" + a.status + ")");
            else a.readyState === a.LOADING ? n && (0 === o && (o = a.getResponseHeader("Content-Length")), n({
                total: o,
                loaded: a.responseText.length
            })) : a.readyState === a.HEADERS_RECEIVED && void 0 !== n && (o = a.getResponseHeader("Content-Length"))
        }, a.open("GET", e, !0), a.withCredentials = this.withCredentials, a.send(null)
    }, THREE.JSONLoader.prototype.parse = function(t, e) {
        function r(e) {
            function r(t, e) {
                return t & 1 << e
            }
            var i, n, o, s, h, l, c, u, E, f, p, d, m, T, g, v, R, y, H, x, b, _, w, M, S, A, C, L = t.faces,
                P = t.vertices,
                F = t.normals,
                U = t.colors,
                B = 0;
            if (void 0 !== t.uvs) {
                for (i = 0; i < t.uvs.length; i++) t.uvs[i].length && B++;
                for (i = 0; i < B; i++) a.faceVertexUvs[i] = []
            }
            for (s = 0, h = P.length; s < h;) y = new THREE.Vector3, y.x = P[s++] * e, y.y = P[s++] * e, y.z = P[s++] * e, a.vertices.push(y);
            for (s = 0, h = L.length; s < h;)
                if (f = L[s++], p = r(f, 0), d = r(f, 1), m = r(f, 3), T = r(f, 4), g = r(f, 5), v = r(f, 6), R = r(f, 7), p) {
                    if (x = new THREE.Face3, x.a = L[s], x.b = L[s + 1], x.c = L[s + 3], b = new THREE.Face3, b.a = L[s + 1], b.b = L[s + 2], b.c = L[s + 3], s += 4, d && (E = L[s++], x.materialIndex = E, b.materialIndex = E), o = a.faces.length, m)
                        for (i = 0; i < B; i++)
                            for (M = t.uvs[i], a.faceVertexUvs[i][o] = [], a.faceVertexUvs[i][o + 1] = [], n = 0; n < 4; n++) u = L[s++], A = M[2 * u], C = M[2 * u + 1], S = new THREE.Vector2(A, C), 2 !== n && a.faceVertexUvs[i][o].push(S), 0 !== n && a.faceVertexUvs[i][o + 1].push(S);
                    if (T && (c = 3 * L[s++], x.normal.set(F[c++], F[c++], F[c]), b.normal.copy(x.normal)), g)
                        for (i = 0; i < 4; i++) c = 3 * L[s++], w = new THREE.Vector3(F[c++], F[c++], F[c]), 2 !== i && x.vertexNormals.push(w), 0 !== i && b.vertexNormals.push(w);
                    if (v && (l = L[s++], _ = U[l], x.color.setHex(_), b.color.setHex(_)), R)
                        for (i = 0; i < 4; i++) l = L[s++], _ = U[l], 2 !== i && x.vertexColors.push(new THREE.Color(_)), 0 !== i && b.vertexColors.push(new THREE.Color(_));
                    a.faces.push(x), a.faces.push(b)
                } else {
                    if (H = new THREE.Face3, H.a = L[s++], H.b = L[s++], H.c = L[s++], d && (E = L[s++], H.materialIndex = E), o = a.faces.length, m)
                        for (i = 0; i < B; i++)
                            for (M = t.uvs[i], a.faceVertexUvs[i][o] = [], n = 0; n < 3; n++) u = L[s++], A = M[2 * u], C = M[2 * u + 1], S = new THREE.Vector2(A, C), a.faceVertexUvs[i][o].push(S);
                    if (T && (c = 3 * L[s++], H.normal.set(F[c++], F[c++], F[c])), g)
                        for (i = 0; i < 3; i++) c = 3 * L[s++], w = new THREE.Vector3(F[c++], F[c++], F[c]), H.vertexNormals.push(w);
                    if (v && (l = L[s++], H.color.setHex(U[l])), R)
                        for (i = 0; i < 3; i++) l = L[s++], H.vertexColors.push(new THREE.Color(U[l]));
                    a.faces.push(H)
                }
        }

        function i() {
            var e = void 0 !== t.influencesPerVertex ? t.influencesPerVertex : 2;
            if (t.skinWeights)
                for (var r = 0, i = t.skinWeights.length; r < i; r += e) {
                    var n = t.skinWeights[r],
                        o = e > 1 ? t.skinWeights[r + 1] : 0,
                        s = e > 2 ? t.skinWeights[r + 2] : 0,
                        h = e > 3 ? t.skinWeights[r + 3] : 0;
                    a.skinWeights.push(new THREE.Vector4(n, o, s, h))
                }
            if (t.skinIndices)
                for (var r = 0, i = t.skinIndices.length; r < i; r += e) {
                    var l = t.skinIndices[r],
                        c = e > 1 ? t.skinIndices[r + 1] : 0,
                        u = e > 2 ? t.skinIndices[r + 2] : 0,
                        E = e > 3 ? t.skinIndices[r + 3] : 0;
                    a.skinIndices.push(new THREE.Vector4(l, c, u, E))
                }
            a.bones = t.bones, a.bones && a.bones.length > 0 && (a.skinWeights.length !== a.skinIndices.length || a.skinIndices.length !== a.vertices.length) && THREE.warn("THREE.JSONLoader: When skinning, number of vertices (" + a.vertices.length + "), skinIndices (" + a.skinIndices.length + "), and skinWeights (" + a.skinWeights.length + ") should match."), a.animation = t.animation, a.animations = t.animations
        }

        function n(e) {
            if (void 0 !== t.morphTargets) {
                var r, i, n, o, s, h;
                for (r = 0, i = t.morphTargets.length; r < i; r++)
                    for (a.morphTargets[r] = {}, a.morphTargets[r].name = t.morphTargets[r].name, a.morphTargets[r].vertices = [], s = a.morphTargets[r].vertices, h = t.morphTargets[r].vertices, n = 0, o = h.length; n < o; n += 3) {
                        var l = new THREE.Vector3;
                        l.x = h[n] * e, l.y = h[n + 1] * e, l.z = h[n + 2] * e, s.push(l)
                    }
            }
            if (void 0 !== t.morphColors) {
                var r, i, c, u, E, f, p;
                for (r = 0, i = t.morphColors.length; r < i; r++)
                    for (a.morphColors[r] = {}, a.morphColors[r].name = t.morphColors[r].name,
                        a.morphColors[r].colors = [], E = a.morphColors[r].colors, f = t.morphColors[r].colors, c = 0, u = f.length; c < u; c += 3) p = new THREE.Color(16755200), p.setRGB(f[c], f[c + 1], f[c + 2]), E.push(p)
            }
        }
        var a = new THREE.Geometry,
            o = void 0 !== t.scale ? 1 / t.scale : 1;
        if (r(o), i(), n(o), a.computeFaceNormals(), a.computeBoundingSphere(), void 0 === t.materials || 0 === t.materials.length) return {
            geometry: a
        };
        var s = this.initMaterials(t.materials, e);
        return this.needsTangents(s) && a.computeTangents(), {
            geometry: a,
            materials: s
        }
    }, THREE.LoadingManager = function(t, e, r) {
        var i = this,
            n = 0,
            a = 0;
        this.onLoad = t, this.onProgress = e, this.onError = r, this.itemStart = function(t) {
            a++
        }, this.itemEnd = function(t) {
            n++, void 0 !== i.onProgress && i.onProgress(t, n, a), n === a && void 0 !== i.onLoad && i.onLoad()
        }
    }, THREE.DefaultLoadingManager = new THREE.LoadingManager, THREE.BufferGeometryLoader = function(t) {
        this.manager = void 0 !== t ? t : THREE.DefaultLoadingManager
    }, THREE.BufferGeometryLoader.prototype = {
        constructor: THREE.BufferGeometryLoader,
        load: function(t, e, r, i) {
            var n = this,
                a = new THREE.XHRLoader(n.manager);
            a.setCrossOrigin(this.crossOrigin), a.load(t, function(t) {
                e(n.parse(JSON.parse(t)))
            }, r, i)
        },
        setCrossOrigin: function(t) {
            this.crossOrigin = t
        },
        parse: function(t) {
            var e = new THREE.BufferGeometry,
                r = t.data.attributes;
            for (var i in r) {
                var n = r[i],
                    a = new self[n.type](n.array);
                e.addAttribute(i, new THREE.BufferAttribute(a, n.itemSize))
            }
            var o = t.data.offsets;
            void 0 !== o && (e.offsets = JSON.parse(JSON.stringify(o)));
            var s = t.data.boundingSphere;
            if (void 0 !== s) {
                var h = new THREE.Vector3;
                void 0 !== s.center && h.fromArray(s.center), e.boundingSphere = new THREE.Sphere(h, s.radius)
            }
            return e
        }
    }, THREE.MaterialLoader = function(t) {
        this.manager = void 0 !== t ? t : THREE.DefaultLoadingManager
    }, THREE.MaterialLoader.prototype = {
        constructor: THREE.MaterialLoader,
        load: function(t, e, r, i) {
            var n = this,
                a = new THREE.XHRLoader(n.manager);
            a.setCrossOrigin(this.crossOrigin), a.load(t, function(t) {
                e(n.parse(JSON.parse(t)))
            }, r, i)
        },
        setCrossOrigin: function(t) {
            this.crossOrigin = t
        },
        parse: function(t) {
            var e = new THREE[t.type];
            if (void 0 !== t.color && e.color.setHex(t.color), void 0 !== t.emissive && e.emissive.setHex(t.emissive), void 0 !== t.specular && e.specular.setHex(t.specular), void 0 !== t.shininess && (e.shininess = t.shininess), void 0 !== t.uniforms && (e.uniforms = t.uniforms), void 0 !== t.vertexShader && (e.vertexShader = t.vertexShader), void 0 !== t.fragmentShader && (e.fragmentShader = t.fragmentShader), void 0 !== t.vertexColors && (e.vertexColors = t.vertexColors), void 0 !== t.shading && (e.shading = t.shading), void 0 !== t.blending && (e.blending = t.blending), void 0 !== t.side && (e.side = t.side), void 0 !== t.opacity && (e.opacity = t.opacity), void 0 !== t.transparent && (e.transparent = t.transparent), void 0 !== t.wireframe && (e.wireframe = t.wireframe), void 0 !== t.size && (e.size = t.size), void 0 !== t.sizeAttenuation && (e.sizeAttenuation = t.sizeAttenuation), void 0 !== t.materials)
                for (var r = 0, i = t.materials.length; r < i; r++) e.materials.push(this.parse(t.materials[r]));
            return e
        }
    }, THREE.ObjectLoader = function(t) {
        this.manager = void 0 !== t ? t : THREE.DefaultLoadingManager, this.texturePath = ""
    }, THREE.ObjectLoader.prototype = {
        constructor: THREE.ObjectLoader,
        load: function(t, e, r, i) {
            "" === this.texturePath && (this.texturePath = t.substring(0, t.lastIndexOf("/") + 1));
            var n = this,
                a = new THREE.XHRLoader(n.manager);
            a.setCrossOrigin(this.crossOrigin), a.load(t, function(t) {
                n.parse(JSON.parse(t), e)
            }, r, i)
        },
        setTexturePath: function(t) {
            this.texturePath = t
        },
        setCrossOrigin: function(t) {
            this.crossOrigin = t
        },
        parse: function(t, e) {
            var r = this.parseGeometries(t.geometries),
                i = this.parseImages(t.images, function() {
                    void 0 !== e && e(o)
                }),
                n = this.parseTextures(t.textures, i),
                a = this.parseMaterials(t.materials, n),
                o = this.parseObject(t.object, r, a);
            return void 0 !== t.images && 0 !== t.images.length || void 0 !== e && e(o), o
        },
        parseGeometries: function(t) {
            var e = {};
            if (void 0 !== t)
                for (var r = new THREE.JSONLoader, i = new THREE.BufferGeometryLoader, n = 0, a = t.length; n < a; n++) {
                    var o, s = t[n];
                    switch (s.type) {
                        case "PlaneGeometry":
                        case "PlaneBufferGeometry":
                            o = new THREE[s.type](s.width, s.height, s.widthSegments, s.heightSegments);
                            break;
                        case "BoxGeometry":
                        case "CubeGeometry":
                            o = new THREE.BoxGeometry(s.width, s.height, s.depth, s.widthSegments, s.heightSegments, s.depthSegments);
                            break;
                        case "CircleGeometry":
                            o = new THREE.CircleGeometry(s.radius, s.segments);
                            break;
                        case "CylinderGeometry":
                            o = new THREE.CylinderGeometry(s.radiusTop, s.radiusBottom, s.height, s.radialSegments, s.heightSegments, s.openEnded);
                            break;
                        case "SphereGeometry":
                            o = new THREE.SphereGeometry(s.radius, s.widthSegments, s.heightSegments, s.phiStart, s.phiLength, s.thetaStart, s.thetaLength);
                            break;
                        case "IcosahedronGeometry":
                            o = new THREE.IcosahedronGeometry(s.radius, s.detail);
                            break;
                        case "TorusGeometry":
                            o = new THREE.TorusGeometry(s.radius, s.tube, s.radialSegments, s.tubularSegments, s.arc);
                            break;
                        case "TorusKnotGeometry":
                            o = new THREE.TorusKnotGeometry(s.radius, s.tube, s.radialSegments, s.tubularSegments, s.p, s.q, s.heightScale);
                            break;
                        case "BufferGeometry":
                            o = i.parse(s);
                            break;
                        case "Geometry":
                            o = r.parse(s.data).geometry
                    }
                    o.uuid = s.uuid, void 0 !== s.name && (o.name = s.name), e[s.uuid] = o
                }
            return e
        },
        parseMaterials: function(t, e) {
            var r = {};
            if (void 0 !== t)
                for (var i = function(t) {
                        return void 0 === e[t] && THREE.warn("THREE.ObjectLoader: Undefined texture", t), e[t]
                    }, n = new THREE.MaterialLoader, a = 0, o = t.length; a < o; a++) {
                    var s = t[a],
                        h = n.parse(s);
                    h.uuid = s.uuid, void 0 !== s.name && (h.name = s.name), void 0 !== s.map && (h.map = i(s.map)), void 0 !== s.bumpMap && (h.bumpMap = i(s.bumpMap), s.bumpScale && (h.bumpScale = new THREE.Vector2(s.bumpScale, s.bumpScale))), void 0 !== s.alphaMap && (h.alphaMap = i(s.alphaMap)), void 0 !== s.envMap && (h.envMap = i(s.envMap)), void 0 !== s.normalMap && (h.normalMap = i(s.normalMap), s.normalScale && (h.normalScale = new THREE.Vector2(s.normalScale, s.normalScale))), void 0 !== s.lightMap && (h.lightMap = i(s.lightMap)), void 0 !== s.specularMap && (h.specularMap = i(s.specularMap)), r[s.uuid] = h
                }
            return r
        },
        parseImages: function(t, e) {
            var r = this,
                i = {};
            if (void 0 !== t && t.length > 0) {
                var n = new THREE.LoadingManager(e),
                    a = new THREE.ImageLoader(n);
                a.setCrossOrigin(this.crossOrigin);
                for (var o = function(t) {
                        return r.manager.itemStart(t), a.load(t, function() {
                            r.manager.itemEnd(t)
                        })
                    }, s = 0, h = t.length; s < h; s++) {
                    var l = t[s],
                        c = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(l.url) ? l.url : r.texturePath + l.url;
                    i[l.uuid] = o(c)
                }
            }
            return i
        },
        parseTextures: function(t, e) {
            var r = {};
            if (void 0 !== t)
                for (var i = 0, n = t.length; i < n; i++) {
                    var a = t[i];
                    void 0 === a.image && THREE.warn('THREE.ObjectLoader: No "image" speficied for', a.uuid), void 0 === e[a.image] && THREE.warn("THREE.ObjectLoader: Undefined image", a.image);
                    var o = new THREE.Texture(e[a.image]);
                    o.needsUpdate = !0, o.uuid = a.uuid, void 0 !== a.name && (o.name = a.name), void 0 !== a.repeat && (o.repeat = new THREE.Vector2(a.repeat[0], a.repeat[1])), void 0 !== a.minFilter && (o.minFilter = THREE[a.minFilter]), void 0 !== a.magFilter && (o.magFilter = THREE[a.magFilter]), void 0 !== a.anisotropy && (o.anisotropy = a.anisotropy), a.wrap instanceof Array && (o.wrapS = THREE[a.wrap[0]], o.wrapT = THREE[a.wrap[1]]), r[a.uuid] = o
                }
            return r
        },
        parseObject: function() {
            var t = new THREE.Matrix4;
            return function(e, r, i) {
                var n, a = function(t) {
                        return void 0 === r[t] && THREE.warn("THREE.ObjectLoader: Undefined geometry", t), r[t]
                    },
                    o = function(t) {
                        return void 0 === i[t] && THREE.warn("THREE.ObjectLoader: Undefined material", t), i[t]
                    };
                switch (e.type) {
                    case "Scene":
                        n = new THREE.Scene;
                        break;
                    case "PerspectiveCamera":
                        n = new THREE.PerspectiveCamera(e.fov, e.aspect, e.near, e.far);
                        break;
                    case "OrthographicCamera":
                        n = new THREE.OrthographicCamera(e.left, e.right, e.top, e.bottom, e.near, e.far);
                        break;
                    case "AmbientLight":
                        n = new THREE.AmbientLight(e.color);
                        break;
                    case "DirectionalLight":
                        n = new THREE.DirectionalLight(e.color, e.intensity);
                        break;
                    case "PointLight":
                        n = new THREE.PointLight(e.color, e.intensity, e.distance, e.decay);
                        break;
                    case "SpotLight":
                        n = new THREE.SpotLight(e.color, e.intensity, e.distance, e.angle, e.exponent, e.decay);
                        break;
                    case "HemisphereLight":
                        n = new THREE.HemisphereLight(e.color, e.groundColor, e.intensity);
                        break;
                    case "Mesh":
                        n = new THREE.Mesh(a(e.geometry), o(e.material));
                        break;
                    case "Line":
                        n = new THREE.Line(a(e.geometry), o(e.material), e.mode);
                        break;
                    case "PointCloud":
                        n = new THREE.PointCloud(a(e.geometry), o(e.material));
                        break;
                    case "Sprite":
                        n = new THREE.Sprite(o(e.material));
                        break;
                    case "Group":
                        n = new THREE.Group;
                        break;
                    default:
                        n = new THREE.Object3D
                }
                if (n.uuid = e.uuid, void 0 !== e.name && (n.name = e.name), void 0 !== e.matrix ? (t.fromArray(e.matrix), t.decompose(n.position, n.quaternion, n.scale)) : (void 0 !== e.position && n.position.fromArray(e.position), void 0 !== e.rotation && n.rotation.fromArray(e.rotation), void 0 !== e.scale && n.scale.fromArray(e.scale)), void 0 !== e.visible && (n.visible = e.visible), void 0 !== e.userData && (n.userData = e.userData), void 0 !== e.children)
                    for (var s in e.children) n.add(this.parseObject(e.children[s], r, i));
                return n
            }
        }()
    }, THREE.TextureLoader = function(t) {
        this.manager = void 0 !== t ? t : THREE.DefaultLoadingManager
    }, THREE.TextureLoader.prototype = {
        constructor: THREE.TextureLoader,
        load: function(t, e, r, i) {
            var n = this,
                a = new THREE.ImageLoader(n.manager);
            a.setCrossOrigin(this.crossOrigin), a.load(t, function(t) {
                var r = new THREE.Texture(t);
                r.needsUpdate = !0, void 0 !== e && e(r)
            }, r, i)
        },
        setCrossOrigin: function(t) {
            this.crossOrigin = t
        }
    }, THREE.DataTextureLoader = THREE.BinaryTextureLoader = function() {
        this._parser = null
    }, THREE.BinaryTextureLoader.prototype = {
        constructor: THREE.BinaryTextureLoader,
        load: function(t, e, r, i) {
            var n = this,
                a = new THREE.DataTexture,
                o = new THREE.XHRLoader;
            return o.setResponseType("arraybuffer"), o.load(t, function(t) {
                var r = n._parser(t);
                r && (void 0 !== r.image ? a.image = r.image : void 0 !== r.data && (a.image.width = r.width, a.image.height = r.height, a.image.data = r.data), a.wrapS = void 0 !== r.wrapS ? r.wrapS : THREE.ClampToEdgeWrapping, a.wrapT = void 0 !== r.wrapT ? r.wrapT : THREE.ClampToEdgeWrapping, a.magFilter = void 0 !== r.magFilter ? r.magFilter : THREE.LinearFilter, a.minFilter = void 0 !== r.minFilter ? r.minFilter : THREE.LinearMipMapLinearFilter, a.anisotropy = void 0 !== r.anisotropy ? r.anisotropy : 1, void 0 !== r.format && (a.format = r.format), void 0 !== r.type && (a.type = r.type), void 0 !== r.mipmaps && (a.mipmaps = r.mipmaps), 1 === r.mipmapCount && (a.minFilter = THREE.LinearFilter), a.needsUpdate = !0, e && e(a, r))
            }, r, i), a
        }
    }, THREE.CompressedTextureLoader = function() {
        this._parser = null
    }, THREE.CompressedTextureLoader.prototype = {
        constructor: THREE.CompressedTextureLoader,
        load: function(t, e, r) {
            var i = this,
                n = [],
                a = new THREE.CompressedTexture;
            a.image = n;
            var o = new THREE.XHRLoader;
            if (o.setResponseType("arraybuffer"), t instanceof Array)
                for (var s = 0, h = function(r) {
                        o.load(t[r], function(t) {
                            var o = i._parser(t, !0);
                            n[r] = {
                                width: o.width,
                                height: o.height,
                                format: o.format,
                                mipmaps: o.mipmaps
                            }, s += 1, 6 === s && (1 == o.mipmapCount && (a.minFilter = THREE.LinearFilter), a.format = o.format, a.needsUpdate = !0, e && e(a))
                        })
                    }, l = 0, c = t.length; l < c; ++l) h(l);
            else o.load(t, function(t) {
                var r = i._parser(t, !0);
                if (r.isCubemap)
                    for (var o = r.mipmaps.length / r.mipmapCount, s = 0; s < o; s++) {
                        n[s] = {
                            mipmaps: []
                        };
                        for (var h = 0; h < r.mipmapCount; h++) n[s].mipmaps.push(r.mipmaps[s * r.mipmapCount + h]), n[s].format = r.format, n[s].width = r.width, n[s].height = r.height
                    } else a.image.width = r.width, a.image.height = r.height, a.mipmaps = r.mipmaps;
                1 === r.mipmapCount && (a.minFilter = THREE.LinearFilter), a.format = r.format, a.needsUpdate = !0, e && e(a)
            });
            return a
        }
    }, THREE.Material = function() {
        Object.defineProperty(this, "id", {
            value: THREE.MaterialIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Material", this.side = THREE.FrontSide, this.opacity = 1, this.transparent = !1, this.blending = THREE.NormalBlending, this.blendSrc = THREE.SrcAlphaFactor, this.blendDst = THREE.OneMinusSrcAlphaFactor, this.blendEquation = THREE.AddEquation, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.depthTest = !0, this.depthWrite = !0, this.colorWrite = !0, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.alphaTest = 0, this.overdraw = 0, this.visible = !0, this._needsUpdate = !0
    }, THREE.Material.prototype = {
        constructor: THREE.Material,
        get needsUpdate() {
            return this._needsUpdate
        },
        set needsUpdate(t) {
            t === !0 && this.update(), this._needsUpdate = t
        },
        setValues: function(t) {
            if (void 0 !== t)
                for (var e in t) {
                    var r = t[e];
                    if (void 0 !== r) {
                        if (e in this) {
                            var i = this[e];
                            i instanceof THREE.Color ? i.set(r) : i instanceof THREE.Vector3 && r instanceof THREE.Vector3 ? i.copy(r) : "overdraw" == e ? this[e] = Number(r) : this[e] = r
                        }
                    } else THREE.warn("THREE.Material: '" + e + "' parameter is undefined.")
                }
        },
        toJSON: function() {
            var t = {
                metadata: {
                    version: 4.2,
                    type: "material",
                    generator: "MaterialExporter"
                },
                uuid: this.uuid,
                type: this.type
            };
            return "" !== this.name && (t.name = this.name), this instanceof THREE.MeshBasicMaterial ? (t.color = this.color.getHex(), this.vertexColors !== THREE.NoColors && (t.vertexColors = this.vertexColors), this.blending !== THREE.NormalBlending && (t.blending = this.blending), this.side !== THREE.FrontSide && (t.side = this.side)) : this instanceof THREE.MeshLambertMaterial ? (t.color = this.color.getHex(), t.emissive = this.emissive.getHex(), this.vertexColors !== THREE.NoColors && (t.vertexColors = this.vertexColors), this.shading !== THREE.SmoothShading && (t.shading = this.shading), this.blending !== THREE.NormalBlending && (t.blending = this.blending), this.side !== THREE.FrontSide && (t.side = this.side)) : this instanceof THREE.MeshPhongMaterial ? (t.color = this.color.getHex(), t.emissive = this.emissive.getHex(), t.specular = this.specular.getHex(), t.shininess = this.shininess, this.vertexColors !== THREE.NoColors && (t.vertexColors = this.vertexColors), this.shading !== THREE.SmoothShading && (t.shading = this.shading), this.blending !== THREE.NormalBlending && (t.blending = this.blending), this.side !== THREE.FrontSide && (t.side = this.side)) : this instanceof THREE.MeshNormalMaterial ? (this.blending !== THREE.NormalBlending && (t.blending = this.blending), this.side !== THREE.FrontSide && (t.side = this.side)) : this instanceof THREE.MeshDepthMaterial ? (this.blending !== THREE.NormalBlending && (t.blending = this.blending), this.side !== THREE.FrontSide && (t.side = this.side)) : this instanceof THREE.PointCloudMaterial ? (t.size = this.size, t.sizeAttenuation = this.sizeAttenuation, t.color = this.color.getHex(), this.vertexColors !== THREE.NoColors && (t.vertexColors = this.vertexColors), this.blending !== THREE.NormalBlending && (t.blending = this.blending)) : this instanceof THREE.ShaderMaterial ? (t.uniforms = this.uniforms, t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader) : this instanceof THREE.SpriteMaterial && (t.color = this.color.getHex()), this.opacity < 1 && (t.opacity = this.opacity), this.transparent !== !1 && (t.transparent = this.transparent), this.wireframe !== !1 && (t.wireframe = this.wireframe), t
        },
        clone: function(t) {
            return void 0 === t && (t = new THREE.Material), t.name = this.name, t.side = this.side, t.opacity = this.opacity, t.transparent = this.transparent, t.blending = this.blending, t.blendSrc = this.blendSrc, t.blendDst = this.blendDst, t.blendEquation = this.blendEquation, t.blendSrcAlpha = this.blendSrcAlpha, t.blendDstAlpha = this.blendDstAlpha, t.blendEquationAlpha = this.blendEquationAlpha, t.depthTest = this.depthTest, t.depthWrite = this.depthWrite, t.polygonOffset = this.polygonOffset, t.polygonOffsetFactor = this.polygonOffsetFactor, t.polygonOffsetUnits = this.polygonOffsetUnits, t.alphaTest = this.alphaTest, t.overdraw = this.overdraw, t.visible = this.visible, t
        },
        update: function() {
            this.dispatchEvent({
                type: "update"
            })
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }, THREE.EventDispatcher.prototype.apply(THREE.Material.prototype), THREE.MaterialIdCount = 0, THREE.LineBasicMaterial = function(t) {
        THREE.Material.call(this), this.type = "LineBasicMaterial", this.color = new THREE.Color(16777215), this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.vertexColors = THREE.NoColors, this.fog = !0, this.setValues(t)
    }, THREE.LineBasicMaterial.prototype = Object.create(THREE.Material.prototype), THREE.LineBasicMaterial.prototype.constructor = THREE.LineBasicMaterial, THREE.LineBasicMaterial.prototype.clone = function() {
        var t = new THREE.LineBasicMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.color.copy(this.color), t.linewidth = this.linewidth, t.linecap = this.linecap, t.linejoin = this.linejoin, t.vertexColors = this.vertexColors, t.fog = this.fog, t
    }, THREE.LineDashedMaterial = function(t) {
        THREE.Material.call(this), this.type = "LineDashedMaterial", this.color = new THREE.Color(16777215), this.linewidth = 1, this.scale = 1, this.dashSize = 3, this.gapSize = 1, this.vertexColors = !1, this.fog = !0, this.setValues(t)
    }, THREE.LineDashedMaterial.prototype = Object.create(THREE.Material.prototype), THREE.LineDashedMaterial.prototype.constructor = THREE.LineDashedMaterial, THREE.LineDashedMaterial.prototype.clone = function() {
        var t = new THREE.LineDashedMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.color.copy(this.color), t.linewidth = this.linewidth, t.scale = this.scale, t.dashSize = this.dashSize, t.gapSize = this.gapSize, t.vertexColors = this.vertexColors, t.fog = this.fog, t
    }, THREE.MeshBasicMaterial = function(t) {
        THREE.Material.call(this), this.type = "MeshBasicMaterial", this.color = new THREE.Color(16777215), this.map = null, this.lightMap = null, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.fog = !0, this.shading = THREE.SmoothShading, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.setValues(t)
    }, THREE.MeshBasicMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshBasicMaterial.prototype.constructor = THREE.MeshBasicMaterial, THREE.MeshBasicMaterial.prototype.clone = function() {
        var t = new THREE.MeshBasicMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.color.copy(this.color), t.map = this.map, t.lightMap = this.lightMap, t.specularMap = this.specularMap, t.alphaMap = this.alphaMap, t.envMap = this.envMap, t.combine = this.combine, t.reflectivity = this.reflectivity, t.refractionRatio = this.refractionRatio, t.fog = this.fog, t.shading = this.shading, t.wireframe = this.wireframe, t.wireframeLinewidth = this.wireframeLinewidth, t.wireframeLinecap = this.wireframeLinecap, t.wireframeLinejoin = this.wireframeLinejoin, t.vertexColors = this.vertexColors, t.skinning = this.skinning, t.morphTargets = this.morphTargets, t
    }, THREE.MeshLambertMaterial = function(t) {
        THREE.Material.call(this), this.type = "MeshLambertMaterial", this.color = new THREE.Color(16777215), this.emissive = new THREE.Color(0), this.wrapAround = !1, this.wrapRGB = new THREE.Vector3(1, 1, 1), this.map = null, this.lightMap = null, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.fog = !0, this.shading = THREE.SmoothShading, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.morphNormals = !1, this.setValues(t)
    }, THREE.MeshLambertMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshLambertMaterial.prototype.constructor = THREE.MeshLambertMaterial, THREE.MeshLambertMaterial.prototype.clone = function() {
        var t = new THREE.MeshLambertMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.color.copy(this.color), t.emissive.copy(this.emissive), t.wrapAround = this.wrapAround, t.wrapRGB.copy(this.wrapRGB), t.map = this.map, t.lightMap = this.lightMap, t.specularMap = this.specularMap, t.alphaMap = this.alphaMap, t.envMap = this.envMap, t.combine = this.combine, t.reflectivity = this.reflectivity, t.refractionRatio = this.refractionRatio, t.fog = this.fog, t.shading = this.shading, t.wireframe = this.wireframe, t.wireframeLinewidth = this.wireframeLinewidth, t.wireframeLinecap = this.wireframeLinecap, t.wireframeLinejoin = this.wireframeLinejoin, t.vertexColors = this.vertexColors, t.skinning = this.skinning, t.morphTargets = this.morphTargets, t.morphNormals = this.morphNormals, t
    }, THREE.MeshPhongMaterial = function(t) {
        THREE.Material.call(this), this.type = "MeshPhongMaterial", this.color = new THREE.Color(16777215), this.emissive = new THREE.Color(0), this.specular = new THREE.Color(1118481), this.shininess = 30, this.metal = !1, this.wrapAround = !1, this.wrapRGB = new THREE.Vector3(1, 1, 1), this.map = null, this.lightMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalScale = new THREE.Vector2(1, 1), this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.fog = !0, this.shading = THREE.SmoothShading, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.morphNormals = !1, this.setValues(t)
    }, THREE.MeshPhongMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshPhongMaterial.prototype.constructor = THREE.MeshPhongMaterial, THREE.MeshPhongMaterial.prototype.clone = function() {
        var t = new THREE.MeshPhongMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.color.copy(this.color), t.emissive.copy(this.emissive), t.specular.copy(this.specular), t.shininess = this.shininess, t.metal = this.metal, t.wrapAround = this.wrapAround, t.wrapRGB.copy(this.wrapRGB), t.map = this.map, t.lightMap = this.lightMap, t.bumpMap = this.bumpMap, t.bumpScale = this.bumpScale, t.normalMap = this.normalMap, t.normalScale.copy(this.normalScale), t.specularMap = this.specularMap, t.alphaMap = this.alphaMap, t.envMap = this.envMap, t.combine = this.combine, t.reflectivity = this.reflectivity, t.refractionRatio = this.refractionRatio, t.fog = this.fog, t.shading = this.shading, t.wireframe = this.wireframe, t.wireframeLinewidth = this.wireframeLinewidth, t.wireframeLinecap = this.wireframeLinecap, t.wireframeLinejoin = this.wireframeLinejoin, t.vertexColors = this.vertexColors, t.skinning = this.skinning, t.morphTargets = this.morphTargets, t.morphNormals = this.morphNormals, t
    }, THREE.MeshDepthMaterial = function(t) {
        THREE.Material.call(this), this.type = "MeshDepthMaterial", this.morphTargets = !1, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t)
    }, THREE.MeshDepthMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshDepthMaterial.prototype.constructor = THREE.MeshDepthMaterial, THREE.MeshDepthMaterial.prototype.clone = function() {
        var t = new THREE.MeshDepthMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.wireframe = this.wireframe, t.wireframeLinewidth = this.wireframeLinewidth, t
    }, THREE.MeshNormalMaterial = function(t) {
        THREE.Material.call(this, t), this.type = "MeshNormalMaterial", this.wireframe = !1, this.wireframeLinewidth = 1, this.morphTargets = !1, this.setValues(t)
    }, THREE.MeshNormalMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshNormalMaterial.prototype.constructor = THREE.MeshNormalMaterial, THREE.MeshNormalMaterial.prototype.clone = function() {
        var t = new THREE.MeshNormalMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.wireframe = this.wireframe, t.wireframeLinewidth = this.wireframeLinewidth, t
    }, THREE.MeshFaceMaterial = function(t) {
        this.uuid = THREE.Math.generateUUID(), this.type = "MeshFaceMaterial", this.materials = t instanceof Array ? t : []
    }, THREE.MeshFaceMaterial.prototype = {
        constructor: THREE.MeshFaceMaterial,
        toJSON: function() {
            for (var t = {
                    metadata: {
                        version: 4.2,
                        type: "material",
                        generator: "MaterialExporter"
                    },
                    uuid: this.uuid,
                    type: this.type,
                    materials: []
                }, e = 0, r = this.materials.length; e < r; e++) t.materials.push(this.materials[e].toJSON());
            return t
        },
        clone: function() {
            for (var t = new THREE.MeshFaceMaterial, e = 0; e < this.materials.length; e++) t.materials.push(this.materials[e].clone());
            return t
        }
    }, THREE.PointCloudMaterial = function(t) {
        THREE.Material.call(this), this.type = "PointCloudMaterial", this.color = new THREE.Color(16777215), this.map = null, this.size = 1, this.sizeAttenuation = !0, this.vertexColors = THREE.NoColors, this.fog = !0, this.setValues(t)
    }, THREE.PointCloudMaterial.prototype = Object.create(THREE.Material.prototype), THREE.PointCloudMaterial.prototype.constructor = THREE.PointCloudMaterial, THREE.PointCloudMaterial.prototype.clone = function() {
        var t = new THREE.PointCloudMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.color.copy(this.color), t.map = this.map, t.size = this.size, t.sizeAttenuation = this.sizeAttenuation, t.vertexColors = this.vertexColors, t.fog = this.fog, t
    }, THREE.ParticleBasicMaterial = function(t) {
        return THREE.warn("THREE.ParticleBasicMaterial has been renamed to THREE.PointCloudMaterial."), new THREE.PointCloudMaterial(t)
    }, THREE.ParticleSystemMaterial = function(t) {
        return THREE.warn("THREE.ParticleSystemMaterial has been renamed to THREE.PointCloudMaterial."), new THREE.PointCloudMaterial(t)
    }, THREE.ShaderMaterial = function(t) {
        THREE.Material.call(this), this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.attributes = null, this.vertexShader = "void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", this.fragmentShader = "void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", this.shading = THREE.SmoothShading, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.vertexColors = THREE.NoColors, this.skinning = !1, this.morphTargets = !1, this.morphNormals = !1, this.defaultAttributeValues = {
            color: [1, 1, 1],
            uv: [0, 0],
            uv2: [0, 0]
        }, this.index0AttributeName = void 0, this.setValues(t)
    }, THREE.ShaderMaterial.prototype = Object.create(THREE.Material.prototype), THREE.ShaderMaterial.prototype.constructor = THREE.ShaderMaterial, THREE.ShaderMaterial.prototype.clone = function() {
        var t = new THREE.ShaderMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.fragmentShader = this.fragmentShader, t.vertexShader = this.vertexShader, t.uniforms = THREE.UniformsUtils.clone(this.uniforms), t.attributes = this.attributes, t.defines = this.defines, t.shading = this.shading, t.wireframe = this.wireframe, t.wireframeLinewidth = this.wireframeLinewidth, t.fog = this.fog, t.lights = this.lights, t.vertexColors = this.vertexColors, t.skinning = this.skinning, t.morphTargets = this.morphTargets, t.morphNormals = this.morphNormals, t
    }, THREE.RawShaderMaterial = function(t) {
        THREE.ShaderMaterial.call(this, t), this.type = "RawShaderMaterial"
    }, THREE.RawShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype), THREE.RawShaderMaterial.prototype.constructor = THREE.RawShaderMaterial, THREE.RawShaderMaterial.prototype.clone = function() {
        var t = new THREE.RawShaderMaterial;
        return THREE.ShaderMaterial.prototype.clone.call(this, t), t
    }, THREE.SpriteMaterial = function(t) {
        THREE.Material.call(this), this.type = "SpriteMaterial", this.color = new THREE.Color(16777215), this.map = null, this.rotation = 0, this.fog = !1, this.setValues(t)
    }, THREE.SpriteMaterial.prototype = Object.create(THREE.Material.prototype), THREE.SpriteMaterial.prototype.constructor = THREE.SpriteMaterial, THREE.SpriteMaterial.prototype.clone = function() {
        var t = new THREE.SpriteMaterial;
        return THREE.Material.prototype.clone.call(this, t), t.color.copy(this.color), t.map = this.map, t.rotation = this.rotation, t.fog = this.fog, t
    }, THREE.Texture = function(t, e, r, i, n, a, o, s, h) {
        Object.defineProperty(this, "id", {
            value: THREE.TextureIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.sourceFile = "", this.image = void 0 !== t ? t : THREE.Texture.DEFAULT_IMAGE, this.mipmaps = [], this.mapping = void 0 !== e ? e : THREE.Texture.DEFAULT_MAPPING, this.wrapS = void 0 !== r ? r : THREE.ClampToEdgeWrapping, this.wrapT = void 0 !== i ? i : THREE.ClampToEdgeWrapping, this.magFilter = void 0 !== n ? n : THREE.LinearFilter, this.minFilter = void 0 !== a ? a : THREE.LinearMipMapLinearFilter, this.anisotropy = void 0 !== h ? h : 1, this.format = void 0 !== o ? o : THREE.RGBAFormat, this.type = void 0 !== s ? s : THREE.UnsignedByteType, this.offset = new THREE.Vector2(0, 0), this.repeat = new THREE.Vector2(1, 1), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this._needsUpdate = !1, this.onUpdate = null
    }, THREE.Texture.DEFAULT_IMAGE = void 0, THREE.Texture.DEFAULT_MAPPING = THREE.UVMapping, THREE.Texture.prototype = {
        constructor: THREE.Texture,
        get needsUpdate() {
            return this._needsUpdate
        },
        set needsUpdate(t) {
            t === !0 && this.update(), this._needsUpdate = t
        },
        clone: function(t) {
            return void 0 === t && (t = new THREE.Texture), t.image = this.image, t.mipmaps = this.mipmaps.slice(0), t.mapping = this.mapping, t.wrapS = this.wrapS, t.wrapT = this.wrapT, t.magFilter = this.magFilter, t.minFilter = this.minFilter, t.anisotropy = this.anisotropy, t.format = this.format, t.type = this.type, t.offset.copy(this.offset), t.repeat.copy(this.repeat), t.generateMipmaps = this.generateMipmaps, t.premultiplyAlpha = this.premultiplyAlpha, t.flipY = this.flipY, t.unpackAlignment = this.unpackAlignment, t
        },
        update: function() {
            this.dispatchEvent({
                type: "update"
            })
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }, THREE.EventDispatcher.prototype.apply(THREE.Texture.prototype), THREE.TextureIdCount = 0, THREE.CubeTexture = function(t, e, r, i, n, a, o, s, h) {
        e = void 0 !== e ? e : THREE.CubeReflectionMapping, THREE.Texture.call(this, t, e, r, i, n, a, o, s, h), this.images = t
    }, THREE.CubeTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CubeTexture.prototype.constructor = THREE.CubeTexture, THREE.CubeTexture.clone = function(t) {
        return void 0 === t && (t = new THREE.CubeTexture), THREE.Texture.prototype.clone.call(this, t), t.images = this.images, t
    }, THREE.CompressedTexture = function(t, e, r, i, n, a, o, s, h, l, c) {
        THREE.Texture.call(this, null, a, o, s, h, l, i, n, c), this.image = {
            width: e,
            height: r
        }, this.mipmaps = t, this.flipY = !1, this.generateMipmaps = !1
    }, THREE.CompressedTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CompressedTexture.prototype.constructor = THREE.CompressedTexture, THREE.CompressedTexture.prototype.clone = function() {
        var t = new THREE.CompressedTexture;
        return THREE.Texture.prototype.clone.call(this, t), t
    }, THREE.DataTexture = function(t, e, r, i, n, a, o, s, h, l, c) {
        THREE.Texture.call(this, null, a, o, s, h, l, i, n, c), this.image = {
            data: t,
            width: e,
            height: r
        }
    }, THREE.DataTexture.prototype = Object.create(THREE.Texture.prototype), THREE.DataTexture.prototype.constructor = THREE.DataTexture, THREE.DataTexture.prototype.clone = function() {
        var t = new THREE.DataTexture;
        return THREE.Texture.prototype.clone.call(this, t), t
    }, THREE.VideoTexture = function(t, e, r, i, n, a, o, s, h) {
        THREE.Texture.call(this, t, e, r, i, n, a, o, s, h), this.generateMipmaps = !1;
        var l = this,
            c = function() {
                requestAnimationFrame(c), t.readyState === t.HAVE_ENOUGH_DATA && (l.needsUpdate = !0)
            };
        c()
    }, THREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype), THREE.VideoTexture.prototype.constructor = THREE.VideoTexture, THREE.Group = function() {
        THREE.Object3D.call(this), this.type = "Group"
    }, THREE.Group.prototype = Object.create(THREE.Object3D.prototype), THREE.Group.prototype.constructor = THREE.Group, THREE.PointCloud = function(t, e) {
        THREE.Object3D.call(this), this.type = "PointCloud", this.geometry = void 0 !== t ? t : new THREE.Geometry, this.material = void 0 !== e ? e : new THREE.PointCloudMaterial({
            color: 16777215 * Math.random()
        })
    }, THREE.PointCloud.prototype = Object.create(THREE.Object3D.prototype), THREE.PointCloud.prototype.constructor = THREE.PointCloud, THREE.PointCloud.prototype.raycast = function() {
        var t = new THREE.Matrix4,
            e = new THREE.Ray;
        return function(r, i) {
            var n = this,
                a = n.geometry,
                o = r.params.PointCloud.threshold;
            if (t.getInverse(this.matrixWorld), e.copy(r.ray).applyMatrix4(t), null === a.boundingBox || e.isIntersectionBox(a.boundingBox) !== !1) {
                var s = o / ((this.scale.x + this.scale.y + this.scale.z) / 3),
                    h = new THREE.Vector3,
                    l = function(t, a) {
                        var o = e.distanceToPoint(t);
                        if (o < s) {
                            var h = e.closestPointToPoint(t);
                            h.applyMatrix4(n.matrixWorld);
                            var l = r.ray.origin.distanceTo(h);
                            i.push({
                                distance: l,
                                distanceToRay: o,
                                point: h.clone(),
                                index: a,
                                face: null,
                                object: n
                            })
                        }
                    };
                if (a instanceof THREE.BufferGeometry) {
                    var c = a.attributes,
                        u = c.position.array;
                    if (void 0 !== c.index) {
                        var E = c.index.array,
                            f = a.offsets;
                        if (0 === f.length) {
                            var p = {
                                start: 0,
                                count: E.length,
                                index: 0
                            };
                            f = [p]
                        }
                        for (var d = 0, m = f.length; d < m; ++d)
                            for (var T = f[d].start, g = f[d].count, v = f[d].index, R = T, y = T + g; R < y; R++) {
                                var H = v + E[R];
                                h.fromArray(u, 3 * H), l(h, H)
                            }
                    } else
                        for (var x = u.length / 3, R = 0; R < x; R++) h.set(u[3 * R], u[3 * R + 1], u[3 * R + 2]), l(h, R)
                } else
                    for (var b = this.geometry.vertices, R = 0; R < b.length; R++) l(b[R], R)
            }
        }
    }(), THREE.PointCloud.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.PointCloud(this.geometry, this.material)), THREE.Object3D.prototype.clone.call(this, t), t
    }, THREE.ParticleSystem = function(t, e) {
        return THREE.warn("THREE.ParticleSystem has been renamed to THREE.PointCloud."), new THREE.PointCloud(t, e)
    }, THREE.Line = function(t, e, r) {
        THREE.Object3D.call(this), this.type = "Line", this.geometry = void 0 !== t ? t : new THREE.Geometry, this.material = void 0 !== e ? e : new THREE.LineBasicMaterial({
            color: 16777215 * Math.random()
        }), this.mode = void 0 !== r ? r : THREE.LineStrip
    }, THREE.LineStrip = 0, THREE.LinePieces = 1, THREE.Line.prototype = Object.create(THREE.Object3D.prototype), THREE.Line.prototype.constructor = THREE.Line, THREE.Line.prototype.raycast = function() {
        var t = new THREE.Matrix4,
            e = new THREE.Ray,
            r = new THREE.Sphere;
        return function(i, n) {
            var a = i.linePrecision,
                o = a * a,
                s = this.geometry;
            if (null === s.boundingSphere && s.computeBoundingSphere(),
                r.copy(s.boundingSphere), r.applyMatrix4(this.matrixWorld), i.ray.isIntersectionSphere(r) !== !1) {
                t.getInverse(this.matrixWorld), e.copy(i.ray).applyMatrix4(t);
                var h = new THREE.Vector3,
                    l = new THREE.Vector3,
                    c = new THREE.Vector3,
                    u = new THREE.Vector3,
                    E = this.mode === THREE.LineStrip ? 1 : 2;
                if (s instanceof THREE.BufferGeometry) {
                    var f = s.attributes;
                    if (void 0 !== f.index) {
                        var p = f.index.array,
                            d = f.position.array,
                            m = s.offsets;
                        0 === m.length && (m = [{
                            start: 0,
                            count: p.length,
                            index: 0
                        }]);
                        for (var T = 0; T < m.length; T++)
                            for (var g = m[T].start, v = m[T].count, R = m[T].index, y = g; y < g + v - 1; y += E) {
                                var H = R + p[y],
                                    x = R + p[y + 1];
                                h.fromArray(d, 3 * H), l.fromArray(d, 3 * x);
                                var b = e.distanceSqToSegment(h, l, u, c);
                                if (!(b > o)) {
                                    var _ = e.origin.distanceTo(u);
                                    _ < i.near || _ > i.far || n.push({
                                        distance: _,
                                        point: c.clone().applyMatrix4(this.matrixWorld),
                                        index: y,
                                        offsetIndex: T,
                                        face: null,
                                        faceIndex: null,
                                        object: this
                                    })
                                }
                            }
                    } else
                        for (var d = f.position.array, y = 0; y < d.length / 3 - 1; y += E) {
                            h.fromArray(d, 3 * y), l.fromArray(d, 3 * y + 3);
                            var b = e.distanceSqToSegment(h, l, u, c);
                            if (!(b > o)) {
                                var _ = e.origin.distanceTo(u);
                                _ < i.near || _ > i.far || n.push({
                                    distance: _,
                                    point: c.clone().applyMatrix4(this.matrixWorld),
                                    index: y,
                                    face: null,
                                    faceIndex: null,
                                    object: this
                                })
                            }
                        }
                } else if (s instanceof THREE.Geometry)
                    for (var w = s.vertices, M = w.length, y = 0; y < M - 1; y += E) {
                        var b = e.distanceSqToSegment(w[y], w[y + 1], u, c);
                        if (!(b > o)) {
                            var _ = e.origin.distanceTo(u);
                            _ < i.near || _ > i.far || n.push({
                                distance: _,
                                point: c.clone().applyMatrix4(this.matrixWorld),
                                index: y,
                                face: null,
                                faceIndex: null,
                                object: this
                            })
                        }
                    }
            }
        }
    }(), THREE.Line.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.Line(this.geometry, this.material, this.mode)), THREE.Object3D.prototype.clone.call(this, t), t
    }, THREE.Mesh = function(t, e) {
        THREE.Object3D.call(this), this.type = "Mesh", this.geometry = void 0 !== t ? t : new THREE.Geometry, this.material = void 0 !== e ? e : new THREE.MeshBasicMaterial({
            color: 16777215 * Math.random()
        }), this.updateMorphTargets()
    }, THREE.Mesh.prototype = Object.create(THREE.Object3D.prototype), THREE.Mesh.prototype.constructor = THREE.Mesh, THREE.Mesh.prototype.updateMorphTargets = function() {
        if (void 0 !== this.geometry.morphTargets && this.geometry.morphTargets.length > 0) {
            this.morphTargetBase = -1, this.morphTargetForcedOrder = [], this.morphTargetInfluences = [], this.morphTargetDictionary = {};
            for (var t = 0, e = this.geometry.morphTargets.length; t < e; t++) this.morphTargetInfluences.push(0), this.morphTargetDictionary[this.geometry.morphTargets[t].name] = t
        }
    }, THREE.Mesh.prototype.getMorphTargetIndexByName = function(t) {
        return void 0 !== this.morphTargetDictionary[t] ? this.morphTargetDictionary[t] : (THREE.warn("THREE.Mesh.getMorphTargetIndexByName: morph target " + t + " does not exist. Returning 0."), 0)
    }, THREE.Mesh.prototype.raycast = function() {
        var t = new THREE.Matrix4,
            e = new THREE.Ray,
            r = new THREE.Sphere,
            i = new THREE.Vector3,
            n = new THREE.Vector3,
            a = new THREE.Vector3;
        return function(o, s) {
            var h = this.geometry;
            if (null === h.boundingSphere && h.computeBoundingSphere(), r.copy(h.boundingSphere), r.applyMatrix4(this.matrixWorld), o.ray.isIntersectionSphere(r) !== !1 && (t.getInverse(this.matrixWorld), e.copy(o.ray).applyMatrix4(t), null === h.boundingBox || e.isIntersectionBox(h.boundingBox) !== !1))
                if (h instanceof THREE.BufferGeometry) {
                    var l = this.material;
                    if (void 0 === l) return;
                    var c, u, E, f = h.attributes,
                        p = o.precision;
                    if (void 0 !== f.index) {
                        var d = f.index.array,
                            m = f.position.array,
                            T = h.offsets;
                        0 === T.length && (T = [{
                            start: 0,
                            count: d.length,
                            index: 0
                        }]);
                        for (var g = 0, v = T.length; g < v; ++g)
                            for (var R = T[g].start, y = T[g].count, H = T[g].index, x = R, b = R + y; x < b; x += 3) {
                                if (c = H + d[x], u = H + d[x + 1], E = H + d[x + 2], i.fromArray(m, 3 * c), n.fromArray(m, 3 * u), a.fromArray(m, 3 * E), l.side === THREE.BackSide) var _ = e.intersectTriangle(a, n, i, !0);
                                else var _ = e.intersectTriangle(i, n, a, l.side !== THREE.DoubleSide);
                                if (null !== _) {
                                    _.applyMatrix4(this.matrixWorld);
                                    var w = o.ray.origin.distanceTo(_);
                                    w < p || w < o.near || w > o.far || s.push({
                                        distance: w,
                                        point: _,
                                        face: new THREE.Face3(c, u, E, THREE.Triangle.normal(i, n, a)),
                                        faceIndex: null,
                                        object: this
                                    })
                                }
                            }
                    } else
                        for (var m = f.position.array, x = 0, M = 0, b = m.length; x < b; x += 3, M += 9) {
                            if (c = x, u = x + 1, E = x + 2, i.fromArray(m, M), n.fromArray(m, M + 3), a.fromArray(m, M + 6), l.side === THREE.BackSide) var _ = e.intersectTriangle(a, n, i, !0);
                            else var _ = e.intersectTriangle(i, n, a, l.side !== THREE.DoubleSide);
                            if (null !== _) {
                                _.applyMatrix4(this.matrixWorld);
                                var w = o.ray.origin.distanceTo(_);
                                w < p || w < o.near || w > o.far || s.push({
                                    distance: w,
                                    point: _,
                                    face: new THREE.Face3(c, u, E, THREE.Triangle.normal(i, n, a)),
                                    faceIndex: null,
                                    object: this
                                })
                            }
                        }
                } else if (h instanceof THREE.Geometry)
                for (var c, u, E, S = this.material instanceof THREE.MeshFaceMaterial, A = S === !0 ? this.material.materials : null, p = o.precision, C = h.vertices, L = 0, P = h.faces.length; L < P; L++) {
                    var F = h.faces[L],
                        l = S === !0 ? A[F.materialIndex] : this.material;
                    if (void 0 !== l) {
                        if (c = C[F.a], u = C[F.b], E = C[F.c], l.morphTargets === !0) {
                            var U = h.morphTargets,
                                B = this.morphTargetInfluences;
                            i.set(0, 0, 0), n.set(0, 0, 0), a.set(0, 0, 0);
                            for (var D = 0, V = U.length; D < V; D++) {
                                var z = B[D];
                                if (0 !== z) {
                                    var k = U[D].vertices;
                                    i.x += (k[F.a].x - c.x) * z, i.y += (k[F.a].y - c.y) * z, i.z += (k[F.a].z - c.z) * z, n.x += (k[F.b].x - u.x) * z, n.y += (k[F.b].y - u.y) * z, n.z += (k[F.b].z - u.z) * z, a.x += (k[F.c].x - E.x) * z, a.y += (k[F.c].y - E.y) * z, a.z += (k[F.c].z - E.z) * z
                                }
                            }
                            i.add(c), n.add(u), a.add(E), c = i, u = n, E = a
                        }
                        if (l.side === THREE.BackSide) var _ = e.intersectTriangle(E, u, c, !0);
                        else var _ = e.intersectTriangle(c, u, E, l.side !== THREE.DoubleSide);
                        if (null !== _) {
                            _.applyMatrix4(this.matrixWorld);
                            var w = o.ray.origin.distanceTo(_);
                            w < p || w < o.near || w > o.far || s.push({
                                distance: w,
                                point: _,
                                face: F,
                                faceIndex: L,
                                object: this
                            })
                        }
                    }
                }
        }
    }(), THREE.Mesh.prototype.clone = function(t, e) {
        return void 0 === t && (t = new THREE.Mesh(this.geometry, this.material)), THREE.Object3D.prototype.clone.call(this, t, e), t
    }, THREE.Bone = function(t) {
        THREE.Object3D.call(this), this.type = "Bone", this.skin = t
    }, THREE.Bone.prototype = Object.create(THREE.Object3D.prototype), THREE.Bone.prototype.constructor = THREE.Bone, THREE.Skeleton = function(t, e, r) {
        if (this.useVertexTexture = void 0 === r || r, this.identityMatrix = new THREE.Matrix4, t = t || [], this.bones = t.slice(0), this.useVertexTexture) {
            var i;
            i = this.bones.length > 256 ? 64 : this.bones.length > 64 ? 32 : this.bones.length > 16 ? 16 : 8, this.boneTextureWidth = i, this.boneTextureHeight = i, this.boneMatrices = new Float32Array(this.boneTextureWidth * this.boneTextureHeight * 4), this.boneTexture = new THREE.DataTexture(this.boneMatrices, this.boneTextureWidth, this.boneTextureHeight, THREE.RGBAFormat, THREE.FloatType), this.boneTexture.minFilter = THREE.NearestFilter, this.boneTexture.magFilter = THREE.NearestFilter, this.boneTexture.generateMipmaps = !1, this.boneTexture.flipY = !1
        } else this.boneMatrices = new Float32Array(16 * this.bones.length);
        if (void 0 === e) this.calculateInverses();
        else if (this.bones.length === e.length) this.boneInverses = e.slice(0);
        else {
            THREE.warn("THREE.Skeleton bonInverses is the wrong length."), this.boneInverses = [];
            for (var n = 0, a = this.bones.length; n < a; n++) this.boneInverses.push(new THREE.Matrix4)
        }
    }, THREE.Skeleton.prototype.calculateInverses = function() {
        this.boneInverses = [];
        for (var t = 0, e = this.bones.length; t < e; t++) {
            var r = new THREE.Matrix4;
            this.bones[t] && r.getInverse(this.bones[t].matrixWorld), this.boneInverses.push(r)
        }
    }, THREE.Skeleton.prototype.pose = function() {
        for (var t, e = 0, r = this.bones.length; e < r; e++) t = this.bones[e], t && t.matrixWorld.getInverse(this.boneInverses[e]);
        for (var e = 0, r = this.bones.length; e < r; e++) t = this.bones[e], t && (t.parent ? (t.matrix.getInverse(t.parent.matrixWorld), t.matrix.multiply(t.matrixWorld)) : t.matrix.copy(t.matrixWorld), t.matrix.decompose(t.position, t.quaternion, t.scale))
    }, THREE.Skeleton.prototype.update = function() {
        var t = new THREE.Matrix4;
        return function() {
            for (var e = 0, r = this.bones.length; e < r; e++) {
                var i = this.bones[e] ? this.bones[e].matrixWorld : this.identityMatrix;
                t.multiplyMatrices(i, this.boneInverses[e]), t.flattenToArrayOffset(this.boneMatrices, 16 * e)
            }
            this.useVertexTexture && (this.boneTexture.needsUpdate = !0)
        }
    }(), THREE.SkinnedMesh = function(t, e, r) {
        THREE.Mesh.call(this, t, e), this.type = "SkinnedMesh", this.bindMode = "attached", this.bindMatrix = new THREE.Matrix4, this.bindMatrixInverse = new THREE.Matrix4;
        var i = [];
        if (this.geometry && void 0 !== this.geometry.bones) {
            for (var n, a, o, s, h, l = 0, c = this.geometry.bones.length; l < c; ++l) a = this.geometry.bones[l], o = a.pos, s = a.rotq, h = a.scl, n = new THREE.Bone(this), i.push(n), n.name = a.name, n.position.set(o[0], o[1], o[2]), n.quaternion.set(s[0], s[1], s[2], s[3]), void 0 !== h ? n.scale.set(h[0], h[1], h[2]) : n.scale.set(1, 1, 1);
            for (var l = 0, c = this.geometry.bones.length; l < c; ++l) a = this.geometry.bones[l], a.parent !== -1 ? i[a.parent].add(i[l]) : this.add(i[l])
        }
        this.normalizeSkinWeights(), this.updateMatrixWorld(!0), this.bind(new THREE.Skeleton(i, (void 0), r))
    }, THREE.SkinnedMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh, THREE.SkinnedMesh.prototype.bind = function(t, e) {
        this.skeleton = t, void 0 === e && (this.updateMatrixWorld(!0), e = this.matrixWorld), this.bindMatrix.copy(e), this.bindMatrixInverse.getInverse(e)
    }, THREE.SkinnedMesh.prototype.pose = function() {
        this.skeleton.pose()
    }, THREE.SkinnedMesh.prototype.normalizeSkinWeights = function() {
        if (this.geometry instanceof THREE.Geometry)
            for (var t = 0; t < this.geometry.skinIndices.length; t++) {
                var e = this.geometry.skinWeights[t],
                    r = 1 / e.lengthManhattan();
                r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1)
            }
    }, THREE.SkinnedMesh.prototype.updateMatrixWorld = function(t) {
        THREE.Mesh.prototype.updateMatrixWorld.call(this, !0), "attached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.matrixWorld) : "detached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.bindMatrix) : THREE.warn("THREE.SkinnedMesh unreckognized bindMode: " + this.bindMode)
    }, THREE.SkinnedMesh.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.SkinnedMesh(this.geometry, this.material, this.useVertexTexture)), THREE.Mesh.prototype.clone.call(this, t), t
    }, THREE.MorphAnimMesh = function(t, e) {
        THREE.Mesh.call(this, t, e), this.type = "MorphAnimMesh", this.duration = 1e3, this.mirroredLoop = !1, this.time = 0, this.lastKeyframe = 0, this.currentKeyframe = 0, this.direction = 1, this.directionBackwards = !1, this.setFrameRange(0, this.geometry.morphTargets.length - 1)
    }, THREE.MorphAnimMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.MorphAnimMesh.prototype.constructor = THREE.MorphAnimMesh, THREE.MorphAnimMesh.prototype.setFrameRange = function(t, e) {
        this.startKeyframe = t, this.endKeyframe = e, this.length = this.endKeyframe - this.startKeyframe + 1
    }, THREE.MorphAnimMesh.prototype.setDirectionForward = function() {
        this.direction = 1, this.directionBackwards = !1
    }, THREE.MorphAnimMesh.prototype.setDirectionBackward = function() {
        this.direction = -1, this.directionBackwards = !0
    }, THREE.MorphAnimMesh.prototype.parseAnimations = function() {
        var t = this.geometry;
        t.animations || (t.animations = {});
        for (var e, r = t.animations, i = /([a-z]+)_?(\d+)/, n = 0, a = t.morphTargets.length; n < a; n++) {
            var o = t.morphTargets[n],
                s = o.name.match(i);
            if (s && s.length > 1) {
                var h = s[1];
                r[h] || (r[h] = {
                    start: 1 / 0,
                    end: -(1 / 0)
                });
                var l = r[h];
                n < l.start && (l.start = n), n > l.end && (l.end = n), e || (e = h)
            }
        }
        t.firstAnimation = e
    }, THREE.MorphAnimMesh.prototype.setAnimationLabel = function(t, e, r) {
        this.geometry.animations || (this.geometry.animations = {}), this.geometry.animations[t] = {
            start: e,
            end: r
        }
    }, THREE.MorphAnimMesh.prototype.playAnimation = function(t, e) {
        var r = this.geometry.animations[t];
        r ? (this.setFrameRange(r.start, r.end), this.duration = 1e3 * ((r.end - r.start) / e), this.time = 0) : THREE.warn("THREE.MorphAnimMesh: animation[" + t + "] undefined in .playAnimation()")
    }, THREE.MorphAnimMesh.prototype.updateAnimation = function(t) {
        var e = this.duration / this.length;
        this.time += this.direction * t, this.mirroredLoop ? (this.time > this.duration || this.time < 0) && (this.direction *= -1, this.time > this.duration && (this.time = this.duration, this.directionBackwards = !0), this.time < 0 && (this.time = 0, this.directionBackwards = !1)) : (this.time = this.time % this.duration, this.time < 0 && (this.time += this.duration));
        var r = this.startKeyframe + THREE.Math.clamp(Math.floor(this.time / e), 0, this.length - 1);
        r !== this.currentKeyframe && (this.morphTargetInfluences[this.lastKeyframe] = 0, this.morphTargetInfluences[this.currentKeyframe] = 1, this.morphTargetInfluences[r] = 0, this.lastKeyframe = this.currentKeyframe, this.currentKeyframe = r);
        var i = this.time % e / e;
        this.directionBackwards && (i = 1 - i), this.morphTargetInfluences[this.currentKeyframe] = i, this.morphTargetInfluences[this.lastKeyframe] = 1 - i
    }, THREE.MorphAnimMesh.prototype.interpolateTargets = function(t, e, r) {
        for (var i = this.morphTargetInfluences, n = 0, a = i.length; n < a; n++) i[n] = 0;
        t > -1 && (i[t] = 1 - r), e > -1 && (i[e] = r)
    }, THREE.MorphAnimMesh.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.MorphAnimMesh(this.geometry, this.material)), t.duration = this.duration, t.mirroredLoop = this.mirroredLoop, t.time = this.time, t.lastKeyframe = this.lastKeyframe, t.currentKeyframe = this.currentKeyframe, t.direction = this.direction, t.directionBackwards = this.directionBackwards, THREE.Mesh.prototype.clone.call(this, t), t
    }, THREE.LOD = function() {
        THREE.Object3D.call(this), this.objects = []
    }, THREE.LOD.prototype = Object.create(THREE.Object3D.prototype), THREE.LOD.prototype.constructor = THREE.LOD, THREE.LOD.prototype.addLevel = function(t, e) {
        void 0 === e && (e = 0), e = Math.abs(e);
        for (var r = 0; r < this.objects.length && !(e < this.objects[r].distance); r++);
        this.objects.splice(r, 0, {
            distance: e,
            object: t
        }), this.add(t)
    }, THREE.LOD.prototype.getObjectForDistance = function(t) {
        for (var e = 1, r = this.objects.length; e < r && !(t < this.objects[e].distance); e++);
        return this.objects[e - 1].object
    }, THREE.LOD.prototype.raycast = function() {
        var t = new THREE.Vector3;
        return function(e, r) {
            t.setFromMatrixPosition(this.matrixWorld);
            var i = e.ray.origin.distanceTo(t);
            this.getObjectForDistance(i).raycast(e, r)
        }
    }(), THREE.LOD.prototype.update = function() {
        var t = new THREE.Vector3,
            e = new THREE.Vector3;
        return function(r) {
            if (this.objects.length > 1) {
                t.setFromMatrixPosition(r.matrixWorld), e.setFromMatrixPosition(this.matrixWorld);
                var i = t.distanceTo(e);
                this.objects[0].object.visible = !0;
                for (var n = 1, a = this.objects.length; n < a && i >= this.objects[n].distance; n++) this.objects[n - 1].object.visible = !1, this.objects[n].object.visible = !0;
                for (; n < a; n++) this.objects[n].object.visible = !1
            }
        }
    }(), THREE.LOD.prototype.clone = function(t) {
        void 0 === t && (t = new THREE.LOD), THREE.Object3D.prototype.clone.call(this, t);
        for (var e = 0, r = this.objects.length; e < r; e++) {
            var i = this.objects[e].object.clone();
            i.visible = 0 === e, t.addLevel(i, this.objects[e].distance)
        }
        return t
    }, THREE.Sprite = function() {
        var t = new Uint16Array([0, 1, 2, 0, 2, 3]),
            e = new Float32Array([-.5, -.5, 0, .5, -.5, 0, .5, .5, 0, -.5, .5, 0]),
            r = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            i = new THREE.BufferGeometry;
        return i.addAttribute("index", new THREE.BufferAttribute(t, 1)), i.addAttribute("position", new THREE.BufferAttribute(e, 3)), i.addAttribute("uv", new THREE.BufferAttribute(r, 2)),
            function(t) {
                THREE.Object3D.call(this), this.type = "Sprite", this.geometry = i, this.material = void 0 !== t ? t : new THREE.SpriteMaterial
            }
    }(), THREE.Sprite.prototype = Object.create(THREE.Object3D.prototype), THREE.Sprite.prototype.constructor = THREE.Sprite, THREE.Sprite.prototype.raycast = function() {
        var t = new THREE.Vector3;
        return function(e, r) {
            t.setFromMatrixPosition(this.matrixWorld);
            var i = e.ray.distanceToPoint(t);
            i > this.scale.x || r.push({
                distance: i,
                point: this.position,
                face: null,
                object: this
            })
        }
    }(), THREE.Sprite.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.Sprite(this.material)), THREE.Object3D.prototype.clone.call(this, t), t
    }, THREE.Particle = THREE.Sprite, THREE.LensFlare = function(t, e, r, i, n) {
        THREE.Object3D.call(this), this.lensFlares = [], this.positionScreen = new THREE.Vector3, this.customUpdateCallback = void 0, void 0 !== t && this.add(t, e, r, i, n)
    }, THREE.LensFlare.prototype = Object.create(THREE.Object3D.prototype), THREE.LensFlare.prototype.constructor = THREE.LensFlare, THREE.LensFlare.prototype.add = function(t, e, r, i, n, a) {
        void 0 === e && (e = -1), void 0 === r && (r = 0), void 0 === a && (a = 1), void 0 === n && (n = new THREE.Color(16777215)), void 0 === i && (i = THREE.NormalBlending), r = Math.min(r, Math.max(0, r)), this.lensFlares.push({
            texture: t,
            size: e,
            distance: r,
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
            rotation: 1,
            opacity: a,
            color: n,
            blending: i
        })
    }, THREE.LensFlare.prototype.updateLensFlares = function() {
        var t, e, r = this.lensFlares.length,
            i = 2 * -this.positionScreen.x,
            n = 2 * -this.positionScreen.y;
        for (t = 0; t < r; t++) e = this.lensFlares[t], e.x = this.positionScreen.x + i * e.distance, e.y = this.positionScreen.y + n * e.distance, e.wantedRotation = e.x * Math.PI * .25, e.rotation += .25 * (e.wantedRotation - e.rotation)
    }, THREE.Scene = function() {
        THREE.Object3D.call(this), this.type = "Scene", this.fog = null, this.overrideMaterial = null, this.autoUpdate = !0
    }, THREE.Scene.prototype = Object.create(THREE.Object3D.prototype), THREE.Scene.prototype.constructor = THREE.Scene, THREE.Scene.prototype.clone = function(t) {
        return void 0 === t && (t = new THREE.Scene), THREE.Object3D.prototype.clone.call(this, t), null !== this.fog && (t.fog = this.fog.clone()), null !== this.overrideMaterial && (t.overrideMaterial = this.overrideMaterial.clone()), t.autoUpdate = this.autoUpdate, t.matrixAutoUpdate = this.matrixAutoUpdate, t
    }, THREE.Fog = function(t, e, r) {
        this.name = "", this.color = new THREE.Color(t), this.near = void 0 !== e ? e : 1, this.far = void 0 !== r ? r : 1e3
    }, THREE.Fog.prototype.clone = function() {
        return new THREE.Fog(this.color.getHex(), this.near, this.far)
    }, THREE.FogExp2 = function(t, e) {
        this.name = "", this.color = new THREE.Color(t), this.density = void 0 !== e ? e : 25e-5
    }, THREE.FogExp2.prototype.clone = function() {
        return new THREE.FogExp2(this.color.getHex(), this.density)
    }, THREE.ShaderChunk = {}, THREE.ShaderChunk.common = "#define PI 3.14159\n#define PI2 6.28318\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n\nfloat square( in float a ) { return a*a; }\nvec2  square( in vec2 a )  { return vec2( a.x*a.x, a.y*a.y ); }\nvec3  square( in vec3 a )  { return vec3( a.x*a.x, a.y*a.y, a.z*a.z ); }\nvec4  square( in vec4 a )  { return vec4( a.x*a.x, a.y*a.y, a.z*a.z, a.w*a.w ); }\nfloat saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }\nvec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }\nvec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }\nvec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }\nfloat average( in float a ) { return a; }\nfloat average( in vec2 a )  { return ( a.x + a.y) * 0.5; }\nfloat average( in vec3 a )  { return ( a.x + a.y + a.z) / 3.0; }\nfloat average( in vec4 a )  { return ( a.x + a.y + a.z + a.w) * 0.25; }\nfloat whiteCompliment( in float a ) { return saturate( 1.0 - a ); }\nvec2  whiteCompliment( in vec2 a )  { return saturate( vec2(1.0) - a ); }\nvec3  whiteCompliment( in vec3 a )  { return saturate( vec3(1.0) - a ); }\nvec4  whiteCompliment( in vec4 a )  { return saturate( vec4(1.0) - a ); }\nvec3 transformDirection( in vec3 normal, in mat4 matrix ) {\n\treturn normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );\n}\n// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations\nvec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {\n\treturn normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );\n}\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {\n\tfloat distance = dot( planeNormal, point-pointOnPlane );\n\treturn point - distance * planeNormal;\n}\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn sign( dot( point - pointOnPlane, planeNormal ) );\n}\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn pointOnLine + lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) );\n}\nfloat calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {\n\tif ( decayExponent > 0.0 ) {\n\t  return pow( saturate( 1.0 - lightDistance / cutoffDistance ), decayExponent );\n\t}\n\treturn 1.0;\n}\n\nvec3 inputToLinear( in vec3 a ) {\n#ifdef GAMMA_INPUT\n\treturn pow( a, vec3( float( GAMMA_FACTOR ) ) );\n#else\n\treturn a;\n#endif\n}\nvec3 linearToOutput( in vec3 a ) {\n#ifdef GAMMA_OUTPUT\n\treturn pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );\n#else\n\treturn a;\n#endif\n}\n", THREE.ShaderChunk.alphatest_fragment = "#ifdef ALPHATEST\n\n\tif ( diffuseColor.a < ALPHATEST ) discard;\n\n#endif\n", THREE.ShaderChunk.lights_lambert_vertex = "vLightFront = vec3( 0.0 );\n\n#ifdef DOUBLE_SIDED\n\n\tvLightBack = vec3( 0.0 );\n\n#endif\n\ntransformedNormal = normalize( transformedNormal );\n\n#if MAX_DIR_LIGHTS > 0\n\nfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n\tvec3 dirVector = transformDirection( directionalLightDirection[ i ], viewMatrix );\n\n\tfloat dotProduct = dot( transformedNormal, dirVector );\n\tvec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );\n\n\t#ifdef DOUBLE_SIDED\n\n\t\tvec3 directionalLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n\n\t\t#ifdef WRAP_AROUND\n\n\t\t\tvec3 directionalLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n\n\t\t#endif\n\n\t#endif\n\n\t#ifdef WRAP_AROUND\n\n\t\tvec3 directionalLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\n\t\tdirectionalLightWeighting = mix( directionalLightWeighting, directionalLightWeightingHalf, wrapRGB );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\tdirectionalLightWeightingBack = mix( directionalLightWeightingBack, directionalLightWeightingHalfBack, wrapRGB );\n\n\t\t#endif\n\n\t#endif\n\n\tvLightFront += directionalLightColor[ i ] * directionalLightWeighting;\n\n\t#ifdef DOUBLE_SIDED\n\n\t\tvLightBack += directionalLightColor[ i ] * directionalLightWeightingBack;\n\n\t#endif\n\n}\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n\tfor( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n\t\tvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\n\t\tvec3 lVector = lPosition.xyz - mvPosition.xyz;\n\n\t\tfloat attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n\t\tlVector = normalize( lVector );\n\t\tfloat dotProduct = dot( transformedNormal, lVector );\n\n\t\tvec3 pointLightWeighting = vec3( max( dotProduct, 0.0 ) );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\tvec3 pointLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n\n\t\t\t#ifdef WRAP_AROUND\n\n\t\t\t\tvec3 pointLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n\n\t\t\t#endif\n\n\t\t#endif\n\n\t\t#ifdef WRAP_AROUND\n\n\t\t\tvec3 pointLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\n\t\t\tpointLightWeighting = mix( pointLightWeighting, pointLightWeightingHalf, wrapRGB );\n\n\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\tpointLightWeightingBack = mix( pointLightWeightingBack, pointLightWeightingHalfBack, wrapRGB );\n\n\t\t\t#endif\n\n\t\t#endif\n\n\t\tvLightFront += pointLightColor[ i ] * pointLightWeighting * attenuation;\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\tvLightBack += pointLightColor[ i ] * pointLightWeightingBack * attenuation;\n\n\t\t#endif\n\n\t}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tfor( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n\t\tvec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\n\t\tvec3 lVector = lPosition.xyz - mvPosition.xyz;\n\n\t\tfloat spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - worldPosition.xyz ) );\n\n\t\tif ( spotEffect > spotLightAngleCos[ i ] ) {\n\n\t\t\tspotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );\n\n\t\t\tfloat attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n\t\t\tlVector = normalize( lVector );\n\n\t\t\tfloat dotProduct = dot( transformedNormal, lVector );\n\t\t\tvec3 spotLightWeighting = vec3( max( dotProduct, 0.0 ) );\n\n\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\tvec3 spotLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n\n\t\t\t\t#ifdef WRAP_AROUND\n\n\t\t\t\t\tvec3 spotLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n\n\t\t\t\t#endif\n\n\t\t\t#endif\n\n\t\t\t#ifdef WRAP_AROUND\n\n\t\t\t\tvec3 spotLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\n\t\t\t\tspotLightWeighting = mix( spotLightWeighting, spotLightWeightingHalf, wrapRGB );\n\n\t\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\t\tspotLightWeightingBack = mix( spotLightWeightingBack, spotLightWeightingHalfBack, wrapRGB );\n\n\t\t\t\t#endif\n\n\t\t\t#endif\n\n\t\t\tvLightFront += spotLightColor[ i ] * spotLightWeighting * attenuation * spotEffect;\n\n\t\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t\tvLightBack += spotLightColor[ i ] * spotLightWeightingBack * attenuation * spotEffect;\n\n\t\t\t#endif\n\n\t\t}\n\n\t}\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n\tfor( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n\t\tvec3 lVector = transformDirection( hemisphereLightDirection[ i ], viewMatrix );\n\n\t\tfloat dotProduct = dot( transformedNormal, lVector );\n\n\t\tfloat hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n\t\tfloat hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;\n\n\t\tvLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\tvLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );\n\n\t\t#endif\n\n\t}\n\n#endif\n\nvLightFront += ambientLightColor;\n\n#ifdef DOUBLE_SIDED\n\n\tvLightBack += ambientLightColor;\n\n#endif\n", THREE.ShaderChunk.map_particle_pars_fragment = "#ifdef USE_MAP\n\n\tuniform vec4 offsetRepeat;\n\tuniform sampler2D map;\n\n#endif\n", THREE.ShaderChunk.default_vertex = "#ifdef USE_SKINNING\n\n\tvec4 mvPosition = modelViewMatrix * skinned;\n\n#elif defined( USE_MORPHTARGETS )\n\n\tvec4 mvPosition = modelViewMatrix * vec4( morphed, 1.0 );\n\n#else\n\n\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\n#endif\n\ngl_Position = projectionMatrix * mvPosition;\n", THREE.ShaderChunk.map_pars_fragment = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )\n\n\tvarying vec2 vUv;\n\n#endif\n\n#ifdef USE_MAP\n\n\tuniform sampler2D map;\n\n#endif", THREE.ShaderChunk.skinnormal_vertex = "#ifdef USE_SKINNING\n\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n\n\t#ifdef USE_MORPHNORMALS\n\n\tvec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );\n\n\t#else\n\n\tvec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );\n\n\t#endif\n\n#endif\n", THREE.ShaderChunk.logdepthbuf_pars_vertex = "#ifdef USE_LOGDEPTHBUF\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\tvarying float vFragDepth;\n\n\t#endif\n\n\tuniform float logDepthBufFC;\n\n#endif", THREE.ShaderChunk.lightmap_pars_vertex = "#ifdef USE_LIGHTMAP\n\n\tvarying vec2 vUv2;\n\n#endif", THREE.ShaderChunk.lights_phong_fragment = "#ifndef FLAT_SHADED\n\n\tvec3 normal = normalize( vNormal );\n\n\t#ifdef DOUBLE_SIDED\n\n\t\tnormal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n\n\t#endif\n\n#else\n\n\tvec3 fdx = dFdx( vViewPosition );\n\tvec3 fdy = dFdy( vViewPosition );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n\n#endif\n\nvec3 viewPosition = normalize( vViewPosition );\n\n#ifdef USE_NORMALMAP\n\n\tnormal = perturbNormal2Arb( -vViewPosition, normal );\n\n#elif defined( USE_BUMPMAP )\n\n\tnormal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n\n#endif\n\nvec3 totalDiffuseLight = vec3( 0.0 );\nvec3 totalSpecularLight = vec3( 0.0 );\n\n#if MAX_POINT_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n\t\tvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\n\t\tvec3 lVector = lPosition.xyz + vViewPosition.xyz;\n\n\t\tfloat attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n\t\tlVector = normalize( lVector );\n\n\t\t// diffuse\n\n\t\tfloat dotProduct = dot( normal, lVector );\n\n\t\t#ifdef WRAP_AROUND\n\n\t\t\tfloat pointDiffuseWeightFull = max( dotProduct, 0.0 );\n\t\t\tfloat pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n\t\t\tvec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n\n\t\t#else\n\n\t\t\tfloat pointDiffuseWeight = max( dotProduct, 0.0 );\n\n\t\t#endif\n\n\t\ttotalDiffuseLight += pointLightColor[ i ] * pointDiffuseWeight * attenuation;\n\n\t\t\t\t// specular\n\n\t\tvec3 pointHalfVector = normalize( lVector + viewPosition );\n\t\tfloat pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\n\t\tfloat pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );\n\n\t\tfloat specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n\t\tvec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );\n\t\ttotalSpecularLight += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * attenuation * specularNormalization;\n\n\t}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tfor ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n\t\tvec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\n\t\tvec3 lVector = lPosition.xyz + vViewPosition.xyz;\n\n\t\tfloat attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n\t\tlVector = normalize( lVector );\n\n\t\tfloat spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );\n\n\t\tif ( spotEffect > spotLightAngleCos[ i ] ) {\n\n\t\t\tspotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );\n\n\t\t\t// diffuse\n\n\t\t\tfloat dotProduct = dot( normal, lVector );\n\n\t\t\t#ifdef WRAP_AROUND\n\n\t\t\t\tfloat spotDiffuseWeightFull = max( dotProduct, 0.0 );\n\t\t\t\tfloat spotDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n\t\t\t\tvec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );\n\n\t\t\t#else\n\n\t\t\t\tfloat spotDiffuseWeight = max( dotProduct, 0.0 );\n\n\t\t\t#endif\n\n\t\t\ttotalDiffuseLight += spotLightColor[ i ] * spotDiffuseWeight * attenuation * spotEffect;\n\n\t\t\t// specular\n\n\t\t\tvec3 spotHalfVector = normalize( lVector + viewPosition );\n\t\t\tfloat spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );\n\t\t\tfloat spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );\n\n\t\t\tfloat specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n\t\t\tvec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, spotHalfVector ), 0.0 ), 5.0 );\n\t\t\ttotalSpecularLight += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * attenuation * specularNormalization * spotEffect;\n\n\t\t}\n\n\t}\n\n#endif\n\n#if MAX_DIR_LIGHTS > 0\n\n\tfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n\t\tvec3 dirVector = transformDirection( directionalLightDirection[ i ], viewMatrix );\n\n\t\t// diffuse\n\n\t\tfloat dotProduct = dot( normal, dirVector );\n\n\t\t#ifdef WRAP_AROUND\n\n\t\t\tfloat dirDiffuseWeightFull = max( dotProduct, 0.0 );\n\t\t\tfloat dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n\t\t\tvec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );\n\n\t\t#else\n\n\t\t\tfloat dirDiffuseWeight = max( dotProduct, 0.0 );\n\n\t\t#endif\n\n\t\ttotalDiffuseLight += directionalLightColor[ i ] * dirDiffuseWeight;\n\n\t\t// specular\n\n\t\tvec3 dirHalfVector = normalize( dirVector + viewPosition );\n\t\tfloat dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\n\t\tfloat dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );\n\n\t\t/*\n\t\t// fresnel term from skin shader\n\t\tconst float F0 = 0.128;\n\n\t\tfloat base = 1.0 - dot( viewPosition, dirHalfVector );\n\t\tfloat exponential = pow( base, 5.0 );\n\n\t\tfloat fresnel = exponential + F0 * ( 1.0 - exponential );\n\t\t*/\n\n\t\t/*\n\t\t// fresnel term from fresnel shader\n\t\tconst float mFresnelBias = 0.08;\n\t\tconst float mFresnelScale = 0.3;\n\t\tconst float mFresnelPower = 5.0;\n\n\t\tfloat fresnel = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( -viewPosition ), normal ), mFresnelPower );\n\t\t*/\n\n\t\tfloat specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n\t\t// \t\tdirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization * fresnel;\n\n\t\tvec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );\n\t\ttotalSpecularLight += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;\n\n\n\t}\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n\tfor( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n\t\tvec3 lVector = transformDirection( hemisphereLightDirection[ i ], viewMatrix );\n\n\t\t// diffuse\n\n\t\tfloat dotProduct = dot( normal, lVector );\n\t\tfloat hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n\n\t\tvec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n\t\ttotalDiffuseLight += hemiColor;\n\n\t\t// specular (sky light)\n\n\t\tvec3 hemiHalfVectorSky = normalize( lVector + viewPosition );\n\t\tfloat hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;\n\t\tfloat hemiSpecularWeightSky = specularStrength * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );\n\n\t\t// specular (ground light)\n\n\t\tvec3 lVectorGround = -lVector;\n\n\t\tvec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );\n\t\tfloat hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;\n\t\tfloat hemiSpecularWeightGround = specularStrength * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess ), 0.0 );\n\n\t\tfloat dotProductGround = dot( normal, lVectorGround );\n\n\t\tfloat specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n\t\tvec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );\n\t\tvec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );\n\t\ttotalSpecularLight += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );\n\n\t}\n\n#endif\n\n#ifdef METAL\n\n\toutgoingLight += diffuseColor.rgb * ( totalDiffuseLight + ambientLightColor ) * specular + totalSpecularLight + emissive;\n\n#else\n\n\toutgoingLight += diffuseColor.rgb * ( totalDiffuseLight + ambientLightColor ) + totalSpecularLight + emissive;\n\n#endif\n",
    THREE.ShaderChunk.fog_pars_fragment = "#ifdef USE_FOG\n\n\tuniform vec3 fogColor;\n\n\t#ifdef FOG_EXP2\n\n\t\tuniform float fogDensity;\n\n\t#else\n\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n\n#endif", THREE.ShaderChunk.morphnormal_vertex = "#ifdef USE_MORPHNORMALS\n\n\tvec3 morphedNormal = vec3( 0.0 );\n\n\tmorphedNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n\tmorphedNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n\tmorphedNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n\tmorphedNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n\n\tmorphedNormal += normal;\n\n#endif", THREE.ShaderChunk.envmap_pars_fragment = "#ifdef USE_ENVMAP\n\n\tuniform float reflectivity;\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\tuniform float flipEnvMap;\n\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n\t\tuniform float refractionRatio;\n\n\t#else\n\n\t\tvarying vec3 vReflect;\n\n\t#endif\n\n#endif\n", THREE.ShaderChunk.logdepthbuf_fragment = "#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)\n\n\tgl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;\n\n#endif", THREE.ShaderChunk.normalmap_pars_fragment = "#ifdef USE_NORMALMAP\n\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n\n\t// Per-Pixel Tangent Space Normal Mapping\n\t// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html\n\n\tvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n\n\t\tvec3 q0 = dFdx( eye_pos.xyz );\n\t\tvec3 q1 = dFdy( eye_pos.xyz );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\n\t\tvec3 S = normalize( q0 * st1.t - q1 * st0.t );\n\t\tvec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n\t\tvec3 N = normalize( surf_norm );\n\n\t\tvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\t\tmapN.xy = normalScale * mapN.xy;\n\t\tmat3 tsn = mat3( S, T, N );\n\t\treturn normalize( tsn * mapN );\n\n\t}\n\n#endif\n", THREE.ShaderChunk.lights_phong_pars_vertex = "#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )\n\n\tvarying vec3 vWorldPosition;\n\n#endif\n", THREE.ShaderChunk.lightmap_pars_fragment = "#ifdef USE_LIGHTMAP\n\n\tvarying vec2 vUv2;\n\tuniform sampler2D lightMap;\n\n#endif", THREE.ShaderChunk.shadowmap_vertex = "#ifdef USE_SHADOWMAP\n\n\tfor( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n\t\tvShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;\n\n\t}\n\n#endif", THREE.ShaderChunk.lights_phong_vertex = "#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )\n\n\tvWorldPosition = worldPosition.xyz;\n\n#endif", THREE.ShaderChunk.map_fragment = "#ifdef USE_MAP\n\n\tvec4 texelColor = texture2D( map, vUv );\n\n\ttexelColor.xyz = inputToLinear( texelColor.xyz );\n\n\tdiffuseColor *= texelColor;\n\n#endif", THREE.ShaderChunk.lightmap_vertex = "#ifdef USE_LIGHTMAP\n\n\tvUv2 = uv2;\n\n#endif", THREE.ShaderChunk.map_particle_fragment = "#ifdef USE_MAP\n\n\tdiffuseColor *= texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );\n\n#endif\n", THREE.ShaderChunk.color_pars_fragment = "#ifdef USE_COLOR\n\n\tvarying vec3 vColor;\n\n#endif\n", THREE.ShaderChunk.color_vertex = "#ifdef USE_COLOR\n\n\tvColor.xyz = inputToLinear( color.xyz );\n\n#endif", THREE.ShaderChunk.skinning_vertex = "#ifdef USE_SKINNING\n\n\t#ifdef USE_MORPHTARGETS\n\n\tvec4 skinVertex = bindMatrix * vec4( morphed, 1.0 );\n\n\t#else\n\n\tvec4 skinVertex = bindMatrix * vec4( position, 1.0 );\n\n\t#endif\n\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\tskinned  = bindMatrixInverse * skinned;\n\n#endif\n", THREE.ShaderChunk.envmap_pars_vertex = "#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n\tvarying vec3 vReflect;\n\n\tuniform float refractionRatio;\n\n#endif\n", THREE.ShaderChunk.linear_to_gamma_fragment = "\n\toutgoingLight = linearToOutput( outgoingLight );\n", THREE.ShaderChunk.color_pars_vertex = "#ifdef USE_COLOR\n\n\tvarying vec3 vColor;\n\n#endif", THREE.ShaderChunk.lights_lambert_pars_vertex = "uniform vec3 ambientLightColor;\n\n#if MAX_DIR_LIGHTS > 0\n\n\tuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n\tuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n\tuniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n\tuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n\tuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tuniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n\n#ifdef WRAP_AROUND\n\n\tuniform vec3 wrapRGB;\n\n#endif\n", THREE.ShaderChunk.map_pars_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )\n\n\tvarying vec2 vUv;\n\tuniform vec4 offsetRepeat;\n\n#endif\n", THREE.ShaderChunk.envmap_fragment = "#ifdef USE_ENVMAP\n\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n\t\tvec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n\n\t\t// Transforming Normal Vectors with the Inverse Transformation\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\n\t\t\tvec3 reflectVec = reflect( cameraToVertex, worldNormal );\n\n\t\t#else\n\n\t\t\tvec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\n\t\t#endif\n\n\t#else\n\n\t\tvec3 reflectVec = vReflect;\n\n\t#endif\n\n\t#ifdef DOUBLE_SIDED\n\t\tfloat flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n\t#else\n\t\tfloat flipNormal = 1.0;\n\t#endif\n\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\n\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\tvec2 sampleUV;\n\t\tsampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );\n\t\tsampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\tvec4 envColor = texture2D( envMap, sampleUV );\n\n\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\tvec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));\n\t\tvec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n\t#endif\n\n\tenvColor.xyz = inputToLinear( envColor.xyz );\n\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\n\t#endif\n\n#endif\n", THREE.ShaderChunk.specularmap_pars_fragment = "#ifdef USE_SPECULARMAP\n\n\tuniform sampler2D specularMap;\n\n#endif", THREE.ShaderChunk.logdepthbuf_vertex = "#ifdef USE_LOGDEPTHBUF\n\n\tgl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\n#else\n\n\t\tgl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;\n\n\t#endif\n\n#endif", THREE.ShaderChunk.morphtarget_pars_vertex = "#ifdef USE_MORPHTARGETS\n\n\t#ifndef USE_MORPHNORMALS\n\n\tuniform float morphTargetInfluences[ 8 ];\n\n\t#else\n\n\tuniform float morphTargetInfluences[ 4 ];\n\n\t#endif\n\n#endif", THREE.ShaderChunk.specularmap_fragment = "float specularStrength;\n\n#ifdef USE_SPECULARMAP\n\n\tvec4 texelSpecular = texture2D( specularMap, vUv );\n\tspecularStrength = texelSpecular.r;\n\n#else\n\n\tspecularStrength = 1.0;\n\n#endif", THREE.ShaderChunk.fog_fragment = "#ifdef USE_FOG\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\tfloat depth = gl_FragDepthEXT / gl_FragCoord.w;\n\n\t#else\n\n\t\tfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n\n\t#endif\n\n\t#ifdef FOG_EXP2\n\n\t\tfloat fogFactor = exp2( - square( fogDensity ) * square( depth ) * LOG2 );\n\t\tfogFactor = whiteCompliment( fogFactor );\n\n\t#else\n\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, depth );\n\n\t#endif\n\t\n\toutgoingLight = mix( outgoingLight, fogColor, fogFactor );\n\n#endif", THREE.ShaderChunk.bumpmap_pars_fragment = "#ifdef USE_BUMPMAP\n\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\n\t// Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen\n\t// http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html\n\n\t// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)\n\n\tvec2 dHdxy_fwd() {\n\n\t\tvec2 dSTdx = dFdx( vUv );\n\t\tvec2 dSTdy = dFdy( vUv );\n\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\n\t\treturn vec2( dBx, dBy );\n\n\t}\n\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\n\t\tvec3 vSigmaX = dFdx( surf_pos );\n\t\tvec3 vSigmaY = dFdy( surf_pos );\n\t\tvec3 vN = surf_norm;\t\t// normalized\n\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\n\t}\n\n#endif\n", THREE.ShaderChunk.defaultnormal_vertex = "#ifdef USE_SKINNING\n\n\tvec3 objectNormal = skinnedNormal.xyz;\n\n#elif defined( USE_MORPHNORMALS )\n\n\tvec3 objectNormal = morphedNormal;\n\n#else\n\n\tvec3 objectNormal = normal;\n\n#endif\n\n#ifdef FLIP_SIDED\n\n\tobjectNormal = -objectNormal;\n\n#endif\n\nvec3 transformedNormal = normalMatrix * objectNormal;\n", THREE.ShaderChunk.lights_phong_pars_fragment = "uniform vec3 ambientLightColor;\n\n#if MAX_DIR_LIGHTS > 0\n\n\tuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n\tuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n\tuniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n\tuniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n\tuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n\n\tuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n\tuniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n\tuniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n\tuniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n\tuniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )\n\n\tvarying vec3 vWorldPosition;\n\n#endif\n\n#ifdef WRAP_AROUND\n\n\tuniform vec3 wrapRGB;\n\n#endif\n\nvarying vec3 vViewPosition;\n\n#ifndef FLAT_SHADED\n\n\tvarying vec3 vNormal;\n\n#endif\n", THREE.ShaderChunk.skinbase_vertex = "#ifdef USE_SKINNING\n\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n\n#endif", THREE.ShaderChunk.map_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )\n\n\tvUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n\n#endif", THREE.ShaderChunk.lightmap_fragment = "#ifdef USE_LIGHTMAP\n\n\toutgoingLight *= diffuseColor.xyz * texture2D( lightMap, vUv2 ).xyz;\n\n#endif", THREE.ShaderChunk.shadowmap_pars_vertex = "#ifdef USE_SHADOWMAP\n\n\tvarying vec4 vShadowCoord[ MAX_SHADOWS ];\n\tuniform mat4 shadowMatrix[ MAX_SHADOWS ];\n\n#endif", THREE.ShaderChunk.color_fragment = "#ifdef USE_COLOR\n\n\tdiffuseColor.rgb *= vColor;\n\n#endif", THREE.ShaderChunk.morphtarget_vertex = "#ifdef USE_MORPHTARGETS\n\n\tvec3 morphed = vec3( 0.0 );\n\tmorphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n\tmorphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n\tmorphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n\tmorphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n\n\t#ifndef USE_MORPHNORMALS\n\n\tmorphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n\tmorphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n\tmorphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n\tmorphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n\n\t#endif\n\n\tmorphed += position;\n\n#endif", THREE.ShaderChunk.envmap_vertex = "#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n\tvec3 worldNormal = transformDirection( objectNormal, modelMatrix );\n\n\tvec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\n\t#ifdef ENVMAP_MODE_REFLECTION\n\n\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\n\t#else\n\n\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\n\t#endif\n\n#endif\n", THREE.ShaderChunk.shadowmap_fragment = "#ifdef USE_SHADOWMAP\n\n\t#ifdef SHADOWMAP_DEBUG\n\n\t\tvec3 frustumColors[3];\n\t\tfrustumColors[0] = vec3( 1.0, 0.5, 0.0 );\n\t\tfrustumColors[1] = vec3( 0.0, 1.0, 0.8 );\n\t\tfrustumColors[2] = vec3( 0.0, 0.5, 1.0 );\n\n\t#endif\n\n\t#ifdef SHADOWMAP_CASCADE\n\n\t\tint inFrustumCount = 0;\n\n\t#endif\n\n\tfloat fDepth;\n\tvec3 shadowColor = vec3( 1.0 );\n\n\tfor( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n\t\tvec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\n\n\t\t\t\t// if ( something && something ) breaks ATI OpenGL shader compiler\n\t\t\t\t// if ( all( something, something ) ) using this instead\n\n\t\tbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n\t\tbool inFrustum = all( inFrustumVec );\n\n\t\t\t\t// don't shadow pixels outside of light frustum\n\t\t\t\t// use just first frustum (for cascades)\n\t\t\t\t// don't shadow pixels behind far plane of light frustum\n\n\t\t#ifdef SHADOWMAP_CASCADE\n\n\t\t\tinFrustumCount += int( inFrustum );\n\t\t\tbvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );\n\n\t\t#else\n\n\t\t\tbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\n\t\t#endif\n\n\t\tbool frustumTest = all( frustumTestVec );\n\n\t\tif ( frustumTest ) {\n\n\t\t\tshadowCoord.z += shadowBias[ i ];\n\n\t\t\t#if defined( SHADOWMAP_TYPE_PCF )\n\n\t\t\t\t\t\t// Percentage-close filtering\n\t\t\t\t\t\t// (9 pixel kernel)\n\t\t\t\t\t\t// http://fabiensanglard.net/shadowmappingPCF/\n\n\t\t\t\tfloat shadow = 0.0;\n\n\t\t/*\n\t\t\t\t\t\t// nested loops breaks shader compiler / validator on some ATI cards when using OpenGL\n\t\t\t\t\t\t// must enroll loop manually\n\n\t\t\t\tfor ( float y = -1.25; y <= 1.25; y += 1.25 )\n\t\t\t\t\tfor ( float x = -1.25; x <= 1.25; x += 1.25 ) {\n\n\t\t\t\t\t\tvec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );\n\n\t\t\t\t\t\t\t\t// doesn't seem to produce any noticeable visual difference compared to simple texture2D lookup\n\t\t\t\t\t\t\t\t//vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) );\n\n\t\t\t\t\t\tfloat fDepth = unpackDepth( rgbaDepth );\n\n\t\t\t\t\t\tif ( fDepth < shadowCoord.z )\n\t\t\t\t\t\t\tshadow += 1.0;\n\n\t\t\t\t}\n\n\t\t\t\tshadow /= 9.0;\n\n\t\t*/\n\n\t\t\t\tconst float shadowDelta = 1.0 / 9.0;\n\n\t\t\t\tfloat xPixelOffset = 1.0 / shadowMapSize[ i ].x;\n\t\t\t\tfloat yPixelOffset = 1.0 / shadowMapSize[ i ].y;\n\n\t\t\t\tfloat dx0 = -1.25 * xPixelOffset;\n\t\t\t\tfloat dy0 = -1.25 * yPixelOffset;\n\t\t\t\tfloat dx1 = 1.25 * xPixelOffset;\n\t\t\t\tfloat dy1 = 1.25 * yPixelOffset;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\t\t\t\tif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n\t\t\t\tshadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );\n\n\t\t\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\n\t\t\t\t\t\t// Percentage-close filtering\n\t\t\t\t\t\t// (9 pixel kernel)\n\t\t\t\t\t\t// http://fabiensanglard.net/shadowmappingPCF/\n\n\t\t\t\tfloat shadow = 0.0;\n\n\t\t\t\tfloat xPixelOffset = 1.0 / shadowMapSize[ i ].x;\n\t\t\t\tfloat yPixelOffset = 1.0 / shadowMapSize[ i ].y;\n\n\t\t\t\tfloat dx0 = -1.0 * xPixelOffset;\n\t\t\t\tfloat dy0 = -1.0 * yPixelOffset;\n\t\t\t\tfloat dx1 = 1.0 * xPixelOffset;\n\t\t\t\tfloat dy1 = 1.0 * yPixelOffset;\n\n\t\t\t\tmat3 shadowKernel;\n\t\t\t\tmat3 depthKernel;\n\n\t\t\t\tdepthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n\t\t\t\tdepthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n\t\t\t\tdepthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n\t\t\t\tdepthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n\t\t\t\tdepthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n\t\t\t\tdepthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n\t\t\t\tdepthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n\t\t\t\tdepthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n\t\t\t\tdepthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\n\t\t\t\tvec3 shadowZ = vec3( shadowCoord.z );\n\t\t\t\tshadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));\n\t\t\t\tshadowKernel[0] *= vec3(0.25);\n\n\t\t\t\tshadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));\n\t\t\t\tshadowKernel[1] *= vec3(0.25);\n\n\t\t\t\tshadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));\n\t\t\t\tshadowKernel[2] *= vec3(0.25);\n\n\t\t\t\tvec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );\n\n\t\t\t\tshadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );\n\t\t\t\tshadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );\n\n\t\t\t\tvec4 shadowValues;\n\t\t\t\tshadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );\n\t\t\t\tshadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );\n\t\t\t\tshadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );\n\t\t\t\tshadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );\n\n\t\t\t\tshadow = dot( shadowValues, vec4( 1.0 ) );\n\n\t\t\t\tshadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );\n\n\t\t\t#else\n\n\t\t\t\tvec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );\n\t\t\t\tfloat fDepth = unpackDepth( rgbaDepth );\n\n\t\t\t\tif ( fDepth < shadowCoord.z )\n\n\t\t// spot with multiple shadows is darker\n\n\t\t\t\t\tshadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );\n\n\t\t// spot with multiple shadows has the same color as single shadow spot\n\n\t\t// \t\t\t\t\tshadowColor = min( shadowColor, vec3( shadowDarkness[ i ] ) );\n\n\t\t\t#endif\n\n\t\t}\n\n\n\t\t#ifdef SHADOWMAP_DEBUG\n\n\t\t\t#ifdef SHADOWMAP_CASCADE\n\n\t\t\t\tif ( inFrustum && inFrustumCount == 1 ) outgoingLight *= frustumColors[ i ];\n\n\t\t\t#else\n\n\t\t\t\tif ( inFrustum ) outgoingLight *= frustumColors[ i ];\n\n\t\t\t#endif\n\n\t\t#endif\n\n\t}\n\n\t// NOTE: I am unsure if this is correct in linear space.  -bhouston, Dec 29, 2014\n\tshadowColor = inputToLinear( shadowColor );\n\n\toutgoingLight = outgoingLight * shadowColor;\n\n#endif\n", THREE.ShaderChunk.worldpos_vertex = "#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n\n\t#ifdef USE_SKINNING\n\n\t\tvec4 worldPosition = modelMatrix * skinned;\n\n\t#elif defined( USE_MORPHTARGETS )\n\n\t\tvec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );\n\n\t#else\n\n\t\tvec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n\n\t#endif\n\n#endif\n", THREE.ShaderChunk.shadowmap_pars_fragment = "#ifdef USE_SHADOWMAP\n\n\tuniform sampler2D shadowMap[ MAX_SHADOWS ];\n\tuniform vec2 shadowMapSize[ MAX_SHADOWS ];\n\n\tuniform float shadowDarkness[ MAX_SHADOWS ];\n\tuniform float shadowBias[ MAX_SHADOWS ];\n\n\tvarying vec4 vShadowCoord[ MAX_SHADOWS ];\n\n\tfloat unpackDepth( const in vec4 rgba_depth ) {\n\n\t\tconst vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n\t\tfloat depth = dot( rgba_depth, bit_shift );\n\t\treturn depth;\n\n\t}\n\n#endif", THREE.ShaderChunk.skinning_pars_vertex = "#ifdef USE_SKINNING\n\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\n\t#ifdef BONE_TEXTURE\n\n\t\tuniform sampler2D boneTexture;\n\t\tuniform int boneTextureWidth;\n\t\tuniform int boneTextureHeight;\n\n\t\tmat4 getBoneMatrix( const in float i ) {\n\n\t\t\tfloat j = i * 4.0;\n\t\t\tfloat x = mod( j, float( boneTextureWidth ) );\n\t\t\tfloat y = floor( j / float( boneTextureWidth ) );\n\n\t\t\tfloat dx = 1.0 / float( boneTextureWidth );\n\t\t\tfloat dy = 1.0 / float( boneTextureHeight );\n\n\t\t\ty = dy * ( y + 0.5 );\n\n\t\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\n\t\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\n\t\t\treturn bone;\n\n\t\t}\n\n\t#else\n\n\t\tuniform mat4 boneGlobalMatrices[ MAX_BONES ];\n\n\t\tmat4 getBoneMatrix( const in float i ) {\n\n\t\t\tmat4 bone = boneGlobalMatrices[ int(i) ];\n\t\t\treturn bone;\n\n\t\t}\n\n\t#endif\n\n#endif\n", THREE.ShaderChunk.logdepthbuf_pars_fragment = "#ifdef USE_LOGDEPTHBUF\n\n\tuniform float logDepthBufFC;\n\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\n\t\t#extension GL_EXT_frag_depth : enable\n\t\tvarying float vFragDepth;\n\n\t#endif\n\n#endif", THREE.ShaderChunk.alphamap_fragment = "#ifdef USE_ALPHAMAP\n\n\tdiffuseColor.a *= texture2D( alphaMap, vUv ).g;\n\n#endif\n", THREE.ShaderChunk.alphamap_pars_fragment = "#ifdef USE_ALPHAMAP\n\n\tuniform sampler2D alphaMap;\n\n#endif\n", THREE.UniformsUtils = {
        merge: function(t) {
            for (var e = {}, r = 0; r < t.length; r++) {
                var i = this.clone(t[r]);
                for (var n in i) e[n] = i[n]
            }
            return e
        },
        clone: function(t) {
            var e = {};
            for (var r in t) {
                e[r] = {};
                for (var i in t[r]) {
                    var n = t[r][i];
                    n instanceof THREE.Color || n instanceof THREE.Vector2 || n instanceof THREE.Vector3 || n instanceof THREE.Vector4 || n instanceof THREE.Matrix4 || n instanceof THREE.Texture ? e[r][i] = n.clone() : n instanceof Array ? e[r][i] = n.slice() : e[r][i] = n
                }
            }
            return e
        }
    }, THREE.UniformsLib = {
        common: {
            diffuse: {
                type: "c",
                value: new THREE.Color(15658734)
            },
            opacity: {
                type: "f",
                value: 1
            },
            map: {
                type: "t",
                value: null
            },
            offsetRepeat: {
                type: "v4",
                value: new THREE.Vector4(0, 0, 1, 1)
            },
            lightMap: {
                type: "t",
                value: null
            },
            specularMap: {
                type: "t",
                value: null
            },
            alphaMap: {
                type: "t",
                value: null
            },
            envMap: {
                type: "t",
                value: null
            },
            flipEnvMap: {
                type: "f",
                value: -1
            },
            reflectivity: {
                type: "f",
                value: 1
            },
            refractionRatio: {
                type: "f",
                value: .98
            },
            morphTargetInfluences: {
                type: "f",
                value: 0
            }
        },
        bump: {
            bumpMap: {
                type: "t",
                value: null
            },
            bumpScale: {
                type: "f",
                value: 1
            }
        },
        normalmap: {
            normalMap: {
                type: "t",
                value: null
            },
            normalScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            }
        },
        fog: {
            fogDensity: {
                type: "f",
                value: 25e-5
            },
            fogNear: {
                type: "f",
                value: 1
            },
            fogFar: {
                type: "f",
                value: 2e3
            },
            fogColor: {
                type: "c",
                value: new THREE.Color(16777215)
            }
        },
        lights: {
            ambientLightColor: {
                type: "fv",
                value: []
            },
            directionalLightDirection: {
                type: "fv",
                value: []
            },
            directionalLightColor: {
                type: "fv",
                value: []
            },
            hemisphereLightDirection: {
                type: "fv",
                value: []
            },
            hemisphereLightSkyColor: {
                type: "fv",
                value: []
            },
            hemisphereLightGroundColor: {
                type: "fv",
                value: []
            },
            pointLightColor: {
                type: "fv",
                value: []
            },
            pointLightPosition: {
                type: "fv",
                value: []
            },
            pointLightDistance: {
                type: "fv1",
                value: []
            },
            pointLightDecay: {
                type: "fv1",
                value: []
            },
            spotLightColor: {
                type: "fv",
                value: []
            },
            spotLightPosition: {
                type: "fv",
                value: []
            },
            spotLightDirection: {
                type: "fv",
                value: []
            },
            spotLightDistance: {
                type: "fv1",
                value: []
            },
            spotLightAngleCos: {
                type: "fv1",
                value: []
            },
            spotLightExponent: {
                type: "fv1",
                value: []
            },
            spotLightDecay: {
                type: "fv1",
                value: []
            }
        },
        particle: {
            psColor: {
                type: "c",
                value: new THREE.Color(15658734)
            },
            opacity: {
                type: "f",
                value: 1
            },
            size: {
                type: "f",
                value: 1
            },
            scale: {
                type: "f",
                value: 1
            },
            map: {
                type: "t",
                value: null
            },
            offsetRepeat: {
                type: "v4",
                value: new THREE.Vector4(0, 0, 1, 1)
            },
            fogDensity: {
                type: "f",
                value: 25e-5
            },
            fogNear: {
                type: "f",
                value: 1
            },
            fogFar: {
                type: "f",
                value: 2e3
            },
            fogColor: {
                type: "c",
                value: new THREE.Color(16777215)
            }
        },
        shadowmap: {
            shadowMap: {
                type: "tv",
                value: []
            },
            shadowMapSize: {
                type: "v2v",
                value: []
            },
            shadowBias: {
                type: "fv1",
                value: []
            },
            shadowDarkness: {
                type: "fv1",
                value: []
            },
            shadowMatrix: {
                type: "m4v",
                value: []
            }
        }
    }, THREE.ShaderLib = {
        basic: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.shadowmap]),
            vertexShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.skinbase_vertex, "\t#ifdef USE_ENVMAP", THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, "\t#endif", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"),
            fragmentShader: ["uniform vec3 diffuse;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tvec3 outgoingLight = vec3( 0.0 );", "\tvec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, "\toutgoingLight = diffuseColor.rgb;", THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
        },
        lambert: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
                emissive: {
                    type: "c",
                    value: new THREE.Color(0)
                },
                wrapRGB: {
                    type: "v3",
                    value: new THREE.Vector3(1, 1, 1)
                }
            }]),
            vertexShader: ["#define LAMBERT", "varying vec3 vLightFront;", "#ifdef DOUBLE_SIDED", "\tvarying vec3 vLightBack;", "#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_lambert_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.lights_lambert_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"),
            fragmentShader: ["uniform vec3 diffuse;", "uniform vec3 emissive;", "uniform float opacity;", "varying vec3 vLightFront;", "#ifdef DOUBLE_SIDED", "\tvarying vec3 vLightBack;", "#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tvec3 outgoingLight = vec3( 0.0 );", "\tvec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, "\t#ifdef DOUBLE_SIDED", "\t\tif ( gl_FrontFacing )", "\t\t\toutgoingLight += diffuseColor.rgb * vLightFront + emissive;", "\t\telse", "\t\t\toutgoingLight += diffuseColor.rgb * vLightBack + emissive;", "\t#else", "\t\toutgoingLight += diffuseColor.rgb * vLightFront + emissive;", "\t#endif", THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
        },
        phong: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.bump, THREE.UniformsLib.normalmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
                emissive: {
                    type: "c",
                    value: new THREE.Color(0)
                },
                specular: {
                    type: "c",
                    value: new THREE.Color(1118481)
                },
                shininess: {
                    type: "f",
                    value: 30
                },
                wrapRGB: {
                    type: "v3",
                    value: new THREE.Vector3(1, 1, 1)
                }
            }]),
            vertexShader: ["#define PHONG", "varying vec3 vViewPosition;", "#ifndef FLAT_SHADED", "\tvarying vec3 vNormal;", "#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_phong_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, "#ifndef FLAT_SHADED", "\tvNormal = normalize( transformedNormal );", "#endif", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "\tvViewPosition = -mvPosition.xyz;", THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.lights_phong_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"),
            fragmentShader: ["#define PHONG", "uniform vec3 diffuse;", "uniform vec3 emissive;", "uniform vec3 specular;", "uniform float shininess;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.lights_phong_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.bumpmap_pars_fragment, THREE.ShaderChunk.normalmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tvec3 outgoingLight = vec3( 0.0 );", "\tvec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, THREE.ShaderChunk.lights_phong_fragment, THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
        },
        particle_basic: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.particle, THREE.UniformsLib.shadowmap]),
            vertexShader: ["uniform float size;", "uniform float scale;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.color_vertex, "\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "\t#ifdef USE_SIZEATTENUATION", "\t\tgl_PointSize = size * ( scale / length( mvPosition.xyz ) );", "\t#else", "\t\tgl_PointSize = size;", "\t#endif", "\tgl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"].join("\n"),
            fragmentShader: ["uniform vec3 psColor;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_particle_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tvec3 outgoingLight = vec3( 0.0 );", "\tvec4 diffuseColor = vec4( psColor, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_particle_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphatest_fragment, "\toutgoingLight = diffuseColor.rgb;", THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.fog_fragment, "\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
        },
        dashed: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, {
                scale: {
                    type: "f",
                    value: 1
                },
                dashSize: {
                    type: "f",
                    value: 1
                },
                totalSize: {
                    type: "f",
                    value: 2
                }
            }]),
            vertexShader: ["uniform float scale;", "attribute float lineDistance;", "varying float vLineDistance;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.color_vertex, "\tvLineDistance = scale * lineDistance;", "\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "\tgl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"),
            fragmentShader: ["uniform vec3 diffuse;", "uniform float opacity;", "uniform float dashSize;", "uniform float totalSize;", "varying float vLineDistance;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tif ( mod( vLineDistance, totalSize ) > dashSize ) {", "\t\tdiscard;", "\t}", "\tvec3 outgoingLight = vec3( 0.0 );", "\tvec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.color_fragment, "\toutgoingLight = diffuseColor.rgb;", THREE.ShaderChunk.fog_fragment, "\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );", "}"].join("\n")
        },
        depth: {
            uniforms: {
                mNear: {
                    type: "f",
                    value: 1
                },
                mFar: {
                    type: "f",
                    value: 2e3
                },
                opacity: {
                    type: "f",
                    value: 1
                }
            },
            vertexShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"),
            fragmentShader: ["uniform float mNear;", "uniform float mFar;", "uniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", THREE.ShaderChunk.logdepthbuf_fragment, "\t#ifdef USE_LOGDEPTHBUF_EXT", "\t\tfloat depth = gl_FragDepthEXT / gl_FragCoord.w;", "\t#else", "\t\tfloat depth = gl_FragCoord.z / gl_FragCoord.w;", "\t#endif", "\tfloat color = 1.0 - smoothstep( mNear, mFar, depth );", "\tgl_FragColor = vec4( vec3( color ), opacity );", "}"].join("\n")
        },
        normal: {
            uniforms: {
                opacity: {
                    type: "f",
                    value: 1
                }
            },
            vertexShader: ["varying vec3 vNormal;", THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", "\tvNormal = normalize( normalMatrix * normal );", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"),
            fragmentShader: ["uniform float opacity;", "varying vec3 vNormal;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tgl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, "}"].join("\n")
        },
        cube: {
            uniforms: {
                tCube: {
                    type: "t",
                    value: null
                },
                tFlip: {
                    type: "f",
                    value: -1
                }
            },
            vertexShader: ["varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", "\tvWorldPosition = transformDirection( position, modelMatrix );", "\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"),
            fragmentShader: ["uniform samplerCube tCube;", "uniform float tFlip;", "varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tgl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );", THREE.ShaderChunk.logdepthbuf_fragment, "}"].join("\n")
        },
        equirect: {
            uniforms: {
                tEquirect: {
                    type: "t",
                    value: null
                },
                tFlip: {
                    type: "f",
                    value: -1
                }
            },
            vertexShader: ["varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", "\tvWorldPosition = transformDirection( position, modelMatrix );", "\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"),
            fragmentShader: ["uniform sampler2D tEquirect;", "uniform float tFlip;", "varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "vec3 direction = normalize( vWorldPosition );", "vec2 sampleUV;", "sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );", "sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;", "gl_FragColor = texture2D( tEquirect, sampleUV );", THREE.ShaderChunk.logdepthbuf_fragment, "}"].join("\n")
        },
        depthRGBA: {
            uniforms: {},
            vertexShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}"].join("\n"),
            fragmentShader: [THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "vec4 pack_depth( const in float depth ) {", "\tconst vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );", "\tconst vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );", "\tvec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );", "\tres -= res.xxyz * bit_mask;", "\treturn res;", "}", "void main() {", THREE.ShaderChunk.logdepthbuf_fragment, "\t#ifdef USE_LOGDEPTHBUF_EXT", "\t\tgl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );", "\t#else", "\t\tgl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );", "\t#endif", "}"].join("\n")
        }
    }, THREE.WebGLRenderer = function(t) {
        function e(t) {
            t.__webglVertexBuffer = Ct.createBuffer(), t.__webglColorBuffer = Ct.createBuffer(), Lt.info.memory.geometries++
        }

        function r(t) {
            t.__webglVertexBuffer = Ct.createBuffer(), t.__webglColorBuffer = Ct.createBuffer(), t.__webglLineDistanceBuffer = Ct.createBuffer(), Lt.info.memory.geometries++
        }

        function i(t) {
            t.__webglVertexBuffer = Ct.createBuffer(), t.__webglNormalBuffer = Ct.createBuffer(), t.__webglTangentBuffer = Ct.createBuffer(), t.__webglColorBuffer = Ct.createBuffer(), t.__webglUVBuffer = Ct.createBuffer(), t.__webglUV2Buffer = Ct.createBuffer(), t.__webglSkinIndicesBuffer = Ct.createBuffer(), t.__webglSkinWeightsBuffer = Ct.createBuffer(), t.__webglFaceBuffer = Ct.createBuffer(), t.__webglLineBuffer = Ct.createBuffer();
            var e = t.numMorphTargets;
            if (e) {
                t.__webglMorphTargetsBuffers = [];
                for (var r = 0, i = e; r < i; r++) t.__webglMorphTargetsBuffers.push(Ct.createBuffer())
            }
            var n = t.numMorphNormals;
            if (n) {
                t.__webglMorphNormalsBuffers = [];
                for (var r = 0, i = n; r < i; r++) t.__webglMorphNormalsBuffers.push(Ct.createBuffer())
            }
            Lt.info.memory.geometries++
        }

        function n(t) {
            var e = t.geometry,
                r = t.material,
                i = e.vertices.length;
            if (r.attributes) {
                void 0 === e.__webglCustomAttributesList && (e.__webglCustomAttributesList = []);
                for (var n in r.attributes) {
                    var a = r.attributes[n];
                    if (!a.__webglInitialized || a.createUniqueBuffers) {
                        a.__webglInitialized = !0;
                        var o = 1;
                        "v2" === a.type ? o = 2 : "v3" === a.type ? o = 3 : "v4" === a.type ? o = 4 : "c" === a.type && (o = 3), a.size = o, a.array = new Float32Array(i * o), a.buffer = Ct.createBuffer(), a.buffer.belongsToAttribute = n, a.needsUpdate = !0
                    }
                    e.__webglCustomAttributesList.push(a)
                }
            }
        }

        function a(t, e) {
            var r = t.vertices.length;
            t.__vertexArray = new Float32Array(3 * r), t.__colorArray = new Float32Array(3 * r), t.__webglParticleCount = r, n(e)
        }

        function o(t, e) {
            var r = t.vertices.length;
            t.__vertexArray = new Float32Array(3 * r), t.__colorArray = new Float32Array(3 * r), t.__lineDistanceArray = new Float32Array(1 * r), t.__webglLineCount = r, n(e)
        }

        function s(t, e) {
            var r = e.geometry,
                i = t.faces3,
                n = 3 * i.length,
                a = 1 * i.length,
                o = 3 * i.length,
                s = h(e, t);
            t.__vertexArray = new Float32Array(3 * n), t.__normalArray = new Float32Array(3 * n), t.__colorArray = new Float32Array(3 * n), t.__uvArray = new Float32Array(2 * n), r.faceVertexUvs.length > 1 && (t.__uv2Array = new Float32Array(2 * n)), r.hasTangents && (t.__tangentArray = new Float32Array(4 * n)), e.geometry.skinWeights.length && e.geometry.skinIndices.length && (t.__skinIndexArray = new Float32Array(4 * n), t.__skinWeightArray = new Float32Array(4 * n));
            var l = null !== te.get("OES_element_index_uint") && a > 21845 ? Uint32Array : Uint16Array;
            t.__typeArray = l, t.__faceArray = new l(3 * a), t.__lineArray = new l(2 * o);
            var c = t.numMorphTargets;
            if (c) {
                t.__morphTargetsArrays = [];
                for (var u = 0, E = c; u < E; u++) t.__morphTargetsArrays.push(new Float32Array(3 * n))
            }
            var f = t.numMorphNormals;
            if (f) {
                t.__morphNormalsArrays = [];
                for (var u = 0, E = f; u < E; u++) t.__morphNormalsArrays.push(new Float32Array(3 * n))
            }
            if (t.__webglFaceCount = 3 * a, t.__webglLineCount = 2 * o, s.attributes) {
                void 0 === t.__webglCustomAttributesList && (t.__webglCustomAttributesList = []);
                for (var p in s.attributes) {
                    var d = s.attributes[p],
                        m = {};
                    for (var T in d) m[T] = d[T];
                    if (!m.__webglInitialized || m.createUniqueBuffers) {
                        m.__webglInitialized = !0;
                        var g = 1;
                        "v2" === m.type ? g = 2 : "v3" === m.type ? g = 3 : "v4" === m.type ? g = 4 : "c" === m.type && (g = 3), m.size = g, m.array = new Float32Array(n * g), m.buffer = Ct.createBuffer(), m.buffer.belongsToAttribute = p, d.needsUpdate = !0, m.__original = d
                    }
                    t.__webglCustomAttributesList.push(m)
                }
            }
            t.__inittedArrays = !0
        }

        function h(t, e) {
            return t.material instanceof THREE.MeshFaceMaterial ? t.material.materials[e.materialIndex] : t.material
        }

        function l(t) {
            return t instanceof THREE.MeshPhongMaterial == !1 && t.shading === THREE.FlatShading
        }

        function c(t, e, r) {
            var i, n, a, o, s, h, l, c, u, E, f, p = t.vertices,
                d = p.length,
                m = t.colors,
                T = m.length,
                g = t.__vertexArray,
                v = t.__colorArray,
                R = t.verticesNeedUpdate,
                y = t.colorsNeedUpdate,
                H = t.__webglCustomAttributesList;
            if (R) {
                for (i = 0; i < d; i++) a = p[i], o = 3 * i, g[o] = a.x, g[o + 1] = a.y, g[o + 2] = a.z;
                Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglVertexBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, g, e)
            }
            if (y) {
                for (n = 0; n < T; n++) s = m[n], o = 3 * n, v[o] = s.r, v[o + 1] = s.g, v[o + 2] = s.b;
                Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglColorBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, v, e)
            }
            if (H)
                for (h = 0, l = H.length; h < l; h++) {
                    if (f = H[h], f.needsUpdate && (void 0 === f.boundTo || "vertices" === f.boundTo))
                        if (u = f.value.length, o = 0, 1 === f.size)
                            for (c = 0; c < u; c++) f.array[c] = f.value[c];
                        else if (2 === f.size)
                        for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.x, f.array[o + 1] = E.y, o += 2;
                    else if (3 === f.size)
                        if ("c" === f.type)
                            for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.r, f.array[o + 1] = E.g, f.array[o + 2] = E.b, o += 3;
                        else
                            for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.x, f.array[o + 1] = E.y, f.array[o + 2] = E.z, o += 3;
                    else if (4 === f.size)
                        for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.x, f.array[o + 1] = E.y, f.array[o + 2] = E.z, f.array[o + 3] = E.w, o += 4;
                    Ct.bindBuffer(Ct.ARRAY_BUFFER, f.buffer), Ct.bufferData(Ct.ARRAY_BUFFER, f.array, e), f.needsUpdate = !1
                }
        }

        function u(t, e) {
            var r, i, n, a, o, s, h, l, c, u, E, f, p = t.vertices,
                d = t.colors,
                m = t.lineDistances,
                T = p.length,
                g = d.length,
                v = m.length,
                R = t.__vertexArray,
                y = t.__colorArray,
                H = t.__lineDistanceArray,
                x = t.verticesNeedUpdate,
                b = t.colorsNeedUpdate,
                _ = t.lineDistancesNeedUpdate,
                w = t.__webglCustomAttributesList;
            if (x) {
                for (r = 0; r < T; r++) a = p[r], o = 3 * r, R[o] = a.x, R[o + 1] = a.y, R[o + 2] = a.z;
                Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglVertexBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, R, e)
            }
            if (b) {
                for (i = 0; i < g; i++) s = d[i], o = 3 * i, y[o] = s.r, y[o + 1] = s.g, y[o + 2] = s.b;
                Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglColorBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, y, e)
            }
            if (_) {
                for (n = 0; n < v; n++) H[n] = m[n];
                Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglLineDistanceBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, H, e)
            }
            if (w)
                for (h = 0, l = w.length; h < l; h++)
                    if (f = w[h], f.needsUpdate && (void 0 === f.boundTo || "vertices" === f.boundTo)) {
                        if (o = 0, u = f.value.length, 1 === f.size)
                            for (c = 0; c < u; c++) f.array[c] = f.value[c];
                        else if (2 === f.size)
                            for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.x, f.array[o + 1] = E.y, o += 2;
                        else if (3 === f.size)
                            if ("c" === f.type)
                                for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.r, f.array[o + 1] = E.g, f.array[o + 2] = E.b, o += 3;
                            else
                                for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.x, f.array[o + 1] = E.y, f.array[o + 2] = E.z, o += 3;
                        else if (4 === f.size)
                            for (c = 0; c < u; c++) E = f.value[c], f.array[o] = E.x, f.array[o + 1] = E.y, f.array[o + 2] = E.z, f.array[o + 3] = E.w, o += 4;
                        Ct.bindBuffer(Ct.ARRAY_BUFFER, f.buffer), Ct.bufferData(Ct.ARRAY_BUFFER, f.array, e), f.needsUpdate = !1
                    }
        }

        function E(t, e, r, i, n) {
            if (t.__inittedArrays) {
                var a, o, s, h, c, u, E, f, p, d, m, T, g, v, R, y, H, x, b, _, w, M, S, A, C, L, P, F, U, B, D, V, z, k, N, O, G, I, W, j, X, q, Y = l(n),
                    K = 0,
                    Q = 0,
                    Z = 0,
                    J = 0,
                    $ = 0,
                    tt = 0,
                    et = 0,
                    rt = 0,
                    it = 0,
                    nt = 0,
                    at = 0,
                    ot = 0,
                    st = t.__vertexArray,
                    ht = t.__uvArray,
                    lt = t.__uv2Array,
                    ct = t.__normalArray,
                    ut = t.__tangentArray,
                    Et = t.__colorArray,
                    ft = t.__skinIndexArray,
                    pt = t.__skinWeightArray,
                    dt = t.__morphTargetsArrays,
                    mt = t.__morphNormalsArrays,
                    Tt = t.__webglCustomAttributesList,
                    gt = t.__faceArray,
                    vt = t.__lineArray,
                    Rt = e.geometry,
                    yt = Rt.verticesNeedUpdate,
                    Ht = Rt.elementsNeedUpdate,
                    xt = Rt.uvsNeedUpdate,
                    bt = Rt.normalsNeedUpdate,
                    _t = Rt.tangentsNeedUpdate,
                    wt = Rt.colorsNeedUpdate,
                    Mt = Rt.morphTargetsNeedUpdate,
                    St = Rt.vertices,
                    At = t.faces3,
                    Lt = Rt.faces,
                    Pt = Rt.faceVertexUvs[0],
                    Ft = Rt.faceVertexUvs[1],
                    Ut = Rt.skinIndices,
                    Bt = Rt.skinWeights,
                    Dt = Rt.morphTargets,
                    Vt = Rt.morphNormals;
                if (yt) {
                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], T = St[h.a], g = St[h.b], v = St[h.c], st[Q] = T.x, st[Q + 1] = T.y, st[Q + 2] = T.z, st[Q + 3] = g.x, st[Q + 4] = g.y, st[Q + 5] = g.z, st[Q + 6] = v.x, st[Q + 7] = v.y, st[Q + 8] = v.z, Q += 9;
                    Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglVertexBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, st, r)
                }
                if (Mt)
                    for (N = 0, O = Dt.length; N < O; N++) {
                        for (at = 0, a = 0, o = At.length; a < o; a++) W = At[a], h = Lt[W], T = Dt[N].vertices[h.a], g = Dt[N].vertices[h.b], v = Dt[N].vertices[h.c], G = dt[N], G[at] = T.x, G[at + 1] = T.y, G[at + 2] = T.z, G[at + 3] = g.x, G[at + 4] = g.y, G[at + 5] = g.z, G[at + 6] = v.x, G[at + 7] = v.y, G[at + 8] = v.z, n.morphNormals && (Y ? (x = Vt[N].faceNormals[W], b = x, _ = x) : (j = Vt[N].vertexNormals[W], x = j.a, b = j.b, _ = j.c), I = mt[N], I[at] = x.x, I[at + 1] = x.y, I[at + 2] = x.z, I[at + 3] = b.x, I[at + 4] = b.y, I[at + 5] = b.z, I[at + 6] = _.x, I[at + 7] = _.y, I[at + 8] = _.z), at += 9;
                        Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglMorphTargetsBuffers[N]), Ct.bufferData(Ct.ARRAY_BUFFER, dt[N], r), n.morphNormals && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglMorphNormalsBuffers[N]), Ct.bufferData(Ct.ARRAY_BUFFER, mt[N], r))
                    }
                if (Bt.length) {
                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], A = Bt[h.a], C = Bt[h.b], L = Bt[h.c], pt[nt] = A.x, pt[nt + 1] = A.y, pt[nt + 2] = A.z, pt[nt + 3] = A.w, pt[nt + 4] = C.x, pt[nt + 5] = C.y, pt[nt + 6] = C.z, pt[nt + 7] = C.w, pt[nt + 8] = L.x, pt[nt + 9] = L.y, pt[nt + 10] = L.z, pt[nt + 11] = L.w, P = Ut[h.a], F = Ut[h.b], U = Ut[h.c], ft[nt] = P.x, ft[nt + 1] = P.y, ft[nt + 2] = P.z, ft[nt + 3] = P.w, ft[nt + 4] = F.x, ft[nt + 5] = F.y, ft[nt + 6] = F.z, ft[nt + 7] = F.w, ft[nt + 8] = U.x, ft[nt + 9] = U.y, ft[nt + 10] = U.z, ft[nt + 11] = U.w, nt += 12;
                    nt > 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglSkinIndicesBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, ft, r), Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglSkinWeightsBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, pt, r))
                }
                if (wt) {
                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], E = h.vertexColors, f = h.color, 3 === E.length && n.vertexColors === THREE.VertexColors ? (w = E[0], M = E[1], S = E[2]) : (w = f, M = f, S = f), Et[it] = w.r, Et[it + 1] = w.g, Et[it + 2] = w.b, Et[it + 3] = M.r, Et[it + 4] = M.g, Et[it + 5] = M.b, Et[it + 6] = S.r, Et[it + 7] = S.g, Et[it + 8] = S.b, it += 9;
                    it > 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglColorBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, Et, r))
                }
                if (_t && Rt.hasTangents) {
                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], p = h.vertexTangents, R = p[0], y = p[1], H = p[2], ut[et] = R.x, ut[et + 1] = R.y, ut[et + 2] = R.z, ut[et + 3] = R.w, ut[et + 4] = y.x, ut[et + 5] = y.y, ut[et + 6] = y.z, ut[et + 7] = y.w, ut[et + 8] = H.x, ut[et + 9] = H.y, ut[et + 10] = H.z, ut[et + 11] = H.w, et += 12;
                    Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglTangentBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, ut, r)
                }
                if (bt) {
                    for (a = 0, o = At.length; a < o; a++)
                        if (h = Lt[At[a]], c = h.vertexNormals, u = h.normal, 3 === c.length && Y === !1)
                            for (B = 0; B < 3; B++) V = c[B], ct[tt] = V.x, ct[tt + 1] = V.y, ct[tt + 2] = V.z, tt += 3;
                        else
                            for (B = 0; B < 3; B++) ct[tt] = u.x, ct[tt + 1] = u.y, ct[tt + 2] = u.z, tt += 3;
                    Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglNormalBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, ct, r)
                }
                if (xt && Pt) {
                    for (a = 0, o = At.length; a < o; a++)
                        if (s = At[a], d = Pt[s], void 0 !== d)
                            for (B = 0; B < 3; B++) z = d[B], ht[Z] = z.x, ht[Z + 1] = z.y, Z += 2;
                    Z > 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglUVBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, ht, r))
                }
                if (xt && Ft) {
                    for (a = 0, o = At.length; a < o; a++)
                        if (s = At[a], m = Ft[s], void 0 !== m)
                            for (B = 0; B < 3; B++) k = m[B], lt[J] = k.x, lt[J + 1] = k.y, J += 2;
                    J > 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglUV2Buffer), Ct.bufferData(Ct.ARRAY_BUFFER, lt, r))
                }
                if (Ht) {
                    for (a = 0, o = At.length; a < o; a++) gt[$] = K, gt[$ + 1] = K + 1, gt[$ + 2] = K + 2, $ += 3, vt[rt] = K, vt[rt + 1] = K + 1, vt[rt + 2] = K, vt[rt + 3] = K + 2, vt[rt + 4] = K + 1, vt[rt + 5] = K + 2, rt += 6, K += 3;
                    Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, t.__webglFaceBuffer), Ct.bufferData(Ct.ELEMENT_ARRAY_BUFFER, gt, r), Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, t.__webglLineBuffer), Ct.bufferData(Ct.ELEMENT_ARRAY_BUFFER, vt, r)
                }
                if (Tt)
                    for (B = 0, D = Tt.length; B < D; B++)
                        if (q = Tt[B], q.__original.needsUpdate) {
                            if (ot = 0, 1 === q.size) {
                                if (void 0 === q.boundTo || "vertices" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], q.array[ot] = q.value[h.a], q.array[ot + 1] = q.value[h.b], q.array[ot + 2] = q.value[h.c], ot += 3;
                                else if ("faces" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) X = q.value[At[a]], q.array[ot] = X, q.array[ot + 1] = X, q.array[ot + 2] = X, ot += 3
                            } else if (2 === q.size) {
                                if (void 0 === q.boundTo || "vertices" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], T = q.value[h.a], g = q.value[h.b], v = q.value[h.c], q.array[ot] = T.x, q.array[ot + 1] = T.y, q.array[ot + 2] = g.x, q.array[ot + 3] = g.y, q.array[ot + 4] = v.x, q.array[ot + 5] = v.y, ot += 6;
                                else if ("faces" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) X = q.value[At[a]], T = X, g = X, v = X, q.array[ot] = T.x, q.array[ot + 1] = T.y, q.array[ot + 2] = g.x, q.array[ot + 3] = g.y, q.array[ot + 4] = v.x, q.array[ot + 5] = v.y, ot += 6
                            } else if (3 === q.size) {
                                var zt;
                                if (zt = "c" === q.type ? ["r", "g", "b"] : ["x", "y", "z"], void 0 === q.boundTo || "vertices" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], T = q.value[h.a], g = q.value[h.b], v = q.value[h.c], q.array[ot] = T[zt[0]], q.array[ot + 1] = T[zt[1]], q.array[ot + 2] = T[zt[2]], q.array[ot + 3] = g[zt[0]], q.array[ot + 4] = g[zt[1]], q.array[ot + 5] = g[zt[2]], q.array[ot + 6] = v[zt[0]], q.array[ot + 7] = v[zt[1]], q.array[ot + 8] = v[zt[2]], ot += 9;
                                else if ("faces" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) X = q.value[At[a]], T = X, g = X, v = X, q.array[ot] = T[zt[0]], q.array[ot + 1] = T[zt[1]], q.array[ot + 2] = T[zt[2]], q.array[ot + 3] = g[zt[0]], q.array[ot + 4] = g[zt[1]], q.array[ot + 5] = g[zt[2]], q.array[ot + 6] = v[zt[0]], q.array[ot + 7] = v[zt[1]], q.array[ot + 8] = v[zt[2]], ot += 9;
                                else if ("faceVertices" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) X = q.value[At[a]], T = X[0], g = X[1], v = X[2], q.array[ot] = T[zt[0]], q.array[ot + 1] = T[zt[1]], q.array[ot + 2] = T[zt[2]], q.array[ot + 3] = g[zt[0]], q.array[ot + 4] = g[zt[1]], q.array[ot + 5] = g[zt[2]], q.array[ot + 6] = v[zt[0]], q.array[ot + 7] = v[zt[1]], q.array[ot + 8] = v[zt[2]], ot += 9
                            } else if (4 === q.size)
                                if (void 0 === q.boundTo || "vertices" === q.boundTo)
                                    for (a = 0, o = At.length; a < o; a++) h = Lt[At[a]], T = q.value[h.a], g = q.value[h.b], v = q.value[h.c], q.array[ot] = T.x, q.array[ot + 1] = T.y, q.array[ot + 2] = T.z, q.array[ot + 3] = T.w, q.array[ot + 4] = g.x, q.array[ot + 5] = g.y, q.array[ot + 6] = g.z, q.array[ot + 7] = g.w, q.array[ot + 8] = v.x, q.array[ot + 9] = v.y, q.array[ot + 10] = v.z, q.array[ot + 11] = v.w, ot += 12;
                                else if ("faces" === q.boundTo)
                                for (a = 0, o = At.length; a < o; a++) X = q.value[At[a]], T = X, g = X, v = X, q.array[ot] = T.x, q.array[ot + 1] = T.y, q.array[ot + 2] = T.z, q.array[ot + 3] = T.w, q.array[ot + 4] = g.x, q.array[ot + 5] = g.y, q.array[ot + 6] = g.z, q.array[ot + 7] = g.w, q.array[ot + 8] = v.x, q.array[ot + 9] = v.y, q.array[ot + 10] = v.z, q.array[ot + 11] = v.w, ot += 12;
                            else if ("faceVertices" === q.boundTo)
                                for (a = 0, o = At.length; a < o; a++) X = q.value[At[a]], T = X[0], g = X[1], v = X[2], q.array[ot] = T.x, q.array[ot + 1] = T.y, q.array[ot + 2] = T.z, q.array[ot + 3] = T.w, q.array[ot + 4] = g.x, q.array[ot + 5] = g.y, q.array[ot + 6] = g.z, q.array[ot + 7] = g.w, q.array[ot + 8] = v.x, q.array[ot + 9] = v.y, q.array[ot + 10] = v.z, q.array[ot + 11] = v.w, ot += 12;
                            Ct.bindBuffer(Ct.ARRAY_BUFFER, q.buffer), Ct.bufferData(Ct.ARRAY_BUFFER, q.array, r)
                        }
                i && (delete t.__inittedArrays, delete t.__colorArray, delete t.__normalArray, delete t.__tangentArray, delete t.__uvArray, delete t.__uv2Array, delete t.__faceArray, delete t.__vertexArray, delete t.__lineArray, delete t.__skinIndexArray, delete t.__skinWeightArray)
            }
        }

        function f(t, e, r, i) {
            for (var n = r.attributes, a = e.attributes, o = e.attributesKeys, s = 0, h = o.length; s < h; s++) {
                var l = o[s],
                    c = a[l];
                if (c >= 0) {
                    var u = n[l];
                    if (void 0 !== u) {
                        var E = u.itemSize;
                        Ct.bindBuffer(Ct.ARRAY_BUFFER, u.buffer), $t.enableAttribute(c), Ct.vertexAttribPointer(c, E, Ct.FLOAT, !1, 0, i * E * 4)
                    } else void 0 !== t.defaultAttributeValues && (2 === t.defaultAttributeValues[l].length ? Ct.vertexAttrib2fv(c, t.defaultAttributeValues[l]) : 3 === t.defaultAttributeValues[l].length && Ct.vertexAttrib3fv(c, t.defaultAttributeValues[l]))
                }
            }
            $t.disableUnusedAttributes()
        }

        function p(t, e, r) {
            var i = t.program.attributes;
            if (r.morphTargetBase !== -1 && i.position >= 0 ? (Ct.bindBuffer(Ct.ARRAY_BUFFER, e.__webglMorphTargetsBuffers[r.morphTargetBase]), $t.enableAttribute(i.position), Ct.vertexAttribPointer(i.position, 3, Ct.FLOAT, !1, 0, 0)) : i.position >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, e.__webglVertexBuffer), $t.enableAttribute(i.position), Ct.vertexAttribPointer(i.position, 3, Ct.FLOAT, !1, 0, 0)), r.morphTargetForcedOrder.length)
                for (var n, a = 0, o = r.morphTargetForcedOrder, s = r.morphTargetInfluences; a < t.numSupportedMorphTargets && a < o.length;) n = i["morphTarget" + a], n >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, e.__webglMorphTargetsBuffers[o[a]]), $t.enableAttribute(n), Ct.vertexAttribPointer(n, 3, Ct.FLOAT, !1, 0, 0)), n = i["morphNormal" + a], n >= 0 && t.morphNormals && (Ct.bindBuffer(Ct.ARRAY_BUFFER, e.__webglMorphNormalsBuffers[o[a]]), $t.enableAttribute(n), Ct.vertexAttribPointer(n, 3, Ct.FLOAT, !1, 0, 0)), r.__webglMorphTargetInfluences[a] = s[o[a]], a++;
            else {
                var h = [],
                    s = r.morphTargetInfluences,
                    l = r.geometry.morphTargets;
                s.length > l.length && (console.warn("THREE.WebGLRenderer: Influences array is bigger than morphTargets array."), s.length = l.length);
                for (var c = 0, u = s.length; c < u; c++) {
                    var E = s[c];
                    h.push([E, c])
                }
                h.length > t.numSupportedMorphTargets ? (h.sort(T), h.length = t.numSupportedMorphTargets) : h.length > t.numSupportedMorphNormals ? h.sort(T) : 0 === h.length && h.push([0, 0]);
                for (var n, a = 0, f = t.numSupportedMorphTargets; a < f; a++)
                    if (h[a]) {
                        var p = h[a][1];
                        n = i["morphTarget" + a], n >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, e.__webglMorphTargetsBuffers[p]), $t.enableAttribute(n), Ct.vertexAttribPointer(n, 3, Ct.FLOAT, !1, 0, 0)), n = i["morphNormal" + a], n >= 0 && t.morphNormals && (Ct.bindBuffer(Ct.ARRAY_BUFFER, e.__webglMorphNormalsBuffers[p]), $t.enableAttribute(n), Ct.vertexAttribPointer(n, 3, Ct.FLOAT, !1, 0, 0)), r.__webglMorphTargetInfluences[a] = s[p]
                    } else r.__webglMorphTargetInfluences[a] = 0
            }
            null !== t.program.uniforms.morphTargetInfluences && Ct.uniform1fv(t.program.uniforms.morphTargetInfluences, r.__webglMorphTargetInfluences)
        }

        function d(t, e) {
            return t.object.renderOrder !== e.object.renderOrder ? t.object.renderOrder - e.object.renderOrder : t.material.id !== e.material.id ? t.material.id - e.material.id : t.z !== e.z ? t.z - e.z : t.id - e.id
        }

        function m(t, e) {
            return t.object.renderOrder !== e.object.renderOrder ? t.object.renderOrder - e.object.renderOrder : t.z !== e.z ? e.z - t.z : t.id - e.id
        }

        function T(t, e) {
            return e[0] - t[0]
        }

        function g(t) {
            if (t.visible !== !1) {
                if (t instanceof THREE.Scene || t instanceof THREE.Group);
                else if (x(t), t instanceof THREE.Light) xt.push(t);
                else if (t instanceof THREE.Sprite) St.push(t);
                else if (t instanceof THREE.LensFlare) At.push(t);
                else {
                    var e = bt[t.id];
                    if (e && (t.frustumCulled === !1 || jt.intersectsObject(t) === !0))
                        for (var r = 0, i = e.length; r < i; r++) {
                            var n = e[r];
                            H(n), n.render = !0, Lt.sortObjects === !0 && (qt.setFromMatrixPosition(t.matrixWorld), qt.applyProjection(Xt), n.z = qt.z)
                        }
                }
                for (var r = 0, i = t.children.length; r < i; r++) g(t.children[r])
            }
        }

        function v(t, e, r, i, n) {
            for (var a, o = 0, s = t.length; o < s; o++) {
                var h = t[o],
                    l = h.object,
                    c = h.buffer;
                if (K(l, e), n) a = n;
                else {
                    if (a = h.material, !a) continue;
                    U(a)
                }
                Lt.setMaterialFaces(a), c instanceof THREE.BufferGeometry ? Lt.renderBufferDirect(e, r, i, a, c, l) : Lt.renderBuffer(e, r, i, a, c, l)
            }
        }

        function R(t, e, r, i, n, a) {
            for (var o, s = 0, h = t.length; s < h; s++) {
                var l = t[s],
                    c = l.object;
                if (c.visible) {
                    if (a) o = a;
                    else {
                        if (o = l[e], !o) continue;
                        U(o)
                    }
                    Lt.renderImmediateObject(r, i, n, o, c)
                }
            }
        }

        function y(t) {
            var e = t.object,
                r = e.material;
            r.transparent ? (t.transparent = r, t.opaque = null) : (t.opaque = r, t.transparent = null)
        }

        function H(t) {
            var e = t.object,
                r = t.buffer,
                i = e.geometry,
                n = e.material;
            if (n instanceof THREE.MeshFaceMaterial) {
                var a = i instanceof THREE.BufferGeometry ? 0 : r.materialIndex;
                n = n.materials[a], t.material = n, n.transparent ? Mt.push(t) : wt.push(t)
            } else n && (t.material = n, n.transparent ? Mt.push(t) : wt.push(t))
        }

        function x(t) {
            void 0 === t.__webglInit && (t.__webglInit = !0, t._modelViewMatrix = new THREE.Matrix4, t._normalMatrix = new THREE.Matrix3, t.addEventListener("removed", Re));
            var i = t.geometry;
            if (void 0 === i || void 0 === i.__webglInit && (i.__webglInit = !0, i.addEventListener("dispose", ye), i instanceof THREE.BufferGeometry ? Lt.info.memory.geometries++ : t instanceof THREE.Mesh ? _(t, i) : t instanceof THREE.Line ? void 0 === i.__webglVertexBuffer && (r(i), o(i, t), i.verticesNeedUpdate = !0, i.colorsNeedUpdate = !0, i.lineDistancesNeedUpdate = !0) : t instanceof THREE.PointCloud && void 0 === i.__webglVertexBuffer && (e(i), a(i, t), i.verticesNeedUpdate = !0, i.colorsNeedUpdate = !0)), void 0 === t.__webglActive)
                if (t.__webglActive = !0, t instanceof THREE.Mesh) {
                    if (i instanceof THREE.BufferGeometry) w(bt, i, t);
                    else if (i instanceof THREE.Geometry)
                        for (var n = Ce[i.id], s = 0, h = n.length; s < h; s++) w(bt, n[s], t)
                } else t instanceof THREE.Line || t instanceof THREE.PointCloud ? w(bt, i, t) : (t instanceof THREE.ImmediateRenderObject || t.immediateRenderCallback) && M(_t, t)
        }

        function b(t, e) {
            for (var r, i, n = te.get("OES_element_index_uint") ? 4294967296 : 65535, a = {}, o = t.morphTargets.length, s = t.morphNormals.length, h = {}, l = [], c = 0, u = t.faces.length; c < u; c++) {
                var E = t.faces[c],
                    f = e ? E.materialIndex : 0;
                f in a || (a[f] = {
                    hash: f,
                    counter: 0
                }), r = a[f].hash + "_" + a[f].counter, r in h || (i = {
                    id: Le++,
                    faces3: [],
                    materialIndex: f,
                    vertices: 0,
                    numMorphTargets: o,
                    numMorphNormals: s
                }, h[r] = i, l.push(i)), h[r].vertices + 3 > n && (a[f].counter += 1, r = a[f].hash + "_" + a[f].counter, r in h || (i = {
                    id: Le++,
                    faces3: [],
                    materialIndex: f,
                    vertices: 0,
                    numMorphTargets: o,
                    numMorphNormals: s
                }, h[r] = i, l.push(i))), h[r].faces3.push(c), h[r].vertices += 3
            }
            return l
        }

        function _(t, e) {
            var r = t.material,
                n = !1;
            void 0 !== Ce[e.id] && e.groupsNeedUpdate !== !0 || (delete bt[t.id], Ce[e.id] = b(e, r instanceof THREE.MeshFaceMaterial), e.groupsNeedUpdate = !1);
            for (var a = Ce[e.id], o = 0, h = a.length; o < h; o++) {
                var l = a[o];
                void 0 === l.__webglVertexBuffer ? (i(l), s(l, t), e.verticesNeedUpdate = !0, e.morphTargetsNeedUpdate = !0, e.elementsNeedUpdate = !0, e.uvsNeedUpdate = !0, e.normalsNeedUpdate = !0, e.tangentsNeedUpdate = !0, e.colorsNeedUpdate = !0, n = !0) : n = !1, (n || void 0 === t.__webglActive) && w(bt, l, t)
            }
            t.__webglActive = !0
        }

        function w(t, e, r) {
            var i = r.id;
            t[i] = t[i] || [], t[i].push({
                id: i,
                buffer: e,
                object: r,
                material: null,
                z: 0
            })
        }

        function M(t, e) {
            t.push({
                id: null,
                object: e,
                opaque: null,
                transparent: null,
                z: 0
            })
        }

        function S(t) {
            var e = t.geometry;
            if (e instanceof THREE.BufferGeometry)
                for (var r = e.attributes, i = e.attributesKeys, n = 0, a = i.length; n < a; n++) {
                    var o = i[n],
                        s = r[o],
                        l = "index" === o ? Ct.ELEMENT_ARRAY_BUFFER : Ct.ARRAY_BUFFER;
                    void 0 === s.buffer ? (s.buffer = Ct.createBuffer(), Ct.bindBuffer(l, s.buffer), Ct.bufferData(l, s.array, s instanceof THREE.DynamicBufferAttribute ? Ct.DYNAMIC_DRAW : Ct.STATIC_DRAW), s.needsUpdate = !1) : s.needsUpdate === !0 && (Ct.bindBuffer(l, s.buffer), void 0 === s.updateRange || s.updateRange.count === -1 ? Ct.bufferSubData(l, 0, s.array) : 0 === s.updateRange.count ? console.error("THREE.WebGLRenderer.updateObject: using updateRange for THREE.DynamicBufferAttribute and marked as needsUpdate but count is 0, ensure you are using set methods or updating manually.") : (Ct.bufferSubData(l, s.updateRange.offset * s.array.BYTES_PER_ELEMENT, s.array.subarray(s.updateRange.offset, s.updateRange.offset + s.updateRange.count)), s.updateRange.count = 0), s.needsUpdate = !1)
                } else if (t instanceof THREE.Mesh) {
                    e.groupsNeedUpdate === !0 && _(t, e);
                    for (var f = Ce[e.id], n = 0, p = f.length; n < p; n++) {
                        var d = f[n],
                            m = h(t, d),
                            T = m.attributes && A(m);
                        (e.verticesNeedUpdate || e.morphTargetsNeedUpdate || e.elementsNeedUpdate || e.uvsNeedUpdate || e.normalsNeedUpdate || e.colorsNeedUpdate || e.tangentsNeedUpdate || T) && E(d, t, Ct.DYNAMIC_DRAW, !e.dynamic, m)
                    }
                    e.verticesNeedUpdate = !1, e.morphTargetsNeedUpdate = !1, e.elementsNeedUpdate = !1, e.uvsNeedUpdate = !1, e.normalsNeedUpdate = !1, e.colorsNeedUpdate = !1, e.tangentsNeedUpdate = !1, m.attributes && C(m)
                } else if (t instanceof THREE.Line) {
                var m = h(t, e),
                    T = m.attributes && A(m);
                (e.verticesNeedUpdate || e.colorsNeedUpdate || e.lineDistancesNeedUpdate || T) && u(e, Ct.DYNAMIC_DRAW), e.verticesNeedUpdate = !1, e.colorsNeedUpdate = !1, e.lineDistancesNeedUpdate = !1, m.attributes && C(m)
            } else if (t instanceof THREE.PointCloud) {
                var m = h(t, e),
                    T = m.attributes && A(m);
                (e.verticesNeedUpdate || e.colorsNeedUpdate || T) && c(e, Ct.DYNAMIC_DRAW, t), e.verticesNeedUpdate = !1, e.colorsNeedUpdate = !1, m.attributes && C(m)
            }
        }

        function A(t) {
            for (var e in t.attributes)
                if (t.attributes[e].needsUpdate) return !0;
            return !1
        }

        function C(t) {
            for (var e in t.attributes) t.attributes[e].needsUpdate = !1
        }

        function L(t) {
            t instanceof THREE.Mesh || t instanceof THREE.PointCloud || t instanceof THREE.Line ? delete bt[t.id] : (t instanceof THREE.ImmediateRenderObject || t.immediateRenderCallback) && P(_t, t),
                delete t.__webglInit, delete t._modelViewMatrix, delete t._normalMatrix, delete t.__webglActive
        }

        function P(t, e) {
            for (var r = t.length - 1; r >= 0; r--) t[r].object === e && t.splice(r, 1)
        }

        function F(t, e, r, i) {
            t.addEventListener("dispose", be);
            var n = Pe[t.type];
            if (n) {
                var a = THREE.ShaderLib[n];
                t.__webglShader = {
                    uniforms: THREE.UniformsUtils.clone(a.uniforms),
                    vertexShader: a.vertexShader,
                    fragmentShader: a.fragmentShader
                }
            } else t.__webglShader = {
                uniforms: t.uniforms,
                vertexShader: t.vertexShader,
                fragmentShader: t.fragmentShader
            };
            var o = ht(e),
                s = lt(e),
                h = st(i),
                l = {
                    precision: ft,
                    supportsVertexTextures: he,
                    map: !!t.map,
                    envMap: !!t.envMap,
                    envMapMode: t.envMap && t.envMap.mapping,
                    lightMap: !!t.lightMap,
                    bumpMap: !!t.bumpMap,
                    normalMap: !!t.normalMap,
                    specularMap: !!t.specularMap,
                    alphaMap: !!t.alphaMap,
                    combine: t.combine,
                    vertexColors: t.vertexColors,
                    fog: r,
                    useFog: t.fog,
                    fogExp: r instanceof THREE.FogExp2,
                    flatShading: t.shading === THREE.FlatShading,
                    sizeAttenuation: t.sizeAttenuation,
                    logarithmicDepthBuffer: Rt,
                    skinning: t.skinning,
                    maxBones: h,
                    useVertexTexture: le && i && i.skeleton && i.skeleton.useVertexTexture,
                    morphTargets: t.morphTargets,
                    morphNormals: t.morphNormals,
                    maxMorphTargets: Lt.maxMorphTargets,
                    maxMorphNormals: Lt.maxMorphNormals,
                    maxDirLights: o.directional,
                    maxPointLights: o.point,
                    maxSpotLights: o.spot,
                    maxHemiLights: o.hemi,
                    maxShadows: s,
                    shadowMapEnabled: Lt.shadowMapEnabled && i.receiveShadow && s > 0,
                    shadowMapType: Lt.shadowMapType,
                    shadowMapDebug: Lt.shadowMapDebug,
                    shadowMapCascade: Lt.shadowMapCascade,
                    alphaTest: t.alphaTest,
                    metal: t.metal,
                    wrapAround: t.wrapAround,
                    doubleSided: t.side === THREE.DoubleSide,
                    flipSided: t.side === THREE.BackSide
                },
                c = [];
            if (n ? c.push(n) : (c.push(t.fragmentShader), c.push(t.vertexShader)), void 0 !== t.defines)
                for (var u in t.defines) c.push(u), c.push(t.defines[u]);
            for (var u in l) c.push(u), c.push(l[u]);
            for (var E, f = c.join(), p = 0, d = Pt.length; p < d; p++) {
                var m = Pt[p];
                if (m.code === f) {
                    E = m, E.usedTimes++;
                    break
                }
            }
            void 0 === E && (E = new THREE.WebGLProgram(Lt, f, t, l), Pt.push(E), Lt.info.memory.programs = Pt.length), t.program = E;
            var T = E.attributes;
            if (t.morphTargets) {
                t.numSupportedMorphTargets = 0;
                for (var g, v = "morphTarget", R = 0; R < Lt.maxMorphTargets; R++) g = v + R, T[g] >= 0 && t.numSupportedMorphTargets++
            }
            if (t.morphNormals) {
                t.numSupportedMorphNormals = 0;
                var g, v = "morphNormal";
                for (R = 0; R < Lt.maxMorphNormals; R++) g = v + R, T[g] >= 0 && t.numSupportedMorphNormals++
            }
            t.uniformsList = [];
            for (var y in t.__webglShader.uniforms) {
                var H = t.program.uniforms[y];
                H && t.uniformsList.push([t.__webglShader.uniforms[y], H])
            }
        }

        function U(t) {
            t.transparent === !0 ? $t.setBlending(t.blending, t.blendEquation, t.blendSrc, t.blendDst, t.blendEquationAlpha, t.blendSrcAlpha, t.blendDstAlpha) : $t.setBlending(THREE.NoBlending), $t.setDepthTest(t.depthTest), $t.setDepthWrite(t.depthWrite), $t.setColorWrite(t.colorWrite), $t.setPolygonOffset(t.polygonOffset, t.polygonOffsetFactor, t.polygonOffsetUnits)
        }

        function B(t, e, r, i, n) {
            zt = 0, i.needsUpdate && (i.program && Ae(i), F(i, e, r, n), i.needsUpdate = !1), i.morphTargets && (n.__webglMorphTargetInfluences || (n.__webglMorphTargetInfluences = new Float32Array(Lt.maxMorphTargets)));
            var a = !1,
                o = !1,
                s = !1,
                h = i.program,
                l = h.uniforms,
                c = i.__webglShader.uniforms;
            if (h.id !== Ft && (Ct.useProgram(h.program), Ft = h.id, a = !0, o = !0, s = !0), i.id !== Bt && (Bt === -1 && (s = !0), Bt = i.id, o = !0), (a || t !== Vt) && (Ct.uniformMatrix4fv(l.projectionMatrix, !1, t.projectionMatrix.elements), Rt && Ct.uniform1f(l.logDepthBufFC, 2 / (Math.log(t.far + 1) / Math.LN2)), t !== Vt && (Vt = t), (i instanceof THREE.ShaderMaterial || i instanceof THREE.MeshPhongMaterial || i.envMap) && null !== l.cameraPosition && (qt.setFromMatrixPosition(t.matrixWorld), Ct.uniform3f(l.cameraPosition, qt.x, qt.y, qt.z)), (i instanceof THREE.MeshPhongMaterial || i instanceof THREE.MeshLambertMaterial || i instanceof THREE.MeshBasicMaterial || i instanceof THREE.ShaderMaterial || i.skinning) && null !== l.viewMatrix && Ct.uniformMatrix4fv(l.viewMatrix, !1, t.matrixWorldInverse.elements)), i.skinning)
                if (n.bindMatrix && null !== l.bindMatrix && Ct.uniformMatrix4fv(l.bindMatrix, !1, n.bindMatrix.elements), n.bindMatrixInverse && null !== l.bindMatrixInverse && Ct.uniformMatrix4fv(l.bindMatrixInverse, !1, n.bindMatrixInverse.elements), le && n.skeleton && n.skeleton.useVertexTexture) {
                    if (null !== l.boneTexture) {
                        var u = q();
                        Ct.uniform1i(l.boneTexture, u), Lt.setTexture(n.skeleton.boneTexture, u)
                    }
                    null !== l.boneTextureWidth && Ct.uniform1i(l.boneTextureWidth, n.skeleton.boneTextureWidth), null !== l.boneTextureHeight && Ct.uniform1i(l.boneTextureHeight, n.skeleton.boneTextureHeight)
                } else n.skeleton && n.skeleton.boneMatrices && null !== l.boneGlobalMatrices && Ct.uniformMatrix4fv(l.boneGlobalMatrices, !1, n.skeleton.boneMatrices);
            return o && (r && i.fog && N(c, r), (i instanceof THREE.MeshPhongMaterial || i instanceof THREE.MeshLambertMaterial || i.lights) && (Kt && (s = !0, Z(e), Kt = !1), s ? (I(c, Qt), W(c, !0)) : W(c, !1)), (i instanceof THREE.MeshBasicMaterial || i instanceof THREE.MeshLambertMaterial || i instanceof THREE.MeshPhongMaterial) && D(c, i), i instanceof THREE.LineBasicMaterial ? V(c, i) : i instanceof THREE.LineDashedMaterial ? (V(c, i), z(c, i)) : i instanceof THREE.PointCloudMaterial ? k(c, i) : i instanceof THREE.MeshPhongMaterial ? O(c, i) : i instanceof THREE.MeshLambertMaterial ? G(c, i) : i instanceof THREE.MeshDepthMaterial ? (c.mNear.value = t.near, c.mFar.value = t.far, c.opacity.value = i.opacity) : i instanceof THREE.MeshNormalMaterial && (c.opacity.value = i.opacity), n.receiveShadow && !i._shadowPass && j(c, e), Y(i.uniformsList)), X(l, n), null !== l.modelMatrix && Ct.uniformMatrix4fv(l.modelMatrix, !1, n.matrixWorld.elements), h
        }

        function D(t, e) {
            t.opacity.value = e.opacity, t.diffuse.value = e.color, t.map.value = e.map, t.lightMap.value = e.lightMap, t.specularMap.value = e.specularMap, t.alphaMap.value = e.alphaMap, e.bumpMap && (t.bumpMap.value = e.bumpMap, t.bumpScale.value = e.bumpScale), e.normalMap && (t.normalMap.value = e.normalMap, t.normalScale.value.copy(e.normalScale));
            var r;
            if (e.map ? r = e.map : e.specularMap ? r = e.specularMap : e.normalMap ? r = e.normalMap : e.bumpMap ? r = e.bumpMap : e.alphaMap && (r = e.alphaMap), void 0 !== r) {
                var i = r.offset,
                    n = r.repeat;
                t.offsetRepeat.value.set(i.x, i.y, n.x, n.y)
            }
            t.envMap.value = e.envMap, t.flipEnvMap.value = e.envMap instanceof THREE.WebGLRenderTargetCube ? 1 : -1, t.reflectivity.value = e.reflectivity, t.refractionRatio.value = e.refractionRatio
        }

        function V(t, e) {
            t.diffuse.value = e.color, t.opacity.value = e.opacity
        }

        function z(t, e) {
            t.dashSize.value = e.dashSize, t.totalSize.value = e.dashSize + e.gapSize, t.scale.value = e.scale
        }

        function k(t, e) {
            if (t.psColor.value = e.color, t.opacity.value = e.opacity, t.size.value = e.size, t.scale.value = ct.height / 2, t.map.value = e.map, null !== e.map) {
                var r = e.map.offset,
                    i = e.map.repeat;
                t.offsetRepeat.value.set(r.x, r.y, i.x, i.y)
            }
        }

        function N(t, e) {
            t.fogColor.value = e.color, e instanceof THREE.Fog ? (t.fogNear.value = e.near, t.fogFar.value = e.far) : e instanceof THREE.FogExp2 && (t.fogDensity.value = e.density)
        }

        function O(t, e) {
            t.shininess.value = e.shininess, t.emissive.value = e.emissive, t.specular.value = e.specular, e.wrapAround && t.wrapRGB.value.copy(e.wrapRGB)
        }

        function G(t, e) {
            t.emissive.value = e.emissive, e.wrapAround && t.wrapRGB.value.copy(e.wrapRGB)
        }

        function I(t, e) {
            t.ambientLightColor.value = e.ambient, t.directionalLightColor.value = e.directional.colors, t.directionalLightDirection.value = e.directional.positions, t.pointLightColor.value = e.point.colors, t.pointLightPosition.value = e.point.positions, t.pointLightDistance.value = e.point.distances, t.pointLightDecay.value = e.point.decays, t.spotLightColor.value = e.spot.colors, t.spotLightPosition.value = e.spot.positions, t.spotLightDistance.value = e.spot.distances, t.spotLightDirection.value = e.spot.directions, t.spotLightAngleCos.value = e.spot.anglesCos, t.spotLightExponent.value = e.spot.exponents, t.spotLightDecay.value = e.spot.decays, t.hemisphereLightSkyColor.value = e.hemi.skyColors, t.hemisphereLightGroundColor.value = e.hemi.groundColors, t.hemisphereLightDirection.value = e.hemi.positions
        }

        function W(t, e) {
            t.ambientLightColor.needsUpdate = e, t.directionalLightColor.needsUpdate = e, t.directionalLightDirection.needsUpdate = e, t.pointLightColor.needsUpdate = e, t.pointLightPosition.needsUpdate = e, t.pointLightDistance.needsUpdate = e, t.pointLightDecay.needsUpdate = e, t.spotLightColor.needsUpdate = e, t.spotLightPosition.needsUpdate = e, t.spotLightDistance.needsUpdate = e, t.spotLightDirection.needsUpdate = e, t.spotLightAngleCos.needsUpdate = e, t.spotLightExponent.needsUpdate = e, t.spotLightDecay.needsUpdate = e, t.hemisphereLightSkyColor.needsUpdate = e, t.hemisphereLightGroundColor.needsUpdate = e, t.hemisphereLightDirection.needsUpdate = e
        }

        function j(t, e) {
            if (t.shadowMatrix)
                for (var r = 0, i = 0, n = e.length; i < n; i++) {
                    var a = e[i];
                    a.castShadow && (a instanceof THREE.SpotLight || a instanceof THREE.DirectionalLight && !a.shadowCascade) && (t.shadowMap.value[r] = a.shadowMap, t.shadowMapSize.value[r] = a.shadowMapSize, t.shadowMatrix.value[r] = a.shadowMatrix, t.shadowDarkness.value[r] = a.shadowDarkness, t.shadowBias.value[r] = a.shadowBias, r++)
                }
        }

        function X(t, e) {
            Ct.uniformMatrix4fv(t.modelViewMatrix, !1, e._modelViewMatrix.elements), t.normalMatrix && Ct.uniformMatrix3fv(t.normalMatrix, !1, e._normalMatrix.elements)
        }

        function q() {
            var t = zt;
            return t >= ne && THREE.warn("WebGLRenderer: trying to use " + t + " texture units while this GPU supports only " + ne), zt += 1, t
        }

        function Y(t) {
            for (var e, r, i, n = 0, a = t.length; n < a; n++) {
                var o = t[n][0];
                if (o.needsUpdate !== !1) {
                    var s = o.type,
                        h = o.value,
                        l = t[n][1];
                    switch (s) {
                        case "1i":
                            Ct.uniform1i(l, h);
                            break;
                        case "1f":
                            Ct.uniform1f(l, h);
                            break;
                        case "2f":
                            Ct.uniform2f(l, h[0], h[1]);
                            break;
                        case "3f":
                            Ct.uniform3f(l, h[0], h[1], h[2]);
                            break;
                        case "4f":
                            Ct.uniform4f(l, h[0], h[1], h[2], h[3]);
                            break;
                        case "1iv":
                            Ct.uniform1iv(l, h);
                            break;
                        case "3iv":
                            Ct.uniform3iv(l, h);
                            break;
                        case "1fv":
                            Ct.uniform1fv(l, h);
                            break;
                        case "2fv":
                            Ct.uniform2fv(l, h);
                            break;
                        case "3fv":
                            Ct.uniform3fv(l, h);
                            break;
                        case "4fv":
                            Ct.uniform4fv(l, h);
                            break;
                        case "Matrix3fv":
                            Ct.uniformMatrix3fv(l, !1, h);
                            break;
                        case "Matrix4fv":
                            Ct.uniformMatrix4fv(l, !1, h);
                            break;
                        case "i":
                            Ct.uniform1i(l, h);
                            break;
                        case "f":
                            Ct.uniform1f(l, h);
                            break;
                        case "v2":
                            Ct.uniform2f(l, h.x, h.y);
                            break;
                        case "v3":
                            Ct.uniform3f(l, h.x, h.y, h.z);
                            break;
                        case "v4":
                            Ct.uniform4f(l, h.x, h.y, h.z, h.w);
                            break;
                        case "c":
                            Ct.uniform3f(l, h.r, h.g, h.b);
                            break;
                        case "iv1":
                            Ct.uniform1iv(l, h);
                            break;
                        case "iv":
                            Ct.uniform3iv(l, h);
                            break;
                        case "fv1":
                            Ct.uniform1fv(l, h);
                            break;
                        case "fv":
                            Ct.uniform3fv(l, h);
                            break;
                        case "v2v":
                            void 0 === o._array && (o._array = new Float32Array(2 * h.length));
                            for (var c = 0, u = h.length; c < u; c++) i = 2 * c, o._array[i] = h[c].x, o._array[i + 1] = h[c].y;
                            Ct.uniform2fv(l, o._array);
                            break;
                        case "v3v":
                            void 0 === o._array && (o._array = new Float32Array(3 * h.length));
                            for (var c = 0, u = h.length; c < u; c++) i = 3 * c, o._array[i] = h[c].x, o._array[i + 1] = h[c].y, o._array[i + 2] = h[c].z;
                            Ct.uniform3fv(l, o._array);
                            break;
                        case "v4v":
                            void 0 === o._array && (o._array = new Float32Array(4 * h.length));
                            for (var c = 0, u = h.length; c < u; c++) i = 4 * c, o._array[i] = h[c].x, o._array[i + 1] = h[c].y, o._array[i + 2] = h[c].z, o._array[i + 3] = h[c].w;
                            Ct.uniform4fv(l, o._array);
                            break;
                        case "m3":
                            Ct.uniformMatrix3fv(l, !1, h.elements);
                            break;
                        case "m3v":
                            void 0 === o._array && (o._array = new Float32Array(9 * h.length));
                            for (var c = 0, u = h.length; c < u; c++) h[c].flattenToArrayOffset(o._array, 9 * c);
                            Ct.uniformMatrix3fv(l, !1, o._array);
                            break;
                        case "m4":
                            Ct.uniformMatrix4fv(l, !1, h.elements);
                            break;
                        case "m4v":
                            void 0 === o._array && (o._array = new Float32Array(16 * h.length));
                            for (var c = 0, u = h.length; c < u; c++) h[c].flattenToArrayOffset(o._array, 16 * c);
                            Ct.uniformMatrix4fv(l, !1, o._array);
                            break;
                        case "t":
                            if (e = h, r = q(), Ct.uniform1i(l, r), !e) continue;
                            e instanceof THREE.CubeTexture || e.image instanceof Array && 6 === e.image.length ? tt(e, r) : e instanceof THREE.WebGLRenderTargetCube ? et(e, r) : Lt.setTexture(e, r);
                            break;
                        case "tv":
                            void 0 === o._array && (o._array = []);
                            for (var c = 0, u = o.value.length; c < u; c++) o._array[c] = q();
                            Ct.uniform1iv(l, o._array);
                            for (var c = 0, u = o.value.length; c < u; c++) e = o.value[c], r = o._array[c], e && Lt.setTexture(e, r);
                            break;
                        default:
                            THREE.warn("THREE.WebGLRenderer: Unknown uniform type: " + s)
                    }
                }
            }
        }

        function K(t, e) {
            t._modelViewMatrix.multiplyMatrices(e.matrixWorldInverse, t.matrixWorld), t._normalMatrix.getNormalMatrix(t._modelViewMatrix)
        }

        function Q(t, e, r, i) {
            t[e] = r.r * i, t[e + 1] = r.g * i, t[e + 2] = r.b * i
        }

        function Z(t) {
            var e, r, i, n, a, o, s, h, l = 0,
                c = 0,
                u = 0,
                E = Qt,
                f = E.directional.colors,
                p = E.directional.positions,
                d = E.point.colors,
                m = E.point.positions,
                T = E.point.distances,
                g = E.point.decays,
                v = E.spot.colors,
                R = E.spot.positions,
                y = E.spot.distances,
                H = E.spot.directions,
                x = E.spot.anglesCos,
                b = E.spot.exponents,
                _ = E.spot.decays,
                w = E.hemi.skyColors,
                M = E.hemi.groundColors,
                S = E.hemi.positions,
                A = 0,
                C = 0,
                L = 0,
                P = 0,
                F = 0,
                U = 0,
                B = 0,
                D = 0,
                V = 0,
                z = 0,
                k = 0,
                N = 0;
            for (e = 0, r = t.length; e < r; e++)
                if (i = t[e], !i.onlyShadow)
                    if (n = i.color, s = i.intensity, h = i.distance, i instanceof THREE.AmbientLight) {
                        if (!i.visible) continue;
                        l += n.r, c += n.g, u += n.b
                    } else if (i instanceof THREE.DirectionalLight) {
                if (F += 1, !i.visible) continue;
                Yt.setFromMatrixPosition(i.matrixWorld), qt.setFromMatrixPosition(i.target.matrixWorld), Yt.sub(qt), Yt.normalize(), V = 3 * A, p[V] = Yt.x, p[V + 1] = Yt.y, p[V + 2] = Yt.z, Q(f, V, n, s), A += 1
            } else if (i instanceof THREE.PointLight) {
                if (U += 1, !i.visible) continue;
                z = 3 * C, Q(d, z, n, s), qt.setFromMatrixPosition(i.matrixWorld), m[z] = qt.x, m[z + 1] = qt.y, m[z + 2] = qt.z, T[C] = h, g[C] = 0 === i.distance ? 0 : i.decay, C += 1
            } else if (i instanceof THREE.SpotLight) {
                if (B += 1, !i.visible) continue;
                k = 3 * L, Q(v, k, n, s), Yt.setFromMatrixPosition(i.matrixWorld), R[k] = Yt.x, R[k + 1] = Yt.y, R[k + 2] = Yt.z, y[L] = h, qt.setFromMatrixPosition(i.target.matrixWorld), Yt.sub(qt), Yt.normalize(), H[k] = Yt.x, H[k + 1] = Yt.y, H[k + 2] = Yt.z, x[L] = Math.cos(i.angle), b[L] = i.exponent, _[L] = 0 === i.distance ? 0 : i.decay, L += 1
            } else if (i instanceof THREE.HemisphereLight) {
                if (D += 1, !i.visible) continue;
                Yt.setFromMatrixPosition(i.matrixWorld), Yt.normalize(), N = 3 * P, S[N] = Yt.x, S[N + 1] = Yt.y, S[N + 2] = Yt.z, a = i.color, o = i.groundColor, Q(w, N, a, s), Q(M, N, o, s), P += 1
            }
            for (e = 3 * A, r = Math.max(f.length, 3 * F); e < r; e++) f[e] = 0;
            for (e = 3 * C, r = Math.max(d.length, 3 * U); e < r; e++) d[e] = 0;
            for (e = 3 * L, r = Math.max(v.length, 3 * B); e < r; e++) v[e] = 0;
            for (e = 3 * P, r = Math.max(w.length, 3 * D); e < r; e++) w[e] = 0;
            for (e = 3 * P, r = Math.max(M.length, 3 * D); e < r; e++) M[e] = 0;
            E.directional.length = A, E.point.length = C, E.spot.length = L, E.hemi.length = P, E.ambient[0] = l, E.ambient[1] = c, E.ambient[2] = u
        }

        function J(t, e, r) {
            var i;
            r ? (Ct.texParameteri(t, Ct.TEXTURE_WRAP_S, ot(e.wrapS)), Ct.texParameteri(t, Ct.TEXTURE_WRAP_T, ot(e.wrapT)), Ct.texParameteri(t, Ct.TEXTURE_MAG_FILTER, ot(e.magFilter)), Ct.texParameteri(t, Ct.TEXTURE_MIN_FILTER, ot(e.minFilter))) : (Ct.texParameteri(t, Ct.TEXTURE_WRAP_S, Ct.CLAMP_TO_EDGE), Ct.texParameteri(t, Ct.TEXTURE_WRAP_T, Ct.CLAMP_TO_EDGE), e.wrapS === THREE.ClampToEdgeWrapping && e.wrapT === THREE.ClampToEdgeWrapping || THREE.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping. ( " + e.sourceFile + " )"), Ct.texParameteri(t, Ct.TEXTURE_MAG_FILTER, at(e.magFilter)), Ct.texParameteri(t, Ct.TEXTURE_MIN_FILTER, at(e.minFilter)), e.minFilter !== THREE.NearestFilter && e.minFilter !== THREE.LinearFilter && THREE.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter. ( " + e.sourceFile + " )")), i = te.get("EXT_texture_filter_anisotropic"), i && e.type !== THREE.FloatType && e.type !== THREE.HalfFloatType && (e.anisotropy > 1 || e.__currentAnisotropy) && (Ct.texParameterf(t, i.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(e.anisotropy, Lt.getMaxAnisotropy())), e.__currentAnisotropy = e.anisotropy)
        }

        function $(t, e) {
            if (t.width > e || t.height > e) {
                var r = e / Math.max(t.width, t.height),
                    i = document.createElement("canvas");
                i.width = Math.floor(t.width * r), i.height = Math.floor(t.height * r);
                var n = i.getContext("2d");
                return n.drawImage(t, 0, 0, t.width, t.height, 0, 0, i.width, i.height), THREE.warn("THREE.WebGLRenderer: image is too big (" + t.width + "x" + t.height + "). Resized to " + i.width + "x" + i.height, t), i
            }
            return t
        }

        function tt(t, e) {
            if (6 === t.image.length)
                if (t.needsUpdate) {
                    t.image.__webglTextureCube || (t.addEventListener("dispose", He), t.image.__webglTextureCube = Ct.createTexture(), Lt.info.memory.textures++), Ct.activeTexture(Ct.TEXTURE0 + e), Ct.bindTexture(Ct.TEXTURE_CUBE_MAP, t.image.__webglTextureCube), Ct.pixelStorei(Ct.UNPACK_FLIP_Y_WEBGL, t.flipY);
                    for (var r = t instanceof THREE.CompressedTexture, i = t.image[0] instanceof THREE.DataTexture, n = [], a = 0; a < 6; a++) !Lt.autoScaleCubemaps || r || i ? n[a] = i ? t.image[a].image : t.image[a] : n[a] = $(t.image[a], se);
                    var o = n[0],
                        s = THREE.Math.isPowerOfTwo(o.width) && THREE.Math.isPowerOfTwo(o.height),
                        h = ot(t.format),
                        l = ot(t.type);
                    J(Ct.TEXTURE_CUBE_MAP, t, s);
                    for (var a = 0; a < 6; a++)
                        if (r)
                            for (var c, u = n[a].mipmaps, E = 0, f = u.length; E < f; E++) c = u[E], t.format !== THREE.RGBAFormat && t.format !== THREE.RGBFormat ? pe().indexOf(h) > -1 ? Ct.compressedTexImage2D(Ct.TEXTURE_CUBE_MAP_POSITIVE_X + a, E, h, c.width, c.height, 0, c.data) : THREE.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()") : Ct.texImage2D(Ct.TEXTURE_CUBE_MAP_POSITIVE_X + a, E, h, c.width, c.height, 0, h, l, c.data);
                        else i ? Ct.texImage2D(Ct.TEXTURE_CUBE_MAP_POSITIVE_X + a, 0, h, n[a].width, n[a].height, 0, h, l, n[a].data) : Ct.texImage2D(Ct.TEXTURE_CUBE_MAP_POSITIVE_X + a, 0, h, h, l, n[a]);
                    t.generateMipmaps && s && Ct.generateMipmap(Ct.TEXTURE_CUBE_MAP), t.needsUpdate = !1, t.onUpdate && t.onUpdate()
                } else Ct.activeTexture(Ct.TEXTURE0 + e), Ct.bindTexture(Ct.TEXTURE_CUBE_MAP, t.image.__webglTextureCube)
        }

        function et(t, e) {
            Ct.activeTexture(Ct.TEXTURE0 + e), Ct.bindTexture(Ct.TEXTURE_CUBE_MAP, t.__webglTexture)
        }

        function rt(t, e, r) {
            Ct.bindFramebuffer(Ct.FRAMEBUFFER, t), Ct.framebufferTexture2D(Ct.FRAMEBUFFER, Ct.COLOR_ATTACHMENT0, r, e.__webglTexture, 0)
        }

        function it(t, e) {
            Ct.bindRenderbuffer(Ct.RENDERBUFFER, t), e.depthBuffer && !e.stencilBuffer ? (Ct.renderbufferStorage(Ct.RENDERBUFFER, Ct.DEPTH_COMPONENT16, e.width, e.height), Ct.framebufferRenderbuffer(Ct.FRAMEBUFFER, Ct.DEPTH_ATTACHMENT, Ct.RENDERBUFFER, t)) : e.depthBuffer && e.stencilBuffer ? (Ct.renderbufferStorage(Ct.RENDERBUFFER, Ct.DEPTH_STENCIL, e.width, e.height), Ct.framebufferRenderbuffer(Ct.FRAMEBUFFER, Ct.DEPTH_STENCIL_ATTACHMENT, Ct.RENDERBUFFER, t)) : Ct.renderbufferStorage(Ct.RENDERBUFFER, Ct.RGBA4, e.width, e.height)
        }

        function nt(t) {
            t instanceof THREE.WebGLRenderTargetCube ? (Ct.bindTexture(Ct.TEXTURE_CUBE_MAP, t.__webglTexture), Ct.generateMipmap(Ct.TEXTURE_CUBE_MAP), Ct.bindTexture(Ct.TEXTURE_CUBE_MAP, null)) : (Ct.bindTexture(Ct.TEXTURE_2D, t.__webglTexture), Ct.generateMipmap(Ct.TEXTURE_2D), Ct.bindTexture(Ct.TEXTURE_2D, null))
        }

        function at(t) {
            return t === THREE.NearestFilter || t === THREE.NearestMipMapNearestFilter || t === THREE.NearestMipMapLinearFilter ? Ct.NEAREST : Ct.LINEAR
        }

        function ot(t) {
            var e;
            if (t === THREE.RepeatWrapping) return Ct.REPEAT;
            if (t === THREE.ClampToEdgeWrapping) return Ct.CLAMP_TO_EDGE;
            if (t === THREE.MirroredRepeatWrapping) return Ct.MIRRORED_REPEAT;
            if (t === THREE.NearestFilter) return Ct.NEAREST;
            if (t === THREE.NearestMipMapNearestFilter) return Ct.NEAREST_MIPMAP_NEAREST;
            if (t === THREE.NearestMipMapLinearFilter) return Ct.NEAREST_MIPMAP_LINEAR;
            if (t === THREE.LinearFilter) return Ct.LINEAR;
            if (t === THREE.LinearMipMapNearestFilter) return Ct.LINEAR_MIPMAP_NEAREST;
            if (t === THREE.LinearMipMapLinearFilter) return Ct.LINEAR_MIPMAP_LINEAR;
            if (t === THREE.UnsignedByteType) return Ct.UNSIGNED_BYTE;
            if (t === THREE.UnsignedShort4444Type) return Ct.UNSIGNED_SHORT_4_4_4_4;
            if (t === THREE.UnsignedShort5551Type) return Ct.UNSIGNED_SHORT_5_5_5_1;
            if (t === THREE.UnsignedShort565Type) return Ct.UNSIGNED_SHORT_5_6_5;
            if (t === THREE.ByteType) return Ct.BYTE;
            if (t === THREE.ShortType) return Ct.SHORT;
            if (t === THREE.UnsignedShortType) return Ct.UNSIGNED_SHORT;
            if (t === THREE.IntType) return Ct.INT;
            if (t === THREE.UnsignedIntType) return Ct.UNSIGNED_INT;
            if (t === THREE.FloatType) return Ct.FLOAT;
            if (e = te.get("OES_texture_half_float"), null !== e && t === THREE.HalfFloatType) return e.HALF_FLOAT_OES;
            if (t === THREE.AlphaFormat) return Ct.ALPHA;
            if (t === THREE.RGBFormat) return Ct.RGB;
            if (t === THREE.RGBAFormat) return Ct.RGBA;
            if (t === THREE.LuminanceFormat) return Ct.LUMINANCE;
            if (t === THREE.LuminanceAlphaFormat) return Ct.LUMINANCE_ALPHA;
            if (t === THREE.AddEquation) return Ct.FUNC_ADD;
            if (t === THREE.SubtractEquation) return Ct.FUNC_SUBTRACT;
            if (t === THREE.ReverseSubtractEquation) return Ct.FUNC_REVERSE_SUBTRACT;
            if (t === THREE.ZeroFactor) return Ct.ZERO;
            if (t === THREE.OneFactor) return Ct.ONE;
            if (t === THREE.SrcColorFactor) return Ct.SRC_COLOR;
            if (t === THREE.OneMinusSrcColorFactor) return Ct.ONE_MINUS_SRC_COLOR;
            if (t === THREE.SrcAlphaFactor) return Ct.SRC_ALPHA;
            if (t === THREE.OneMinusSrcAlphaFactor) return Ct.ONE_MINUS_SRC_ALPHA;
            if (t === THREE.DstAlphaFactor) return Ct.DST_ALPHA;
            if (t === THREE.OneMinusDstAlphaFactor) return Ct.ONE_MINUS_DST_ALPHA;
            if (t === THREE.DstColorFactor) return Ct.DST_COLOR;
            if (t === THREE.OneMinusDstColorFactor) return Ct.ONE_MINUS_DST_COLOR;
            if (t === THREE.SrcAlphaSaturateFactor) return Ct.SRC_ALPHA_SATURATE;
            if (e = te.get("WEBGL_compressed_texture_s3tc"), null !== e) {
                if (t === THREE.RGB_S3TC_DXT1_Format) return e.COMPRESSED_RGB_S3TC_DXT1_EXT;
                if (t === THREE.RGBA_S3TC_DXT1_Format) return e.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                if (t === THREE.RGBA_S3TC_DXT3_Format) return e.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                if (t === THREE.RGBA_S3TC_DXT5_Format) return e.COMPRESSED_RGBA_S3TC_DXT5_EXT
            }
            if (e = te.get("WEBGL_compressed_texture_pvrtc"), null !== e) {
                if (t === THREE.RGB_PVRTC_4BPPV1_Format) return e.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                if (t === THREE.RGB_PVRTC_2BPPV1_Format) return e.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                if (t === THREE.RGBA_PVRTC_4BPPV1_Format) return e.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                if (t === THREE.RGBA_PVRTC_2BPPV1_Format) return e.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
            }
            if (e = te.get("EXT_blend_minmax"), null !== e) {
                if (t === THREE.MinEquation) return e.MIN_EXT;
                if (t === THREE.MaxEquation) return e.MAX_EXT
            }
            return 0
        }

        function st(t) {
            if (le && t && t.skeleton && t.skeleton.useVertexTexture) return 1024;
            var e = Ct.getParameter(Ct.MAX_VERTEX_UNIFORM_VECTORS),
                r = Math.floor((e - 20) / 4),
                i = r;
            return void 0 !== t && t instanceof THREE.SkinnedMesh && (i = Math.min(t.skeleton.bones.length, i), i < t.skeleton.bones.length && THREE.warn("WebGLRenderer: too many bones - " + t.skeleton.bones.length + ", this GPU supports just " + i + " (try OpenGL instead of ANGLE)")), i
        }

        function ht(t) {
            for (var e = 0, r = 0, i = 0, n = 0, a = 0, o = t.length; a < o; a++) {
                var s = t[a];
                s.onlyShadow || s.visible === !1 || (s instanceof THREE.DirectionalLight && e++, s instanceof THREE.PointLight && r++, s instanceof THREE.SpotLight && i++, s instanceof THREE.HemisphereLight && n++)
            }
            return {
                directional: e,
                point: r,
                spot: i,
                hemi: n
            }
        }

        function lt(t) {
            for (var e = 0, r = 0, i = t.length; r < i; r++) {
                var n = t[r];
                n.castShadow && (n instanceof THREE.SpotLight && e++, n instanceof THREE.DirectionalLight && !n.shadowCascade && e++)
            }
            return e
        }
        console.log("THREE.WebGLRenderer", THREE.REVISION), t = t || {};
        var ct = void 0 !== t.canvas ? t.canvas : document.createElement("canvas"),
            ut = void 0 !== t.context ? t.context : null,
            Et = 1,
            ft = void 0 !== t.precision ? t.precision : "highp",
            pt = void 0 !== t.alpha && t.alpha,
            dt = void 0 === t.depth || t.depth,
            mt = void 0 === t.stencil || t.stencil,
            Tt = void 0 !== t.antialias && t.antialias,
            gt = void 0 === t.premultipliedAlpha || t.premultipliedAlpha,
            vt = void 0 !== t.preserveDrawingBuffer && t.preserveDrawingBuffer,
            Rt = void 0 !== t.logarithmicDepthBuffer && t.logarithmicDepthBuffer,
            yt = new THREE.Color(0),
            Ht = 0,
            xt = [],
            bt = {},
            _t = [],
            wt = [],
            Mt = [],
            St = [],
            At = [];
        this.domElement = ct, this.context = null, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.gammaFactor = 2, this.gammaInput = !1, this.gammaOutput = !1, this.shadowMapEnabled = !1, this.shadowMapType = THREE.PCFShadowMap, this.shadowMapCullFace = THREE.CullFaceFront, this.shadowMapDebug = !1, this.shadowMapCascade = !1, this.maxMorphTargets = 8, this.maxMorphNormals = 4, this.autoScaleCubemaps = !0, this.info = {
            memory: {
                programs: 0,
                geometries: 0,
                textures: 0
            },
            render: {
                calls: 0,
                vertices: 0,
                faces: 0,
                points: 0
            }
        };
        var Ct, Lt = this,
            Pt = [],
            Ft = null,
            Ut = null,
            Bt = -1,
            Dt = "",
            Vt = null,
            zt = 0,
            kt = 0,
            Nt = 0,
            Ot = ct.width,
            Gt = ct.height,
            It = 0,
            Wt = 0,
            jt = new THREE.Frustum,
            Xt = new THREE.Matrix4,
            qt = new THREE.Vector3,
            Yt = new THREE.Vector3,
            Kt = !0,
            Qt = {
                ambient: [0, 0, 0],
                directional: {
                    length: 0,
                    colors: [],
                    positions: []
                },
                point: {
                    length: 0,
                    colors: [],
                    positions: [],
                    distances: [],
                    decays: []
                },
                spot: {
                    length: 0,
                    colors: [],
                    positions: [],
                    distances: [],
                    directions: [],
                    anglesCos: [],
                    exponents: [],
                    decays: []
                },
                hemi: {
                    length: 0,
                    skyColors: [],
                    groundColors: [],
                    positions: []
                }
            };
        try {
            var Zt = {
                alpha: pt,
                depth: dt,
                stencil: mt,
                antialias: Tt,
                premultipliedAlpha: gt,
                preserveDrawingBuffer: vt
            };
            if (Ct = ut || ct.getContext("webgl", Zt) || ct.getContext("experimental-webgl", Zt), null === Ct) throw null !== ct.getContext("webgl") ? "Error creating WebGL context with your selected attributes." : "Error creating WebGL context.";
            ct.addEventListener("webglcontextlost", function(t) {
                t.preventDefault(), ie(), re(), bt = {}
            }, !1)
        } catch (Jt) {
            THREE.error("THREE.WebGLRenderer: " + Jt)
        }
        var $t = new THREE.WebGLState(Ct, ot);
        void 0 === Ct.getShaderPrecisionFormat && (Ct.getShaderPrecisionFormat = function() {
            return {
                rangeMin: 1,
                rangeMax: 1,
                precision: 1
            }
        });
        var te = new THREE.WebGLExtensions(Ct);
        te.get("OES_texture_float"), te.get("OES_texture_float_linear"), te.get("OES_texture_half_float"), te.get("OES_texture_half_float_linear"), te.get("OES_standard_derivatives"), Rt && te.get("EXT_frag_depth");
        var ee = function(t, e, r, i) {
                gt === !0 && (t *= i, e *= i, r *= i), Ct.clearColor(t, e, r, i)
            },
            re = function() {
                Ct.clearColor(0, 0, 0, 1), Ct.clearDepth(1), Ct.clearStencil(0), Ct.enable(Ct.DEPTH_TEST), Ct.depthFunc(Ct.LEQUAL), Ct.frontFace(Ct.CCW), Ct.cullFace(Ct.BACK), Ct.enable(Ct.CULL_FACE), Ct.enable(Ct.BLEND), Ct.blendEquation(Ct.FUNC_ADD), Ct.blendFunc(Ct.SRC_ALPHA, Ct.ONE_MINUS_SRC_ALPHA), Ct.viewport(kt, Nt, Ot, Gt), ee(yt.r, yt.g, yt.b, Ht)
            },
            ie = function() {
                Ft = null, Vt = null, Dt = "", Bt = -1, Kt = !0, $t.reset()
            };
        re(), this.context = Ct, this.state = $t;
        var ne = Ct.getParameter(Ct.MAX_TEXTURE_IMAGE_UNITS),
            ae = Ct.getParameter(Ct.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            oe = Ct.getParameter(Ct.MAX_TEXTURE_SIZE),
            se = Ct.getParameter(Ct.MAX_CUBE_MAP_TEXTURE_SIZE),
            he = ae > 0,
            le = he && te.get("OES_texture_float"),
            ce = Ct.getShaderPrecisionFormat(Ct.VERTEX_SHADER, Ct.HIGH_FLOAT),
            ue = Ct.getShaderPrecisionFormat(Ct.VERTEX_SHADER, Ct.MEDIUM_FLOAT),
            Ee = Ct.getShaderPrecisionFormat(Ct.FRAGMENT_SHADER, Ct.HIGH_FLOAT),
            fe = Ct.getShaderPrecisionFormat(Ct.FRAGMENT_SHADER, Ct.MEDIUM_FLOAT),
            pe = function() {
                var t;
                return function() {
                    if (void 0 !== t) return t;
                    if (t = [], te.get("WEBGL_compressed_texture_pvrtc") || te.get("WEBGL_compressed_texture_s3tc"))
                        for (var e = Ct.getParameter(Ct.COMPRESSED_TEXTURE_FORMATS), r = 0; r < e.length; r++) t.push(e[r]);
                    return t
                }
            }(),
            de = ce.precision > 0 && Ee.precision > 0,
            me = ue.precision > 0 && fe.precision > 0;
        "highp" !== ft || de || (me ? (ft = "mediump", THREE.warn("THREE.WebGLRenderer: highp not supported, using mediump.")) : (ft = "lowp", THREE.warn("THREE.WebGLRenderer: highp and mediump not supported, using lowp."))), "mediump" !== ft || me || (ft = "lowp", THREE.warn("THREE.WebGLRenderer: mediump not supported, using lowp."));
        var Te = new THREE.ShadowMapPlugin(this, xt, bt, _t),
            ge = new THREE.SpritePlugin(this, St),
            ve = new THREE.LensFlarePlugin(this, At);
        this.getContext = function() {
            return Ct
        }, this.forceContextLoss = function() {
            te.get("WEBGL_lose_context").loseContext()
        }, this.supportsVertexTextures = function() {
            return he
        }, this.supportsFloatTextures = function() {
            return te.get("OES_texture_float")
        }, this.supportsHalfFloatTextures = function() {
            return te.get("OES_texture_half_float")
        }, this.supportsStandardDerivatives = function() {
            return te.get("OES_standard_derivatives")
        }, this.supportsCompressedTextureS3TC = function() {
            return te.get("WEBGL_compressed_texture_s3tc")
        }, this.supportsCompressedTexturePVRTC = function() {
            return te.get("WEBGL_compressed_texture_pvrtc")
        }, this.supportsBlendMinMax = function() {
            return te.get("EXT_blend_minmax")
        }, this.getMaxAnisotropy = function() {
            var t;
            return function() {
                if (void 0 !== t) return t;
                var e = te.get("EXT_texture_filter_anisotropic");
                return t = null !== e ? Ct.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0
            }
        }(), this.getPrecision = function() {
            return ft
        }, this.getPixelRatio = function() {
            return Et
        }, this.setPixelRatio = function(t) {
            Et = t
        }, this.setSize = function(t, e, r) {
            ct.width = t * Et, ct.height = e * Et, r !== !1 && (ct.style.width = t + "px", ct.style.height = e + "px"), this.setViewport(0, 0, t, e)
        }, this.setViewport = function(t, e, r, i) {
            kt = t * Et, Nt = e * Et, Ot = r * Et, Gt = i * Et, Ct.viewport(kt, Nt, Ot, Gt)
        }, this.setScissor = function(t, e, r, i) {
            Ct.scissor(t * Et, e * Et, r * Et, i * Et)
        }, this.enableScissorTest = function(t) {
            t ? Ct.enable(Ct.SCISSOR_TEST) : Ct.disable(Ct.SCISSOR_TEST)
        }, this.getClearColor = function() {
            return yt
        }, this.setClearColor = function(t, e) {
            yt.set(t), Ht = void 0 !== e ? e : 1, ee(yt.r, yt.g, yt.b, Ht)
        }, this.getClearAlpha = function() {
            return Ht
        }, this.setClearAlpha = function(t) {
            Ht = t, ee(yt.r, yt.g, yt.b, Ht)
        }, this.clear = function(t, e, r) {
            var i = 0;
            (void 0 === t || t) && (i |= Ct.COLOR_BUFFER_BIT), (void 0 === e || e) && (i |= Ct.DEPTH_BUFFER_BIT), (void 0 === r || r) && (i |= Ct.STENCIL_BUFFER_BIT), Ct.clear(i)
        }, this.clearColor = function() {
            Ct.clear(Ct.COLOR_BUFFER_BIT)
        }, this.clearDepth = function() {
            Ct.clear(Ct.DEPTH_BUFFER_BIT)
        }, this.clearStencil = function() {
            Ct.clear(Ct.STENCIL_BUFFER_BIT)
        }, this.clearTarget = function(t, e, r, i) {
            this.setRenderTarget(t), this.clear(e, r, i)
        }, this.resetGLState = ie;
        var Re = function(t) {
                var e = t.target;
                e.traverse(function(t) {
                    t.removeEventListener("remove", Re), L(t)
                })
            },
            ye = function(t) {
                var e = t.target;
                e.removeEventListener("dispose", ye), we(e)
            },
            He = function(t) {
                var e = t.target;
                e.removeEventListener("dispose", He), Me(e), Lt.info.memory.textures--
            },
            xe = function(t) {
                var e = t.target;
                e.removeEventListener("dispose", xe), Se(e), Lt.info.memory.textures--
            },
            be = function(t) {
                var e = t.target;
                e.removeEventListener("dispose", be), Ae(e)
            },
            _e = function(t) {
                for (var e = ["__webglVertexBuffer", "__webglNormalBuffer", "__webglTangentBuffer", "__webglColorBuffer", "__webglUVBuffer", "__webglUV2Buffer", "__webglSkinIndicesBuffer", "__webglSkinWeightsBuffer", "__webglFaceBuffer", "__webglLineBuffer", "__webglLineDistanceBuffer"], r = 0, i = e.length; r < i; r++) {
                    var n = e[r];
                    void 0 !== t[n] && (Ct.deleteBuffer(t[n]), delete t[n])
                }
                if (void 0 !== t.__webglCustomAttributesList) {
                    for (var n in t.__webglCustomAttributesList) Ct.deleteBuffer(t.__webglCustomAttributesList[n].buffer);
                    delete t.__webglCustomAttributesList
                }
                Lt.info.memory.geometries--
            },
            we = function(t) {
                if (delete t.__webglInit, t instanceof THREE.BufferGeometry) {
                    for (var e in t.attributes) {
                        var r = t.attributes[e];
                        void 0 !== r.buffer && (Ct.deleteBuffer(r.buffer), delete r.buffer)
                    }
                    Lt.info.memory.geometries--
                } else {
                    var i = Ce[t.id];
                    if (void 0 !== i) {
                        for (var n = 0, a = i.length; n < a; n++) {
                            var o = i[n];
                            if (void 0 !== o.numMorphTargets) {
                                for (var s = 0, h = o.numMorphTargets; s < h; s++) Ct.deleteBuffer(o.__webglMorphTargetsBuffers[s]);
                                delete o.__webglMorphTargetsBuffers
                            }
                            if (void 0 !== o.numMorphNormals) {
                                for (var s = 0, h = o.numMorphNormals; s < h; s++) Ct.deleteBuffer(o.__webglMorphNormalsBuffers[s]);
                                delete o.__webglMorphNormalsBuffers
                            }
                            _e(o)
                        }
                        delete Ce[t.id]
                    } else _e(t)
                }
                Dt = ""
            },
            Me = function(t) {
                if (t.image && t.image.__webglTextureCube) Ct.deleteTexture(t.image.__webglTextureCube), delete t.image.__webglTextureCube;
                else {
                    if (void 0 === t.__webglInit) return;
                    Ct.deleteTexture(t.__webglTexture), delete t.__webglTexture, delete t.__webglInit
                }
            },
            Se = function(t) {
                if (t && void 0 !== t.__webglTexture) {
                    if (Ct.deleteTexture(t.__webglTexture), delete t.__webglTexture, t instanceof THREE.WebGLRenderTargetCube)
                        for (var e = 0; e < 6; e++) Ct.deleteFramebuffer(t.__webglFramebuffer[e]), Ct.deleteRenderbuffer(t.__webglRenderbuffer[e]);
                    else Ct.deleteFramebuffer(t.__webglFramebuffer), Ct.deleteRenderbuffer(t.__webglRenderbuffer);
                    delete t.__webglFramebuffer, delete t.__webglRenderbuffer
                }
            },
            Ae = function(t) {
                var e = t.program.program;
                if (void 0 !== e) {
                    t.program = void 0;
                    var r, i, n, a = !1;
                    for (r = 0, i = Pt.length; r < i; r++)
                        if (n = Pt[r], n.program === e) {
                            n.usedTimes--, 0 === n.usedTimes && (a = !0);
                            break
                        }
                    if (a === !0) {
                        var o = [];
                        for (r = 0, i = Pt.length; r < i; r++) n = Pt[r], n.program !== e && o.push(n);
                        Pt = o, Ct.deleteProgram(e), Lt.info.memory.programs--
                    }
                }
            };
        this.renderBufferImmediate = function(t, e, r) {
            if ($t.initAttributes(), t.hasPositions && !t.__webglVertexBuffer && (t.__webglVertexBuffer = Ct.createBuffer()), t.hasNormals && !t.__webglNormalBuffer && (t.__webglNormalBuffer = Ct.createBuffer()), t.hasUvs && !t.__webglUvBuffer && (t.__webglUvBuffer = Ct.createBuffer()), t.hasColors && !t.__webglColorBuffer && (t.__webglColorBuffer = Ct.createBuffer()), t.hasPositions && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglVertexBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, t.positionArray, Ct.DYNAMIC_DRAW), $t.enableAttribute(e.attributes.position), Ct.vertexAttribPointer(e.attributes.position, 3, Ct.FLOAT, !1, 0, 0)), t.hasNormals) {
                if (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglNormalBuffer), r instanceof THREE.MeshPhongMaterial == !1 && r.shading === THREE.FlatShading) {
                    var i, n, a, o, s, h, l, c, u, E, f, p, d, m, T = 3 * t.count;
                    for (m = 0; m < T; m += 9) d = t.normalArray, o = d[m], l = d[m + 1], E = d[m + 2], s = d[m + 3], c = d[m + 4], f = d[m + 5], h = d[m + 6], u = d[m + 7], p = d[m + 8], i = (o + s + h) / 3, n = (l + c + u) / 3, a = (E + f + p) / 3, d[m] = i, d[m + 1] = n, d[m + 2] = a, d[m + 3] = i, d[m + 4] = n, d[m + 5] = a, d[m + 6] = i, d[m + 7] = n, d[m + 8] = a
                }
                Ct.bufferData(Ct.ARRAY_BUFFER, t.normalArray, Ct.DYNAMIC_DRAW), $t.enableAttribute(e.attributes.normal), Ct.vertexAttribPointer(e.attributes.normal, 3, Ct.FLOAT, !1, 0, 0)
            }
            t.hasUvs && r.map && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglUvBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, t.uvArray, Ct.DYNAMIC_DRAW),
                $t.enableAttribute(e.attributes.uv), Ct.vertexAttribPointer(e.attributes.uv, 2, Ct.FLOAT, !1, 0, 0)), t.hasColors && r.vertexColors !== THREE.NoColors && (Ct.bindBuffer(Ct.ARRAY_BUFFER, t.__webglColorBuffer), Ct.bufferData(Ct.ARRAY_BUFFER, t.colorArray, Ct.DYNAMIC_DRAW), $t.enableAttribute(e.attributes.color), Ct.vertexAttribPointer(e.attributes.color, 3, Ct.FLOAT, !1, 0, 0)), $t.disableUnusedAttributes(), Ct.drawArrays(Ct.TRIANGLES, 0, t.count), t.count = 0
        }, this.renderBufferDirect = function(t, e, r, i, n, a) {
            if (i.visible !== !1) {
                S(a);
                var o = B(t, e, r, i, a),
                    s = !1,
                    h = i.wireframe ? 1 : 0,
                    l = "direct_" + n.id + "_" + o.id + "_" + h;
                if (l !== Dt && (Dt = l, s = !0), s && $t.initAttributes(), a instanceof THREE.Mesh) {
                    var c = i.wireframe === !0 ? Ct.LINES : Ct.TRIANGLES,
                        u = n.attributes.index;
                    if (u) {
                        var E, p;
                        u.array instanceof Uint32Array && te.get("OES_element_index_uint") ? (E = Ct.UNSIGNED_INT, p = 4) : (E = Ct.UNSIGNED_SHORT, p = 2);
                        var d = n.offsets;
                        if (0 === d.length) s && (f(i, o, n, 0), Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, u.buffer)), Ct.drawElements(c, u.array.length, E, 0), Lt.info.render.calls++, Lt.info.render.vertices += u.array.length, Lt.info.render.faces += u.array.length / 3;
                        else {
                            s = !0;
                            for (var m = 0, T = d.length; m < T; m++) {
                                var g = d[m].index;
                                s && (f(i, o, n, g), Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, u.buffer)), Ct.drawElements(c, d[m].count, E, d[m].start * p), Lt.info.render.calls++, Lt.info.render.vertices += d[m].count, Lt.info.render.faces += d[m].count / 3
                            }
                        }
                    } else {
                        s && f(i, o, n, 0);
                        var v = n.attributes.position;
                        Ct.drawArrays(c, 0, v.array.length / v.itemSize), Lt.info.render.calls++, Lt.info.render.vertices += v.array.length / v.itemSize, Lt.info.render.faces += v.array.length / (3 * v.itemSize)
                    }
                } else if (a instanceof THREE.PointCloud) {
                    var c = Ct.POINTS,
                        u = n.attributes.index;
                    if (u) {
                        var E, p;
                        u.array instanceof Uint32Array && te.get("OES_element_index_uint") ? (E = Ct.UNSIGNED_INT, p = 4) : (E = Ct.UNSIGNED_SHORT, p = 2);
                        var d = n.offsets;
                        if (0 === d.length) s && (f(i, o, n, 0), Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, u.buffer)), Ct.drawElements(c, u.array.length, E, 0), Lt.info.render.calls++, Lt.info.render.points += u.array.length;
                        else {
                            d.length > 1 && (s = !0);
                            for (var m = 0, T = d.length; m < T; m++) {
                                var g = d[m].index;
                                s && (f(i, o, n, g), Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, u.buffer)), Ct.drawElements(c, d[m].count, E, d[m].start * p), Lt.info.render.calls++, Lt.info.render.points += d[m].count
                            }
                        }
                    } else {
                        s && f(i, o, n, 0);
                        var v = n.attributes.position,
                            d = n.offsets;
                        if (0 === d.length) Ct.drawArrays(c, 0, v.array.length / 3), Lt.info.render.calls++, Lt.info.render.points += v.array.length / 3;
                        else
                            for (var m = 0, T = d.length; m < T; m++) Ct.drawArrays(c, d[m].index, d[m].count), Lt.info.render.calls++, Lt.info.render.points += d[m].count
                    }
                } else if (a instanceof THREE.Line) {
                    var c = a.mode === THREE.LineStrip ? Ct.LINE_STRIP : Ct.LINES;
                    $t.setLineWidth(i.linewidth * Et);
                    var u = n.attributes.index;
                    if (u) {
                        var E, p;
                        u.array instanceof Uint32Array ? (E = Ct.UNSIGNED_INT, p = 4) : (E = Ct.UNSIGNED_SHORT, p = 2);
                        var d = n.offsets;
                        if (0 === d.length) s && (f(i, o, n, 0), Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, u.buffer)), Ct.drawElements(c, u.array.length, E, 0), Lt.info.render.calls++, Lt.info.render.vertices += u.array.length;
                        else {
                            d.length > 1 && (s = !0);
                            for (var m = 0, T = d.length; m < T; m++) {
                                var g = d[m].index;
                                s && (f(i, o, n, g), Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, u.buffer)), Ct.drawElements(c, d[m].count, E, d[m].start * p), Lt.info.render.calls++, Lt.info.render.vertices += d[m].count
                            }
                        }
                    } else {
                        s && f(i, o, n, 0);
                        var v = n.attributes.position,
                            d = n.offsets;
                        if (0 === d.length) Ct.drawArrays(c, 0, v.array.length / 3), Lt.info.render.calls++, Lt.info.render.vertices += v.array.length / 3;
                        else
                            for (var m = 0, T = d.length; m < T; m++) Ct.drawArrays(c, d[m].index, d[m].count), Lt.info.render.calls++, Lt.info.render.vertices += d[m].count
                    }
                }
            }
        }, this.renderBuffer = function(t, e, r, i, n, a) {
            if (i.visible !== !1) {
                S(a);
                var o = B(t, e, r, i, a),
                    s = o.attributes,
                    h = !1,
                    l = i.wireframe ? 1 : 0,
                    c = n.id + "_" + o.id + "_" + l;
                if (c !== Dt && (Dt = c, h = !0), h && $t.initAttributes(), !i.morphTargets && s.position >= 0 ? h && (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglVertexBuffer), $t.enableAttribute(s.position), Ct.vertexAttribPointer(s.position, 3, Ct.FLOAT, !1, 0, 0)) : a.morphTargetBase && p(i, n, a), h) {
                    if (n.__webglCustomAttributesList)
                        for (var u = 0, E = n.__webglCustomAttributesList.length; u < E; u++) {
                            var f = n.__webglCustomAttributesList[u];
                            s[f.buffer.belongsToAttribute] >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, f.buffer), $t.enableAttribute(s[f.buffer.belongsToAttribute]), Ct.vertexAttribPointer(s[f.buffer.belongsToAttribute], f.size, Ct.FLOAT, !1, 0, 0))
                        }
                    s.color >= 0 && (a.geometry.colors.length > 0 || a.geometry.faces.length > 0 ? (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglColorBuffer), $t.enableAttribute(s.color), Ct.vertexAttribPointer(s.color, 3, Ct.FLOAT, !1, 0, 0)) : void 0 !== i.defaultAttributeValues && Ct.vertexAttrib3fv(s.color, i.defaultAttributeValues.color)), s.normal >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglNormalBuffer), $t.enableAttribute(s.normal), Ct.vertexAttribPointer(s.normal, 3, Ct.FLOAT, !1, 0, 0)), s.tangent >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglTangentBuffer), $t.enableAttribute(s.tangent), Ct.vertexAttribPointer(s.tangent, 4, Ct.FLOAT, !1, 0, 0)), s.uv >= 0 && (a.geometry.faceVertexUvs[0] ? (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglUVBuffer), $t.enableAttribute(s.uv), Ct.vertexAttribPointer(s.uv, 2, Ct.FLOAT, !1, 0, 0)) : void 0 !== i.defaultAttributeValues && Ct.vertexAttrib2fv(s.uv, i.defaultAttributeValues.uv)), s.uv2 >= 0 && (a.geometry.faceVertexUvs[1] ? (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglUV2Buffer), $t.enableAttribute(s.uv2), Ct.vertexAttribPointer(s.uv2, 2, Ct.FLOAT, !1, 0, 0)) : void 0 !== i.defaultAttributeValues && Ct.vertexAttrib2fv(s.uv2, i.defaultAttributeValues.uv2)), i.skinning && s.skinIndex >= 0 && s.skinWeight >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglSkinIndicesBuffer), $t.enableAttribute(s.skinIndex), Ct.vertexAttribPointer(s.skinIndex, 4, Ct.FLOAT, !1, 0, 0), Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglSkinWeightsBuffer), $t.enableAttribute(s.skinWeight), Ct.vertexAttribPointer(s.skinWeight, 4, Ct.FLOAT, !1, 0, 0)), s.lineDistance >= 0 && (Ct.bindBuffer(Ct.ARRAY_BUFFER, n.__webglLineDistanceBuffer), $t.enableAttribute(s.lineDistance), Ct.vertexAttribPointer(s.lineDistance, 1, Ct.FLOAT, !1, 0, 0))
                }
                if ($t.disableUnusedAttributes(), a instanceof THREE.Mesh) {
                    var d = n.__typeArray === Uint32Array ? Ct.UNSIGNED_INT : Ct.UNSIGNED_SHORT;
                    i.wireframe ? ($t.setLineWidth(i.wireframeLinewidth * Et), h && Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, n.__webglLineBuffer), Ct.drawElements(Ct.LINES, n.__webglLineCount, d, 0)) : (h && Ct.bindBuffer(Ct.ELEMENT_ARRAY_BUFFER, n.__webglFaceBuffer), Ct.drawElements(Ct.TRIANGLES, n.__webglFaceCount, d, 0)), Lt.info.render.calls++, Lt.info.render.vertices += n.__webglFaceCount, Lt.info.render.faces += n.__webglFaceCount / 3
                } else if (a instanceof THREE.Line) {
                    var m = a.mode === THREE.LineStrip ? Ct.LINE_STRIP : Ct.LINES;
                    $t.setLineWidth(i.linewidth * Et), Ct.drawArrays(m, 0, n.__webglLineCount), Lt.info.render.calls++
                } else a instanceof THREE.PointCloud && (Ct.drawArrays(Ct.POINTS, 0, n.__webglParticleCount), Lt.info.render.calls++, Lt.info.render.points += n.__webglParticleCount)
            }
        }, this.render = function(t, e, r, i) {
            if (e instanceof THREE.Camera == !1) return void THREE.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
            var n = t.fog;
            Dt = "", Bt = -1, Vt = null, Kt = !0, t.autoUpdate === !0 && t.updateMatrixWorld(), void 0 === e.parent && e.updateMatrixWorld(), t.traverse(function(t) {
                t instanceof THREE.SkinnedMesh && t.skeleton.update()
            }), e.matrixWorldInverse.getInverse(e.matrixWorld), Xt.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), jt.setFromMatrix(Xt), xt.length = 0, wt.length = 0, Mt.length = 0, St.length = 0, At.length = 0, g(t), Lt.sortObjects === !0 && (wt.sort(d), Mt.sort(m)), Te.render(t, e), Lt.info.render.calls = 0, Lt.info.render.vertices = 0, Lt.info.render.faces = 0, Lt.info.render.points = 0, this.setRenderTarget(r), (this.autoClear || i) && this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
            for (var a = 0, o = _t.length; a < o; a++) {
                var s = _t[a],
                    h = s.object;
                h.visible && (K(h, e), y(s))
            }
            if (t.overrideMaterial) {
                var l = t.overrideMaterial;
                U(l), v(wt, e, xt, n, l), v(Mt, e, xt, n, l), R(_t, "", e, xt, n, l)
            } else $t.setBlending(THREE.NoBlending), v(wt, e, xt, n, null), R(_t, "opaque", e, xt, n, null), v(Mt, e, xt, n, null), R(_t, "transparent", e, xt, n, null);
            ge.render(t, e), ve.render(t, e, It, Wt), r && r.generateMipmaps && r.minFilter !== THREE.NearestFilter && r.minFilter !== THREE.LinearFilter && nt(r), $t.setDepthTest(!0), $t.setDepthWrite(!0), $t.setColorWrite(!0)
        }, this.renderImmediateObject = function(t, e, r, i, n) {
            var a = B(t, e, r, i, n);
            Dt = "", Lt.setMaterialFaces(i), n.immediateRenderCallback ? n.immediateRenderCallback(a, Ct, jt) : n.render(function(t) {
                Lt.renderBufferImmediate(t, a, i)
            })
        };
        var Ce = {},
            Le = 0,
            Pe = {
                MeshDepthMaterial: "depth",
                MeshNormalMaterial: "normal",
                MeshBasicMaterial: "basic",
                MeshLambertMaterial: "lambert",
                MeshPhongMaterial: "phong",
                LineBasicMaterial: "basic",
                LineDashedMaterial: "dashed",
                PointCloudMaterial: "particle_basic"
            };
        this.setFaceCulling = function(t, e) {
            t === THREE.CullFaceNone ? Ct.disable(Ct.CULL_FACE) : (e === THREE.FrontFaceDirectionCW ? Ct.frontFace(Ct.CW) : Ct.frontFace(Ct.CCW), t === THREE.CullFaceBack ? Ct.cullFace(Ct.BACK) : t === THREE.CullFaceFront ? Ct.cullFace(Ct.FRONT) : Ct.cullFace(Ct.FRONT_AND_BACK), Ct.enable(Ct.CULL_FACE))
        }, this.setMaterialFaces = function(t) {
            $t.setDoubleSided(t.side === THREE.DoubleSide), $t.setFlipSided(t.side === THREE.BackSide)
        }, this.uploadTexture = function(t) {
            void 0 === t.__webglInit && (t.__webglInit = !0, t.addEventListener("dispose", He), t.__webglTexture = Ct.createTexture(), Lt.info.memory.textures++), Ct.bindTexture(Ct.TEXTURE_2D, t.__webglTexture), Ct.pixelStorei(Ct.UNPACK_FLIP_Y_WEBGL, t.flipY), Ct.pixelStorei(Ct.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultiplyAlpha), Ct.pixelStorei(Ct.UNPACK_ALIGNMENT, t.unpackAlignment), t.image = $(t.image, oe);
            var e = t.image,
                r = THREE.Math.isPowerOfTwo(e.width) && THREE.Math.isPowerOfTwo(e.height),
                i = ot(t.format),
                n = ot(t.type);
            J(Ct.TEXTURE_2D, t, r);
            var a, o = t.mipmaps;
            if (t instanceof THREE.DataTexture)
                if (o.length > 0 && r) {
                    for (var s = 0, h = o.length; s < h; s++) a = o[s], Ct.texImage2D(Ct.TEXTURE_2D, s, i, a.width, a.height, 0, i, n, a.data);
                    t.generateMipmaps = !1
                } else Ct.texImage2D(Ct.TEXTURE_2D, 0, i, e.width, e.height, 0, i, n, e.data);
            else if (t instanceof THREE.CompressedTexture)
                for (var s = 0, h = o.length; s < h; s++) a = o[s], t.format !== THREE.RGBAFormat && t.format !== THREE.RGBFormat ? pe().indexOf(i) > -1 ? Ct.compressedTexImage2D(Ct.TEXTURE_2D, s, i, a.width, a.height, 0, a.data) : THREE.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : Ct.texImage2D(Ct.TEXTURE_2D, s, i, a.width, a.height, 0, i, n, a.data);
            else if (o.length > 0 && r) {
                for (var s = 0, h = o.length; s < h; s++) a = o[s], Ct.texImage2D(Ct.TEXTURE_2D, s, i, i, n, a);
                t.generateMipmaps = !1
            } else Ct.texImage2D(Ct.TEXTURE_2D, 0, i, i, n, t.image);
            t.generateMipmaps && r && Ct.generateMipmap(Ct.TEXTURE_2D), t.needsUpdate = !1, t.onUpdate && t.onUpdate()
        }, this.setTexture = function(t, e) {
            Ct.activeTexture(Ct.TEXTURE0 + e), t.needsUpdate ? Lt.uploadTexture(t) : Ct.bindTexture(Ct.TEXTURE_2D, t.__webglTexture)
        }, this.setRenderTarget = function(t) {
            var e = t instanceof THREE.WebGLRenderTargetCube;
            if (t && void 0 === t.__webglFramebuffer) {
                void 0 === t.depthBuffer && (t.depthBuffer = !0), void 0 === t.stencilBuffer && (t.stencilBuffer = !0), t.addEventListener("dispose", xe), t.__webglTexture = Ct.createTexture(), Lt.info.memory.textures++;
                var r = THREE.Math.isPowerOfTwo(t.width) && THREE.Math.isPowerOfTwo(t.height),
                    i = ot(t.format),
                    n = ot(t.type);
                if (e) {
                    t.__webglFramebuffer = [], t.__webglRenderbuffer = [], Ct.bindTexture(Ct.TEXTURE_CUBE_MAP, t.__webglTexture), J(Ct.TEXTURE_CUBE_MAP, t, r);
                    for (var a = 0; a < 6; a++) t.__webglFramebuffer[a] = Ct.createFramebuffer(), t.__webglRenderbuffer[a] = Ct.createRenderbuffer(), Ct.texImage2D(Ct.TEXTURE_CUBE_MAP_POSITIVE_X + a, 0, i, t.width, t.height, 0, i, n, null), rt(t.__webglFramebuffer[a], t, Ct.TEXTURE_CUBE_MAP_POSITIVE_X + a), it(t.__webglRenderbuffer[a], t);
                    r && Ct.generateMipmap(Ct.TEXTURE_CUBE_MAP)
                } else t.__webglFramebuffer = Ct.createFramebuffer(), t.shareDepthFrom ? t.__webglRenderbuffer = t.shareDepthFrom.__webglRenderbuffer : t.__webglRenderbuffer = Ct.createRenderbuffer(), Ct.bindTexture(Ct.TEXTURE_2D, t.__webglTexture), J(Ct.TEXTURE_2D, t, r), Ct.texImage2D(Ct.TEXTURE_2D, 0, i, t.width, t.height, 0, i, n, null), rt(t.__webglFramebuffer, t, Ct.TEXTURE_2D), t.shareDepthFrom ? t.depthBuffer && !t.stencilBuffer ? Ct.framebufferRenderbuffer(Ct.FRAMEBUFFER, Ct.DEPTH_ATTACHMENT, Ct.RENDERBUFFER, t.__webglRenderbuffer) : t.depthBuffer && t.stencilBuffer && Ct.framebufferRenderbuffer(Ct.FRAMEBUFFER, Ct.DEPTH_STENCIL_ATTACHMENT, Ct.RENDERBUFFER, t.__webglRenderbuffer) : it(t.__webglRenderbuffer, t), r && Ct.generateMipmap(Ct.TEXTURE_2D);
                e ? Ct.bindTexture(Ct.TEXTURE_CUBE_MAP, null) : Ct.bindTexture(Ct.TEXTURE_2D, null), Ct.bindRenderbuffer(Ct.RENDERBUFFER, null), Ct.bindFramebuffer(Ct.FRAMEBUFFER, null)
            }
            var o, s, h, l, c;
            t ? (o = e ? t.__webglFramebuffer[t.activeCubeFace] : t.__webglFramebuffer, s = t.width, h = t.height, l = 0, c = 0) : (o = null, s = Ot, h = Gt, l = kt, c = Nt), o !== Ut && (Ct.bindFramebuffer(Ct.FRAMEBUFFER, o), Ct.viewport(l, c, s, h), Ut = o), It = s, Wt = h
        }, this.readRenderTargetPixels = function(t, e, r, i, n, a) {
            if (!(t instanceof THREE.WebGLRenderTarget)) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
            if (t.__webglFramebuffer) {
                if (t.format !== THREE.RGBAFormat) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA format. readPixels can read only RGBA format.");
                var o = !1;
                t.__webglFramebuffer !== Ut && (Ct.bindFramebuffer(Ct.FRAMEBUFFER, t.__webglFramebuffer), o = !0), Ct.checkFramebufferStatus(Ct.FRAMEBUFFER) === Ct.FRAMEBUFFER_COMPLETE ? Ct.readPixels(e, r, i, n, Ct.RGBA, Ct.UNSIGNED_BYTE, a) : console.error("THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete."), o && Ct.bindFramebuffer(Ct.FRAMEBUFFER, Ut)
            }
        }, this.initMaterial = function() {
            THREE.warn("THREE.WebGLRenderer: .initMaterial() has been removed.")
        }, this.addPrePlugin = function() {
            THREE.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.")
        }, this.addPostPlugin = function() {
            THREE.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.")
        }, this.updateShadowMap = function() {
            THREE.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.")
        }
    }, THREE.WebGLRenderTarget = function(t, e, r) {
        this.width = t, this.height = e, r = r || {}, this.wrapS = void 0 !== r.wrapS ? r.wrapS : THREE.ClampToEdgeWrapping, this.wrapT = void 0 !== r.wrapT ? r.wrapT : THREE.ClampToEdgeWrapping, this.magFilter = void 0 !== r.magFilter ? r.magFilter : THREE.LinearFilter, this.minFilter = void 0 !== r.minFilter ? r.minFilter : THREE.LinearMipMapLinearFilter, this.anisotropy = void 0 !== r.anisotropy ? r.anisotropy : 1, this.offset = new THREE.Vector2(0, 0), this.repeat = new THREE.Vector2(1, 1), this.format = void 0 !== r.format ? r.format : THREE.RGBAFormat, this.type = void 0 !== r.type ? r.type : THREE.UnsignedByteType, this.depthBuffer = void 0 === r.depthBuffer || r.depthBuffer, this.stencilBuffer = void 0 === r.stencilBuffer || r.stencilBuffer, this.generateMipmaps = !0, this.shareDepthFrom = void 0 !== r.shareDepthFrom ? r.shareDepthFrom : null
    }, THREE.WebGLRenderTarget.prototype = {
        constructor: THREE.WebGLRenderTarget,
        setSize: function(t, e) {
            this.width = t, this.height = e
        },
        clone: function() {
            var t = new THREE.WebGLRenderTarget(this.width, this.height);
            return t.wrapS = this.wrapS, t.wrapT = this.wrapT, t.magFilter = this.magFilter, t.minFilter = this.minFilter, t.anisotropy = this.anisotropy, t.offset.copy(this.offset), t.repeat.copy(this.repeat), t.format = this.format, t.type = this.type, t.depthBuffer = this.depthBuffer, t.stencilBuffer = this.stencilBuffer, t.generateMipmaps = this.generateMipmaps, t.shareDepthFrom = this.shareDepthFrom, t
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }, THREE.EventDispatcher.prototype.apply(THREE.WebGLRenderTarget.prototype), THREE.WebGLRenderTargetCube = function(t, e, r) {
        THREE.WebGLRenderTarget.call(this, t, e, r), this.activeCubeFace = 0
    }, THREE.WebGLRenderTargetCube.prototype = Object.create(THREE.WebGLRenderTarget.prototype), THREE.WebGLRenderTargetCube.prototype.constructor = THREE.WebGLRenderTargetCube, THREE.WebGLExtensions = function(t) {
        var e = {};
        this.get = function(r) {
            if (void 0 !== e[r]) return e[r];
            var i;
            switch (r) {
                case "EXT_texture_filter_anisotropic":
                    i = t.getExtension("EXT_texture_filter_anisotropic") || t.getExtension("MOZ_EXT_texture_filter_anisotropic") || t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
                    break;
                case "WEBGL_compressed_texture_s3tc":
                    i = t.getExtension("WEBGL_compressed_texture_s3tc") || t.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
                    break;
                case "WEBGL_compressed_texture_pvrtc":
                    i = t.getExtension("WEBGL_compressed_texture_pvrtc") || t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
                    break;
                default:
                    i = t.getExtension(r)
            }
            return null === i && THREE.warn("THREE.WebGLRenderer: " + r + " extension not supported."), e[r] = i, i
        }
    }, THREE.WebGLProgram = function() {
        var t = 0,
            e = function(t) {
                var e, r, i = [];
                for (var n in t) e = t[n], e !== !1 && (r = "#define " + n + " " + e, i.push(r));
                return i.join("\n")
            },
            r = function(t, e, r) {
                for (var i = {}, n = 0, a = r.length; n < a; n++) {
                    var o = r[n];
                    i[o] = t.getUniformLocation(e, o)
                }
                return i
            },
            i = function(t, e, r) {
                for (var i = {}, n = 0, a = r.length; n < a; n++) {
                    var o = r[n];
                    i[o] = t.getAttribLocation(e, o)
                }
                return i
            };
        return function(n, a, o, s) {
            var h = n,
                l = h.context,
                c = o.defines,
                u = o.__webglShader.uniforms,
                E = o.attributes,
                f = o.__webglShader.vertexShader,
                p = o.__webglShader.fragmentShader,
                d = o.index0AttributeName;
            void 0 === d && s.morphTargets === !0 && (d = "position");
            var m = "SHADOWMAP_TYPE_BASIC";
            s.shadowMapType === THREE.PCFShadowMap ? m = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === THREE.PCFSoftShadowMap && (m = "SHADOWMAP_TYPE_PCF_SOFT");
            var T = "ENVMAP_TYPE_CUBE",
                g = "ENVMAP_MODE_REFLECTION",
                v = "ENVMAP_BLENDING_MULTIPLY";
            if (s.envMap) {
                switch (o.envMap.mapping) {
                    case THREE.CubeReflectionMapping:
                    case THREE.CubeRefractionMapping:
                        T = "ENVMAP_TYPE_CUBE";
                        break;
                    case THREE.EquirectangularReflectionMapping:
                    case THREE.EquirectangularRefractionMapping:
                        T = "ENVMAP_TYPE_EQUIREC";
                        break;
                    case THREE.SphericalReflectionMapping:
                        T = "ENVMAP_TYPE_SPHERE"
                }
                switch (o.envMap.mapping) {
                    case THREE.CubeRefractionMapping:
                    case THREE.EquirectangularRefractionMapping:
                        g = "ENVMAP_MODE_REFRACTION"
                }
                switch (o.combine) {
                    case THREE.MultiplyOperation:
                        v = "ENVMAP_BLENDING_MULTIPLY";
                        break;
                    case THREE.MixOperation:
                        v = "ENVMAP_BLENDING_MIX";
                        break;
                    case THREE.AddOperation:
                        v = "ENVMAP_BLENDING_ADD"
                }
            }
            var R, y, H = n.gammaFactor > 0 ? n.gammaFactor : 1,
                x = e(c),
                b = l.createProgram();
            o instanceof THREE.RawShaderMaterial ? (R = "", y = "") : (R = ["precision " + s.precision + " float;", "precision " + s.precision + " int;", x, s.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "", h.gammaInput ? "#define GAMMA_INPUT" : "", h.gammaOutput ? "#define GAMMA_OUTPUT" : "", "#define GAMMA_FACTOR " + H, "#define MAX_DIR_LIGHTS " + s.maxDirLights, "#define MAX_POINT_LIGHTS " + s.maxPointLights, "#define MAX_SPOT_LIGHTS " + s.maxSpotLights, "#define MAX_HEMI_LIGHTS " + s.maxHemiLights, "#define MAX_SHADOWS " + s.maxShadows, "#define MAX_BONES " + s.maxBones, s.map ? "#define USE_MAP" : "", s.envMap ? "#define USE_ENVMAP" : "", s.envMap ? "#define " + g : "", s.lightMap ? "#define USE_LIGHTMAP" : "", s.bumpMap ? "#define USE_BUMPMAP" : "", s.normalMap ? "#define USE_NORMALMAP" : "", s.specularMap ? "#define USE_SPECULARMAP" : "", s.alphaMap ? "#define USE_ALPHAMAP" : "", s.vertexColors ? "#define USE_COLOR" : "", s.flatShading ? "#define FLAT_SHADED" : "", s.skinning ? "#define USE_SKINNING" : "", s.useVertexTexture ? "#define BONE_TEXTURE" : "", s.morphTargets ? "#define USE_MORPHTARGETS" : "", s.morphNormals ? "#define USE_MORPHNORMALS" : "", s.wrapAround ? "#define WRAP_AROUND" : "", s.doubleSided ? "#define DOUBLE_SIDED" : "", s.flipSided ? "#define FLIP_SIDED" : "", s.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", s.shadowMapEnabled ? "#define " + m : "", s.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "", s.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "", s.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", s.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "attribute vec2 uv2;", "#ifdef USE_COLOR", "\tattribute vec3 color;", "#endif", "#ifdef USE_MORPHTARGETS", "\tattribute vec3 morphTarget0;", "\tattribute vec3 morphTarget1;", "\tattribute vec3 morphTarget2;", "\tattribute vec3 morphTarget3;", "\t#ifdef USE_MORPHNORMALS", "\t\tattribute vec3 morphNormal0;", "\t\tattribute vec3 morphNormal1;", "\t\tattribute vec3 morphNormal2;", "\t\tattribute vec3 morphNormal3;", "\t#else", "\t\tattribute vec3 morphTarget4;", "\t\tattribute vec3 morphTarget5;", "\t\tattribute vec3 morphTarget6;", "\t\tattribute vec3 morphTarget7;", "\t#endif", "#endif", "#ifdef USE_SKINNING", "\tattribute vec4 skinIndex;", "\tattribute vec4 skinWeight;", "#endif", ""].join("\n"), y = ["precision " + s.precision + " float;", "precision " + s.precision + " int;", s.bumpMap || s.normalMap || s.flatShading ? "#extension GL_OES_standard_derivatives : enable" : "", x, "#define MAX_DIR_LIGHTS " + s.maxDirLights, "#define MAX_POINT_LIGHTS " + s.maxPointLights, "#define MAX_SPOT_LIGHTS " + s.maxSpotLights, "#define MAX_HEMI_LIGHTS " + s.maxHemiLights, "#define MAX_SHADOWS " + s.maxShadows, s.alphaTest ? "#define ALPHATEST " + s.alphaTest : "", h.gammaInput ? "#define GAMMA_INPUT" : "", h.gammaOutput ? "#define GAMMA_OUTPUT" : "", "#define GAMMA_FACTOR " + H, s.useFog && s.fog ? "#define USE_FOG" : "", s.useFog && s.fogExp ? "#define FOG_EXP2" : "", s.map ? "#define USE_MAP" : "", s.envMap ? "#define USE_ENVMAP" : "", s.envMap ? "#define " + T : "", s.envMap ? "#define " + g : "", s.envMap ? "#define " + v : "", s.lightMap ? "#define USE_LIGHTMAP" : "", s.bumpMap ? "#define USE_BUMPMAP" : "", s.normalMap ? "#define USE_NORMALMAP" : "", s.specularMap ? "#define USE_SPECULARMAP" : "", s.alphaMap ? "#define USE_ALPHAMAP" : "", s.vertexColors ? "#define USE_COLOR" : "", s.flatShading ? "#define FLAT_SHADED" : "", s.metal ? "#define METAL" : "", s.wrapAround ? "#define WRAP_AROUND" : "", s.doubleSided ? "#define DOUBLE_SIDED" : "", s.flipSided ? "#define FLIP_SIDED" : "", s.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", s.shadowMapEnabled ? "#define " + m : "", s.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "", s.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "", s.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", ""].join("\n"));
            var _ = new THREE.WebGLShader(l, l.VERTEX_SHADER, R + f),
                w = new THREE.WebGLShader(l, l.FRAGMENT_SHADER, y + p);
            l.attachShader(b, _), l.attachShader(b, w), void 0 !== d && l.bindAttribLocation(b, 0, d), l.linkProgram(b);
            var M = l.getProgramInfoLog(b);
            l.getProgramParameter(b, l.LINK_STATUS) === !1 && THREE.error("THREE.WebGLProgram: shader error: " + l.getError(), "gl.VALIDATE_STATUS", l.getProgramParameter(b, l.VALIDATE_STATUS), "gl.getPRogramInfoLog", M), "" !== M && THREE.warn("THREE.WebGLProgram: gl.getProgramInfoLog()" + M), l.deleteShader(_), l.deleteShader(w);
            var S = ["viewMatrix", "modelViewMatrix", "projectionMatrix", "normalMatrix", "modelMatrix", "cameraPosition", "morphTargetInfluences", "bindMatrix", "bindMatrixInverse"];
            s.useVertexTexture ? (S.push("boneTexture"), S.push("boneTextureWidth"), S.push("boneTextureHeight")) : S.push("boneGlobalMatrices"), s.logarithmicDepthBuffer && S.push("logDepthBufFC");
            for (var A in u) S.push(A);
            this.uniforms = r(l, b, S), S = ["position", "normal", "uv", "uv2", "tangent", "color", "skinIndex", "skinWeight", "lineDistance"];
            for (var C = 0; C < s.maxMorphTargets; C++) S.push("morphTarget" + C);
            for (var C = 0; C < s.maxMorphNormals; C++) S.push("morphNormal" + C);
            for (var L in E) S.push(L);
            return this.attributes = i(l, b, S), this.attributesKeys = Object.keys(this.attributes), this.id = t++, this.code = a, this.usedTimes = 1, this.program = b, this.vertexShader = _, this.fragmentShader = w, this
        }
    }(), THREE.WebGLShader = function() {
        var t = function(t) {
            for (var e = t.split("\n"), r = 0; r < e.length; r++) e[r] = r + 1 + ": " + e[r];
            return e.join("\n")
        };
        return function(e, r, i) {
            var n = e.createShader(r);
            return e.shaderSource(n, i), e.compileShader(n), e.getShaderParameter(n, e.COMPILE_STATUS) === !1 && THREE.error("THREE.WebGLShader: Shader couldn't compile."), "" !== e.getShaderInfoLog(n) && THREE.warn("THREE.WebGLShader: gl.getShaderInfoLog()", e.getShaderInfoLog(n), t(i)), n
        }
    }(), THREE.WebGLState = function(t, e) {
        var r = new Uint8Array(16),
            i = new Uint8Array(16),
            n = null,
            a = null,
            o = null,
            s = null,
            h = null,
            l = null,
            c = null,
            u = null,
            E = null,
            f = null,
            p = null,
            d = null,
            m = null,
            T = null,
            g = null,
            v = null;
        this.initAttributes = function() {
            for (var t = 0, e = r.length; t < e; t++) r[t] = 0
        }, this.enableAttribute = function(e) {
            r[e] = 1, 0 === i[e] && (t.enableVertexAttribArray(e), i[e] = 1)
        }, this.disableUnusedAttributes = function() {
            for (var e = 0, n = i.length; e < n; e++) i[e] !== r[e] && (t.disableVertexAttribArray(e), i[e] = 0)
        }, this.setBlending = function(r, i, u, E, f, p, d) {
            r !== n && (r === THREE.NoBlending ? t.disable(t.BLEND) : r === THREE.AdditiveBlending ? (t.enable(t.BLEND), t.blendEquation(t.FUNC_ADD), t.blendFunc(t.SRC_ALPHA, t.ONE)) : r === THREE.SubtractiveBlending ? (t.enable(t.BLEND), t.blendEquation(t.FUNC_ADD), t.blendFunc(t.ZERO, t.ONE_MINUS_SRC_COLOR)) : r === THREE.MultiplyBlending ? (t.enable(t.BLEND), t.blendEquation(t.FUNC_ADD), t.blendFunc(t.ZERO, t.SRC_COLOR)) : r === THREE.CustomBlending ? t.enable(t.BLEND) : (t.enable(t.BLEND), t.blendEquationSeparate(t.FUNC_ADD, t.FUNC_ADD), t.blendFuncSeparate(t.SRC_ALPHA, t.ONE_MINUS_SRC_ALPHA, t.ONE, t.ONE_MINUS_SRC_ALPHA)), n = r), r === THREE.CustomBlending ? (f = f || i, p = p || u, d = d || E, i === a && f === h || (t.blendEquationSeparate(e(i), e(f)), a = i, h = f), u === o && E === s && p === l && d === c || (t.blendFuncSeparate(e(u), e(E), e(p), e(d)), o = u, s = E, l = p, c = d)) : (a = null, o = null, s = null, h = null, l = null, c = null)
        }, this.setDepthTest = function(e) {
            u !== e && (e ? t.enable(t.DEPTH_TEST) : t.disable(t.DEPTH_TEST), u = e)
        }, this.setDepthWrite = function(e) {
            E !== e && (t.depthMask(e), E = e)
        }, this.setColorWrite = function(e) {
            f !== e && (t.colorMask(e, e, e, e), f = e)
        }, this.setDoubleSided = function(e) {
            p !== e && (e ? t.disable(t.CULL_FACE) : t.enable(t.CULL_FACE), p = e)
        }, this.setFlipSided = function(e) {
            d !== e && (e ? t.frontFace(t.CW) : t.frontFace(t.CCW), d = e)
        }, this.setLineWidth = function(e) {
            e !== m && (t.lineWidth(e), m = e)
        }, this.setPolygonOffset = function(e, r, i) {
            T !== e && (e ? t.enable(t.POLYGON_OFFSET_FILL) : t.disable(t.POLYGON_OFFSET_FILL), T = e), !e || g === r && v === i || (t.polygonOffset(r, i), g = r, v = i)
        }, this.reset = function() {
            for (var t = 0; t < i.length; t++) i[t] = 0;
            n = null, u = null, E = null, f = null, p = null, d = null
        }
    }, THREE.LensFlarePlugin = function(t, e) {
        function r(e) {
            var r = u.createProgram(),
                i = u.createShader(u.FRAGMENT_SHADER),
                n = u.createShader(u.VERTEX_SHADER),
                a = "precision " + t.getPrecision() + " float;\n";
            return u.shaderSource(i, a + e.fragmentShader), u.shaderSource(n, a + e.vertexShader), u.compileShader(i), u.compileShader(n), u.attachShader(r, i), u.attachShader(r, n), u.linkProgram(r), r
        }
        var i, n, a, o, s, h, l, c, u = t.context,
            E = function() {
                var t = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1]),
                    e = new Uint16Array([0, 1, 2, 0, 2, 3]);
                i = u.createBuffer(), n = u.createBuffer(), u.bindBuffer(u.ARRAY_BUFFER, i), u.bufferData(u.ARRAY_BUFFER, t, u.STATIC_DRAW), u.bindBuffer(u.ELEMENT_ARRAY_BUFFER, n), u.bufferData(u.ELEMENT_ARRAY_BUFFER, e, u.STATIC_DRAW), l = u.createTexture(), c = u.createTexture(), u.bindTexture(u.TEXTURE_2D, l), u.texImage2D(u.TEXTURE_2D, 0, u.RGB, 16, 16, 0, u.RGB, u.UNSIGNED_BYTE, null), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_WRAP_S, u.CLAMP_TO_EDGE), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_WRAP_T, u.CLAMP_TO_EDGE), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_MAG_FILTER, u.NEAREST), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_MIN_FILTER, u.NEAREST), u.bindTexture(u.TEXTURE_2D, c), u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, 16, 16, 0, u.RGBA, u.UNSIGNED_BYTE, null), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_WRAP_S, u.CLAMP_TO_EDGE), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_WRAP_T, u.CLAMP_TO_EDGE), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_MAG_FILTER, u.NEAREST), u.texParameteri(u.TEXTURE_2D, u.TEXTURE_MIN_FILTER, u.NEAREST), h = u.getParameter(u.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;
                var E;
                E = h ? {
                    vertexShader: ["uniform lowp int renderType;", "uniform vec3 screenPosition;", "uniform vec2 scale;", "uniform float rotation;", "uniform sampler2D occlusionMap;", "attribute vec2 position;", "attribute vec2 uv;", "varying vec2 vUV;", "varying float vVisibility;", "void main() {", "vUV = uv;", "vec2 pos = position;", "if( renderType == 2 ) {", "vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );", "visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );", "visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );", "vVisibility =        visibility.r / 9.0;", "vVisibility *= 1.0 - visibility.g / 9.0;", "vVisibility *=       visibility.b / 9.0;", "vVisibility *= 1.0 - visibility.a / 9.0;", "pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;", "pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;", "}", "gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );", "}"].join("\n"),
                    fragmentShader: ["uniform lowp int renderType;", "uniform sampler2D map;", "uniform float opacity;", "uniform vec3 color;", "varying vec2 vUV;", "varying float vVisibility;", "void main() {", "if( renderType == 0 ) {", "gl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );", "} else if( renderType == 1 ) {", "gl_FragColor = texture2D( map, vUV );", "} else {", "vec4 texture = texture2D( map, vUV );", "texture.a *= opacity * vVisibility;", "gl_FragColor = texture;", "gl_FragColor.rgb *= color;", "}", "}"].join("\n")
                } : {
                    vertexShader: ["uniform lowp int renderType;", "uniform vec3 screenPosition;", "uniform vec2 scale;", "uniform float rotation;", "attribute vec2 position;", "attribute vec2 uv;", "varying vec2 vUV;", "void main() {", "vUV = uv;", "vec2 pos = position;", "if( renderType == 2 ) {", "pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;", "pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;", "}", "gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );", "}"].join("\n"),
                    fragmentShader: ["precision mediump float;", "uniform lowp int renderType;", "uniform sampler2D map;", "uniform sampler2D occlusionMap;", "uniform float opacity;", "uniform vec3 color;", "varying vec2 vUV;", "void main() {", "if( renderType == 0 ) {", "gl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );", "} else if( renderType == 1 ) {", "gl_FragColor = texture2D( map, vUV );", "} else {", "float visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a;", "visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a;", "visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a;", "visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;", "visibility = ( 1.0 - visibility / 4.0 );", "vec4 texture = texture2D( map, vUV );", "texture.a *= opacity * visibility;", "gl_FragColor = texture;", "gl_FragColor.rgb *= color;", "}", "}"].join("\n")
                }, a = r(E), o = {
                    vertex: u.getAttribLocation(a, "position"),
                    uv: u.getAttribLocation(a, "uv")
                }, s = {
                    renderType: u.getUniformLocation(a, "renderType"),
                    map: u.getUniformLocation(a, "map"),
                    occlusionMap: u.getUniformLocation(a, "occlusionMap"),
                    opacity: u.getUniformLocation(a, "opacity"),
                    color: u.getUniformLocation(a, "color"),
                    scale: u.getUniformLocation(a, "scale"),
                    rotation: u.getUniformLocation(a, "rotation"),
                    screenPosition: u.getUniformLocation(a, "screenPosition")
                }
            };
        this.render = function(r, f, p, d) {
            if (0 !== e.length) {
                var m = new THREE.Vector3,
                    T = d / p,
                    g = .5 * p,
                    v = .5 * d,
                    R = 16 / d,
                    y = new THREE.Vector2(R * T, R),
                    H = new THREE.Vector3(1, 1, 0),
                    x = new THREE.Vector2(1, 1);
                void 0 === a && E(), u.useProgram(a), u.enableVertexAttribArray(o.vertex), u.enableVertexAttribArray(o.uv), u.uniform1i(s.occlusionMap, 0), u.uniform1i(s.map, 1), u.bindBuffer(u.ARRAY_BUFFER, i), u.vertexAttribPointer(o.vertex, 2, u.FLOAT, !1, 16, 0), u.vertexAttribPointer(o.uv, 2, u.FLOAT, !1, 16, 8), u.bindBuffer(u.ELEMENT_ARRAY_BUFFER, n), u.disable(u.CULL_FACE), u.depthMask(!1);
                for (var b = 0, _ = e.length; b < _; b++) {
                    R = 16 / d, y.set(R * T, R);
                    var w = e[b];
                    if (m.set(w.matrixWorld.elements[12], w.matrixWorld.elements[13], w.matrixWorld.elements[14]), m.applyMatrix4(f.matrixWorldInverse), m.applyProjection(f.projectionMatrix), H.copy(m), x.x = H.x * g + g, x.y = H.y * v + v, h || x.x > 0 && x.x < p && x.y > 0 && x.y < d) {
                        u.activeTexture(u.TEXTURE1), u.bindTexture(u.TEXTURE_2D, l), u.copyTexImage2D(u.TEXTURE_2D, 0, u.RGB, x.x - 8, x.y - 8, 16, 16, 0), u.uniform1i(s.renderType, 0), u.uniform2f(s.scale, y.x, y.y), u.uniform3f(s.screenPosition, H.x, H.y, H.z), u.disable(u.BLEND), u.enable(u.DEPTH_TEST), u.drawElements(u.TRIANGLES, 6, u.UNSIGNED_SHORT, 0), u.activeTexture(u.TEXTURE0), u.bindTexture(u.TEXTURE_2D, c), u.copyTexImage2D(u.TEXTURE_2D, 0, u.RGBA, x.x - 8, x.y - 8, 16, 16, 0), u.uniform1i(s.renderType, 1), u.disable(u.DEPTH_TEST), u.activeTexture(u.TEXTURE1), u.bindTexture(u.TEXTURE_2D, l), u.drawElements(u.TRIANGLES, 6, u.UNSIGNED_SHORT, 0), w.positionScreen.copy(H), w.customUpdateCallback ? w.customUpdateCallback(w) : w.updateLensFlares(),
                            u.uniform1i(s.renderType, 2), u.enable(u.BLEND);
                        for (var M = 0, S = w.lensFlares.length; M < S; M++) {
                            var A = w.lensFlares[M];
                            A.opacity > .001 && A.scale > .001 && (H.x = A.x, H.y = A.y, H.z = A.z, R = A.size * A.scale / d, y.x = R * T, y.y = R, u.uniform3f(s.screenPosition, H.x, H.y, H.z), u.uniform2f(s.scale, y.x, y.y), u.uniform1f(s.rotation, A.rotation), u.uniform1f(s.opacity, A.opacity), u.uniform3f(s.color, A.color.r, A.color.g, A.color.b), t.state.setBlending(A.blending, A.blendEquation, A.blendSrc, A.blendDst), t.setTexture(A.texture, 1), u.drawElements(u.TRIANGLES, 6, u.UNSIGNED_SHORT, 0))
                        }
                    }
                }
                u.enable(u.CULL_FACE), u.enable(u.DEPTH_TEST), u.depthMask(!0), t.resetGLState()
            }
        }
    }, THREE.ShadowMapPlugin = function(t, e, r, i) {
        function n(t, e, i) {
            if (e.visible) {
                var a = r[e.id];
                if (a && e.castShadow && (e.frustumCulled === !1 || p.intersectsObject(e) === !0))
                    for (var o = 0, s = a.length; o < s; o++) {
                        var h = a[o];
                        e._modelViewMatrix.multiplyMatrices(i.matrixWorldInverse, e.matrixWorld), v.push(h)
                    }
                for (var o = 0, s = e.children.length; o < s; o++) n(t, e.children[o], i)
            }
        }

        function a(t, e) {
            var r = new THREE.DirectionalLight;
            r.isVirtual = !0, r.onlyShadow = !0, r.castShadow = !0, r.shadowCameraNear = t.shadowCameraNear, r.shadowCameraFar = t.shadowCameraFar, r.shadowCameraLeft = t.shadowCameraLeft, r.shadowCameraRight = t.shadowCameraRight, r.shadowCameraBottom = t.shadowCameraBottom, r.shadowCameraTop = t.shadowCameraTop, r.shadowCameraVisible = t.shadowCameraVisible, r.shadowDarkness = t.shadowDarkness, r.shadowBias = t.shadowCascadeBias[e], r.shadowMapWidth = t.shadowCascadeWidth[e], r.shadowMapHeight = t.shadowCascadeHeight[e], r.pointsWorld = [], r.pointsFrustum = [];
            for (var i = r.pointsWorld, n = r.pointsFrustum, a = 0; a < 8; a++) i[a] = new THREE.Vector3, n[a] = new THREE.Vector3;
            var o = t.shadowCascadeNearZ[e],
                s = t.shadowCascadeFarZ[e];
            return n[0].set(-1, -1, o), n[1].set(1, -1, o), n[2].set(-1, 1, o), n[3].set(1, 1, o), n[4].set(-1, -1, s), n[5].set(1, -1, s), n[6].set(-1, 1, s), n[7].set(1, 1, s), r
        }

        function o(t, e) {
            var r = t.shadowCascadeArray[e];
            r.position.copy(t.position), r.target.position.copy(t.target.position), r.lookAt(r.target), r.shadowCameraVisible = t.shadowCameraVisible, r.shadowDarkness = t.shadowDarkness, r.shadowBias = t.shadowCascadeBias[e];
            var i = t.shadowCascadeNearZ[e],
                n = t.shadowCascadeFarZ[e],
                a = r.pointsFrustum;
            a[0].z = i, a[1].z = i, a[2].z = i, a[3].z = i, a[4].z = n, a[5].z = n, a[6].z = n, a[7].z = n
        }

        function s(t, e) {
            var r = e.shadowCamera,
                i = e.pointsFrustum,
                n = e.pointsWorld;
            m.set(1 / 0, 1 / 0, 1 / 0), T.set(-(1 / 0), -(1 / 0), -(1 / 0));
            for (var a = 0; a < 8; a++) {
                var o = n[a];
                o.copy(i[a]), o.unproject(t), o.applyMatrix4(r.matrixWorldInverse), o.x < m.x && (m.x = o.x), o.x > T.x && (T.x = o.x), o.y < m.y && (m.y = o.y), o.y > T.y && (T.y = o.y), o.z < m.z && (m.z = o.z), o.z > T.z && (T.z = o.z)
            }
            r.left = m.x, r.right = T.x, r.top = T.y, r.bottom = m.y, r.updateProjectionMatrix()
        }

        function h(t) {
            return t.material instanceof THREE.MeshFaceMaterial ? t.material.materials[0] : t.material
        }
        var l, c, u, E, f = t.context,
            p = new THREE.Frustum,
            d = new THREE.Matrix4,
            m = new THREE.Vector3,
            T = new THREE.Vector3,
            g = new THREE.Vector3,
            v = [],
            R = THREE.ShaderLib.depthRGBA,
            y = THREE.UniformsUtils.clone(R.uniforms);
        l = new THREE.ShaderMaterial({
            uniforms: y,
            vertexShader: R.vertexShader,
            fragmentShader: R.fragmentShader
        }), c = new THREE.ShaderMaterial({
            uniforms: y,
            vertexShader: R.vertexShader,
            fragmentShader: R.fragmentShader,
            morphTargets: !0
        }), u = new THREE.ShaderMaterial({
            uniforms: y,
            vertexShader: R.vertexShader,
            fragmentShader: R.fragmentShader,
            skinning: !0
        }), E = new THREE.ShaderMaterial({
            uniforms: y,
            vertexShader: R.vertexShader,
            fragmentShader: R.fragmentShader,
            morphTargets: !0,
            skinning: !0
        }), l._shadowPass = !0, c._shadowPass = !0, u._shadowPass = !0, E._shadowPass = !0, this.render = function(r, m) {
            if (t.shadowMapEnabled !== !1) {
                var T, R, y, H, x, b, _, w, M, S, A, C, L, P = [],
                    F = 0,
                    U = null;
                for (f.clearColor(1, 1, 1, 1), f.disable(f.BLEND), f.enable(f.CULL_FACE), f.frontFace(f.CCW), t.shadowMapCullFace === THREE.CullFaceFront ? f.cullFace(f.FRONT) : f.cullFace(f.BACK), t.state.setDepthTest(!0), T = 0, R = e.length; T < R; T++)
                    if (L = e[T], L.castShadow)
                        if (L instanceof THREE.DirectionalLight && L.shadowCascade)
                            for (x = 0; x < L.shadowCascadeCount; x++) {
                                var B;
                                if (L.shadowCascadeArray[x]) B = L.shadowCascadeArray[x];
                                else {
                                    B = a(L, x), B.originalCamera = m;
                                    var D = new THREE.Gyroscope;
                                    D.position.copy(L.shadowCascadeOffset), D.add(B), D.add(B.target), m.add(D), L.shadowCascadeArray[x] = B
                                }
                                o(L, x), P[F] = B, F++
                            } else P[F] = L, F++;
                for (T = 0, R = P.length; T < R; T++) {
                    if (L = P[T], !L.shadowMap) {
                        var V = THREE.LinearFilter;
                        t.shadowMapType === THREE.PCFSoftShadowMap && (V = THREE.NearestFilter);
                        var z = {
                            minFilter: V,
                            magFilter: V,
                            format: THREE.RGBAFormat
                        };
                        L.shadowMap = new THREE.WebGLRenderTarget(L.shadowMapWidth, L.shadowMapHeight, z), L.shadowMapSize = new THREE.Vector2(L.shadowMapWidth, L.shadowMapHeight), L.shadowMatrix = new THREE.Matrix4
                    }
                    if (!L.shadowCamera) {
                        if (L instanceof THREE.SpotLight) L.shadowCamera = new THREE.PerspectiveCamera(L.shadowCameraFov, L.shadowMapWidth / L.shadowMapHeight, L.shadowCameraNear, L.shadowCameraFar);
                        else {
                            if (!(L instanceof THREE.DirectionalLight)) {
                                THREE.error("THREE.ShadowMapPlugin: Unsupported light type for shadow", L);
                                continue
                            }
                            L.shadowCamera = new THREE.OrthographicCamera(L.shadowCameraLeft, L.shadowCameraRight, L.shadowCameraTop, L.shadowCameraBottom, L.shadowCameraNear, L.shadowCameraFar)
                        }
                        r.add(L.shadowCamera), r.autoUpdate === !0 && r.updateMatrixWorld()
                    }
                    L.shadowCameraVisible && !L.cameraHelper && (L.cameraHelper = new THREE.CameraHelper(L.shadowCamera), r.add(L.cameraHelper)), L.isVirtual && B.originalCamera == m && s(m, L), b = L.shadowMap, _ = L.shadowMatrix, w = L.shadowCamera, w.position.setFromMatrixPosition(L.matrixWorld), g.setFromMatrixPosition(L.target.matrixWorld), w.lookAt(g), w.updateMatrixWorld(), w.matrixWorldInverse.getInverse(w.matrixWorld), L.cameraHelper && (L.cameraHelper.visible = L.shadowCameraVisible), L.shadowCameraVisible && L.cameraHelper.update(), _.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), _.multiply(w.projectionMatrix), _.multiply(w.matrixWorldInverse), d.multiplyMatrices(w.projectionMatrix, w.matrixWorldInverse), p.setFromMatrix(d), t.setRenderTarget(b), t.clear(), v.length = 0, n(r, r, w);
                    var k, N, O;
                    for (y = 0, H = v.length; y < H; y++) A = v[y], C = A.object, M = A.buffer, k = h(C), N = void 0 !== C.geometry.morphTargets && C.geometry.morphTargets.length > 0 && k.morphTargets, O = C instanceof THREE.SkinnedMesh && k.skinning, S = C.customDepthMaterial ? C.customDepthMaterial : O ? N ? E : u : N ? c : l, t.setMaterialFaces(k), M instanceof THREE.BufferGeometry ? t.renderBufferDirect(w, e, U, S, M, C) : t.renderBuffer(w, e, U, S, M, C);
                    for (y = 0, H = i.length; y < H; y++) A = i[y], C = A.object, C.visible && C.castShadow && (C._modelViewMatrix.multiplyMatrices(w.matrixWorldInverse, C.matrixWorld), t.renderImmediateObject(w, e, U, l, C))
                }
                var G = t.getClearColor(),
                    I = t.getClearAlpha();
                f.clearColor(G.r, G.g, G.b, I), f.enable(f.BLEND), t.shadowMapCullFace === THREE.CullFaceFront && f.cullFace(f.BACK), t.resetGLState()
            }
        }
    }, THREE.SpritePlugin = function(t, e) {
        function r() {
            var e = c.createProgram(),
                r = c.createShader(c.VERTEX_SHADER),
                i = c.createShader(c.FRAGMENT_SHADER);
            return c.shaderSource(r, ["precision " + t.getPrecision() + " float;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform float rotation;", "uniform vec2 scale;", "uniform vec2 uvOffset;", "uniform vec2 uvScale;", "attribute vec2 position;", "attribute vec2 uv;", "varying vec2 vUV;", "void main() {", "vUV = uvOffset + uv * uvScale;", "vec2 alignedPosition = position * scale;", "vec2 rotatedPosition;", "rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;", "rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;", "vec4 finalPosition;", "finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );", "finalPosition.xy += rotatedPosition;", "finalPosition = projectionMatrix * finalPosition;", "gl_Position = finalPosition;", "}"].join("\n")), c.shaderSource(i, ["precision " + t.getPrecision() + " float;", "uniform vec3 color;", "uniform sampler2D map;", "uniform float opacity;", "uniform int fogType;", "uniform vec3 fogColor;", "uniform float fogDensity;", "uniform float fogNear;", "uniform float fogFar;", "uniform float alphaTest;", "varying vec2 vUV;", "void main() {", "vec4 texture = texture2D( map, vUV );", "if ( texture.a < alphaTest ) discard;", "gl_FragColor = vec4( color * texture.xyz, texture.a * opacity );", "if ( fogType > 0 ) {", "float depth = gl_FragCoord.z / gl_FragCoord.w;", "float fogFactor = 0.0;", "if ( fogType == 1 ) {", "fogFactor = smoothstep( fogNear, fogFar, depth );", "} else {", "const float LOG2 = 1.442695;", "float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );", "fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );", "}", "gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );", "}", "}"].join("\n")), c.compileShader(r), c.compileShader(i), c.attachShader(e, r), c.attachShader(e, i), c.linkProgram(e), e
        }

        function i(t, e) {
            return t.z !== e.z ? e.z - t.z : e.id - t.id
        }
        var n, a, o, s, h, l, c = t.context,
            u = new THREE.Vector3,
            E = new THREE.Quaternion,
            f = new THREE.Vector3,
            p = function() {
                var t = new Float32Array([-.5, -.5, 0, 0, .5, -.5, 1, 0, .5, .5, 1, 1, -.5, .5, 0, 1]),
                    e = new Uint16Array([0, 1, 2, 0, 2, 3]);
                n = c.createBuffer(), a = c.createBuffer(), c.bindBuffer(c.ARRAY_BUFFER, n), c.bufferData(c.ARRAY_BUFFER, t, c.STATIC_DRAW), c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, a), c.bufferData(c.ELEMENT_ARRAY_BUFFER, e, c.STATIC_DRAW), o = r(), s = {
                    position: c.getAttribLocation(o, "position"),
                    uv: c.getAttribLocation(o, "uv")
                }, h = {
                    uvOffset: c.getUniformLocation(o, "uvOffset"),
                    uvScale: c.getUniformLocation(o, "uvScale"),
                    rotation: c.getUniformLocation(o, "rotation"),
                    scale: c.getUniformLocation(o, "scale"),
                    color: c.getUniformLocation(o, "color"),
                    map: c.getUniformLocation(o, "map"),
                    opacity: c.getUniformLocation(o, "opacity"),
                    modelViewMatrix: c.getUniformLocation(o, "modelViewMatrix"),
                    projectionMatrix: c.getUniformLocation(o, "projectionMatrix"),
                    fogType: c.getUniformLocation(o, "fogType"),
                    fogDensity: c.getUniformLocation(o, "fogDensity"),
                    fogNear: c.getUniformLocation(o, "fogNear"),
                    fogFar: c.getUniformLocation(o, "fogFar"),
                    fogColor: c.getUniformLocation(o, "fogColor"),
                    alphaTest: c.getUniformLocation(o, "alphaTest")
                };
                var i = document.createElement("canvas");
                i.width = 8, i.height = 8;
                var u = i.getContext("2d");
                u.fillStyle = "white", u.fillRect(0, 0, 8, 8), l = new THREE.Texture(i), l.needsUpdate = !0
            };
        this.render = function(r, d) {
            if (0 !== e.length) {
                void 0 === o && p(), c.useProgram(o), c.enableVertexAttribArray(s.position), c.enableVertexAttribArray(s.uv), c.disable(c.CULL_FACE), c.enable(c.BLEND), c.bindBuffer(c.ARRAY_BUFFER, n), c.vertexAttribPointer(s.position, 2, c.FLOAT, !1, 16, 0), c.vertexAttribPointer(s.uv, 2, c.FLOAT, !1, 16, 8), c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, a), c.uniformMatrix4fv(h.projectionMatrix, !1, d.projectionMatrix.elements), c.activeTexture(c.TEXTURE0), c.uniform1i(h.map, 0);
                var m = 0,
                    T = 0,
                    g = r.fog;
                g ? (c.uniform3f(h.fogColor, g.color.r, g.color.g, g.color.b), g instanceof THREE.Fog ? (c.uniform1f(h.fogNear, g.near), c.uniform1f(h.fogFar, g.far), c.uniform1i(h.fogType, 1), m = 1, T = 1) : g instanceof THREE.FogExp2 && (c.uniform1f(h.fogDensity, g.density), c.uniform1i(h.fogType, 2), m = 2, T = 2)) : (c.uniform1i(h.fogType, 0), m = 0, T = 0);
                for (var v = 0, R = e.length; v < R; v++) {
                    var y = e[v];
                    y._modelViewMatrix.multiplyMatrices(d.matrixWorldInverse, y.matrixWorld), y.z = -y._modelViewMatrix.elements[14]
                }
                e.sort(i);
                for (var H = [], v = 0, R = e.length; v < R; v++) {
                    var y = e[v],
                        x = y.material;
                    c.uniform1f(h.alphaTest, x.alphaTest), c.uniformMatrix4fv(h.modelViewMatrix, !1, y._modelViewMatrix.elements), y.matrixWorld.decompose(u, E, f), H[0] = f.x, H[1] = f.y;
                    var b = 0;
                    r.fog && x.fog && (b = T), m !== b && (c.uniform1i(h.fogType, b), m = b), null !== x.map ? (c.uniform2f(h.uvOffset, x.map.offset.x, x.map.offset.y), c.uniform2f(h.uvScale, x.map.repeat.x, x.map.repeat.y)) : (c.uniform2f(h.uvOffset, 0, 0), c.uniform2f(h.uvScale, 1, 1)), c.uniform1f(h.opacity, x.opacity), c.uniform3f(h.color, x.color.r, x.color.g, x.color.b), c.uniform1f(h.rotation, x.rotation), c.uniform2fv(h.scale, H), t.state.setBlending(x.blending, x.blendEquation, x.blendSrc, x.blendDst), t.state.setDepthTest(x.depthTest), t.state.setDepthWrite(x.depthWrite), x.map && x.map.image && x.map.image.width ? t.setTexture(x.map, 0) : t.setTexture(l, 0), c.drawElements(c.TRIANGLES, 6, c.UNSIGNED_SHORT, 0)
                }
                c.enable(c.CULL_FACE), t.resetGLState()
            }
        }
    }, THREE.GeometryUtils = {
        merge: function(t, e, r) {
            THREE.warn("THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.");
            var i;
            e instanceof THREE.Mesh && (e.matrixAutoUpdate && e.updateMatrix(), i = e.matrix, e = e.geometry), t.merge(e, i, r)
        },
        center: function(t) {
            return THREE.warn("THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead."), t.center()
        }
    }, THREE.ImageUtils = {
        crossOrigin: void 0,
        loadTexture: function(t, e, r, i) {
            var n = new THREE.ImageLoader;
            n.crossOrigin = this.crossOrigin;
            var a = new THREE.Texture((void 0), e);
            return n.load(t, function(t) {
                a.image = t, a.needsUpdate = !0, r && r(a)
            }, void 0, function(t) {
                i && i(t)
            }), a.sourceFile = t, a
        },
        loadTextureCube: function(t, e, r, i) {
            var n = [],
                a = new THREE.ImageLoader;
            a.crossOrigin = this.crossOrigin;
            var o = new THREE.CubeTexture(n, e);
            o.flipY = !1;
            for (var s = 0, h = function(e) {
                    a.load(t[e], function(t) {
                        o.images[e] = t, s += 1, 6 === s && (o.needsUpdate = !0, r && r(o))
                    }, void 0, i)
                }, l = 0, c = t.length; l < c; ++l) h(l);
            return o
        },
        loadCompressedTexture: function() {
            THREE.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.")
        },
        loadCompressedTextureCube: function() {
            THREE.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.")
        },
        getNormalMap: function(t, e) {
            var r = function(t, e) {
                    return [t[1] * e[2] - t[2] * e[1], t[2] * e[0] - t[0] * e[2], t[0] * e[1] - t[1] * e[0]]
                },
                i = function(t, e) {
                    return [t[0] - e[0], t[1] - e[1], t[2] - e[2]]
                },
                n = function(t) {
                    var e = Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]);
                    return [t[0] / e, t[1] / e, t[2] / e]
                };
            e = 1 | e;
            var a = t.width,
                o = t.height,
                s = document.createElement("canvas");
            s.width = a, s.height = o;
            var h = s.getContext("2d");
            h.drawImage(t, 0, 0);
            for (var l = h.getImageData(0, 0, a, o).data, c = h.createImageData(a, o), u = c.data, E = 0; E < a; E++)
                for (var f = 0; f < o; f++) {
                    var p = f - 1 < 0 ? 0 : f - 1,
                        d = f + 1 > o - 1 ? o - 1 : f + 1,
                        m = E - 1 < 0 ? 0 : E - 1,
                        T = E + 1 > a - 1 ? a - 1 : E + 1,
                        g = [],
                        v = [0, 0, l[4 * (f * a + E)] / 255 * e];
                    g.push([-1, 0, l[4 * (f * a + m)] / 255 * e]), g.push([-1, -1, l[4 * (p * a + m)] / 255 * e]), g.push([0, -1, l[4 * (p * a + E)] / 255 * e]), g.push([1, -1, l[4 * (p * a + T)] / 255 * e]), g.push([1, 0, l[4 * (f * a + T)] / 255 * e]), g.push([1, 1, l[4 * (d * a + T)] / 255 * e]), g.push([0, 1, l[4 * (d * a + E)] / 255 * e]), g.push([-1, 1, l[4 * (d * a + m)] / 255 * e]);
                    for (var R = [], y = g.length, H = 0; H < y; H++) {
                        var x = g[H],
                            b = g[(H + 1) % y];
                        x = i(x, v), b = i(b, v), R.push(n(r(x, b)))
                    }
                    for (var _ = [0, 0, 0], H = 0; H < R.length; H++) _[0] += R[H][0], _[1] += R[H][1], _[2] += R[H][2];
                    _[0] /= R.length, _[1] /= R.length, _[2] /= R.length;
                    var w = 4 * (f * a + E);
                    u[w] = (_[0] + 1) / 2 * 255 | 0, u[w + 1] = (_[1] + 1) / 2 * 255 | 0, u[w + 2] = 255 * _[2] | 0, u[w + 3] = 255
                }
            return h.putImageData(c, 0, 0), s
        },
        generateDataTexture: function(t, e, r) {
            for (var i = t * e, n = new Uint8Array(3 * i), a = Math.floor(255 * r.r), o = Math.floor(255 * r.g), s = Math.floor(255 * r.b), h = 0; h < i; h++) n[3 * h] = a, n[3 * h + 1] = o, n[3 * h + 2] = s;
            var l = new THREE.DataTexture(n, t, e, THREE.RGBFormat);
            return l.needsUpdate = !0, l
        }
    }, THREE.SceneUtils = {
        createMultiMaterialObject: function(t, e) {
            for (var r = new THREE.Object3D, i = 0, n = e.length; i < n; i++) r.add(new THREE.Mesh(t, e[i]));
            return r
        },
        detach: function(t, e, r) {
            t.applyMatrix(e.matrixWorld), e.remove(t), r.add(t)
        },
        attach: function(t, e, r) {
            var i = new THREE.Matrix4;
            i.getInverse(r.matrixWorld), t.applyMatrix(i), e.remove(t), r.add(t)
        }
    }, THREE.FontUtils = {
        faces: {},
        face: "helvetiker",
        weight: "normal",
        style: "normal",
        size: 150,
        divisions: 10,
        getFace: function() {
            try {
                return this.faces[this.face][this.weight][this.style]
            } catch (t) {
                throw "The font " + this.face + " with " + this.weight + " weight and " + this.style + " style is missing."
            }
        },
        loadFace: function(t) {
            var e = t.familyName.toLowerCase(),
                r = this;
            return r.faces[e] = r.faces[e] || {}, r.faces[e][t.cssFontWeight] = r.faces[e][t.cssFontWeight] || {}, r.faces[e][t.cssFontWeight][t.cssFontStyle] = t, r.faces[e][t.cssFontWeight][t.cssFontStyle] = t, t
        },
        drawText: function(t) {
            var e, r = this.getFace(),
                i = this.size / r.resolution,
                n = 0,
                a = String(t).split(""),
                o = a.length,
                s = [];
            for (e = 0; e < o; e++) {
                var h = new THREE.Path,
                    l = this.extractGlyphPoints(a[e], r, i, n, h);
                n += l.offset, s.push(l.path)
            }
            var c = n / 2;
            return {
                paths: s,
                offset: c
            }
        },
        extractGlyphPoints: function(t, e, r, i, n) {
            var a, o, s, h, l, c, u, E, f, p, d, m, T, g, v, R, y, H, x, b = [],
                _ = e.glyphs[t] || e.glyphs["?"];
            if (_) {
                if (_.o)
                    for (h = _._cachedOutline || (_._cachedOutline = _.o.split(" ")), c = h.length, u = r, E = r, a = 0; a < c;) switch (l = h[a++]) {
                        case "m":
                            f = h[a++] * u + i, p = h[a++] * E, n.moveTo(f, p);
                            break;
                        case "l":
                            f = h[a++] * u + i, p = h[a++] * E, n.lineTo(f, p);
                            break;
                        case "q":
                            if (d = h[a++] * u + i, m = h[a++] * E, v = h[a++] * u + i, R = h[a++] * E, n.quadraticCurveTo(v, R, d, m), x = b[b.length - 1])
                                for (T = x.x, g = x.y, o = 1, s = this.divisions; o <= s; o++) {
                                    var w = o / s;
                                    THREE.Shape.Utils.b2(w, T, v, d), THREE.Shape.Utils.b2(w, g, R, m)
                                }
                            break;
                        case "b":
                            if (d = h[a++] * u + i, m = h[a++] * E, v = h[a++] * u + i, R = h[a++] * E, y = h[a++] * u + i, H = h[a++] * E, n.bezierCurveTo(v, R, y, H, d, m), x = b[b.length - 1])
                                for (T = x.x, g = x.y, o = 1, s = this.divisions; o <= s; o++) {
                                    var w = o / s;
                                    THREE.Shape.Utils.b3(w, T, v, y, d), THREE.Shape.Utils.b3(w, g, R, H, m)
                                }
                    }
                return {
                    offset: _.ha * r,
                    path: n
                }
            }
        }
    }, THREE.FontUtils.generateShapes = function(t, e) {
        e = e || {};
        var r = void 0 !== e.size ? e.size : 100,
            i = void 0 !== e.curveSegments ? e.curveSegments : 4,
            n = void 0 !== e.font ? e.font : "helvetiker",
            a = void 0 !== e.weight ? e.weight : "normal",
            o = void 0 !== e.style ? e.style : "normal";
        THREE.FontUtils.size = r, THREE.FontUtils.divisions = i, THREE.FontUtils.face = n, THREE.FontUtils.weight = a, THREE.FontUtils.style = o;
        for (var s = THREE.FontUtils.drawText(t), h = s.paths, l = [], c = 0, u = h.length; c < u; c++) Array.prototype.push.apply(l, h[c].toShapes());
        return l
    },
    function(t) {
        var e = 1e-10,
            r = function(t, e) {
                var r = t.length;
                if (r < 3) return null;
                var a, o, s, h = [],
                    l = [],
                    c = [];
                if (i(t) > 0)
                    for (o = 0; o < r; o++) l[o] = o;
                else
                    for (o = 0; o < r; o++) l[o] = r - 1 - o;
                var u = r,
                    E = 2 * u;
                for (o = u - 1; u > 2;) {
                    if (E-- <= 0) return THREE.warn("THREE.FontUtils: Warning, unable to triangulate polygon! in Triangulate.process()"), e ? c : h;
                    if (a = o, u <= a && (a = 0), o = a + 1, u <= o && (o = 0), s = o + 1, u <= s && (s = 0), n(t, a, o, s, u, l)) {
                        var f, p, d, m, T;
                        for (f = l[a], p = l[o], d = l[s], h.push([t[f], t[p], t[d]]), c.push([l[a], l[o], l[s]]), m = o, T = o + 1; T < u; m++, T++) l[m] = l[T];
                        u--, E = 2 * u
                    }
                }
                return e ? c : h
            },
            i = function(t) {
                for (var e = t.length, r = 0, i = e - 1, n = 0; n < e; i = n++) r += t[i].x * t[n].y - t[n].x * t[i].y;
                return .5 * r
            },
            n = function(t, r, i, n, a, o) {
                var s, h, l, c, u, E, f, p, d;
                if (h = t[o[r]].x, l = t[o[r]].y, c = t[o[i]].x, u = t[o[i]].y, E = t[o[n]].x, f = t[o[n]].y, e > (c - h) * (f - l) - (u - l) * (E - h)) return !1;
                var m, T, g, v, R, y, H, x, b, _, w, M, S, A, C;
                for (m = E - c, T = f - u, g = h - E, v = l - f, R = c - h, y = u - l, s = 0; s < a; s++)
                    if (p = t[o[s]].x, d = t[o[s]].y, !(p === h && d === l || p === c && d === u || p === E && d === f) && (H = p - h, x = d - l, b = p - c, _ = d - u, w = p - E, M = d - f, C = m * _ - T * b, S = R * x - y * H, A = g * M - v * w, C >= -e && A >= -e && S >= -e)) return !1;
                return !0
            };
        return t.Triangulate = r, t.Triangulate.area = i, t
    }(THREE.FontUtils), self._typeface_js = {
        faces: THREE.FontUtils.faces,
        loadFace: THREE.FontUtils.loadFace
    }, THREE.typeface_js = self._typeface_js, THREE.Audio = function(t) {
        THREE.Object3D.call(this), this.type = "Audio", this.context = t.context, this.source = this.context.createBufferSource(), this.source.onended = this.onEnded.bind(this), this.gain = this.context.createGain(), this.gain.connect(this.context.destination), this.panner = this.context.createPanner(), this.panner.connect(this.gain), this.autoplay = !1, this.startTime = 0, this.isPlaying = !1
    }, THREE.Audio.prototype = Object.create(THREE.Object3D.prototype), THREE.Audio.prototype.constructor = THREE.Audio, THREE.Audio.prototype.load = function(t) {
        var e = this,
            r = new XMLHttpRequest;
        return r.open("GET", t, !0), r.responseType = "arraybuffer", r.onload = function(t) {
            e.context.decodeAudioData(this.response, function(t) {
                e.source.buffer = t, e.autoplay && e.play()
            })
        }, r.send(), this
    }, THREE.Audio.prototype.play = function() {
        if (this.isPlaying === !0) return void THREE.warn("THREE.Audio: Audio is already playing.");
        var t = this.context.createBufferSource();
        t.buffer = this.source.buffer, t.loop = this.source.loop, t.onended = this.source.onended, t.connect(this.panner), t.start(0, this.startTime), this.isPlaying = !0, this.source = t
    }, THREE.Audio.prototype.pause = function() {
        this.source.stop(), this.startTime = this.context.currentTime
    }, THREE.Audio.prototype.stop = function() {
        this.source.stop(), this.startTime = 0
    }, THREE.Audio.prototype.onEnded = function() {
        this.isPlaying = !1
    }, THREE.Audio.prototype.setLoop = function(t) {
        this.source.loop = t
    }, THREE.Audio.prototype.setRefDistance = function(t) {
        this.panner.refDistance = t
    }, THREE.Audio.prototype.setRolloffFactor = function(t) {
        this.panner.rolloffFactor = t
    }, THREE.Audio.prototype.setVolume = function(t) {
        this.gain.gain.value = t
    }, THREE.Audio.prototype.updateMatrixWorld = function() {
        var t = new THREE.Vector3;
        return function(e) {
            THREE.Object3D.prototype.updateMatrixWorld.call(this, e), t.setFromMatrixPosition(this.matrixWorld), this.panner.setPosition(t.x, t.y, t.z)
        }
    }(), THREE.AudioListener = function() {
        THREE.Object3D.call(this), this.type = "AudioListener", this.context = new(window.AudioContext || window.webkitAudioContext)
    }, THREE.AudioListener.prototype = Object.create(THREE.Object3D.prototype), THREE.AudioListener.prototype.constructor = THREE.AudioListener, THREE.AudioListener.prototype.updateMatrixWorld = function() {
        var t = new THREE.Vector3,
            e = new THREE.Quaternion,
            r = new THREE.Vector3,
            i = new THREE.Vector3,
            n = new THREE.Vector3,
            a = new THREE.Vector3;
        return function(o) {
            THREE.Object3D.prototype.updateMatrixWorld.call(this, o);
            var s = this.context.listener,
                h = this.up;
            this.matrixWorld.decompose(t, e, r), i.set(0, 0, -1).applyQuaternion(e), n.subVectors(t, a), s.setPosition(t.x, t.y, t.z), s.setOrientation(i.x, i.y, i.z, h.x, h.y, h.z), s.setVelocity(n.x, n.y, n.z), a.copy(t)
        }
    }(), THREE.Curve = function() {}, THREE.Curve.prototype.getPoint = function(t) {
        return THREE.warn("THREE.Curve: Warning, getPoint() not implemented!"), null
    }, THREE.Curve.prototype.getPointAt = function(t) {
        var e = this.getUtoTmapping(t);
        return this.getPoint(e)
    }, THREE.Curve.prototype.getPoints = function(t) {
        t || (t = 5);
        var e, r = [];
        for (e = 0; e <= t; e++) r.push(this.getPoint(e / t));
        return r
    }, THREE.Curve.prototype.getSpacedPoints = function(t) {
        t || (t = 5);
        var e, r = [];
        for (e = 0; e <= t; e++) r.push(this.getPointAt(e / t));
        return r
    }, THREE.Curve.prototype.getLength = function() {
        var t = this.getLengths();
        return t[t.length - 1]
    }, THREE.Curve.prototype.getLengths = function(t) {
        if (t || (t = this.__arcLengthDivisions ? this.__arcLengthDivisions : 200), this.cacheArcLengths && this.cacheArcLengths.length == t + 1 && !this.needsUpdate) return this.cacheArcLengths;
        this.needsUpdate = !1;
        var e, r, i = [],
            n = this.getPoint(0),
            a = 0;
        for (i.push(0), r = 1; r <= t; r++) e = this.getPoint(r / t), a += e.distanceTo(n), i.push(a), n = e;
        return this.cacheArcLengths = i, i
    }, THREE.Curve.prototype.updateArcLengths = function() {
        this.needsUpdate = !0, this.getLengths()
    }, THREE.Curve.prototype.getUtoTmapping = function(t, e) {
        var r, i = this.getLengths(),
            n = 0,
            a = i.length;
        r = e ? e : t * i[a - 1];
        for (var o, s = 0, h = a - 1; s <= h;)
            if (n = Math.floor(s + (h - s) / 2), o = i[n] - r, o < 0) s = n + 1;
            else {
                if (!(o > 0)) {
                    h = n;
                    break
                }
                h = n - 1
            }
        if (n = h, i[n] == r) {
            var l = n / (a - 1);
            return l
        }
        var c = i[n],
            u = i[n + 1],
            E = u - c,
            f = (r - c) / E,
            l = (n + f) / (a - 1);
        return l
    }, THREE.Curve.prototype.getTangent = function(t) {
        var e = 1e-4,
            r = t - e,
            i = t + e;
        r < 0 && (r = 0), i > 1 && (i = 1);
        var n = this.getPoint(r),
            a = this.getPoint(i),
            o = a.clone().sub(n);
        return o.normalize()
    }, THREE.Curve.prototype.getTangentAt = function(t) {
        var e = this.getUtoTmapping(t);
        return this.getTangent(e)
    }, THREE.Curve.Utils = {
        tangentQuadraticBezier: function(t, e, r, i) {
            return 2 * (1 - t) * (r - e) + 2 * t * (i - r)
        },
        tangentCubicBezier: function(t, e, r, i, n) {
            return -3 * e * (1 - t) * (1 - t) + 3 * r * (1 - t) * (1 - t) - 6 * t * r * (1 - t) + 6 * t * i * (1 - t) - 3 * t * t * i + 3 * t * t * n
        },
        tangentSpline: function(t, e, r, i, n) {
            var a = 6 * t * t - 6 * t,
                o = 3 * t * t - 4 * t + 1,
                s = -6 * t * t + 6 * t,
                h = 3 * t * t - 2 * t;
            return a + o + s + h
        },
        interpolate: function(t, e, r, i, n) {
            var a = .5 * (r - t),
                o = .5 * (i - e),
                s = n * n,
                h = n * s;
            return (2 * e - 2 * r + a + o) * h + (-3 * e + 3 * r - 2 * a - o) * s + a * n + e
        }
    }, THREE.Curve.create = function(t, e) {
        return t.prototype = Object.create(THREE.Curve.prototype), t.prototype.constructor = t, t.prototype.getPoint = e, t
    }, THREE.CurvePath = function() {
        this.curves = [], this.bends = [], this.autoClose = !1
    }, THREE.CurvePath.prototype = Object.create(THREE.Curve.prototype), THREE.CurvePath.prototype.constructor = THREE.CurvePath, THREE.CurvePath.prototype.add = function(t) {
        this.curves.push(t)
    }, THREE.CurvePath.prototype.checkConnection = function() {}, THREE.CurvePath.prototype.closePath = function() {
        var t = this.curves[0].getPoint(0),
            e = this.curves[this.curves.length - 1].getPoint(1);
        t.equals(e) || this.curves.push(new THREE.LineCurve(e, t))
    }, THREE.CurvePath.prototype.getPoint = function(t) {
        for (var e, r, i = t * this.getLength(), n = this.getCurveLengths(), a = 0; a < n.length;) {
            if (n[a] >= i) {
                e = n[a] - i, r = this.curves[a];
                var o = 1 - e / r.getLength();
                return r.getPointAt(o)
            }
            a++
        }
        return null
    }, THREE.CurvePath.prototype.getLength = function() {
        var t = this.getCurveLengths();
        return t[t.length - 1]
    }, THREE.CurvePath.prototype.getCurveLengths = function() {
        if (this.cacheLengths && this.cacheLengths.length == this.curves.length) return this.cacheLengths;
        var t, e = [],
            r = 0,
            i = this.curves.length;
        for (t = 0; t < i; t++) r += this.curves[t].getLength(), e.push(r);
        return this.cacheLengths = e, e
    }, THREE.CurvePath.prototype.getBoundingBox = function() {
        var t, e, r, i, n, a, o = this.getPoints();
        t = e = Number.NEGATIVE_INFINITY, i = n = Number.POSITIVE_INFINITY;
        var s, h, l, c, u = o[0] instanceof THREE.Vector3;
        for (c = u ? new THREE.Vector3 : new THREE.Vector2, h = 0, l = o.length; h < l; h++) s = o[h], s.x > t ? t = s.x : s.x < i && (i = s.x), s.y > e ? e = s.y : s.y < n && (n = s.y), u && (s.z > r ? r = s.z : s.z < a && (a = s.z)), c.add(s);
        var E = {
            minX: i,
            minY: n,
            maxX: t,
            maxY: e
        };
        return u && (E.maxZ = r, E.minZ = a), E
    }, THREE.CurvePath.prototype.createPointsGeometry = function(t) {
        var e = this.getPoints(t, !0);
        return this.createGeometry(e)
    }, THREE.CurvePath.prototype.createSpacedPointsGeometry = function(t) {
        var e = this.getSpacedPoints(t, !0);
        return this.createGeometry(e)
    }, THREE.CurvePath.prototype.createGeometry = function(t) {
        for (var e = new THREE.Geometry, r = 0; r < t.length; r++) e.vertices.push(new THREE.Vector3(t[r].x, t[r].y, t[r].z || 0));
        return e
    }, THREE.CurvePath.prototype.addWrapPath = function(t) {
        this.bends.push(t)
    }, THREE.CurvePath.prototype.getTransformedPoints = function(t, e) {
        var r, i, n = this.getPoints(t);
        for (e || (e = this.bends), r = 0, i = e.length; r < i; r++) n = this.getWrapPoints(n, e[r]);
        return n
    }, THREE.CurvePath.prototype.getTransformedSpacedPoints = function(t, e) {
        var r, i, n = this.getSpacedPoints(t);
        for (e || (e = this.bends), r = 0, i = e.length; r < i; r++) n = this.getWrapPoints(n, e[r]);
        return n
    }, THREE.CurvePath.prototype.getWrapPoints = function(t, e) {
        var r, i, n, a, o, s, h = this.getBoundingBox();
        for (r = 0, i = t.length; r < i; r++) {
            n = t[r], a = n.x, o = n.y, s = a / h.maxX, s = e.getUtoTmapping(s, a);
            var l = e.getPoint(s),
                c = e.getTangent(s);
            c.set(-c.y, c.x).multiplyScalar(o), n.x = l.x + c.x, n.y = l.y + c.y
        }
        return t
    }, THREE.Gyroscope = function() {
        THREE.Object3D.call(this)
    }, THREE.Gyroscope.prototype = Object.create(THREE.Object3D.prototype), THREE.Gyroscope.prototype.constructor = THREE.Gyroscope, THREE.Gyroscope.prototype.updateMatrixWorld = function() {
        var t = new THREE.Vector3,
            e = new THREE.Quaternion,
            r = new THREE.Vector3,
            i = new THREE.Vector3,
            n = new THREE.Quaternion,
            a = new THREE.Vector3;
        return function(o) {
            this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || o) && (this.parent ? (this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorld.decompose(i, n, a), this.matrix.decompose(t, e, r), this.matrixWorld.compose(i, e, a)) : this.matrixWorld.copy(this.matrix), this.matrixWorldNeedsUpdate = !1, o = !0);
            for (var s = 0, h = this.children.length; s < h; s++) this.children[s].updateMatrixWorld(o)
        }
    }(), THREE.Path = function(t) {
        THREE.CurvePath.call(this), this.actions = [], t && this.fromPoints(t)
    }, THREE.Path.prototype = Object.create(THREE.CurvePath.prototype), THREE.Path.prototype.constructor = THREE.Path, THREE.PathActions = {
        MOVE_TO: "moveTo",
        LINE_TO: "lineTo",
        QUADRATIC_CURVE_TO: "quadraticCurveTo",
        BEZIER_CURVE_TO: "bezierCurveTo",
        CSPLINE_THRU: "splineThru",
        ARC: "arc",
        ELLIPSE: "ellipse"
    }, THREE.Path.prototype.fromPoints = function(t) {
        this.moveTo(t[0].x, t[0].y);
        for (var e = 1, r = t.length; e < r; e++) this.lineTo(t[e].x, t[e].y)
    }, THREE.Path.prototype.moveTo = function(t, e) {
        var r = Array.prototype.slice.call(arguments);
        this.actions.push({
            action: THREE.PathActions.MOVE_TO,
            args: r
        })
    }, THREE.Path.prototype.lineTo = function(t, e) {
        var r = Array.prototype.slice.call(arguments),
            i = this.actions[this.actions.length - 1].args,
            n = i[i.length - 2],
            a = i[i.length - 1],
            o = new THREE.LineCurve(new THREE.Vector2(n, a), new THREE.Vector2(t, e));
        this.curves.push(o), this.actions.push({
            action: THREE.PathActions.LINE_TO,
            args: r
        })
    }, THREE.Path.prototype.quadraticCurveTo = function(t, e, r, i) {
        var n = Array.prototype.slice.call(arguments),
            a = this.actions[this.actions.length - 1].args,
            o = a[a.length - 2],
            s = a[a.length - 1],
            h = new THREE.QuadraticBezierCurve(new THREE.Vector2(o, s), new THREE.Vector2(t, e), new THREE.Vector2(r, i));
        this.curves.push(h), this.actions.push({
            action: THREE.PathActions.QUADRATIC_CURVE_TO,
            args: n
        })
    }, THREE.Path.prototype.bezierCurveTo = function(t, e, r, i, n, a) {
        var o = Array.prototype.slice.call(arguments),
            s = this.actions[this.actions.length - 1].args,
            h = s[s.length - 2],
            l = s[s.length - 1],
            c = new THREE.CubicBezierCurve(new THREE.Vector2(h, l), new THREE.Vector2(t, e), new THREE.Vector2(r, i), new THREE.Vector2(n, a));
        this.curves.push(c), this.actions.push({
            action: THREE.PathActions.BEZIER_CURVE_TO,
            args: o
        })
    }, THREE.Path.prototype.splineThru = function(t) {
        var e = Array.prototype.slice.call(arguments),
            r = this.actions[this.actions.length - 1].args,
            i = r[r.length - 2],
            n = r[r.length - 1],
            a = [new THREE.Vector2(i, n)];
        Array.prototype.push.apply(a, t);
        var o = new THREE.SplineCurve(a);
        this.curves.push(o), this.actions.push({
            action: THREE.PathActions.CSPLINE_THRU,
            args: e
        })
    }, THREE.Path.prototype.arc = function(t, e, r, i, n, a) {
        var o = this.actions[this.actions.length - 1].args,
            s = o[o.length - 2],
            h = o[o.length - 1];
        this.absarc(t + s, e + h, r, i, n, a)
    }, THREE.Path.prototype.absarc = function(t, e, r, i, n, a) {
        this.absellipse(t, e, r, r, i, n, a)
    }, THREE.Path.prototype.ellipse = function(t, e, r, i, n, a, o) {
        var s = this.actions[this.actions.length - 1].args,
            h = s[s.length - 2],
            l = s[s.length - 1];
        this.absellipse(t + h, e + l, r, i, n, a, o)
    }, THREE.Path.prototype.absellipse = function(t, e, r, i, n, a, o) {
        var s = Array.prototype.slice.call(arguments),
            h = new THREE.EllipseCurve(t, e, r, i, n, a, o);
        this.curves.push(h);
        var l = h.getPoint(1);
        s.push(l.x), s.push(l.y), this.actions.push({
            action: THREE.PathActions.ELLIPSE,
            args: s
        })
    }, THREE.Path.prototype.getSpacedPoints = function(t, e) {
        t || (t = 40);
        for (var r = [], i = 0; i < t; i++) r.push(this.getPoint(i / t));
        return r
    }, THREE.Path.prototype.getPoints = function(t, e) {
        if (this.useSpacedPoints) return console.log("tata"), this.getSpacedPoints(t, e);
        t = t || 12;
        var r, i, n, a, o, s, h, l, c, u, E, f, p, d, m, T, g, v, R = [];
        for (r = 0, i = this.actions.length; r < i; r++) switch (n = this.actions[r], a = n.action, o = n.args, a) {
            case THREE.PathActions.MOVE_TO:
                R.push(new THREE.Vector2(o[0], o[1]));
                break;
            case THREE.PathActions.LINE_TO:
                R.push(new THREE.Vector2(o[0], o[1]));
                break;
            case THREE.PathActions.QUADRATIC_CURVE_TO:
                for (s = o[2], h = o[3], u = o[0], E = o[1], R.length > 0 ? (d = R[R.length - 1], f = d.x, p = d.y) : (d = this.actions[r - 1].args, f = d[d.length - 2], p = d[d.length - 1]), m = 1; m <= t; m++) T = m / t, g = THREE.Shape.Utils.b2(T, f, u, s), v = THREE.Shape.Utils.b2(T, p, E, h), R.push(new THREE.Vector2(g, v));
                break;
            case THREE.PathActions.BEZIER_CURVE_TO:
                for (s = o[4], h = o[5], u = o[0], E = o[1], l = o[2], c = o[3], R.length > 0 ? (d = R[R.length - 1], f = d.x, p = d.y) : (d = this.actions[r - 1].args, f = d[d.length - 2], p = d[d.length - 1]), m = 1; m <= t; m++) T = m / t, g = THREE.Shape.Utils.b3(T, f, u, l, s), v = THREE.Shape.Utils.b3(T, p, E, c, h), R.push(new THREE.Vector2(g, v));
                break;
            case THREE.PathActions.CSPLINE_THRU:
                d = this.actions[r - 1].args;
                var y = new THREE.Vector2(d[d.length - 2], d[d.length - 1]),
                    H = [y],
                    x = t * o[0].length;
                H = H.concat(o[0]);
                var b = new THREE.SplineCurve(H);
                for (m = 1; m <= x; m++) R.push(b.getPointAt(m / x));
                break;
            case THREE.PathActions.ARC:
                var _, w = o[0],
                    M = o[1],
                    S = o[2],
                    A = o[3],
                    C = o[4],
                    L = !!o[5],
                    P = C - A,
                    F = 2 * t;
                for (m = 1; m <= F; m++) T = m / F, L || (T = 1 - T), _ = A + T * P, g = w + S * Math.cos(_), v = M + S * Math.sin(_), R.push(new THREE.Vector2(g, v));
                break;
            case THREE.PathActions.ELLIPSE:
                var _, w = o[0],
                    M = o[1],
                    U = o[2],
                    B = o[3],
                    A = o[4],
                    C = o[5],
                    L = !!o[6],
                    P = C - A,
                    F = 2 * t;
                for (m = 1; m <= F; m++) T = m / F, L || (T = 1 - T), _ = A + T * P, g = w + U * Math.cos(_), v = M + B * Math.sin(_), R.push(new THREE.Vector2(g, v))
        }
        var D = R[R.length - 1],
            V = 1e-10;
        return Math.abs(D.x - R[0].x) < V && Math.abs(D.y - R[0].y) < V && R.splice(R.length - 1, 1), e && R.push(R[0]), R
    }, THREE.Path.prototype.toShapes = function(t, e) {
        function r(t) {
            var e, r, i, n, a, o = [],
                s = new THREE.Path;
            for (e = 0, r = t.length; e < r; e++) i = t[e], a = i.args, n = i.action, n == THREE.PathActions.MOVE_TO && 0 != s.actions.length && (o.push(s), s = new THREE.Path), s[n].apply(s, a);
            return 0 != s.actions.length && o.push(s), o
        }

        function i(t) {
            for (var e = [], r = 0, i = t.length; r < i; r++) {
                var n = t[r],
                    a = new THREE.Shape;
                a.actions = n.actions, a.curves = n.curves, e.push(a)
            }
            return e
        }

        function n(t, e) {
            for (var r = 1e-10, i = e.length, n = !1, a = i - 1, o = 0; o < i; a = o++) {
                var s = e[a],
                    h = e[o],
                    l = h.x - s.x,
                    c = h.y - s.y;
                if (Math.abs(c) > r) {
                    if (c < 0 && (s = e[o], l = -l, h = e[a], c = -c), t.y < s.y || t.y > h.y) continue;
                    if (t.y == s.y) {
                        if (t.x == s.x) return !0
                    } else {
                        var u = c * (t.x - s.x) - l * (t.y - s.y);
                        if (0 == u) return !0;
                        if (u < 0) continue;
                        n = !n
                    }
                } else {
                    if (t.y != s.y) continue;
                    if (h.x <= t.x && t.x <= s.x || s.x <= t.x && t.x <= h.x) return !0
                }
            }
            return n
        }
        var a = r(this.actions);
        if (0 == a.length) return [];
        if (e === !0) return i(a);
        var o, s, h, l = [];
        if (1 == a.length) return s = a[0], h = new THREE.Shape,
            h.actions = s.actions, h.curves = s.curves, l.push(h), l;
        var c = !THREE.Shape.Utils.isClockWise(a[0].getPoints());
        c = t ? !c : c;
        var u, E = [],
            f = [],
            p = [],
            d = 0;
        f[d] = void 0, p[d] = [];
        var m, T;
        for (m = 0, T = a.length; m < T; m++) s = a[m], u = s.getPoints(), o = THREE.Shape.Utils.isClockWise(u), o = t ? !o : o, o ? (!c && f[d] && d++, f[d] = {
            s: new THREE.Shape,
            p: u
        }, f[d].s.actions = s.actions, f[d].s.curves = s.curves, c && d++, p[d] = []) : p[d].push({
            h: s,
            p: u[0]
        });
        if (!f[0]) return i(a);
        if (f.length > 1) {
            for (var g = !1, v = [], R = 0, y = f.length; R < y; R++) E[R] = [];
            for (var R = 0, y = f.length; R < y; R++)
                for (var H = p[R], x = 0; x < H.length; x++) {
                    for (var b = H[x], _ = !0, w = 0; w < f.length; w++) n(b.p, f[w].p) && (R != w && v.push({
                        froms: R,
                        tos: w,
                        hole: x
                    }), _ ? (_ = !1, E[w].push(b)) : g = !0);
                    _ && E[R].push(b)
                }
            v.length > 0 && (g || (p = E))
        }
        var M, S, A;
        for (m = 0, T = f.length; m < T; m++)
            for (h = f[m].s, l.push(h), M = p[m], S = 0, A = M.length; S < A; S++) h.holes.push(M[S].h);
        return l
    }, THREE.Shape = function() {
        THREE.Path.apply(this, arguments), this.holes = []
    }, THREE.Shape.prototype = Object.create(THREE.Path.prototype), THREE.Shape.prototype.constructor = THREE.Shape, THREE.Shape.prototype.extrude = function(t) {
        var e = new THREE.ExtrudeGeometry(this, t);
        return e
    }, THREE.Shape.prototype.makeGeometry = function(t) {
        var e = new THREE.ShapeGeometry(this, t);
        return e
    }, THREE.Shape.prototype.getPointsHoles = function(t) {
        var e, r = this.holes.length,
            i = [];
        for (e = 0; e < r; e++) i[e] = this.holes[e].getTransformedPoints(t, this.bends);
        return i
    }, THREE.Shape.prototype.getSpacedPointsHoles = function(t) {
        var e, r = this.holes.length,
            i = [];
        for (e = 0; e < r; e++) i[e] = this.holes[e].getTransformedSpacedPoints(t, this.bends);
        return i
    }, THREE.Shape.prototype.extractAllPoints = function(t) {
        return {
            shape: this.getTransformedPoints(t),
            holes: this.getPointsHoles(t)
        }
    }, THREE.Shape.prototype.extractPoints = function(t) {
        return this.useSpacedPoints ? this.extractAllSpacedPoints(t) : this.extractAllPoints(t)
    }, THREE.Shape.prototype.extractAllSpacedPoints = function(t) {
        return {
            shape: this.getTransformedSpacedPoints(t),
            holes: this.getSpacedPointsHoles(t)
        }
    }, THREE.Shape.Utils = {
        triangulateShape: function(t, e) {
            function r(t, e, r) {
                return t.x != e.x ? t.x < e.x ? t.x <= r.x && r.x <= e.x : e.x <= r.x && r.x <= t.x : t.y < e.y ? t.y <= r.y && r.y <= e.y : e.y <= r.y && r.y <= t.y
            }

            function i(t, e, i, n, a) {
                var o = 1e-10,
                    s = e.x - t.x,
                    h = e.y - t.y,
                    l = n.x - i.x,
                    c = n.y - i.y,
                    u = t.x - i.x,
                    E = t.y - i.y,
                    f = h * l - s * c,
                    p = h * u - s * E;
                if (Math.abs(f) > o) {
                    var d;
                    if (f > 0) {
                        if (p < 0 || p > f) return [];
                        if (d = c * u - l * E, d < 0 || d > f) return []
                    } else {
                        if (p > 0 || p < f) return [];
                        if (d = c * u - l * E, d > 0 || d < f) return []
                    }
                    if (0 == d) return !a || 0 != p && p != f ? [t] : [];
                    if (d == f) return !a || 0 != p && p != f ? [e] : [];
                    if (0 == p) return [i];
                    if (p == f) return [n];
                    var m = d / f;
                    return [{
                        x: t.x + m * s,
                        y: t.y + m * h
                    }]
                }
                if (0 != p || c * u != l * E) return [];
                var T = 0 == s && 0 == h,
                    g = 0 == l && 0 == c;
                if (T && g) return t.x != i.x || t.y != i.y ? [] : [t];
                if (T) return r(i, n, t) ? [t] : [];
                if (g) return r(t, e, i) ? [i] : [];
                var v, R, y, H, x, b, _, w;
                return 0 != s ? (t.x < e.x ? (v = t, y = t.x, R = e, H = e.x) : (v = e, y = e.x, R = t, H = t.x), i.x < n.x ? (x = i, _ = i.x, b = n, w = n.x) : (x = n, _ = n.x, b = i, w = i.x)) : (t.y < e.y ? (v = t, y = t.y, R = e, H = e.y) : (v = e, y = e.y, R = t, H = t.y), i.y < n.y ? (x = i, _ = i.y, b = n, w = n.y) : (x = n, _ = n.y, b = i, w = i.y)), y <= _ ? H < _ ? [] : H == _ ? a ? [] : [x] : H <= w ? [x, R] : [x, b] : y > w ? [] : y == w ? a ? [] : [v] : H <= w ? [v, R] : [v, b]
            }

            function n(t, e, r, i) {
                var n = 1e-10,
                    a = e.x - t.x,
                    o = e.y - t.y,
                    s = r.x - t.x,
                    h = r.y - t.y,
                    l = i.x - t.x,
                    c = i.y - t.y,
                    u = a * h - o * s,
                    E = a * c - o * l;
                if (Math.abs(u) > n) {
                    var f = l * h - c * s;
                    return u > 0 ? E >= 0 && f >= 0 : E >= 0 || f >= 0
                }
                return E > 0
            }

            function a(t, e) {
                function r(t, e) {
                    var r = g.length - 1,
                        i = t - 1;
                    i < 0 && (i = r);
                    var a = t + 1;
                    a > r && (a = 0);
                    var o = n(g[t], g[i], g[a], s[e]);
                    if (!o) return !1;
                    var h = s.length - 1,
                        l = e - 1;
                    l < 0 && (l = h);
                    var c = e + 1;
                    return c > h && (c = 0), o = n(s[e], s[l], s[c], g[t]), !!o
                }

                function a(t, e) {
                    var r, n, a;
                    for (r = 0; r < g.length; r++)
                        if (n = r + 1, n %= g.length, a = i(t, e, g[r], g[n], !0), a.length > 0) return !0;
                    return !1
                }

                function o(t, r) {
                    var n, a, o, s, h;
                    for (n = 0; n < v.length; n++)
                        for (a = e[v[n]], o = 0; o < a.length; o++)
                            if (s = o + 1, s %= a.length, h = i(t, r, a[o], a[s], !0), h.length > 0) return !0;
                    return !1
                }
                for (var s, h, l, c, u, E, f, p, d, m, T, g = t.concat(), v = [], R = [], y = 0, H = e.length; y < H; y++) v.push(y);
                for (var x = 0, b = 2 * v.length; v.length > 0;) {
                    if (b--, b < 0) {
                        console.log("Infinite Loop! Holes left:" + v.length + ", Probably Hole outside Shape!");
                        break
                    }
                    for (l = x; l < g.length; l++) {
                        c = g[l], h = -1;
                        for (var y = 0; y < v.length; y++)
                            if (E = v[y], f = c.x + ":" + c.y + ":" + E, void 0 === R[f]) {
                                s = e[E];
                                for (var _ = 0; _ < s.length; _++)
                                    if (u = s[_], r(l, _) && !a(c, u) && !o(c, u)) {
                                        h = _, v.splice(y, 1), p = g.slice(0, l + 1), d = g.slice(l), m = s.slice(h), T = s.slice(0, h + 1), g = p.concat(m).concat(T).concat(d), x = l;
                                        break
                                    }
                                if (h >= 0) break;
                                R[f] = !0
                            }
                        if (h >= 0) break
                    }
                }
                return g
            }
            for (var o, s, h, l, c, u, E = {}, f = t.concat(), p = 0, d = e.length; p < d; p++) Array.prototype.push.apply(f, e[p]);
            for (o = 0, s = f.length; o < s; o++) c = f[o].x + ":" + f[o].y, void 0 !== E[c] && THREE.warn("THREE.Shape: Duplicate point", c), E[c] = o;
            var m = a(t, e),
                T = THREE.FontUtils.Triangulate(m, !1);
            for (o = 0, s = T.length; o < s; o++)
                for (l = T[o], h = 0; h < 3; h++) c = l[h].x + ":" + l[h].y, u = E[c], void 0 !== u && (l[h] = u);
            return T.concat()
        },
        isClockWise: function(t) {
            return THREE.FontUtils.Triangulate.area(t) < 0
        },
        b2p0: function(t, e) {
            var r = 1 - t;
            return r * r * e
        },
        b2p1: function(t, e) {
            return 2 * (1 - t) * t * e
        },
        b2p2: function(t, e) {
            return t * t * e
        },
        b2: function(t, e, r, i) {
            return this.b2p0(t, e) + this.b2p1(t, r) + this.b2p2(t, i)
        },
        b3p0: function(t, e) {
            var r = 1 - t;
            return r * r * r * e
        },
        b3p1: function(t, e) {
            var r = 1 - t;
            return 3 * r * r * t * e
        },
        b3p2: function(t, e) {
            var r = 1 - t;
            return 3 * r * t * t * e
        },
        b3p3: function(t, e) {
            return t * t * t * e
        },
        b3: function(t, e, r, i, n) {
            return this.b3p0(t, e) + this.b3p1(t, r) + this.b3p2(t, i) + this.b3p3(t, n)
        }
    }, THREE.LineCurve = function(t, e) {
        this.v1 = t, this.v2 = e
    }, THREE.LineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.LineCurve.prototype.constructor = THREE.LineCurve, THREE.LineCurve.prototype.getPoint = function(t) {
        var e = this.v2.clone().sub(this.v1);
        return e.multiplyScalar(t).add(this.v1), e
    }, THREE.LineCurve.prototype.getPointAt = function(t) {
        return this.getPoint(t)
    }, THREE.LineCurve.prototype.getTangent = function(t) {
        var e = this.v2.clone().sub(this.v1);
        return e.normalize()
    }, THREE.QuadraticBezierCurve = function(t, e, r) {
        this.v0 = t, this.v1 = e, this.v2 = r
    }, THREE.QuadraticBezierCurve.prototype = Object.create(THREE.Curve.prototype), THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve, THREE.QuadraticBezierCurve.prototype.getPoint = function(t) {
        var e = new THREE.Vector2;
        return e.x = THREE.Shape.Utils.b2(t, this.v0.x, this.v1.x, this.v2.x), e.y = THREE.Shape.Utils.b2(t, this.v0.y, this.v1.y, this.v2.y), e
    }, THREE.QuadraticBezierCurve.prototype.getTangent = function(t) {
        var e = new THREE.Vector2;
        return e.x = THREE.Curve.Utils.tangentQuadraticBezier(t, this.v0.x, this.v1.x, this.v2.x), e.y = THREE.Curve.Utils.tangentQuadraticBezier(t, this.v0.y, this.v1.y, this.v2.y), e.normalize()
    }, THREE.CubicBezierCurve = function(t, e, r, i) {
        this.v0 = t, this.v1 = e, this.v2 = r, this.v3 = i
    }, THREE.CubicBezierCurve.prototype = Object.create(THREE.Curve.prototype), THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve, THREE.CubicBezierCurve.prototype.getPoint = function(t) {
        var e, r;
        return e = THREE.Shape.Utils.b3(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x), r = THREE.Shape.Utils.b3(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y), new THREE.Vector2(e, r)
    }, THREE.CubicBezierCurve.prototype.getTangent = function(t) {
        var e, r;
        e = THREE.Curve.Utils.tangentCubicBezier(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x), r = THREE.Curve.Utils.tangentCubicBezier(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y);
        var i = new THREE.Vector2(e, r);
        return i.normalize(), i
    }, THREE.SplineCurve = function(t) {
        this.points = void 0 == t ? [] : t
    }, THREE.SplineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.SplineCurve.prototype.constructor = THREE.SplineCurve, THREE.SplineCurve.prototype.getPoint = function(t) {
        var e = this.points,
            r = (e.length - 1) * t,
            i = Math.floor(r),
            n = r - i,
            a = e[0 == i ? i : i - 1],
            o = e[i],
            s = e[i > e.length - 2 ? e.length - 1 : i + 1],
            h = e[i > e.length - 3 ? e.length - 1 : i + 2],
            l = new THREE.Vector2;
        return l.x = THREE.Curve.Utils.interpolate(a.x, o.x, s.x, h.x, n), l.y = THREE.Curve.Utils.interpolate(a.y, o.y, s.y, h.y, n), l
    }, THREE.EllipseCurve = function(t, e, r, i, n, a, o) {
        this.aX = t, this.aY = e, this.xRadius = r, this.yRadius = i, this.aStartAngle = n, this.aEndAngle = a, this.aClockwise = o
    }, THREE.EllipseCurve.prototype = Object.create(THREE.Curve.prototype), THREE.EllipseCurve.prototype.constructor = THREE.EllipseCurve, THREE.EllipseCurve.prototype.getPoint = function(t) {
        var e = this.aEndAngle - this.aStartAngle;
        e < 0 && (e += 2 * Math.PI), e > 2 * Math.PI && (e -= 2 * Math.PI);
        var r;
        r = this.aClockwise === !0 ? this.aEndAngle + (1 - t) * (2 * Math.PI - e) : this.aStartAngle + t * e;
        var i = new THREE.Vector2;
        return i.x = this.aX + this.xRadius * Math.cos(r), i.y = this.aY + this.yRadius * Math.sin(r), i
    }, THREE.ArcCurve = function(t, e, r, i, n, a) {
        THREE.EllipseCurve.call(this, t, e, r, r, i, n, a)
    }, THREE.ArcCurve.prototype = Object.create(THREE.EllipseCurve.prototype), THREE.ArcCurve.prototype.constructor = THREE.ArcCurve, THREE.LineCurve3 = THREE.Curve.create(function(t, e) {
        this.v1 = t, this.v2 = e
    }, function(t) {
        var e = new THREE.Vector3;
        return e.subVectors(this.v2, this.v1), e.multiplyScalar(t), e.add(this.v1), e
    }), THREE.QuadraticBezierCurve3 = THREE.Curve.create(function(t, e, r) {
        this.v0 = t, this.v1 = e, this.v2 = r
    }, function(t) {
        var e = new THREE.Vector3;
        return e.x = THREE.Shape.Utils.b2(t, this.v0.x, this.v1.x, this.v2.x), e.y = THREE.Shape.Utils.b2(t, this.v0.y, this.v1.y, this.v2.y), e.z = THREE.Shape.Utils.b2(t, this.v0.z, this.v1.z, this.v2.z), e
    }), THREE.CubicBezierCurve3 = THREE.Curve.create(function(t, e, r, i) {
        this.v0 = t, this.v1 = e, this.v2 = r, this.v3 = i
    }, function(t) {
        var e = new THREE.Vector3;
        return e.x = THREE.Shape.Utils.b3(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x), e.y = THREE.Shape.Utils.b3(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y), e.z = THREE.Shape.Utils.b3(t, this.v0.z, this.v1.z, this.v2.z, this.v3.z), e
    }), THREE.SplineCurve3 = THREE.Curve.create(function(t) {
        this.points = void 0 == t ? [] : t
    }, function(t) {
        var e = this.points,
            r = (e.length - 1) * t,
            i = Math.floor(r),
            n = r - i,
            a = e[0 == i ? i : i - 1],
            o = e[i],
            s = e[i > e.length - 2 ? e.length - 1 : i + 1],
            h = e[i > e.length - 3 ? e.length - 1 : i + 2],
            l = new THREE.Vector3;
        return l.x = THREE.Curve.Utils.interpolate(a.x, o.x, s.x, h.x, n), l.y = THREE.Curve.Utils.interpolate(a.y, o.y, s.y, h.y, n), l.z = THREE.Curve.Utils.interpolate(a.z, o.z, s.z, h.z, n), l
    }), THREE.ClosedSplineCurve3 = THREE.Curve.create(function(t) {
        this.points = void 0 == t ? [] : t
    }, function(t) {
        var e = this.points,
            r = (e.length - 0) * t,
            i = Math.floor(r),
            n = r - i;
        i += i > 0 ? 0 : (Math.floor(Math.abs(i) / e.length) + 1) * e.length;
        var a = e[(i - 1) % e.length],
            o = e[i % e.length],
            s = e[(i + 1) % e.length],
            h = e[(i + 2) % e.length],
            l = new THREE.Vector3;
        return l.x = THREE.Curve.Utils.interpolate(a.x, o.x, s.x, h.x, n), l.y = THREE.Curve.Utils.interpolate(a.y, o.y, s.y, h.y, n), l.z = THREE.Curve.Utils.interpolate(a.z, o.z, s.z, h.z, n), l
    }), THREE.AnimationHandler = {
        LINEAR: 0,
        CATMULLROM: 1,
        CATMULLROM_FORWARD: 2,
        add: function() {
            THREE.warn("THREE.AnimationHandler.add() has been deprecated.")
        },
        get: function() {
            THREE.warn("THREE.AnimationHandler.get() has been deprecated.")
        },
        remove: function() {
            THREE.warn("THREE.AnimationHandler.remove() has been deprecated.")
        },
        animations: [],
        init: function(t) {
            if (t.initialized === !0) return t;
            for (var e = 0; e < t.hierarchy.length; e++) {
                for (var r = 0; r < t.hierarchy[e].keys.length; r++)
                    if (t.hierarchy[e].keys[r].time < 0 && (t.hierarchy[e].keys[r].time = 0), void 0 !== t.hierarchy[e].keys[r].rot && !(t.hierarchy[e].keys[r].rot instanceof THREE.Quaternion)) {
                        var i = t.hierarchy[e].keys[r].rot;
                        t.hierarchy[e].keys[r].rot = (new THREE.Quaternion).fromArray(i)
                    }
                if (t.hierarchy[e].keys.length && void 0 !== t.hierarchy[e].keys[0].morphTargets) {
                    for (var n = {}, r = 0; r < t.hierarchy[e].keys.length; r++)
                        for (var a = 0; a < t.hierarchy[e].keys[r].morphTargets.length; a++) {
                            var o = t.hierarchy[e].keys[r].morphTargets[a];
                            n[o] = -1
                        }
                    t.hierarchy[e].usedMorphTargets = n;
                    for (var r = 0; r < t.hierarchy[e].keys.length; r++) {
                        var s = {};
                        for (var o in n) {
                            for (var a = 0; a < t.hierarchy[e].keys[r].morphTargets.length; a++)
                                if (t.hierarchy[e].keys[r].morphTargets[a] === o) {
                                    s[o] = t.hierarchy[e].keys[r].morphTargetsInfluences[a];
                                    break
                                }
                            a === t.hierarchy[e].keys[r].morphTargets.length && (s[o] = 0)
                        }
                        t.hierarchy[e].keys[r].morphTargetsInfluences = s
                    }
                }
                for (var r = 1; r < t.hierarchy[e].keys.length; r++) t.hierarchy[e].keys[r].time === t.hierarchy[e].keys[r - 1].time && (t.hierarchy[e].keys.splice(r, 1), r--);
                for (var r = 0; r < t.hierarchy[e].keys.length; r++) t.hierarchy[e].keys[r].index = r
            }
            return t.initialized = !0, t
        },
        parse: function(t) {
            var e = function(t, r) {
                    r.push(t);
                    for (var i = 0; i < t.children.length; i++) e(t.children[i], r)
                },
                r = [];
            if (t instanceof THREE.SkinnedMesh)
                for (var i = 0; i < t.skeleton.bones.length; i++) r.push(t.skeleton.bones[i]);
            else e(t, r);
            return r
        },
        play: function(t) {
            this.animations.indexOf(t) === -1 && this.animations.push(t)
        },
        stop: function(t) {
            var e = this.animations.indexOf(t);
            e !== -1 && this.animations.splice(e, 1)
        },
        update: function(t) {
            for (var e = 0; e < this.animations.length; e++) this.animations[e].resetBlendWeights();
            for (var e = 0; e < this.animations.length; e++) this.animations[e].update(t)
        }
    }, THREE.Animation = function(t, e) {
        this.root = t, this.data = THREE.AnimationHandler.init(e), this.hierarchy = THREE.AnimationHandler.parse(t), this.currentTime = 0, this.timeScale = 1, this.isPlaying = !1, this.loop = !0, this.weight = 0, this.interpolationType = THREE.AnimationHandler.LINEAR
    }, THREE.Animation.prototype = {
        constructor: THREE.Animation,
        keyTypes: ["pos", "rot", "scl"],
        play: function(t, e) {
            this.currentTime = void 0 !== t ? t : 0, this.weight = void 0 !== e ? e : 1, this.isPlaying = !0, this.reset(), THREE.AnimationHandler.play(this)
        },
        stop: function() {
            this.isPlaying = !1, THREE.AnimationHandler.stop(this)
        },
        reset: function() {
            for (var t = 0, e = this.hierarchy.length; t < e; t++) {
                var r = this.hierarchy[t];
                void 0 === r.animationCache && (r.animationCache = {
                    animations: {},
                    blending: {
                        positionWeight: 0,
                        quaternionWeight: 0,
                        scaleWeight: 0
                    }
                });
                var i = this.data.name,
                    n = r.animationCache.animations,
                    a = n[i];
                void 0 === a && (a = {
                    prevKey: {
                        pos: 0,
                        rot: 0,
                        scl: 0
                    },
                    nextKey: {
                        pos: 0,
                        rot: 0,
                        scl: 0
                    },
                    originalMatrix: r.matrix
                }, n[i] = a);
                for (var o = 0; o < 3; o++) {
                    for (var s = this.keyTypes[o], h = this.data.hierarchy[t].keys[0], l = this.getNextKeyWith(s, t, 1); l.time < this.currentTime && l.index > h.index;) h = l, l = this.getNextKeyWith(s, t, l.index + 1);
                    a.prevKey[s] = h, a.nextKey[s] = l
                }
            }
        },
        resetBlendWeights: function() {
            for (var t = 0, e = this.hierarchy.length; t < e; t++) {
                var r = this.hierarchy[t],
                    i = r.animationCache;
                if (void 0 !== i) {
                    var n = i.blending;
                    n.positionWeight = 0, n.quaternionWeight = 0, n.scaleWeight = 0
                }
            }
        },
        update: function() {
            var t = [],
                e = new THREE.Vector3,
                r = new THREE.Vector3,
                i = new THREE.Quaternion,
                n = function(t, e) {
                    var r, i, n, o, s, h, l, c, u, E = [],
                        f = [];
                    return r = (t.length - 1) * e, i = Math.floor(r), n = r - i, E[0] = 0 === i ? i : i - 1, E[1] = i, E[2] = i > t.length - 2 ? i : i + 1, E[3] = i > t.length - 3 ? i : i + 2, h = t[E[0]], l = t[E[1]], c = t[E[2]], u = t[E[3]], o = n * n, s = n * o, f[0] = a(h[0], l[0], c[0], u[0], n, o, s), f[1] = a(h[1], l[1], c[1], u[1], n, o, s), f[2] = a(h[2], l[2], c[2], u[2], n, o, s), f
                },
                a = function(t, e, r, i, n, a, o) {
                    var s = .5 * (r - t),
                        h = .5 * (i - e);
                    return (2 * (e - r) + s + h) * o + (-3 * (e - r) - 2 * s - h) * a + s * n + e
                };
            return function(a) {
                if (this.isPlaying !== !1 && (this.currentTime += a * this.timeScale, 0 !== this.weight)) {
                    var o = this.data.length;
                    (this.currentTime > o || this.currentTime < 0) && (this.loop ? (this.currentTime %= o, this.currentTime < 0 && (this.currentTime += o), this.reset()) : this.stop());
                    for (var s = 0, h = this.hierarchy.length; s < h; s++)
                        for (var l = this.hierarchy[s], c = l.animationCache.animations[this.data.name], u = l.animationCache.blending, E = 0; E < 3; E++) {
                            var f = this.keyTypes[E],
                                p = c.prevKey[f],
                                d = c.nextKey[f];
                            if (this.timeScale > 0 && d.time <= this.currentTime || this.timeScale < 0 && p.time >= this.currentTime) {
                                for (p = this.data.hierarchy[s].keys[0], d = this.getNextKeyWith(f, s, 1); d.time < this.currentTime && d.index > p.index;) p = d, d = this.getNextKeyWith(f, s, d.index + 1);
                                c.prevKey[f] = p, c.nextKey[f] = d
                            }
                            var m = (this.currentTime - p.time) / (d.time - p.time),
                                T = p[f],
                                g = d[f];
                            if (m < 0 && (m = 0), m > 1 && (m = 1), "pos" === f) {
                                if (this.interpolationType === THREE.AnimationHandler.LINEAR) {
                                    r.x = T[0] + (g[0] - T[0]) * m, r.y = T[1] + (g[1] - T[1]) * m, r.z = T[2] + (g[2] - T[2]) * m;
                                    var v = this.weight / (this.weight + u.positionWeight);
                                    l.position.lerp(r, v), u.positionWeight += this.weight
                                } else if (this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD) {
                                    t[0] = this.getPrevKeyWith("pos", s, p.index - 1).pos, t[1] = T, t[2] = g, t[3] = this.getNextKeyWith("pos", s, d.index + 1).pos, m = .33 * m + .33;
                                    var R = n(t, m),
                                        v = this.weight / (this.weight + u.positionWeight);
                                    u.positionWeight += this.weight;
                                    var y = l.position;
                                    if (y.x = y.x + (R[0] - y.x) * v, y.y = y.y + (R[1] - y.y) * v, y.z = y.z + (R[2] - y.z) * v, this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD) {
                                        var H = n(t, 1.01 * m);
                                        e.set(H[0], H[1], H[2]), e.sub(y), e.y = 0, e.normalize();
                                        var x = Math.atan2(e.x, e.z);
                                        l.rotation.set(0, x, 0)
                                    }
                                }
                            } else if ("rot" === f)
                                if (THREE.Quaternion.slerp(T, g, i, m), 0 === u.quaternionWeight) l.quaternion.copy(i), u.quaternionWeight = this.weight;
                                else {
                                    var v = this.weight / (this.weight + u.quaternionWeight);
                                    THREE.Quaternion.slerp(l.quaternion, i, l.quaternion, v), u.quaternionWeight += this.weight
                                } else if ("scl" === f) {
                                r.x = T[0] + (g[0] - T[0]) * m, r.y = T[1] + (g[1] - T[1]) * m, r.z = T[2] + (g[2] - T[2]) * m;
                                var v = this.weight / (this.weight + u.scaleWeight);
                                l.scale.lerp(r, v), u.scaleWeight += this.weight
                            }
                        }
                    return !0
                }
            }
        }(),
        getNextKeyWith: function(t, e, r) {
            var i = this.data.hierarchy[e].keys;
            for (this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ? r = r < i.length - 1 ? r : i.length - 1 : r %= i.length; r < i.length; r++)
                if (void 0 !== i[r][t]) return i[r];
            return this.data.hierarchy[e].keys[0]
        },
        getPrevKeyWith: function(t, e, r) {
            var i = this.data.hierarchy[e].keys;
            for (r = this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ? r > 0 ? r : 0 : r >= 0 ? r : r + i.length; r >= 0; r--)
                if (void 0 !== i[r][t]) return i[r];
            return this.data.hierarchy[e].keys[i.length - 1]
        }
    }, THREE.KeyFrameAnimation = function(t) {
        this.root = t.node, this.data = THREE.AnimationHandler.init(t), this.hierarchy = THREE.AnimationHandler.parse(this.root), this.currentTime = 0, this.timeScale = .001, this.isPlaying = !1, this.isPaused = !0, this.loop = !0;
        for (var e = 0, r = this.hierarchy.length; e < r; e++) {
            var i = this.data.hierarchy[e].keys,
                n = this.data.hierarchy[e].sids,
                a = this.hierarchy[e];
            if (i.length && n) {
                for (var o = 0; o < n.length; o++) {
                    var s = n[o],
                        h = this.getNextKeyWith(s, e, 0);
                    h && h.apply(s)
                }
                a.matrixAutoUpdate = !1, this.data.hierarchy[e].node.updateMatrix(), a.matrixWorldNeedsUpdate = !0
            }
        }
    }, THREE.KeyFrameAnimation.prototype = {
        constructor: THREE.KeyFrameAnimation,
        play: function(t) {
            if (this.currentTime = void 0 !== t ? t : 0, this.isPlaying === !1) {
                this.isPlaying = !0;
                var e, r, i, n = this.hierarchy.length;
                for (e = 0; e < n; e++) {
                    r = this.hierarchy[e], i = this.data.hierarchy[e], void 0 === i.animationCache && (i.animationCache = {}, i.animationCache.prevKey = null, i.animationCache.nextKey = null, i.animationCache.originalMatrix = r.matrix);
                    var a = this.data.hierarchy[e].keys;
                    a.length && (i.animationCache.prevKey = a[0], i.animationCache.nextKey = a[1], this.startTime = Math.min(a[0].time, this.startTime), this.endTime = Math.max(a[a.length - 1].time, this.endTime))
                }
                this.update(0)
            }
            this.isPaused = !1, THREE.AnimationHandler.play(this)
        },
        stop: function() {
            this.isPlaying = !1, this.isPaused = !1, THREE.AnimationHandler.stop(this);
            for (var t = 0; t < this.data.hierarchy.length; t++) {
                var e = this.hierarchy[t],
                    r = this.data.hierarchy[t];
                if (void 0 !== r.animationCache) {
                    var i = r.animationCache.originalMatrix;
                    i.copy(e.matrix), e.matrix = i, delete r.animationCache
                }
            }
        },
        update: function(t) {
            if (this.isPlaying !== !1) {
                this.currentTime += t * this.timeScale;
                var e = this.data.length;
                this.loop === !0 && this.currentTime > e && (this.currentTime %= e), this.currentTime = Math.min(this.currentTime, e);
                for (var r = 0, i = this.hierarchy.length; r < i; r++) {
                    var n = this.hierarchy[r],
                        a = this.data.hierarchy[r],
                        o = a.keys,
                        s = a.animationCache;
                    if (o.length) {
                        var h = s.prevKey,
                            l = s.nextKey;
                        if (l.time <= this.currentTime) {
                            for (; l.time < this.currentTime && l.index > h.index;) h = l, l = o[h.index + 1];
                            s.prevKey = h, s.nextKey = l
                        }
                        l.time >= this.currentTime ? h.interpolate(l, this.currentTime) : h.interpolate(l, l.time), this.data.hierarchy[r].node.updateMatrix(), n.matrixWorldNeedsUpdate = !0
                    }
                }
            }
        },
        getNextKeyWith: function(t, e, r) {
            var i = this.data.hierarchy[e].keys;
            for (r %= i.length; r < i.length; r++)
                if (i[r].hasTarget(t)) return i[r];
            return i[0]
        },
        getPrevKeyWith: function(t, e, r) {
            var i = this.data.hierarchy[e].keys;
            for (r = r >= 0 ? r : r + i.length; r >= 0; r--)
                if (i[r].hasTarget(t)) return i[r];
            return i[i.length - 1]
        }
    }, THREE.MorphAnimation = function(t) {
        this.mesh = t, this.frames = t.morphTargetInfluences.length, this.currentTime = 0, this.duration = 1e3, this.loop = !0, this.lastFrame = 0, this.currentFrame = 0, this.isPlaying = !1
    }, THREE.MorphAnimation.prototype = {
        constructor: THREE.MorphAnimation,
        play: function() {
            this.isPlaying = !0
        },
        pause: function() {
            this.isPlaying = !1
        },
        update: function(t) {
            if (this.isPlaying !== !1) {
                this.currentTime += t, this.loop === !0 && this.currentTime > this.duration && (this.currentTime %= this.duration), this.currentTime = Math.min(this.currentTime, this.duration);
                var e = this.duration / this.frames,
                    r = Math.floor(this.currentTime / e),
                    i = this.mesh.morphTargetInfluences;
                r != this.currentFrame && (i[this.lastFrame] = 0, i[this.currentFrame] = 1, i[r] = 0, this.lastFrame = this.currentFrame, this.currentFrame = r), i[r] = this.currentTime % e / e, i[this.lastFrame] = 1 - i[r]
            }
        }
    }, THREE.BoxGeometry = function(t, e, r, i, n, a) {
        function o(t, e, r, i, n, a, o, h) {
            var l, c, u, E = s.widthSegments,
                f = s.heightSegments,
                p = n / 2,
                d = a / 2,
                m = s.vertices.length;
            "x" === t && "y" === e || "y" === t && "x" === e ? l = "z" : "x" === t && "z" === e || "z" === t && "x" === e ? (l = "y", f = s.depthSegments) : ("z" === t && "y" === e || "y" === t && "z" === e) && (l = "x", E = s.depthSegments);
            var T = E + 1,
                g = f + 1,
                v = n / E,
                R = a / f,
                y = new THREE.Vector3;
            for (y[l] = o > 0 ? 1 : -1, u = 0; u < g; u++)
                for (c = 0; c < T; c++) {
                    var H = new THREE.Vector3;
                    H[t] = (c * v - p) * r, H[e] = (u * R - d) * i, H[l] = o, s.vertices.push(H)
                }
            for (u = 0; u < f; u++)
                for (c = 0; c < E; c++) {
                    var x = c + T * u,
                        b = c + T * (u + 1),
                        _ = c + 1 + T * (u + 1),
                        w = c + 1 + T * u,
                        M = new THREE.Vector2(c / E, 1 - u / f),
                        S = new THREE.Vector2(c / E, 1 - (u + 1) / f),
                        A = new THREE.Vector2((c + 1) / E, 1 - (u + 1) / f),
                        C = new THREE.Vector2((c + 1) / E, 1 - u / f),
                        L = new THREE.Face3(x + m, b + m, w + m);
                    L.normal.copy(y), L.vertexNormals.push(y.clone(), y.clone(), y.clone()), L.materialIndex = h, s.faces.push(L), s.faceVertexUvs[0].push([M, S, C]), L = new THREE.Face3(b + m, _ + m, w + m), L.normal.copy(y), L.vertexNormals.push(y.clone(), y.clone(), y.clone()), L.materialIndex = h, s.faces.push(L), s.faceVertexUvs[0].push([S.clone(), A, C.clone()])
                }
        }
        THREE.Geometry.call(this), this.type = "BoxGeometry", this.parameters = {
            width: t,
            height: e,
            depth: r,
            widthSegments: i,
            heightSegments: n,
            depthSegments: a
        }, this.widthSegments = i || 1, this.heightSegments = n || 1, this.depthSegments = a || 1;
        var s = this,
            h = t / 2,
            l = e / 2,
            c = r / 2;
        o("z", "y", -1, -1, r, e, h, 0), o("z", "y", 1, -1, r, e, -h, 1), o("x", "z", 1, 1, t, r, l, 2), o("x", "z", 1, -1, t, r, -l, 3), o("x", "y", 1, -1, t, e, c, 4), o("x", "y", -1, -1, t, e, -c, 5), this.mergeVertices()
    }, THREE.BoxGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.BoxGeometry.prototype.constructor = THREE.BoxGeometry, THREE.CircleGeometry = function(t, e, r, i) {
        THREE.Geometry.call(this), this.type = "CircleGeometry", this.parameters = {
            radius: t,
            segments: e,
            thetaStart: r,
            thetaLength: i
        }, t = t || 50, e = void 0 !== e ? Math.max(3, e) : 8, r = void 0 !== r ? r : 0, i = void 0 !== i ? i : 2 * Math.PI;
        var n, a = [],
            o = new THREE.Vector3,
            s = new THREE.Vector2(.5, .5);
        for (this.vertices.push(o), a.push(s), n = 0; n <= e; n++) {
            var h = new THREE.Vector3,
                l = r + n / e * i;
            h.x = t * Math.cos(l), h.y = t * Math.sin(l), this.vertices.push(h), a.push(new THREE.Vector2((h.x / t + 1) / 2, (h.y / t + 1) / 2))
        }
        var c = new THREE.Vector3(0, 0, 1);
        for (n = 1; n <= e; n++) this.faces.push(new THREE.Face3(n, n + 1, 0, [c.clone(), c.clone(), c.clone()])), this.faceVertexUvs[0].push([a[n].clone(), a[n + 1].clone(), s.clone()]);
        this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, t)
    }, THREE.CircleGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CircleGeometry.prototype.constructor = THREE.CircleGeometry, THREE.CubeGeometry = function(t, e, r, i, n, a) {
        return THREE.warn("THREE.CubeGeometry has been renamed to THREE.BoxGeometry."), new THREE.BoxGeometry(t, e, r, i, n, a)
    }, THREE.CylinderGeometry = function(t, e, r, i, n, a, o, s) {
        THREE.Geometry.call(this), this.type = "CylinderGeometry", this.parameters = {
            radiusTop: t,
            radiusBottom: e,
            height: r,
            radialSegments: i,
            heightSegments: n,
            openEnded: a,
            thetaStart: o,
            thetaLength: s
        }, t = void 0 !== t ? t : 20, e = void 0 !== e ? e : 20, r = void 0 !== r ? r : 100, i = i || 8, n = n || 1, a = void 0 !== a && a, o = void 0 !== o ? o : 0, s = void 0 !== s ? s : 2 * Math.PI;
        var h, l, c = r / 2,
            u = [],
            E = [];
        for (l = 0; l <= n; l++) {
            var f = [],
                p = [],
                d = l / n,
                m = d * (e - t) + t;
            for (h = 0; h <= i; h++) {
                var T = h / i,
                    g = new THREE.Vector3;
                g.x = m * Math.sin(T * s + o), g.y = -d * r + c, g.z = m * Math.cos(T * s + o), this.vertices.push(g), f.push(this.vertices.length - 1), p.push(new THREE.Vector2(T, 1 - d))
            }
            u.push(f), E.push(p)
        }
        var v, R, y = (e - t) / r;
        for (h = 0; h < i; h++)
            for (0 !== t ? (v = this.vertices[u[0][h]].clone(), R = this.vertices[u[0][h + 1]].clone()) : (v = this.vertices[u[1][h]].clone(), R = this.vertices[u[1][h + 1]].clone()), v.setY(Math.sqrt(v.x * v.x + v.z * v.z) * y).normalize(), R.setY(Math.sqrt(R.x * R.x + R.z * R.z) * y).normalize(), l = 0; l < n; l++) {
                var H = u[l][h],
                    x = u[l + 1][h],
                    b = u[l + 1][h + 1],
                    _ = u[l][h + 1],
                    w = v.clone(),
                    M = v.clone(),
                    S = R.clone(),
                    A = R.clone(),
                    C = E[l][h].clone(),
                    L = E[l + 1][h].clone(),
                    P = E[l + 1][h + 1].clone(),
                    F = E[l][h + 1].clone();
                this.faces.push(new THREE.Face3(H, x, _, [w, M, A])), this.faceVertexUvs[0].push([C, L, F]), this.faces.push(new THREE.Face3(x, b, _, [M.clone(), S, A.clone()])), this.faceVertexUvs[0].push([L.clone(), P, F.clone()])
            }
        if (a === !1 && t > 0)
            for (this.vertices.push(new THREE.Vector3(0, c, 0)), h = 0; h < i; h++) {
                var H = u[0][h],
                    x = u[0][h + 1],
                    b = this.vertices.length - 1,
                    w = new THREE.Vector3(0, 1, 0),
                    M = new THREE.Vector3(0, 1, 0),
                    S = new THREE.Vector3(0, 1, 0),
                    C = E[0][h].clone(),
                    L = E[0][h + 1].clone(),
                    P = new THREE.Vector2(L.x, 0);
                this.faces.push(new THREE.Face3(H, x, b, [w, M, S])), this.faceVertexUvs[0].push([C, L, P])
            }
        if (a === !1 && e > 0)
            for (this.vertices.push(new THREE.Vector3(0, (-c), 0)), h = 0; h < i; h++) {
                var H = u[n][h + 1],
                    x = u[n][h],
                    b = this.vertices.length - 1,
                    w = new THREE.Vector3(0, (-1), 0),
                    M = new THREE.Vector3(0, (-1), 0),
                    S = new THREE.Vector3(0, (-1), 0),
                    C = E[n][h + 1].clone(),
                    L = E[n][h].clone(),
                    P = new THREE.Vector2(L.x, 1);
                this.faces.push(new THREE.Face3(H, x, b, [w, M, S])), this.faceVertexUvs[0].push([C, L, P])
            }
        this.computeFaceNormals()
    }, THREE.CylinderGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry, THREE.ExtrudeGeometry = function(t, e) {
        return "undefined" == typeof t ? void(t = []) : (THREE.Geometry.call(this), this.type = "ExtrudeGeometry", t = t instanceof Array ? t : [t], this.addShapeList(t, e), void this.computeFaceNormals())
    }, THREE.ExtrudeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry, THREE.ExtrudeGeometry.prototype.addShapeList = function(t, e) {
        for (var r = t.length, i = 0; i < r; i++) {
            var n = t[i];
            this.addShape(n, e)
        }
    }, THREE.ExtrudeGeometry.prototype.addShape = function(t, e) {
        function r(t, e, r) {
            return e || THREE.error("THREE.ExtrudeGeometry: vec does not exist"), e.clone().multiplyScalar(r).add(t)
        }

        function i(t, e, r) {
            var i, n, a = 1e-10,
                o = 1,
                s = t.x - e.x,
                h = t.y - e.y,
                l = r.x - t.x,
                c = r.y - t.y,
                u = s * s + h * h,
                E = s * c - h * l;
            if (Math.abs(E) > a) {
                var f = Math.sqrt(u),
                    p = Math.sqrt(l * l + c * c),
                    d = e.x - h / f,
                    m = e.y + s / f,
                    T = r.x - c / p,
                    g = r.y + l / p,
                    v = ((T - d) * c - (g - m) * l) / (s * c - h * l);
                i = d + s * v - t.x, n = m + h * v - t.y;
                var R = i * i + n * n;
                if (R <= 2) return new THREE.Vector2(i, n);
                o = Math.sqrt(R / 2)
            } else {
                var y = !1;
                s > a ? l > a && (y = !0) : s < -a ? l < -a && (y = !0) : Math.sign(h) == Math.sign(c) && (y = !0), y ? (i = -h, n = s, o = Math.sqrt(u)) : (i = s, n = h, o = Math.sqrt(u / 2))
            }
            return new THREE.Vector2(i / o, n / o)
        }

        function n() {
            if (v) {
                var t = 0,
                    e = W * t;
                for (q = 0; q < j; q++) I = D[q], h(I[2] + e, I[1] + e, I[0] + e);
                for (t = y + 2 * g, e = W * t, q = 0; q < j; q++) I = D[q], h(I[0] + e, I[1] + e, I[2] + e)
            } else {
                for (q = 0; q < j; q++) I = D[q], h(I[2], I[1], I[0]);
                for (q = 0; q < j; q++) I = D[q], h(I[0] + W * y, I[1] + W * y, I[2] + W * y)
            }
        }

        function a() {
            var t = 0;
            for (o(V, t), t += V.length, S = 0, A = U.length; S < A; S++) M = U[S], o(M, t), t += M.length
        }

        function o(t, e) {
            var r, i;
            for (q = t.length; --q >= 0;) {
                r = q, i = q - 1, i < 0 && (i = t.length - 1);
                var n = 0,
                    a = y + 2 * g;
                for (n = 0; n < a; n++) {
                    var o = W * n,
                        s = W * (n + 1),
                        h = e + r + o,
                        c = e + i + o,
                        u = e + i + s,
                        E = e + r + s;
                    l(h, c, u, E, t, n, a, r, i)
                }
            }
        }

        function s(t, e, r) {
            C.vertices.push(new THREE.Vector3(t, e, r))
        }

        function h(t, e, r) {
            t += L, e += L, r += L, C.faces.push(new THREE.Face3(t, e, r, null, null, b));
            var i = w.generateTopUV(C, t, e, r);
            C.faceVertexUvs[0].push(i)
        }

        function l(t, e, r, i, n, a, o, s, h) {
            t += L, e += L, r += L, i += L, C.faces.push(new THREE.Face3(t, e, i, null, null, _)), C.faces.push(new THREE.Face3(e, r, i, null, null, _));
            var l = w.generateSideWallUV(C, t, e, r, i);
            C.faceVertexUvs[0].push([l[0], l[1], l[3]]), C.faceVertexUvs[0].push([l[1], l[2], l[3]])
        }
        var c, u, E, f, p, d = void 0 !== e.amount ? e.amount : 100,
            m = void 0 !== e.bevelThickness ? e.bevelThickness : 6,
            T = void 0 !== e.bevelSize ? e.bevelSize : m - 2,
            g = void 0 !== e.bevelSegments ? e.bevelSegments : 3,
            v = void 0 === e.bevelEnabled || e.bevelEnabled,
            R = void 0 !== e.curveSegments ? e.curveSegments : 12,
            y = void 0 !== e.steps ? e.steps : 1,
            H = e.extrudePath,
            x = !1,
            b = e.material,
            _ = e.extrudeMaterial,
            w = void 0 !== e.UVGenerator ? e.UVGenerator : THREE.ExtrudeGeometry.WorldUVGenerator;
        H && (c = H.getSpacedPoints(y), x = !0, v = !1, u = void 0 !== e.frames ? e.frames : new THREE.TubeGeometry.FrenetFrames(H, y, (!1)), E = new THREE.Vector3, f = new THREE.Vector3, p = new THREE.Vector3), v || (g = 0, m = 0, T = 0);
        var M, S, A, C = this,
            L = this.vertices.length,
            P = t.extractPoints(R),
            F = P.shape,
            U = P.holes,
            B = !THREE.Shape.Utils.isClockWise(F);
        if (B) {
            for (F = F.reverse(), S = 0, A = U.length; S < A; S++) M = U[S], THREE.Shape.Utils.isClockWise(M) && (U[S] = M.reverse());
            B = !1
        }
        var D = THREE.Shape.Utils.triangulateShape(F, U),
            V = F;
        for (S = 0, A = U.length; S < A; S++) M = U[S], F = F.concat(M);
        for (var z, k, N, O, G, I, W = F.length, j = D.length, X = [], q = 0, Y = V.length, K = Y - 1, Q = q + 1; q < Y; q++, K++, Q++) K === Y && (K = 0), Q === Y && (Q = 0), X[q] = i(V[q], V[K], V[Q]);
        var Z, J = [],
            $ = X.concat();
        for (S = 0, A = U.length; S < A; S++) {
            for (M = U[S], Z = [], q = 0, Y = M.length, K = Y - 1, Q = q + 1; q < Y; q++, K++, Q++) K === Y && (K = 0), Q === Y && (Q = 0), Z[q] = i(M[q], M[K], M[Q]);
            J.push(Z), $ = $.concat(Z)
        }
        for (z = 0; z < g; z++) {
            for (N = z / g, O = m * (1 - N), k = T * Math.sin(N * Math.PI / 2), q = 0, Y = V.length; q < Y; q++) G = r(V[q], X[q], k), s(G.x, G.y, -O);
            for (S = 0, A = U.length; S < A; S++)
                for (M = U[S], Z = J[S], q = 0, Y = M.length; q < Y; q++) G = r(M[q], Z[q], k), s(G.x, G.y, -O)
        }
        for (k = T, q = 0; q < W; q++) G = v ? r(F[q], $[q], k) : F[q], x ? (f.copy(u.normals[0]).multiplyScalar(G.x), E.copy(u.binormals[0]).multiplyScalar(G.y), p.copy(c[0]).add(f).add(E), s(p.x, p.y, p.z)) : s(G.x, G.y, 0);
        var tt;
        for (tt = 1; tt <= y; tt++)
            for (q = 0; q < W; q++) G = v ? r(F[q], $[q], k) : F[q], x ? (f.copy(u.normals[tt]).multiplyScalar(G.x), E.copy(u.binormals[tt]).multiplyScalar(G.y), p.copy(c[tt]).add(f).add(E), s(p.x, p.y, p.z)) : s(G.x, G.y, d / y * tt);
        for (z = g - 1; z >= 0; z--) {
            for (N = z / g, O = m * (1 - N), k = T * Math.sin(N * Math.PI / 2), q = 0, Y = V.length; q < Y; q++) G = r(V[q], X[q], k), s(G.x, G.y, d + O);
            for (S = 0, A = U.length; S < A; S++)
                for (M = U[S], Z = J[S], q = 0, Y = M.length; q < Y; q++) G = r(M[q], Z[q], k), x ? s(G.x, G.y + c[y - 1].y, c[y - 1].x + O) : s(G.x, G.y, d + O)
        }
        n(), a()
    }, THREE.ExtrudeGeometry.WorldUVGenerator = {
        generateTopUV: function(t, e, r, i) {
            var n = t.vertices,
                a = n[e],
                o = n[r],
                s = n[i];
            return [new THREE.Vector2(a.x, a.y), new THREE.Vector2(o.x, o.y), new THREE.Vector2(s.x, s.y)]
        },
        generateSideWallUV: function(t, e, r, i, n) {
            var a = t.vertices,
                o = a[e],
                s = a[r],
                h = a[i],
                l = a[n];
            return Math.abs(o.y - s.y) < .01 ? [new THREE.Vector2(o.x, 1 - o.z), new THREE.Vector2(s.x, 1 - s.z), new THREE.Vector2(h.x, 1 - h.z), new THREE.Vector2(l.x, 1 - l.z)] : [new THREE.Vector2(o.y, 1 - o.z), new THREE.Vector2(s.y, 1 - s.z), new THREE.Vector2(h.y, 1 - h.z), new THREE.Vector2(l.y, 1 - l.z)]
        }
    }, THREE.ShapeGeometry = function(t, e) {
        THREE.Geometry.call(this), this.type = "ShapeGeometry", t instanceof Array == !1 && (t = [t]), this.addShapeList(t, e), this.computeFaceNormals()
    }, THREE.ShapeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ShapeGeometry.prototype.constructor = THREE.ShapeGeometry, THREE.ShapeGeometry.prototype.addShapeList = function(t, e) {
        for (var r = 0, i = t.length; r < i; r++) this.addShape(t[r], e);
        return this
    }, THREE.ShapeGeometry.prototype.addShape = function(t, e) {
        void 0 === e && (e = {});
        var r, i, n, a = void 0 !== e.curveSegments ? e.curveSegments : 12,
            o = e.material,
            s = void 0 === e.UVGenerator ? THREE.ExtrudeGeometry.WorldUVGenerator : e.UVGenerator,
            h = this.vertices.length,
            l = t.extractPoints(a),
            c = l.shape,
            u = l.holes,
            E = !THREE.Shape.Utils.isClockWise(c);
        if (E) {
            for (c = c.reverse(), r = 0, i = u.length; r < i; r++) n = u[r], THREE.Shape.Utils.isClockWise(n) && (u[r] = n.reverse());
            E = !1
        }
        var f = THREE.Shape.Utils.triangulateShape(c, u);
        for (r = 0, i = u.length; r < i; r++) n = u[r], c = c.concat(n);
        var p, d, m = c.length,
            T = f.length;
        for (r = 0; r < m; r++) p = c[r], this.vertices.push(new THREE.Vector3(p.x, p.y, 0));
        for (r = 0; r < T; r++) {
            d = f[r];
            var g = d[0] + h,
                v = d[1] + h,
                R = d[2] + h;
            this.faces.push(new THREE.Face3(g, v, R, null, null, o)), this.faceVertexUvs[0].push(s.generateTopUV(this, g, v, R))
        }
    }, THREE.LatheGeometry = function(t, e, r, i) {
        THREE.Geometry.call(this), this.type = "LatheGeometry", this.parameters = {
            points: t,
            segments: e,
            phiStart: r,
            phiLength: i
        }, e = e || 12, r = r || 0, i = i || 2 * Math.PI;
        for (var n = 1 / (t.length - 1), a = 1 / e, o = 0, s = e; o <= s; o++)
            for (var h = r + o * a * i, l = Math.cos(h), c = Math.sin(h), u = 0, E = t.length; u < E; u++) {
                var f = t[u],
                    p = new THREE.Vector3;
                p.x = l * f.x - c * f.y, p.y = c * f.x + l * f.y, p.z = f.z, this.vertices.push(p)
            }
        for (var d = t.length, o = 0, s = e; o < s; o++)
            for (var u = 0, E = t.length - 1; u < E; u++) {
                var m = u + d * o,
                    T = m,
                    g = m + d,
                    l = m + 1 + d,
                    v = m + 1,
                    R = o * a,
                    y = u * n,
                    H = R + a,
                    x = y + n;
                this.faces.push(new THREE.Face3(T, g, v)), this.faceVertexUvs[0].push([new THREE.Vector2(R, y), new THREE.Vector2(H, y), new THREE.Vector2(R, x)]), this.faces.push(new THREE.Face3(g, l, v)), this.faceVertexUvs[0].push([new THREE.Vector2(H, y), new THREE.Vector2(H, x), new THREE.Vector2(R, x)])
            }
        this.mergeVertices(), this.computeFaceNormals(), this.computeVertexNormals();
    }, THREE.LatheGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry, THREE.PlaneGeometry = function(t, e, r, i) {
        console.info("THREE.PlaneGeometry: Consider using THREE.PlaneBufferGeometry for lower memory footprint."), THREE.Geometry.call(this), this.type = "PlaneGeometry", this.parameters = {
            width: t,
            height: e,
            widthSegments: r,
            heightSegments: i
        }, this.fromBufferGeometry(new THREE.PlaneBufferGeometry(t, e, r, i))
    }, THREE.PlaneGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.PlaneGeometry.prototype.constructor = THREE.PlaneGeometry, THREE.PlaneBufferGeometry = function(t, e, r, i) {
        THREE.BufferGeometry.call(this), this.type = "PlaneBufferGeometry", this.parameters = {
            width: t,
            height: e,
            widthSegments: r,
            heightSegments: i
        };
        for (var n = t / 2, a = e / 2, o = r || 1, s = i || 1, h = o + 1, l = s + 1, c = t / o, u = e / s, E = new Float32Array(h * l * 3), f = new Float32Array(h * l * 3), p = new Float32Array(h * l * 2), d = 0, m = 0, T = 0; T < l; T++)
            for (var g = T * u - a, v = 0; v < h; v++) {
                var R = v * c - n;
                E[d] = R, E[d + 1] = -g, f[d + 2] = 1, p[m] = v / o, p[m + 1] = 1 - T / s, d += 3, m += 2
            }
        d = 0;
        for (var y = new(E.length / 3 > 65535 ? Uint32Array : Uint16Array)(o * s * 6), T = 0; T < s; T++)
            for (var v = 0; v < o; v++) {
                var H = v + h * T,
                    x = v + h * (T + 1),
                    b = v + 1 + h * (T + 1),
                    _ = v + 1 + h * T;
                y[d] = H, y[d + 1] = x, y[d + 2] = _, y[d + 3] = x, y[d + 4] = b, y[d + 5] = _, d += 6
            }
        this.addAttribute("index", new THREE.BufferAttribute(y, 1)), this.addAttribute("position", new THREE.BufferAttribute(E, 3)), this.addAttribute("normal", new THREE.BufferAttribute(f, 3)), this.addAttribute("uv", new THREE.BufferAttribute(p, 2))
    }, THREE.PlaneBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.PlaneBufferGeometry.prototype.constructor = THREE.PlaneBufferGeometry, THREE.RingGeometry = function(t, e, r, i, n, a) {
        THREE.Geometry.call(this), this.type = "RingGeometry", this.parameters = {
            innerRadius: t,
            outerRadius: e,
            thetaSegments: r,
            phiSegments: i,
            thetaStart: n,
            thetaLength: a
        }, t = t || 0, e = e || 50, n = void 0 !== n ? n : 0, a = void 0 !== a ? a : 2 * Math.PI, r = void 0 !== r ? Math.max(3, r) : 8, i = void 0 !== i ? Math.max(1, i) : 8;
        var o, s, h = [],
            l = t,
            c = (e - t) / i;
        for (o = 0; o < i + 1; o++) {
            for (s = 0; s < r + 1; s++) {
                var u = new THREE.Vector3,
                    E = n + s / r * a;
                u.x = l * Math.cos(E), u.y = l * Math.sin(E), this.vertices.push(u), h.push(new THREE.Vector2((u.x / e + 1) / 2, (u.y / e + 1) / 2))
            }
            l += c
        }
        var f = new THREE.Vector3(0, 0, 1);
        for (o = 0; o < i; o++) {
            var p = o * (r + 1);
            for (s = 0; s < r; s++) {
                var E = s + p,
                    d = E,
                    m = E + r + 1,
                    T = E + r + 2;
                this.faces.push(new THREE.Face3(d, m, T, [f.clone(), f.clone(), f.clone()])), this.faceVertexUvs[0].push([h[d].clone(), h[m].clone(), h[T].clone()]), d = E, m = E + r + 2, T = E + 1, this.faces.push(new THREE.Face3(d, m, T, [f.clone(), f.clone(), f.clone()])), this.faceVertexUvs[0].push([h[d].clone(), h[m].clone(), h[T].clone()])
            }
        }
        this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, l)
    }, THREE.RingGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.RingGeometry.prototype.constructor = THREE.RingGeometry, THREE.SphereGeometry = function(t, e, r, i, n, a, o) {
        THREE.Geometry.call(this), this.type = "SphereGeometry", this.parameters = {
            radius: t,
            widthSegments: e,
            heightSegments: r,
            phiStart: i,
            phiLength: n,
            thetaStart: a,
            thetaLength: o
        }, t = t || 50, e = Math.max(3, Math.floor(e) || 8), r = Math.max(2, Math.floor(r) || 6), i = void 0 !== i ? i : 0, n = void 0 !== n ? n : 2 * Math.PI, a = void 0 !== a ? a : 0, o = void 0 !== o ? o : Math.PI;
        var s, h, l = [],
            c = [];
        for (h = 0; h <= r; h++) {
            var u = [],
                E = [];
            for (s = 0; s <= e; s++) {
                var f = s / e,
                    p = h / r,
                    d = new THREE.Vector3;
                d.x = -t * Math.cos(i + f * n) * Math.sin(a + p * o), d.y = t * Math.cos(a + p * o), d.z = t * Math.sin(i + f * n) * Math.sin(a + p * o), this.vertices.push(d), u.push(this.vertices.length - 1), E.push(new THREE.Vector2(f, 1 - p))
            }
            l.push(u), c.push(E)
        }
        for (h = 0; h < r; h++)
            for (s = 0; s < e; s++) {
                var m = l[h][s + 1],
                    T = l[h][s],
                    g = l[h + 1][s],
                    v = l[h + 1][s + 1],
                    R = this.vertices[m].clone().normalize(),
                    y = this.vertices[T].clone().normalize(),
                    H = this.vertices[g].clone().normalize(),
                    x = this.vertices[v].clone().normalize(),
                    b = c[h][s + 1].clone(),
                    _ = c[h][s].clone(),
                    w = c[h + 1][s].clone(),
                    M = c[h + 1][s + 1].clone();
                Math.abs(this.vertices[m].y) === t ? (b.x = (b.x + _.x) / 2, this.faces.push(new THREE.Face3(m, g, v, [R, H, x])), this.faceVertexUvs[0].push([b, w, M])) : Math.abs(this.vertices[g].y) === t ? (w.x = (w.x + M.x) / 2, this.faces.push(new THREE.Face3(m, T, g, [R, y, H])), this.faceVertexUvs[0].push([b, _, w])) : (this.faces.push(new THREE.Face3(m, T, v, [R, y, x])), this.faceVertexUvs[0].push([b, _, M]), this.faces.push(new THREE.Face3(T, g, v, [y.clone(), H, x.clone()])), this.faceVertexUvs[0].push([_.clone(), w, M.clone()]))
            }
        this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, t)
    }, THREE.SphereGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.SphereGeometry.prototype.constructor = THREE.SphereGeometry, THREE.TextGeometry = function(t, e) {
        e = e || {};
        var r = THREE.FontUtils.generateShapes(t, e);
        e.amount = void 0 !== e.height ? e.height : 50, void 0 === e.bevelThickness && (e.bevelThickness = 10), void 0 === e.bevelSize && (e.bevelSize = 8), void 0 === e.bevelEnabled && (e.bevelEnabled = !1), THREE.ExtrudeGeometry.call(this, r, e), this.type = "TextGeometry"
    }, THREE.TextGeometry.prototype = Object.create(THREE.ExtrudeGeometry.prototype), THREE.TextGeometry.prototype.constructor = THREE.TextGeometry, THREE.TorusGeometry = function(t, e, r, i, n) {
        THREE.Geometry.call(this), this.type = "TorusGeometry", this.parameters = {
            radius: t,
            tube: e,
            radialSegments: r,
            tubularSegments: i,
            arc: n
        }, t = t || 100, e = e || 40, r = r || 8, i = i || 6, n = n || 2 * Math.PI;
        for (var a = new THREE.Vector3, o = [], s = [], h = 0; h <= r; h++)
            for (var l = 0; l <= i; l++) {
                var c = l / i * n,
                    u = h / r * Math.PI * 2;
                a.x = t * Math.cos(c), a.y = t * Math.sin(c);
                var E = new THREE.Vector3;
                E.x = (t + e * Math.cos(u)) * Math.cos(c), E.y = (t + e * Math.cos(u)) * Math.sin(c), E.z = e * Math.sin(u), this.vertices.push(E), o.push(new THREE.Vector2(l / i, h / r)), s.push(E.clone().sub(a).normalize())
            }
        for (var h = 1; h <= r; h++)
            for (var l = 1; l <= i; l++) {
                var f = (i + 1) * h + l - 1,
                    p = (i + 1) * (h - 1) + l - 1,
                    d = (i + 1) * (h - 1) + l,
                    m = (i + 1) * h + l,
                    T = new THREE.Face3(f, p, m, [s[f].clone(), s[p].clone(), s[m].clone()]);
                this.faces.push(T), this.faceVertexUvs[0].push([o[f].clone(), o[p].clone(), o[m].clone()]), T = new THREE.Face3(p, d, m, [s[p].clone(), s[d].clone(), s[m].clone()]), this.faces.push(T), this.faceVertexUvs[0].push([o[p].clone(), o[d].clone(), o[m].clone()])
            }
        this.computeFaceNormals()
    }, THREE.TorusGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry, THREE.TorusKnotGeometry = function(t, e, r, i, n, a, o) {
        function s(t, e, r, i, n) {
            var a = Math.cos(t),
                o = Math.sin(t),
                s = e / r * t,
                h = Math.cos(s),
                l = i * (2 + h) * .5 * a,
                c = i * (2 + h) * o * .5,
                u = n * i * Math.sin(s) * .5;
            return new THREE.Vector3(l, c, u)
        }
        THREE.Geometry.call(this), this.type = "TorusKnotGeometry", this.parameters = {
            radius: t,
            tube: e,
            radialSegments: r,
            tubularSegments: i,
            p: n,
            q: a,
            heightScale: o
        }, t = t || 100, e = e || 40, r = r || 64, i = i || 8, n = n || 2, a = a || 3, o = o || 1;
        for (var h = new Array(r), l = new THREE.Vector3, c = new THREE.Vector3, u = new THREE.Vector3, E = 0; E < r; ++E) {
            h[E] = new Array(i);
            var f = E / r * 2 * n * Math.PI,
                p = s(f, a, n, t, o),
                d = s(f + .01, a, n, t, o);
            l.subVectors(d, p), c.addVectors(d, p), u.crossVectors(l, c), c.crossVectors(u, l), u.normalize(), c.normalize();
            for (var m = 0; m < i; ++m) {
                var T = m / i * 2 * Math.PI,
                    g = -e * Math.cos(T),
                    v = e * Math.sin(T),
                    R = new THREE.Vector3;
                R.x = p.x + g * c.x + v * u.x, R.y = p.y + g * c.y + v * u.y, R.z = p.z + g * c.z + v * u.z, h[E][m] = this.vertices.push(R) - 1
            }
        }
        for (var E = 0; E < r; ++E)
            for (var m = 0; m < i; ++m) {
                var y = (E + 1) % r,
                    H = (m + 1) % i,
                    x = h[E][m],
                    b = h[y][m],
                    _ = h[y][H],
                    w = h[E][H],
                    M = new THREE.Vector2(E / r, m / i),
                    S = new THREE.Vector2((E + 1) / r, m / i),
                    A = new THREE.Vector2((E + 1) / r, (m + 1) / i),
                    C = new THREE.Vector2(E / r, (m + 1) / i);
                this.faces.push(new THREE.Face3(x, b, w)), this.faceVertexUvs[0].push([M, S, C]), this.faces.push(new THREE.Face3(b, _, w)), this.faceVertexUvs[0].push([S.clone(), A, C.clone()])
            }
        this.computeFaceNormals(), this.computeVertexNormals()
    }, THREE.TorusKnotGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry, THREE.TubeGeometry = function(t, e, r, i, n, a) {
        function o(t, e, r) {
            return A.vertices.push(new THREE.Vector3(t, e, r)) - 1
        }
        THREE.Geometry.call(this), this.type = "TubeGeometry", this.parameters = {
            path: t,
            segments: e,
            radius: r,
            radialSegments: i,
            closed: n
        }, e = e || 64, r = r || 1, i = i || 8, n = n || !1, a = a || THREE.TubeGeometry.NoTaper;
        var s, h, l, c, u, E, f, p, d, m, T, g, v, R, y, H, x, b, _, w, M, S = [],
            A = this,
            C = e + 1,
            L = new THREE.Vector3,
            P = new THREE.TubeGeometry.FrenetFrames(t, e, n),
            F = P.tangents,
            U = P.normals,
            B = P.binormals;
        for (this.tangents = F, this.normals = U, this.binormals = B, m = 0; m < C; m++)
            for (S[m] = [], c = m / (C - 1), d = t.getPointAt(c), s = F[m], h = U[m], l = B[m], E = r * a(c), T = 0; T < i; T++) u = T / i * 2 * Math.PI, f = -E * Math.cos(u), p = E * Math.sin(u), L.copy(d), L.x += f * h.x + p * l.x, L.y += f * h.y + p * l.y, L.z += f * h.z + p * l.z, S[m][T] = o(L.x, L.y, L.z);
        for (m = 0; m < e; m++)
            for (T = 0; T < i; T++) g = n ? (m + 1) % e : m + 1, v = (T + 1) % i, R = S[m][T], y = S[g][T], H = S[g][v], x = S[m][v], b = new THREE.Vector2(m / e, T / i), _ = new THREE.Vector2((m + 1) / e, T / i), w = new THREE.Vector2((m + 1) / e, (T + 1) / i), M = new THREE.Vector2(m / e, (T + 1) / i), this.faces.push(new THREE.Face3(R, y, x)), this.faceVertexUvs[0].push([b, _, M]), this.faces.push(new THREE.Face3(y, H, x)), this.faceVertexUvs[0].push([_.clone(), w, M.clone()]);
        this.computeFaceNormals(), this.computeVertexNormals()
    }, THREE.TubeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TubeGeometry.prototype.constructor = THREE.TubeGeometry, THREE.TubeGeometry.NoTaper = function(t) {
        return 1
    }, THREE.TubeGeometry.SinusoidalTaper = function(t) {
        return Math.sin(Math.PI * t)
    }, THREE.TubeGeometry.FrenetFrames = function(t, e, r) {
        function i() {
            f[0] = new THREE.Vector3, p[0] = new THREE.Vector3, a = Number.MAX_VALUE, o = Math.abs(E[0].x), s = Math.abs(E[0].y), h = Math.abs(E[0].z), o <= a && (a = o, u.set(1, 0, 0)), s <= a && (a = s, u.set(0, 1, 0)), h <= a && u.set(0, 0, 1), d.crossVectors(E[0], u).normalize(), f[0].crossVectors(E[0], d), p[0].crossVectors(E[0], f[0])
        }
        var n, a, o, s, h, l, c, u = new THREE.Vector3,
            E = [],
            f = [],
            p = [],
            d = new THREE.Vector3,
            m = new THREE.Matrix4,
            T = e + 1,
            g = 1e-4;
        for (this.tangents = E, this.normals = f, this.binormals = p, l = 0; l < T; l++) c = l / (T - 1), E[l] = t.getTangentAt(c), E[l].normalize();
        for (i(), l = 1; l < T; l++) f[l] = f[l - 1].clone(), p[l] = p[l - 1].clone(), d.crossVectors(E[l - 1], E[l]), d.length() > g && (d.normalize(), n = Math.acos(THREE.Math.clamp(E[l - 1].dot(E[l]), -1, 1)), f[l].applyMatrix4(m.makeRotationAxis(d, n))), p[l].crossVectors(E[l], f[l]);
        if (r)
            for (n = Math.acos(THREE.Math.clamp(f[0].dot(f[T - 1]), -1, 1)), n /= T - 1, E[0].dot(d.crossVectors(f[0], f[T - 1])) > 0 && (n = -n), l = 1; l < T; l++) f[l].applyMatrix4(m.makeRotationAxis(E[l], n * l)), p[l].crossVectors(E[l], f[l])
    }, THREE.PolyhedronGeometry = function(t, e, r, i) {
        function n(t) {
            var e = t.normalize().clone();
            e.index = c.vertices.push(e) - 1;
            var r = s(t) / 2 / Math.PI + .5,
                i = h(t) / Math.PI + .5;
            return e.uv = new THREE.Vector2(r, 1 - i), e
        }

        function a(t, e, r) {
            var i = new THREE.Face3(t.index, e.index, r.index, [t.clone(), e.clone(), r.clone()]);
            c.faces.push(i), v.copy(t).add(e).add(r).divideScalar(3);
            var n = s(v);
            c.faceVertexUvs[0].push([l(t.uv, t, n), l(e.uv, e, n), l(r.uv, r, n)])
        }

        function o(t, e) {
            for (var r = Math.pow(2, e), i = n(c.vertices[t.a]), o = n(c.vertices[t.b]), s = n(c.vertices[t.c]), h = [], l = 0; l <= r; l++) {
                h[l] = [];
                for (var u = n(i.clone().lerp(s, l / r)), E = n(o.clone().lerp(s, l / r)), f = r - l, p = 0; p <= f; p++) 0 == p && l == r ? h[l][p] = u : h[l][p] = n(u.clone().lerp(E, p / f))
            }
            for (var l = 0; l < r; l++)
                for (var p = 0; p < 2 * (r - l) - 1; p++) {
                    var d = Math.floor(p / 2);
                    p % 2 == 0 ? a(h[l][d + 1], h[l + 1][d], h[l][d]) : a(h[l][d + 1], h[l + 1][d + 1], h[l + 1][d])
                }
        }

        function s(t) {
            return Math.atan2(t.z, -t.x)
        }

        function h(t) {
            return Math.atan2(-t.y, Math.sqrt(t.x * t.x + t.z * t.z))
        }

        function l(t, e, r) {
            return r < 0 && 1 === t.x && (t = new THREE.Vector2(t.x - 1, t.y)), 0 === e.x && 0 === e.z && (t = new THREE.Vector2(r / 2 / Math.PI + .5, t.y)), t.clone()
        }
        THREE.Geometry.call(this), this.type = "PolyhedronGeometry", this.parameters = {
            vertices: t,
            indices: e,
            radius: r,
            detail: i
        }, r = r || 1, i = i || 0;
        for (var c = this, u = 0, E = t.length; u < E; u += 3) n(new THREE.Vector3(t[u], t[u + 1], t[u + 2]));
        for (var f = this.vertices, p = [], u = 0, d = 0, E = e.length; u < E; u += 3, d++) {
            var m = f[e[u]],
                T = f[e[u + 1]],
                g = f[e[u + 2]];
            p[d] = new THREE.Face3(m.index, T.index, g.index, [m.clone(), T.clone(), g.clone()])
        }
        for (var v = new THREE.Vector3, u = 0, E = p.length; u < E; u++) o(p[u], i);
        for (var u = 0, E = this.faceVertexUvs[0].length; u < E; u++) {
            var R = this.faceVertexUvs[0][u],
                y = R[0].x,
                H = R[1].x,
                x = R[2].x,
                b = Math.max(y, Math.max(H, x)),
                _ = Math.min(y, Math.min(H, x));
            b > .9 && _ < .1 && (y < .2 && (R[0].x += 1), H < .2 && (R[1].x += 1), x < .2 && (R[2].x += 1))
        }
        for (var u = 0, E = this.vertices.length; u < E; u++) this.vertices[u].multiplyScalar(r);
        this.mergeVertices(), this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, r)
    }, THREE.PolyhedronGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.PolyhedronGeometry.prototype.constructor = THREE.PolyhedronGeometry, THREE.DodecahedronGeometry = function(t, e) {
        this.parameters = {
            radius: t,
            detail: e
        };
        var r = (1 + Math.sqrt(5)) / 2,
            i = 1 / r,
            n = [-1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 0, -i, -r, 0, -i, r, 0, i, -r, 0, i, r, -i, -r, 0, -i, r, 0, i, -r, 0, i, r, 0, -r, 0, -i, r, 0, -i, -r, 0, i, r, 0, i],
            a = [3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9];
        THREE.PolyhedronGeometry.call(this, n, a, t, e)
    }, THREE.DodecahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.DodecahedronGeometry.prototype.constructor = THREE.DodecahedronGeometry, THREE.IcosahedronGeometry = function(t, e) {
        var r = (1 + Math.sqrt(5)) / 2,
            i = [-1, r, 0, 1, r, 0, -1, -r, 0, 1, -r, 0, 0, -1, r, 0, 1, r, 0, -1, -r, 0, 1, -r, r, 0, -1, r, 0, 1, -r, 0, -1, -r, 0, 1],
            n = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
        THREE.PolyhedronGeometry.call(this, i, n, t, e), this.type = "IcosahedronGeometry", this.parameters = {
            radius: t,
            detail: e
        }
    }, THREE.IcosahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry, THREE.OctahedronGeometry = function(t, e) {
        this.parameters = {
            radius: t,
            detail: e
        };
        var r = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1],
            i = [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2];
        THREE.PolyhedronGeometry.call(this, r, i, t, e), this.type = "OctahedronGeometry", this.parameters = {
            radius: t,
            detail: e
        }
    }, THREE.OctahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry, THREE.TetrahedronGeometry = function(t, e) {
        var r = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1],
            i = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];
        THREE.PolyhedronGeometry.call(this, r, i, t, e), this.type = "TetrahedronGeometry", this.parameters = {
            radius: t,
            detail: e
        }
    }, THREE.TetrahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TetrahedronGeometry.prototype.constructor = THREE.TetrahedronGeometry, THREE.ParametricGeometry = function(t, e, r) {
        THREE.Geometry.call(this), this.type = "ParametricGeometry", this.parameters = {
            func: t,
            slices: e,
            stacks: r
        };
        var i, n, a, o, s, h = this.vertices,
            l = this.faces,
            c = this.faceVertexUvs[0],
            u = e + 1;
        for (i = 0; i <= r; i++)
            for (s = i / r, n = 0; n <= e; n++) o = n / e, a = t(o, s), h.push(a);
        var E, f, p, d, m, T, g, v;
        for (i = 0; i < r; i++)
            for (n = 0; n < e; n++) E = i * u + n, f = i * u + n + 1, p = (i + 1) * u + n + 1, d = (i + 1) * u + n, m = new THREE.Vector2(n / e, i / r), T = new THREE.Vector2((n + 1) / e, i / r), g = new THREE.Vector2((n + 1) / e, (i + 1) / r), v = new THREE.Vector2(n / e, (i + 1) / r), l.push(new THREE.Face3(E, f, d)), c.push([m, T, v]), l.push(new THREE.Face3(f, p, d)), c.push([T.clone(), g, v.clone()]);
        this.computeFaceNormals(), this.computeVertexNormals()
    }, THREE.ParametricGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ParametricGeometry.prototype.constructor = THREE.ParametricGeometry, THREE.AxisHelper = function(t) {
        t = t || 1;
        var e = new Float32Array([0, 0, 0, t, 0, 0, 0, 0, 0, 0, t, 0, 0, 0, 0, 0, 0, t]),
            r = new Float32Array([1, 0, 0, 1, .6, 0, 0, 1, 0, .6, 1, 0, 0, 0, 1, 0, .6, 1]),
            i = new THREE.BufferGeometry;
        i.addAttribute("position", new THREE.BufferAttribute(e, 3)), i.addAttribute("color", new THREE.BufferAttribute(r, 3));
        var n = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors
        });
        THREE.Line.call(this, i, n, THREE.LinePieces)
    }, THREE.AxisHelper.prototype = Object.create(THREE.Line.prototype), THREE.AxisHelper.prototype.constructor = THREE.AxisHelper, THREE.ArrowHelper = function() {
        var t = new THREE.Geometry;
        t.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
        var e = new THREE.CylinderGeometry(0, .5, 1, 5, 1);
        return e.applyMatrix((new THREE.Matrix4).makeTranslation(0, -.5, 0)),
            function(r, i, n, a, o, s) {
                THREE.Object3D.call(this), void 0 === a && (a = 16776960), void 0 === n && (n = 1), void 0 === o && (o = .2 * n), void 0 === s && (s = .2 * o), this.position.copy(i), this.line = new THREE.Line(t, new THREE.LineBasicMaterial({
                    color: a
                })), this.line.matrixAutoUpdate = !1, this.add(this.line), this.cone = new THREE.Mesh(e, new THREE.MeshBasicMaterial({
                    color: a
                })), this.cone.matrixAutoUpdate = !1, this.add(this.cone), this.setDirection(r), this.setLength(n, o, s)
            }
    }(), THREE.ArrowHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper, THREE.ArrowHelper.prototype.setDirection = function() {
        var t, e = new THREE.Vector3;
        return function(r) {
            r.y > .99999 ? this.quaternion.set(0, 0, 0, 1) : r.y < -.99999 ? this.quaternion.set(1, 0, 0, 0) : (e.set(r.z, 0, -r.x).normalize(), t = Math.acos(r.y), this.quaternion.setFromAxisAngle(e, t))
        }
    }(), THREE.ArrowHelper.prototype.setLength = function(t, e, r) {
        void 0 === e && (e = .2 * t), void 0 === r && (r = .2 * e), this.line.scale.set(1, t - e, 1), this.line.updateMatrix(), this.cone.scale.set(r, e, r), this.cone.position.y = t, this.cone.updateMatrix()
    }, THREE.ArrowHelper.prototype.setColor = function(t) {
        this.line.material.color.set(t), this.cone.material.color.set(t)
    }, THREE.BoxHelper = function(t) {
        var e = new THREE.BufferGeometry;
        e.addAttribute("position", new THREE.BufferAttribute(new Float32Array(72), 3)), THREE.Line.call(this, e, new THREE.LineBasicMaterial({
            color: 16776960
        }), THREE.LinePieces), void 0 !== t && this.update(t)
    }, THREE.BoxHelper.prototype = Object.create(THREE.Line.prototype), THREE.BoxHelper.prototype.constructor = THREE.BoxHelper, THREE.BoxHelper.prototype.update = function(t) {
        var e = t.geometry;
        null === e.boundingBox && e.computeBoundingBox();
        var r = e.boundingBox.min,
            i = e.boundingBox.max,
            n = this.geometry.attributes.position.array;
        n[0] = i.x, n[1] = i.y, n[2] = i.z, n[3] = r.x, n[4] = i.y, n[5] = i.z, n[6] = r.x, n[7] = i.y, n[8] = i.z, n[9] = r.x, n[10] = r.y, n[11] = i.z, n[12] = r.x, n[13] = r.y, n[14] = i.z, n[15] = i.x, n[16] = r.y, n[17] = i.z, n[18] = i.x, n[19] = r.y, n[20] = i.z, n[21] = i.x, n[22] = i.y, n[23] = i.z, n[24] = i.x, n[25] = i.y, n[26] = r.z, n[27] = r.x, n[28] = i.y, n[29] = r.z, n[30] = r.x, n[31] = i.y, n[32] = r.z, n[33] = r.x, n[34] = r.y, n[35] = r.z, n[36] = r.x, n[37] = r.y, n[38] = r.z, n[39] = i.x, n[40] = r.y, n[41] = r.z, n[42] = i.x, n[43] = r.y, n[44] = r.z, n[45] = i.x, n[46] = i.y, n[47] = r.z, n[48] = i.x, n[49] = i.y, n[50] = i.z, n[51] = i.x, n[52] = i.y, n[53] = r.z, n[54] = r.x, n[55] = i.y, n[56] = i.z, n[57] = r.x, n[58] = i.y, n[59] = r.z, n[60] = r.x, n[61] = r.y, n[62] = i.z, n[63] = r.x, n[64] = r.y, n[65] = r.z, n[66] = i.x, n[67] = r.y, n[68] = i.z, n[69] = i.x, n[70] = r.y, n[71] = r.z, this.geometry.attributes.position.needsUpdate = !0, this.geometry.computeBoundingSphere(), this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1
    }, THREE.BoundingBoxHelper = function(t, e) {
        var r = void 0 !== e ? e : 8947848;
        this.object = t, this.box = new THREE.Box3, THREE.Mesh.call(this, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
            color: r,
            wireframe: !0
        }))
    }, THREE.BoundingBoxHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.BoundingBoxHelper.prototype.constructor = THREE.BoundingBoxHelper, THREE.BoundingBoxHelper.prototype.update = function() {
        this.box.setFromObject(this.object), this.box.size(this.scale), this.box.center(this.position)
    }, THREE.CameraHelper = function(t) {
        function e(t, e, i) {
            r(t, i), r(e, i)
        }

        function r(t, e) {
            i.vertices.push(new THREE.Vector3), i.colors.push(new THREE.Color(e)), void 0 === a[t] && (a[t] = []), a[t].push(i.vertices.length - 1)
        }
        var i = new THREE.Geometry,
            n = new THREE.LineBasicMaterial({
                color: 16777215,
                vertexColors: THREE.FaceColors
            }),
            a = {},
            o = 16755200,
            s = 16711680,
            h = 43775,
            l = 16777215,
            c = 3355443;
        e("n1", "n2", o), e("n2", "n4", o), e("n4", "n3", o), e("n3", "n1", o), e("f1", "f2", o), e("f2", "f4", o), e("f4", "f3", o), e("f3", "f1", o), e("n1", "f1", o), e("n2", "f2", o), e("n3", "f3", o), e("n4", "f4", o), e("p", "n1", s), e("p", "n2", s), e("p", "n3", s), e("p", "n4", s), e("u1", "u2", h), e("u2", "u3", h), e("u3", "u1", h), e("c", "t", l), e("p", "c", c), e("cn1", "cn2", c), e("cn3", "cn4", c), e("cf1", "cf2", c), e("cf3", "cf4", c), THREE.Line.call(this, i, n, THREE.LinePieces), this.camera = t, this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1, this.pointMap = a, this.update()
    }, THREE.CameraHelper.prototype = Object.create(THREE.Line.prototype), THREE.CameraHelper.prototype.constructor = THREE.CameraHelper, THREE.CameraHelper.prototype.update = function() {
        var t, e, r = new THREE.Vector3,
            i = new THREE.Camera,
            n = function(n, a, o, s) {
                r.set(a, o, s).unproject(i);
                var h = e[n];
                if (void 0 !== h)
                    for (var l = 0, c = h.length; l < c; l++) t.vertices[h[l]].copy(r)
            };
        return function() {
            t = this.geometry, e = this.pointMap;
            var r = 1,
                a = 1;
            i.projectionMatrix.copy(this.camera.projectionMatrix), n("c", 0, 0, -1), n("t", 0, 0, 1), n("n1", -r, -a, -1), n("n2", r, -a, -1), n("n3", -r, a, -1), n("n4", r, a, -1), n("f1", -r, -a, 1), n("f2", r, -a, 1), n("f3", -r, a, 1), n("f4", r, a, 1), n("u1", .7 * r, 1.1 * a, -1), n("u2", .7 * -r, 1.1 * a, -1), n("u3", 0, 2 * a, -1), n("cf1", -r, 0, 1), n("cf2", r, 0, 1), n("cf3", 0, -a, 1), n("cf4", 0, a, 1), n("cn1", -r, 0, -1), n("cn2", r, 0, -1), n("cn3", 0, -a, -1), n("cn4", 0, a, -1), t.verticesNeedUpdate = !0
        }
    }(), THREE.DirectionalLightHelper = function(t, e) {
        THREE.Object3D.call(this), this.light = t, this.light.updateMatrixWorld(), this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1, e = e || 1;
        var r = new THREE.Geometry;
        r.vertices.push(new THREE.Vector3((-e), e, 0), new THREE.Vector3(e, e, 0), new THREE.Vector3(e, (-e), 0), new THREE.Vector3((-e), (-e), 0), new THREE.Vector3((-e), e, 0));
        var i = new THREE.LineBasicMaterial({
            fog: !1
        });
        i.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.lightPlane = new THREE.Line(r, i), this.add(this.lightPlane), r = new THREE.Geometry, r.vertices.push(new THREE.Vector3, new THREE.Vector3), i = new THREE.LineBasicMaterial({
            fog: !1
        }), i.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.targetLine = new THREE.Line(r, i), this.add(this.targetLine), this.update()
    }, THREE.DirectionalLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.DirectionalLightHelper.prototype.constructor = THREE.DirectionalLightHelper, THREE.DirectionalLightHelper.prototype.dispose = function() {
        this.lightPlane.geometry.dispose(), this.lightPlane.material.dispose(), this.targetLine.geometry.dispose(), this.targetLine.material.dispose()
    }, THREE.DirectionalLightHelper.prototype.update = function() {
        var t = new THREE.Vector3,
            e = new THREE.Vector3,
            r = new THREE.Vector3;
        return function() {
            t.setFromMatrixPosition(this.light.matrixWorld), e.setFromMatrixPosition(this.light.target.matrixWorld), r.subVectors(e, t), this.lightPlane.lookAt(r), this.lightPlane.material.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.targetLine.geometry.vertices[1].copy(r), this.targetLine.geometry.verticesNeedUpdate = !0, this.targetLine.material.color.copy(this.lightPlane.material.color)
        }
    }(), THREE.EdgesHelper = function(t, e, r) {
        var i = void 0 !== e ? e : 16777215;
        r = void 0 !== r ? r : 1;
        var n, a = Math.cos(THREE.Math.degToRad(r)),
            o = [0, 0],
            s = {},
            h = function(t, e) {
                return t - e
            },
            l = ["a", "b", "c"],
            c = new THREE.BufferGeometry;
        t.geometry instanceof THREE.BufferGeometry ? (n = new THREE.Geometry, n.fromBufferGeometry(t.geometry)) : n = t.geometry.clone(), n.mergeVertices(), n.computeFaceNormals();
        for (var u = n.vertices, E = n.faces, f = 0, p = 0, d = E.length; p < d; p++)
            for (var m = E[p], T = 0; T < 3; T++) {
                o[0] = m[l[T]], o[1] = m[l[(T + 1) % 3]], o.sort(h);
                var g = o.toString();
                void 0 === s[g] ? (s[g] = {
                    vert1: o[0],
                    vert2: o[1],
                    face1: p,
                    face2: void 0
                }, f++) : s[g].face2 = p
            }
        var v = new Float32Array(2 * f * 3),
            R = 0;
        for (var g in s) {
            var y = s[g];
            if (void 0 === y.face2 || E[y.face1].normal.dot(E[y.face2].normal) <= a) {
                var H = u[y.vert1];
                v[R++] = H.x, v[R++] = H.y, v[R++] = H.z, H = u[y.vert2], v[R++] = H.x, v[R++] = H.y, v[R++] = H.z
            }
        }
        c.addAttribute("position", new THREE.BufferAttribute(v, 3)), THREE.Line.call(this, c, new THREE.LineBasicMaterial({
            color: i
        }), THREE.LinePieces), this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1
    }, THREE.EdgesHelper.prototype = Object.create(THREE.Line.prototype), THREE.EdgesHelper.prototype.constructor = THREE.EdgesHelper, THREE.FaceNormalsHelper = function(t, e, r, i) {
        this.object = t, this.size = void 0 !== e ? e : 1;
        for (var n = void 0 !== r ? r : 16776960, a = void 0 !== i ? i : 1, o = new THREE.Geometry, s = this.object.geometry.faces, h = 0, l = s.length; h < l; h++) o.vertices.push(new THREE.Vector3, new THREE.Vector3);
        THREE.Line.call(this, o, new THREE.LineBasicMaterial({
            color: n,
            linewidth: a
        }), THREE.LinePieces), this.matrixAutoUpdate = !1, this.normalMatrix = new THREE.Matrix3, this.update()
    }, THREE.FaceNormalsHelper.prototype = Object.create(THREE.Line.prototype), THREE.FaceNormalsHelper.prototype.constructor = THREE.FaceNormalsHelper, THREE.FaceNormalsHelper.prototype.update = function() {
        var t = this.geometry.vertices,
            e = this.object,
            r = e.geometry.vertices,
            i = e.geometry.faces,
            n = e.matrixWorld;
        e.updateMatrixWorld(!0), this.normalMatrix.getNormalMatrix(n);
        for (var a = 0, o = 0, s = i.length; a < s; a++, o += 2) {
            var h = i[a];
            t[o].copy(r[h.a]).add(r[h.b]).add(r[h.c]).divideScalar(3).applyMatrix4(n), t[o + 1].copy(h.normal).applyMatrix3(this.normalMatrix).normalize().multiplyScalar(this.size).add(t[o])
        }
        return this.geometry.verticesNeedUpdate = !0, this
    }, THREE.GridHelper = function(t, e) {
        var r = new THREE.Geometry,
            i = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors
            });
        this.color1 = new THREE.Color(4473924), this.color2 = new THREE.Color(8947848);
        for (var n = -t; n <= t; n += e) {
            r.vertices.push(new THREE.Vector3((-t), 0, n), new THREE.Vector3(t, 0, n), new THREE.Vector3(n, 0, (-t)), new THREE.Vector3(n, 0, t));
            var a = 0 === n ? this.color1 : this.color2;
            r.colors.push(a, a, a, a)
        }
        THREE.Line.call(this, r, i, THREE.LinePieces)
    }, THREE.GridHelper.prototype = Object.create(THREE.Line.prototype), THREE.GridHelper.prototype.constructor = THREE.GridHelper, THREE.GridHelper.prototype.setColors = function(t, e) {
        this.color1.set(t), this.color2.set(e), this.geometry.colorsNeedUpdate = !0
    }, THREE.HemisphereLightHelper = function(t, e) {
        THREE.Object3D.call(this), this.light = t, this.light.updateMatrixWorld(), this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1, this.colors = [new THREE.Color, new THREE.Color];
        var r = new THREE.SphereGeometry(e, 4, 2);
        r.applyMatrix((new THREE.Matrix4).makeRotationX(-Math.PI / 2));
        for (var i = 0, n = 8; i < n; i++) r.faces[i].color = this.colors[i < 4 ? 0 : 1];
        var a = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            wireframe: !0
        });
        this.lightSphere = new THREE.Mesh(r, a), this.add(this.lightSphere), this.update()
    }, THREE.HemisphereLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.HemisphereLightHelper.prototype.constructor = THREE.HemisphereLightHelper, THREE.HemisphereLightHelper.prototype.dispose = function() {
        this.lightSphere.geometry.dispose(), this.lightSphere.material.dispose()
    }, THREE.HemisphereLightHelper.prototype.update = function() {
        var t = new THREE.Vector3;
        return function() {
            this.colors[0].copy(this.light.color).multiplyScalar(this.light.intensity), this.colors[1].copy(this.light.groundColor).multiplyScalar(this.light.intensity), this.lightSphere.lookAt(t.setFromMatrixPosition(this.light.matrixWorld).negate()), this.lightSphere.geometry.colorsNeedUpdate = !0
        }
    }(), THREE.PointLightHelper = function(t, e) {
        this.light = t, this.light.updateMatrixWorld();
        var r = new THREE.SphereGeometry(e, 4, 2),
            i = new THREE.MeshBasicMaterial({
                wireframe: !0,
                fog: !1
            });
        i.color.copy(this.light.color).multiplyScalar(this.light.intensity), THREE.Mesh.call(this, r, i), this.matrix = this.light.matrixWorld, this.matrixAutoUpdate = !1
    }, THREE.PointLightHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.PointLightHelper.prototype.constructor = THREE.PointLightHelper, THREE.PointLightHelper.prototype.dispose = function() {
        this.geometry.dispose(), this.material.dispose()
    }, THREE.PointLightHelper.prototype.update = function() {
        this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)
    }, THREE.SkeletonHelper = function(t) {
        this.bones = this.getBoneList(t);
        for (var e = new THREE.Geometry, r = 0; r < this.bones.length; r++) {
            var i = this.bones[r];
            i.parent instanceof THREE.Bone && (e.vertices.push(new THREE.Vector3), e.vertices.push(new THREE.Vector3), e.colors.push(new THREE.Color(0, 0, 1)), e.colors.push(new THREE.Color(0, 1, 0)))
        }
        var n = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            depthTest: !1,
            depthWrite: !1,
            transparent: !0
        });
        THREE.Line.call(this, e, n, THREE.LinePieces), this.root = t, this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1, this.update()
    }, THREE.SkeletonHelper.prototype = Object.create(THREE.Line.prototype), THREE.SkeletonHelper.prototype.constructor = THREE.SkeletonHelper, THREE.SkeletonHelper.prototype.getBoneList = function(t) {
        var e = [];
        t instanceof THREE.Bone && e.push(t);
        for (var r = 0; r < t.children.length; r++) e.push.apply(e, this.getBoneList(t.children[r]));
        return e
    }, THREE.SkeletonHelper.prototype.update = function() {
        for (var t = this.geometry, e = (new THREE.Matrix4).getInverse(this.root.matrixWorld), r = new THREE.Matrix4, i = 0, n = 0; n < this.bones.length; n++) {
            var a = this.bones[n];
            a.parent instanceof THREE.Bone && (r.multiplyMatrices(e, a.matrixWorld), t.vertices[i].setFromMatrixPosition(r), r.multiplyMatrices(e, a.parent.matrixWorld), t.vertices[i + 1].setFromMatrixPosition(r), i += 2)
        }
        t.verticesNeedUpdate = !0, t.computeBoundingSphere()
    }, THREE.SpotLightHelper = function(t) {
        THREE.Object3D.call(this), this.light = t, this.light.updateMatrixWorld(), this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1;
        var e = new THREE.CylinderGeometry(0, 1, 1, 8, 1, (!0));
        e.applyMatrix((new THREE.Matrix4).makeTranslation(0, -.5, 0)), e.applyMatrix((new THREE.Matrix4).makeRotationX(-Math.PI / 2));
        var r = new THREE.MeshBasicMaterial({
            wireframe: !0,
            fog: !1
        });
        this.cone = new THREE.Mesh(e, r), this.add(this.cone), this.update()
    }, THREE.SpotLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.SpotLightHelper.prototype.constructor = THREE.SpotLightHelper, THREE.SpotLightHelper.prototype.dispose = function() {
        this.cone.geometry.dispose(), this.cone.material.dispose()
    }, THREE.SpotLightHelper.prototype.update = function() {
        var t = new THREE.Vector3,
            e = new THREE.Vector3;
        return function() {
            var r = this.light.distance ? this.light.distance : 1e4,
                i = r * Math.tan(this.light.angle);
            this.cone.scale.set(i, i, r), t.setFromMatrixPosition(this.light.matrixWorld), e.setFromMatrixPosition(this.light.target.matrixWorld), this.cone.lookAt(e.sub(t)), this.cone.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)
        }
    }(), THREE.VertexNormalsHelper = function(t, e, r, i) {
        this.object = t, this.size = void 0 !== e ? e : 1;
        for (var n = void 0 !== r ? r : 16711680, a = void 0 !== i ? i : 1, o = new THREE.Geometry, s = t.geometry.faces, h = 0, l = s.length; h < l; h++)
            for (var c = s[h], u = 0, E = c.vertexNormals.length; u < E; u++) o.vertices.push(new THREE.Vector3, new THREE.Vector3);
        THREE.Line.call(this, o, new THREE.LineBasicMaterial({
            color: n,
            linewidth: a
        }), THREE.LinePieces), this.matrixAutoUpdate = !1, this.normalMatrix = new THREE.Matrix3, this.update()
    }, THREE.VertexNormalsHelper.prototype = Object.create(THREE.Line.prototype), THREE.VertexNormalsHelper.prototype.constructor = THREE.VertexNormalsHelper, THREE.VertexNormalsHelper.prototype.update = function(t) {
        var e = new THREE.Vector3;
        return function(t) {
            var r = ["a", "b", "c", "d"];
            this.object.updateMatrixWorld(!0), this.normalMatrix.getNormalMatrix(this.object.matrixWorld);
            for (var i = this.geometry.vertices, n = this.object.geometry.vertices, a = this.object.geometry.faces, o = this.object.matrixWorld, s = 0, h = 0, l = a.length; h < l; h++)
                for (var c = a[h], u = 0, E = c.vertexNormals.length; u < E; u++) {
                    var f = c[r[u]],
                        p = n[f],
                        d = c.vertexNormals[u];
                    i[s].copy(p).applyMatrix4(o), e.copy(d).applyMatrix3(this.normalMatrix).normalize().multiplyScalar(this.size), e.add(i[s]), s += 1, i[s].copy(e), s += 1
                }
            return this.geometry.verticesNeedUpdate = !0, this
        }
    }(), THREE.VertexTangentsHelper = function(t, e, r, i) {
        this.object = t, this.size = void 0 !== e ? e : 1;
        for (var n = void 0 !== r ? r : 255, a = void 0 !== i ? i : 1, o = new THREE.Geometry, s = t.geometry.faces, h = 0, l = s.length; h < l; h++)
            for (var c = s[h], u = 0, E = c.vertexTangents.length; u < E; u++) o.vertices.push(new THREE.Vector3), o.vertices.push(new THREE.Vector3);
        THREE.Line.call(this, o, new THREE.LineBasicMaterial({
            color: n,
            linewidth: a
        }), THREE.LinePieces), this.matrixAutoUpdate = !1, this.update()
    }, THREE.VertexTangentsHelper.prototype = Object.create(THREE.Line.prototype), THREE.VertexTangentsHelper.prototype.constructor = THREE.VertexTangentsHelper, THREE.VertexTangentsHelper.prototype.update = function(t) {
        var e = new THREE.Vector3;
        return function(t) {
            var r = ["a", "b", "c", "d"];
            this.object.updateMatrixWorld(!0);
            for (var i = this.geometry.vertices, n = this.object.geometry.vertices, a = this.object.geometry.faces, o = this.object.matrixWorld, s = 0, h = 0, l = a.length; h < l; h++)
                for (var c = a[h], u = 0, E = c.vertexTangents.length; u < E; u++) {
                    var f = c[r[u]],
                        p = n[f],
                        d = c.vertexTangents[u];
                    i[s].copy(p).applyMatrix4(o), e.copy(d).transformDirection(o).multiplyScalar(this.size), e.add(i[s]), s += 1, i[s].copy(e), s += 1
                }
            return this.geometry.verticesNeedUpdate = !0, this
        }
    }(), THREE.WireframeHelper = function(t, e) {
        var r = void 0 !== e ? e : 16777215,
            i = [0, 0],
            n = {},
            a = function(t, e) {
                return t - e
            },
            o = ["a", "b", "c"],
            s = new THREE.BufferGeometry;
        if (t.geometry instanceof THREE.Geometry) {
            for (var h = t.geometry.vertices, l = t.geometry.faces, c = 0, u = new Uint32Array(6 * l.length), E = 0, f = l.length; E < f; E++)
                for (var p = l[E], d = 0; d < 3; d++) {
                    i[0] = p[o[d]], i[1] = p[o[(d + 1) % 3]], i.sort(a);
                    var m = i.toString();
                    void 0 === n[m] && (u[2 * c] = i[0], u[2 * c + 1] = i[1], n[m] = !0, c++)
                }
            for (var T = new Float32Array(2 * c * 3), E = 0, f = c; E < f; E++)
                for (var d = 0; d < 2; d++) {
                    var g = h[u[2 * E + d]],
                        v = 6 * E + 3 * d;
                    T[v + 0] = g.x, T[v + 1] = g.y, T[v + 2] = g.z
                }
            s.addAttribute("position", new THREE.BufferAttribute(T, 3))
        } else if (t.geometry instanceof THREE.BufferGeometry)
            if (void 0 !== t.geometry.attributes.index) {
                var h = t.geometry.attributes.position.array,
                    R = t.geometry.attributes.index.array,
                    y = t.geometry.drawcalls,
                    c = 0;
                0 === y.length && (y = [{
                    count: R.length,
                    index: 0,
                    start: 0
                }]);
                for (var u = new Uint32Array(2 * R.length), H = 0, x = y.length; H < x; ++H)
                    for (var b = y[H].start, _ = y[H].count, v = y[H].index, E = b, w = b + _; E < w; E += 3)
                        for (var d = 0; d < 3; d++) {
                            i[0] = v + R[E + d], i[1] = v + R[E + (d + 1) % 3], i.sort(a);
                            var m = i.toString();
                            void 0 === n[m] && (u[2 * c] = i[0], u[2 * c + 1] = i[1], n[m] = !0, c++)
                        }
                for (var T = new Float32Array(2 * c * 3), E = 0, f = c; E < f; E++)
                    for (var d = 0; d < 2; d++) {
                        var v = 6 * E + 3 * d,
                            M = 3 * u[2 * E + d];
                        T[v + 0] = h[M], T[v + 1] = h[M + 1], T[v + 2] = h[M + 2]
                    }
                s.addAttribute("position", new THREE.BufferAttribute(T, 3))
            } else {
                for (var h = t.geometry.attributes.position.array, c = h.length / 3, S = c / 3, T = new Float32Array(2 * c * 3), E = 0, f = S; E < f; E++)
                    for (var d = 0; d < 3; d++) {
                        var v = 18 * E + 6 * d,
                            A = 9 * E + 3 * d;
                        T[v + 0] = h[A], T[v + 1] = h[A + 1], T[v + 2] = h[A + 2];
                        var M = 9 * E + 3 * ((d + 1) % 3);
                        T[v + 3] = h[M], T[v + 4] = h[M + 1], T[v + 5] = h[M + 2]
                    }
                s.addAttribute("position", new THREE.BufferAttribute(T, 3))
            }
        THREE.Line.call(this, s, new THREE.LineBasicMaterial({
            color: r
        }), THREE.LinePieces), this.matrix = t.matrixWorld, this.matrixAutoUpdate = !1
    }, THREE.WireframeHelper.prototype = Object.create(THREE.Line.prototype), THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper, THREE.ImmediateRenderObject = function() {
        THREE.Object3D.call(this), this.render = function(t) {}
    }, THREE.ImmediateRenderObject.prototype = Object.create(THREE.Object3D.prototype), THREE.ImmediateRenderObject.prototype.constructor = THREE.ImmediateRenderObject, THREE.MorphBlendMesh = function(t, e) {
        THREE.Mesh.call(this, t, e), this.animationsMap = {}, this.animationsList = [];
        var r = this.geometry.morphTargets.length,
            i = "__default",
            n = 0,
            a = r - 1,
            o = r / 1;
        this.createAnimation(i, n, a, o), this.setAnimationWeight(i, 1)
    }, THREE.MorphBlendMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.MorphBlendMesh.prototype.constructor = THREE.MorphBlendMesh, THREE.MorphBlendMesh.prototype.createAnimation = function(t, e, r, i) {
        var n = {
            startFrame: e,
            endFrame: r,
            length: r - e + 1,
            fps: i,
            duration: (r - e) / i,
            lastFrame: 0,
            currentFrame: 0,
            active: !1,
            time: 0,
            direction: 1,
            weight: 1,
            directionBackwards: !1,
            mirroredLoop: !1
        };
        this.animationsMap[t] = n, this.animationsList.push(n)
    }, THREE.MorphBlendMesh.prototype.autoCreateAnimations = function(t) {
        for (var e, r = /([a-z]+)_?(\d+)/, i = {}, n = this.geometry, a = 0, o = n.morphTargets.length; a < o; a++) {
            var s = n.morphTargets[a],
                h = s.name.match(r);
            if (h && h.length > 1) {
                var l = h[1];
                i[l] || (i[l] = {
                    start: 1 / 0,
                    end: -(1 / 0)
                });
                var c = i[l];
                a < c.start && (c.start = a), a > c.end && (c.end = a), e || (e = l)
            }
        }
        for (var l in i) {
            var c = i[l];
            this.createAnimation(l, c.start, c.end, t)
        }
        this.firstAnimation = e
    }, THREE.MorphBlendMesh.prototype.setAnimationDirectionForward = function(t) {
        var e = this.animationsMap[t];
        e && (e.direction = 1, e.directionBackwards = !1)
    }, THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward = function(t) {
        var e = this.animationsMap[t];
        e && (e.direction = -1, e.directionBackwards = !0)
    }, THREE.MorphBlendMesh.prototype.setAnimationFPS = function(t, e) {
        var r = this.animationsMap[t];
        r && (r.fps = e, r.duration = (r.end - r.start) / r.fps)
    }, THREE.MorphBlendMesh.prototype.setAnimationDuration = function(t, e) {
        var r = this.animationsMap[t];
        r && (r.duration = e, r.fps = (r.end - r.start) / r.duration)
    }, THREE.MorphBlendMesh.prototype.setAnimationWeight = function(t, e) {
        var r = this.animationsMap[t];
        r && (r.weight = e)
    }, THREE.MorphBlendMesh.prototype.setAnimationTime = function(t, e) {
        var r = this.animationsMap[t];
        r && (r.time = e)
    }, THREE.MorphBlendMesh.prototype.getAnimationTime = function(t) {
        var e = 0,
            r = this.animationsMap[t];
        return r && (e = r.time), e
    }, THREE.MorphBlendMesh.prototype.getAnimationDuration = function(t) {
        var e = -1,
            r = this.animationsMap[t];
        return r && (e = r.duration), e
    }, THREE.MorphBlendMesh.prototype.playAnimation = function(t) {
        var e = this.animationsMap[t];
        e ? (e.time = 0, e.active = !0) : THREE.warn("THREE.MorphBlendMesh: animation[" + t + "] undefined in .playAnimation()")
    }, THREE.MorphBlendMesh.prototype.stopAnimation = function(t) {
        var e = this.animationsMap[t];
        e && (e.active = !1)
    }, THREE.MorphBlendMesh.prototype.update = function(t) {
        for (var e = 0, r = this.animationsList.length; e < r; e++) {
            var i = this.animationsList[e];
            if (i.active) {
                var n = i.duration / i.length;
                i.time += i.direction * t, i.mirroredLoop ? (i.time > i.duration || i.time < 0) && (i.direction *= -1, i.time > i.duration && (i.time = i.duration, i.directionBackwards = !0), i.time < 0 && (i.time = 0, i.directionBackwards = !1)) : (i.time = i.time % i.duration, i.time < 0 && (i.time += i.duration));
                var a = i.startFrame + THREE.Math.clamp(Math.floor(i.time / n), 0, i.length - 1),
                    o = i.weight;
                a !== i.currentFrame && (this.morphTargetInfluences[i.lastFrame] = 0, this.morphTargetInfluences[i.currentFrame] = 1 * o, this.morphTargetInfluences[a] = 0, i.lastFrame = i.currentFrame, i.currentFrame = a);
                var s = i.time % n / n;
                i.directionBackwards && (s = 1 - s), this.morphTargetInfluences[i.currentFrame] = s * o, this.morphTargetInfluences[i.lastFrame] = (1 - s) * o
            }
        }
    };
THREE.CopyShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        opacity: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")
};
THREE.EdgeShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        aspect: {
            type: "v2",
            value: new THREE.Vector2(512, 512)
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "uniform vec2 aspect;", "vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);", "mat3 G[2];", "const mat3 g0 = mat3( 1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0 );", "const mat3 g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );", "void main(void)", "{", "mat3 I;", "float cnv[2];", "vec3 sample;", "G[0] = g0;", "G[1] = g1;", "for (float i=0.0; i<3.0; i++)", "for (float j=0.0; j<3.0; j++) {", "sample = texture2D( tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;", "I[int(i)][int(j)] = length(sample);", "}", "for (int i=0; i<2; i++) {", "float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);", "cnv[i] = dp3 * dp3; ", "}", "gl_FragColor = vec4(sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]));", "} "].join("\n")
};
THREE.EffectComposer = function(e, r) {
    if (this.renderer = e, void 0 === r) {
        var t = e.getPixelRatio(),
            s = Math.floor(e.context.canvas.width / t) || 1,
            i = Math.floor(e.context.canvas.height / t) || 1,
            a = {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBFormat,
                stencilBuffer: !1
            };
        r = new THREE.WebGLRenderTarget(s, i, a)
    }
    this.renderTarget1 = r, this.renderTarget2 = r.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.passes = [], void 0 === THREE.CopyShader && console.error("THREE.EffectComposer relies on THREE.CopyShader"), this.copyPass = new THREE.ShaderPass(THREE.CopyShader)
}, THREE.EffectComposer.prototype = {
    swapBuffers: function() {
        var e = this.readBuffer;
        this.readBuffer = this.writeBuffer, this.writeBuffer = e
    },
    addPass: function(e) {
        this.passes.push(e)
    },
    insertPass: function(e, r) {
        this.passes.splice(r, 0, e)
    },
    render: function(e) {
        this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
        var r, t, s = !1,
            i = this.passes.length;
        for (t = 0; t < i; t++)
            if (r = this.passes[t], r.enabled) {
                if (r.render(this.renderer, this.writeBuffer, this.readBuffer, e, s), r.needsSwap) {
                    if (s) {
                        var a = this.renderer.context;
                        a.stencilFunc(a.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), a.stencilFunc(a.EQUAL, 1, 4294967295)
                    }
                    this.swapBuffers()
                }
                r instanceof THREE.MaskPass ? s = !0 : r instanceof THREE.ClearMaskPass && (s = !1)
            }
    },
    reset: function(e) {
        if (void 0 === e) {
            e = this.renderTarget1.clone();
            var r = this.renderer.getPixelRatio();
            e.width = Math.floor(this.renderer.context.canvas.width / r), e.height = Math.floor(this.renderer.context.canvas.height / r)
        }
        this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2
    },
    setSize: function(e, r) {
        var t = this.renderTarget1.clone();
        t.width = e, t.height = r, this.reset(t)
    }
};
THREE.MaskPass = function(e, s) {
    this.scene = e, this.camera = s, this.enabled = !0, this.clear = !0, this.needsSwap = !1, this.inverse = !1
}, THREE.MaskPass.prototype = {
    render: function(e, s, t, a) {
        var n = e.context;
        n.colorMask(!1, !1, !1, !1), n.depthMask(!1);
        var i, r;
        this.inverse ? (i = 0, r = 1) : (i = 1, r = 0), n.enable(n.STENCIL_TEST), n.stencilOp(n.REPLACE, n.REPLACE, n.REPLACE), n.stencilFunc(n.ALWAYS, i, 4294967295), n.clearStencil(r), e.render(this.scene, this.camera, t, this.clear), e.render(this.scene, this.camera, s, this.clear), n.colorMask(!0, !0, !0, !0), n.depthMask(!0), n.stencilFunc(n.EQUAL, 1, 4294967295), n.stencilOp(n.KEEP, n.KEEP, n.KEEP)
    }
}, THREE.ClearMaskPass = function() {
    this.enabled = !0
}, THREE.ClearMaskPass.prototype = {
    render: function(e, s, t, a) {
        var n = e.context;
        n.disable(n.STENCIL_TEST)
    }
};
THREE.RenderPass = function(e, r, l, a, o) {
    this.scene = e, this.camera = r, this.overrideMaterial = l, this.clearColor = a, this.clearAlpha = void 0 !== o ? o : 1, this.oldClearColor = new THREE.Color, this.oldClearAlpha = 1, this.enabled = !0, this.clear = !0, this.needsSwap = !1
}, THREE.RenderPass.prototype = {
    render: function(e, r, l, a) {
        this.scene.overrideMaterial = this.overrideMaterial, this.clearColor && (this.oldClearColor.copy(e.getClearColor()), this.oldClearAlpha = e.getClearAlpha(), e.setClearColor(this.clearColor, this.clearAlpha)), e.render(this.scene, this.camera, l, this.clear), this.clearColor && e.setClearColor(this.oldClearColor, this.oldClearAlpha), this.scene.overrideMaterial = null
    }
};
THREE.ShaderPass = function(e, r) {
    this.textureID = void 0 !== r ? r : "tDiffuse", this.uniforms = THREE.UniformsUtils.clone(e.uniforms), this.material = new THREE.ShaderMaterial({
        defines: e.defines || {},
        uniforms: this.uniforms,
        vertexShader: e.vertexShader,
        fragmentShader: e.fragmentShader
    }), this.renderToScreen = !1, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1), this.scene = new THREE.Scene, this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), this.scene.add(this.quad)
}, THREE.ShaderPass.prototype = {
    render: function(e, r, t, s) {
        this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = t), this.quad.material = this.material, this.renderToScreen ? e.render(this.scene, this.camera) : e.render(this.scene, this.camera, r, this.clear)
    }
};