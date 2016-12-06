function() {
    var Turbolinks, anchoredLink, applyFetchReplacement, assets, assetsChanged, browserCompatibleDocumentParser, browserSupportsPushState, cacheCurrentPage, changePage, constrainPageCacheTo, createDocument, crossOriginLink, currentState, executeScriptTags, extractAssets, extractLink, extractTitleAndBody, fetchHistory, fetchReplacement, getReferrer, handleClick, ignoreClick, initialized, installClickHandlerLast, intersection, noTurbolink, nonHtmlLink, nonStandardClick, pageBookmarks, pageCache, recallScrollPosition, referer, reflectNewUrl, reflectRedirectedUrl, rememberCurrentAssets, rememberCurrentState, rememberCurrentUrl, rememberInitialPage, resetScrollPosition, samePageLink, triggerEvent, visit, visitAndSaveBookmark, visitOrLoadBookmark, willVisit, __indexOf = [].indexOf || function(e) {
        for (var t = 0, n = this.length; t < n; t++)
            if (t in this && this[t] === e)
                return t;
        return -1
    }
    ;
    initialized = !1,
    currentState = null ,
    referer = document.location.href,
    assets = [],
    pageCache = [],
    pageBookmarks = {},
    createDocument = null ,
    Turbolinks = {},
    this.pageCache = pageCache,
    visit = function(e) {
        return browserSupportsPushState ? (cacheCurrentPage(),
        reflectNewUrl(e),
        fetchReplacement(e)) : document.location.href = e
    }
    ,
    visitAndSaveBookmark = function(e, t) {
        return browserSupportsPushState ? (cacheCurrentPage(t),
        reflectNewUrl(e),
        fetchReplacement(e)) : document.location.href = e
    }
    ,
    visitOrLoadBookmark = function(e, t) {
        var n;
        return browserSupportsPushState ? (cacheCurrentPage(),
        reflectNewUrl(e),
        n = pageBookmarks[t],
        n ? (changePage(n.title, createDocument("<html>" + n.body + "</html>").body),
        recallScrollPosition(n),
        n.popCallback && n.popCallback(),
        triggerEvent("page:restore"),
        pageBookmarks[t] = null ) : fetchReplacement(e)) : document.location.href = e
    }
    ,
    willVisit = function(e) {
        return browserSupportsPushState ? (cacheCurrentPage(),
        reflectNewUrl(e),
        currentState = window.history.state,
        ga_track("pageview")) : document.location.href = e
    }
    ,
    fetchReplacement = function(e) {
        var t, n = this;
        return triggerEvent("page:fetch"),
        t = new XMLHttpRequest,
        t.open("GET", e, !0),
        t.setRequestHeader("Accept", "text/html, application/xhtml+xml, application/xml"),
        t.setRequestHeader("X-XHR-Referer", referer),
        t.onload = function() {
            if (window.location.href === e)
                return Turbolinks.__atomgas_doLater__(e, function() {
                    return applyFetchReplacement(t)
                })
        }
        ,
        t.onabort = function() {}
        ,
        t.send()
    }
    ,
    applyFetchReplacement = function(e) {
        var t;
        return t = createDocument(e.responseText),
        assetsChanged(t) ? document.location.href = url : (changePage.apply(null , extractTitleAndBody(t)),
        reflectRedirectedUrl(e),
        resetScrollPosition(),
        triggerEvent("page:load"))
    }
    ,
    Turbolinks.__atomgas_doLater__ = function(e) {
        return e()
    }
    ,
    fetchHistory = function(e) {
        var t;
        return cacheCurrentPage(),
        (t = pageCache[e.position]) ? (changePage(t.title, createDocument("<html>" + t.body + "</html>").body),
        recallScrollPosition(t),
        t.popCallback && t.popCallback(),
        triggerEvent("page:restore")) : fetchReplacement(document.location.href)
    }
    ,
    cacheCurrentPage = function(e) {
        return rememberInitialPage(),
        pageCache[currentState.position] = {
            url: document.location.href,
            body: document.body.outerHTML,
            title: document.title,
            positionY: window.pageYOffset,
            positionX: window.pageXOffset
        },
        $(".turbolink_scroller").length > 0 && (pageCache[currentState.position].positionXTS = $(".turbolink_scroller").scrollLeft(),
        pageCache[currentState.position].positionYTS = $(".turbolink_scroller").scrollTop()),
        $("#viewport").length > 0 && (pageCache[currentState.position].viewport = $("#viewport").attr("content")),
        this.TurbolinkPopCallback && (pageCache[currentState.position].popCallback = this.TurbolinkPopCallback,
        this.TurbolinkPopCallback = null ),
        e && (pageBookmarks[e] = pageCache[currentState.position]),
        constrainPageCacheTo(10)
    }
    ,
    constrainPageCacheTo = function(e) {
        return delete pageCache[currentState.position - e]
    }
    ,
    changePage = function(e, t) {
        return document.title = e,
        document.documentElement.replaceChild(t, document.body),
        executeScriptTags(),
        currentState = window.history.state,
        triggerEvent("page:change")
    }
    ,
    executeScriptTags = function() {
        var script, _i, _len, _ref, _ref1, _results;
        _ref = document.body.getElementsByTagName("script"),
        _results = [];
        for (_i = 0,
        _len = _ref.length; _i < _len; _i++)
            script = _ref[_i],
            ((_ref1 = script.type) === "" || _ref1 === "text/javascript") && _results.push(eval(script.innerHTML));
        return _results
    }
    ,
    reflectNewUrl = function(e) {
        if (e !== document.location.href)
            return referer = document.location.href,
            window.history.pushState({
                turbolinks: !0,
                position: currentState.position + 1
            }, "", e)
    }
    ,
    reflectRedirectedUrl = function(e) {
        var t;
        if (t = e.getResponseHeader("X-XHR-Current-Location"))
            return window.history.replaceState(currentState, "", t)
    }
    ,
    rememberCurrentUrl = function() {
        return window.history.replaceState({
            turbolinks: !0,
            position: window.history.length - 1
        }, "", document.location.href)
    }
    ,
    rememberCurrentState = function() {
        return currentState = window.history.state
    }
    ,
    rememberCurrentAssets = function() {
        return assets = extractAssets(document)
    }
    ,
    rememberInitialPage = function() {
        if (!initialized)
            return rememberCurrentUrl(),
            rememberCurrentState(),
            createDocument = browserCompatibleDocumentParser(),
            initialized = !0
    }
    ,
    recallScrollPosition = function(e) {
        window.scrollTo(e.positionX, e.positionY),
        (e.positionXTS || e.positionYTS) && $(".turbolink_scroller").length > 0 && ($(".turbolink_scroller").scrollLeft(e.positionXTS),
        $(".turbolink_scroller").scrollTop(e.positionYTS));
        if (e.viewport)
            return $("#viewport").attr("content", e.viewport)
    }
    ,
    resetScrollPosition = function() {
        return window.scrollTo(0, 0)
    }
    ,
    triggerEvent = function(e) {
        var t;
        return t = document.createEvent("Events"),
        t.initEvent(e, !0, !0),
        document.dispatchEvent(t)
    }
    ,
    extractAssets = function(e) {
        var t, n, r, i, s;
        i = e.head.childNodes,
        s = [];
        for (n = 0,
        r = i.length; n < r; n++)
            t = i[n],
            (t.src || t.href) && s.push(t.src || t.href);
        return s
    }
    ,
    assetsChanged = function(e) {
        return intersection(extractAssets(e), assets).length !== assets.length,
        !1
    }
    ,
    intersection = function(e, t) {
        var n, r, i, s, o;
        e.length > t.length && (s = [t, e],
        e = s[0],
        t = s[1]),
        o = [];
        for (r = 0,
        i = e.length; r < i; r++)
            n = e[r],
            __indexOf.call(t, n) >= 0 && o.push(n);
        return o
    }
    ,
    extractTitleAndBody = function(e) {
        var t;
        return t = e.querySelector("title"),
        [t != null ? t.textContent : void 0, e.body]
    }
    ,
    browserCompatibleDocumentParser = function() {
        var e, t, n, r;
        return e = function(e) {
            return (new DOMParser).parseFromString(e, "text/html")
        }
        ,
        t = function(e) {
            var t;
            return t = document.implementation.createHTMLDocument(""),
            t.open("replace"),
            t.write(e),
            t.close,
            t
        }
        ,
        window.DOMParser && (n = e("<html><body><p>test")),
        (n != null ? (r = n.body) != null ? r.childNodes.length : void 0 : void 0) === 1 ? e : t
    }
    ,
    installClickHandlerLast = function(e) {
        if (!e.defaultPrevented)
            return document.removeEventListener("click", handleClick),
            document.addEventListener("click", handleClick)
    }
    ,
    handleClick = function(e) {
        var t;
        if (!e.defaultPrevented) {
            t = extractLink(e);
            if (t != null && t.nodeName === "A" && !ignoreClick(e, t))
                return document.getElementsByTagName("body")[0].className.match(/no-replace-state/) && (initialized = !0),
                t.getAttribute("data-save-bookmark") ? visitAndSaveBookmark(t.href, t.getAttribute("data-save-bookmark")) : t.getAttribute("data-load-bookmark") ? visitOrLoadBookmark(t.href, t.getAttribute("data-load-bookmark")) : visit(t.href),
                e.preventDefault()
        }
    }
    ,
    extractLink = function(e) {
        var t;
        t = e.target;
        while (t != null && t !== document && t.nodeName !== "A")
            t = t.parentNode;
        return t
    }
    ,
    samePageLink = function(e) {
        return e.href === document.location.href
    }
    ,
    crossOriginLink = function(e) {
        return location.protocol !== e.protocol || location.host !== e.host
    }
    ,
    anchoredLink = function(e) {
        return (e.hash && e.href.replace(e.hash, "")) === location.href.replace(location.hash, "") || e.href === location.href + "#"
    }
    ,
    nonHtmlLink = function(e) {
        return e.href.match(/\.[a-z]+(\?.*)?$/g) && !e.href.match(/\.html?(\?.*)?$/g)
    }
    ,
    noTurbolink = function(e) {
        var t;
        while (!t && e !== document)
            t = e.getAttribute("data-no-turbolink") != null ,
            e = e.parentNode;
        return t
    }
    ,
    nonStandardClick = function(e) {
        return e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
    }
    ,
    ignoreClick = function(e, t) {
        return crossOriginLink(t) || anchoredLink(t) || nonHtmlLink(t) || noTurbolink(t) || nonStandardClick(e)
    }
    ,
    getReferrer = function() {
        return referer === document.location.href ? "" : referer
    }
    ,
    browserSupportsPushState = window.history && window.history.pushState && window.history.replaceState && window.history.state !== void 0,
    browserSupportsPushState && (rememberCurrentAssets(),
    document.addEventListener("click", installClickHandlerLast, !0),
    window.addEventListener("popstate", function(e) {
        var t;
        if ((t = e.state) != null ? t.turbolinks : void 0)
            return fetchHistory(e.state)
    })),
    this.Turbolinks = Turbolinks,
    this.Turbolinks.visit = visit,
    this.Turbolinks.willVisit = willVisit,
    this.Turbolinks.fetchHistory = fetchHistory,
    this.Turbolinks.getReferrer = getReferrer
}
.call(this),
function() {
    jQuery(function(e) {
        var t, n, r, i;
        if (e("time b")[0] != null ) {
            t = e("time").data("timezone-offset") * 1e3;
            if (e("body").hasClass("eu") || e("body").hasClass("japan"))
                e("body").hasClass("shop-closed") || e("body").hasClass("products") || e("body").hasClass("cart") || e("body").hasClass("cart_page") ? e("#time-zone-name").text(e("body").hasClass("eu") ? "LDN" : "TYO") : (t = realNycOffset * 1e3,
                e("#time-zone-name").text("NYC"));
            return n = null ,
            i = function(e, t) {
                var n;
                return t == null && (t = 2),
                "" + function() {
                    var r, i, s;
                    s = [];
                    for (n = r = 0,
                    i = t - ("" + e).length; 0 <= i ? r < i : r > i; n = 0 <= i ? ++r : --r)
                        s.push(0);
                    return s
                }().join("") + e
            }
            ,
            r = function() {
                var s, o, u, a, f, l;
                return s = new Date,
                l = s.getTimezoneOffset() * 60 * 1e3,
                s.setTime(s.getTime() + t + l),
                o,
                e("body").hasClass("eu") ? o = "" + i(s.getDate()) + "/" + i(s.getMonth() + 1) + "/" + s.getFullYear() : o = "" + i(s.getMonth() + 1) + "/" + i(s.getDate()) + "/" + s.getFullYear(),
                a = s.getHours(),
                f = a === 12 ? "12" : i(a % 12),
                u = "" + f + ":" + i(s.getMinutes()) + (a >= 12 ? "pm" : "am"),
                e("time b").html("" + o + " " + u),
                n = window.setTimeout(r, 1e4)
            }
            ,
            r(),
            e(document).one("page:fetch", function() {
                return window.clearTimeout(n)
            })
        }
    })
}
.call(this),
function() {
    var e, t, n;
    this.Turbolinks.__atomgas_doLater__ = function(e, t) {
        return $("body, body *").promise().done(function() {
            return t()
        })
    }
    ,
    e = 500,
    t = 500,
    n = {
        init: function() {
            var e, t = this;
            this.setupTransitions(),
            $(document).on("page:fetch", function() {
                return t.performfadeOut()
            }).on("page:change", function() {
                return n.setCurrentLangToggle(n.currentLang()),
                t.storeLocation(),
                t.performfadeIn()
            }),
            this.storeLocation(),
            n.setCurrentLangToggle(n.currentLang()),
            (e = location.search.match(/utm_medium=([a-z]+)/)) && $.cookie("origin", e[1]);
            if (document.referrer.match(/facebook.com\//))
                return $.cookie("origin", "facebook")
        },
        GBPtoEUR: function(e) {
            return e * EU_RATE
        },
        addDelim: function(e, t) {
            return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, t)
        },
        setCurrentLang: function(e) {
            return $.cookie("lang", e, {
                path: "/"
            }),
            $.cookie("langChanged", 1, {
                path: "/"
            })
        },
        currentLang: function() {
            var e;
            return e = "en",
            $.cookie("lang") === null ? e : $.cookie("lang")
        },
        storeLocation: function() {
            return this.previousLocationPathname = this.currentLocationPathname || location.pathname,
            this.currentLocationPathname = location.pathname
        },
        showLanguageSetter: function(e, t) {
            var r, i;
            return r = $('<ul id="language-setter"><li class="en">UK</li><li class="de">DE</li><li class="fr">FR</li></ul>'),
            r.attr("class", n.currentLang()),
            $("body").append(r),
            i = $("#language-setter"),
            i.css({
                top: e - i.height() - 6,
                left: t
            }),
            i.animate({
                opacity: 1
            }, 100, function() {
                var e = this;
                return $("body").unbind("click.langSetter"),
                $("body").on("click.langSetter", function(e) {
                    if ($(e.target).attr("id") === "current-lang") {
                        i.css("opacity") === "1" && (console.log(i.css("opacity")),
                        n.hideLanguageSetter());
                        return
                    }
                    return n.hideLanguageSetter(),
                    e.stopImmediatePropagation(),
                    !1
                })
            }),
            i.find("li").click(function() {
                var e;
                return e = $(this).attr("class").toLowerCase(),
                n.setCurrentLang(e),
                n.setCurrentLangToggle(e),
                n.hideLanguageSetter(),
                window.location.reload(),
                !1
            })
        },
        setCurrentLangToggle: function(e) {
            var t;
            return t = e.toUpperCase(),
            t === "EN" && (t = "UK"),
            $("#current-lang").attr("class", e.toLowerCase()).text(t)
        },
        hideLanguageSetter: function() {
            return $("body").unbind("click.langSetter"),
            $("#language-setter").animate({
                opacity: 0
            }, 0, function() {
                return $(this).remove()
            })
        },
        showCookieNotice: function() {
            var e, t, n = this;
            if ($.cookie("hasShownCookieNotice") === null )
                return $.cookie("hasShownCookieNotice", 1, {
                    expires: 365
                }),
                e = $("#eu_cookie_notice"),
                t = e.height(),
                e.css({
                    top: 0,
                    height: 0
                }).animate({
                    height: t
                }, 400, function() {
                    return e.css("z-index", 2e3)
                }),
                e.find(".close").click(function() {
                    return n.hideCookieNotice(),
                    !1
                })
        },
        hideCookieNotice: function() {
            var e = this;
            return $("#eu_cookie_notice").animate({
                height: 0
            }, "fast", function() {
                return $(e).remove()
            })
        },
        addTransition: function(e, t) {
            return t = $.extend({
                from: /.*/,
                to: /.*/
            }, t, {
                label: e
            }),
            this._transitions.push(t)
        },
        setupTransitions: function() {
            var r, i = this;
            return this._transitions = [],
            r = {
                label: "DEFAULT",
                fadeOut: function() {
                    return $("#wrap > *").animate({
                        opacity: 0
                    }, e, function() {
                        return $("#wrap").addClass("loading")
                    }),
                    {}
                },
                fadeIn: function(t) {
                    t || (t = {}),
                    n.performExtraFadeIns(t),
                    $("#wrap").css({
                        opacity: 1
                    }).removeClass("loading"),
                    $("#wrap > *:not(footer,object,embed,.arrow)").css({
                        opacity: 0
                    }).animate({
                        opacity: 1
                    }, e);
                    if (t.headerAndFooter == null )
                        return $("header, footer").animate({
                            opacity: 1
                        }, e)
                }
            },
            location.host.split(".")[0] !== "archive" && (this.addTransition("HOME -> *", {
                from: /^\/(index)?$/,
                fadeOut: function() {
                    return $("header, #background-image, #wrap > *").animate({
                        opacity: 0
                    }, t - 100),
                    {
                        background: function() {
                            var e;
                            return e = $("body").css("backgroundColor"),
                            $("body").css({
                                backgroundColor: "#000"
                            }).animate({
                                backgroundColor: "#FFF"
                            }, t)
                        },
                        headerAndFooter: function() {
                            return $("header, footer").css({
                                opacity: 0
                            }).animate({
                                opacity: 1
                            }, e)
                        }
                    }
                }
            }),
            this.addTransition("* -> HOME", {
                to: /^\/(index)?$/,
                fadeOut: "header, footer, #wrap > *",
                fadeIn: function() {
                    return $("header").show(),
                    $("body").css({
                        opacity: 0,
                        backgroundColor: "#FFF"
                    }).animate({
                        opacity: 1,
                        backgroundColor: "#000"
                    }, t),
                    r.fadeIn()
                }
            })),
            this.addTransition("SHOP ROUTES", {
                to: /^\/shop\/(cart|sizing|terms|faq)$/,
                fadeOut: r.fadeOut
            }),
            this.addTransition("PREVIEW ALL -> DETAIL", {
                from: /^\/previews\/[^\/]+\/all/,
                to: /^(?!\/previews\/[^\/]+\/all)/,
                fadeOut: "#wrap > *, footer, header"
            }),
            this.addTransition("SHOP/PREVIEW ALL -> *", {
                from: /^(\/shop\/all)|(\/previews\/[^\/]+\/all)/,
                fadeOut: "#wrap > *, footer",
                fadeIn: "#wrap > *, footer"
            }),
            this.addTransition("PRODUCT -> PRODUCT", {
                from: /^\/shop\/(?!all)([^\/]+)\/([^\/]+).*$/,
                to: /^\/shop\/(?!all)([^\/]+)\/([^\/]+)$/,
                fadeOut: "article, #details",
                fadeIn: "article, #details",
                loader: "#wrap"
            }),
            this.addTransition("PRODUCT -> STYLE", {
                from: /^\/shop\/(?!all)[^\/]+\/([^\/]+).*$/,
                to: /^\/shop\/(?!all)([^\/]+)\/([^\/]+)\/([^\/]+)$/,
                fadeOut: "",
                fadeIn: function() {
                    return $("article figure img").css({
                        opacity: 1
                    })
                },
                loader: "article figure img"
            }),
            this.addTransition("LOOKBOOK -> PREVIEW", {
                from: /^\/lookbooks/,
                to: /^\/previews/,
                fadeOut: "#wrap > *, footer, header",
                fadeIn: "#wrap > *, footer, header"
            }),
            this.addTransition("* -> LOGO FOOTER", {
                to: /^(\/previews\/\w+\/(?!all).*)|(\/news\/\w+\/images)|(\/random\/\w+)|(\/lookbooks)|(\/lookbook\/\d+)/,
                fadeOut: "#wrap > *:not(footer), header, body > footer"
            }),
            this.addTransition("* -> FOOTER CHANGED", {
                from: /^(?!(\/news)|(\/stores)|(\/about)|(\/mailinglist)|(\/contact))/,
                to: /^(\/news)|(\/stores)|(\/about)/,
                fadeOut: "#wrap > *, footer",
                fadeIn: "#wrap > *, footer"
            }),
            this.addTransition("* -> FOOTER CHANGED 1", {
                from: /^(\/news)|(\/stores)|(\/about)|(\/mailinglist)|(\/contact)/,
                to: /^(\/shop)|(\/collections)|(\/previews)/,
                fadeOut: "#wrap > *, footer",
                fadeIn: "#wrap > *, footer"
            }),
            this.addTransition("DEFAULT", r)
        },
        performExtraFadeIns: function(e) {
            return $.each(e, function(e, t) {
                return t.call()
            })
        },
        performTransition: function(t, r, i) {
            var s, o, u;
            s = r[t];
            if ($.type(s) === "string")
                return o = 1,
                u = 0,
                t === "fadeOut" ? (u = 1,
                o = 0) : $(r.loader || "#wrap").removeClass("loading"),
                i && n.performExtraFadeIns(i),
                $(s).css({
                    opacity: u
                }).animate({
                    opacity: o
                }, e, function() {
                    if (t === "fadeOut")
                        return $(r.loader || "#wrap").addClass("loading")
                }),
                {};
            if ($.type(s) === "function")
                return s(i);
            throw "" + s + " was not string or function"
        },
        transitionFor: function(e, t, n) {
            var r, i, s, o;
            o = this._transitions;
            for (i = 0,
            s = o.length; i < s; i++) {
                r = o[i];
                if (r[e] != null && r.from.test("" + t) && r.to.test("" + n))
                    return r
            }
        },
        performfadeOut: function() {
            var e;
            return e = this.transitionFor("fadeOut", this.currentLocationPathname, location.pathname),
            this.extraFadeIns = this.performTransition("fadeOut", e)
        },
        performfadeIn: function() {
            var e;
            return e = this.transitionFor("fadeIn", this.previousLocationPathname, location.pathname),
            this.performTransition("fadeIn", e, this.extraFadeIns)
        }
    },
    jQuery(function() {
        if (this.Supreme == null )
            return n.init(),
            this.Supreme = n
    })
}
.call(this),
function() {
    var e, t, n, r, i = [].slice;
    t = /^([^\/@\s\\]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i,
    n = /^\s?$/,
    e = function(e) {
        var r;
        return r = e.val(),
        /email/.test(e.attr("id")) ? t.test(r) : !n.test(r)
    }
    ,
    r = function() {
        var t, n, s, o, u, a, f;
        u = 1 <= arguments.length ? i.call(arguments, 0) : [],
        r = !0;
        for (a = 0,
        f = u.length; a < f; a++)
            o = u[a],
            s = $("#" + o),
            n = (t = s.data("error-display")) ? $(t) : s.parent(),
            e(s) ? n.removeClass("error") : (r = !1,
            n.addClass("error"));
        return r
    }
    ,
    this.Validator = {
        valid: r
    }
}
.call(this),
function() {
    var e = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    };
    this.BaseImageViewer = function() {
        function t(t, n, r, i, s) {
            var o, u, a = this;
            this.controller = t,
            this.imageSelector = n,
            this.data = r,
            this.imageLoader = i,
            this.mouseUpListener = e(this.mouseUpListener, this),
            this.mouseDownListener = e(this.mouseDownListener, this),
            this.mouseMoveListener = e(this.mouseMoveListener, this),
            this.imageDidLoad = e(this.imageDidLoad, this),
            this.showImage = e(this.showImage, this),
            this.showInitialImage = e(this.showInitialImage, this),
            this.setImageData = e(this.setImageData, this),
            this.initialImageLoaded = e(this.initialImageLoaded, this),
            this.clickListener = e(this.clickListener, this),
            o = {
                centerSmallImageVertically: !1,
                smallImageContainer: "#container",
                smallImageLoaderContainer: "#container",
                fadeSmallImage: !0,
                smallImagePadding: 40
            },
            this.options = $.extend(o, s || {}),
            this._mousePositionActionsEnabled = !0,
            this.urlsLoaded = [],
            BaseImageController.isTouchDevice() || ($("#wrap #container").live("mousemove", this.mouseMoveListener),
            $("#wrap #container").live("mousedown", this.mouseDownListener),
            $("#wrap #container").live("mouseup", this.mouseUpListener),
            $("#wrap #container").live("click", this.clickListener),
            $("#wrap").find(".controls").live("mousemove", function() {
                return $("#cursor-image").hide()
            }),
            $("#wrap").find(".button").live("mousemove", function() {
                return $("#cursor-image").hide()
            })),
            $("footer").hover(function() {
                return a.setMousePositionActionsEnabled(!1)
            }, function(e) {
                return a.setMousePositionActionsEnabled(!0)
            }),
            this.spinnerPromise = new $.Deferred,
            this.spinnerPromise.done(function() {
                return $(a.options.smallImageContainer).addClass("loading")
            }),
            setTimeout(function() {
                return a.spinnerPromise.resolve()
            }, 100),
            u = $(this.imageSelector)[0],
            $.browser.msie && (u.src = u.src + "?forceLoadEvent"),
            u != null && (u.onload = this.initialImageLoaded),
            this.imageLoader.imageLoaded(u) && this.initialImageLoaded()
        }
        return t.prototype.clickListener = function(e) {
            e.preventDefault();
            switch (this.mouseAction(e)) {
            case "prevImage":
                this.controller.showPrevImage();
                break;
            case "nextImage":
                this.controller.showNextImage();
                break;
            case "zoomImage":
                this.controller.tryShowingLightbox()
            }
            return this.controller.cursorForAction(this.mouseAction(e))
        }
        ,
        t.prototype.destroy = function() {
            var e;
            return $(this.imageSelector).off("mouseover"),
            $(this.imageSelector).off("mouseout"),
            $(document).off("mousemove"),
            $(document).off("click"),
            $("footer").off("hover"),
            (e = this.imageLoader) != null ? e.cancel() : void 0
        }
        ,
        t.prototype.initialImageLoaded = function() {
            var e;
            this.spinnerPromise.reject(),
            e = $(this.imageSelector);
            if (e[0] != null )
                return this.showInitialImage()
        }
        ,
        t.prototype.setImageData = function(e) {
            var t, n;
            return n = e.naturalWidth || e.width,
            t = e.naturalHeight || e.height,
            $(e).data("width", n).data("height", t)
        }
        ,
        t.prototype.showInitialImage = function() {
            var e;
            return e = $(this.imageSelector),
            this.setImageData(e[0]),
            this.imageDidLoad($(this.imageSelector)[0]),
            e.animate({
                opacity: 1
            }),
            $(this.options.smallImageContainer).removeClass("loading"),
            $("#wrap footer").show(),
            this.imageLoader.preloadAll()
        }
        ,
        t.prototype.on = function(e, t) {
            return $(this).bind(e, t)
        }
        ,
        t.prototype.off = function(e, t) {
            return $(this).unbind(e, t)
        }
        ,
        t.prototype.setMousePositionActionsEnabled = function(e) {
            this._mousePositionActionsEnabled = e
        }
        ,
        t.prototype.showImage = function(e) {
            var t, n = this;
            t = this.controller.zoomedImageUrl(this.index) || this.controller.imageUrl(this.index);
            if ($(this.imageSelector).attr("src") !== t)
                return this.imageLoader.loadImage({
                    url: t,
                    selector: this.imageSelector,
                    displayCompletedCallback: function(e) {
                        return n.controller.isChangingImage = !1
                    },
                    loadingCompletedCallback: this.imageDidLoad,
                    loadingSelector: this.options.smallImageLoaderContainer,
                    noFadeOut: !this.options.fadeSmallImage,
                    noFadeIn: !this.options.fadeSmallImage
                })
        }
        ,
        t.prototype.imageDidLoad = function(e) {
            return $("#wrap img").css("visibility", "visible"),
            this.imageLoader.didLoad(e)
        }
        ,
        t.prototype.mouseAction = function(e) {
            if (!this._mousePositionActionsEnabled)
                return "noop";
            if (e.pageX < $(window).width() / 3) {
                if (this.controller.hasPrevImage())
                    return "prevImage"
            } else if (e.pageX > $(window).width() / 3 * 2) {
                if (this.controller.hasNextImage())
                    return "nextImage"
            } else if (this.controller.hasZoom())
                return "zoomImage"
        }
        ,
        t.prototype.mouseMoveListener = function(e) {
            return this.controller.setCursorImageLocation(e),
            this.controller.cursorForAction(this.mouseAction(e))
        }
        ,
        t.prototype.mouseDownListener = function(e) {
            var t;
            t = $("#cursor-image");
            if (t[0] != null && typeof t.attr("class") != "undefined")
                return t.attr("class", t.attr("class").replace("-down", "")),
                t.attr("class", t.attr("class") + "-down")
        }
        ,
        t.prototype.mouseUpListener = function(e) {
            var t;
            t = $("#cursor-image");
            if (t[0] != null && typeof t.attr("class") != "undefined")
                return t.attr("class", t.attr("class").replace("-down", ""))
        }
        ,
        t
    }()
}
.call(this),
function() {
    var e = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
      , t = {}.hasOwnProperty
      , n = function(e, n) {
        function i() {
            this.constructor = e
        }
        for (var r in n)
            t.call(n, r) && (e[r] = n[r]);
        return i.prototype = n.prototype,
        e.prototype = new i,
        e.__super__ = n.prototype,
        e
    };
    this.PreviewImageViewer = function(t) {
        function r(t, n, i, s, o) {
            this.setPageDimensions = e(this.setPageDimensions, this),
            this.resizeImage = e(this.resizeImage, this),
            this.showImage = e(this.showImage, this),
            this.imageDidLoad = e(this.imageDidLoad, this),
            this.calculatePageDimensions = e(this.calculatePageDimensions, this),
            this.maxDefaultHeight = e(this.maxDefaultHeight, this),
            r.__super__.constructor.call(this, t, n, i, s, o)
        }
        return n(r, t),
        r.prototype.maxDefaultHeight = function() {
            var e, t, n = this;
            return e = $("#container").data("images"),
            t = 700,
            $.each(e, function(e, n) {
                if (n.customDefaultHeight > t)
                    return t = n.customDefaultHeight
            }),
            t
        }
        ,
        r.prototype.calculatePageDimensions = function() {
            var e, t;
            return e = {},
            t = this.maxDefaultHeight() + 75,
            $(window).height() > 800 ? (e.wrapHeight = $(window).height() - 25,
            e.wrapHeight > t && (e.wrapHeight = t),
            e.headerNegativeMargin = -((e.wrapHeight + 30) / 2)) : (e.wrapHeight = $(window).height() - 65,
            e.headerNegativeMargin = -((e.wrapHeight + 5) / 2)),
            e.containerHeight = e.wrapHeight - 55,
            e.containerMarginBottom = e.containerHeight / 30,
            e
        }
        ,
        r.prototype.imageDidLoad = function(e) {
            var t, n, i;
            return i = this.calculatePageDimensions(),
            this.setPageDimensions(i),
            this.resizeImage(e, i),
            n = $(e).hasClass("movie") ? $(e).height() : e.height,
            t = (i.containerHeight - n) / 2,
            $(e).css({
                marginTop: t
            }),
            r.__super__.imageDidLoad.call(this, e)
        }
        ,
        r.prototype.showImage = function(e) {
            var t, n = this;
            return t = this.controller.zoomedImageUrl(this.index) || this.controller.imageUrl(this.index),
            $(this.imageSelector).attr("src") !== t && t.match(/\.(mp4|flv)$/) ? this.imageLoader.loadVideo({
                url: t,
                height: this.data[e].customDefaultHeight,
                width: this.data[e].customDefaultWidth,
                selector: this.imageSelector,
                displayCompletedCallback: function(e) {
                    return n.controller.isChangingImage = !1
                },
                loadingCompletedCallback: this.imageDidLoad,
                loadingSelector: this.options.smallImageLoaderContainer
            }) : r.__super__.showImage.call(this, e)
        }
        ,
        r.prototype.mouseAction = function(e) {
            if (!($("div.movie:visible").length > 0))
                return r.__super__.mouseAction.call(this, e);
            if (!this._mousePositionActionsEnabled)
                return "noop";
            if (e.pageX < $("div.movie:visible").offset().left) {
                if (this.controller.hasPrevImage())
                    return "prevImage"
            } else if (e.pageX > $("div.movie:visible").offset().left + $("div.movie:visible").width() && this.controller.hasNextImage())
                return "nextImage"
        }
        ,
        r.prototype.resizeImage = function(e, t) {
            var n, r, i;
            return i = this.controller.getImageDataRecord(e) || {},
            r = $(window).width() - 42,
            i.customDefaultWidth ? r = i.customDefaultWidth < r ? i.customDefaultWidth : r : i.customDefaultHeight || r > 1200 && (r = 1200),
            n = t.containerHeight - 10,
            i.customDefaultHeight ? n = i.customDefaultHeight < n ? i.customDefaultHeight || n : n : i.customDefaultWidth || n > 700 && (n = 700),
            BaseImageController.resizeImageToAspectFit(e, r, n)
        }
        ,
        r.prototype.setPageDimensions = function(e) {
            return $("#wrap").css({
                height: e.wrapHeight
            }),
            $("#container").css({
                marginBottom: e.containerMarginBottom,
                height: e.containerHeight
            }),
            $("#header").css({
                marginTop: e.headerNegativeMargin,
                marginBottom: 0
            })
        }
        ,
        r
    }(this.BaseImageViewer)
}

.call(this),
function() {
    var e = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
      , t = {}.hasOwnProperty
      , n = function(e, n) {
        function i() {
            this.constructor = e
        }
        for (var r in n)
            t.call(n, r) && (e[r] = n[r]);
        return i.prototype = n.prototype,
        e.prototype = new i,
        e.__super__ = n.prototype,
        e
    };
    this.PreviewTouchImageViewer = function(t) {
        function r(t, n, i, s, o, u) {
            this.swipeCallback = e(this.swipeCallback, this),
            this.displayVideo = e(this.displayVideo, this),
            this.showImage = e(this.showImage, this),
            this.sizeSlider = e(this.sizeSlider, this),
            this.resizeImage = e(this.resizeImage, this),
            this.positionAndAdjustFooter = e(this.positionAndAdjustFooter, this),
            this.positionAndAdjustHeader = e(this.positionAndAdjustHeader, this),
            this.orientationChanged = e(this.orientationChanged, this),
            this.isLandscape = e(this.isLandscape, this),
            this.imageLoaded = e(this.imageLoaded, this),
            this.clicked = e(this.clicked, this);
            var a, f, l, c, h, p = this;
            r.__super__.constructor.call(this, t, n, i, s, o),
            $("#wrap #container").on("click", this.clicked),
            $(window).on("orientationchange", this.orientationChanged),
            a = $("#container[data-images]"),
            c = function() {
                var e, t, n, r;
                n = a.data("images"),
                r = [];
                for (e = 0,
                t = n.length; e < t; e += 1)
                    l = n[e],
                    (l.zoomedImageUrl || l.imageUrl).match(/\.(mp4|flv)$/) ? (h = l.customDefaultWidth || 1024,
                    f = l.customDefaultHeight || 576,
                    h > 938 && (f = Math.ceil(f * 938 / h)),
                    r.push('<li><div class="movie" id="img-main" style="height:' + f + 'px"><div id="tmp_video" data-video="' + (l.zoomedImageUrl || l.imageUrl).split("/").reverse()[0] + '"></div></div>')) : r.push('<li><img data-src="' + (l.zoomedImageUrl || l.imageUrl) + '"></li>');
                return r
            }(),
            a.html('<div id="slider"><ul>' + c.join("") + "</ul></div>"),
            this.length = a.data("images").length,
            $.each(a.find("ul li img"), function(e, t) {
                return t.onload = function() {
                    return p.imageLoaded(t)
                }
                ,
                $(t).attr("src", $(t).data("src"))
            }),
            this.sizeSlider(),
            this.swipe = new Swipe(document.getElementById("slider"),{
                callback: this.swipeCallback
            }),
            $("#slider ul li").css({
                verticalAlign: "middle"
            }),
            this.swipe.slide(u, 0)
        }
        return n(r, t),
        r.prototype.mouseAction = function(e) {
            var t;
            t = r.__super__.mouseAction.call(this, e);
            if (t)
                return t;
            if ($(e.target).is("#slider ul li img") && this.controller.hasZoom())
                return "zoomImage"
        }
        ,
        r.prototype.clicked = function(e) {
            switch (this.mouseAction(e)) {
            case "prevImage":
                return this.controller.backControlClicked(e);
            case "nextImage":
                return this.controller.forwardControlClicked(e);
            case "zoomImage":
                return this.controller.tryShowingLightbox()
            }
        }
        ,
        r.prototype.imageLoaded = function(e) {
            var t, n, r;
            return n = {
                width: $("#slider").width(),
                height: $("#slider").height()
            },
            this.positionAndAdjustHeader(),
            r = e.naturalWidth || e.width,
            t = e.naturalHeight || e.height,
            $(e).data("width", r).data("height", t),
            this.positionAndAdjustFooter(),
            this.resizeImage(e)
        }
        ,
        r.prototype.isLandscape = function() {
            return $(window).height() < $(window).width()
        }
        ,
        r.prototype.orientationChanged = function() {
            var e, t = this;
            return e = $("#container[data-images]"),
            $.each(e.find("ul li img"), function(e, t) {
                return $(t).hide()
            }),
            this.sizeSlider(),
            this.positionAndAdjustHeader(),
            setTimeout(function() {
                return $.each(e.find("ul li img"), function(e, n) {
                    return setTimeout(function() {
                        return t.resizeImage(n)
                    }, 0),
                    $(n).show(),
                    $(n).parent().css({
                        verticalAlign: "middle"
                    })
                })
            }, 0)
        }
        ,
        r.prototype.positionAndAdjustHeader = function() {
            var e, t, n;
            return n = {
                width: $("#slider").width(),
                height: $("#slider").height()
            },
            e = 85,
            t = ($(window).height() - n.height - e) / 2,
            $("#header").css({
                height: t,
                margin: 0
            })
        }
        ,
        r.prototype.positionAndAdjustFooter = function() {
            var e;
            return this.isLandscape() ? e = $(window).height() * .06 : e = $("#container").height() / 17.5,
            $("#wrap #container").css({
                height: "auto",
                marginBottom: e
            }),
            $("#wrap footer").show()
        }
        ,
        r.prototype.resizeImage = function(e) {
            var t, n;
            return n = {
                width: $("#slider").width(),
                height: $("#slider").height()
            },
            t = this.controller.getImageDataRecord(e),
            t && t.customDefaultWidth && t.customDefaultWidth < n.width && (n.width = t.customDefaultWidth),
            t && t.customDefaultHeight && t.customDefaultHeight < n.height && (n.height = t.customDefaultHeight),
            BaseImageController.resizeImageToAspectFit(e, n.width - 4, n.height),
            $(e).css({
                marginTop: Math.max(0, $("#container[data-images]").height() / 2 - this.height / 2)
            })
        }
        ,
        r.prototype.sizeSlider = function() {
            var e;
            return e = {
                width: $(window).width(),
                height: window.innerHeight - 130
            },
            e.height > 700 && (e.height = 700),
            $("#slider").css({
                width: e.width,
                height: e.height
            }),
            $("#slider ul").css({
                height: e.height
            }),
            $("#slider ul li").css({
                width: e.width,
                height: e.height
            })
        }
        ,
        r.prototype.showImage = function(e) {
            this.swipe.slide(e),
            e < this.length - 1 && $("#tmp_video").length > 0 && jwplayer("tmp_video").remove();
            if (e === this.length - 1 && $("#tmp_video").length > 0)
                return this.displayVideo()
        }
        ,
        r.prototype.displayVideo = function() {
            var e, t;
            return t = $("#tmp_video").data("video"),
            e = jwplayer("tmp_video").setup({
                file: "http://d3o425gsw3lvjf.cloudfront.net/" + t,
                image: "http://images.supremenewyork.com/assets/splash/" + t.replace(/\.(mp4|flv)$/, ".jpg"),
                modes: [{
                    type: "flash",
                    src: "http://images.supremenewyork.com/assets/jwplayer/jw_player.swf"
                }, {
                    type: "html5"
                }],
                width: "100%",
                height: "100%",
                skin: "http://images.supremenewyork.com/assets/jwplayer/bekle/bekle.xml"
            })
        }
        ,
        r.prototype.swipeCallback = function() {
            this.controller.isChangingImage = !1,
            this.controller.index = this.swipe.getPos(),
            this.controller.pushImageState(),
            this.controller.adjustControls(this.controller.index),
            this.controller.index === this.length - 1 && $("#tmp_video").length > 0 && this.displayVideo();
            if (this.controller.index < this.length - 1 && $("#tmp_video").length > 0)
                return jwplayer("tmp_video").remove()
        }
        ,
        r
    }(this.PreviewImageViewer)
}
.call(this),
function() {
    jQuery(function(e) {
        return window.mapsHaveLoaded = !1,
        window.mapsLoadedCallback = function() {
            return window.mapsHaveLoaded = !0,
            e("body").trigger("mapsLoaded")
        }
        ,
        window.loadMaps = function() {
            var e;
            return e = document.createElement("script"),
            e.type = "text/javascript",
            e.src = "//maps.googleapis.com/maps/api/js?key=AIzaSyBWKeU3LuhGgegdTQa7u0LrPuR-8QeZ9mM&sensor=false&v=3.10&callback=mapsLoadedCallback",
            document.body.appendChild(e)
        }
    })
}
.call(this),
function() {
    var e = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    };
    this.Marque = function() {
        function t(t) {
            var n;
            this.selector = t,
            this.marquee = e(this.marquee, this),
            this.speed = 3,
            this.interval = 60,
            this.paused = !1,
            this.secondItemShown = !1,
            this.timeoutId = null ,
            this.draggedItem = null ,
            this.otherItem = null ,
            this.draggedItemIndex = null ,
            $("body").css({
                padding: 0
            }),
            n = $(this.selector),
            n.css({
                position: "absolute",
                left: $(window).width()
            }),
            n.after(n.clone().data("clone", !0).hide()),
            this.makeDraggable(this.selector),
            this.timeoutId = window.setTimeout(this.marquee, this.interval)
        }
        return t.prototype.stop = function() {
            return window.clearTimeout(this.timeoutId),
            $(this.selector).off("mousedown").off("mouseup").off("drag")
        }
        ,
        t.prototype.makeDraggable = function(e) {
            var t = this;
            return $(e).draggable({
                axis: "x",
                stop: function() {
                    return t.paused = !1,
                    !0
                },
                start: function(e) {
                    return t.draggedItem = $(e.target),
                    t.draggedItemIndex = t.draggedItem.index(),
                    t.otherItem = t.draggedItemIndex === 0 ? $("" + t.selector + ":last-of-type") : $("" + t.selector + ":first-of-type"),
                    t.paused = !0,
                    !0
                }
            }).on("drag", function(e) {
                return t.draggedItemIndex === 0 ? t.otherItem.css({
                    left: t.draggedItem.offset().left + t.draggedItem.width()
                }) : t.otherItem.css({
                    left: t.draggedItem.offset().left - t.otherItem.width()
                })
            })
        }
        ,
        t.prototype.marquee = function() {
            var e, t;
            return this.paused || (t = $("" + this.selector + ":first-of-type"),
            e = t.offset(),
            t.css({
                left: e.left - this.speed
            }),
            $("" + this.selector + ":last-of-type").css({
                left: e.left - this.speed + t.width()
            }),
            e.left < 0 && !this.secondItemShown && (this.secondItemShown = !0,
            $(this.selector).show()),
            e.left < 0 && e.left < -t.width() && (t.parent().append(t.remove()),
            this.makeDraggable($("" + this.selector + ":last-of-type")))),
            this.timeoutId = window.setTimeout(this.marquee, this.interval)
        }
        ,
        t
    }()
}
.call(this),
function() {
    jQuery(function() {
        var e, t;
        return $("#current-lang").click(function() {
            var e;
            return e = 10,
            Supreme.showLanguageSetter($(this).offset().top - e, $(this).offset().left - e)
        }),
        $("body").on("click", ".shop_link", function() {
            return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? window.location = "/mobile/" : Turbolinks.visit($(this).get(0).href),
            !1
        }),
        $("body").on("click", ".comment_release", function() {
            return $(".release_comment_form").slideToggle(),
            $(".release_comment_form_successful").hide(),
            !1
        }),
        $(document).on("submit", ".release_comment_form", function() {
            return $('.release_comment_form input[type="submit"]').prop("disabled", !0),
            $.post($(this).attr("action"), $(".release_comment_form").serialize(), function() {
                return $('.release_comment_form input[type="submit"]').prop("disabled", !1),
                $("#body").val(""),
                $(".release_comment_form").fadeOut(function() {
                    return $(".release_comment_form_successful").fadeIn(function() {
                        return setTimeout(function() {
                            if ($(".release_comment_form_successful").is(":visible"))
                                return $(".release_comment_form_successful").fadeOut()
                        }, 5e3)
                    })
                })
            }),
            !1
        }),
        $("body").on("click", ".approve_release", function() {
            return $(".approve_release").text() !== "Release approved" && $.post(this.href, function() {
                return $(".approve_release").text("release approved").css({
                    cursor: "text",
                    backgroundColor: "white",
                    color: "black"
                })
            }),
            !1
        }),
        $("body").on("click", ".lookbook_link", function() {
            return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? window.location = "/mobile/#lookbook" : Turbolinks.visit($(this).get(0).href),
            !1
        }),
        $("body").hasClass("eu") && $("body").hasClass("home") && setTimeout(function() {
            return Supreme.showCookieNotice()
        }, 1e3),
        $("input, textarea").placeholder(),
        t = function(e, t, n) {
            return t == null && (t = $(window).width()),
            n == null && (n = $(window).height()),
            e.width / t > e.height / n ? t = Math.round(n * (e.width / e.height)) : n = Math.round(t / (e.width / e.height)),
            e.width = t,
            e.height = n
        }
        ,
        $("body.home #background-image")[0] != null && (e = $("body.home #background-image")[0],
        e.onload = function() {
            return t(this),
            $(this).css({
                display: "block"
            }).animate({
                opacity: 1
            }, 1200)
        }
        ,
        e.src = $("#background-image").data("image"),
        $(e).css({
            opacity: 0
        }),
        $(window).on("resize", function() {
            return t($("#background-image")[0])
        }),
        $(document).one("page:change", function() {
            return $(window).off("resize")
        }),
        $("body.home header").fadeIn(1e3).css({
            display: "block"
        }),
        $("body.home #wrap").fadeIn(1e3),
        $("body.home").animate({
            backgroundColor: "#000"
        }, 1e3)),
        $("img").live("dragstart", function(e) {
            return e.preventDefault()
        })
    })
}
.call(this),
function() {
    jQuery(function(e) {
        return this.newsControlsCallback = function() {
            var t = this;
            if (e(".news_container figure:not(.controls_callback_applied)")[0] != null )
                return e(".news_container figure:not(.controls_callback_applied)").each(function(n, r) {
                    var i, s, o, u;
                    return e(r).addClass("controls_callback_applied"),
                    s = null ,
                    n = null ,
                    u = t.Turbolinks.willVisit,
                    o = function(t, o) {
                        var u;
                        return u = function(u) {
                            return n += t,
                            e(r).attr("data-index", n),
                            e(o).animate({
                                opacity: 0
                            }, 500, function() {
                                return this.onload = function() {
                                    return e(o).css("margin-top", (280 - e(o).height()) / 2 + "px"),
                                    e(this).animate({
                                        opacity: 1
                                    })
                                }
                                ,
                                this.src = s[n]
                            }),
                            e(o).parent().attr("href") && e(o).parent().attr("href", e(o).parent().attr("href").replace(/image=\d+/, "image=" + n)),
                            i(n),
                            u.preventDefault(),
                            !1
                        }
                    }
                    ,
                    i = function(t) {
                        e(r).parent(".news_container").find(".controls a.back")[t < 1 ? "addClass" : "removeClass"]("hidden-placeholder"),
                        e(r).parent(".news_container").find(".controls a.forward")[t < s.length - 1 ? "removeClass" : "addClass"]("hidden-placeholder"),
                        e(r).parent(".news_container").find(".controls span").html(t + 1),
                        s[t].title != null && e("footer .description h2").html(s[t].title);
                        if (s[t].caption != null )
                            return e("footer .description p").html(s[t].caption)
                    }
                    ,
                    e(r).parent(".news_container").find(".controls a").attr("data-no-turbolink", ""),
                    s = e(r).data("image-urls"),
                    n = e(r).data("index"),
                    e(r).parent(".news_container").find(".controls a.back").on("click", o(-1, "#" + e(r).attr("id") + " img")),
                    e(r).parent(".news_container").find(".controls a.forward").on("click", o(1, "#" + e(r).attr("id") + " img"))
                })
        }
        ,
        this.newsControlsCallback()
    })
}
.call(this),
function() {
    jQuery(function(e) {
        var t, n, r, i, s, o, u, a, f, l, c, h, p, d;
        if (e("body.stores")[0] != null )
            return window.loadMaps(),
            n = {
                store_1: {
                    lat: 40.723981,
                    lng: -73.996206
                },
                store_2: {
                    lat: 34.079298,
                    lng: -118.361576
                },
                store_3: {
                    lat: 35.65312923421094,
                    lng: 139.7053174674511
                },
                store_4: {
                    lat: 34.67107367572279,
                    lng: 135.49581840634346
                },
                store_5: {
                    lat: 33.587066,
                    lng: 130.394994
                },
                store_6: {
                    lat: 35.6691815041263,
                    lng: 139.70672965049744
                },
                store_7: {
                    lat: 35.166156,
                    lng: 136.904849
                },
                store_8: {
                    lat: 51.512704,
                    lng: -0.134369
                },
                store_9: {
                    lat: 35.66268558323531,
                    lng: 139.69990074634552
                },
                store_10: {
                    lat: 48.8592932,
                    lng: 2.3604969
                }
            },
            t = function(t) {
                var n;
                return n = e(t).clone(),
                n.children("img").remove(),
                n.children("br").remove(),
                n.html()
            }
            ,
            r = function(e) {
                return e.target.tagName === "A" ? e.stopPropagation() : c(e)
            }
            ,
            i = function(t, r) {
                var i, s, o, u;
                return i = "store_" + t,
                u = new google.maps.LatLng(n[i].lat,n[i].lng),
                s = new google.maps.Map(e("#" + r)[0],a(u)),
                o = new google.maps.Marker({
                    map: s,
                    draggable: !1,
                    position: u,
                    icon: "/images/map-marker.gif"
                })
            }
            ,
            s = function(e, t) {
                return setTimeout(d, 100, e, t)
            }
            ,
            o = function() {
                var t;
                return t = e("#store-modal"),
                t.children("img").attr("src", "")
            }
            ,
            u = function() {
                return e("#store-modal-background").fadeOut({
                    duration: 100,
                    complete: function() {
                        return o()
                    }
                })
            }
            ,
            l = function(e) {
                var t;
                return t = (new Date).getTime(),
                "store-map-" + e + "-" + t
            }
            ,
            a = function(e) {
                return {
                    zoom: 16,
                    center: e,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: !1,
                    streetViewControl: !1,
                    mapTypeControl: !1,
                    styles: f()
                }
            }
            ,
            f = function() {
                return [{
                    featureType: "all",
                    stylers: [{
                        saturation: -100
                    }, {
                        gamma: .5
                    }]
                }, {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{
                        visibility: "off"
                    }]
                }]
            }
            ,
            c = function(n) {
                var r, i, o;
                return e(n.currentTarget).data("store-path") ? this.Turbolinks.visit(window.location.href.replace("/stores", e(n.currentTarget).data("store-path"))) : (o = e(n.currentTarget).data("store-id"),
                r = e("#store-modal"),
                r.children(".address").html(t(n.currentTarget)),
                r.children("img").attr("src", e(n.currentTarget).data("zoomed-image")),
                r.css("top", e("article img").offset().top - e(window).scrollTop() + "px"),
                i = l(o),
                r.children(".map").remove(),
                r.append("<div class='map' id='" + i + "'></div>"),
                e("#store-modal-background").fadeIn({
                    duration: 100,
                    complete: function() {
                        return s(o, i)
                    }
                }))
            }
            ,
            h = function(e) {
                if (e.target.id === "store-modal-background" || e.target.className === "spacer")
                    return u()
            }
            ,
            p = function(e) {
                return u()
            }
            ,
            d = function(t, n) {
                return window.mapsHaveLoaded ? i(t, n) : e("body").one("mapsLoaded", function() {
                    return i(t, n)
                })
            }
            ,
            e("article").on("click", r),
            e("#store-modal-background").on("click", h),
            e("#store-modal-background").find("img").on("click", p),
            e(".move-out").mouseout(function(t) {
                return e(this).removeClass("move-out")
            }),
            e(document).keydown(function(e) {
                if (e.which === 27)
                    return u()
            })
    })
}
.call(this),
window.Swipe = function(e, t) {
    if (!e)
        return null ;
    var n = this;
    this.options = t || {},
    this.index = this.options.startSlide || 0,
    this.speed = this.options.speed || 300,
    this.callback = this.options.callback || function() {}
    ,
    this.delay = this.options.auto || 0,
    this.container = e,
    this.element = this.container.children[0],
    this.container.style.overflow = "hidden",
    this.element.style.listStyle = "none",
    this.element.style.margin = 0,
    this.setup(),
    this.begin(),
    this.element.addEventListener && (this.element.addEventListener("touchstart", this, !1),
    this.element.addEventListener("touchmove", this, !1),
    this.element.addEventListener("touchend", this, !1),
    this.element.addEventListener("touchcancel", this, !1),
    this.element.addEventListener("webkitTransitionEnd", this, !1),
    this.element.addEventListener("msTransitionEnd", this, !1),
    this.element.addEventListener("oTransitionEnd", this, !1),
    this.element.addEventListener("transitionend", this, !1),
    window.addEventListener("resize", this, !1))
}
,
Swipe.prototype = {
    setup: function() {
        this.slides = this.element.children,
        this.length = this.slides.length;
        if (this.length < 2)
            return null ;
        this.width = Math.ceil("getBoundingClientRect"in this.container ? this.container.getBoundingClientRect().width : this.container.offsetWidth);
        if (!this.width)
            return null ;
        this.container.style.visibility = "hidden",
        this.element.style.width = Math.ceil(this.slides.length * this.width) + "px";
        var e = this.slides.length;
        while (e--) {
            var t = this.slides[e];
            t.style.width = this.width + "px",
            t.style.display = "table-cell",
            t.style.verticalAlign = "top"
        }
        this.slide(this.index, 0),
        this.container.style.visibility = "visible"
    },
    slide: function(e, t) {
        var n = this.element.style;
        t == undefined && (t = this.speed),
        n.webkitTransitionDuration = n.MozTransitionDuration = n.msTransitionDuration = n.OTransitionDuration = n.transitionDuration = t + "ms",
        n.MozTransform = n.webkitTransform = "translate3d(" + -(e * this.width) + "px,0,0)",
        n.msTransform = n.OTransform = "translateX(" + -(e * this.width) + "px)",
        this.index = e
    },
    getPos: function() {
        return this.index
    },
    prev: function(e) {
        this.delay = e || 0,
        clearTimeout(this.interval),
        this.index && this.slide(this.index - 1, this.speed)
    },
    next: function(e) {
        this.delay = e || 0,
        clearTimeout(this.interval),
        this.index < this.length - 1 ? this.slide(this.index + 1, this.speed) : this.slide(0, this.speed)
    },
    begin: function() {
        var e = this;
        this.interval = this.delay ? setTimeout(function() {
            e.next(e.delay)
        }, this.delay) : 0
    },
    stop: function() {
        this.delay = 0,
        clearTimeout(this.interval)
    },
    resume: function() {
        this.delay = this.options.auto || 0,
        this.begin()
    },
    handleEvent: function(e) {
        switch (e.type) {
        case "touchstart":
            this.onTouchStart(e);
            break;
        case "touchmove":
            this.onTouchMove(e);
            break;
        case "touchcancel":
        case "touchend":
            this.onTouchEnd(e);
            break;
        case "webkitTransitionEnd":
        case "msTransitionEnd":
        case "oTransitionEnd":
        case "transitionend":
            this.transitionEnd(e);
            break;
        case "resize":
            this.setup()
        }
    },
    transitionEnd: function(e) {
        this.delay && this.begin(),
        this.callback(e, this.index, this.slides[this.index])
    },
    onTouchStart: function(e) {
        this.start = {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
            time: Number(new Date)
        },
        this.isScrolling = undefined,
        this.deltaX = 0,
        this.element.style.MozTransitionDuration = this.element.style.webkitTransitionDuration = 0,
        e.stopPropagation()
    },
    onTouchMove: function(e) {
        if (e.touches.length > 1 || e.scale && e.scale !== 1)
            return;
        this.deltaX = e.touches[0].pageX - this.start.pageX,
        typeof this.isScrolling == "undefined" && (this.isScrolling = !!(this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY))),
        this.isScrolling || (e.preventDefault(),
        clearTimeout(this.interval),
        this.deltaX = this.deltaX / (!this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0 ? Math.abs(this.deltaX) / this.width + 1 : 1),
        this.element.style.MozTransform = this.element.style.webkitTransform = "translate3d(" + (this.deltaX - this.index * this.width) + "px,0,0)",
        e.stopPropagation())
    },
    onTouchEnd: function(e) {
        var t = Number(new Date) - this.start.time < 250 && Math.abs(this.deltaX) > 20 || Math.abs(this.deltaX) > this.width / 2
          , n = !this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0;
        this.isScrolling || this.slide(this.index + (t && !n ? this.deltaX < 0 ? 1 : -1 : 0), this.speed),
        e.stopPropagation()
    }
},
function() {
    jQuery(function(e) {
        var t, n, r, i = this;
        if (e(".preview-item #container[data-images]")[0] != null )
            return r = Modernizr.touch && Modernizr.csstransforms,
            e(".controls a").attr("data-no-turbolink", ""),
            n = e(".preview-item #container[data-images]").data("index"),
            window.imc = t = new this.PreviewImageController("#img-main",n,{
                centerSmallImageVertically: !0,
                smallImageLoaderContainer: ""
            }),
            e(".preview-item #container[data-images] a").click(function(e) {
                return !1
            })
    })
}
.call(this),
function() {
    jQuery(document).ready(function() {
        var e, t, n;
        if ($("#lookbook-items")[0] != null )
            return t = function() {
                var t, n, r, i;
                r = $("#lookbook-items li a[data-image-url]"),
                i = [];
                for (t = 0,
                n = r.length; t < n; t += 1)
                    e = r[t],
                    i.push({
                        url: $(e).attr("href"),
                        imageUrl: $(e).data("image-url"),
                        zoomedImageUrl: $(e).data("zoomed-image-url")
                    });
                return i
            }(),
            n = new this.LookBookImageController("#img-main",$("#img-main-link").data("index"),t,{
                fadeSmallImage: !1
            })
    })
}
.call(this),
function() {
    var e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g = [].indexOf || function(e) {
        for (var t = 0, n = this.length; t < n; t++)
            if (t in this && this[t] === e)
                return t;
        return -1
    }
    ;
    o = {},
    f = 0,
    p = !1,
    a = function() {
        return $("#shop-scroller-container").scrollLeft() + $("#shop-scroller-container").width() >= $("#shop-scroller").width()
    }
    ,
    u = function() {
        return $("#shop-scroller-container").scrollLeft() === 0
    }
    ,
    v = function(e) {
        var t, n, r, i, s, o, l, c = this;
        return t = e.parent(),
        l = 663,
        s = $("#left-scroller-arrow"),
        o = $("#right-scroller-arrow"),
        s.hide(),
        o.hide(),
        $(".arrow").on("mousedown", function(e) {
            if ($(this).hasClass("left") && u())
                return;
            if ($(this).hasClass("right") && a())
                return;
            return $(this).addClass("mousedown")
        }).on("mouseleave", function(e) {
            return $(this).removeClass("mousedown")
        }),
        $(".arrow").on("mouseup", function(e) {
            return $(this).removeClass("mousedown")
        }).on("mouseleave", function(e) {
            return $(this).removeClass("mousedown")
        }),
        t.css({
            overflow: "hidden"
        }),
        t.scrollLeft(e.width()),
        s.on("click", function(e) {
            return e.preventDefault()
        }),
        o.on("click", function(e) {
            return e.preventDefault(),
            t.stop().animate({
                scrollLeft: t.scrollLeft() + l
            }, 400, "easeOutCirc", function() {
                p = !0,
                a() && o.removeClass("enabled");
                if (u())
                    return s.removeClass("enabled")
            })
        }),
        s.on("click", function(e) {
            return e.preventDefault(),
            t.stop().animate({
                scrollLeft: t.scrollLeft() - l
            }, 400, "easeOutCirc", function() {
                p = !0,
                u() && s.removeClass("enabled");
                if (a())
                    return o.removeClass("enabled")
            })
        }),
        t.on("scroll", function() {
            a() && o.removeClass("enabled"),
            u() && s.removeClass("enabled");
            if (p)
                return f = t.scrollLeft()
        }),
        o.on("mouseenter", function(e) {
            return a() ? o.removeClass("enabled") : o.addClass("enabled")
        }),
        o.on("mouseleave", function(e) {
            return a() ? o.removeClass("enabled") : o.removeClass("enabled")
        }),
        s.on("mouseenter", function(e) {
            return u() ? s.removeClass("enabled") : s.addClass("enabled")
        }),
        s.on("mouseleave", function(e) {
            return u() ? s.removeClass("enabled") : s.removeClass("enabled")
        }),
        n = 2.4,
        Modernizr.touch && (n = .8),
        i = t.find("li").css("visibility", "hidden"),
        r = t.find("img"),
        r.imagesLoaded(function() {
            return i.css("visibility", "visible"),
            p = !1,
            f > 0 ? (s.show(),
            o.show(),
            t.addClass("webkit-scroll"),
            t.css({
                overflow: "auto"
            }),
            t.scrollLeft(f),
            s.removeClass("loading").attr("style", ""),
            o.removeClass("loading").attr("style", "")) : t.delay(500).animate({
                scrollLeft: 0
            }, e.width() / n, "easeOutSine", function() {
                return s.show(),
                o.show(),
                t.addClass("webkit-scroll"),
                t.css({
                    overflow: "auto"
                }),
                s.removeClass("loading").attr("style", ""),
                o.removeClass("loading").attr("style", "")
            })
        }),
        t.on("mousedown", function() {
            return p = !0
        })
    }
    ,
    t = function() {
        var e, t, n, r, i, s;
        return r = $.parseJSON($.cookie("pure_cart")),
        e = r != null ? r.cookie : void 0,
        s = (e || "").split("--"),
        n = s[0],
        i = s[1],
        t = s[2],
        s
    }
    ,
    i = function() {
        var e, n, r, i;
        return i = t(),
        n = i[0],
        r = i[1],
        e = i[2],
        ("" + n).length === 0 || /^0\s/.test("" + n)
    }
    ,
    l = function(e, t) {
        var n, i, s, o;
        n = 0;
        for (s = 0,
        o = e.length; s < o; s++)
            i = e[s],
            r(i) && n++;
        return n >= t
    }
    ,
    n = function(e) {
        var n, r, s, o, u, a, f, l, c;
        c = t(),
        r = c[0],
        a = c[1],
        n = c[2];
        if (i())
            return !1;
        u = function() {
            var e, t, r, i;
            r = n != null ? n.split("-") : void 0,
            i = [];
            for (e = 0,
            t = r.length; e < t; e += 1)
                s = r[e],
                i.push(parseInt(s.split(",")[1], 10));
            return i
        }();
        for (f = 0,
        l = e.length; f < l; f++) {
            o = e[f];
            if (g.call(u, o) >= 0)
                return !0
        }
        return !1
    }
    ,
    r = function(e) {
        return n([e])
    }
    ,
    s = function(e) {
        var n, r, i, s, o, u, a, f;
        f = t(),
        r = f[0],
        o = f[1],
        n = f[2],
        s = function() {
            var e, t, r, s;
            r = n != null ? n.split("-") : void 0,
            s = [];
            for (e = 0,
            t = r.length; e < t; e += 1)
                i = r[e],
                s.push($.map(i.split(","), function(e) {
                    return parseInt(e, 10)
                }));
            return s
        }();
        for (u = 0,
        a = s.length; u < a; u++) {
            i = s[u];
            if (i[1] === e)
                return i[0]
        }
    }
    ,
    m = null ,
    e = function(e) {
        var t, i, s, o;
        return i = function() {
            var e, n, r, i;
            r = $("body.products ul.styles a"),
            i = [];
            for (e = 0,
            n = r.length; e < n; e += 1)
                t = r[e],
                i.push($(t).data("style-id"));
            return i
        }(),
        o = jQuery.unique(i),
        s = $("#details").data("style-limited-with-count"),
        $(e).data("sold-out") ? "sold_out" : r($(e).data("style-id")) ? "remove" : n(i) && $("#details").data("style-limited") || s > 1 && l(o, s) ? "style_limited" : "add"
    }
    ,
    h = function(t) {
        var n;
        return this.Turbolinks.willVisit($(t).attr("href")),
        m != null && m.abort(),
        c(t),
        e(t) === "add" && (n = $(t).attr("href"),
        m = $.getScript(n)),
        $(t).closest("ul").find("a").removeClass("selected"),
        $(t).addClass("selected"),
        $('p[itemprop="model"]').html($(t).data("style-name")),
        $("article figure img").attr({
            src: $(t).data("images").detail_url
        }),
        $(t).data("description") && $(".description").html($(t).data("description")),
        $("#zoom-holder").css({
            background: "url(" + $(t).data("images").zoomed_url + ") 0 0  no-repeat"
        }),
        $("#zoom-holder").attr("data-background-image", $(t).data("images").zoomed_url)
    }
    ,
    c = function(t) {
        var n;
        switch (e(t)) {
        case "sold_out":
            return $("#cart-controls form, #cctrl form").replaceWith($("script#cart-controls-sold-out").html());
        case "remove":
            return n = s($(t).data("style-id")),
            $("#cart-controls form, #cctrl form").replaceWith($.nano($("script#cart-controls-remove").html(), {
                size_id: n
            }));
        case "style_limited":
            return $("#cart-controls form, #cctrl form").replaceWith($("script#cart-controls-limited").html())
        }
    }
    ,
    d = this.Turbolinks.visit,
    $(document).bind("page:change", function() {
        var e;
        if ((e = $("ul#shop-scroller"))[0] != null )
            return p = !1,
            v(e)
    }),
    jQuery(function() {
        var e, n, r, s, u, a, f, l, p, m, g, y, b, w, E, S, x, T, N = this;
        return (w = $("ul#shop-scroller"))[0] != null && v(w),
        y = $("body.products ul.styles a"),
        y[0] != null && (y.attr("data-no-tubolink", "data-no-tubolink"),
        n = function() {
            var t, n, r;
            r = [];
            for (t = 0,
            n = y.length; t < n; t++)
                e = y[t],
                r.push($(e).data("images").detail_url);
            return r
        }(),
        p = new this.Loader(n,1),
        p.preloadAll(),
        y.off("click").on("click", function(e) {
            return h(this),
            e.preventDefault()
        }),
        c($("body.products ul.styles a.selected")[0])),
        $("#cart")[0] != null && (i() ? ($("#cart").addClass("hidden"),
        $("#container").removeClass("has-cart")) : (x = t(),
        l = x[0],
        b = x[1],
        a = x[2],
        $("#items-count").html(l.replace("+", " ")),
        $("#subtotal").html(b),
        $("#subtotal_eu").length > 0 && $("#subtotal_eu").html(Supreme.addDelim(Math.round(Supreme.GBPtoEUR(b.replace("£", "").replace(",", ""))), ",") + "&euro;"),
        b.length >= 4 && ($("#subtotal").addClass("four-chars"),
        $("#subtotal_eu").addClass("four-chars")),
        $("#cart").removeClass("hidden"),
        $("#container").addClass("has-cart"))),
        $("form#cart-addf, form#cart-remove").on("ajax:beforeSend", function(e, t) {
            return $(N).find("input, button, select").attr("disabled", !0)
        }).on("ajax:error", function(e, t, n) {
            return d(window.location.href)
        }),
        $("body").unbind("cart:add").bind("cart:add", function() {
            var e;
            return e = $("#subtotal").closest("li"),
            e.effect("highlight", {
                color: "#FFAC9E"
            }, 1500)
        }),
        $("body").unbind("cart:remove").bind("cart:remove", function() {
            var e, t;
            return e = $.cookie("cart"),
            t = (e || "").split("--"),
            l = t[0],
            b = t[1],
            a = t[2],
            $("#cart-header #items-count").html(l.replace("+", " ")),
            $("#cart-total p span").html(b)
        }),
        $("#cart-body")[0] != null && ($(".cart-remove form").on("submit", function() {
            return $(this).closest("tr").fadeOut(500),
            $(document).one("page:load", function() {
                if (i())
                    return d("" + location.protocol + "//" + location.hostname + "/shop")
            })
        }),
        $(".cart-qty select").on("change", function() {
            return $(this).parent("form").submit()
        })),
        $("form#checkout_form")[0] != null && ($("form#checkout_form input[type=text], form#checkout_form input[type=email], form#checkout_form select").on("focus", function() {
            return $(this).closest(".input").addClass("focus")
        }).on("blur", function() {
            return $(this).closest(".input").removeClass("focus")
        }),
        $("body").hasClass("us") && $("#order_tel").mask("(999) 999-9999", {
            autoclear: !1
        }),
        $("body").hasClass("us") && $("#order_billing_country").val() === "USA" && !$("body").hasClass("payment_page") && $("#order_billing_zip").on("keyup", function(e) {
            var t, n;
            t = n = $(this).val();
            if (n.length >= 4)
                return n.length > 4 && (n = n.substring(0, 4)),
                $.ajax({
                    url: "https://supreme-images.s3.amazonaws.com/us-zipcodes/" + n + ".js",
                    success: function(e, r, i) {
                        var s, u, a, f;
                        o[n] = e;
                        if (t.length === 5) {
                            f = [];
                            for (u = 0,
                            a = e.length; u < a; u++)
                                s = e[u],
                                s.zipcode === t ? ($("#order_billing_city").val(s.city),
                                $("#order_billing_state").val(s.state),
                                f.push(E())) : f.push(void 0);
                            return f
                        }
                    },
                    cache: !0,
                    dataType: "jsonp",
                    jsonpCallback: "w"
                })
        }),
        $("#credit_card_number").validateCreditCard(function(e) {
            var t;
            if (e.luhn_valid)
                return t = e.card_type.name,
                t === "amex" && (t = "american_express"),
                t === "mastercard" && (t = "master"),
                $("#credit_card_type").val(t)
        }, {
            accept: ["visa", "amex", "mastercard", "maestro"]
        }),
        $("body").hasClass("us") && ($("#checkout_form").validate({
            errorElement: "span",
            highlight: function(e, t, n) {
                return $(e).parent().addClass("error")
            },
            unhighlight: function(e, t, n) {
                return $(e).parent().removeClass("error")
            },
            errorPlacement: function(e, t) {
                return e.appendTo(t.parent())
            },
            errorClass: "error js",
            success: function(e) {
                return e.remove()
            }
        }),
        $.validator.addMethod("first_and_last", function(e) {
            return FIRST_AND_LAST_NAME_FORMAT.test(e)
        }, "must contain first and last name"),
        $.validator.addMethod("tel", function(e) {
            return TEL_FORMAT.test(e.replace(/-|\(|\)|\s/g, ""))
        }, "must be a 10-digit phone number"),
        $.validator.addMethod("zipcode", function(e) {
            return $("#order_billing_country").val() === "CANADA" ? CANADA_ZIP.test(e.toUpperCase()) : US_ZIP.test(e)
        }, function() {
            return $("#order_billing_country").val() === "CANADA" ? "must be a valid canadian zipcode" : "must be a 5 digit US zipcode"
        }),
        jQuery.extend(jQuery.validator.messages, {
            required: "this field is required",
            remote: "Please fix this field.",
            email: "Please enter a valid email: name@domain.com"
        })),
        S = function() {
            return $.get("/store_credits/verify", {
                email: $("#order_email").val()
            }, function(e) {
                return $("#pay").after(e),
                $("#pay").fadeOut(100, function() {
                    return $("#pay").hide(),
                    $("#store_credits").fadeIn(100),
                    $("form#checkout_form").attr("data-verified", "done"),
                    $("#store_credit").click(function(e) {
                        return $("#store_credit_id").val($(this).attr("store_credit_id")),
                        $.rails.enableFormElements($("form#checkout_form")),
                        $("#checkout_form").submit(),
                        !1
                    }),
                    $("no_store_credit").click(function(e) {
                        return $.rails.enableFormElements($("form#checkout_form")),
                        $("#checkout_form").submit(),
                        !1
                    })
                })
            }).fail(function() {
                return $("form#checkout_form").attr("data-verified", "done"),
                $.rails.enableFormElements($("form#checkout_form")),
                $("#checkout_form").submit()
            })
        }
        ,
        g = function(e) {
            return $("form#checkout_form").attr("data-verified") !== "done" ? (e.stopPropagation(),
            $.rails.disableFormElements($("form#checkout_form")),
            S(),
            !1) : !0
        }
        ,
        $("form#checkout_form").on("submit", function(e) {
            return g(e)
        }),
        $("checkout_form.checkout").click(function(e) {
            return g(e)
        }),
        E = function() {
            var e, t, n, r, i, s, o;
            if ($("body").hasClass("payment_page"))
                return !1;
            window.update_shipping_cnt || (window.update_shipping_cnt = 0),
            window.update_shipping_cnt += 1;
            if (window.update_shipping_cnt > 7)
                return !1;
            e = $("form#checkout_form").serializeArray(),
            t = {};
            for (i = 0,
            s = e.length; i < s; i++)
                o = e[i],
                n = o.name,
                r = o.value,
                /number|verification_value/.test(n) || (t[n] = r);
            return t.cnt = window.update_shipping_cnt,
            $("#shipping").text("calculating..."),
            $("#shipping-eu").hide(),
            $.ajax({
                url: "" + $("form#checkout_form").attr("action") + ".js",
                data: t,
                success: function(e, t, n) {
                    $("#cart-totals").replaceWith(e);
                    if ($("body").hasClass("us"))
                        return $("#surchage_info_tooltip").remove(),
                        $("body").append('<div id="surchage_info_tooltip">Canadian Surcharge covers all Goods and Services Tax (GST), Harmonized Sales Tax (HST) as well as Duty and Brokerage.<br><br>Canadian customers will not incur any additional charges upon delivery.</div>'),
                        $("#surchage_info").on("click", function(e) {
                            return e.preventDefault()
                        }),
                        $("#surchage_info").on("mouseenter", function(e) {
                            return $("#surchage_info_tooltip").css({
                                position: "absolute",
                                top: $("#surchage_info").offset().top,
                                left: $("#surchage_info").offset().left + 20
                            }).show(),
                            setTimeout(function() {
                                return $("#surchage_info_tooltip").css("opacity", 1)
                            }, 10)
                        }),
                        $("#surchage_info").on("mouseleave", function(e) {
                            return $("#surchage_info_tooltip").css("opacity", 0),
                            setTimeout(function() {
                                return $("#surchage_info_tooltip").hide()
                            }, 100)
                        })
                },
                dataType: "html"
            })
        }
        ,
        $("#credit_card_type").on("change", function() {
            return $("#credit_card_type").val() === "visa" ? $("#cnb").unmask().mask("9999 9999 9999 9999", {
                autoclear: !1
            }) : $("#credit_card_type").val() === "american_express" ? $("#cnb").unmask().mask("9999 999999 99999", {
                autoclear: !1
            }) : $("#credit_card_type").val() === "master" ? $("#cnb").unmask().mask("9999 9999 9999 9999", {
                autoclear: !1
            }) : $("#cnb").unmask(),
            $("#credit_card_type").val() === "cod" || $("#credit_card_type").val() === "paypal" ? ($("#card_details").hide(),
            $("#credit_card_type").val() === "paypal" && $("#paypal_message").show(),
            E()) : ($("#cart-vval, #cvc").removeClass("visa").removeClass("master").removeClass("american_express").addClass($(this).val()),
            $("#card_details").show(),
            $("#paypal_message").hide(),
            E())
        }).trigger("change"),
        $("#order_billing_country").on("change", function() {
            if (!$("body").hasClass("payment_page"))
                return $("#state_label").text($(this).val() === "USA" ? "state" : "province"),
                $("#order_billing_state").html($("#states-" + $(this).val()).html())
        }),
        $(".checkbox").iCheck({
            checkboxClass: "icheckbox_minimal",
            radioClass: "iradio_minimal",
            increaseArea: "20%"
        }),
        $("label.terms a").click(function(e) {
            return window.location = $(this).attr("href"),
            !1
        }),
        $("#order_billing_country, #order_billing_state").on("change", E)),
        $("input#join-mailinglist").on("change", function() {
            var e, t;
            return t = $("input#join-mailinglist")[0],
            e = {
                commit: t.checked ? "subscribe" : "unsubscribe"
            },
            $("body").hasClass("eu") && (e.eu_order_mailing_list = 1),
            $.post("/order_mailinglist", e)
        }),
        f = $("#img-main").width(),
        m = 1350 / -f,
        u = function() {
            var e, t;
            return f = $("#img-main").width(),
            m = 1350 / -f,
            e = 458,
            $("#zoom-lens").show(),
            t = $("#zoom-holder").attr("data-background-image"),
            $("#zoom-holder").css({
                position: "absolute",
                left: e
            }).show(),
            $("#zoom-lens").on("click", r),
            $(document).on("mousemove", s),
            $("#zoom-holder").css("background-image", "url('" + t + "')")
        }
        ,
        r = function() {
            return $("#zoom-lens").hide(),
            $("#zoom-holder").hide(),
            $(document).unbind("mousemove"),
            $("body").removeClass("zooming")
        }
        ,
        s = function(e) {
            var t, n, i, s, o, u, a;
            return n = $(".products article figure img"),
            o = n.offset(),
            u = e.pageX - o.left,
            a = e.pageY - o.top,
            (u < 0 || u > f || a < 0 || a > f) && r(),
            i = u - 75,
            s = a - 75,
            i = Math.min(Math.max(0, i), f - 150),
            s = Math.min(Math.max(0, s), f - 150),
            $("#zoom-lens").css({
                top: s,
                left: i
            }),
            $("body").addClass("zooming"),
            t = $("#zoom-holder").css("background-image"),
            $("#zoom-holder").css({
                backgroundPosition: "" + i * m + "px " + s * m + "px"
            }),
            $("#zoom-holder").css({
                backgroundColor: "#fff"
            }),
            $("#zoom-holder").css({
                backgroundImage: t
            }),
            e.stopPropagation()
        }
        ,
        $(".products article figure img").on("click", function(e) {
            return u(),
            s(e)
        }),
        $("#order_mailing_list, #eu_order_mailing_list").iCheck({
            checkboxClass: "icheckbox_minimal",
            radioClass: "iradio_minimal",
            increaseArea: "20%"
        }),
        $("#order_mailing_list, #eu_order_mailing_list").on("ifChecked", function(e) {
            return $(this).closest("p").find("label").addClass("active")
        }),
        $("#order_mailing_list, #eu_order_mailing_list").on("ifUnchecked", function(e) {
            return $(this).closest("p").find("label").removeClass("active")
        }),
        T = null ,
        $("#mailinglist input[type=submit]").click(function() {
            return T = this
        }),
        $("#mailinglist").on("ajax:error", function(e, t, n) {
            return N.Turbolinks.visit("/")
        }),
        $("#mailinglist").on("submit", function(e) {
            return N.Validator.valid("email") ? ($("#_dx").val((new Date).getMonth()),
            ga_track("event", "mailinglist", T.value),
            $("#wrap").animate({
                opacity: 0
            })) : (e.preventDefault(),
            !1)
        })
    })
}
.call(this),
function() {
    jQuery(function() {
        var e, t = this;
        return $("#form-contact")[0] != null && ($("#form-contact").on("submit", function(e) {
            return t.Validator.valid("first_name", "last_name", "email", "message") ? (ga_track("event", "message", "sent"),
            $("#wrap").animate({
                opacity: 0
            })) : (e.preventDefault(),
            !1)
        }),
        $("#form-contact").on("ajax:error", function(e, n, r) {
            return t.Turbolinks.visit("/")
        })),
        $("#form-mailinglist")[0] != null && ($(".checkbox").iCheck({
            checkboxClass: "icheckbox_minimal",
            radioClass: "iradio_minimal",
            increaseArea: "20%"
        }),
        $("#order-mailing-list-fieldset .checkbox").on("ifChecked", function(e) {
            return $("#order-mailing-list-label label").addClass("active")
        }),
        $("#order-mailing-list-fieldset .checkbox").on("ifUnchecked", function(e) {
            return $("#order-mailing-list-label label").removeClass("active")
        }),
        e = null ,
        $("#form-mailinglist input[type=submit]").click(function() {
            return e = this
        }),
        $("#form-mailinglist").on("submit", function(n) {
            return t.Validator.valid("email") ? ($("#_dx").val((new Date).getMonth()),
            ga_track("event", "mailinglist", e.value),
            $("#wrap").animate({
                opacity: 0
            })) : (n.preventDefault(),
            !1)
        }),
        $("input[name=mailinglist]").on("click", function(e) {
            return $("input[name=mailinglist]:checked").val() === "jp" ? ($("#order-mailing-list-fieldset").css("visibility", "hidden"),
            $("#order-mailing-list-label").css("visibility", "hidden"),
            $("#eu-order-mailing-list-fieldset").css("visibility", "hidden"),
            $("#eu-order-mailing-list-label").css("visibility", "hidden")) : ($("#order-mailing-list-fieldset").css("visibility", "visible"),
            $("#order-mailing-list-label").css("visibility", "visible"),
            $("#eu-order-mailing-list-fieldset").css("visibility", "visible"),
            $("#eu-order-mailing-list-label").css("visibility", "visible"))
        }),
        $("#form-mailinglist").on("ajax:error", function(e, n, r) {
            return t.Turbolinks.visit("/")
        })),
        $("input#mailing_list, input#order_mailing_list").on("click", function() {
            return $.post($("#mailinglist_settings").data("update-url"), {
                mailinglist: this.id,
                subscribe: this.checked
            }),
            ga_track("event", "update_mailinglist", (this.checked ? "subscribe" : "unsubscribe") + this.id)
        }),
        $("#update_mailinglist_settings").on("click", function() {
            var e, t = this;
            return $(this).css({
                backgroundColor: "gray"
            }),
            e = function() {
                return $(t).css({
                    backgroundColor: "red"
                })
            }
            ,
            window.setTimeout(e, 700)
        })
    })
}
.call(this),
function() {
    jQuery(function() {
        var e;
        return $("#show-form")[0] != null && $("#show-form").click(function() {
            return $("#friend-mail span").css({
                display: "inline-block"
            }),
            $("#embed_code").hide(),
            $("#show-embed").hide(),
            $(this).hide(),
            !1
        }),
        $("#show-embed")[0] != null && $("#show-embed").click(function() {
            return $("#embed_code").show(),
            $("#show-form").show(),
            $("#friend-mail span").hide(),
            $(this).hide(),
            !1
        }),
        $("#wrap .scrollitem")[0] != null && (e = new this.Marque("#wrap .scrollitem"),
        $(document).one("page:change", function() {
            return e.stop()
        }),
        $("#wrap .scrollitem img").hover(function() {
            var e, t, n;
            return n = $(this).attr("alt").split(": "),
            t = n[0],
            e = n[1],
            e = e.indexOf(",") !== -1 ? "<strong>" + e.replace(/,/, "</strong><br />") : e,
            $("footer .description h2").html(t),
            $("footer .description p").html(e)
        })),
        $("form#friend-mail").on("submit", function(e) {
            return Validator.valid("to-email", "from-email") || !1,
            ga_track("_trackEvent", "random", "share", $("footer .description h2").html())
        })
    })
}
.call(this),
function() {
    var e;
    String.prototype.titleize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1)
    }
    ,
    e = typeof exports != "undefined" && exports !== null ? exports : this,
    e.ga_track = function() {
        var e, t, n;
        t = [].slice.call(arguments),
        e = t.shift(),
        n = [],
        e.match(/ecommerce/) ? (typeof ga != "undefined" && ga !== null && ga("require", "ecommerce", "ecommerce.js"),
        typeof ga_eu != "undefined" && ga_eu !== null && ga_eu("require", "ecommerce", "ecommerce.js"),
        n = [e]) : n = ["send", e],
        typeof ga != "undefined" && ga !== null && ga.apply(ga, n.concat(t)),
        typeof ga_eu != "undefined" && ga_eu !== null && ga_eu.apply(ga, n.concat(t));
        if (typeof _gaq != "undefined" && _gaq !== null )
            return e = e.replace("ecommerce:send", "trans"),
            e = e.replace("ecommerce:", ""),
            e = e.replace("addTransaction", "addTrans"),
            e.match(/^add/) ? e = "_" + e : e = "_track" + e.titleize(),
            _gaq.push([e].concat(t))
    }
}
.call(this),
function() {
    var e, t = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    };
    e = this.Turbolinks.willVisit,
    this.BaseImageController = function() {
        function n(e, n, r, i) {
            var s, o, u, a, f, l;
            this.imageSelector = e,
            this.index = n,
            this.data = r,
            this.imageUrl = t(this.imageUrl, this),
            this.zoomedImageUrl = t(this.zoomedImageUrl, this),
            this.tryShowingLightbox = t(this.tryShowingLightbox, this),
            this.showImageAtIndex = t(this.showImageAtIndex, this),
            this.showCursor = t(this.showCursor, this),
            this.setCursorImageLocation = t(this.setCursorImageLocation, this),
            this.pushImageState = t(this.pushImageState, this),
            this.newLightbox = t(this.newLightbox, this),
            this.newImageViewer = t(this.newImageViewer, this),
            this.keyUpListener = t(this.keyUpListener, this),
            this.getImageDataRecord = t(this.getImageDataRecord, this),
            u = function() {
                var e, t, n, r;
                n = this.data,
                r = [];
                for (e = 0,
                t = n.length; e < t; e += 1)
                    o = n[e],
                    r.push(o.imageUrl);
                return r
            }
            .call(this),
            l = this.data;
            for (a = 0,
            f = l.length; a < f; a += 1)
                o = l[a],
                o.zoomedImageUrl != null && u.push(o.zoomedImageUrl);
            s = new Loader(u,this.index + 1),
            this.setupCursor(),
            this.imageViewer = this.newImageViewer(s, i),
            this.lightbox = this.newLightbox(s),
            this.isChangingImage = !1,
            $(window).on("keyup", this.keyUpListener)
        }
        return n.centerImage = function(e, t) {
            return $(e).css({
                marginTop: Math.max(0, t / 2 - e.height / 2)
            })
        }
        ,
        n.isTouchDevice = function() {
            return Modernizr.touch && Modernizr.csstransforms
        }
        ,
        n.resizedImageDimensions = function(e, t, n, r) {
            var i;
            if (e > n || t > r)
                e / n < t / r ? i = r / t : i = n / e,
                e *= i,
                t *= i;
            return {
                width: e,
                height: t
            }
        }
        ,
        n.resizeImageToAspectFit = function(e, t, n) {
            var r, i, s, o, u, a;
            return t == null && (t = null ),
            n == null && (n = null ),
            t == null && (t = $(window).width() - 88),
            n == null && (n = $(window).height() - 88),
            r = $(e),
            o = r.data("width"),
            s = r.data("height"),
            u = this.resizedImageDimensions(o, s, t, n),
            a = u.width,
            i = u.height,
            e.width = a,
            e.height = i,
            $(e).css({
                width: a,
                height: i
            })
        }
        ,
        n.prototype.cursorForAction = function(e) {
            switch (e) {
            case "prevImage":
                return this.showCursor("left");
            case "nextImage":
                return this.showCursor("right");
            case "zoomImage":
                return this.showCursor("zoom");
            default:
                return this.cursorImage.hide()
            }
        }
        ,
        n.prototype.destroy = function() {
            return this.imageViewer.destroy(),
            this.lightbox.hide(),
            $(window).off("keyup")
        }
        ,
        n.prototype.getImageDataRecord = function(e) {
            var t, n, r, i = this;
            return t = $(e),
            r = null ,
            n = $("#container").data("images"),
            $.each(n, function(e, n) {
                if (n.zoomedImageUrl === t.attr("src") || n.imageUrl === t.attr("src"))
                    return r = n
            }),
            r
        }
        ,
        n.prototype.hasNextImage = function() {
            return this.index < this.data.length - 1
        }
        ,
        n.prototype.hasPrevImage = function() {
            return this.index > 0
        }
        ,
        n.prototype.hasZoom = function() {
            return this.data[this.index].zoomedImageUrl != null
        }
        ,
        n.prototype.keyUpListener = function(e) {
            if (e.which === 27) {
                if (this.lightbox.isVisible())
                    return this.lightbox.hide()
            } else {
                if (e.which === 39)
                    return this.showNextImage();
                if (e.which === 37)
                    return this.showPrevImage();
                if (e.which === 32)
                    return this.lightbox.isVisible() ? this.lightbox.hide() : this.tryShowingLightbox()
            }
        }
        ,
        n.prototype.newImageViewer = function(e, t) {
            return new BaseImageViewer(this,this.imageSelector,this.data,e,t)
        }
        ,
        n.prototype.newLightbox = function(e) {
            return new BaseLightbox(this.data,e,this.lightboxOptions())
        }
        ,
        n.prototype.pushImageState = function() {
            if (this.data[this.index].url != null )
                return e(this.data[this.index].url)
        }
        ,
        n.prototype.setupCursor = function() {
            if ($("#cursor-image")[0] == null )
                return this.cursorImage = $('<span id="cursor-image" />').appendTo("body").css({
                    position: "absolute",
                    zIndex: 1e4
                }).hide()
        }
        ,
        n.prototype.setCursorImageLocation = function(e) {
            var t;
            return t = this.cursorImage.attr("class"),
            t === "left" ? this.cursorImage.css({
                top: Math.min($(window).height() - 15 - 9, e.pageY),
                left: Math.min($(window).width() + 15 + 9, e.pageX - 20)
            }) : t === "right" ? this.cursorImage.css({
                top: Math.min($(window).height() - 15 - 9, e.pageY),
                left: Math.min($(window).width() - 15 - 9, e.pageX + 17)
            }) : t === "zoom" ? this.cursorImage.css({
                top: Math.min($(window).height() - 15 - 9, e.pageY - 24),
                left: Math.min($(window).width() - 15 - 9, e.pageX - 8)
            }) : this.cursorImage.css({
                top: Math.min($(window).height() - 15 - 9, e.pageY),
                left: Math.min($(window).width() - 15 - 9, e.pageX + 17)
            })
        }
        ,
        n.prototype.showCursor = function(e) {
            return this.cursorImage.show().attr("class", e)
        }
        ,
        n.prototype.showImageAtIndex = function(e, t) {
            return this.index = e,
            this.imageViewer.showImage(this.index),
            this.lightbox.setScrollingFromMousePosEnabled(!1),
            this.lightbox.visible && this.lightbox.showImageWithSrc(this.data[this.index].zoomedImageUrl, this.data[this.index].imageUrl, t),
            this.pushImageState(),
            $(this).trigger("image:changed")
        }
        ,
        n.prototype.showNextImage = function() {
            if (this.isChangingImage)
                return;
            this.isChangingImage = !0;
            if (this.hasNextImage())
                return this.showImageAtIndex(this.index + 1)
        }
        ,
        n.prototype.showPrevImage = function() {
            if (this.isChangingImage)
                return;
            this.isChangingImage = !0;
            if (this.hasPrevImage())
                return this.showImageAtIndex(this.index - 1)
        }
        ,
        n.prototype.tryShowingLightbox = function() {
            var e = this;
            if (this.lightbox.tryShow(this.index))
                return setTimeout(function() {
                    return e.cursorImage.hide()
                }, 10)
        }
        ,
        n.prototype.zoomedImageUrl = function(e) {
            return this.data[this.index].zoomedImageUrl
        }
        ,
        n.prototype.imageUrl = function(e) {
            return this.data[this.index].imageUrl
        }
        ,
        n
    }()
}
.call(this),
function() {
    var e, t = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    };
    e = function(e, t) {
        var n, r, i;
        for (n = r = 0,
        i = e.length; r < i; n = r += 1)
            if (e[n] === t)
                return e.slice(n, 1);
        return e
    }
    ,
    this.Loader = function() {
        function n(e, n) {
            var r;
            this.imageUrls = e,
            this.loadVideo = t(this.loadVideo, this),
            this.loadImage = t(this.loadImage, this),
            this.imgOnLoad = t(this.imgOnLoad, this),
            this.preloadAll = t(this.preloadAll, this),
            r = $(this.arrayRotateToIndex(this.imageUrls, n)),
            this.imageUrls = $.filter(r, function(e, t) {
                return !t.match(/(mp4|flv)$/)
            }),
            this.videoUrls = $.filter(r, function(e, t) {
                return t.match(/(mp4|flv)$/)
            }),
            this.images = [],
            this.imageUrlsLoaded = {},
            this.loaded = 0,
            this.allLoaded = !1,
            this.canceled = null
        }
        return n.prototype.arrayRotateToIndex = function(e, t) {
            return e.slice(t).concat(e.slice(0, t))
        }
        ,
        n.prototype.preloadNow = function(t, n) {
            var r, i, s;
            t = this.arrayRotateToIndex(t, n),
            this.cancel();
            for (i = 0,
            s = t.length; i < s; i++)
                r = t[i],
                this.imageUrls = e(this.imageUrls, r),
                this.imageUrls.unshift(r);
            return this.preloadAll()
        }
        ,
        n.prototype.preloadAll = function() {
            var e, t, n, r, i, s, o;
            this.canceled = !1,
            o = [];
            for (t = i = 0,
            s = Math.min(3, this.imageUrls.length); i < s; t = i += 1)
                n = new Image,
                e = this,
                r = this.imageUrls.shift(),
                n.onload = function() {
                    return e.imgOnLoad(this)
                }
                ,
                n.src = r,
                n.mark = "" + t,
                o.push(this.images.push(n));
            return o
        }
        ,
        n.prototype.imgOnLoad = function(e) {
            this.loaded++,
            this.didLoad(e);
            if (!(this.imageUrls.length > 0))
                return this.allLoaded = !0;
            if (!this.canceled)
                return e.src = this.imageUrls.shift()
        }
        ,
        n.prototype.didLoad = function(e) {
            return this.imageUrlsLoaded[URI(e.src).path()] = !0
        }
        ,
        n.prototype.isPreloaded = function(e) {
            return this.imageUrlsLoaded[URI(e).path()]
        }
        ,
        n.prototype.cancel = function() {
            var e, t, n;
            this.canceled = !0;
            for (e = t = 0,
            n = this.images.length; t < n; e = t += 1)
                delete this.images[e];
            return !0
        }
        ,
        n.prototype.loadImage = function(e) {
            var t, n, r, i, s, o, u, a, f, l, c, h, p = this;
            e == null && (e = {}),
            h = $.extend({
                noFadeOut: !1,
                noFadeIn: !1
            }, e),
            l = h.url,
            a = h.selector,
            r = h.loadingSelector,
            n = h.loadingCompletedCallback,
            t = h.displayCompletedCallback,
            o = h.noFadeOut,
            s = h.noFadeIn,
            u = $(a);
            if (u[0] == null )
                return;
            f = "" + a.replace(/[^\w]/, "-") + "-loading",
            $("#" + f).remove(),
            l.match(/(mp4|flv)$/) && (c = l,
            l = "http://images.supremenewyork.com/assets/splash/" + c.split(/[\\/]/).pop().split(".")[0] + ".jpg"),
            i = $('<img src="' + l + '" id="' + f + '"/>').insertAfter(u),
            $.each(u.prop("attributes"), function() {
                var e;
                if ((e = this.name) !== "id" && e !== "src" && e !== "width" && e !== "height")
                    return i.attr(this.name, this.value)
            }),
            i.addClass("image-viewer-loading"),
            i.imagesLoaded(function() {
                var e, o;
                return o = i[0].naturalWidth || i[0].width,
                e = i[0].naturalHeight || i[0].height,
                i.data("width", o).data("height", e),
                $(a).promise().done(function() {
                    var e;
                    n != null && n(i[0]),
                    $(r).removeClass("loading"),
                    e = u.attr("id"),
                    $(u).remove(),
                    i.attr("id", e).removeClass("image-viewer-loading");
                    if (!s)
                        return i.css({
                            opacity: 0
                        }).animate({
                            opacity: 1
                        }, 200, function() {
                            if (t != null )
                                return t(i[0])
                        });
                    if (t != null )
                        return t(i[0])
                })
            });
            if (!o)
                return $(a).animate({
                    opacity: 0
                }, 200, function() {
                    if (!p.imageLoaded(i[0]))
                        return $(r).addClass("loading")
                });
            s || $(a).css({
                opacity: 0
            });
            if (!this.imageLoaded(i[0]))
                return $(r).addClass("loading")
        }
        ,
        n.prototype.loadVideo = function(e) {
            var t, n, r, i, s, o, u, a, f, l, c, h, p, d, v = this;
            e == null && (e = {}),
            d = $.extend({}, e),
            l = d.url,
            r = d.height,
            p = d.width,
            a = d.selector,
            s = d.loadingSelector,
            i = d.loadingCompletedCallback,
            n = d.displayCompletedCallback,
            u = $(a);
            if (u[0] == null )
                return;
            return f = "" + a.replace(/[^\w]/, "-") + "-loading",
            $("#" + f).remove(),
            h = "video-" + Date.now(),
            r = r || 576,
            p = p || 1024,
            o = $('<div class="movie" id="' + f + '" style="height:' + r + "px;width:" + p + 'px;"><div id="' + h + '"></div></div>').insertAfter(u),
            o.addClass("image-viewer-loading"),
            c = !1,
            t = function(e, t) {
                return setTimeout(t, e)
            }
            ,
            t(100, function() {
                var e;
                return e = jwplayer(h).setup({
                    file: "http://d3o425gsw3lvjf.cloudfront.net/" + l.split(/[\\/]/).pop(),
                    image: "http://images.supremenewyork.com/assets/splash/" + l.split(/[\\/]/).pop().split(".")[0] + ".jpg",
                    modes: [{
                        type: "flash",
                        src: "http://images.supremenewyork.com/assets/jwplayer/jw_player.swf"
                    }, {
                        type: "html5"
                    }],
                    width: "100%",
                    height: "100%",
                    skin: "http://images.supremenewyork.com/assets/jwplayer/bekle/bekle.xml"
                })
            }),
            $(a).animate({
                opacity: 0
            }, 200, function() {
                var e;
                return c = !0,
                i != null && i(o[0]),
                $(s).removeClass("loading"),
                e = u.attr("id"),
                $(u).remove(),
                o.attr("id", e),
                $(a).animate({
                    opacity: 100
                }, 200).removeClass("image-viewer-loading"),
                o.css({
                    opacity: 0
                }).animate({
                    opacity: 1
                }, 200, function() {
                    if (n != null )
                        return n(o[0])
                })
            })
        }
        ,
        n.prototype.imageLoaded = function(e) {
            return e && (typeof e.complete != "undefined" ? e.complete : !isNaN(e.width + e.height) && e.width + e.height !== 0)
        }
        ,
        n
    }()
}
.call(this),
function() {
    var e, t = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }, n = {}.hasOwnProperty, r = function(e, t) {
        function i() {
            this.constructor = e
        }
        for (var r in t)
            n.call(t, r) && (e[r] = t[r]);
        return i.prototype = t.prototype,
        e.prototype = new i,
        e.__super__ = t.prototype,
        e
    };
    e = this.Turbolinks.willVisit,
    this.LookBookImageController = function(n) {
        function i(e, n, r, s) {
            this.updateCount = t(this.updateCount, this),
            this.thumbnailHovered = t(this.thumbnailHovered, this),
            this.thumbnailClicked = t(this.thumbnailClicked, this),
            this.showImageAtIndex = t(this.showImageAtIndex, this),
            this.pushImageState = t(this.pushImageState, this),
            this.newLightbox = t(this.newLightbox, this),
            this.mainImageClicked = t(this.mainImageClicked, this),
            this.keyUpListener = t(this.keyUpListener, this);
            var o = this;
            i.__super__.constructor.call(this, e, n, r, s),
            this.imageViewer.setMousePositionActionsEnabled(!1),
            $(this.lightbox).on("lightbox:hide", function(e) {
                return o.imageViewer.setMousePositionActionsEnabled(!1)
            }),
            $(this.lightbox).on("lightbox:show", function(e) {
                return o.imageViewer.setMousePositionActionsEnabled(!0)
            }),
            $(this).on("image:changed", function(e) {
                return $("footer .description p").html($("#lookbook-items li:nth-of-type(" + (o.index + 1) + ") a").data("caption"))
            }),
            $(document).one("page:change", function() {
                return o.destroy()
            }),
            $("#lookbook-items a").attr("data-no-turbolink", "").hover(this.thumbnailHovered).click(this.thumbnailClicked),
            $("#img-main-link").on("click", this.mainImageClicked)
        }
        return r(i, n),
        i.prototype.keyUpListener = function(e) {}
        ,
        i.prototype.mainImageClicked = function(e) {
            return this.lightbox.tryShow(this.index),
            e.preventDefault(),
            !1
        }
        ,
        i.prototype.newLightbox = function(e) {
            var t;
            return t = {
                containerClass: "lightbox-lookbook",
                scaleZoomedImage: !1,
                imagePadding: 0
            },
            new window.LookBookLightbox(this,this.data,e,t)
        }
        ,
        i.prototype.pushImageState = function() {
            document.title = document.title.replace(/\d+\/\d+/, this.index + 1 + "/" + this.data.length);
            if (this.data[this.index].url != null )
                return e(this.data[this.index].url)
        }
        ,
        i.prototype.showImageAtIndex = function(e, t) {
            return i.__super__.showImageAtIndex.call(this, e, t),
            this.updateCount(e)
        }
        ,
        i.prototype.thumbnailClicked = function(e) {
            var t;
            return t = $(e.delegateTarget),
            this.showImageAtIndex(t.parent().index()),
            $("footer .description p").html(t.data("caption")),
            e.preventDefault()
        }
        ,
        i.prototype.thumbnailHovered = function(e) {
            var t;
            return $("span#count").toggleClass("count-red"),
            t = $(e.delegateTarget),
            this.updateCount(t.parent().index())
        }
        ,
        i.prototype.updateCount = function(e) {
            return $("span#count").html(e + 1)
        }
        ,
        i
    }(this.BaseImageController)
}
.call(this),
function() {
    var e, t = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }, n = {}.hasOwnProperty, r = function(e, t) {
        function i() {
            this.constructor = e
        }
        for (var r in t)
            n.call(t, r) && (e[r] = t[r]);
        return i.prototype = t.prototype,
        e.prototype = new i,
        e.__super__ = t.prototype,
        e
    };
    e = this.Turbolinks.willVisit,
    this.PreviewImageController = function(n) {
        function i(e, n, r) {
            this.pushImageState = t(this.pushImageState, this),
            this.newImageViewer = t(this.newImageViewer, this),
            this.newLightbox = t(this.newLightbox, this),
            this.imageViewerChanged = t(this.imageViewerChanged, this),
            this.forwardControlClicked = t(this.forwardControlClicked, this),
            this.documentFetched = t(this.documentFetched, this),
            this.backControlClicked = t(this.backControlClicked, this),
            this.adjustControls = t(this.adjustControls, this);
            var s = this;
            window.preview_scale_ratio = window.screen.width > 321 ? .58 : .5,
            $("#viewport").attr("content", "width=650, minimum-scale=" + window.preview_scale_ratio + ", maximum-scale=" + window.preview_scale_ratio + ", user-scalable=no"),
            i.__super__.constructor.call(this, e, n, $(".preview-item #container[data-images]").data("images"), r),
            $(".controls a.back").on("click", this.backControlClicked),
            $(".controls a.forward").on("click", this.forwardControlClicked),
            $(this).on("image:changed", this.imageViewerChanged),
            $(document).one("page:change", this.documentFetched),
            $(".preview-item #container[data-images] a").click(function(e) {
                return !1
            })
        }
        return r(i, n),
        i.prototype.adjustControls = function(e) {
            return $(".controls a").removeClass("hidden-placeholder"),
            e === 0 && $(".controls a.back").addClass("hidden-placeholder"),
            e === this.data.length - 1 && $(".controls a.forward").addClass("hidden-placeholder"),
            $(".controls span").html(e + 1),
            $("footer .description h2").html(this.data[e].title),
            $("footer .description p").html(this.data[e].caption)
        }
        ,
        i.prototype.backControlClicked = function(e) {
            return this.showPrevImage(),
            e.preventDefault()
        }
        ,
        i.prototype.documentFetched = function() {
            return this.destroy(),
            $(window).off("resize")
        }
        ,
        i.prototype.forwardControlClicked = function(e) {
            return this.showNextImage(),
            e.preventDefault()
        }
        ,
        i.prototype.imageViewerChanged = function(e) {
            return this.adjustControls(this.index)
        }
        ,
        i.prototype.newLightbox = function(e) {
            var t;
            return t = {
                containerClass: "opaque",
                scaleZoomedImage: !0,
                imagePadding: $("html").hasClass("touch") ? 8 : 88
            },
            new window.PreviewLightbox(this,this.data,e,t)
        }
        ,
        i.prototype.newImageViewer = function(e, t) {
            return BaseImageController.isTouchDevice() ? new PreviewTouchImageViewer(this,this.imageSelector,this.data,e,t,this.index) : new PreviewImageViewer(this,this.imageSelector,this.data,e,t)
        }
        ,
        i.prototype.pushImageState = function() {
            document.title = "Supreme " + this.data[this.index].title;
            if (this.data[this.index].url != null )
                return e(this.data[this.index].url)
        }
        ,
        i
    }(this.BaseImageController)
}
.call(this),
function() {
    var e, t = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    };
    e = this.Turbolinks.willVisit,
    this.BaseLightbox = function() {
        function e(e, n, r) {
            this.data = e,
            this.imageLoader = n,
            this.options = r,
            this.tryShow = t(this.tryShow, this),
            this.showImageWithSrc = t(this.showImageWithSrc, this),
            this.show = t(this.show, this),
            this.scrollFromMousePos = t(this.scrollFromMousePos, this),
            this.isVisible = t(this.isVisible, this),
            this.imageDidLoad = t(this.imageDidLoad, this),
            this.hide = t(this.hide, this),
            this.hasZoom = t(this.hasZoom, this),
            this.destroy = t(this.destroy, this),
            this.addLightboxToDom = t(this.addLightboxToDom, this),
            this.options.imagePadding == null && console.log("WARNING: BaseLightbox initialized without imagePadding"),
            this.visible = !1,
            this._scrollBigImageIntervalId = null
        }
        return e.prototype.addLightboxToDom = function() {
            return $('<div id="lightbox-container" class="' + this.options.lightboxContainerClass + '" style="display: none">\n  <div class="inner loading">\n      <a href="#" class="close"></a>\n      <img id="lightbox-image" />\n    </div>\n  </div>').appendTo($("body"))
        }
        ,
        e.prototype.destroy = function() {
            return $(this).off("lightbox:show").off("lightbox:hide")
        }
        ,
        e.prototype.hasZoom = function(e) {
            return this.data[e].zoomedImageUrl != null
        }
        ,
        e.prototype.hide = function() {
            if (this.visible)
                return this.visible = !1,
                $("#lightbox-image").off("mouseover"),
                $("#lightbox-image").off("mouseout"),
                $(window).off("resize"),
                $("#lightbox-container").remove(),
                $(this).trigger("lightbox:hide")
        }
        ,
        e.prototype.imageDidLoad = function(e) {
            return this.options.scaleZoomedImage ? (BaseImageController.resizeImageToAspectFit(e, $(window).width() - this.options.imagePadding, $(window).height() - this.options.imagePadding),
            BaseImageController.centerImage(e, $(window).height())) : $(window).height() < $(e).data("height") ? $(e).css({
                marginTop: 0
            }) : BaseImageController.centerImage(e, $(window).height()),
            $("#lightbox-container").show(),
            this.imageLoader.didLoad(e)
        }
        ,
        e.prototype.isVisible = function() {
            return this.visible
        }
        ,
        e.prototype.scrollFromMousePos = function(e) {
            var t, n, r, i;
            return n = $("#lightbox-image"),
            i = $(window).height(),
            t = (e - i / 2) / 25,
            r = parseFloat(n.css("margin-top") || 0) - t,
            r = Math.min(0, Math.max(i - n.height(), r)),
            n.css({
                marginTop: r
            })
        }
        ,
        e.prototype.setScrollingFromMousePosEnabled = function(e) {
            var t = this;
            if (!e)
                return window.clearInterval(this._scrollBigImageIntervalId),
                this._scrollBigImageIntervalId = null ;
            if (this._scrollBigImageIntervalId == null )
                return this._scrollBigImageIntervalId = window.setInterval(function() {
                    return t.lightbox.scrollFromMousePos(t.mouseY)
                }, 10)
        }
        ,
        e.prototype.shouldScrollFromMousePos = function() {
            return this.visible && $(window).height() < $("#lightbox-image").height()
        }
        ,
        e.prototype.show = function(e) {
            var t, n, r, i, s, o = this;
            this.visible = !0,
            this.addLightboxToDom(),
            $(window).on("resize", function() {
                return o.imageDidLoad($("#lightbox-image")[0])
            });
            if (this.imageLoader != null && !this.imageLoader.allLoaded) {
                this.imageLoader.cancel(),
                n = [],
                s = this.data;
                for (r = 0,
                i = s.length; r < i; r += 1)
                    t = s[r],
                    t.zoomedImageUrl != null && n.push(t.zoomedImageUrl);
                this.imageLoader.imageLoaded($("#lightbox-image")[0]) ? this.imageLoader.preloadNow(n, e) : $("#lightbox-image").one("load", function() {
                    return o.imageLoader.preloadNow(n, e)
                })
            }
            return this.showImageWithSrc(this.data[e].zoomedImageUrl, this.data[e].imageUrl, !0),
            $(this).trigger("lightbox:show")
        }
        ,
        e.prototype.showImageWithSrc = function(e, t, n) {
            var r = this;
            return !this.options.scaleZoomedImage || this.imageLoader.isPreloaded(e) ? this.imageLoader.loadImage({
                url: e,
                selector: "#lightbox-image",
                loadingSelector: "#lightbox-container .inner",
                loadingCompletedCallback: function(e) {
                    return r.imageDidLoad(e)
                },
                noFadeOut: n,
                noFadeIn: n
            }) : this.imageLoader.loadImage({
                url: t,
                selector: "#lightbox-image",
                loadingSelector: "#lightbox-container .inner",
                loadingCompletedCallback: function(e) {
                    return r.imageDidLoad(e)
                },
                displayCompletedCallback: function(t) {
                    return r.imageLoader.loadImage({
                        url: e,
                        selector: "#lightbox-image",
                        loadingSelector: "#lightbox-container .inner",
                        loadingCompletedCallback: function(e) {
                            return r.imageDidLoad(e)
                        },
                        noFadeOut: !0,
                        noFadeIn: !0
                    })
                },
                noFadeOut: n,
                noFadeIn: n
            })
        }
        ,
        e.prototype.tryShow = function(e) {
            if (this.hasZoom(e) && !this.visible)
                return this.show(e)
        }
        ,
        e
    }()
}
.call(this),
function() {
    var e = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
      , t = {}.hasOwnProperty
      , n = function(e, n) {
        function i() {
            this.constructor = e
        }
        for (var r in n)
            t.call(n, r) && (e[r] = n[r]);
        return i.prototype = n.prototype,
        e.prototype = new i,
        e.__super__ = n.prototype,
        e
    };
    this.LookBookLightbox = function(t) {
        function r(t, n, i, s) {
            this.controller = t,
            this.scroll = e(this.scroll, this),
            this.mouseMoved = e(this.mouseMoved, this),
            this.imageDidLoad = e(this.imageDidLoad, this),
            this.imageClicked = e(this.imageClicked, this),
            this.canScrollVertically = e(this.canScrollVertically, this),
            this.actionForMousePos = e(this.actionForMousePos, this),
            this.mouseUpListener = e(this.mouseUpListener, this),
            this.mouseDownListener = e(this.mouseDownListener, this),
            r.__super__.constructor.call(this, n, i, s),
            $("body").on("click", "#lightbox-container", this.imageClicked),
            $("body").on("mousemove", "#lightbox-container", this.mouseMoved),
            $("body").on("mousedown", "#lightbox-container", this.mouseDownListener),
            $("body").on("mouseup", "#lightbox-container", this.mouseUpListener),
            this.imageHeight = 1248,
            this.canScrollVertically() && (this.scrollInterval = setInterval(this.scroll, 40),
            this.scrollVelocity = 0)
        }
        return n(r, t),
        r.prototype.mouseDownListener = function(e) {
            var t;
            t = $("#cursor-image");
            if (t[0] != null && typeof t.attr("class") != "undefined")
                return t.attr("class", t.attr("class").replace("-down", "")),
                t.attr("class", t.attr("class") + "-down")
        }
        ,
        r.prototype.mouseUpListener = function(e) {
            var t;
            t = $("#cursor-image");
            if (t[0] != null && typeof t.attr("class") != "undefined")
                return t.attr("class", t.attr("class").replace("-down", ""))
        }
        ,
        r.prototype.actionForMousePos = function(e, t) {
            var n, r, i;
            n = $("#lightbox-container img"),
            r = n.position().left,
            i = n.position().left + n.width();
            if (e < r && this.controller.hasPrevImage())
                return "prevImage";
            if (e > i && this.controller.hasNextImage())
                return "nextImage"
        }
        ,
        r.prototype.canScrollVertically = function() {
            var e;
            return !1
        }
        ,
        r.prototype.imageClicked = function(e) {
            switch (this.actionForMousePos(e.pageX, e.pageY)) {
            case "prevImage":
                return this.controller.showPrevImage();
            case "nextImage":
                return this.controller.showNextImage();
            default:
                return this.controller.showNextImage(),
                this.hide()
            }
        }
        ,
        r.prototype.imageDidLoad = function(e) {
            var t;
            return r.__super__.imageDidLoad.call(this, e),
            t = Math.min(this.imageHeight, $(window).height()),
            $("#lightbox-container").css("height", t),
            $("#lightbox-container img").css("height", t),
            $("#lightbox-container .inner").css("height", "auto")
        }
        ,
        r.prototype.mouseMoved = function(e) {
            this.controller.setCursorImageLocation(e),
            this.controller.cursorForAction(this.actionForMousePos(e.pageX, e.pageY));
            if (this.canScrollVertically())
                return this.scrollVelocity = Math.round((e.pageY - $(window).height() / 2) / 10)
        }
        ,
        r.prototype.scroll = function() {
            var e, t, n;
            if ($("body").hasClass("previews"))
                return;
            return n = parseInt($("#lightbox-container .inner").css("top")) || 0,
            n -= this.scrollVelocity * 1,
            t = 0,
            e = -(this.imageHeight - $(window).height()),
            n < e && (n = e),
            n > t && (n = t),
            $("#lightbox-container .inner").css("top", n)
        }
        ,
        r
    }(this.BaseLightbox)
}
.call(this),
function() {
    var e = function(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
      , t = {}.hasOwnProperty
      , n = function(e, n) {
        function i() {
            this.constructor = e
        }
        for (var r in n)
            t.call(n, r) && (e[r] = n[r]);
        return i.prototype = n.prototype,
        e.prototype = new i,
        e.__super__ = n.prototype,
        e
    };
    this.PreviewLightbox = function(t) {
        function r(t, n, i, s) {
            this.controller = t,
            this.hide = e(this.hide, this),
            this.show = e(this.show, this),
            this.touchDeviceOrientationChanged = e(this.touchDeviceOrientationChanged, this),
            this.closeIconClicked = e(this.closeIconClicked, this),
            this.closeIconTapped = e(this.closeIconTapped, this),
            this.imageClicked = e(this.imageClicked, this),
            this.addLightboxToDom = e(this.addLightboxToDom, this),
            r.__super__.constructor.call(this, n, i, s),
            $("html").hasClass("touch") || $("body").on("click", "#lightbox-image", this.imageClicked),
            $(window).on("orientationchange", this.touchDeviceOrientationChanged)
        }
        return n(r, t),
        r.prototype.addLightboxToDom = function() {
            r.__super__.addLightboxToDom.call(this),
            $("#lightbox-container").height($(window).height());
            if ($("html").hasClass("touch"))
                return $("#lightbox-container").find(".close").on("touchstart", this.closeIconTapped),
                $("#lightbox-container").find(".close").on("click", this.closeIconClicked)
        }
        ,
        r.prototype.imageClicked = function(e) {
            return e.preventDefault(),
            this.hide()
        }
        ,
        r.prototype.closeIconTapped = function(e) {
            return e.preventDefault(),
            this.hide()
        }
        ,
        r.prototype.closeIconClicked = function(e) {
            return e.preventDefault()
        }
        ,
        r.prototype.touchDeviceOrientationChanged = function() {
            return this.hide()
        }
        ,
        r.prototype.show = function(e) {
            r.__super__.show.call(this, e);
            if ($("html").hasClass("touch"))
                return $("#viewport").attr("content", "width=650, minimum-scale=" + window.preview_scale_ratio + ", maximum-scale=2, user-scalable=yes"),
                document.body.style.opacity = .9999,
                setTimeout(function() {
                    return document.body.style.opacity = 1
                }, 1),
                setTimeout(function() {
                    return window.scrollTo(0, 0)
                }, 100)
        }
        ,
        r.prototype.hide = function() {
            return r.__super__.hide.call(this),
            $("#viewport").attr("content", "width=650,  minimum-scale=" + window.preview_scale_ratio + ", maximum-scale=" + window.preview_scale_ratio + ", user-scalable=no")
        }
        ,
        r
    }(this.BaseLightbox)
}
.call(this),
function(e) {
    function w(e, t, n) {
        var r = e[0];
        o = /er/.test(n) ? f : /bl/.test(n) ? u : s,
        active = n == l ? {
            checked: r[s],
            disabled: r[u],
            indeterminate: e.attr(f) == "true" || e.attr(a) == "false"
        } : r[o];
        if (/^(ch|di|in)/.test(n) && !active)
            E(e, o);
        else if (/^(un|en|de)/.test(n) && active)
            S(e, o);
        else if (n == l)
            for (var o in active)
                active[o] ? E(e, o, !0) : S(e, o, !0);
        else if (!t || n == "toggle")
            t || e[m]("ifClicked"),
            active ? r[c] !== i && S(e, o) : E(e, o)
    }
    function E(r, l, h) {
        var p = r[0]
          , m = r.parent()
          , g = l == s
          , b = l == f
          , w = b ? a : g ? o : "enabled"
          , E = T(p, w + N(p[c]))
          , x = T(p, l + N(p[c]));
        if (p[l] !== !0) {
            if (!h && l == s && p[c] == i && p.name) {
                var k = r.closest("form")
                  , L = 'input[name="' + p.name + '"]';
                L = k.length ? k.find(L) : e(L),
                L.each(function() {
                    this !== p && e.data(this, t) && S(e(this), l)
                })
            }
            b ? (p[l] = !0,
            p[s] && S(r, s, "force")) : (h || (p[l] = !0),
            g && p[f] && S(r, f, !1)),
            C(r, g, l, h)
        }
        p[u] && !!T(p, y, !0) && m.find("." + n).css(y, "default"),
        m[d](x || T(p, l)),
        m[v](E || T(p, w) || "")
    }
    function S(e, t, r) {
        var i = e[0]
          , l = e.parent()
          , h = t == s
          , p = t == f
          , m = p ? a : h ? o : "enabled"
          , g = T(i, m + N(i[c]))
          , b = T(i, t + N(i[c]));
        if (i[t] !== !1) {
            if (p || !r || r == "force")
                i[t] = !1;
            C(e, h, m, r)
        }
        !i[u] && !!T(i, y, !0) && l.find("." + n).css(y, "pointer"),
        l[v](b || T(i, t) || ""),
        l[d](g || T(i, m))
    }
    function x(n, r) {
        if (e.data(n, t)) {
            var i = e(n);
            i.parent().html(i.attr("style", e.data(n, t).s || "")[m](r || "")),
            i.off(".i").unwrap(),
            e(g + '[for="' + n.id + '"]').add(i.closest(g)).off(".i")
        }
    }
    function T(n, r, i) {
        if (e.data(n, t))
            return e.data(n, t).o[r + (i ? "" : "Class")]
    }
    function N(e) {
        return e.charAt(0).toUpperCase() + e.slice(1)
    }
    function C(e, t, n, r) {
        r || (t && e[m]("ifToggled"),
        e[m]("ifChanged")[m]("if" + N(n)))
    }
    var t = "iCheck"
      , n = t + "-helper"
      , r = "checkbox"
      , i = "radio"
      , s = "checked"
      , o = "un" + s
      , u = "disabled"
      , a = "determinate"
      , f = "in" + a
      , l = "update"
      , c = "type"
      , h = "click"
      , p = "touchbegin.i touchend.i"
      , d = "addClass"
      , v = "removeClass"
      , m = "trigger"
      , g = "label"
      , y = "cursor"
      , b = /ipad|iphone|ipod|android|blackberry|windows phone|opera mini/i.test(navigator.userAgent);
    e.fn[t] = function(o, a) {
        var y = ":" + r + ", :" + i
          , T = e()
          , N = function(t) {
            t.each(function() {
                var t = e(this);
                t.is(y) ? T = T.add(t) : T = T.add(t.find(y))
            })
        };
        if (/^(check|uncheck|toggle|indeterminate|determinate|disable|enable|update|destroy)$/i.test(o))
            return o = o.toLowerCase(),
            N(this),
            T.each(function() {
                o == "destroy" ? x(this, "ifDestroyed") : w(e(this), !0, o),
                e.isFunction(a) && a()
            });
        if (typeof o == "object" || !o) {
            var C = e.extend({
                checkedClass: s,
                disabledClass: u,
                indeterminateClass: f,
                labelHover: !0
            }, o)
              , k = C.handle
              , L = C.hoverClass || "hover"
              , A = C.focusClass || "focus"
              , O = C.activeClass || "active"
              , M = !!C.labelHover
              , _ = C.labelHoverClass || "hover"
              , D = ("" + C.increaseArea).replace("%", "") | 0;
            if (k == r || k == i)
                y = ":" + k;
            return D < -50 && (D = -50),
            N(this),
            T.each(function() {
                x(this);
                var o = e(this)
                  , a = this
                  , f = a.id
                  , y = -D + "%"
                  , T = 100 + D * 2 + "%"
                  , N = {
                    position: "absolute",
                    top: y,
                    left: y,
                    display: "block",
                    width: T,
                    height: T,
                    margin: 0,
                    padding: 0,
                    background: "#fff",
                    border: 0,
                    opacity: 0
                }
                  , k = b ? {
                    position: "absolute",
                    visibility: "hidden"
                } : D ? N : {
                    position: "absolute",
                    opacity: 0
                }
                  , P = a[c] == r ? C.checkboxClass || "i" + r : C.radioClass || "i" + i
                  , H = e(g + '[for="' + f + '"]').add(o.closest(g))
                  , B = o.wrap('<div class="' + P + '"/>')[m]("ifCreated").parent().append(C.insert)
                  , j = e('<ins class="' + n + '"/>').css(N).appendTo(B);
                o.data(t, {
                    o: C,
                    s: o.attr("style")
                }).css(k),
                !!C.inheritClass && B[d](a.className),
                !!C.inheritID && f && B.attr("id", t + "-" + f),
                B.css("position") == "static" && B.css("position", "relative"),
                w(o, !0, l),
                H.length && H.on(h + ".i mouseenter.i mouseleave.i " + p, function(t) {
                    var n = t[c]
                      , r = e(this);
                    if (!a[u]) {
                        n == h ? w(o, !1, !0) : M && (/ve|nd/.test(n) ? (B[v](L),
                        r[v](_)) : (B[d](L),
                        r[d](_)));
                        if (!b)
                            return !1;
                        t.stopPropagation()
                    }
                }),
                o.on(h + ".i focus.i blur.i keyup.i keydown.i keypress.i", function(e) {
                    var t = e[c]
                      , n = e.keyCode;
                    if (t == h)
                        return !1;
                    if (t == "keydown" && n == 32) {
                        if (a[c] != i || !a[s])
                            a[s] ? S(o, s) : E(o, s);
                        return !1
                    }
                    t == "keyup" && a[c] == i ? !a[s] && E(o, s) : /us|ur/.test(t) && B[t == "blur" ? v : d](A)
                }),
                j.on(h + " mousedown mouseup mouseover mouseout " + p, function(e) {
                    var t = e[c]
                      , n = /wn|up/.test(t) ? O : L;
                    if (!a[u]) {
                        t == h ? w(o, !1, !0) : (/wn|er|in/.test(t) ? B[d](n) : B[v](n + " " + O),
                        H.length && M && n == L && H[/ut|nd/.test(t) ? v : d](_));
                        if (!b)
                            return !1;
                        e.stopPropagation()
                    }
                })
            })
        }
        return this
    }
}(jQuery),
function() {
    var e, t = [].indexOf || function(e) {
        for (var t = 0, n = this.length; t < n; t++)
            if (t in this && this[t] === e)
                return t;
        return -1
    }
    ;
    e = jQuery,
    e.fn.validateCreditCard = function(n, r) {
        var i, s, o, u, a, f, l, c, h, p, d, v, m;
        o = [{
            name: "amex",
            pattern: /^3[47]/,
            valid_length: [15]
        }, {
            name: "diners_club_carte_blanche",
            pattern: /^30[0-5]/,
            valid_length: [14]
        }, {
            name: "diners_club_international",
            pattern: /^36/,
            valid_length: [14]
        }, {
            name: "jcb",
            pattern: /^35(2[89]|[3-8][0-9])/,
            valid_length: [16]
        }, {
            name: "laser",
            pattern: /^(6304|670[69]|6771)/,
            valid_length: [16, 17, 18, 19]
        }, {
            name: "visa_electron",
            pattern: /^(4026|417500|4508|4844|491(3|7))/,
            valid_length: [16]
        }, {
            name: "visa",
            pattern: /^4/,
            valid_length: [16]
        }, {
            name: "mastercard",
            pattern: /^5[1-5]/,
            valid_length: [16]
        }, {
            name: "maestro",
            pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
            valid_length: [12, 13, 14, 15, 16, 17, 18, 19]
        }, {
            name: "discover",
            pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
            valid_length: [16]
        }],
        r == null && (r = {}),
        (v = r.accept) == null && (r.accept = function() {
            var e, t, n;
            n = [];
            for (e = 0,
            t = o.length; e < t; e++)
                i = o[e],
                n.push(i.name);
            return n
        }()),
        m = r.accept;
        for (p = 0,
        d = m.length; p < d; p++) {
            s = m[p];
            if (t.call(function() {
                var e, t, n;
                n = [];
                for (e = 0,
                t = o.length; e < t; e++)
                    i = o[e],
                    n.push(i.name);
                return n
            }(), s) < 0)
                throw "Credit card type '" + s + "' is not supported"
        }
        return u = function(e) {
            var n, u, a;
            a = function() {
                var e, n, s, u;
                u = [];
                for (e = 0,
                n = o.length; e < n; e++)
                    i = o[e],
                    (s = i.name,
                    t.call(r.accept, s) >= 0) && u.push(i);
                return u
            }();
            for (n = 0,
            u = a.length; n < u; n++) {
                s = a[n];
                if (e.match(s.pattern))
                    return s
            }
            return null
        }
        ,
        f = function(e) {
            var t, n, r, i, s, o;
            r = 0,
            o = e.split("").reverse();
            for (n = i = 0,
            s = o.length; i < s; n = ++i)
                t = o[n],
                t = +t,
                n % 2 ? (t *= 2,
                t < 10 ? r += t : r += t - 9) : r += t;
            return r % 10 === 0
        }
        ,
        a = function(e, n) {
            var r;
            return r = e.length,
            t.call(n.valid_length, r) >= 0
        }
        ,
        h = function(e) {
            var t, r;
            return s = u(e),
            r = !1,
            t = !1,
            s != null && (r = f(e),
            t = a(e, s)),
            n({
                card_type: s,
                luhn_valid: r,
                length_valid: t
            })
        }
        ,
        c = function() {
            var t;
            return t = l(e(this).val()),
            h(t)
        }
        ,
        l = function(e) {
            return e.replace(/[ -]/g, "")
        }
        ,
        this.bind("input", function() {
            return e(this).unbind("keyup"),
            c.call(this)
        }),
        this.bind("keyup", function() {
            return c.call(this)
        }),
        this.length !== 0 && c.call(this),
        this
    }
}
.call(this),
function(e) {
    e.extend(e.fn, {
        validate: function(n) {
            if (!this.length)
                return n && n.debug && window.console && console.warn("Nothing selected, can't validate, returning nothing."),
                void 0;
            var r = e.data(this[0], "validator");
            return r ? r : (this.attr("novalidate", "novalidate"),
            r = new e.validator(n,this[0]),
            e.data(this[0], "validator", r),
            r.settings.onsubmit && (this.validateDelegate(":submit", "click", function(n) {
                r.settings.submitHandler && (r.submitButton = n.target),
                e(n.target).hasClass("cancel") && (r.cancelSubmit = !0),
                void 0 !== e(n.target).attr("formnovalidate") && (r.cancelSubmit = !0)
            }),
            this.submit(function(n) {
                function s() {
                    var s;
                    return r.settings.submitHandler ? (r.submitButton && (s = e("<input type='hidden'/>").attr("name", r.submitButton.name).val(e(r.submitButton).val()).appendTo(r.currentForm)),
                    r.settings.submitHandler.call(r, r.currentForm, n),
                    r.submitButton && s.remove(),
                    !1) : !0
                }
                return r.settings.debug && n.preventDefault(),
                r.cancelSubmit ? (r.cancelSubmit = !1,
                s()) : r.form() ? r.pendingRequest ? (r.formSubmitted = !0,
                !1) : s() : (r.focusInvalid(),
                !1)
            })),
            r)
        },
        valid: function() {
            if (e(this[0]).is("form"))
                return this.validate().form();
            var n = !0
              , r = e(this[0].form).validate();
            return this.each(function() {
                n = n && r.element(this)
            }),
            n
        },
        removeAttrs: function(n) {
            var r = {}
              , i = this;
            return e.each(n.split(/\s/), function(e, t) {
                r[t] = i.attr(t),
                i.removeAttr(t)
            }),
            r
        },
        rules: function(n, r) {
            var i = this[0];
            if (n) {
                var s = e.data(i.form, "validator").settings
                  , o = s.rules
                  , u = e.validator.staticRules(i);
                switch (n) {
                case "add":
                    e.extend(u, e.validator.normalizeRule(r)),
                    delete u.messages,
                    o[i.name] = u,
                    r.messages && (s.messages[i.name] = e.extend(s.messages[i.name], r.messages));
                    break;
                case "remove":
                    if (!r)
                        return delete o[i.name],
                        u;
                    var a = {};
                    return e.each(r.split(/\s/), function(e, t) {
                        a[t] = u[t],
                        delete u[t]
                    }),
                    a
                }
            }
            var f = e.validator.normalizeRules(e.extend({}, e.validator.classRules(i), e.validator.attributeRules(i), e.validator.dataRules(i), e.validator.staticRules(i)), i);
            if (f.required) {
                var l = f.required;
                delete f.required,
                f = e.extend({
                    required: l
                }, f)
            }
            return f
        }
    }),
    e.extend(e.expr[":"], {
        blank: function(n) {
            return !e.trim("" + e(n).val())
        },
        filled: function(n) {
            return !!e.trim("" + e(n).val())
        },
        unchecked: function(n) {
            return !e(n).prop("checked")
        }
    }),
    e.validator = function(n, r) {
        this.settings = e.extend(!0, {}, e.validator.defaults, n),
        this.currentForm = r,
        this.init()
    }
    ,
    e.validator.format = function(n, r) {
        return 1 === arguments.length ? function() {
            var r = e.makeArray(arguments);
            return r.unshift(n),
            e.validator.format.apply(this, r)
        }
        : (arguments.length > 2 && r.constructor !== Array && (r = e.makeArray(arguments).slice(1)),
        r.constructor !== Array && (r = [r]),
        e.each(r, function(e, t) {
            n = n.replace(RegExp("\\{" + e + "\\}", "g"), function() {
                return t
            })
        }),
        n)
    }
    ,
    e.extend(e.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusInvalid: !0,
            errorContainer: e([]),
            errorLabelContainer: e([]),
            onsubmit: !0,
            ignore: ":hidden",
            ignoreTitle: !1,
            onfocusin: function(e) {
                this.lastActive = e,
                this.settings.focusCleanup && !this.blockFocusCleanup && (this.settings.unhighlight && this.settings.unhighlight.call(this, e, this.settings.errorClass, this.settings.validClass),
                this.addWrapper(this.errorsFor(e)).hide())
            },
            onfocusout: function(e) {
                this.checkable(e) || !(e.name in this.submitted) && this.optional(e) || this.element(e)
            },
            onkeyup: function(e, t) {
                (9 !== t.which || "" !== this.elementValue(e)) && (e.name in this.submitted || e === this.lastElement) && this.element(e)
            },
            onclick: function(e) {
                e.name in this.submitted ? this.element(e) : e.parentNode.name in this.submitted && this.element(e.parentNode)
            },
            highlight: function(n, r, i) {
                "radio" === n.type ? this.findByName(n.name).addClass(r).removeClass(i) : e(n).addClass(r).removeClass(i)
            },
            unhighlight: function(n, r, i) {
                "radio" === n.type ? this.findByName(n.name).removeClass(r).addClass(i) : e(n).removeClass(r).addClass(i)
            }
        },
        setDefaults: function(n) {
            e.extend(e.validator.defaults, n)
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            maxlength: e.validator.format("Please enter no more than {0} characters."),
            minlength: e.validator.format("Please enter at least {0} characters."),
            rangelength: e.validator.format("Please enter a value between {0} and {1} characters long."),
            range: e.validator.format("Please enter a value between {0} and {1}."),
            max: e.validator.format("Please enter a value less than or equal to {0}."),
            min: e.validator.format("Please enter a value greater than or equal to {0}.")
        },
        autoCreateRanges: !1,
        prototype: {
            init: function() {
                function n(n) {
                    var r = e.data(this[0].form, "validator")
                      , i = "on" + n.type.replace(/^validate/, "");
                    r.settings[i] && r.settings[i].call(r, this[0], n)
                }
                this.labelContainer = e(this.settings.errorLabelContainer),
                this.errorContext = this.labelContainer.length && this.labelContainer || e(this.currentForm),
                this.containers = e(this.settings.errorContainer).add(this.settings.errorLabelContainer),
                this.submitted = {},
                this.valueCache = {},
                this.pendingRequest = 0,
                this.pending = {},
                this.invalid = {},
                this.reset();
                var r = this.groups = {};
                e.each(this.settings.groups, function(n, i) {
                    "string" == typeof i && (i = i.split(/\s/)),
                    e.each(i, function(e, t) {
                        r[t] = n
                    })
                });
                var i = this.settings.rules;
                e.each(i, function(n, r) {
                    i[n] = e.validator.normalizeRule(r)
                }),
                e(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'] ", "focusin focusout keyup", n).validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", n),
                this.settings.invalidHandler && e(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler)
            },
            form: function() {
                return this.checkForm(),
                e.extend(this.submitted, this.errorMap),
                this.invalid = e.extend({}, this.errorMap),
                this.valid() || e(this.currentForm).triggerHandler("invalid-form", [this]),
                this.showErrors(),
                this.valid()
            },
            checkForm: function() {
                this.prepareForm();
                for (var e = 0, t = this.currentElements = this.elements(); t[e]; e++)
                    this.check(t[e]);
                return this.valid()
            },
            element: function(n) {
                n = this.validationTargetFor(this.clean(n)),
                this.lastElement = n,
                this.prepareElement(n),
                this.currentElements = e(n);
                var r = this.check(n) !== !1;
                return r ? delete this.invalid[n.name] : this.invalid[n.name] = !0,
                this.numberOfInvalids() || (this.toHide = this.toHide.add(this.containers)),
                this.showErrors(),
                r
            },
            showErrors: function(n) {
                if (n) {
                    e.extend(this.errorMap, n),
                    this.errorList = [];
                    for (var r in n)
                        this.errorList.push({
                            message: n[r],
                            element: this.findByName(r)[0]
                        });
                    this.successList = e.grep(this.successList, function(e) {
                        return !(e.name in n)
                    })
                }
                this.settings.showErrors ? this.settings.showErrors.call(this, this.errorMap, this.errorList) : this.defaultShowErrors()
            },
            resetForm: function() {
                e.fn.resetForm && e(this.currentForm).resetForm(),
                this.submitted = {},
                this.lastElement = null ,
                this.prepareForm(),
                this.hideErrors(),
                this.elements().removeClass(this.settings.errorClass).removeData("previousValue")
            },
            numberOfInvalids: function() {
                return this.objectLength(this.invalid)
            },
            objectLength: function(e) {
                var t = 0;
                for (var n in e)
                    t++;
                return t
            },
            hideErrors: function() {
                this.addWrapper(this.toHide).hide()
            },
            valid: function() {
                return 0 === this.size()
            },
            size: function() {
                return this.errorList.length
            },
            focusInvalid: function() {
                if (this.settings.focusInvalid)
                    try {
                        e(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin")
                    } catch (n) {}
            },
            findLastActive: function() {
                var n = this.lastActive;
                return n && 1 === e.grep(this.errorList, function(e) {
                    return e.element.name === n.name
                }).length && n
            },
            elements: function() {
                var n = this
                  , r = {};
                return e(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function() {
                    return !this.name && n.settings.debug && window.console && console.error("%o has no name assigned", this),
                    this.name in r || !n.objectLength(e(this).rules()) ? !1 : (r[this.name] = !0,
                    !0)
                })
            },
            clean: function(n) {
                return e(n)[0]
            },
            errors: function() {
                var n = this.settings.errorClass.replace(" ", ".");
                return e(this.settings.errorElement + "." + n, this.errorContext)
            },
            reset: function() {
                this.successList = [],
                this.errorList = [],
                this.errorMap = {},
                this.toShow = e([]),
                this.toHide = e([]),
                this.currentElements = e([])
            },
            prepareForm: function() {
                this.reset(),
                this.toHide = this.errors().add(this.containers)
            },
            prepareElement: function(e) {
                this.reset(),
                this.toHide = this.errorsFor(e)
            },
            elementValue: function(n) {
                var r = e(n).attr("type")
                  , i = e(n).val();
                return "radio" === r || "checkbox" === r ? e("input[name='" + e(n).attr("name") + "']:checked").val() : "string" == typeof i ? i.replace(/\r/g, "") : i
            },
            check: function(n) {
                n = this.validationTargetFor(this.clean(n));
                var r, i = e(n).rules(), s = !1, o = this.elementValue(n);
                for (var u in i) {
                    var a = {
                        method: u,
                        parameters: i[u]
                    };
                    try {
                        if (r = e.validator.methods[u].call(this, o, n, a.parameters),
                        "dependency-mismatch" === r) {
                            s = !0;
                            continue
                        }
                        if (s = !1,
                        "pending" === r)
                            return this.toHide = this.toHide.not(this.errorsFor(n)),
                            void 0;
                        if (!r)
                            return this.formatAndAdd(n, a),
                            !1
                    } catch (f) {
                        throw this.settings.debug && window.console && console.log("Exception occurred when checking element " + n.id + ", check the '" + a.method + "' method.", f),
                        f
                    }
                }
                return s ? void 0 : (this.objectLength(i) && this.successList.push(n),
                !0)
            },
            customDataMessage: function(n, r) {
                return e(n).data("msg-" + r.toLowerCase()) || n.attributes && e(n).attr("data-msg-" + r.toLowerCase())
            },
            customMessage: function(e, t) {
                var n = this.settings.messages[e];
                return n && (n.constructor === String ? n : n[t])
            },
            findDefined: function() {
                for (var e = 0; arguments.length > e; e++)
                    if (void 0 !== arguments[e])
                        return arguments[e];
                return void 0
            },
            defaultMessage: function(n, r) {
                return this.findDefined(this.customMessage(n.name, r), this.customDataMessage(n, r), !this.settings.ignoreTitle && n.title || void 0, e.validator.messages[r], "<strong>Warning: No message defined for " + n.name + "</strong>")
            },
            formatAndAdd: function(n, r) {
                var i = this.defaultMessage(n, r.method)
                  , s = /\$?\{(\d+)\}/g;
                "function" == typeof i ? i = i.call(this, r.parameters, n) : s.test(i) && (i = e.validator.format(i.replace(s, "{$1}"), r.parameters)),
                this.errorList.push({
                    message: i,
                    element: n
                }),
                this.errorMap[n.name] = i,
                this.submitted[n.name] = i
            },
            addWrapper: function(e) {
                return this.settings.wrapper && (e = e.add(e.parent(this.settings.wrapper))),
                e
            },
            defaultShowErrors: function() {
                var e, t;
                for (e = 0; this.errorList[e]; e++) {
                    var n = this.errorList[e];
                    this.settings.highlight && this.settings.highlight.call(this, n.element, this.settings.errorClass, this.settings.validClass),
                    this.showLabel(n.element, n.message)
                }
                if (this.errorList.length && (this.toShow = this.toShow.add(this.containers)),
                this.settings.success)
                    for (e = 0; this.successList[e]; e++)
                        this.showLabel(this.successList[e]);
                if (this.settings.unhighlight)
                    for (e = 0,
                    t = this.validElements(); t[e]; e++)
                        this.settings.unhighlight.call(this, t[e], this.settings.errorClass, this.settings.validClass);
                this.toHide = this.toHide.not(this.toShow),
                this.hideErrors(),
                this.addWrapper(this.toShow).show()
            },
            validElements: function() {
                return this.currentElements.not(this.invalidElements())
            },
            invalidElements: function() {
                return e(this.errorList).map(function() {
                    return this.element
                })
            },
            showLabel: function(n, r) {
                var i = this.errorsFor(n);
                i.length ? (i.removeClass(this.settings.validClass).addClass(this.settings.errorClass),
                i.html(r)) : (i = e("<" + this.settings.errorElement + ">").attr("for", this.idOrName(n)).addClass(this.settings.errorClass).html(r || ""),
                this.settings.wrapper && (i = i.hide().show().wrap("<" + this.settings.wrapper + "/>").parent()),
                this.labelContainer.append(i).length || (this.settings.errorPlacement ? this.settings.errorPlacement(i, e(n)) : i.insertAfter(n))),
                !r && this.settings.success && (i.text(""),
                "string" == typeof this.settings.success ? i.addClass(this.settings.success) : this.settings.success(i, n)),
                this.toShow = this.toShow.add(i)
            },
            errorsFor: function(n) {
                var r = this.idOrName(n);
                return this.errors().filter(function() {
                    return e(this).attr("for") === r
                })
            },
            idOrName: function(e) {
                return this.groups[e.name] || (this.checkable(e) ? e.name : e.id || e.name)
            },
            validationTargetFor: function(e) {
                return this.checkable(e) && (e = this.findByName(e.name).not(this.settings.ignore)[0]),
                e
            },
            checkable: function(e) {
                return /radio|checkbox/i.test(e.type)
            },
            findByName: function(n) {
                return e(this.currentForm).find("[name='" + n + "']")
            },
            getLength: function(n, r) {
                switch (r.nodeName.toLowerCase()) {
                case "select":
                    return e("option:selected", r).length;
                case "input":
                    if (this.checkable(r))
                        return this.findByName(r.name).filter(":checked").length
                }
                return n.length
            },
            depend: function(e, t) {
                return this.dependTypes[typeof e] ? this.dependTypes[typeof e](e, t) : !0
            },
            dependTypes: {
                "boolean": function(e) {
                    return e
                },
                string: function(n, r) {
                    return !!e(n, r.form).length
                },
                "function": function(e, t) {
                    return e(t)
                }
            },
            optional: function(n) {
                var r = this.elementValue(n);
                return !e.validator.methods.required.call(this, r, n) && "dependency-mismatch"
            },
            startRequest: function(e) {
                this.pending[e.name] || (this.pendingRequest++,
                this.pending[e.name] = !0)
            },
            stopRequest: function(n, r) {
                this.pendingRequest--,
                0 > this.pendingRequest && (this.pendingRequest = 0),
                delete this.pending[n.name],
                r && 0 === this.pendingRequest && this.formSubmitted && this.form() ? (e(this.currentForm).submit(),
                this.formSubmitted = !1) : !r && 0 === this.pendingRequest && this.formSubmitted && (e(this.currentForm).triggerHandler("invalid-form", [this]),
                this.formSubmitted = !1)
            },
            previousValue: function(n) {
                return e.data(n, "previousValue") || e.data(n, "previousValue", {
                    old: null ,
                    valid: !0,
                    message: this.defaultMessage(n, "remote")
                })
            }
        },
        classRuleSettings: {
            required: {
                required: !0
            },
            email: {
                email: !0
            },
            url: {
                url: !0
            },
            date: {
                date: !0
            },
            dateISO: {
                dateISO: !0
            },
            number: {
                number: !0
            },
            digits: {
                digits: !0
            },
            creditcard: {
                creditcard: !0
            }
        },
        addClassRules: function(n, r) {
            n.constructor === String ? this.classRuleSettings[n] = r : e.extend(this.classRuleSettings, n)
        },
        classRules: function(n) {
            var r = {}
              , i = e(n).attr("class");
            return i && e.each(i.split(" "), function() {
                this in e.validator.classRuleSettings && e.extend(r, e.validator.classRuleSettings[this])
            }),
            r
        },
        attributeRules: function(n) {
            var r = {}
              , i = e(n)
              , s = i[0].getAttribute("type");
            for (var o in e.validator.methods) {
                var u;
                "required" === o ? (u = i.get(0).getAttribute(o),
                "" === u && (u = !0),
                u = !!u) : u = i.attr(o),
                /min|max/.test(o) && (null === s || /number|range|text/.test(s)) && (u = Number(u)),
                u ? r[o] = u : s === o && "range" !== s && (r[o] = !0)
            }
            return r.maxlength && /-1|2147483647|524288/.test(r.maxlength) && delete r.maxlength,
            r
        },
        dataRules: function(n) {
            var r, i, s = {}, o = e(n);
            for (r in e.validator.methods)
                i = o.data("rule-" + r.toLowerCase()),
                void 0 !== i && (s[r] = i);
            return s
        },
        staticRules: function(n) {
            var r = {}
              , i = e.data(n.form, "validator");
            return i.settings.rules && (r = e.validator.normalizeRule(i.settings.rules[n.name]) || {}),
            r
        },
        normalizeRules: function(n, r) {
            return e.each(n, function(s, o) {
                if (o === !1)
                    return delete n[s],
                    void 0;
                if (o.param || o.depends) {
                    var u = !0;
                    switch (typeof o.depends) {
                    case "string":
                        u = !!e(o.depends, r.form).length;
                        break;
                    case "function":
                        u = o.depends.call(r, r)
                    }
                    u ? n[s] = void 0 !== o.param ? o.param : !0 : delete n[s]
                }
            }),
            e.each(n, function(s, o) {
                n[s] = e.isFunction(o) ? o(r) : o
            }),
            e.each(["minlength", "maxlength"], function() {
                n[this] && (n[this] = Number(n[this]))
            }),
            e.each(["rangelength", "range"], function() {
                var r;
                n[this] && (e.isArray(n[this]) ? n[this] = [Number(n[this][0]), Number(n[this][1])] : "string" == typeof n[this] && (r = n[this].split(/[\s,]+/),
                n[this] = [Number(r[0]), Number(r[1])]))
            }),
            e.validator.autoCreateRanges && (n.min && n.max && (n.range = [n.min, n.max],
            delete n.min,
            delete n.max),
            n.minlength && n.maxlength && (n.rangelength = [n.minlength, n.maxlength],
            delete n.minlength,
            delete n.maxlength)),
            n
        },
        normalizeRule: function(n) {
            if ("string" == typeof n) {
                var r = {};
                e.each(n.split(/\s/), function() {
                    r[this] = !0
                }),
                n = r
            }
            return n
        },
        addMethod: function(n, r, i) {
            e.validator.methods[n] = r,
            e.validator.messages[n] = void 0 !== i ? i : e.validator.messages[n],
            3 > r.length && e.validator.addClassRules(n, e.validator.normalizeRule(n))
        },
        methods: {
            required: function(n, r, i) {
                if (!this.depend(i, r))
                    return "dependency-mismatch";
                if ("select" === r.nodeName.toLowerCase()) {
                    var s = e(r).val();
                    return s && s.length > 0
                }
                return this.checkable(r) ? this.getLength(n, r) > 0 : e.trim(n).length > 0
            },
            email: function(e, t) {
                return this.optional(t) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(e)
            },
            url: function(e, t) {
                return this.optional(t) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(e)
            },
            date: function(e, t) {
                return this.optional(t) || !/Invalid|NaN/.test("" + new Date(e))
            },
            dateISO: function(e, t) {
                return this.optional(t) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(e)
            },
            number: function(e, t) {
                return this.optional(t) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(e)
            },
            digits: function(e, t) {
                return this.optional(t) || /^\d+$/.test(e)
            },
            creditcard: function(e, t) {
                if (this.optional(t))
                    return "dependency-mismatch";
                if (/[^0-9 \-]+/.test(e))
                    return !1;
                var n = 0
                  , r = 0
                  , i = !1;
                e = e.replace(/\D/g, "");
                for (var s = e.length - 1; s >= 0; s--) {
                    var o = e.charAt(s);
                    r = parseInt(o, 10),
                    i && (r *= 2) > 9 && (r -= 9),
                    n += r,
                    i = !i
                }
                return 0 === n % 10
            },
            minlength: function(n, r, i) {
                var s = e.isArray(n) ? n.length : this.getLength(e.trim(n), r);
                return this.optional(r) || s >= i
            },
            maxlength: function(n, r, i) {
                var s = e.isArray(n) ? n.length : this.getLength(e.trim(n), r);
                return this.optional(r) || i >= s
            },
            rangelength: function(n, r, i) {
                var s = e.isArray(n) ? n.length : this.getLength(e.trim(n), r);
                return this.optional(r) || s >= i[0] && i[1] >= s
            },
            min: function(e, t, n) {
                return this.optional(t) || e >= n
            },
            max: function(e, t, n) {
                return this.optional(t) || n >= e
            },
            range: function(e, t, n) {
                return this.optional(t) || e >= n[0] && n[1] >= e
            },
            equalTo: function(n, r, i) {
                var s = e(i);
                return this.settings.onfocusout && s.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
                    e(r).valid()
                }),
                n === s.val()
            },
            remote: function(n, r, i) {
                if (this.optional(r))
                    return "dependency-mismatch";
                var s = this.previousValue(r);
                if (this.settings.messages[r.name] || (this.settings.messages[r.name] = {}),
                s.originalMessage = this.settings.messages[r.name].remote,
                this.settings.messages[r.name].remote = s.message,
                i = "string" == typeof i && {
                    url: i
                } || i,
                s.old === n)
                    return s.valid;
                s.old = n;
                var o = this;
                this.startRequest(r);
                var u = {};
                return u[r.name] = n,
                e.ajax(e.extend(!0, {
                    url: i,
                    mode: "abort",
                    port: "validate" + r.name,
                    dataType: "json",
                    data: u,
                    success: function(i) {
                        o.settings.messages[r.name].remote = s.originalMessage;
                        var u = i === !0 || "true" === i;
                        if (u) {
                            var a = o.formSubmitted;
                            o.prepareElement(r),
                            o.formSubmitted = a,
                            o.successList.push(r),
                            delete o.invalid[r.name],
                            o.showErrors()
                        } else {
                            var f = {}
                              , l = i || o.defaultMessage(r, "remote");
                            f[r.name] = s.message = e.isFunction(l) ? l(n) : l,
                            o.invalid[r.name] = !0,
                            o.showErrors(f)
                        }
                        s.valid = u,
                        o.stopRequest(r, u)
                    }
                }, i)),
                "pending"
            }
        }
    }),
    e.format = e.validator.format
}(jQuery),
function(e) {
    var t = {};
    if (e.ajaxPrefilter)
        e.ajaxPrefilter(function(e, n, r) {
            var i = e.port;
            "abort" === e.mode && (t[i] && t[i].abort(),
            t[i] = r)
        });
    else {
        var n = e.ajax;
        e.ajax = function(r) {
            var s = ("mode"in r ? r : e.ajaxSettings).mode
              , o = ("port"in r ? r : e.ajaxSettings).port;
            return "abort" === s ? (t[o] && t[o].abort(),
            t[o] = n.apply(this, arguments),
            t[o]) : n.apply(this, arguments)
        }
    }
}(jQuery),
function(e) {
    e.extend(e.fn, {
        validateDelegate: function(n, r, i) {
            return this.bind(r, function(r) {
                var o = e(r.target);
                return o.is(n) ? i.apply(o, arguments) : void 0
            })
        }
    })
}(jQuery),
function() {
    function e(e) {
        return e.replace(/<.[^<>]*?>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/[.(),;:!?%#$'"_+=\/\-]*/g, "")
    }
    jQuery.validator.addMethod("maxWords", function(n, r, i) {
        return this.optional(r) || i >= e(n).match(/\b\w+\b/g).length
    }, jQuery.validator.format("Please enter {0} words or less.")),
    jQuery.validator.addMethod("minWords", function(n, r, i) {
        return this.optional(r) || e(n).match(/\b\w+\b/g).length >= i
    }, jQuery.validator.format("Please enter at least {0} words.")),
    jQuery.validator.addMethod("rangeWords", function(n, r, i) {
        var s = e(n)
          , o = /\b\w+\b/g;
        return this.optional(r) || s.match(o).length >= i[0] && s.match(o).length <= i[1]
    }, jQuery.validator.format("Please enter between {0} and {1} words."))
}(),
jQuery.validator.addMethod("letterswithbasicpunc", function(e, t) {
    return this.optional(t) || /^[a-z\-.,()'"\s]+$/i.test(e)
}, "Letters or punctuation only please"),
jQuery.validator.addMethod("alphanumeric", function(e, t) {
    return this.optional(t) || /^\w+$/i.test(e)
}, "Letters, numbers, and underscores only please"),
jQuery.validator.addMethod("lettersonly", function(e, t) {
    return this.optional(t) || /^[a-z]+$/i.test(e)
}, "Letters only please"),
jQuery.validator.addMethod("nowhitespace", function(e, t) {
    return this.optional(t) || /^\S+$/i.test(e)
}, "No white space please"),
jQuery.validator.addMethod("ziprange", function(e, t) {
    return this.optional(t) || /^90[2-5]\d\{2\}-\d{4}$/.test(e)
}, "Your ZIP-code must be in the range 902xx-xxxx to 905-xx-xxxx"),
jQuery.validator.addMethod("zipcodeUS", function(e, t) {
    return this.optional(t) || /\d{5}-\d{4}$|^\d{5}$/.test(e)
}, "The specified US ZIP Code is invalid"),
jQuery.validator.addMethod("integer", function(e, t) {
    return this.optional(t) || /^-?\d+$/.test(e)
}, "A positive or negative non-decimal number please"),
jQuery.validator.addMethod("vinUS", function(e) {
    if (17 !== e.length)
        return !1;
    var t, n, r, i, s, o, u = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"], a = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 7, 9, 2, 3, 4, 5, 6, 7, 8, 9], f = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2], l = 0;
    for (t = 0; 17 > t; t++) {
        if (i = f[t],
        r = e.slice(t, t + 1),
        8 === t && (o = r),
        isNaN(r)) {
            for (n = 0; u.length > n; n++)
                if (r.toUpperCase() === u[n]) {
                    r = a[n],
                    r *= i,
                    isNaN(o) && 8 === n && (o = u[n]);
                    break
                }
        } else
            r *= i;
        l += r
    }
    return s = l % 11,
    10 === s && (s = "X"),
    s === o ? !0 : !1
}, "The specified vehicle identification number (VIN) is invalid."),
jQuery.validator.addMethod("dateITA", function(e, t) {
    var n = !1
      , r = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (r.test(e)) {
        var i = e.split("/")
          , s = parseInt(i[0], 10)
          , o = parseInt(i[1], 10)
          , u = parseInt(i[2], 10)
          , a = new Date(u,o - 1,s);
        n = a.getFullYear() === u && a.getMonth() === o - 1 && a.getDate() === s ? !0 : !1
    } else
        n = !1;
    return this.optional(t) || n
}, "Please enter a correct date"),
jQuery.validator.addMethod("iban", function(e, t) {
    if (this.optional(t))
        return !0;
    if (!/^([a-zA-Z0-9]{4} ){2,8}[a-zA-Z0-9]{1,4}|[a-zA-Z0-9]{12,34}$/.test(e))
        return !1;
    var n = e.replace(/ /g, "").toUpperCase()
      , r = n.substring(0, 2)
      , i = {
        AL: "\\d{8}[\\dA-Z]{16}",
        AD: "\\d{8}[\\dA-Z]{12}",
        AT: "\\d{16}",
        AZ: "[\\dA-Z]{4}\\d{20}",
        BE: "\\d{12}",
        BH: "[A-Z]{4}[\\dA-Z]{14}",
        BA: "\\d{16}",
        BR: "\\d{23}[A-Z][\\dA-Z]",
        BG: "[A-Z]{4}\\d{6}[\\dA-Z]{8}",
        CR: "\\d{17}",
        HR: "\\d{17}",
        CY: "\\d{8}[\\dA-Z]{16}",
        CZ: "\\d{20}",
        DK: "\\d{14}",
        DO: "[A-Z]{4}\\d{20}",
        EE: "\\d{16}",
        FO: "\\d{14}",
        FI: "\\d{14}",
        FR: "\\d{10}[\\dA-Z]{11}\\d{2}",
        GE: "[\\dA-Z]{2}\\d{16}",
        DE: "\\d{18}",
        GI: "[A-Z]{4}[\\dA-Z]{15}",
        GR: "\\d{7}[\\dA-Z]{16}",
        GL: "\\d{14}",
        GT: "[\\dA-Z]{4}[\\dA-Z]{20}",
        HU: "\\d{24}",
        IS: "\\d{22}",
        IE: "[\\dA-Z]{4}\\d{14}",
        IL: "\\d{19}",
        IT: "[A-Z]\\d{10}[\\dA-Z]{12}",
        KZ: "\\d{3}[\\dA-Z]{13}",
        KW: "[A-Z]{4}[\\dA-Z]{22}",
        LV: "[A-Z]{4}[\\dA-Z]{13}",
        LB: "\\d{4}[\\dA-Z]{20}",
        LI: "\\d{5}[\\dA-Z]{12}",
        LT: "\\d{16}",
        LU: "\\d{3}[\\dA-Z]{13}",
        MK: "\\d{3}[\\dA-Z]{10}\\d{2}",
        MT: "[A-Z]{4}\\d{5}[\\dA-Z]{18}",
        MR: "\\d{23}",
        MU: "[A-Z]{4}\\d{19}[A-Z]{3}",
        MC: "\\d{10}[\\dA-Z]{11}\\d{2}",
        MD: "[\\dA-Z]{2}\\d{18}",
        ME: "\\d{18}",
        NL: "[A-Z]{4}\\d{10}",
        NO: "\\d{11}",
        PK: "[\\dA-Z]{4}\\d{16}",
        PS: "[\\dA-Z]{4}\\d{21}",
        PL: "\\d{24}",
        PT: "\\d{21}",
        RO: "[A-Z]{4}[\\dA-Z]{16}",
        SM: "[A-Z]\\d{10}[\\dA-Z]{12}",
        SA: "\\d{2}[\\dA-Z]{18}",
        RS: "\\d{18}",
        SK: "\\d{20}",
        SI: "\\d{15}",
        ES: "\\d{20}",
        SE: "\\d{20}",
        CH: "\\d{5}[\\dA-Z]{12}",
        TN: "\\d{20}",
        TR: "\\d{5}[\\dA-Z]{17}",
        AE: "\\d{3}\\d{16}",
        GB: "[A-Z]{4}\\d{14}",
        VG: "[\\dA-Z]{4}\\d{16}"
    }
      , s = i[r];
    if (s !== void 0) {
        var o = RegExp("^[A-Z]{2}\\d{2}" + s + "$", "");
        if (!o.test(n))
            return !1
    }
    for (var u, a = n.substring(4, n.length) + n.substring(0, 4), f = "", l = !0, c = 0; a.length > c; c++)
        u = a.charAt(c),
        "0" !== u && (l = !1),
        l || (f += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(u));
    for (var h = "", p = "", d = 0; f.length > d; d++) {
        var v = f.charAt(d);
        p = "" + h + v,
        h = p % 97
    }
    return 1 === h
}, "Please specify a valid IBAN"),
jQuery.validator.addMethod("dateNL", function(e, t) {
    return this.optional(t) || /^(0?[1-9]|[12]\d|3[01])[\.\/\-](0?[1-9]|1[012])[\.\/\-]([12]\d)?(\d\d)$/.test(e)
}, "Please enter a correct date"),
jQuery.validator.addMethod("phoneNL", function(e, t) {
    return this.optional(t) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test(e)
}, "Please specify a valid phone number."),
jQuery.validator.addMethod("mobileNL", function(e, t) {
    return this.optional(t) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)6((\s|\s?\-\s?)?[0-9]){8}$/.test(e)
}, "Please specify a valid mobile number"),
jQuery.validator.addMethod("postalcodeNL", function(e, t) {
    return this.optional(t) || /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(e)
}, "Please specify a valid postal code"),
jQuery.validator.addMethod("bankaccountNL", function(e, t) {
    if (this.optional(t))
        return !0;
    if (!/^[0-9]{9}|([0-9]{2} ){3}[0-9]{3}$/.test(e))
        return !1;
    for (var n = e.replace(/ /g, ""), r = 0, i = n.length, s = 0; i > s; s++) {
        var o = i - s
          , u = n.substring(s, s + 1);
        r += o * u
    }
    return 0 === r % 11
}, "Please specify a valid bank account number"),
jQuery.validator.addMethod("giroaccountNL", function(e, t) {
    return this.optional(t) || /^[0-9]{1,7}$/.test(e)
}, "Please specify a valid giro account number"),
jQuery.validator.addMethod("bankorgiroaccountNL", function(e, t) {
    return this.optional(t) || $.validator.methods.bankaccountNL.call(this, e, t) || $.validator.methods.giroaccountNL.call(this, e, t)
}, "Please specify a valid bank or giro account number"),
jQuery.validator.addMethod("time", function(e, t) {
    return this.optional(t) || /^([01]\d|2[0-3])(:[0-5]\d){1,2}$/.test(e)
}, "Please enter a valid time, between 00:00 and 23:59"),
jQuery.validator.addMethod("time12h", function(e, t) {
    return this.optional(t) || /^((0?[1-9]|1[012])(:[0-5]\d){1,2}(\ ?[AP]M))$/i.test(e)
}, "Please enter a valid time in 12-hour am/pm format"),
jQuery.validator.addMethod("phoneUS", function(e, t) {
    return e = e.replace(/\s+/g, ""),
    this.optional(t) || e.length > 9 && e.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/)
}, "Please specify a valid phone number"),
jQuery.validator.addMethod("phoneUK", function(e, t) {
    return e = e.replace(/\(|\)|\s+|-/g, ""),
    this.optional(t) || e.length > 9 && e.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/)
}, "Please specify a valid phone number"),
jQuery.validator.addMethod("mobileUK", function(e, t) {
    return e = e.replace(/\(|\)|\s+|-/g, ""),
    this.optional(t) || e.length > 9 && e.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[45789]\d{2}|624)\s?\d{3}\s?\d{3})$/)
}, "Please specify a valid mobile number"),
jQuery.validator.addMethod("phonesUK", function(e, t) {
    return e = e.replace(/\(|\)|\s+|-/g, ""),
    this.optional(t) || e.length > 9 && e.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[45789]\d{8}|624\d{6})))$/)
}, "Please specify a valid uk phone number"),
jQuery.validator.addMethod("postcodeUK", function(e, t) {
    return this.optional(t) || /^((([A-PR-UWYZ][0-9])|([A-PR-UWYZ][0-9][0-9])|([A-PR-UWYZ][A-HK-Y][0-9])|([A-PR-UWYZ][A-HK-Y][0-9][0-9])|([A-PR-UWYZ][0-9][A-HJKSTUW])|([A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]))\s?([0-9][ABD-HJLNP-UW-Z]{2})|(GIR)\s?(0AA))$/i.test(e)
}, "Please specify a valid UK postcode"),
jQuery.validator.addMethod("strippedminlength", function(e, t, n) {
    return jQuery(e).text().length >= n
}, jQuery.validator.format("Please enter at least {0} characters")),
jQuery.validator.addMethod("email2", function(e, t) {
    return this.optional(t) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(e)
}, jQuery.validator.messages.email),
jQuery.validator.addMethod("url2", function(e, t) {
    return this.optional(t) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(e)
}, jQuery.validator.messages.url),
jQuery.validator.addMethod("creditcardtypes", function(e, t, n) {
    if (/[^0-9\-]+/.test(e))
        return !1;
    e = e.replace(/\D/g, "");
    var r = 0;
    return n.mastercard && (r |= 1),
    n.visa && (r |= 2),
    n.amex && (r |= 4),
    n.dinersclub && (r |= 8),
    n.enroute && (r |= 16),
    n.discover && (r |= 32),
    n.jcb && (r |= 64),
    n.unknown && (r |= 128),
    n.all && (r = 255),
    1 & r && /^(5[12345])/.test(e) ? 16 === e.length : 2 & r && /^(4)/.test(e) ? 16 === e.length : 4 & r && /^(3[47])/.test(e) ? 15 === e.length : 8 & r && /^(3(0[012345]|[68]))/.test(e) ? 14 === e.length : 16 & r && /^(2(014|149))/.test(e) ? 15 === e.length : 32 & r && /^(6011)/.test(e) ? 16 === e.length : 64 & r && /^(3)/.test(e) ? 16 === e.length : 64 & r && /^(2131|1800)/.test(e) ? 15 === e.length : 128 & r ? !0 : !1
}, "Please enter a valid credit card number."),
jQuery.validator.addMethod("ipv4", function(e, t) {
    return this.optional(t) || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(e)
}, "Please enter a valid IP v4 address."),
jQuery.validator.addMethod("ipv6", function(e, t) {
    return this.optional(t) || /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(e)
}, "Please enter a valid IP v6 address."),
jQuery.validator.addMethod("pattern", function(e, t, n) {
    return this.optional(t) ? !0 : ("string" == typeof n && (n = RegExp("^(?:" + n + ")$")),
    n.test(e))
}, "Invalid format."),
jQuery.validator.addMethod("require_from_group", function(e, t, n) {
    var r = this
      , i = n[1]
      , s = $(i, t.form).filter(function() {
        return r.elementValue(this)
    }).length >= n[0];
    if (!$(t).data("being_validated")) {
        var o = $(i, t.form);
        o.data("being_validated", !0),
        o.valid(),
        o.data("being_validated", !1)
    }
    return s
}, jQuery.format("Please fill at least {0} of these fields.")),
jQuery.validator.addMethod("skip_or_fill_minimum", function(e, t, n) {
    var r = this
      , i = n[0]
      , s = n[1]
      , o = $(s, t.form).filter(function() {
        return r.elementValue(this)
    }).length
      , u = o >= i || 0 === o;
    if (!$(t).data("being_validated")) {
        var a = $(s, t.form);
        a.data("being_validated", !0),
        a.valid(),
        a.data("being_validated", !1)
    }
    return u
}, jQuery.format("Please either skip these fields or fill at least {0} of them.")),
jQuery.validator.addMethod("accept", function(e, t, n) {
    var r, i, s = "string" == typeof n ? n.replace(/\s/g, "").replace(/,/g, "|") : "image/*", o = this.optional(t);
    if (o)
        return o;
    if ("file" === $(t).attr("type") && (s = s.replace(/\*/g, ".*"),
    t.files && t.files.length))
        for (r = 0; t.files.length > r; r++)
            if (i = t.files[r],
            !i.type.match(RegExp(".?(" + s + ")$", "i")))
                return !1;
    return !0
}, jQuery.format("Please enter a value with a valid mimetype.")),
jQuery.validator.addMethod("extension", function(e, t, n) {
    return n = "string" == typeof n ? n.replace(/,/g, "|") : "png|jpe?g|gif",
    this.optional(t) || e.match(RegExp(".(" + n + ")$", "i"))
}, jQuery.format("Please enter a value with a valid extension.")),
function(e) {
    typeof define == "function" && define.amd ? define(["jquery"], e) : typeof exports == "object" ? e(require("jquery")) : e(jQuery)
}(function(e) {
    var t = navigator.userAgent, n = /iphone/i.test(t), r = /chrome/i.test(t), i = /android/i.test(t), s;
    e.mask = {
        definitions: {
            9: "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    },
    e.fn.extend({
        caret: function(e, t) {
            var n;
            if (this.length === 0 || this.is(":hidden"))
                return;
            return typeof e == "number" ? (t = typeof t == "number" ? t : e,
            this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(e, t) : this.createTextRange && (n = this.createTextRange(),
                n.collapse(!0),
                n.moveEnd("character", t),
                n.moveStart("character", e),
                n.select())
            })) : (this[0].setSelectionRange ? (e = this[0].selectionStart,
            t = this[0].selectionEnd) : document.selection && document.selection.createRange && (n = document.selection.createRange(),
            e = 0 - n.duplicate().moveStart("character", -1e5),
            t = e + n.text.length),
            {
                begin: e,
                end: t
            })
        },
        unmask: function() {
            return this.trigger("unmask")
        },
        mask: function(t, o) {
            var u, a, f, l, c, h, p, d;
            if (!t && this.length > 0) {
                u = e(this[0]);
                var v = u.data(e.mask.dataName);
                return v ? v() : undefined
            }
            return o = e.extend({
                autoclear: e.mask.autoclear,
                placeholder: e.mask.placeholder,
                completed: null
            }, o),
            a = e.mask.definitions,
            f = [],
            l = p = t.length,
            c = null ,
            e.each(t.split(""), function(e, t) {
                t == "?" ? (p--,
                l = e) : a[t] ? (f.push(new RegExp(a[t])),
                c === null && (c = f.length - 1),
                e < l && (h = f.length - 1)) : f.push(null )
            }),
            this.trigger("unmask").each(function() {
                function y() {
                    if (!o.completed)
                        return;
                    for (var e = c; e <= h; e++)
                        if (f[e] && v[e] === b(e))
                            return;
                    o.completed.call(u)
                }
                function b(e) {
                    return e < o.placeholder.length ? o.placeholder.charAt(e) : o.placeholder.charAt(0)
                }
                function w(e) {
                    while (++e < p && !f[e])
                        ;
                    return e
                }
                function E(e) {
                    while (--e >= 0 && !f[e])
                        ;
                    return e
                }
                function S(e, t) {
                    var n, r;
                    if (e < 0)
                        return;
                    for (n = e,
                    r = w(t); n < p; n++)
                        if (f[n]) {
                            if (!(r < p && f[n].test(v[r])))
                                break;
                            v[n] = v[r],
                            v[r] = b(r),
                            r = w(r)
                        }
                    A(),
                    u.caret(Math.max(c, e))
                }
                function x(e) {
                    var t, n, r, i;
                    for (t = e,
                    n = b(e); t < p; t++)
                        if (f[t]) {
                            r = w(t),
                            i = v[t],
                            v[t] = n;
                            if (!(r < p && f[r].test(i)))
                                break;
                            n = i
                        }
                }
                function T(e) {
                    var t = u.val()
                      , n = u.caret();
                    if (t.length < d.length) {
                        O(!0);
                        while (n.begin > 0 && !f[n.begin - 1])
                            n.begin--;
                        if (n.begin === 0)
                            while (n.begin < c && !f[n.begin])
                                n.begin++;
                        u.caret(n.begin, n.begin)
                    } else {
                        var r = O(!0);
                        while (n.begin < p && !f[n.begin])
                            n.begin++;
                        u.caret(n.begin, n.begin)
                    }
                    y()
                }
                function N(e) {
                    O(),
                    u.val() != g && u.change()
                }
                function C(e) {
                    if (u.prop("readonly"))
                        return;
                    var t = e.which || e.keyCode, r, i, s;
                    d = u.val(),
                    t === 8 || t === 46 || n && t === 127 ? (r = u.caret(),
                    i = r.begin,
                    s = r.end,
                    s - i === 0 && (i = t !== 46 ? E(i) : s = w(i - 1),
                    s = t === 46 ? w(s) : s),
                    L(i, s),
                    S(i, s - 1),
                    e.preventDefault()) : t === 13 ? N.call(this, e) : t === 27 && (u.val(g),
                    u.caret(0, O()),
                    e.preventDefault())
                }
                function k(t) {
                    if (u.prop("readonly"))
                        return;
                    var n = t.which || t.keyCode, r = u.caret(), s, o, a;
                    if (t.ctrlKey || t.altKey || t.metaKey || n < 32)
                        return;
                    if (n && n !== 13) {
                        r.end - r.begin !== 0 && (L(r.begin, r.end),
                        S(r.begin, r.end - 1)),
                        s = w(r.begin - 1);
                        if (s < p) {
                            o = String.fromCharCode(n);
                            if (f[s].test(o)) {
                                x(s),
                                v[s] = o,
                                A(),
                                a = w(s);
                                if (i) {
                                    var l = function() {
                                        e.proxy(e.fn.caret, u, a)()
                                    };
                                    setTimeout(l, 0)
                                } else
                                    u.caret(a);
                                r.begin <= h && y()
                            }
                        }
                        t.preventDefault()
                    }
                }
                function L(e, t) {
                    var n;
                    for (n = e; n < t && n < p; n++)
                        f[n] && (v[n] = b(n))
                }
                function A() {
                    u.val(v.join(""))
                }
                function O(e) {
                    var t = u.val(), n = -1, r, i, s;
                    for (r = 0,
                    s = 0; r < p; r++)
                        if (f[r]) {
                            v[r] = b(r);
                            while (s++ < t.length) {
                                i = t.charAt(s - 1);
                                if (f[r].test(i)) {
                                    v[r] = i,
                                    n = r;
                                    break
                                }
                            }
                            if (s > t.length) {
                                L(r + 1, p);
                                break
                            }
                        } else
                            v[r] === t.charAt(s) && s++,
                            r < l && (n = r);
                    return e ? A() : n + 1 < l ? o.autoclear || v.join("") === m ? (u.val() && u.val(""),
                    L(0, p)) : A() : (A(),
                    u.val(u.val().substring(0, n + 1))),
                    l ? r : c
                }
                var u = e(this)
                  , v = e.map(t.split(""), function(e, t) {
                    if (e != "?")
                        return a[e] ? b(t) : e
                })
                  , m = v.join("")
                  , g = u.val();
                u.data(e.mask.dataName, function() {
                    return e.map(v, function(e, t) {
                        return f[t] && e != b(t) ? e : null
                    }).join("")
                }),
                u.one("unmask", function() {
                    u.off(".mask").removeData(e.mask.dataName)
                }).on("focus.mask", function() {
                    if (u.prop("readonly"))
                        return;
                    clearTimeout(s);
                    var e;
                    g = u.val(),
                    e = O(),
                    s = setTimeout(function() {
                        if (u.get(0) !== document.activeElement)
                            return;
                        A(),
                        e == t.replace("?", "").length ? u.caret(0, e) : u.caret(e)
                    }, 10)
                }).on("blur.mask", N).on("keydown.mask", C).on("keypress.mask", k).on("input.mask paste.mask", function() {
                    if (u.prop("readonly"))
                        return;
                    setTimeout(function() {
                        var e = O(!0);
                        u.caret(e),
                        y()
                    }, 0)
                }),
                r && i && u.off("input.mask").on("input.mask", T),
                O()
            })
        }
    })
}
