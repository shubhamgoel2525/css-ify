! function() {
    function e(e) {
        for (var n = document.getElementsByClassName("msg"), t = n.length - 1; t >= 0; --t) document.body.removeChild(n[t]);
        var i = document.createElement("div");
        i.className = "msg", i.innerHTML = e, document.body.appendChild(i), setTimeout(function() {
            i.parentNode === document.body && document.body.removeChild(i)
        }, 5e3)
    }

    function n() {
        var e = new Date;
        r.render(function() {
            t(e)
        })
    }

    function t(n) {
        var t = new Date,
            i = parseFloat((t - n) / 1e3, 3);
        e("Render time: " + i + " seconds")
    }

    function i(e) {
        var n = window.open(e, "_blank");
        n.focus()
    }
    var o = "./src/img/3.jpg",
        d = document.getElementById("c");
    d.width = window.innerWidth, d.height = window.innerHeight;
    var a = new Date,
        r = new GlRenderer(d, 2e3, (!0), o, function() {
            t(a)
        });
    window.onresize = function() {
        d.width = window.innerWidth, d.height = window.innerHeight, r.resize(), n()
    };
    var c = !1,
        s = function() {
            this["Upload Image"] = function() {
                var e = document.getElementById("elFileInput");
                e.addEventListener("change", function() {
                    var n = e.files[0],
                        i = new FileReader;
                    i.onload = function(e) {
                        var n = new Date;
                        r.updateImage(e.target.result, function() {
                            t(n)
                        })
                    }, i.readAsDataURL(n);
                    for (var o in h.__controllers) h.__controllers[o].updateDisplay()
                }), e.click()
            }, this["Vertex Cnt"] = 2e3, this.Wireframe = function() {
                c = !c, r.setWireframe(c)
            }, this.Render = function() {
                r.setVertexCnt(this["Vertex Cnt"]), n()
            }, this.Author = function() {
                i("http://zhangwenli.com")
            }, this.GitHub = function() {
                i("https://github.com/Ovilia/Polyvia")
            }, this["Video Version"] = function() {
                i("video.html")
            }
        },
        u = new s,
        h = new dat.GUI,
        m = h.add(u, "Vertex Cnt", 100, 5e3).step(100);
    m.onChange(function(e) {
        r.setVertexCnt(e), n()
    }), h.add(u, "Upload Image"), h.add(u, "Render"), h.add(u, "Wireframe"), h.add(u, "Video Version"), h.add(u, "Author"), h.add(u, "GitHub")
}();