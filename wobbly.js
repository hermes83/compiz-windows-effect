/*
 * Compiz-windows-effect for GNOME Shell
 *
 * Copyright (C) 2020
 *     Mauro Pepe <https://github.com/hermes83/compiz-windows-effect>
 *
 * This file is part of the gnome-shell extension Compiz-windows-effect.
 *
 * gnome-shell extension Compiz-windows-effect is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * gnome-shell extension Compiz-windows-effect is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gnome-shell extension Compiz-windows-effect.  If not, see
 * <http://www.gnu.org/licenses/>.
 */
var document = {
    currentScript: {
        src: ''
    }
};

var Module = (function() {
    var w = w || {};
    w.scope = {};
    w.arrayIteratorImpl = function(c) {
        var e = 0;
        return function() {
            return e < c.length ? {
                done: !1,
                value: c[e++]
            } : {
                done: !0
            }
        }
    };
    w.arrayIterator = function(c) {
        return {
            next: w.arrayIteratorImpl(c)
        }
    };
    w.makeIterator = function(c) {
        var e = "undefined" != typeof Symbol && Symbol.iterator && c[Symbol.iterator];
        return e ? e.call(c) : w.arrayIterator(c)
    };
    w.getGlobal = function(c) {
        c = ["object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, c];
        for (var e = 0; e < c.length; ++e) {
            var k = c[e];
            if (k && k.Math == Math) return k
        }
        throw Error("Cannot find global object");
    };
    w.global = w.getGlobal(this);
    w.ASSUME_ES5 = !1;
    w.ASSUME_NO_NATIVE_MAP = !1;
    w.ASSUME_NO_NATIVE_SET = !1;
    w.SIMPLE_FROUND_POLYFILL = !1;
    w.defineProperty = w.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(c, e, k) {
        c != Array.prototype && c != Object.prototype && (c[e] = k.value)
    };
    w.polyfill = function(c, e) {
        if (e) {
            var k = w.global;
            c = c.split(".");
            for (var p = 0; p < c.length - 1; p++) {
                var l = c[p];
                l in k || (k[l] = {});
                k = k[l]
            }
            c = c[c.length - 1];
            p = k[c];
            e = e(p);
            e != p && null != e && w.defineProperty(k, c, {
                configurable: !0,
                writable: !0,
                value: e
            })
        }
    };
    w.FORCE_POLYFILL_PROMISE = !1;
    w.polyfill("Promise", function(c) {
        function e(c) {
            this.state_ = 0;
            this.result_ = void 0;
            this.onSettledCallbacks_ = [];
            var e = this.createResolveAndReject_();
            try {
                c(e.resolve, e.reject)
            } catch (B) {
                e.reject(B)
            }
        }

        function k() {
            this.batch_ = null
        }

        function p(c) {
            return c instanceof e ? c : new e(function(e) {
                e(c)
            })
        }
        if (c && !w.FORCE_POLYFILL_PROMISE) return c;
        k.prototype.asyncExecute = function(c) {
            if (null == this.batch_) {
                this.batch_ = [];
                var e = this;
                this.asyncExecuteFunction(function() {
                    e.executeBatch_()
                })
            }
            this.batch_.push(c)
        };
        var l = w.global.setTimeout;
        k.prototype.asyncExecuteFunction = function(c) {
            l(c, 0)
        };
        k.prototype.executeBatch_ = function() {
            for (; this.batch_ && this.batch_.length;) {
                var c = this.batch_;
                this.batch_ = [];
                for (var e = 0; e < c.length; ++e) {
                    var k = c[e];
                    c[e] = null;
                    try {
                        k()
                    } catch (z) {
                        this.asyncThrow_(z)
                    }
                }
            }
            this.batch_ = null
        };
        k.prototype.asyncThrow_ = function(c) {
            this.asyncExecuteFunction(function() {
                throw c;
            })
        };
        e.prototype.createResolveAndReject_ = function() {
            function c(c) {
                return function(p) {
                    k || (k = !0, c.call(e, p))
                }
            }
            var e = this,
                k = !1;
            return {
                resolve: c(this.resolveTo_),
                reject: c(this.reject_)
            }
        };
        e.prototype.resolveTo_ = function(c) {
            if (c === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
            else if (c instanceof e) this.settleSameAsPromise_(c);
            else {
                a: switch (typeof c) {
                    case "object":
                        var k = null != c;
                        break a;
                    case "function":
                        k = !0;
                        break a;
                    default:
                        k = !1
                }
                k ? this.resolveToNonPromiseObj_(c) : this.fulfill_(c)
            }
        };
        e.prototype.resolveToNonPromiseObj_ = function(c) {
            var e = void 0;
            try {
                e = c.then
            } catch (B) {
                this.reject_(B);
                return
            }
            "function" == typeof e ? this.settleSameAsThenable_(e,
                c) : this.fulfill_(c)
        };
        e.prototype.reject_ = function(c) {
            this.settle_(2, c)
        };
        e.prototype.fulfill_ = function(c) {
            this.settle_(1, c)
        };
        e.prototype.settle_ = function(c, e) {
            if (0 != this.state_) throw Error("Cannot settle(" + c + ", " + e + "): Promise already settled in state" + this.state_);
            this.state_ = c;
            this.result_ = e;
            this.executeOnSettledCallbacks_()
        };
        e.prototype.executeOnSettledCallbacks_ = function() {
            if (null != this.onSettledCallbacks_) {
                for (var c = 0; c < this.onSettledCallbacks_.length; ++c) q.asyncExecute(this.onSettledCallbacks_[c]);
                this.onSettledCallbacks_ = null
            }
        };
        var q = new k;
        e.prototype.settleSameAsPromise_ = function(c) {
            var e = this.createResolveAndReject_();
            c.callWhenSettled_(e.resolve, e.reject)
        };
        e.prototype.settleSameAsThenable_ = function(c, e) {
            var k = this.createResolveAndReject_();
            try {
                c.call(e, k.resolve, k.reject)
            } catch (z) {
                k.reject(z)
            }
        };
        e.prototype.then = function(c, k) {
            function p(c, e) {
                return "function" == typeof c ? function(e) {
                    try {
                        l(c(e))
                    } catch (Yb) {
                        q(Yb)
                    }
                } : e
            }
            var l, q, r = new e(function(c, e) {
                l = c;
                q = e
            });
            this.callWhenSettled_(p(c, l), p(k, q));
            return r
        };
        e.prototype.catch = function(c) {
            return this.then(void 0, c)
        };
        e.prototype.callWhenSettled_ = function(c, e) {
            function k() {
                switch (p.state_) {
                    case 1:
                        c(p.result_);
                        break;
                    case 2:
                        e(p.result_);
                        break;
                    default:
                        throw Error("Unexpected state: " + p.state_);
                }
            }
            var p = this;
            null == this.onSettledCallbacks_ ? q.asyncExecute(k) : this.onSettledCallbacks_.push(k)
        };
        e.resolve = p;
        e.reject = function(c) {
            return new e(function(e, k) {
                k(c)
            })
        };
        e.race = function(c) {
            return new e(function(e, k) {
                for (var l = w.makeIterator(c), q = l.next(); !q.done; q =
                    l.next()) p(q.value).callWhenSettled_(e, k)
            })
        };
        e.all = function(c) {
            var k = w.makeIterator(c),
                l = k.next();
            return l.done ? p([]) : new e(function(c, e) {
                function q(e) {
                    return function(k) {
                        y[e] = k;
                        z--;
                        0 == z && c(y)
                    }
                }
                var y = [],
                    z = 0;
                do y.push(void 0), z++, p(l.value).callWhenSettled_(q(y.length - 1), e), l = k.next(); while (!l.done)
            })
        };
        return e
    }, "es6", "es3");
    w.SYMBOL_PREFIX = "jscomp_symbol_";
    w.initSymbol = function() {
        w.initSymbol = function() {};
        w.global.Symbol || (w.global.Symbol = w.Symbol)
    };
    w.SymbolClass = function(c, e) {
        this.$jscomp$symbol$id_ = c;
        w.defineProperty(this, "description", {
            configurable: !0,
            writable: !0,
            value: e
        })
    };
    w.SymbolClass.prototype.toString = function() {
        return this.$jscomp$symbol$id_
    };
    w.Symbol = function() {
        function c(k) {
            if (this instanceof c) throw new TypeError("Symbol is not a constructor");
            return new w.SymbolClass(w.SYMBOL_PREFIX + (k || "") + "_" + e++, k)
        }
        var e = 0;
        return c
    }();
    w.initSymbolIterator = function() {
        w.initSymbol();
        var c = w.global.Symbol.iterator;
        c || (c = w.global.Symbol.iterator = w.global.Symbol("Symbol.iterator"));
        "function" != typeof Array.prototype[c] && w.defineProperty(Array.prototype, c, {
            configurable: !0,
            writable: !0,
            value: function() {
                return w.iteratorPrototype(w.arrayIteratorImpl(this))
            }
        });
        w.initSymbolIterator = function() {}
    };
    w.initSymbolAsyncIterator = function() {
        w.initSymbol();
        var c = w.global.Symbol.asyncIterator;
        c || (c = w.global.Symbol.asyncIterator = w.global.Symbol("Symbol.asyncIterator"));
        w.initSymbolAsyncIterator = function() {}
    };
    w.iteratorPrototype = function(c) {
        w.initSymbolIterator();
        c = {
            next: c
        };
        c[w.global.Symbol.iterator] = function() {
            return this
        };
        return c
    };
    w.iteratorFromArray = function(c, e) {
        w.initSymbolIterator();
        c instanceof String && (c += "");
        var k = 0,
            p = {
                next: function() {
                    if (k < c.length) {
                        var l = k++;
                        return {
                            value: e(l, c[l]),
                            done: !1
                        }
                    }
                    p.next = function() {
                        return {
                            done: !0,
                            value: void 0
                        }
                    };
                    return p.next()
                }
            };
        p[Symbol.iterator] = function() {
            return p
        };
        return p
    };
    w.polyfill("Array.prototype.keys", function(c) {
        return c ? c : function() {
            return w.iteratorFromArray(this, function(c) {
                return c
            })
        }
    }, "es6", "es3");
    w.polyfill("Array.prototype.copyWithin", function(c) {
        function e(c) {
            c = Number(c);
            return Infinity === c || -Infinity === c ? c : c | 0
        }
        return c ? c : function(c, p, l) {
            var k = this.length;
            c = e(c);
            p = e(p);
            l = void 0 === l ? k : e(l);
            c = 0 > c ? Math.max(k + c, 0) : Math.min(c, k);
            p = 0 > p ? Math.max(k + p, 0) : Math.min(p, k);
            l = 0 > l ? Math.max(k + l, 0) : Math.min(l, k);
            if (c < p)
                for (; p < l;) p in this ? this[c++] = this[p++] : (delete this[c++], p++);
            else
                for (l = Math.min(l, k + p - c), c += l - p; l > p;) --l in this ? this[--c] = this[l] : delete this[--c];
            return this
        }
    }, "es6", "es3");
    var I = I || (I = "undefined" !== typeof Module ? Module : {});
    var ma = {},
        ra;
    for (ra in I) I.hasOwnProperty(ra) && (ma[ra] = I[ra]);
    var sa = "";
    document.currentScript && (sa = document.currentScript.src);
    sa = 0 !== sa.indexOf("blob:") ? sa.substr(0, sa.lastIndexOf("/") + 1) : "";
    var ua = log || console.log.bind(console),
        ya = log || console.warn.bind(console);
    for (ra in ma) ma.hasOwnProperty(ra) && (I[ra] = ma[ra]);
    ma = null;
    var Ca = 0,
        Da;
    I.wasmBinary && (Da = I.wasmBinary);

    function Ea() {
        this.buffer = new ArrayBuffer(Fa / 65536 * 65536);
        this.grow = function(c) {
            return Ga(c)
        }
    }

    function Ma() {
        this.exports = function(c, e, k) {
            function p(c, e, k) {
                for (var p, l = 0, q = e, y = k.length, z = e + (3 * y >> 2) - ("=" == k[y - 2]) - ("=" == k[y - 1]); l < y; l += 4) e = r[k.charCodeAt(l + 1)], p = r[k.charCodeAt(l + 2)], c[q++] = r[k.charCodeAt(l)] << 2 | e >> 4, q < z && (c[q++] = e << 4 | p >> 2), q < z && (c[q++] = p << 6 | r[k.charCodeAt(l + 3)])
            }
            var l = new ArrayBuffer(8),
                q = new Int32Array(l);
            new Float32Array(l);
            var F = new Float64Array(l);
            l = new Uint8Array(e.buffer);
            for (var r = new Uint8Array(123), B = 25; 0 <= B; --B) r[48 + B] = 52 + B, r[65 + B] = B, r[97 + B] = 26 + B;
            r[43] = 62;
            r[47] = 63;
            p(l,
                1024, "d2lkdGggPiAwLjBmAC4vd29iYmx5L3dvYmJseS5jcHAAUmVzaXplTW9kZWwAaGVpZ2h0ID4gMC4wZgBzcHJpbmdzLnNpemUgKCkgPT0gblNwcmluZ3MAR2VuZXJhdGVCYXNlU3ByaW5nTWVzaABhbGxvY2F0b3I8VD46OmFsbG9jYXRlKHNpemVfdCBuKSAnbicgZXhjZWVkcyBtYXhpbXVtIHN1cHBvcnRlZCBzaXplAGFycmF5LnNpemUgKCkgPT0gd29iYmx5Ojpjb25maWc6OkFycmF5U2l6ZQAuL3dvYmJseS93b2JibHlfaW50ZXJuYWwuaABDYWxjdWxhdGVQb3NpdGlvbkFycmF5AHBvaW50cy5zaXplICgpID09IHdvYmJseTo6Y29uZmlnOjpBcnJheVNpemUAQ2xvc2VzdEluZGV4VG9Qb3NpdGlvbgBuZWFyZXN0SW5kZXg=");
            p(l, 1384, "BAAAAAUAAAAG");
            p(l, 1404, "BwAAAAgAAAAJ");
            p(l, 1424, "CgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEA==");
            p(l, 1460, "CgAAABEAAAAJAAAACQAAAAkAAAAJAAAACQ==");
            p(l, 1496, "EgAAABMAAAAUAAAAFQAAABYAAAAXAAAAGA==");
            p(l, 1532, "EgAAABkAAAAJAAAACQAAAAkAAAAJAAAACQAAAG1hc3MgPiAwLjBmAEV1bGVySW50ZWdyYXRl");
            p(l, 1596, "GgAAABsAAAAcAAAAHQAAAB4AAAAfAAAAIA==");
            p(l, 1632, "GgAAACEAAAAJAAAACQAAAAkAAAAJAAAACQ==");
            p(l, 1668, "IgAAACMAAAAkAAAAJQAAACYAAAAnAAAAKA==");
            p(l, 1704, "IgAAACkAAAAJAAAACQAAAAkAAAAJAAAACQAAAFNldFNwcmluZ0NvbnN0YW50AFNldEZyaWN0aW9uAFNldE1heGltdW1SYW5nZQBXb2JibHlQb2ludAB4AHkAVmVjdG9yUG9pbnQAV29iYmx5QW5jaG9yAE1vdmVCeQBXb2JibHlNb2RlbABNb3ZlTW9kZWxCeQBTdGVwAERlZm9ybVRleGNvb3JkcwBEZWZvcm1UZXhjb29yZHNBcnJheQBHcmFiQW5jaG9yAFJlc2l6ZU1vZGVsAACtEQAArhEAAHZpZABpAHZpAGRpaQB2aWlkAHB1c2hfYmFjawByZXNpemUAc2l6ZQBnZXQAc2V0AGlpAHYAAAAAsREAAK0RAACxEQAArxEAAHZpaWk=");
            p(l, 2016, "rREAALERAACzEQAArxEAAHZpaWlpAAAAsxEAALIRAABpaWkAtBEAALARAACzEQAAaWlpaQ==");
            p(l, 2080, "tREAALARAACzEQAArxEAAGlpaWlpAAAArREAALcRAACvEQ==");
            p(l, 2128, "uhEAAK8RAAC8EQAAvBEAAGlpaWZmAAAArREAALoRAACvEQAAtREAALoRAAC9EQAArxEAALsRAACvEQAAAAAAALARAAC7EQAAvhEAAL4RAAC2EQAAuhEAAK8RAAAAAAAArREAALoRAACuEQAArhEAAHZpaWRkACVwAHZvaWQAYm9vbABjaGFyAHNpZ25lZCBjaGFyAHVuc2lnbmVkIGNoYXIAc2hvcnQAdW5zaWduZWQgc2hvcnQAaW50AHVuc2lnbmVkIGludABsb25nAHVuc2lnbmVkIGxvbmcAZmxvYXQAZG91YmxlAHN0ZDo6c3RyaW5nAHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AHN0ZDo6d3N0cmluZwBzdGQ6OnUxNnN0cmluZwBzdGQ6OnUzMnN0cmluZwBlbXNjcmlwdGVuOjp2YWwAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPg==");
            p(l, 3076, "VQ==");
            p(l, 3115, "//////8=");
            p(l, 3184, "LSsgICAwWDB4AChudWxsKQ==");
            p(l, 3216, "EQAKABEREQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAARAA8KERERAwoHAAEACQsLAAAJBgsAAAsABhEAAAARERE=");
            p(l, 3297, "CwAAAAAAAAAAEQAKChEREQAKAAACAAkLAAAACQALAAAL");
            p(l, 3355, "DA==");
            p(l, 3367, "DAAAAAAMAAAAAAkMAAAAAAAMAAAM");
            p(l, 3413, "Dg==");
            p(l, 3425, "DQAAAAQNAAAAAAkOAAAAAAAOAAAO");
            p(l, 3471, "EA==");
            p(l, 3483, "DwAAAAAPAAAAAAkQAAAAAAAQAAAQAAASAAAAEhIS");
            p(l, 3538, "EgAAABISEgAAAAAAAAk=");
            p(l, 3587, "Cw==");
            p(l, 3599, "CgAAAAAKAAAAAAkLAAAAAAALAAAL");
            p(l, 3645, "DA==");
            p(l, 3657, "DAAAAAAMAAAAAAkMAAAAAAAMAAAMAAAwMTIzNDU2Nzg5QUJDREVGLTBYKzBYIDBYLTB4KzB4IDB4AGluZgBJTkYAbmFuAE5BTgAuAHN0ZDo6YmFkX2Z1bmN0aW9uX2NhbGwAAAAAANwOAAADAAAAWAAAAFkAAABOU3QzX18yMTdiYWRfZnVuY3Rpb25fY2FsbEUAVBAAAMAOAABADwAAdmVjdG9yAFB1cmUgdmlydHVhbCBmdW5jdGlvbiBjYWxsZWQhAHN0ZDo6ZXhjZXB0aW9uAAAAAABADwAAWgAAAFsAAABcAAAAU3Q5ZXhjZXB0aW9uAAAAACwQAAAwDwAAAAAAAGwPAAACAAAAXQAAAF4AAABTdDExbG9naWNfZXJyb3IAVBAAAFwPAABADwAAAAAAAKAPAAACAAAAXwAAAF4AAABTdDEybGVuZ3RoX2Vycm9yAAAAAFQQAACMDwAAbA8AAFN0OXR5cGVfaW5mbwAAAAAsEAAArA8AAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAAFQQAADEDwAAvA8AAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAAFQQAAD0DwAA6A8AAAAAAAAYEAAAYAAAAGEAAABiAAAAYwAAAGQAAABlAAAAZgAAAGcAAAAAAAAAnBAAAGAAAABoAAAAYgAAAGMAAABkAAAAaQAAAGoAAABrAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAFQQAAB0EAAAGBA=");
            p(l, 4270, "IEAAAAAAAAAIQAAAAAAAQH9A");
            p(l, 4464, "BBI=");
            return function(c, e, p) {
                function l(b, d) {
                    var h = a[b >> 2];
                    a[b >> 2] = d;
                    if (h && h) t[a[a[h >> 2] + 4 >> 2]](h)
                }

                function r(a) {
                    return a | 0
                }

                function z(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    a[h + 12 >> 2] = Za(d);
                    Ab(b, h + 12 | 0);
                    g = h + 16 | 0;
                    return b
                }

                function B(a) {
                    l(a, 0);
                    return a
                }

                function y(b, d) {
                    a[b >> 2] = a[d >> 2];
                    a[b + 4 >> 2] = a[d + 4 >> 2];
                    return b
                }

                function H(b, d) {
                    var h = a[d + 4 >> 2];
                    a[b >> 2] = a[d >> 2];
                    a[b + 4 >> 2] = h;
                    h = a[d + 12 >> 2];
                    a[b + 8 >> 2] = a[d + 8 >> 2];
                    a[b + 12 >> 2] = h;
                    return b
                }

                function ta(b, d) {
                    a[b >> 2] = d;
                    return b
                }

                function Wc(b,
                    d, h, n, m, f) {
                    var x;
                    g = x = g + -64 | 0;
                    f = H(x + 48 | 0, f);
                    a[(x + 16 | 0) >> 2] = 1;
                    var c = a[x + 20 >> 2];
                    a[x + 8 >> 2] = a[x + 16 >> 2];
                    a[x + 12 >> 2] = c;
                    c = b;
                    var e = b = x + 24 | 0,
                        k;
                    g = k = g - 16 | 0;
                    var p;
                    g = p = g - 16 | 0;
                    a[e + 16 >> 2] = 0;
                    a[e >> 2] = 1460;
                    a[e >> 2] = 1424;
                    Zb(e + 4 | 0, $b(x + 8 | 0), $b(p));
                    a[e + 16 >> 2] = e;
                    g = p + 16 | 0;
                    g = k + 16 | 0;
                    e = f;
                    f = b;
                    y(c, d);
                    y(c + 8 | 0, h);
                    y(c + 16 | 0, n);
                    y(c + 24 | 0, m);
                    H(c + 32 | 0, e);
                    d = c + 48 | 0;
                    (c = a[f + 16 >> 2]) || (Xc(), U());
                    ta(d, t[a[a[c >> 2] + 24 >> 2]](c) | 0);
                    pa(b);
                    g = x - -64 | 0
                }

                function pa(b) {
                    var d = b;
                    b = a[b + 16 >> 2];
                    if ((d | 0) == (b | 0)) t[a[a[b >> 2] + 16 >> 2]](b);
                    else if (b) t[a[a[b >> 2] + 20 >>
                        2]](b)
                }

                function Yc(b) {
                    za(b);
                    Ra(b);
                    za(b);
                    if (a[b >> 2]) {
                        var d = a[b >> 2],
                            h = a[b + 4 >> 2];
                        if ((h | 0) != (d | 0))
                            for (; h = h + -56 | 0, (h | 0) != (d | 0););
                        a[b + 4 >> 2] = d;
                        d = a[b >> 2];
                        za(b);
                        R(d)
                    }
                }

                function pb(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[b >> 2] = 0;
                    a[b + 4 >> 2] = 0;
                    a[d + 12 >> 2] = 0;
                    a[(b + 8 | 0) >> 2] = 0;
                    g = d + 16 | 0;
                    return b
                }

                function J(b, d, h) {
                    a[b + 4 >> 2] = h << 1;
                    a[b >> 2] = d;
                    return b
                }

                function va(a, d, h) {
                    u[a + 8 >> 3] = h;
                    u[a >> 3] = d;
                    return a
                }

                function Zc(b, d, h, n, m, f) {
                    if (V[b + 4 >> 2] < V[(b + 8 | 0) >> 2]) {
                        var x;
                        g = x = g - 16 | 0;
                        a[x >> 2] = b;
                        a[x + 4 >> 2] = a[b + 4 >> 2];
                        a[x + 8 >> 2] = a[b + 4 >> 2] + 56;
                        Wc(a[x + 4 >> 2], d, h,
                            n, m, f);
                        a[x + 4 >> 2] += 56;
                        ac(x);
                        g = x + 16 | 0
                    } else {
                        var c;
                        g = c = g - 32 | 0;
                        x = b + 8 | 0;
                        var e = c + 8 | 0,
                            k = b,
                            p = Ra(b) + 1 | 0,
                            K;
                        g = K = g - 16 | 0;
                        a[K + 12 >> 2] = p;
                        var l;
                        g = l = g - 16 | 0;
                        a[l + 12 >> 2] = 76695844;
                        a[l + 8 >> 2] = 2147483647;
                        p = a[$c(l + 12 | 0, l + 8 | 0) >> 2];
                        g = l + 16 | 0;
                        V[K + 12 >> 2] <= p >>> 0 ? (k = za(k), k >>> 0 < p >>> 1 >>> 0 && (a[K + 8 >> 2] = k << 1, p = a[ad(K + 8 | 0, K + 12 | 0) >> 2]), g = K + 16 | 0, k = p) : (Bb(3816), U(), U(), k = void 0);
                        x = bd(e, k, Ra(b), x);
                        Wc(a[x + 8 >> 2], d, h, n, m, f);
                        a[x + 8 >> 2] += 56;
                        cd(b, x);
                        dd(x);
                        g = c + 32 | 0
                    }
                }

                function Ra(b) {
                    return (a[b + 4 >> 2] - a[b >> 2] | 0) / 56 | 0
                }

                function ed(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    a[b >> 2] = 0;
                    a[b + 4 >> 2] = 0;
                    a[h + 12 >> 2] = 0;
                    a[(b + 8 | 0) >> 2] = 0;
                    g = h + 16 | 0;
                    a[b >> 2] = a[d >> 2];
                    a[b + 4 >> 2] = a[d + 4 >> 2];
                    a[(b + 8 | 0) >> 2] = a[(d + 8 | 0) >> 2];
                    a[(d + 8 | 0) >> 2] = 0;
                    a[d >> 2] = 0;
                    a[d + 4 >> 2] = 0;
                    return b
                }

                function Ha(b, d) {
                    return a[b >> 2] == a[d >> 2] ^ 1
                }

                function na(b) {
                    a[b >> 2] = 0;
                    a[b + 4 >> 2] = 0;
                    a[b + 8 >> 2] = 0;
                    a[b + 12 >> 2] = 0;
                    return b
                }

                function $a(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    var n;
                    g = n = g - 16 | 0;
                    u[n + 8 >> 3] = u[a + 8 >> 3];
                    u[n >> 3] = T(d);
                    ia(a, n);
                    var m;
                    g = m = g - 16 | 0;
                    u[m + 8 >> 3] = u[a >> 3];
                    u[m >> 3] = X(d);
                    qa(a, m);
                    g = m + 16 | 0;
                    g = n + 16 | 0;
                    g = b + 16 | 0
                }

                function fd(b, d, h) {
                    a[b + 4 >> 2] = h;
                    a[b >> 2] = d;
                    return b
                }

                function gd(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 8 >> 2] = 0;
                    a[d + 12 >> 2] = 0;
                    bc(b, d + 8 | 0);
                    g = d + 16 | 0;
                    return b
                }

                function qb(a, d) {
                    va(a, u[d >> 3] / 3, u[d + 8 >> 3] / 3)
                }

                function cc(b, d, h, n, m, f) {
                    a[b + 4 >> 2] = m;
                    a[b >> 2] = n;
                    ta(b + 8 | 0, d);
                    d = b + 16 | 0;
                    g = n = g - 16 | 0;
                    m = d;
                    var x = f,
                        c = 0;
                    g = f = g - 48 | 0;
                    var e = pb(n),
                        k = u[x >> 3],
                        p = u[x + 8 >> 3],
                        K = e;
                    g = x = g - 32 | 0;
                    if (24 > za(K) >>> 0) {
                        var l = K + 8 | 0,
                            t = K;
                        K = bd(x + 8 | 0, 24, Ra(K), l);
                        cd(t, K);
                        dd(K)
                    }
                    for (g = x + 32 | 0;;) {
                        t = c << 2;
                        for (x = 0; K = x + t | 0, 2 >= c >>> 0 && (l = K + 4 | 0, Zc(e, J(f + 40 | 0, m, K), J(f + 32 | 0, m, l), J(f + 24 | 0, h, K), J(f + 16 | 0, h, l), va(f, 0, p))), 2 >= x >>>
                            0 && (l = K + 1 | 0, Zc(e, J(f + 40 | 0, m, K), J(f + 32 | 0, m, l), J(f + 24 | 0, h, K), J(f + 16 | 0, h, l), va(f, k, 0))), x = x + 1 | 0, 4 != (x | 0););
                        c = c + 1 | 0;
                        if (4 == (c | 0)) break
                    }
                    24 != (Ra(e) | 0) && (Cb(1083, 1037, 288, 1111), U());
                    g = f + 48 | 0;
                    h = d + 256 | 0;
                    ed(h, n);
                    pb(h + 12 | 0);
                    Yc(n);
                    d = d + 280 | 0;
                    pb(d);
                    a[d + 12 >> 2] = 0;
                    g = n + 16 | 0;
                    return b
                }

                function hd(a, d, h) {
                    var b = 0,
                        m, f;
                    for (g = m = g - 32 | 0;;) {
                        var x = f = J(m + 24 | 0, d, b),
                            c = a,
                            e;
                        g = e = g - 16 | 0;
                        var k, p = c;
                        g = k = g - 16 | 0;
                        u[k + 8 >> 3] = T(x);
                        u[k >> 3] = u[p + 8 >> 3];
                        Sa(x, k);
                        g = c = g - 16 | 0;
                        u[c + 8 >> 3] = X(x);
                        u[c >> 3] = u[p >> 3];
                        Ta(x, c);
                        g = c + 16 | 0;
                        g = k + 16 | 0;
                        g = e + 16 | 0;
                        fa(f, va(m +
                            8 | 0, u[h >> 3] * +((b & 3) >>> 0), u[h + 8 >> 3] * +(b >>> 2 >>> 0)));
                        b = b + 1 | 0;
                        if (16 == (b | 0)) break
                    }
                    g = m + 32 | 0
                }

                function id(b, d, h) {
                    if (d = d - b | 0) a: if ((h | 0) != (b | 0))
                        if ((b - h | 0) - d >>> 0 <= -(d << 1) >>> 0) oa(h, b, d);
                        else {
                            var n = (h ^ b) & 3;
                            b: {
                                if (h >>> 0 < b >>> 0) {
                                    if (n) break b;
                                    if (h & 3)
                                        for (;;) {
                                            if (!d) break a;
                                            C[h | 0] = G[b | 0];
                                            b = b + 1 | 0;
                                            d = d + -1 | 0;
                                            h = h + 1 | 0;
                                            if (!(h & 3)) break
                                        }
                                } else {
                                    if (!n) {
                                        if (h + d & 3)
                                            for (;;) {
                                                if (!d) break a;
                                                d = d + -1 | 0;
                                                n = d + h | 0;
                                                C[n | 0] = G[b + d | 0];
                                                if (!(n & 3)) break
                                            }
                                        if (!(3 >= d >>> 0))
                                            for (; d = d + -4 | 0, a[d + h >> 2] = a[b + d >> 2], 3 < d >>> 0;);
                                    }
                                    if (!d) break a;
                                    for (; d = d + -1 | 0, C[d + h | 0] = G[b +
                                            d | 0], d;);
                                    break a
                                }
                                if (!(3 >= d >>> 0))
                                    for (; a[h >> 2] = a[b >> 2], b = b + 4 | 0, h = h + 4 | 0, d = d + -4 | 0, 3 < d >>> 0;);
                            }
                            if (d)
                                for (; C[h | 0] = G[b | 0], h = h + 1 | 0, b = b + 1 | 0, d = d + -1 | 0, d;);
                        }
                }

                function jd(a) {
                    C[a + 4 | 0] = 0;
                    C[a | 0] = 0;
                    return a
                }

                function fa(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    var n;
                    g = n = g - 32 | 0;
                    u[n + 16 >> 3] = T(a);
                    u[n + 8 >> 3] = u[d + 8 >> 3];
                    u[n + 24 >> 3] = ab(n + 16 | 0, n + 8 | 0);
                    Sa(a, n + 24 | 0);
                    var m;
                    g = m = g - 32 | 0;
                    u[m + 16 >> 3] = X(a);
                    u[m + 8 >> 3] = u[d >> 3];
                    u[m + 24 >> 3] = ab(m + 16 | 0, m + 8 | 0);
                    Ta(a, m + 24 | 0);
                    g = m + 32 | 0;
                    g = n + 32 | 0;
                    g = b + 16 | 0
                }

                function kd(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    a[h + 12 >> 2] = d;
                    Ab(b, h + 12 | 0);
                    g = h + 16 |
                        0;
                    return b
                }

                function dc(b) {
                    b = b + 16 | 0;
                    var d = b + 280 | 0;
                    ec(d);
                    ec(d);
                    if (a[d >> 2]) {
                        var h = a[d >> 2],
                            n = a[d + 4 >> 2];
                        if ((n | 0) != (h | 0))
                            for (; n = n + -12 | 0, (n | 0) != (h | 0););
                        a[d + 4 >> 2] = h;
                        h = a[d >> 2];
                        ec(d);
                        R(h)
                    }
                    b = b + 256 | 0;
                    d = b + 12 | 0;
                    fc(d);
                    fc(d);
                    if (a[d >> 2]) {
                        h = a[d >> 2];
                        n = a[d + 4 >> 2];
                        if ((n | 0) != (h | 0))
                            for (; n = n + -4 | 0, (n | 0) != (h | 0););
                        a[d + 4 >> 2] = h;
                        h = a[d >> 2];
                        fc(d);
                        R(h)
                    }
                    Yc(b)
                }

                function ld(b) {
                    var d = b + 24 | 0;
                    a[d + 16 >> 2] && Db(d, b);
                    pa(d);
                    pa(b)
                }

                function md(b, d) {
                    d = a[d >> 2];
                    C[b + 4 | 0] = 1;
                    a[b >> 2] = d
                }

                function Db(b, d) {
                    (b = a[b + 16 >> 2]) || (Xc(), U());
                    t[a[a[b >> 2] + 24 >> 2]](b,
                        d)
                }

                function Eb(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    var n;
                    g = n = g - 32 | 0;
                    u[n + 16 >> 3] = T(a);
                    u[n + 8 >> 3] = u[d + 8 >> 3];
                    u[n + 24 >> 3] = u[(n + 16 | 0) >> 3] - u[(n + 8 | 0) >> 3];
                    Sa(a, n + 24 | 0);
                    var m;
                    g = m = g - 32 | 0;
                    u[m + 16 >> 3] = X(a);
                    u[m + 8 >> 3] = u[d >> 3];
                    u[m + 24 >> 3] = u[(m + 16 | 0) >> 3] - u[(m + 8 | 0) >> 3];
                    Ta(a, m + 24 | 0);
                    g = m + 32 | 0;
                    g = n + 32 | 0;
                    g = b + 16 | 0
                }

                function gc(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    var n;
                    g = n = g - 32 | 0;
                    u[n + 16 >> 3] = T(a);
                    u[n + 8 >> 3] = u[d + 8 >> 3];
                    u[n + 24 >> 3] = bb(n + 16 | 0, n + 8 | 0);
                    Sa(a, n + 24 | 0);
                    var m;
                    g = m = g - 32 | 0;
                    u[m + 16 >> 3] = X(a);
                    u[m + 8 >> 3] = u[d >> 3];
                    u[m + 24 >> 3] = bb(m + 16 | 0, m + 8 | 0);
                    Ta(a, m + 24 | 0);
                    g = m + 32 |
                        0;
                    g = n + 32 | 0;
                    g = b + 16 | 0
                }

                function nd(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    var n = a[b + 4 >> 2];
                    a[h + 12 >> 2] = d;
                    a[h + 8 >> 2] = b;
                    if (1 == a[n + 256 >> 2]) {
                        b = h + 8 | 0;
                        var m = 0,
                            f, x, c = 0;
                        g = d = g - 48 | 0;
                        for (f = a[b >> 2];;) {
                            var e = J(d + 40 | 0, n, m),
                                k = a[f >> 2],
                                p = a[k + 4 >> 2];
                            a[d + 32 >> 2] = a[k >> 2];
                            a[d + 36 >> 2] = p;
                            k = J(d + 24 | 0, a[b + 4 >> 2], m);
                            var K = e,
                                l = k;
                            g = p = g - 16 | 0;
                            a[p + 8 >> 2] = 0;
                            a[p + 12 >> 2] = 0;
                            var t = p + 8 | 0;
                            g = x = g - 32 | 0;
                            u[x + 16 >> 3] = T(K);
                            u[x + 8 >> 3] = T(l);
                            u[x + 24 >> 3] = Fb(x + 16 | 0, x + 8 | 0, t);
                            t = l;
                            var v = x + 24 | 0;
                            g = l = g - 16 | 0;
                            u[l + 8 >> 3] = X(K);
                            u[l >> 3] = X(t);
                            K = Fb(l + 8 | 0, l, v);
                            g = l + 16 | 0;
                            g = x + 32 | 0;
                            x = K;
                            g = p + 16 | 0;
                            p =
                                hc(x);
                            u[d + 16 >> 3] = p;
                            p < u[d + 32 >> 3] || (p = T(e), c = T(k), x = u[d + 16 >> 3], K = (X(e) - X(k)) / u[d + 16 >> 3], t = d + 32 | 0, v = d + 16 | 0, g = l = g - 16 | 0, g = l + 16 | 0, l = u[(u[v >> 3] < u[t >> 3] ? v : t) >> 3], p = va(d, K * l, (p - c) / x * l), x = k, K = e, g = c = g - 16 | 0, g = e = g - 16 | 0, u[e + 8 >> 3] = T(x), u[e >> 3] = T(K), Sa(x, e), g = l = g - 16 | 0, u[l + 8 >> 3] = X(x), u[l >> 3] = X(K), Ta(x, l), g = l + 16 | 0, g = e + 16 | 0, g = c + 16 | 0, Eb(k, p), c = 1);
                            m = m + 1 | 0;
                            if (16 == (m | 0)) break
                        }
                        g = d + 48 | 0;
                        b = c
                    } else b = 0;
                    g = h + 16 | 0;
                    return b
                }

                function bc(b, d) {
                    for (var h = 32;;) {
                        var n = a[d + 4 >> 2];
                        a[b >> 2] = a[d >> 2];
                        a[b + 4 >> 2] = n;
                        b = b + 8 | 0;
                        h = h + -1 | 0;
                        if (!h) break
                    }
                }

                function od(b, d, h) {
                    var n, m = 0;
                    g = n = g - 272 | 0;
                    var f = u[h >> 3],
                        x = 1 - f,
                        c = x * x;
                    Ia(n - -64 | 0, x * c);
                    Ia(n + 48 | 0, 3 * f * c);
                    c = x;
                    x = f * f;
                    Ia(n + 32 | 0, 3 * c * x);
                    Ia(n + 16 | 0, f * x);
                    f = u[h + 8 >> 3];
                    h = a[n + 28 >> 2];
                    a[n + 264 >> 2] = a[n + 24 >> 2];
                    a[n + 268 >> 2] = h;
                    h = a[n + 44 >> 2];
                    a[n + 248 >> 2] = a[n + 40 >> 2];
                    a[n + 252 >> 2] = h;
                    h = a[n + 60 >> 2];
                    a[n + 232 >> 2] = a[n + 56 >> 2];
                    a[n + 236 >> 2] = h;
                    h = a[n + 20 >> 2];
                    a[n + 256 >> 2] = a[n + 16 >> 2];
                    a[n + 260 >> 2] = h;
                    h = a[n + 36 >> 2];
                    a[n + 240 >> 2] = a[n + 32 >> 2];
                    a[n + 244 >> 2] = h;
                    h = a[n + 52 >> 2];
                    a[n + 224 >> 2] = a[n + 48 >> 2];
                    a[n + 228 >> 2] = h;
                    h = a[n + 76 >> 2];
                    a[n + 216 >> 2] = a[n + 72 >> 2];
                    a[n + 220 >> 2] =
                        h;
                    h = a[n + 68 >> 2];
                    a[n + 208 >> 2] = a[n + 64 >> 2];
                    a[n + 212 >> 2] = h;
                    x = 1 - f;
                    c = x * x;
                    Ia(n + 128 | 0, x * c);
                    Ia(n + 112 | 0, 3 * f * c);
                    c = x;
                    x = f * f;
                    Ia(n + 96 | 0, 3 * c * x);
                    Ia(n + 80 | 0, f * x);
                    h = a[n + 92 >> 2];
                    a[n + 200 >> 2] = a[n + 88 >> 2];
                    a[n + 204 >> 2] = h;
                    h = a[n + 108 >> 2];
                    a[n + 184 >> 2] = a[n + 104 >> 2];
                    a[n + 188 >> 2] = h;
                    h = a[n + 124 >> 2];
                    a[n + 168 >> 2] = a[n + 120 >> 2];
                    a[n + 172 >> 2] = h;
                    h = a[n + 84 >> 2];
                    a[n + 192 >> 2] = a[n + 80 >> 2];
                    a[n + 196 >> 2] = h;
                    h = a[n + 100 >> 2];
                    a[n + 176 >> 2] = a[n + 96 >> 2];
                    a[n + 180 >> 2] = h;
                    h = a[n + 116 >> 2];
                    a[n + 160 >> 2] = a[n + 112 >> 2];
                    a[n + 164 >> 2] = h;
                    h = a[n + 140 >> 2];
                    a[n + 152 >> 2] = a[n + 136 >> 2];
                    a[n + 156 >> 2] = h;
                    h =
                        a[n + 132 >> 2];
                    a[n + 144 >> 2] = a[n + 128 >> 2];
                    a[n + 148 >> 2] = h;
                    for (x = f = 0;;) {
                        var e = m << 3;
                        h = (n + 208 | 0) + (m << 4) | 0;
                        var k = a[h + 8 >> 2],
                            p = a[h + 12 >> 2],
                            l = a[h >> 2],
                            t = a[h + 4 >> 2];
                        for (h = 0;;) {
                            var Q = (n + 144 | 0) + (h << 4) | 0;
                            c = n;
                            var v = l,
                                q = t,
                                D = k,
                                E = p,
                                A = a[Q >> 2],
                                Y = a[Q + 4 >> 2],
                                C = a[Q + 8 >> 2];
                            Q = a[Q + 12 >> 2];
                            var r, y, z, B = 0,
                                F = 0,
                                G = 0;
                            g = z = g - 96 | 0;
                            var H = q,
                                aa = (Y & 131071) << 15 | A >>> 17,
                                J = r = Q & 65535,
                                L = C,
                                R = C << 15 | Y >>> 17,
                                ea = (E ^ Q) & -2147483648,
                                N = y = E & 65535,
                                M = D,
                                U = y,
                                T = (r & 131071) << 15 | C >>> 17,
                                X = Q >>> 16 & 32767,
                                Z = E >>> 16 & 32767;
                            a: {
                                b: {
                                    if (32765 >= Z + -1 >>> 0) {
                                        var W = 0;
                                        if (32766 > X + -1 >>> 0) break b
                                    }
                                    r =
                                    E & 2147483647;y = D;
                                    if (!D & 2147418112 == (r | 0) ? v | q : !(2147418112 == (r | 0) & 0 > D >>> 0 | 2147418112 > r >>> 0)) {
                                        F = D;
                                        ea = E | 32768;
                                        break a
                                    }
                                    E = Q & 2147483647;D = C;
                                    if (!D & 2147418112 == (E | 0) ? A | Y : !(2147418112 == (E | 0) & 0 > D >>> 0 | 2147418112 > E >>> 0)) {
                                        F = C;
                                        ea = Q | 32768;
                                        v = A;
                                        q = Y;
                                        break a
                                    }
                                    if (!(v | y | r ^ 2147418112 | q)) {
                                        if (!(D | A | E | Y)) {
                                            ea = 2147450880;
                                            q = v = 0;
                                            break a
                                        }
                                        ea |= 2147418112;
                                        q = v = 0;
                                        break a
                                    }
                                    if (!(D | A | E ^ 2147418112 | Y)) {
                                        D = v | y;
                                        E = q | r;
                                        q = v = 0;
                                        if (!(D | E)) {
                                            ea = 2147450880;
                                            break a
                                        }
                                        ea |= 2147418112;
                                        break a
                                    }
                                    if (!(v | y | q | r)) {
                                        q = v = 0;
                                        break a
                                    }
                                    if (!(D | A | E | Y)) {
                                        q = v = 0;
                                        break a
                                    }
                                    D = 0;65535 ==
                                    (r | 0) | 65535 > r >>> 0 && (r = v, Q = q, D = !(N | M), C = D << 6, y = wa(D ? v : M) + 32 | 0, v = wa(D ? q : N), v = C + (32 == (v | 0) ? y : v) | 0, cb(z + 80 | 0, r, Q, M, N, v + -15 | 0), M = a[z + 88 >> 2], H = a[z + 84 >> 2], U = a[z + 92 >> 2], D = 16 - v | 0, v = a[z + 80 >> 2]);W = D;65535 < E >>> 0 || (q = !(L | J), E = q << 6, C = wa(q ? A : L) + 32 | 0, q = wa(q ? Y : J), Q = q = E + (32 == (q | 0) ? C : q) | 0, cb(z - -64 | 0, A, Y, L, J, q + -15 | 0), q = A = a[z + 76 >> 2], C = a[z + 72 >> 2], E = C << 15, y = a[z + 68 >> 2], R = y >>> 17 | E, E = y, A = a[z + 64 >> 2], aa = (E & 131071) << 15 | A >>> 17, T = (q & 131071) << 15 | C >>> 17, W = (D - Q | 0) + 16 | 0)
                                }
                                D = aa;L = 0;Q = ba(D, 0, v, L);
                                var ta = q = S,
                                    V = A << 15 & -32768;A = ba(V, 0, H,
                                    0);E = A + Q | 0;
                                var O = S + q | 0;O = E >>> 0 < A >>> 0 ? O + 1 | 0 : O;q = E;A = 0;Y = ba(V, G, v, L);E = A + Y | 0;r = S + q | 0;r = E >>> 0 < Y >>> 0 ? r + 1 | 0 : r;aa = E;Y = r;
                                var da = (q | 0) == (r | 0) & E >>> 0 < A >>> 0 | r >>> 0 < q >>> 0,
                                    pa = ba(D, 0, H, 0),
                                    fa = S,
                                    ca = M;A = ba(V, G, M, 0);E = A + pa | 0;N = S + fa | 0;N = E >>> 0 < A >>> 0 ? N + 1 | 0 : N;
                                var ja = E;C = ba(R, 0, v, L);E = E + C | 0;A = S + N | 0;
                                var ha = E;C = J = E >>> 0 < C >>> 0 ? A + 1 | 0 : A;A = (O | 0) == (ta | 0) & q >>> 0 < Q >>> 0 | O >>> 0 < ta >>> 0;E = O;q = E + ha | 0;r = A + C | 0;ta = q;E = q >>> 0 < E >>> 0 ? r + 1 | 0 : r;C = q;
                                var na = ba(D, 0, M, 0),
                                    la = S;q = V;
                                var ia = U | 65536;V = B;A = ba(q, G, ia, B);q = A + na | 0;r = S + la | 0;r = q >>> 0 < A >>> 0 ? r + 1 | 0 : r;
                                var qa = q;y = ba(H, 0, R, 0);q = q + y | 0;B = r;A = r + S | 0;A = q >>> 0 < y >>> 0 ? A + 1 | 0 : A;
                                var oa = q,
                                    ka = T & 2147483647 | -2147483648;q = ba(ka, 0, v, L);v = oa + q | 0;L = A;y = A + S | 0;G = v;q = v >>> 0 < q >>> 0 ? y + 1 | 0 : y;r = E + v | 0;A = 0;v = A + C | 0;v >>> 0 < A >>> 0 && (r = r + 1 | 0);U = v;A = T = r;C = v + da | 0;C >>> 0 < v >>> 0 && (A = A + 1 | 0);Q = A;M = (W + (X + Z | 0) | 0) + -16383 | 0;A = ba(ca, 0, R, 0);v = S;O = 0;y = ba(D, 0, ia, V);D = y + A | 0;r = S + v | 0;r = D >>> 0 < y >>> 0 ? r + 1 | 0 : r;y = W = D;D = r;r = (v | 0) == (D | 0) & y >>> 0 < A >>> 0 | D >>> 0 < v >>> 0;A = ba(ka, 0, H, 0);v = A + y | 0;y = S + D | 0;y = v >>> 0 < A >>> 0 ? y + 1 | 0 : y;A = H = v;v = y;D = (D | 0) == (v | 0) & A >>> 0 < W >>> 0 | v >>> 0 <
                                D >>> 0;A = r + D | 0;A >>> 0 < D >>> 0 && (O = 1);y = A;A = O;da = y;r = 0;y = (N | 0) == (J | 0) & ha >>> 0 < ja >>> 0 | J >>> 0 < N >>> 0;N = y + ((N | 0) == (fa | 0) & ja >>> 0 < pa >>> 0 | N >>> 0 < fa >>> 0) | 0;N >>> 0 < y >>> 0 && (r = 1);O = N;N = N + H | 0;y = v + r | 0;r = W = N;D = r >>> 0 < O >>> 0 ? y + 1 | 0 : y;v = (v | 0) == (D | 0) & r >>> 0 < H >>> 0 | D >>> 0 < v >>> 0;y = da + v | 0;y >>> 0 < v >>> 0 && (A = A + 1 | 0);v = y;y = ba(ka, 0, ia, V);v = v + y | 0;r = S + A | 0;r = v >>> 0 < y >>> 0 ? r + 1 | 0 : r;O = v;N = ba(ka, 0, ca, 0);A = S;H = ba(R, 0, ia, V);v = H + N | 0;y = S + A | 0;y = v >>> 0 < H >>> 0 ? y + 1 | 0 : y;H = v;v = y;y = (A | 0) == (v | 0) & H >>> 0 < N >>> 0 | v >>> 0 < A >>> 0;A = v + O | 0;O = r + y | 0;y = A >>> 0 < v >>> 0 ? O + 1 | 0 : O;ca =
                                A;r = D + H | 0;O = 0;v = O + W | 0;v >>> 0 < O >>> 0 && (r = r + 1 | 0);A = N = v;v = r;D = (D | 0) == (v | 0) & A >>> 0 < W >>> 0 | v >>> 0 < D >>> 0;A = ca + D | 0;A >>> 0 < D >>> 0 && (y = y + 1 | 0);H = A;A = (B | 0) == (L | 0) & oa >>> 0 < qa >>> 0 | L >>> 0 < B >>> 0;B = A + ((B | 0) == (la | 0) & qa >>> 0 < na >>> 0 | B >>> 0 < la >>> 0) | 0;A = B + ((q | 0) == (L | 0) & G >>> 0 < oa >>> 0 | q >>> 0 < L >>> 0) | 0;D = q;q = D + N | 0;O = A + v | 0;O = q >>> 0 < D >>> 0 ? O + 1 | 0 : O;D = B = q;q = O;v = (v | 0) == (q | 0) & D >>> 0 < N >>> 0 | q >>> 0 < v >>> 0;D = v + H | 0;D >>> 0 < v >>> 0 && (y = y + 1 | 0);r = y;y = D;A = 0;D = (E | 0) == (T | 0) & U >>> 0 < ta >>> 0 | T >>> 0 < E >>> 0;E = D + ((E | 0) == (J | 0) & ta >>> 0 < ha >>> 0 | E >>> 0 < J >>> 0) | 0;E >>> 0 < D >>> 0 && (A =
                                    1);D = E + B | 0;O = q + A | 0;O = D >>> 0 < E >>> 0 ? O + 1 | 0 : O;v = D;E = O;v = (q | 0) == (E | 0) & v >>> 0 < B >>> 0 | E >>> 0 < q >>> 0;q = y + v | 0;q >>> 0 < v >>> 0 && (r = r + 1 | 0);v = q;q = r;q & 65536 ? M = M + 1 | 0 : (N = Y >>> 31 | 0, r = q << 1 | v >>> 31, v = v << 1 | E >>> 31, q = r, r = E << 1 | D >>> 31, D = D << 1 | Q >>> 31, E = r, y = aa, r = Y << 1 | y >>> 31, aa = y << 1, Y = r, y = Q << 1 | C >>> 31, C = C << 1 | N, Q = y);
                                if (32767 <= (M | 0)) ea |= 2147418112,
                                q = v = 0;
                                else {
                                    b: {
                                        if (0 >= (M | 0)) {
                                            A = 1 - M | 0;
                                            if (127 >= A >>> 0) {
                                                y = M + 127 | 0;
                                                cb(z + 48 | 0, aa, Y, C, Q, y);
                                                cb(z + 32 | 0, D, E, v, q, y);
                                                ic(z + 16 | 0, aa, Y, C, Q, A);
                                                ic(z, D, E, v, q, A);
                                                aa = 0 != (a[z + 48 >> 2] | a[z + 56 >> 2]) | 0 != (a[z + 52 >> 2] | a[z + 60 >>
                                                    2]) | a[z + 32 >> 2] | a[z + 16 >> 2];
                                                Y = a[z + 36 >> 2] | a[z + 20 >> 2];
                                                C = a[z + 40 >> 2] | a[z + 24 >> 2];
                                                Q = a[z + 44 >> 2] | a[z + 28 >> 2];
                                                D = a[z >> 2];
                                                E = a[z + 4 >> 2];
                                                q = a[z + 12 >> 2];
                                                v = a[z + 8 >> 2];
                                                break b
                                            }
                                            q = v = 0;
                                            break a
                                        }
                                        q = q & 65535 | M << 16
                                    }
                                    F |= v;ea |= q;
                                    (!C & -2147483648 == (Q | 0) ? Y | aa : !(-1 < (Q | 0))) ? (O = ea, N = E, v = D + 1 | 0, 1 > v >>> 0 && (N = N + 1 | 0), q = N, D = (E | 0) == (q | 0) & v >>> 0 < D >>> 0 | q >>> 0 < E >>> 0, E = D + F | 0, E >>> 0 < D >>> 0 && (O = O + 1 | 0), F = E, ea = O) : C | aa | Q ^ -2147483648 | Y ? (v = D, q = E) : (N = ea, r = E, v = D & 1, q = v + D | 0, q >>> 0 < v >>> 0 && (r = r + 1 | 0), v = q, q = r, D = (E | 0) == (q | 0) & v >>> 0 < D >>> 0 | q >>> 0 < E >>> 0, E = D + F | 0, E >>> 0 < D >>> 0 &&
                                        (N = N + 1 | 0), F = E, ea = N)
                                }
                            }
                            a[c >> 2] = v;
                            a[c + 4 >> 2] = q;
                            a[c + 8 >> 2] = F;
                            a[c + 12 >> 2] = ea;
                            g = z + 96 | 0;
                            Q = (h << 1) + e | 0;
                            v = u[((Q << 3) + d | 0) >> 3];
                            c = pd(a[n >> 2], a[n + 4 >> 2], a[n + 8 >> 2], a[n + 12 >> 2]);
                            x += v * c;
                            f += c * u[(((Q | 1) << 3) + d | 0) >> 3];
                            h = h + 1 | 0;
                            if (4 == (h | 0)) break
                        }
                        m = m + 1 | 0;
                        if (4 == (m | 0)) break
                    }
                    va(b, x, f);
                    g = n + 272 | 0
                }

                function qd(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    b = rd(h, b, 1);
                    H(a[b + 4 >> 2], d);
                    a[b + 4 >> 2] += 16;
                    ac(b);
                    g = h + 16 | 0
                }

                function sd(b, d) {
                    var h;
                    g = h = g - 32 | 0;
                    var n = b + 8 | 0;
                    n = td(h + 8 | 0, ud(b, ja(b) + 1 | 0), ja(b), n);
                    H(a[n + 8 >> 2], d);
                    a[n + 8 >> 2] += 16;
                    vd(b, n);
                    wd(n);
                    g = h + 32 | 0
                }

                function xd(b,
                    d) {
                    var h;
                    (h = a[d + 16 >> 2]) ? (d | 0) == (h | 0) ? (a[b + 16 >> 2] = b, d = a[d + 16 >> 2], t[a[a[d >> 2] + 12 >> 2]](d, b)) : a[b + 16 >> 2] = t[a[a[h >> 2] + 8 >> 2]](h): a[b + 16 >> 2] = 0
                }

                function yd(a, d) {
                    jc(a, d);
                    g = a = g - 32 | 0;
                    var b = d;
                    d = zd(a + 8 | 0);
                    Ad(b, d);
                    pa(d);
                    g = a + 32 | 0
                }

                function qa(b, d) {
                    var h = a[d + 4 >> 2];
                    a[b >> 2] = a[d >> 2];
                    a[b + 4 >> 2] = h
                }

                function ia(b, d) {
                    var h = a[d + 4 >> 2];
                    a[b + 8 >> 2] = a[d >> 2];
                    a[b + 12 >> 2] = h
                }

                function Ab(b, d) {
                    a[b >> 2] = a[d >> 2]
                }

                function Za(b) {
                    var d = a[b >> 2];
                    a[b >> 2] = 0;
                    return d
                }

                function bd(b, d, h, n) {
                    var m, f = 0;
                    g = m = g - 16 | 0;
                    a[m + 12 >> 2] = 0;
                    var x = b + 12 | 0;
                    a[x >> 2] = 0;
                    a[(x +
                        4 | 0) >> 2] = n;
                    d && (Ja(b + 12 | 0), n = d, 76695844 < d >>> 0 && (Bb(1134), U()), f = db(L(n, 56), 8));
                    a[b >> 2] = f;
                    h = L(h, 56) + f | 0;
                    a[b + 8 >> 2] = h;
                    a[b + 4 >> 2] = h;
                    a[(b + 12 | 0) >> 2] = L(d, 56) + f;
                    g = m + 16 | 0;
                    return b
                }

                function cd(b, d) {
                    za(b);
                    Ra(b);
                    za(b);
                    var h = d + 4 | 0,
                        n = a[b >> 2],
                        m = a[b + 4 >> 2];
                    if ((n | 0) != (m | 0))
                        for (;;) {
                            m = m + -56 | 0;
                            var f = a[h >> 2] + -56 | 0,
                                g = m;
                            y(f, g);
                            y(f + 8 | 0, g + 8 | 0);
                            y(f + 16 | 0, g + 16 | 0);
                            y(f + 24 | 0, g + 24 | 0);
                            H(f + 32 | 0, g + 32 | 0);
                            var c = f + 48 | 0;
                            f = g + 48 | 0;
                            a[c >> 2] = a[f >> 2];
                            a[f >> 2] = 0;
                            a[h >> 2] += -56;
                            if ((n | 0) == (m | 0)) break
                        }
                    eb(b, h);
                    eb(b + 4 | 0, d + 8 | 0);
                    eb(b + 8 | 0, d + 12 | 0);
                    a[d >> 2] =
                        a[d + 4 >> 2];
                    Ra(b);
                    za(b);
                    za(b)
                }

                function dd(b) {
                    var d = a[b + 4 >> 2];
                    if (a[b + 8 >> 2] != (d | 0))
                        for (; Ja(b + 12 | 0), a[b + 8 >> 2] += -56, a[b + 8 >> 2] != (d | 0););
                    a[b >> 2] && (Ja(b + 12 | 0), d = a[b >> 2], a[(b + 12 | 0) >> 2], R(d))
                }

                function za(b) {
                    return (a[(b + 8 | 0) >> 2] - a[b >> 2] | 0) / 56 | 0
                }

                function eb(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    a[h + 12 >> 2] = a[b >> 2];
                    a[b >> 2] = a[d >> 2];
                    a[d >> 2] = a[h + 12 >> 2];
                    g = h + 16 | 0
                }

                function fb() {}

                function Ja(b) {
                    return a[(b | 0) + 4 >> 2]
                }

                function Bb(b) {
                    var d = Bd(8) | 0;
                    a[d >> 2] = 3876;
                    a[d >> 2] = 3920;
                    var h = d + 4 | 0,
                        n = Cd(b),
                        m = ca(n + 13 | 0);
                    a[m + 8 >> 2] = 0;
                    a[m + 4 >> 2] = n;
                    a[m >> 2] =
                        n;
                    a[h >> 2] = oa(m + 12 | 0, b, n + 1 | 0);
                    a[d >> 2] = 3968;
                    Dd(d | 0, 4E3, 2);
                    U()
                }

                function db(b, d) {
                    if (16 < d >>> 0) {
                        var h;
                        g = h = g - 16 | 0;
                        d = 4 < d >>> 0 ? d : 4;
                        b = b ? b : 1;
                        a: {
                            b: {
                                for (;;) {
                                    var n = h + 12 | 0,
                                        m = d,
                                        f = b;
                                    c: {
                                        if (8 == (m | 0)) m = rb(f);
                                        else {
                                            var x = 28;
                                            if (m & 3) break c;
                                            for (var c = m >>> 2 | 0, e = 0, k;;)
                                                if (k = e, c) c &= c - 1, e = e + 1 | 0;
                                                else break;
                                            c = k;
                                            if (1 != (c | 0)) break c;
                                            x = 48;
                                            if (-64 - m >>> 0 < f >>> 0) break c;
                                            m = Ne(16 < m >>> 0 ? m : 16, f)
                                        }
                                        m ? (a[n >> 2] = m, x = 0) : x = 48
                                    }
                                    if (!x) break b;
                                    if (x = a[1159]) t[x]();
                                    else break
                                }
                                b = a[h + 12 >> 2] = 0;
                                break a
                            }
                            b = a[h + 12 >> 2]
                        }
                        g = h + 16 | 0;
                        return b
                    }
                    return ca(b)
                }

                function Ka(a) {
                    R(a |
                        0)
                }

                function ac(b) {
                    a[a[b >> 2] + 4 >> 2] = a[b + 4 >> 2]
                }

                function ad(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    var n = V[a >> 2] < V[d >> 2];
                    g = b + 16 | 0;
                    return n ? d : a
                }

                function $c(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    var n = V[d >> 2] < V[a >> 2];
                    g = b + 16 | 0;
                    return n ? d : a
                }

                function La(b) {
                    var d;
                    g = d = g - 16 | 0;
                    b = a[ta(d + 8 | 0, b) >> 2];
                    g = d + 16 | 0;
                    return b
                }

                function T(b) {
                    return u[(a[b >> 2] + (a[b + 4 >> 2] << 3) | 0) + 8 >> 3]
                }

                function X(b) {
                    return u[a[b >> 2] + (a[b + 4 >> 2] << 3) >> 3]
                }

                function Xc() {
                    var b = Bd(4) | 0;
                    a[b >> 2] = 0;
                    a[b >> 2] = 3876;
                    a[b >> 2] = 3764;
                    Dd(b | 0, 3804, 3);
                    U()
                }

                function fc(b) {
                    return a[(b + 8 | 0) >> 2] - a[b >> 2] >>
                        2
                }

                function ec(b) {
                    return (a[(b + 8 | 0) >> 2] - a[b >> 2] | 0) / 12 | 0
                }

                function Fb(a, d, h) {
                    a = u[a >> 3] - u[d >> 3];
                    return u[h >> 3] + a * a
                }

                function Ed(b) {
                    b |= 0;
                    a[b >> 2] = 1384;
                    var d = b + 56 | 0,
                        h = a[d + 8 >> 2],
                        n = a[d + 12 >> 2];
                    g = d = g - 16 | 0;
                    var m = (n << 2) + h | 0,
                        f = a[m >> 2] + -1 | 0;
                    a[m >> 2] = f;
                    m = h - -64 | 0;
                    n = G[m + 4 | 0] ? a[m >> 2] != (n | 0) : 1;
                    if (!(n | f)) {
                        n = h;
                        f = h - -64 | 0;
                        var x;
                        g = x = g - 16 | 0;
                        if ((n | 0) != (f | 0)) {
                            var c = n + 4 | 0;
                            if ((c | 0) != (f | 0))
                                for (; n = V[n >> 2] < V[c >> 2] ? c : n, c = c + 4 | 0, (c | 0) != (f | 0););
                        }
                        g = x + 16 | 0;
                        a[n >> 2] ? (a[d + 12 >> 2] = n - h >> 2, h = m, m = d + 12 | 0, G[h + 4 | 0] ? a[h >> 2] = a[m >> 2] : (a[h >> 2] = a[m >> 2],
                            C[h + 4 | 0] = 1)) : G[m + 4 | 0] && (C[m + 4 | 0] = 0)
                    }
                    g = d + 16 | 0;
                    ld(b + 8 | 0);
                    return b | 0
                }

                function sb() {
                    U()
                }

                function jc(b, d) {
                    var h;
                    (h = a[d + 16 >> 2]) ? (d | 0) == (h | 0) ? (a[b + 16 >> 2] = b, d = a[d + 16 >> 2], t[a[a[d >> 2] + 12 >> 2]](d, b)) : (a[b + 16 >> 2] = h, a[d + 16 >> 2] = 0) : a[b + 16 >> 2] = 0
                }

                function zd(b) {
                    a[b + 16 >> 2] = 0;
                    return b
                }

                function Ad(b, d) {
                    var h = a[b + 16 >> 2];
                    a[b + 16 >> 2] = 0;
                    if ((b | 0) == (h | 0)) t[a[a[h >> 2] + 16 >> 2]](h);
                    else if (h) t[a[a[h >> 2] + 20 >> 2]](h);
                    (h = a[d + 16 >> 2]) ? (d | 0) == (h | 0) ? (a[b + 16 >> 2] = b, d = a[d + 16 >> 2], t[a[a[d >> 2] + 12 >> 2]](d, b)) : (a[b + 16 >> 2] = h, a[d + 16 >> 2] = 0) : a[b + 16 >>
                        2] = 0
                }

                function Sa(b, d) {
                    u[(a[b >> 2] + (a[b + 4 >> 2] << 3) | 0) + 8 >> 3] = u[d >> 3]
                }

                function Ta(b, d) {
                    u[a[b >> 2] + (a[b + 4 >> 2] << 3) >> 3] = u[d >> 3]
                }

                function bb(a, d) {
                    return u[a >> 3] * u[d >> 3]
                }

                function ab(a, d) {
                    return u[a >> 3] + u[d >> 3]
                }

                function $b(b) {
                    var d;
                    g = d = g - 16 | 0;
                    var h = d + 8 | 0;
                    a[h >> 2] = b;
                    g = d + 16 | 0;
                    return a[h >> 2]
                }

                function Zb(b, d, h) {
                    var n;
                    g = n = g - 16 | 0;
                    a[n >> 2] = h;
                    a[n + 8 >> 2] = d;
                    d = a[n + 8 >> 2];
                    g = h = g - 16 | 0;
                    a[h + 8 >> 2] = d;
                    d = a[h + 8 >> 2];
                    var m = a[d + 4 >> 2];
                    a[b >> 2] = a[d >> 2];
                    a[b + 4 >> 2] = m;
                    g = h + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 8 >> 2] = a[n >> 2];
                    g = b + 16 | 0;
                    g = n + 16 | 0
                }

                function kc(b) {
                    var d;
                    g = d = g - 16 | 0;
                    var h = d + 8 | 0;
                    a[h >> 2] = b;
                    b = a[h >> 2];
                    g = d + 16 | 0;
                    return b
                }

                function Fd(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    var n = a[b + 4 >> 2];
                    a[h + 8 >> 2] = a[b >> 2];
                    a[h + 12 >> 2] = n;
                    n = a[d + 4 >> 2];
                    a[b >> 2] = a[d >> 2];
                    a[b + 4 >> 2] = n;
                    b = h + 8 | 0;
                    n = a[b + 4 >> 2];
                    a[d >> 2] = a[b >> 2];
                    a[d + 4 >> 2] = n;
                    g = h + 16 | 0
                }

                function lc(b, d, h) {
                    a[b >> 2] = 1532;
                    a[b >> 2] = 1496;
                    mc(b + 4 | 0, d, h)
                }

                function mc(b, d, h) {
                    d = Gd(d);
                    Gd(h);
                    g = h = g - 16 | 0;
                    a[h + 8 >> 2] = d;
                    a[b >> 2] = a[a[h + 8 >> 2] >> 2];
                    g = h + 16 | 0
                }

                function Gd(b) {
                    var d;
                    g = d = g - 16 | 0;
                    var h = d + 8 | 0;
                    ta(h, b);
                    g = d + 16 | 0;
                    return a[h >> 2]
                }

                function nc(b, d) {
                    a[b + 4 >> 2] = 1;
                    a[b >> 2] = d;
                    return b
                }

                function oc(b, d, h) {
                    var n;
                    g = n = g - 16 | 0;
                    a[n + 12 >> 2] = d;
                    a[b >> 2] = a[n + 12 >> 2];
                    d = a[h + 4 >> 2];
                    var m = b + 4 | 0;
                    a[m >> 2] = a[h >> 2];
                    a[m + 4 >> 2] = d;
                    g = n + 16 | 0;
                    return b
                }

                function pc(a) {
                    R(a | 0)
                }

                function qc(b) {
                    var d = a[b >> 2];
                    a[b >> 2] = 0;
                    d && R(d)
                }

                function rc(b, d, h) {
                    var n;
                    g = n = g - 16 | 0;
                    var m = n + 8 | 0,
                        f = b + 16 | 0,
                        x = u[a[b >> 2] >> 3],
                        c;
                    g = c = g - 32 | 0;
                    u[c + 24 >> 3] = x;
                    C[c + 23 | 0] = 0;
                    a[c + 8 >> 2] = 0;
                    a[c + 12 >> 2] = 0;
                    bc(f, c + 8 | 0);
                    a[c + 12 >> 2] = c + 24;
                    a[c + 8 >> 2] = c + 23;
                    var e = f + 256 | 0;
                    x = c + 8 | 0;
                    var k;
                    g = k = g - 16 | 0;
                    a[k + 8 >> 2] = La(a[e >> 2]);
                    a[k >> 2] = La(a[e + 4 >> 2]);
                    if (Ha(k + 8 | 0, k))
                        for (;;) {
                            var p =
                                a[k + 8 >> 2],
                                l = u[a[x + 4 >> 2] >> 3],
                                q, t;
                            g = e = g - 112 | 0;
                            var v = p + 32 | 0,
                                r = H(e + 96 | 0, v),
                                D, E = r;
                            g = D = g - 16 | 0;
                            a[D + 12 >> 2] = -1;
                            var A = D + 12 | 0;
                            g = t = g - 16 | 0;
                            u[t >> 3] = u[E + 8 >> 3];
                            u[t + 8 >> 3] = u[t >> 3] * +a[A >> 2];
                            ia(E, t + 8 | 0);
                            g = q = g - 16 | 0;
                            u[q >> 3] = u[E >> 3];
                            u[q + 8 >> 3] = u[q >> 3] * +a[A >> 2];
                            qa(E, q + 8 | 0);
                            g = q + 16 | 0;
                            g = t + 16 | 0;
                            g = D + 16 | 0;
                            q = p + 16 | 0;
                            t = p + 24 | 0;
                            Hd(e + 80 | 0, q, t, r);
                            Hd(e - -64 | 0, t, q, v);
                            Id(e + 80 | 0);
                            Id(e - -64 | 0);
                            v = H(e + 48 | 0, e + 80 | 0);
                            r = H(e + 32 | 0, e - -64 | 0);
                            gb(v, l);
                            gb(r, l);
                            fa(p, v);
                            fa(p + 8 | 0, r);
                            Jd(e + 16 | 0, e + 80 | 0);
                            Jd(e, e - -64 | 0);
                            r = e + 16 | 0;
                            q = e;
                            g = v = g - 16 | 0;
                            g = l = g - 32 | 0;
                            u[l +
                                16 >> 3] = u[r + 8 >> 3];
                            u[l + 8 >> 3] = u[q + 8 >> 3];
                            u[l + 24 >> 3] = ab(l + 16 | 0, l + 8 | 0);
                            ia(r, l + 24 | 0);
                            g = p = g - 32 | 0;
                            u[p + 16 >> 3] = u[r >> 3];
                            u[p + 8 >> 3] = u[q >> 3];
                            u[p + 24 >> 3] = ab(p + 16 | 0, p + 8 | 0);
                            qa(r, p + 24 | 0);
                            g = p + 32 | 0;
                            g = l + 32 | 0;
                            g = v + 16 | 0;
                            g = e + 112 | 0;
                            e = 0 < u[e + 16 >> 3] ? 1 : 0 < u[(e + 16 | 0) + 8 >> 3];
                            p = a[x >> 2];
                            C[p | 0] = e | G[p | 0];
                            e = k + 8 | 0;
                            a[e >> 2] += 56;
                            if (!Ha(k + 8 | 0, k)) break
                        }
                    g = k + 16 | 0;
                    x = G[c + 23 | 0];
                    a[m + 4 >> 2] = f;
                    C[m | 0] = x;
                    g = c + 32 | 0;
                    m = G[n + 8 | 0];
                    f = b + 8 | 0;
                    c = a[n + 12 >> 2];
                    x = u[a[b + 4 >> 2] >> 3];
                    g = b = g - 48 | 0;
                    C[b + 47 | 0] = 0;
                    a[b + 40 >> 2] = f;
                    a[b + 28 >> 2] = c;
                    a[b + 24 >> 2] = d;
                    u[b + 16 >> 3] = x;
                    a[b + 8 >> 2] = f;
                    a[b + 32 >>
                        2] = b + 47;
                    d = b + 40 | 0;
                    f = b + 8 | 0;
                    for (c = 0;;) {
                        if (a[((c << 2) + h | 0) >> 2]) k = a[a[d >> 2] >> 2], e = c, g = x = g - 16 | 0, k = J(x + 8 | 0, k, e), a[x >> 2] = 0, a[x + 4 >> 2] = 0, l = k, v = x, g = p = g - 16 | 0, g = e = g - 16 | 0, u[e + 8 >> 3] = T(l), Sa(l, v), g = k = g - 16 | 0, u[k + 8 >> 3] = X(l), Ta(l, v), g = k + 16 | 0, g = e + 16 | 0, g = p + 16 | 0, g = x + 16 | 0;
                        else {
                            x = f;
                            k = c;
                            p = a[a[x >> 2] >> 2];
                            l = k;
                            v = u[x + 8 >> 3];
                            e = a[x + 16 >> 2];
                            q = a[x + 20 >> 2];
                            g = k = g - 32 | 0;
                            r = v;
                            e = J(k + 24 | 0, e, l);
                            v = J(k + 16 | 0, p, l);
                            q = J(k + 8 | 0, q, l);
                            g = l = g - 80 | 0;
                            p = y(l + 72 | 0, e);
                            q = y(l - -64 | 0, q);
                            e = y(l + 56 | 0, v);
                            v = na(l + 40 | 0);
                            $a(v, q);
                            E = q = na(l + 24 | 0);
                            A = e;
                            g = D = g - 16 | 0;
                            g = t = g - 32 | 0;
                            u[t +
                                16 >> 3] = u[E + 8 >> 3];
                            u[t + 8 >> 3] = T(A);
                            u[t + 24 >> 3] = ab(t + 16 | 0, t + 8 | 0);
                            ia(E, t + 24 | 0);
                            var z;
                            g = z = g - 32 | 0;
                            u[z + 16 >> 3] = u[E >> 3];
                            u[z + 8 >> 3] = X(A);
                            u[z + 24 >> 3] = ab(z + 16 | 0, z + 8 | 0);
                            qa(E, z + 24 | 0);
                            g = z + 32 | 0;
                            g = t + 32 | 0;
                            g = D + 16 | 0;
                            gb(q, r);
                            t = v;
                            D = q;
                            g = r = g - 16 | 0;
                            q = t;
                            E = D;
                            g = D = g - 32 | 0;
                            u[D + 16 >> 3] = u[q + 8 >> 3];
                            u[D + 8 >> 3] = u[E + 8 >> 3];
                            u[D + 24 >> 3] = u[(D + 16 | 0) >> 3] - u[(D + 8 | 0) >> 3];
                            ia(q, D + 24 | 0);
                            g = t = g - 32 | 0;
                            u[t + 16 >> 3] = u[q >> 3];
                            u[t + 8 >> 3] = u[E >> 3];
                            u[t + 24 >> 3] = u[(t + 16 | 0) >> 3] - u[(t + 8 | 0) >> 3];
                            qa(q, t + 24 | 0);
                            g = t + 32 | 0;
                            g = D + 32 | 0;
                            g = r + 16 | 0;
                            r = e;
                            t = v;
                            g = q = g - 32 | 0;
                            v = na(q + 16 | 0);
                            Kd(v, t);
                            gb(v,
                                .06666666666666667);
                            t = H(q, v);
                            gb(t, 1);
                            fa(r, t);
                            g = q + 32 | 0;
                            q = e;
                            g = r = g - 16 | 0;
                            u[r + 8 >> 3] = .1;
                            t = r + 8 | 0;
                            g = v = g - 16 | 0;
                            u[v >> 3] = T(q);
                            u[v + 8 >> 3] = Gb(t, v);
                            Sa(q, v + 8 | 0);
                            D = t;
                            g = t = g - 16 | 0;
                            u[t >> 3] = X(q);
                            u[t + 8 >> 3] = Gb(D, t);
                            Ta(q, t + 8 | 0);
                            g = t + 16 | 0;
                            g = v + 16 | 0;
                            g = r + 16 | 0;
                            v = na(l + 8 | 0);
                            $a(v, e);
                            gb(v, .5);
                            fa(p, v);
                            v = 1;
                            r = X(e);
                            0 != r & r == r || (r = T(e), v = 0 != r & r == r);
                            g = l + 80 | 0;
                            p = v;
                            g = k + 32 | 0;
                            k = p;
                            x = a[x + 24 >> 2];
                            C[x | 0] = k | G[x | 0]
                        }
                        c = c + 1 | 0;
                        if (16 == (c | 0)) break
                    }
                    g = b + 48 | 0;
                    b = G[b + 47 | 0];
                    g = n + 16 | 0;
                    return b | m
                }

                function Hd(a, d, h, n) {
                    va(a, .5 * (X(h) - X(d) + u[n >> 3]), .5 * (T(h) - T(d) + u[n + 8 >>
                        3]))
                }

                function Id(a) {
                    var b;
                    g = b = g - 16 | 0;
                    u[b + 8 >> 3] = .5;
                    var h = b + 8 | 0,
                        n;
                    g = n = g - 16 | 0;
                    u[n >> 3] = u[a + 8 >> 3];
                    u[n + 8 >> 3] = Gb(h, n);
                    ia(a, n + 8 | 0);
                    var m;
                    g = m = g - 16 | 0;
                    u[m >> 3] = u[a >> 3];
                    u[m + 8 >> 3] = Gb(h, m);
                    qa(a, m + 8 | 0);
                    g = m + 16 | 0;
                    g = n + 16 | 0;
                    g = b + 16 | 0
                }

                function gb(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    u[b + 8 >> 3] = d;
                    d = b + 8 | 0;
                    var n;
                    g = n = g - 16 | 0;
                    u[n >> 3] = u[a + 8 >> 3];
                    u[n + 8 >> 3] = bb(n, d);
                    ia(a, n + 8 | 0);
                    var m;
                    g = m = g - 16 | 0;
                    u[m >> 3] = u[a >> 3];
                    u[m + 8 >> 3] = bb(m, d);
                    qa(a, m + 8 | 0);
                    g = m + 16 | 0;
                    g = n + 16 | 0;
                    g = b + 16 | 0
                }

                function Jd(a, d) {
                    a = na(a);
                    Kd(a, d);
                    g = d = g - 16 | 0;
                    var b;
                    g = b = g - 16 | 0;
                    u[b >> 3] = u[a + 8 >> 3];
                    u[b + 8 >> 3] = Hb(u[b >> 3]);
                    ia(a, b + 8 | 0);
                    var n;
                    g = n = g - 16 | 0;
                    u[n >> 3] = u[a >> 3];
                    u[n + 8 >> 3] = Hb(u[n >> 3]);
                    qa(a, n + 8 | 0);
                    g = n + 16 | 0;
                    g = b + 16 | 0;
                    g = d + 16 | 0
                }

                function Kd(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    var n;
                    g = n = g - 16 | 0;
                    u[n + 8 >> 3] = u[a + 8 >> 3];
                    u[n >> 3] = u[d + 8 >> 3];
                    ia(a, n);
                    var m;
                    g = m = g - 16 | 0;
                    u[m + 8 >> 3] = u[a >> 3];
                    u[m >> 3] = u[d >> 3];
                    qa(a, m);
                    g = m + 16 | 0;
                    g = n + 16 | 0;
                    g = b + 16 | 0
                }

                function Gb(a, d) {
                    d = u[d >> 3];
                    return Hb(d) < u[a >> 3] ? 0 : d
                }

                function ja(b) {
                    b |= 0;
                    return a[b + 4 >> 2] - a[b >> 2] >> 4
                }

                function Aa(b) {
                    return a[(b + 8 | 0) >> 2] - a[b >> 2] >> 4
                }

                function rd(b, d, h) {
                    a[b >> 2] = d;
                    a[b + 4 >> 2] = a[d +
                        4 >> 2];
                    a[b + 8 >> 2] = a[d + 4 >> 2] + (h << 4);
                    return b
                }

                function ud(b, d) {
                    var h;
                    g = h = g - 16 | 0;
                    a[h + 12 >> 2] = d;
                    var n;
                    g = n = g - 16 | 0;
                    a[n + 12 >> 2] = 268435455;
                    a[n + 8 >> 2] = 2147483647;
                    d = a[$c(n + 12 | 0, n + 8 | 0) >> 2];
                    g = n + 16 | 0;
                    if (V[h + 12 >> 2] <= d >>> 0) return b = Aa(b), b >>> 0 < d >>> 1 >>> 0 && (a[h + 8 >> 2] = b << 1, d = a[ad(h + 8 | 0, h + 12 | 0) >> 2]), g = h + 16 | 0, d;
                    Bb(3816);
                    U();
                    U()
                }

                function td(b, d, h, n) {
                    var m, f = 0;
                    g = m = g - 16 | 0;
                    a[m + 12 >> 2] = 0;
                    var x = b + 12 | 0;
                    a[x >> 2] = 0;
                    a[(x + 4 | 0) >> 2] = n;
                    d && (Ja(b + 12 | 0), n = d, 268435455 < d >>> 0 && (Bb(1134), U()), f = db(n << 4, 8));
                    a[b >> 2] = f;
                    h = (h << 4) + f | 0;
                    a[b + 8 >> 2] = h;
                    a[b +
                        4 >> 2] = h;
                    a[(b + 12 | 0) >> 2] = (d << 4) + f;
                    g = m + 16 | 0;
                    return b
                }

                function vd(b, d) {
                    Aa(b);
                    ja(b);
                    Aa(b);
                    var h = d + 4 | 0,
                        n = a[b >> 2],
                        m = a[b + 4 >> 2];
                    if ((n | 0) != (m | 0))
                        for (; m = m + -16 | 0, H(a[h >> 2] + -16 | 0, m), a[h >> 2] += -16, (n | 0) != (m | 0););
                    eb(b, h);
                    eb(b + 4 | 0, d + 8 | 0);
                    eb(b + 8 | 0, d + 12 | 0);
                    a[d >> 2] = a[d + 4 >> 2];
                    ja(b);
                    Aa(b);
                    Aa(b)
                }

                function wd(b) {
                    var d = a[b + 4 >> 2];
                    if (a[b + 8 >> 2] != (d | 0))
                        for (; Ja(b + 12 | 0), a[b + 8 >> 2] += -16, a[b + 8 >> 2] != (d | 0););
                    a[b >> 2] && (Ja(b + 12 | 0), R(a[b >> 2]))
                }

                function sc(b, d, h) {
                    a[b >> 2] = 1632;
                    a[b >> 2] = 1596;
                    mc(b + 4 | 0, d, h)
                }

                function tc(b, d, h) {
                    a[b >> 2] = 1704;
                    a[b >>
                        2] = 1668;
                    mc(b + 4 | 0, d, h)
                }

                function uc(a, d) {
                    var b;
                    g = b = g - 16 | 0;
                    Oe(a | 0, 2, 1916, 1924, 57, d | 0);
                    g = b + 16 | 0
                }

                function Ld(b, d, h) {
                    var n;
                    g = n = g - 16 | 0;
                    a[n + 12 >> 2] = h;
                    Pe(4527, d | 0, 4526, 1933, 60, Ib(n + 12 | 0) | 0, 4526, 1937, 61, Ib(n + 12 | 0) | 0);
                    g = n + 16 | 0;
                    return b
                }

                function Md(a, d) {
                    t[a | 0](+d)
                }

                function Ib(b) {
                    var d = ca(4);
                    a[d >> 2] = a[b >> 2];
                    return d
                }

                function Nd(b, d) {
                    var h = a[b + 4 >> 2];
                    if ((h | 0) != (d | 0))
                        for (; h = h + -16 | 0, (h | 0) != (d | 0););
                    a[b + 4 >> 2] = d
                }

                function Od(b) {
                    Aa(b);
                    ja(b);
                    Aa(b);
                    a[b >> 2] && (Nd(b, a[b >> 2]), Aa(b), R(a[b >> 2]));
                    return b
                }

                function Pd(a) {
                    return t[a |
                        0]() | 0
                }

                function vc(b, d, h) {
                    b |= 0;
                    var n = d | 0;
                    d = a[b + 4 >> 2];
                    n = n + (d >> 1) | 0;
                    b = a[b >> 2];
                    t[d & 1 ? a[b + a[n >> 2] >> 2] : b](n, h | 0)
                }

                function ka(b) {
                    var d = ca(8),
                        h = a[b + 4 >> 2];
                    a[d >> 2] = a[b >> 2];
                    a[d + 4 >> 2] = h;
                    return d
                }

                function Qd() {
                    Qe(4525, 2249);
                    Re(4533, 2254, 1, 1, 0);
                    var b;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2259;
                    Ba(4549, a[b + 12 >> 2], 1, -128, 127);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2264;
                    Ba(4550, a[b + 12 >> 2], 1, -128, 127);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2276;
                    Ba(4551, a[b + 12 >> 2], 1, 0, 255);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2290;
                    Ba(4552, a[b + 12 >> 2], 2, -32768, 32767);
                    g = b +
                        16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2296;
                    Ba(4553, a[b + 12 >> 2], 2, 0, 65535);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2311;
                    Ba(4542, a[b + 12 >> 2], 4, -2147483648, 2147483647);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2315;
                    Ba(4541, a[b + 12 >> 2], 4, 0, -1);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2328;
                    Ba(4554, a[b + 12 >> 2], 4, -2147483648, 2147483647);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2333;
                    Ba(4531, a[b + 12 >> 2], 4, 0, -1);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2347;
                    Rd(4540, a[b + 12 >> 2], 4);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2353;
                    Rd(4526, a[b + 12 >> 2], 8);
                    g = b + 16 | 0;
                    Sd(4544, 2360);
                    Sd(4545, 2372);
                    wc(4546, 4, 2405);
                    wc(4547, 2, 2418);
                    wc(4548, 4, 2433);
                    Se(4532, 2448);
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2464;
                    la(4555, 0, a[b + 12 >> 2]);
                    g = b + 16 | 0;
                    Td(2494);
                    Ud(2531);
                    Vd(2570);
                    Wd(2601);
                    Xd(2641);
                    Yd(2670);
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2708;
                    la(4562, 4, a[b + 12 >> 2]);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2738;
                    la(4563, 5, a[b + 12 >> 2]);
                    g = b + 16 | 0;
                    Td(2777);
                    Ud(2809);
                    Vd(2842);
                    Wd(2875);
                    Xd(2909);
                    Yd(2942);
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 2976;
                    la(4564, 6, a[b + 12 >> 2]);
                    g = b + 16 | 0;
                    g = b = g - 16 | 0;
                    a[b + 12 >> 2] = 3007;
                    la(4565, 7, a[b + 12 >> 2]);
                    g = b + 16 | 0
                }

                function Td(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] =
                        b;
                    la(4556, 0, a[d + 12 >> 2]);
                    g = d + 16 | 0
                }

                function Ud(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] = b;
                    la(4557, 1, a[d + 12 >> 2]);
                    g = d + 16 | 0
                }

                function Vd(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] = b;
                    la(4558, 2, a[d + 12 >> 2]);
                    g = d + 16 | 0
                }

                function Wd(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] = b;
                    la(4559, 3, a[d + 12 >> 2]);
                    g = d + 16 | 0
                }

                function Xd(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] = b;
                    la(4560, 4, a[d + 12 >> 2]);
                    g = d + 16 | 0
                }

                function Yd(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] = b;
                    la(4561, 5, a[d + 12 >> 2]);
                    g = d + 16 | 0
                }

                function Zd(b, d) {
                    a: {
                        if (b) {
                            if (127 >= d >>> 0) break a;
                            if (a[a[1116] >> 2]) {
                                if (2047 >= d >>> 0) return C[b +
                                    1 | 0] = d & 63 | 128, C[b | 0] = d >>> 6 | 192, 2;
                                if (!(57344 != (d & -8192) && 55296 <= d >>> 0)) return C[b + 2 | 0] = d & 63 | 128, C[b | 0] = d >>> 12 | 224, C[b + 1 | 0] = d >>> 6 & 63 | 128, 3;
                                if (1048575 >= d + -65536 >>> 0) return C[b + 3 | 0] = d & 63 | 128, C[b | 0] = d >>> 18 | 240, C[b + 2 | 0] = d >>> 6 & 63 | 128, C[b + 1 | 0] = d >>> 12 & 63 | 128, 4
                            } else if (57216 == (d & -128)) break a;
                            a[1142] = 25;
                            b = -1
                        } else b = 1;
                        return b
                    }
                    C[b | 0] = d;
                    return 1
                }

                function $d(b, d) {
                    F[0] = +b;
                    var h = q[1] | 0,
                        n = q[0] | 0,
                        m = h;
                    h = h >>> 20 & 2047;
                    if (2047 != (h | 0)) {
                        if (!h) return h = d, 0 == b ? d = 0 : (b = $d(1.8446744073709552E19 * b, d), d = a[d >> 2] + -64 | 0), a[h >> 2] =
                            d, b;
                        a[d >> 2] = h + -1022;
                        q[0] = n | 0;
                        q[1] = m & -2146435073 | 1071644672;
                        b = +F[0]
                    }
                    return b
                }

                function xc(b, d, h, n) {
                    var m = 0,
                        f, x, c, e = 0,
                        k = 0;
                    g = f = g - 80 | 0;
                    a[f + 76 >> 2] = 2246;
                    var p = f + 55 | 0,
                        l = f + 56 | 0;
                    a: {
                        b: for (;;) {
                            0 > (e | 0) || ((m | 0) > (2147483647 - e | 0) ? (a[1142] = 61, e = -1) : e = m + e | 0);
                            c: {
                                d: {
                                    e: {
                                        f: {
                                            m = c = a[f + 76 >> 2];
                                            if (x = G[m | 0])
                                                for (;;) {
                                                    g: {
                                                        var q = x & 255;h: if (q) {
                                                            if (37 != (q | 0)) break g;
                                                            for (x = m;;) {
                                                                if (37 != G[m + 1 | 0]) break h;
                                                                q = m + 2 | 0;
                                                                a[f + 76 >> 2] = q;
                                                                x = x + 1 | 0;
                                                                var r = G[m + 2 | 0];
                                                                m = q;
                                                                if (37 != (r | 0)) break
                                                            }
                                                        } else x = m;m = x - c | 0;b && M(b, c, m);
                                                        if (m) continue b;
                                                        var v = -1;q = f;x = !(10 > C[a[f +
                                                            76 >> 2] + 1 | 0] + -48 >>> 0);m = a[f + 76 >> 2];x | 36 != G[m + 2 | 0] ? x = 1 : (v = C[m + 1 | 0] + -48 | 0, k = 1, x = 3);m = x + m | 0;a[q + 76 >> 2] = m;x = 0;
                                                        var y = C[m | 0];r = y + -32 | 0;h: if (31 < r >>> 0) q = m;
                                                            else {
                                                                q = m;
                                                                var D = 1 << r;
                                                                if (D & 75913)
                                                                    for (;;) {
                                                                        q = m + 1 | 0;
                                                                        a[f + 76 >> 2] = q;
                                                                        x |= D;
                                                                        y = C[m + 1 | 0];
                                                                        r = y + -32 | 0;
                                                                        if (31 < r >>> 0) break h;
                                                                        m = q;
                                                                        D = 1 << r;
                                                                        if (!(D & 75913)) break
                                                                    }
                                                            }if (42 == (y | 0)) {
                                                            r = f;
                                                            if (10 > C[q + 1 | 0] + -48 >>> 0 && (m = a[f + 76 >> 2], 36 == G[m + 2 | 0])) {
                                                                a[((C[m + 1 | 0] << 2) + n | 0) + -192 >> 2] = 10;
                                                                var E = a[((C[m + 1 | 0] << 3) + h | 0) + -384 >> 2];
                                                                k = 1;
                                                                m = m + 3 | 0
                                                            } else {
                                                                if (k) break f;
                                                                E = k = 0;
                                                                b && (m = a[d >> 2], a[d >> 2] = m + 4, E = a[m >> 2]);
                                                                m =
                                                                    a[f + 76 >> 2] + 1 | 0
                                                            }
                                                            a[r + 76 >> 2] = m; - 1 < (E | 0) || (E = 0 - E | 0, x |= 8192)
                                                        } else {
                                                            E = ae(f + 76 | 0);
                                                            if (0 > (E | 0)) break f;
                                                            m = a[f + 76 >> 2]
                                                        }
                                                        var A = -1;
                                                        if (46 == G[m | 0])
                                                            if (42 == G[m + 1 | 0]) {
                                                                if (10 > C[m + 2 | 0] + -48 >>> 0 && (m = a[f + 76 >> 2], 36 == G[m + 3 | 0])) a[((C[m + 2 | 0] << 2) + n | 0) + -192 >> 2] = 10, A = a[((C[m + 2 | 0] << 3) + h | 0) + -384 >> 2], m = m + 4 | 0;
                                                                else {
                                                                    if (k) break f;
                                                                    b ? (m = a[d >> 2], a[d >> 2] = m + 4, q = a[m >> 2]) : q = 0;
                                                                    A = q;
                                                                    m = a[f + 76 >> 2] + 2 | 0
                                                                }
                                                                a[f + 76 >> 2] = m
                                                            } else a[f + 76 >> 2] = m + 1, A = ae(f + 76 | 0), m = a[f + 76 >> 2];
                                                        for (q = 0;;) {
                                                            D = q;
                                                            var z = -1;
                                                            if (57 < C[m | 0] + -65 >>> 0) break a;
                                                            y = m + 1 | 0;
                                                            a[f + 76 >> 2] = y;
                                                            q = C[m | 0];
                                                            m = y;
                                                            q = G[(q +
                                                                L(D, 58) | 0) + 3151 | 0];
                                                            if (!(8 > q + -1 >>> 0)) break
                                                        }
                                                        if (!q) break a;h: {
                                                            i: {
                                                                j: {
                                                                    if (19 == (q | 0)) {
                                                                        if (-1 >= (v | 0)) break j;
                                                                        break a
                                                                    }
                                                                    if (0 > (v | 0)) break i;a[(v << 2) + n >> 2] = q;q = (v << 3) + h | 0;m = a[q + 4 >> 2];a[f + 64 >> 2] = a[q >> 2];a[f + 68 >> 2] = m
                                                                }
                                                                m = 0;
                                                                if (!b) continue b;
                                                                break h
                                                            }
                                                            if (!b) break c;be(f - -64 | 0, q, d);y = a[f + 76 >> 2]
                                                        }
                                                        r = x & -65537;x = x & 8192 ? r : x;z = 0;v = 3184;q = l;h: {
                                                            i: {
                                                                j: {
                                                                    k: {
                                                                        l: {
                                                                            m: {
                                                                                n: {
                                                                                    o: {
                                                                                        p: {
                                                                                            q: {
                                                                                                r: {
                                                                                                    s: {
                                                                                                        t: {
                                                                                                            u: {
                                                                                                                v: {
                                                                                                                    m = C[y + -1 | 0];m = D ? 3 == (m & 15) ? m & -33 : m : m;
                                                                                                                    switch (m + -88 | 0) {
                                                                                                                        case 11:
                                                                                                                            break h;
                                                                                                                        case 9:
                                                                                                                        case 13:
                                                                                                                        case 14:
                                                                                                                        case 15:
                                                                                                                            break i;
                                                                                                                        case 27:
                                                                                                                            break n;
                                                                                                                        case 12:
                                                                                                                        case 17:
                                                                                                                            break q;
                                                                                                                        case 23:
                                                                                                                            break r;
                                                                                                                        case 0:
                                                                                                                        case 32:
                                                                                                                            break s;
                                                                                                                        case 24:
                                                                                                                            break t;
                                                                                                                        case 22:
                                                                                                                            break u;
                                                                                                                        case 29:
                                                                                                                            break v;
                                                                                                                        case 1:
                                                                                                                        case 2:
                                                                                                                        case 3:
                                                                                                                        case 4:
                                                                                                                        case 5:
                                                                                                                        case 6:
                                                                                                                        case 7:
                                                                                                                        case 8:
                                                                                                                        case 10:
                                                                                                                        case 16:
                                                                                                                        case 18:
                                                                                                                        case 19:
                                                                                                                        case 20:
                                                                                                                        case 21:
                                                                                                                        case 25:
                                                                                                                        case 26:
                                                                                                                        case 28:
                                                                                                                        case 30:
                                                                                                                        case 31:
                                                                                                                            break d
                                                                                                                    }
                                                                                                                    switch (m + -65 | 0) {
                                                                                                                        case 0:
                                                                                                                        case 4:
                                                                                                                        case 5:
                                                                                                                        case 6:
                                                                                                                            break i;
                                                                                                                        case 2:
                                                                                                                            break l;
                                                                                                                        case 1:
                                                                                                                        case 3:
                                                                                                                            break d
                                                                                                                    }
                                                                                                                    if (83 == (m | 0)) break m;
                                                                                                                    break e
                                                                                                                }
                                                                                                                m = a[f + 64 >> 2];q = a[f + 68 >> 2];c = 3184;
                                                                                                                break p
                                                                                                            }
                                                                                                            m = 0;u: switch (D & 255) {
                                                                                                                case 0:
                                                                                                                    a[a[f + 64 >> 2] >> 2] = e;
                                                                                                                    continue b;
                                                                                                                case 1:
                                                                                                                    a[a[f + 64 >> 2] >> 2] = e;
                                                                                                                    continue b;
                                                                                                                case 2:
                                                                                                                    q =
                                                                                                                        a[f + 64 >> 2];
                                                                                                                    a[q >> 2] = e;
                                                                                                                    a[q + 4 >> 2] = e >> 31;
                                                                                                                    continue b;
                                                                                                                case 3:
                                                                                                                    yc[a[f + 64 >> 2] >> 1] = e;
                                                                                                                    continue b;
                                                                                                                case 4:
                                                                                                                    C[a[f + 64 >> 2]] = e;
                                                                                                                    continue b;
                                                                                                                case 6:
                                                                                                                    a[a[f + 64 >> 2] >> 2] = e;
                                                                                                                    continue b;
                                                                                                                case 7:
                                                                                                                    break u;
                                                                                                                default:
                                                                                                                    continue b
                                                                                                            }
                                                                                                            q = a[f + 64 >> 2];a[q >> 2] = e;a[q + 4 >> 2] = e >> 31;
                                                                                                            continue b
                                                                                                        }
                                                                                                        A = 8 < A >>> 0 ? A : 8;x |= 8;m = 120
                                                                                                    }
                                                                                                    r = a[f + 64 >> 2];c = a[f + 68 >> 2];q = l;D = m & 32;
                                                                                                    if (r | c)
                                                                                                        for (; q = q + -1 | 0, C[q | 0] = G[(r & 15) + 3680 | 0] | D, r = (c & 15) << 28 | r >>> 4, c = c >>> 4 | 0, r | c;);c = q;
                                                                                                    if (!(x & 8) | !(a[f + 64 >> 2] | a[f + 68 >> 2])) break o;v = (m >>> 4 | 0) + 3184 | 0;z = 2;
                                                                                                    break o
                                                                                                }
                                                                                                m = a[f + 64 >> 2];r = a[f + 68 >> 2];c = l;
                                                                                                if (m | r)
                                                                                                    for (; c =
                                                                                                        c + -1 | 0, C[c | 0] = m & 7 | 48, m = (r & 7) << 29 | m >>> 3, r = r >>> 3 | 0, m | r;);
                                                                                                if (!(x & 8)) break o;m = l - c | 0;A = (A | 0) > (m | 0) ? A : m + 1 | 0;
                                                                                                break o
                                                                                            }
                                                                                            q = a[f + 68 >> 2];m = a[f + 64 >> 2]; - 1 > (q | 0) || -1 >= (q | 0) ? (q = -(q + (0 < m >>> 0) | 0) | 0, m = 0 - m | 0, a[f + 64 >> 2] = m, a[f + 68 >> 2] = q, z = 1, c = 3184) : x & 2048 ? (z = 1, c = 3185) : c = (z = x & 1) ? 3186 : 3184
                                                                                        }
                                                                                        v = c;c = hb(m, q, l)
                                                                                    }
                                                                                    x = -1 < (A | 0) ? x & -65537 : x;q = a[f + 64 >> 2];m = a[f + 68 >> 2];
                                                                                    if (!(!!(q | m) | A)) {
                                                                                        A = 0;
                                                                                        c = l;
                                                                                        break e
                                                                                    }
                                                                                    m = !(m | q) + (l - c | 0) | 0;A = (A | 0) > (m | 0) ? A : m;
                                                                                    break e
                                                                                }
                                                                                c = (m = a[f + 64 >> 2]) ? m : 3194;n: {
                                                                                    x = c;m = A;q = 0 != (m | 0);o: {
                                                                                        p: {
                                                                                            q: if (!(!m | !(x & 3)))
                                                                                                for (;;) {
                                                                                                    if (!G[x | 0]) break p;
                                                                                                    x = x + 1 | 0;
                                                                                                    m = m + -1 | 0;
                                                                                                    q = 0 != (m | 0);
                                                                                                    if (!m) break q;
                                                                                                    if (!(x & 3)) break
                                                                                                }
                                                                                            if (!q) break o
                                                                                        }
                                                                                        p: if (!(!G[x | 0] | 4 > m >>> 0))
                                                                                            for (;;) {
                                                                                                q = a[x >> 2];
                                                                                                if ((q ^ -1) & q + -16843009 & -2139062144) break p;
                                                                                                x = x + 4 | 0;
                                                                                                m = m + -4 | 0;
                                                                                                if (!(3 < m >>> 0)) break
                                                                                            }
                                                                                        if (m)
                                                                                            for (;;) {
                                                                                                if (!G[x | 0]) {
                                                                                                    m = x;
                                                                                                    break n
                                                                                                }
                                                                                                x = x + 1 | 0;
                                                                                                m = m + -1 | 0;
                                                                                                if (!m) break
                                                                                            }
                                                                                    }
                                                                                    m = 0
                                                                                }
                                                                                q = m ? m : A + c | 0;x = r;A = m ? m - c | 0 : A;
                                                                                break d
                                                                            }
                                                                            q = a[f + 64 >> 2];
                                                                            if (A) break k;m = 0;Z(b, 32, E, 0, x);
                                                                            break j
                                                                        }
                                                                        a[f + 12 >> 2] = 0;a[f + 8 >> 2] = a[f + 64 >> 2];a[f + 64 >> 2] = f + 8;A = -1;q = f + 8 | 0
                                                                    }
                                                                    m = 0;k: {
                                                                        for (;;) {
                                                                            r = a[q >> 2];
                                                                            if (!r) break k;
                                                                            c = (z = f + 4 | 0) ? Zd(z, r) : 0;
                                                                            r = 0 > (c | 0);
                                                                            if (!(r | c >>> 0 > A - m >>>
                                                                                    0)) {
                                                                                q = q + 4 | 0;
                                                                                m = m + c | 0;
                                                                                if (A >>> 0 > m >>> 0) continue;
                                                                                break k
                                                                            }
                                                                            break
                                                                        }
                                                                        z = -1;
                                                                        if (r) break a
                                                                    }
                                                                    Z(b, 32, E, m, x);
                                                                    if (m)
                                                                        for (D = 0, q = a[f + 64 >> 2];;) {
                                                                            r = a[q >> 2];
                                                                            if (!r) break j;
                                                                            r = (A = f + 4 | 0) ? Zd(A, r) : 0;
                                                                            D = r + D | 0;
                                                                            if ((D | 0) > (m | 0)) break j;
                                                                            M(b, f + 4 | 0, r);
                                                                            q = q + 4 | 0;
                                                                            if (!(D >>> 0 < m >>> 0)) break
                                                                        } else m = 0
                                                                }
                                                                Z(b, 32, E, m, x ^ 8192);m = (E | 0) > (m | 0) ? E : m;
                                                                continue b
                                                            }
                                                            m = t[86](b, u[f + 64 >> 3], E, A, x, m) | 0;
                                                            continue b
                                                        }
                                                        C[f + 55 | 0] = a[f + 64 >> 2];A = 1;c = p;x = r;
                                                        break d
                                                    }
                                                    q = m + 1 | 0;a[f + 76 >> 2] = q;x = G[m + 1 | 0];m = q
                                                }
                                            z = e;
                                            if (b) break a;
                                            if (!k) break c;
                                            for (m = 1;;) {
                                                if (b = a[(m << 2) + n >> 2]) {
                                                    be((m << 3) + h | 0, b, d);
                                                    z =
                                                        1;
                                                    m = m + 1 | 0;
                                                    if (10 != (m | 0)) continue;
                                                    break a
                                                }
                                                break
                                            }
                                            z = 1;
                                            if (10 <= m >>> 0) break a;
                                            for (;;) {
                                                if (a[(m << 2) + n >> 2]) break f;
                                                m = m + 1 | 0;
                                                if (10 == (m | 0)) break
                                            }
                                            break a
                                        }
                                        z = -1;
                                        break a
                                    }
                                    q = l
                                }
                                r = q - c | 0;q = (A | 0) < (r | 0) ? r : A;D = q + z | 0;m = (E | 0) < (D | 0) ? D : E;Z(b, 32, m, D, x);M(b, v, z);Z(b, 48, m, D, x ^ 65536);Z(b, 48, q, r, 0);M(b, c, r);Z(b, 32, m, D, x ^ 8192);
                                continue
                            }
                            break
                        }
                        z = 0
                    }
                    g = f + 80 | 0;
                    return z
                }

                function M(b, d, h) {
                    if (!(G[b | 0] & 32)) a: {
                        var n = a[b + 16 >> 2];
                        if (!n) {
                            n = G[b + 74 | 0];
                            C[b + 74 | 0] = n + -1 | n;
                            n = a[b >> 2];
                            n & 8 ? (a[b >> 2] = n | 32, n = -1) : (a[b + 4 >> 2] = 0, a[b + 8 >> 2] = 0, n = a[b + 44 >> 2], a[b + 28 >>
                                2] = n, a[b + 20 >> 2] = n, a[b + 16 >> 2] = n + a[b + 48 >> 2], n = 0);
                            if (n) break a;
                            n = a[b + 16 >> 2]
                        }
                        var m = a[b + 20 >> 2];
                        if (n - m >>> 0 < h >>> 0) t[a[b + 36 >> 2]](b, d, h) | 0;
                        else {
                            b: if (!(0 > C[b + 75 | 0])) {
                                for (n = h;;) {
                                    var f = n;
                                    if (!f) break b;
                                    n = f + -1 | 0;
                                    if (10 == G[n + d | 0]) break
                                }
                                if (t[a[b + 36 >> 2]](b, d, f) >>> 0 < f >>> 0) break a;
                                h = h - f | 0;
                                d = d + f | 0;
                                m = a[b + 20 >> 2]
                            }oa(m, d, h);a[b + 20 >> 2] += h
                        }
                    }
                }

                function ae(b) {
                    var d = 0;
                    if (10 > C[a[b >> 2]] + -48 >>> 0)
                        for (;;) {
                            var h = a[b >> 2],
                                n = C[h | 0];
                            a[b >> 2] = h + 1;
                            d = (L(d, 10) + n | 0) + -48 | 0;
                            if (!(10 > C[h + 1 | 0] + -48 >>> 0)) break
                        }
                    return d
                }

                function be(b, d, h) {
                    a: {
                        b: {
                            c: {
                                d: if (!(20 <
                                        d >>> 0)) {
                                    e: switch (d + -9 | 0) {
                                        case 0:
                                            d = a[h >> 2];
                                            a[h >> 2] = d + 4;
                                            a[b >> 2] = a[d >> 2];
                                            return;
                                        case 1:
                                            d = a[h >> 2];
                                            a[h >> 2] = d + 4;
                                            d = a[d >> 2];
                                            a[b >> 2] = d;
                                            break b;
                                        case 2:
                                            d = a[h >> 2];
                                            a[h >> 2] = d + 4;
                                            a[b >> 2] = a[d >> 2];
                                            break a;
                                        case 4:
                                            d = a[h >> 2];
                                            a[h >> 2] = d + 4;
                                            d = yc[d >> 1];
                                            a[b >> 2] = d;
                                            break b;
                                        case 5:
                                            d = a[h >> 2];
                                            a[h >> 2] = d + 4;
                                            a[b >> 2] = Te[d >> 1];
                                            break a;
                                        case 6:
                                            d = a[h >> 2];
                                            a[h >> 2] = d + 4;
                                            d = C[d | 0];
                                            a[b >> 2] = d;
                                            break b;
                                        case 7:
                                            d = a[h >> 2];
                                            a[h >> 2] = d + 4;
                                            a[b >> 2] = G[d | 0];
                                            break a;
                                        case 3:
                                        case 8:
                                            break c;
                                        case 9:
                                            break e;
                                        default:
                                            break d
                                    }
                                    t[87](b, h)
                                }return
                            }
                            d = a[h >> 2] + 7 & -8;a[h >> 2] =
                            d + 8;h = a[d + 4 >> 2];a[b >> 2] = a[d >> 2];a[b + 4 >> 2] = h;
                            return
                        }
                        a[b + 4 >> 2] = d >> 31;
                        return
                    }
                    a[b + 4 >> 2] = 0
                }

                function hb(a, d, h) {
                    var b;
                    if (1 == (d | 0) & 0 > a >>> 0 | 1 > d >>> 0) var m = a;
                    else
                        for (;;) {
                            m = ce(a, d, 10);
                            var f = b = S;
                            b = ba(m, b, 10, 0);
                            h = h + -1 | 0;
                            C[h | 0] = a - b | 48;
                            b = 9 < d >>> 0;
                            a = m;
                            d = f;
                            if (!b) break
                        }
                    if (m)
                        for (; h = h + -1 | 0, a = (m >>> 0) / 10 | 0, C[h | 0] = m - L(a, 10) | 48, d = 9 < m >>> 0, m = a, d;);
                    return h
                }

                function Z(a, d, h, n, m) {
                    var b;
                    g = b = g - 256 | 0;
                    if (!(m & 73728 | (h | 0) <= (n | 0))) {
                        h = h - n | 0;
                        n = 256 > h >>> 0;
                        Jb(b, d & 255, n ? h : 256);
                        if (!n)
                            for (; M(a, b, 256), h = h + -256 | 0, 255 < h >>> 0;);
                        M(a, b, h)
                    }
                    g = b + 256 |
                        0
                }

                function de(a) {
                    F[0] = +a;
                    a = q[1] | 0;
                    q[0] | 0;
                    S = a
                }

                function cb(b, d, h, n, m, f) {
                    if (f & 64) n = d, m = f + -64 | 0, d = m & 31, 32 <= (m & 63) >>> 0 ? (m = n << d, n = 0) : (m = (1 << d) - 1 & n >>> 32 - d | h << d, n <<= d), h = d = 0;
                    else if (f) {
                        var g = n,
                            c = f;
                        n = f & 31;
                        if (32 <= (f & 63) >>> 0) {
                            var e = g << n;
                            g = 0
                        } else e = (1 << n) - 1 & g >>> 32 - n | m << n, g <<= n;
                        n = h;
                        f = 64 - f | 0;
                        m = f & 31;
                        32 <= (f & 63) >>> 0 ? (f = 0, n = n >>> m | 0) : (f = n >>> m | 0, n = ((1 << m) - 1 & n) << 32 - m | d >>> m);
                        n |= g;
                        m = f | e;
                        f = d;
                        d = c & 31;
                        32 <= (c & 63) >>> 0 ? (e = f << d, d = 0) : (e = (1 << d) - 1 & f >>> 32 - d | h << d, d = f << d);
                        h = e
                    }
                    a[b >> 2] = d;
                    a[b + 4 >> 2] = h;
                    a[b + 8 >> 2] = n;
                    a[b + 12 >> 2] = m
                }

                function Ia(b,
                    d) {
                    var h, n = 0;
                    g = h = g - 16 | 0;
                    F[0] = +d;
                    var m = q[1] | 0,
                        f = q[0] | 0;
                    d = m & 2147483647;
                    var c = d + -1048576 | 0,
                        e = f;
                    0 > e >>> 0 && (c = c + 1 | 0);
                    if (2145386495 == (c | 0) | 2145386495 > c >>> 0) {
                        var k = e << 28;
                        c = (d & 15) << 28 | e >>> 4;
                        d = (d >>> 4 | 0) + 1006632960 | 0;
                        e = c;
                        d = 0 > e >>> 0 ? d + 1 | 0 : d
                    } else 2146435072 == (d | 0) & 0 <= e >>> 0 | 2146435072 < d >>> 0 ? (k = f << 28, d = m, e = (d & 15) << 28 | f >>> 4, d = d >>> 4 | 2147418112) : d | e ? (c = d, d = 1 == (d | 0) & 0 > e >>> 0 | 1 > d >>> 0 ? wa(f) + 32 | 0 : wa(d), cb(h, e, c, 0, 0, d + 49 | 0), n = a[h >> 2], k = a[h + 4 >> 2], e = a[h + 8 >> 2], d = a[h + 12 >> 2] ^ 65536 | 15372 - d << 16) : d = e = k = 0;
                    a[b >> 2] = n;
                    a[b + 4 >> 2] = k;
                    a[b +
                        8 >> 2] = e;
                    a[b + 12 >> 2] = m & -2147483648 | d;
                    g = h + 16 | 0
                }

                function ic(b, d, h, n, m, f) {
                    if (f & 64) h = f + -64 | 0, d = h & 31, 32 <= (h & 63) >>> 0 ? (h = 0, d = m >>> d | 0) : (h = m >>> d | 0, d = ((1 << d) - 1 & m) << 32 - d | n >>> d), m = n = 0;
                    else if (f) {
                        var g = n,
                            c = 64 - f | 0,
                            e = c & 31;
                        if (32 <= (c & 63) >>> 0) {
                            var k = g << e;
                            c = 0
                        } else k = (1 << e) - 1 & g >>> 32 - e | m << e, c = g << e;
                        g = d;
                        e = f;
                        d = e & 31;
                        32 <= (e & 63) >>> 0 ? (e = 0, d = h >>> d | 0) : (e = h >>> d | 0, d = ((1 << d) - 1 & h) << 32 - d | g >>> d);
                        d |= c;
                        h = e | k;
                        e = n;
                        n = f & 31;
                        32 <= (f & 63) >>> 0 ? (k = 0, n = m >>> n | 0) : (k = m >>> n | 0, n = ((1 << n) - 1 & m) << 32 - n | e >>> n);
                        m = k
                    }
                    a[b >> 2] = d;
                    a[b + 4 >> 2] = h;
                    a[b + 8 >> 2] = n;
                    a[b + 12 >> 2] =
                        m
                }

                function pd(b, d, h, n) {
                    var m, f;
                    g = f = g - 32 | 0;
                    var c = m = n & 2147483647;
                    m = m + -1006698496 | 0;
                    var e = h;
                    0 > h >>> 0 && (m = m + 1 | 0);
                    var k = m;
                    m = c + -1140785152 | 0;
                    0 > e >>> 0 && (m = m + 1 | 0);
                    (m | 0) == (k | 0) & h >>> 0 < e >>> 0 | k >>> 0 < m >>> 0 ? (m = n << 4 | h >>> 28, h = h << 4 | d >>> 28, d &= 268435455, 134217728 == (d | 0) & 1 <= b >>> 0 | 134217728 < d >>> 0 ? (m = m + 1073741824 | 0, b = h + 1 | 0, 1 > b >>> 0 && (m = m + 1 | 0), k = b) : (k = h, m = m - ((0 > h >>> 0) + -1073741824 | 0) | 0, b | d ^ 134217728 || (b = k + (k & 1) | 0, b >>> 0 < k >>> 0 && (m = m + 1 | 0), k = b))) : (!e & 2147418112 == (c | 0) ? b | d : !(2147418112 == (c | 0) & 0 > e >>> 0 | 2147418112 > c >>> 0)) ? (k = h << 4 | d >>>
                        28, m = (n << 4 | h >>> 28) & 524287 | 2146959360) : (k = 0, m = 2146435072, 1140785151 < c >>> 0 || (m = 0, e = c >>> 16 | 0, 15249 > e >>> 0 || (m = n & 65535 | 65536, cb(f + 16 | 0, b, d, h, m, e + -15233 | 0), ic(f, b, d, h, m, 15361 - e | 0), h = a[f + 4 >> 2], b = a[f + 8 >> 2], m = a[f + 12 >> 2] << 4 | b >>> 28, k = b << 4 | h >>> 28, b = h & 268435455, d = a[f >> 2] | 0 != (a[f + 16 >> 2] | a[f + 24 >> 2]) | 0 != (a[f + 20 >> 2] | a[f + 28 >> 2]), 134217728 == (b | 0) & 1 <= d >>> 0 | 134217728 < b >>> 0 ? (b = k + 1 | 0, 1 > b >>> 0 && (m = m + 1 | 0), k = b) : d | b ^ 134217728 || (b = k + (k & 1) | 0, b >>> 0 < k >>> 0 && (m = m + 1 | 0), k = b))));
                    g = f + 32 | 0;
                    q[0] = k | 0;
                    q[1] = n & -2147483648 | m;
                    return +F[0]
                }

                function ca(b) {
                    var d;
                    b = b ? b : 1;
                    a: {
                        for (;;) {
                            if (d = rb(b)) break a;
                            if (d = a[1159]) t[d]();
                            else break
                        }
                        Ue();U()
                    }
                    return d
                }

                function zc(b) {
                    b |= 0;
                    a[b >> 2] = 3920;
                    var d, h = a[(b + 4 | 0) >> 2] + -12 | 0,
                        n = d = h + 8 | 0;
                    d = a[d >> 2] + -1 | 0;
                    a[n >> 2] = d; - 1 >= (d | 0) && R(h);
                    return b | 0
                }

                function xa(b, d, h) {
                    if (!h) return a[b + 4 >> 2] == a[d + 4 >> 2];
                    if ((b | 0) == (d | 0)) return 1;
                    b = a[b + 4 >> 2];
                    d = a[d + 4 >> 2];
                    h = G[b | 0];
                    var n = G[d | 0];
                    a: if (!(!h | (h | 0) != (n | 0)))
                        for (;;) {
                            n = G[d + 1 | 0];
                            h = G[b + 1 | 0];
                            if (!h) break a;
                            d = d + 1 | 0;
                            b = b + 1 | 0;
                            if ((h | 0) != (n | 0)) break
                        }
                    return !(h - n | 0)
                }

                function ee(b, d, h) {
                    var n;
                    (n = a[b + 16 >> 2]) ? (d | 0) ==
                    (n | 0) ? 2 == a[b + 24 >> 2] && (a[b + 24 >> 2] = h): (C[b + 54 | 0] = 1, a[b + 24 >> 2] = 2, a[b + 36 >> 2] += 1): (a[b + 36 >> 2] = 1, a[b + 24 >> 2] = h, a[b + 16 >> 2] = d)
                }

                function fe(b, d, h, n) {
                    C[b + 53 | 0] = 1;
                    a[b + 4 >> 2] == (h | 0) && (C[b + 52 | 0] = 1, (h = a[b + 16 >> 2]) ? (d | 0) == (h | 0) ? (h = a[b + 24 >> 2], 2 == (h | 0) && (h = a[b + 24 >> 2] = n), 1 != a[b + 48 >> 2] | 1 != (h | 0) || (C[b + 54 | 0] = 1)) : (C[b + 54 | 0] = 1, a[b + 36 >> 2] += 1) : (a[b + 36 >> 2] = 1, a[b + 24 >> 2] = n, a[b + 16 >> 2] = d, 1 != (n | 0) | 1 != a[b + 48 >> 2] || (C[b + 54 | 0] = 1)))
                }

                function ge(b, d, h) {
                    1 == a[b + 28 >> 2] | a[b + 4 >> 2] != (d | 0) || (a[b + 28 >> 2] = h)
                }

                function rb(b) {
                    b |= 0;
                    var d = 0,
                        h;
                    g = h = g - 16 |
                        0;
                    a: {
                        b: {
                            c: {
                                d: {
                                    e: {
                                        f: {
                                            g: {
                                                h: {
                                                    i: {
                                                        j: {
                                                            k: {
                                                                if (244 >= b >>> 0) {
                                                                    var n = a[1160],
                                                                        m = 11 > b >>> 0 ? 16 : b + 11 & -8;
                                                                    b = m >>> 3 | 0;
                                                                    var f = n >>> b | 0;
                                                                    if (f & 3) {
                                                                        var c = b + ((f ^ -1) & 1) | 0;
                                                                        m = c << 3;
                                                                        f = a[m + 4688 >> 2];
                                                                        b = f + 8 | 0;
                                                                        var e = a[f + 8 >> 2];
                                                                        m = m + 4680 | 0;
                                                                        (e | 0) == (m | 0) ? a[1160] = da(c) & n: (a[e + 12 >> 2] = m, a[m + 8 >> 2] = e);
                                                                        c <<= 3;
                                                                        a[f + 4 >> 2] = c | 3;
                                                                        a[(f + c | 0) + 4 >> 2] |= 1;
                                                                        break a
                                                                    }
                                                                    var k = a[1162];
                                                                    if (m >>> 0 <= k >>> 0) break k;
                                                                    if (f) {
                                                                        c = 2 << b;
                                                                        b = (0 - c | c) & f << b;
                                                                        b = (0 - b & b) + -1 | 0;
                                                                        c = f = b >>> 12 & 16;
                                                                        b = b >>> f | 0;
                                                                        f = b >>> 5 & 8;
                                                                        c |= f;
                                                                        b = b >>> f | 0;
                                                                        f = b >>> 2 & 4;
                                                                        c |= f;
                                                                        b = b >>> f | 0;
                                                                        f = b >>> 1 & 2;
                                                                        c |= f;
                                                                        b = b >>> f | 0;
                                                                        f = b >>> 1 & 1;
                                                                        c = (c | f) + (b >>>
                                                                            f | 0) | 0;
                                                                        e = c << 3;
                                                                        f = a[e + 4688 >> 2];
                                                                        b = a[f + 8 >> 2];
                                                                        e = e + 4680 | 0;
                                                                        (b | 0) == (e | 0) ? (n &= da(c), a[1160] = n) : (a[b + 12 >> 2] = e, a[e + 8 >> 2] = b);
                                                                        b = f + 8 | 0;
                                                                        a[f + 4 >> 2] = m | 3;
                                                                        d = f + m | 0;
                                                                        c <<= 3;
                                                                        e = c - m | 0;
                                                                        a[d + 4 >> 2] = e | 1;
                                                                        a[f + c >> 2] = e;
                                                                        k && (m = k >>> 3 | 0, f = (m << 3) + 4680 | 0, c = a[1165], m = 1 << m, m & n ? m = a[f + 8 >> 2] : (a[1160] = m | n, m = f), a[f + 8 >> 2] = c, a[m + 12 >> 2] = c, a[c + 12 >> 2] = f, a[c + 8 >> 2] = m);
                                                                        a[1165] = d;
                                                                        a[1162] = e;
                                                                        break a
                                                                    }
                                                                    var q = a[1161];
                                                                    if (!q) break k;
                                                                    b = (q & 0 - q) + -1 | 0;
                                                                    c = f = b >>> 12 & 16;
                                                                    b = b >>> f | 0;
                                                                    f = b >>> 5 & 8;
                                                                    c |= f;
                                                                    b = b >>> f | 0;
                                                                    f = b >>> 2 & 4;
                                                                    c |= f;
                                                                    b = b >>> f | 0;
                                                                    f = b >>> 1 & 2;
                                                                    c |= f;
                                                                    b = b >>> f | 0;
                                                                    f = b >>> 1 & 1;
                                                                    f = a[((c |
                                                                        f) + (b >>> f | 0) << 2) + 4944 >> 2];
                                                                    e = (a[f + 4 >> 2] & -8) - m | 0;
                                                                    for (c = f;;) {
                                                                        if ((b = a[c + 16 >> 2]) || (b = a[c + 20 >> 2], b)) {
                                                                            d = (a[b + 4 >> 2] & -8) - m | 0;
                                                                            e = (c = d >>> 0 < e >>> 0) ? d : e;
                                                                            f = c ? b : f;
                                                                            c = b;
                                                                            continue
                                                                        }
                                                                        break
                                                                    }
                                                                    var p = a[f + 24 >> 2];
                                                                    d = a[f + 12 >> 2];
                                                                    if ((d | 0) != (f | 0)) {
                                                                        b = a[f + 8 >> 2];
                                                                        a[b + 12 >> 2] = d;
                                                                        a[d + 8 >> 2] = b;
                                                                        break b
                                                                    }
                                                                    c = f + 20 | 0;
                                                                    b = a[c >> 2];
                                                                    if (!b) {
                                                                        b = a[f + 16 >> 2];
                                                                        if (!b) break j;
                                                                        c = f + 16 | 0
                                                                    }
                                                                    for (;;) {
                                                                        var l = c;
                                                                        d = b;
                                                                        c = b + 20 | 0;
                                                                        b = a[c >> 2];
                                                                        if (!b && (c = d + 16 | 0, b = a[d + 16 >> 2], !b)) break
                                                                    }
                                                                    a[l >> 2] = 0;
                                                                    break b
                                                                }
                                                                m = -1;
                                                                if (!(4294967231 < b >>> 0) && (b = b + 11 | 0, m = b & -8, l = a[1161])) {
                                                                    c = 0 - m | 0;
                                                                    b = b >>> 8 | 0;
                                                                    k = 0;
                                                                    b && (k =
                                                                        31, 16777215 < m >>> 0 || (e = b + 1048320 >>> 16 & 8, f = b << e, b = f + 520192 >>> 16 & 4, n = f << b, f = n + 245760 >>> 16 & 2, b = (n << f >>> 15 | 0) - (f | b | e) | 0, k = (b << 1 | m >>> b + 21 & 1) + 28 | 0));
                                                                    e = a[(k << 2) + 4944 >> 2];
                                                                    l: {
                                                                        m: {
                                                                            if (e)
                                                                                for (f = m << (31 == (k | 0) ? 0 : 25 - (k >>> 1 | 0) | 0), b = 0;;) {
                                                                                    n = (a[e + 4 >> 2] & -8) - m | 0;
                                                                                    if (!(n >>> 0 >= c >>> 0 || (d = e, c = n, c))) {
                                                                                        c = 0;
                                                                                        b = e;
                                                                                        break m
                                                                                    }
                                                                                    n = a[e + 20 >> 2];
                                                                                    e = a[((f >>> 29 & 4) + e | 0) + 16 >> 2];
                                                                                    b = n ? (n | 0) == (e | 0) ? b : n : b;
                                                                                    f <<= 0 != (e | 0);
                                                                                    if (!e) break
                                                                                } else b = 0;
                                                                            if (!(b | d)) {
                                                                                b = 2 << k;
                                                                                b = (0 - b | b) & l;
                                                                                if (!b) break k;
                                                                                b = (b & 0 - b) + -1 | 0;
                                                                                e = f = b >>> 12 & 16;
                                                                                b = b >>> f | 0;
                                                                                f = b >>> 5 & 8;
                                                                                e |= f;
                                                                                b = b >>> f | 0;
                                                                                f = b >>> 2 &
                                                                                    4;
                                                                                e |= f;
                                                                                b = b >>> f | 0;
                                                                                f = b >>> 1 & 2;
                                                                                e |= f;
                                                                                b = b >>> f | 0;
                                                                                f = b >>> 1 & 1;
                                                                                b = a[((e | f) + (b >>> f | 0) << 2) + 4944 >> 2]
                                                                            }
                                                                            if (!b) break l
                                                                        }
                                                                        for (; e = (a[b + 4 >> 2] & -8) - m | 0, c = (f = e >>> 0 < c >>> 0) ? e : c, d = f ? b : d, b = (f = a[b + 16 >> 2]) ? f : a[b + 20 >> 2], b;);
                                                                    }
                                                                    if (!(!d | c >>> 0 >= a[1162] - m >>> 0)) {
                                                                        k = a[d + 24 >> 2];
                                                                        f = a[d + 12 >> 2];
                                                                        if ((d | 0) != (f | 0)) {
                                                                            b = a[d + 8 >> 2];
                                                                            a[b + 12 >> 2] = f;
                                                                            a[f + 8 >> 2] = b;
                                                                            break c
                                                                        }
                                                                        e = d + 20 | 0;
                                                                        b = a[e >> 2];
                                                                        if (!b) {
                                                                            b = a[d + 16 >> 2];
                                                                            if (!b) break i;
                                                                            e = d + 16 | 0
                                                                        }
                                                                        for (; n = e, f = b, e = b + 20 | 0, b = a[e >> 2], b || (e = f + 16 | 0, b = a[f + 16 >> 2], b););
                                                                        a[n >> 2] = 0;
                                                                        break c
                                                                    }
                                                                }
                                                            }
                                                            f = a[1162];
                                                            if (f >>> 0 >= m >>> 0) {
                                                                b = a[1165];
                                                                c = f - m | 0;
                                                                16 <=
                                                                    c >>> 0 ? (a[1162] = c, e = b + m | 0, a[1165] = e, a[e + 4 >> 2] = c | 1, a[b + f >> 2] = c, a[b + 4 >> 2] = m | 3) : (a[1165] = 0, a[1162] = 0, a[b + 4 >> 2] = f | 3, f = b + f | 0, a[f + 4 >> 2] |= 1);
                                                                b = b + 8 | 0;
                                                                break a
                                                            }
                                                            f = a[1163];
                                                            if (f >>> 0 > m >>> 0) {
                                                                f = f - m | 0;
                                                                a[1163] = f;
                                                                b = a[1166];
                                                                c = b + m | 0;
                                                                a[1166] = c;
                                                                a[c + 4 >> 2] = f | 1;
                                                                a[b + 4 >> 2] = m | 3;
                                                                b = b + 8 | 0;
                                                                break a
                                                            }
                                                            b = 0;d = m + 47 | 0;a[1278] ? c = a[1280] : (a[1281] = -1, a[1282] = -1, a[1279] = 4096, a[1280] = 4096, a[1278] = h + 12 & -16 ^ 1431655768, a[1283] = 0, a[1271] = 0, c = 4096);n = d + c | 0;l = 0 - c | 0;c = n & l;
                                                            if (c >>> 0 <= m >>> 0) break a;
                                                            if (e = a[1270])
                                                                if (k = a[1268], p = k + c | 0, p >>> 0 <= k >>> 0 | p >>> 0 > e >>>
                                                                    0) break a;
                                                            if (G[5084] & 4) break f;k: {
                                                                l: {
                                                                    if (e = a[1166])
                                                                        for (b = 5088;;) {
                                                                            k = a[b >> 2];
                                                                            if (k + a[b + 4 >> 2] >>> 0 > e >>> 0 && k >>> 0 <= e >>> 0) break l;
                                                                            b = a[b + 8 >> 2];
                                                                            if (!b) break
                                                                        }
                                                                    f = Ua(0);
                                                                    if (-1 == (f | 0)) break g;n = c;b = a[1279];e = b + -1 | 0;e & f && (n = (c - f | 0) + (f + e & 0 - b) | 0);
                                                                    if (n >>> 0 <= m >>> 0 | 2147483646 < n >>> 0) break g;
                                                                    if (b = a[1270])
                                                                        if (e = a[1268], l = e + n | 0, l >>> 0 <= e >>> 0 | l >>> 0 > b >>> 0) break g;b = Ua(n);
                                                                    if ((f | 0) != (b | 0)) break k;
                                                                    break e
                                                                }
                                                                n = l & n - f;
                                                                if (2147483646 < n >>> 0) break g;f = Ua(n);
                                                                if ((f | 0) == (a[b >> 2] + a[b + 4 >> 2] | 0)) break h;b = f
                                                            }
                                                            if (!(-1 == (b | 0) | m + 48 >>> 0 <= n >>> 0)) {
                                                                f = a[1280];
                                                                f = f + (d - n | 0) & 0 - f;
                                                                if (2147483646 < f >>> 0) {
                                                                    f = b;
                                                                    break e
                                                                }
                                                                if (-1 != (Ua(f) | 0)) {
                                                                    n = f + n | 0;
                                                                    f = b;
                                                                    break e
                                                                }
                                                                Ua(0 - n | 0);
                                                                break g
                                                            }
                                                            f = b;
                                                            if (-1 != (b | 0)) break e;
                                                            break g
                                                        }
                                                        d = 0;
                                                        break b
                                                    }
                                                    f = 0;
                                                    break c
                                                }
                                                if (-1 != (f | 0)) break e
                                            }
                                            a[1271] |= 4
                                        }
                                        if (2147483646 < c >>> 0) break d;f = Ua(c);b = Ua(0);
                                        if (f >>> 0 >= b >>> 0 | -1 == (f | 0) | -1 == (b | 0)) break d;n = b - f | 0;
                                        if (n >>> 0 <= m + 40 >>> 0) break d
                                    }
                                    b = a[1268] + n | 0;a[1268] = b;b >>> 0 > V[1269] && (a[1269] = b);e: {
                                        f: {
                                            g: {
                                                if (e = a[1166]) {
                                                    for (b = 5088;;) {
                                                        c = a[b >> 2];
                                                        d = a[b + 4 >> 2];
                                                        if ((c + d | 0) == (f | 0)) break g;
                                                        b = a[b + 8 >> 2];
                                                        if (!b) break
                                                    }
                                                    break f
                                                }
                                                b = a[1164];f >>> 0 >=
                                                b >>> 0 && b || (a[1164] = f);b = 0;a[1273] = n;a[1272] = f;a[1168] = -1;a[1169] = a[1278];
                                                for (a[1275] = 0; c = b << 3, e = c + 4680 | 0, a[c + 4688 >> 2] = e, a[c + 4692 >> 2] = e, b = b + 1 | 0, 32 != (b | 0););b = n + -40 | 0;c = f + 8 & 7 ? -8 - f & 7 : 0;e = b - c | 0;a[1163] = e;c = f + c | 0;a[1166] = c;a[c + 4 >> 2] = e | 1;a[(b + f | 0) + 4 >> 2] = 40;a[1167] = a[1282];
                                                break e
                                            }
                                            if (!(G[b + 12 | 0] & 8 | f >>> 0 <= e >>> 0 | c >>> 0 > e >>> 0)) {
                                                a[b + 4 >> 2] = d + n;
                                                b = e + 8 & 7 ? -8 - e & 7 : 0;
                                                f = b + e | 0;
                                                a[1166] = f;
                                                c = a[1163] + n | 0;
                                                b = c - b | 0;
                                                a[1163] = b;
                                                a[f + 4 >> 2] = b | 1;
                                                a[(c + e | 0) + 4 >> 2] = 40;
                                                a[1167] = a[1282];
                                                break e
                                            }
                                        }
                                        b = a[1164];f >>> 0 < b >>> 0 && (a[1164] = f);c = f + n | 0;
                                        b = 5088;f: {
                                            g: {
                                                h: {
                                                    i: {
                                                        j: {
                                                            k: {
                                                                for (;;) {
                                                                    if ((c | 0) != a[b >> 2]) {
                                                                        if (b = a[b + 8 >> 2]) continue;
                                                                        break k
                                                                    }
                                                                    break
                                                                }
                                                                if (!(G[b + 12 | 0] & 8)) break j
                                                            }
                                                            for (b = 5088;;) {
                                                                c = a[b >> 2];
                                                                if (c >>> 0 <= e >>> 0 && (d = c + a[b + 4 >> 2] | 0, d >>> 0 > e >>> 0)) break i;
                                                                b = a[b + 8 >> 2]
                                                            }
                                                        }
                                                        a[b >> 2] = f;a[b + 4 >> 2] += n;k = (f + 8 & 7 ? -8 - f & 7 : 0) + f | 0;a[k + 4 >> 2] = m | 3;f = c + (c + 8 & 7 ? -8 - c & 7 : 0) | 0;b = (f - k | 0) - m | 0;d = m + k | 0;
                                                        if ((f | 0) == (e | 0)) {
                                                            a[1166] = d;
                                                            b = a[1163] + b | 0;
                                                            a[1163] = b;
                                                            a[d + 4 >> 2] = b | 1;
                                                            break g
                                                        }
                                                        if (a[1165] == (f | 0)) {
                                                            a[1165] = d;
                                                            b = a[1162] + b | 0;
                                                            a[1162] = b;
                                                            a[d + 4 >> 2] = b | 1;
                                                            a[b + d >> 2] = b;
                                                            break g
                                                        }
                                                        c = a[f + 4 >> 2];
                                                        if (1 == (c & 3)) {
                                                            p = c &
                                                                -8;
                                                            j: if (255 >= c >>> 0) e = a[f + 8 >> 2], m = c >>> 3 | 0, c = a[f + 12 >> 2], (c | 0) == (e | 0) ? a[1160] &= da(m) : (a[e + 12 >> 2] = c, a[c + 8 >> 2] = e);
                                                                else {
                                                                    l = a[f + 24 >> 2];
                                                                    n = a[f + 12 >> 2];
                                                                    if ((n | 0) != (f | 0)) c = a[f + 8 >> 2], a[c + 12 >> 2] = n, a[n + 8 >> 2] = c;
                                                                    else if (e = f + 20 | 0, (m = a[e >> 2]) || (e = f + 16 | 0, m = a[e >> 2], m)) {
                                                                        for (; c = e, n = m, e = m + 20 | 0, m = a[e >> 2], m || (e = n + 16 | 0, m = a[n + 16 >> 2], m););
                                                                        a[c >> 2] = 0
                                                                    } else n = 0;
                                                                    if (l) {
                                                                        c = a[f + 28 >> 2];
                                                                        e = (c << 2) + 4944 | 0;
                                                                        k: {
                                                                            if (a[e >> 2] == (f | 0)) {
                                                                                if (a[e >> 2] = n) break k;
                                                                                a[1161] &= da(c);
                                                                                break j
                                                                            }
                                                                            a[l + (a[l + 16 >> 2] == (f | 0) ? 16 : 20) >> 2] = n;
                                                                            if (!n) break j
                                                                        }
                                                                        a[n + 24 >> 2] = l;
                                                                        if (c = a[f +
                                                                                16 >> 2]) a[n + 16 >> 2] = c, a[c + 24 >> 2] = n;
                                                                        if (c = a[f + 20 >> 2]) a[n + 20 >> 2] = c, a[c + 24 >> 2] = n
                                                                    }
                                                                } f = f + p | 0;
                                                            b = b + p | 0
                                                        }
                                                        a[f + 4 >> 2] &= -2;a[d + 4 >> 2] = b | 1;a[b + d >> 2] = b;
                                                        if (255 >= b >>> 0) {
                                                            f = b >>> 3 | 0;
                                                            b = (f << 3) + 4680 | 0;
                                                            c = a[1160];
                                                            f = 1 << f;
                                                            c & f ? f = a[b + 8 >> 2] : (a[1160] = f | c, f = b);
                                                            a[b + 8 >> 2] = d;
                                                            a[f + 12 >> 2] = d;
                                                            a[d + 12 >> 2] = b;
                                                            a[d + 8 >> 2] = f;
                                                            break g
                                                        }
                                                        f = b >>> 8 | 0;c = 0;f && (c = 31, 16777215 < b >>> 0 || (e = f + 1048320 >>> 16 & 8, c = f << e, f = c + 520192 >>> 16 & 4, m = c << f, c = m + 245760 >>> 16 & 2, f = (m << c >>> 15 | 0) - (c | f | e) | 0, c = (f << 1 | b >>> f + 21 & 1) + 28 | 0));f = c;a[d + 28 >> 2] = f;a[d + 16 >> 2] = 0;a[d + 20 >> 2] = 0;c = (f << 2) + 4944 |
                                                        0;e = a[1161];m = 1 << f;
                                                        if (e & m) {
                                                            e = b << (31 == (f | 0) ? 0 : 25 - (f >>> 1 | 0) | 0);
                                                            for (f = a[c >> 2];;) {
                                                                c = f;
                                                                if ((a[f + 4 >> 2] & -8) == (b | 0)) break h;
                                                                f = e >>> 29 | 0;
                                                                e <<= 1;
                                                                m = (c + (f & 4) | 0) + 16 | 0;
                                                                f = a[m >> 2];
                                                                if (!f) break
                                                            }
                                                            a[m >> 2] = d
                                                        } else a[1161] = e | m,
                                                        a[c >> 2] = d;a[d + 24 >> 2] = c;a[d + 12 >> 2] = d;a[d + 8 >> 2] = d;
                                                        break g
                                                    }
                                                    b = n + -40 | 0;c = f + 8 & 7 ? -8 - f & 7 : 0;l = b - c | 0;a[1163] = l;c = f + c | 0;a[1166] = c;a[c + 4 >> 2] = l | 1;a[(b + f | 0) + 4 >> 2] = 40;a[1167] = a[1282];b = (d + (d + -39 & 7 ? 39 - d & 7 : 0) | 0) + -47 | 0;c = b >>> 0 < e + 16 >>> 0 ? e : b;a[c + 4 >> 2] = 27;b = a[1275];a[c + 16 >> 2] = a[1274];a[c + 20 >> 2] = b;b = a[1273];a[c + 8 >> 2] = a[1272];
                                                    a[c + 12 >> 2] = b;a[1274] = c + 8;a[1273] = n;a[1272] = f;a[1275] = 0;
                                                    for (b = c + 24 | 0; a[b + 4 >> 2] = 7, f = b + 8 | 0, b = b + 4 | 0, d >>> 0 > f >>> 0;);
                                                    if ((c | 0) == (e | 0)) break e;a[c + 4 >> 2] &= -2;n = c - e | 0;a[e + 4 >> 2] = n | 1;a[c >> 2] = n;
                                                    if (255 >= n >>> 0) {
                                                        f = n >>> 3 | 0;
                                                        b = (f << 3) + 4680 | 0;
                                                        c = a[1160];
                                                        f = 1 << f;
                                                        c & f ? f = a[b + 8 >> 2] : (a[1160] = f | c, f = b);
                                                        a[b + 8 >> 2] = e;
                                                        a[f + 12 >> 2] = e;
                                                        a[e + 12 >> 2] = b;
                                                        a[e + 8 >> 2] = f;
                                                        break e
                                                    }
                                                    a[e + 16 >> 2] = 0;a[e + 20 >> 2] = 0;b = n >>> 8 | 0;f = 0;b && (f = 31, 16777215 < n >>> 0 || (c = b + 1048320 >>> 16 & 8, f = b << c, b = f + 520192 >>> 16 & 4, d = f << b, f = d + 245760 >>> 16 & 2, b = (d << f >>> 15 | 0) - (f | b | c) | 0, f = (b << 1 | n >>>
                                                        b + 21 & 1) + 28 | 0));b = f;a[e + 28 >> 2] = b;f = (b << 2) + 4944 | 0;c = a[1161];d = 1 << b;
                                                    if (c & d) {
                                                        b = n << (31 == (b | 0) ? 0 : 25 - (b >>> 1 | 0) | 0);
                                                        for (f = a[f >> 2];;) {
                                                            c = f;
                                                            if ((n | 0) == (a[f + 4 >> 2] & -8)) break f;
                                                            f = b >>> 29 | 0;
                                                            b <<= 1;
                                                            d = (c + (f & 4) | 0) + 16 | 0;
                                                            f = a[d >> 2];
                                                            if (!f) break
                                                        }
                                                        a[d >> 2] = e;
                                                        a[e + 24 >> 2] = c
                                                    } else a[1161] = c | d,
                                                    a[f >> 2] = e,
                                                    a[e + 24 >> 2] = f;a[e + 12 >> 2] = e;a[e + 8 >> 2] = e;
                                                    break e
                                                }
                                                b = a[c + 8 >> 2];a[b + 12 >> 2] = d;a[c + 8 >> 2] = d;a[d + 24 >> 2] = 0;a[d + 12 >> 2] = c;a[d + 8 >> 2] = b
                                            }
                                            b = k + 8 | 0;
                                            break a
                                        }
                                        b = a[c + 8 >> 2];a[b + 12 >> 2] = e;a[c + 8 >> 2] = e;a[e + 24 >> 2] = 0;a[e + 12 >> 2] = c;a[e + 8 >> 2] = b
                                    }
                                    b = a[1163];
                                    if (!(b >>> 0 <=
                                            m >>> 0)) {
                                        f = b - m | 0;
                                        a[1163] = f;
                                        b = a[1166];
                                        c = b + m | 0;
                                        a[1166] = c;
                                        a[c + 4 >> 2] = f | 1;
                                        a[b + 4 >> 2] = m | 3;
                                        b = b + 8 | 0;
                                        break a
                                    }
                                }
                                a[1142] = 48;b = 0;
                                break a
                            }
                            c: if (k) {
                                b = a[d + 28 >> 2];
                                e = (b << 2) + 4944 | 0;
                                d: {
                                    if (a[e >> 2] == (d | 0)) {
                                        if (a[e >> 2] = f) break d;
                                        l &= da(b);
                                        a[1161] = l;
                                        break c
                                    }
                                    a[k + (a[k + 16 >> 2] == (d | 0) ? 16 : 20) >> 2] = f;
                                    if (!f) break c
                                }
                                a[f + 24 >> 2] = k;
                                if (b = a[d + 16 >> 2]) a[f + 16 >> 2] = b, a[b + 24 >> 2] = f;
                                if (b = a[d + 20 >> 2]) a[f + 20 >> 2] = b, a[b + 24 >> 2] = f
                            }c: if (15 >= c >>> 0) b = c + m | 0, a[d + 4 >> 2] = b | 3, b = b + d | 0, a[b + 4 >> 2] |= 1;
                                else if (a[d + 4 >> 2] = m | 3, f = d + m | 0, a[f + 4 >> 2] = c | 1, a[f + c >> 2] = c, 255 >= c >>> 0) c =
                                c >>> 3 | 0,
                            b = (c << 3) + 4680 | 0,
                            e = a[1160],
                            c = 1 << c,
                            e & c ? c = a[b + 8 >> 2] : (a[1160] = c | e, c = b),
                            a[b + 8 >> 2] = f,
                            a[c + 12 >> 2] = f,
                            a[f + 12 >> 2] = b,
                            a[f + 8 >> 2] = c;
                            else {
                                b = c >>> 8 | 0;
                                e = 0;
                                b && (e = 31, 16777215 < c >>> 0 || (m = b + 1048320 >>> 16 & 8, e = b << m, b = e + 520192 >>> 16 & 4, n = e << b, e = n + 245760 >>> 16 & 2, b = (n << e >>> 15 | 0) - (e | b | m) | 0, e = (b << 1 | c >>> b + 21 & 1) + 28 | 0));
                                b = e;
                                a[f + 28 >> 2] = b;
                                a[f + 16 >> 2] = 0;
                                a[f + 20 >> 2] = 0;
                                e = (b << 2) + 4944 | 0;
                                d: {
                                    m = 1 << b;
                                    if (m & l) {
                                        b = c << (31 == (b | 0) ? 0 : 25 - (b >>> 1 | 0) | 0);
                                        for (m = a[e >> 2];;) {
                                            e = m;
                                            if ((a[e + 4 >> 2] & -8) == (c | 0)) break d;
                                            m = b >>> 29 | 0;
                                            b <<= 1;
                                            n = (e + (m & 4) | 0) + 16 | 0;
                                            m = a[n >> 2];
                                            if (!m) break
                                        }
                                        a[n >> 2] = f
                                    } else a[1161] = m | l,
                                    a[e >> 2] = f;a[f + 24 >> 2] = e;a[f + 12 >> 2] = f;a[f + 8 >> 2] = f;
                                    break c
                                }
                                b = a[e + 8 >> 2];
                                a[b + 12 >> 2] = f;
                                a[e + 8 >> 2] = f;
                                a[f + 24 >> 2] = 0;
                                a[f + 12 >> 2] = e;
                                a[f + 8 >> 2] = b
                            }
                            b = d + 8 | 0;
                            break a
                        }
                        b: if (p) {
                            b = a[f + 28 >> 2];
                            c = (b << 2) + 4944 | 0;
                            c: {
                                if (a[c >> 2] == (f | 0)) {
                                    if (a[c >> 2] = d) break c;
                                    a[1161] = da(b) & q;
                                    break b
                                }
                                a[(a[p + 16 >> 2] == (f | 0) ? 16 : 20) + p >> 2] = d;
                                if (!d) break b
                            }
                            a[d + 24 >> 2] = p;
                            if (b = a[f + 16 >> 2]) a[d + 16 >> 2] = b, a[b + 24 >> 2] = d;
                            if (b = a[f + 20 >> 2]) a[d + 20 >> 2] = b, a[b + 24 >> 2] = d
                        }15 >= e >>> 0 ? (b = e + m | 0, a[f + 4 >> 2] = b | 3, b = b + f | 0, a[b + 4 >> 2] |= 1) : (a[f + 4 >> 2] =
                            m | 3, m = f + m | 0, a[m + 4 >> 2] = e | 1, a[e + m >> 2] = e, k && (d = k >>> 3 | 0, b = (d << 3) + 4680 | 0, c = a[1165], d = 1 << d, d & n ? n = a[b + 8 >> 2] : (a[1160] = d | n, n = b), a[b + 8 >> 2] = c, a[n + 12 >> 2] = c, a[c + 12 >> 2] = b, a[c + 8 >> 2] = n), a[1165] = m, a[1162] = e);b = f + 8 | 0
                    }
                    g = h + 16 | 0;
                    return b | 0
                }

                function R(b) {
                    b |= 0;
                    a: if (b) {
                        var d = b + -8 | 0,
                            h = a[b + -4 >> 2];
                        b = h & -8;
                        var n = d + b | 0;
                        b: if (!(h & 1)) {
                            if (!(h & 3)) break a;
                            h = a[d >> 2];
                            d = d - h | 0;
                            if (d >>> 0 < V[1164]) break a;
                            b = b + h | 0;
                            if (a[1165] != (d | 0))
                                if (255 >= h >>> 0) {
                                    var c = a[d + 8 >> 2];
                                    h = h >>> 3 | 0;
                                    var f = a[d + 12 >> 2];
                                    (f | 0) == (c | 0) ? a[1160] &= da(h): (a[c + 12 >> 2] = f, a[f + 8 >> 2] =
                                        c)
                                } else {
                                    var e = a[d + 24 >> 2];
                                    h = a[d + 12 >> 2];
                                    if ((h | 0) != (d | 0)) f = a[d + 8 >> 2], a[f + 12 >> 2] = h, a[h + 8 >> 2] = f;
                                    else if (c = d + 20 | 0, (f = a[c >> 2]) || (c = d + 16 | 0, f = a[c >> 2], f)) {
                                        for (;;) {
                                            var g = c;
                                            h = f;
                                            c = h + 20 | 0;
                                            f = a[c >> 2];
                                            if (!f && (c = h + 16 | 0, f = a[h + 16 >> 2], !f)) break
                                        }
                                        a[g >> 2] = 0
                                    } else h = 0;
                                    if (e) {
                                        c = a[d + 28 >> 2];
                                        f = (c << 2) + 4944 | 0;
                                        c: {
                                            if (a[f >> 2] == (d | 0)) {
                                                if (a[f >> 2] = h) break c;
                                                a[1161] &= da(c);
                                                break b
                                            }
                                            a[e + (a[e + 16 >> 2] == (d | 0) ? 16 : 20) >> 2] = h;
                                            if (!h) break b
                                        }
                                        a[h + 24 >> 2] = e;
                                        if (f = a[d + 16 >> 2]) a[h + 16 >> 2] = f, a[f + 24 >> 2] = h;
                                        if (f = a[d + 20 >> 2]) a[h + 20 >> 2] = f, a[f + 24 >> 2] = h
                                    }
                                }
                            else if (h =
                                a[n + 4 >> 2], 3 == (h & 3)) {
                                a[1162] = b;
                                a[n + 4 >> 2] = h & -2;
                                a[d + 4 >> 2] = b | 1;
                                a[b + d >> 2] = b;
                                return
                            }
                        }
                        if (!(n >>> 0 <= d >>> 0) && (h = a[n + 4 >> 2], h & 1)) {
                            b: {
                                if (!(h & 2)) {
                                    if ((n | 0) == a[1166]) {
                                        a[1166] = d;
                                        b = a[1163] + b | 0;
                                        a[1163] = b;
                                        a[d + 4 >> 2] = b | 1;
                                        if (a[1165] != (d | 0)) break a;
                                        a[1162] = 0;
                                        a[1165] = 0;
                                        return
                                    }
                                    if ((n | 0) == a[1165]) {
                                        a[1165] = d;
                                        b = a[1162] + b | 0;
                                        a[1162] = b;
                                        a[d + 4 >> 2] = b | 1;
                                        a[b + d >> 2] = b;
                                        return
                                    }
                                    b = (h & -8) + b | 0;
                                    c: if (255 >= h >>> 0) f = a[n + 8 >> 2], c = a[n + 12 >> 2], (f | 0) == (c | 0) ? a[1160] &= da(h >>> 3 | 0) : (a[f + 12 >> 2] = c, a[c + 8 >> 2] = f);
                                        else {
                                            e = a[n + 24 >> 2];
                                            h = a[n + 12 >> 2];
                                            if ((n | 0) != (h | 0)) f =
                                                a[n + 8 >> 2], a[f + 12 >> 2] = h, a[h + 8 >> 2] = f;
                                            else if (c = n + 20 | 0, (f = a[c >> 2]) || (c = n + 16 | 0, f = a[c >> 2], f)) {
                                                for (; g = c, h = f, c = h + 20 | 0, f = a[c >> 2], f || (c = h + 16 | 0, f = a[h + 16 >> 2], f););
                                                a[g >> 2] = 0
                                            } else h = 0;
                                            if (e) {
                                                c = a[n + 28 >> 2];
                                                f = (c << 2) + 4944 | 0;
                                                d: {
                                                    if ((n | 0) == a[f >> 2]) {
                                                        if (a[f >> 2] = h) break d;
                                                        a[1161] &= da(c);
                                                        break c
                                                    }
                                                    a[e + ((n | 0) == a[e + 16 >> 2] ? 16 : 20) >> 2] = h;
                                                    if (!h) break c
                                                }
                                                a[h + 24 >> 2] = e;
                                                if (f = a[n + 16 >> 2]) a[h + 16 >> 2] = f, a[f + 24 >> 2] = h;
                                                if (f = a[n + 20 >> 2]) a[h + 20 >> 2] = f, a[f + 24 >> 2] = h
                                            }
                                        } a[d + 4 >> 2] = b | 1;
                                    a[b + d >> 2] = b;
                                    if (a[1165] != (d | 0)) break b;
                                    a[1162] = b;
                                    return
                                }
                                a[n + 4 >> 2] = h &
                                -2;a[d + 4 >> 2] = b | 1;a[b + d >> 2] = b
                            }
                            if (255 >= b >>> 0) b = b >>> 3 | 0,
                            h = (b << 3) + 4680 | 0,
                            f = a[1160],
                            b = 1 << b,
                            f & b ? b = a[h + 8 >> 2] : (a[1160] = b | f, b = h),
                            a[h + 8 >> 2] = d,
                            a[b + 12 >> 2] = d,
                            a[d + 12 >> 2] = h,
                            a[d + 8 >> 2] = b;
                            else {
                                a[d + 16 >> 2] = 0;
                                a[d + 20 >> 2] = 0;
                                c = b >>> 8 | 0;
                                f = 0;
                                c && (f = 31, 16777215 < b >>> 0 || (h = c, c = c + 1048320 >>> 16 & 8, f = h << c, e = f + 520192 >>> 16 & 4, f <<= e, g = f + 245760 >>> 16 & 2, f = (f << g >>> 15 | 0) - (g | c | e) | 0, f = (f << 1 | b >>> f + 21 & 1) + 28 | 0));
                                a[d + 28 >> 2] = f;
                                g = (f << 2) + 4944 | 0;
                                b: {
                                    c: {
                                        c = a[1161];h = 1 << f;
                                        if (c & h) {
                                            c = b << (31 == (f | 0) ? 0 : 25 - (f >>> 1 | 0) | 0);
                                            for (h = a[g >> 2];;) {
                                                f = h;
                                                if ((a[h + 4 >> 2] & -8) == (b |
                                                        0)) break c;
                                                h = c >>> 29 | 0;
                                                c <<= 1;
                                                g = (f + (h & 4) | 0) + 16 | 0;
                                                h = a[g >> 2];
                                                if (!h) break
                                            }
                                            a[g >> 2] = d;
                                            a[d + 24 >> 2] = f
                                        } else a[1161] = h | c,
                                        a[g >> 2] = d,
                                        a[d + 24 >> 2] = g;a[d + 12 >> 2] = d;a[d + 8 >> 2] = d;
                                        break b
                                    }
                                    b = a[f + 8 >> 2];a[b + 12 >> 2] = d;a[f + 8 >> 2] = d;a[d + 24 >> 2] = 0;a[d + 12 >> 2] = f;a[d + 8 >> 2] = b
                                }
                                b = a[1168] + -1 | 0;
                                a[1168] = b;
                                if (!b) {
                                    for (d = 5096; b = a[d >> 2], d = b + 8 | 0, b;);
                                    a[1168] = -1
                                }
                            }
                        }
                    }
                }

                function Ne(b, d) {
                    var h = 16,
                        c = 16 < b >>> 0 ? b : 16;
                    if (c + -1 & c)
                        for (; b = h, h = b << 1, b >>> 0 < c >>> 0;);
                    else b = c;
                    if (-64 - b >>> 0 <= d >>> 0) return a[1142] = 48, 0;
                    c = 11 > d >>> 0 ? 16 : d + 11 & -8;
                    h = rb((c + b | 0) + 12 | 0);
                    if (!h) return 0;
                    d = h + -8 | 0;
                    if (h & b + -1) {
                        var e = h + -4 | 0,
                            f = a[e >> 2];
                        h = ((b + h | 0) + -1 & 0 - b) + -8 | 0;
                        b = 15 < h - d >>> 0 ? h : b + h | 0;
                        h = b - d | 0;
                        var g = (f & -8) - h | 0;
                        f & 3 ? (a[b + 4 >> 2] = g | a[b + 4 >> 2] & 1 | 2, g = b + g | 0, a[g + 4 >> 2] |= 1, a[e >> 2] = h | a[e >> 2] & 1 | 2, a[b + 4 >> 2] |= 1, he(d, h)) : (d = a[d >> 2], a[b + 4 >> 2] = g, a[b >> 2] = d + h)
                    } else b = d;
                    d = a[b + 4 >> 2];
                    d & 3 && (h = d & -8, h >>> 0 <= c + 16 >>> 0 || (a[b + 4 >> 2] = c | d & 1 | 2, d = b + c | 0, c = h - c | 0, a[d + 4 >> 2] = c | 3, h = b + h | 0, a[h + 4 >> 2] |= 1, he(d, c)));
                    return b + 8 | 0
                }

                function he(b, d) {
                    var h = b + d | 0;
                    a: {
                        b: {
                            var c = a[b + 4 >> 2];
                            if (!(c & 1)) {
                                if (!(c & 3)) break a;
                                c = a[b >> 2];
                                d = c + d | 0;
                                b = b - c | 0;
                                if ((b |
                                        0) != a[1165])
                                    if (255 >= c >>> 0) {
                                        var e = c >>> 3 | 0;
                                        c = a[b + 8 >> 2];
                                        var f = a[b + 12 >> 2];
                                        (f | 0) == (c | 0) ? a[1160] &= da(e): (a[c + 12 >> 2] = f, a[f + 8 >> 2] = c)
                                    } else {
                                        var g = a[b + 24 >> 2];
                                        c = a[b + 12 >> 2];
                                        if ((c | 0) != (b | 0)) f = a[b + 8 >> 2], a[f + 12 >> 2] = c, a[c + 8 >> 2] = f;
                                        else if (f = b + 20 | 0, (e = a[f >> 2]) || (f = b + 16 | 0, e = a[f >> 2], e)) {
                                            for (;;) {
                                                var k = f;
                                                c = e;
                                                f = c + 20 | 0;
                                                e = a[f >> 2];
                                                if (!e && (f = c + 16 | 0, e = a[c + 16 >> 2], !e)) break
                                            }
                                            a[k >> 2] = 0
                                        } else c = 0;
                                        if (g) {
                                            f = a[b + 28 >> 2];
                                            e = (f << 2) + 4944 | 0;
                                            c: {
                                                if (a[e >> 2] == (b | 0)) {
                                                    if (a[e >> 2] = c) break c;
                                                    a[1161] &= da(f);
                                                    break b
                                                }
                                                a[g + (a[g + 16 >> 2] == (b | 0) ? 16 : 20) >> 2] = c;
                                                if (!c) break b
                                            }
                                            a[c + 24 >> 2] = g;
                                            if (f = a[b + 16 >> 2]) a[c + 16 >> 2] = f, a[f + 24 >> 2] = c;
                                            if (f = a[b + 20 >> 2]) a[c + 20 >> 2] = f, a[f + 24 >> 2] = c
                                        }
                                    }
                                else if (c = a[h + 4 >> 2], 3 == (c & 3)) {
                                    a[1162] = d;
                                    a[h + 4 >> 2] = c & -2;
                                    a[b + 4 >> 2] = d | 1;
                                    a[h >> 2] = d;
                                    return
                                }
                            }
                        }
                        c = a[h + 4 >> 2];b: {
                            if (!(c & 2)) {
                                if ((h | 0) == a[1166]) {
                                    a[1166] = b;
                                    d = a[1163] + d | 0;
                                    a[1163] = d;
                                    a[b + 4 >> 2] = d | 1;
                                    if (a[1165] != (b | 0)) break a;
                                    a[1162] = 0;
                                    a[1165] = 0;
                                    return
                                }
                                if ((h | 0) == a[1165]) {
                                    a[1165] = b;
                                    d = a[1162] + d | 0;
                                    a[1162] = d;
                                    a[b + 4 >> 2] = d | 1;
                                    a[b + d >> 2] = d;
                                    return
                                }
                                d = (c & -8) + d | 0;
                                c: if (255 >= c >>> 0) e = c >>> 3 | 0, c = a[h + 8 >> 2], f = a[h + 12 >> 2], (c | 0) ==
                                        (f | 0) ? a[1160] &= da(e) : (a[c + 12 >> 2] = f, a[f + 8 >> 2] = c);
                                    else {
                                        g = a[h + 24 >> 2];
                                        c = a[h + 12 >> 2];
                                        if ((h | 0) != (c | 0)) f = a[h + 8 >> 2], a[f + 12 >> 2] = c, a[c + 8 >> 2] = f;
                                        else if (f = h + 20 | 0, (e = a[f >> 2]) || (f = h + 16 | 0, e = a[f >> 2], e)) {
                                            for (; k = f, c = e, f = c + 20 | 0, e = a[f >> 2], e || (f = c + 16 | 0, e = a[c + 16 >> 2], e););
                                            a[k >> 2] = 0
                                        } else c = 0;
                                        if (g) {
                                            f = a[h + 28 >> 2];
                                            e = (f << 2) + 4944 | 0;
                                            d: {
                                                if ((h | 0) == a[e >> 2]) {
                                                    if (a[e >> 2] = c) break d;
                                                    a[1161] &= da(f);
                                                    break c
                                                }
                                                a[g + ((h | 0) == a[g + 16 >> 2] ? 16 : 20) >> 2] = c;
                                                if (!c) break c
                                            }
                                            a[c + 24 >> 2] = g;
                                            if (f = a[h + 16 >> 2]) a[c + 16 >> 2] = f, a[f + 24 >> 2] = c;
                                            if (f = a[h + 20 >> 2]) a[c + 20 >> 2] =
                                                f, a[f + 24 >> 2] = c
                                        }
                                    } a[b + 4 >> 2] = d | 1;
                                a[b + d >> 2] = d;
                                if (a[1165] != (b | 0)) break b;
                                a[1162] = d;
                                return
                            }
                            a[h + 4 >> 2] = c & -2;a[b + 4 >> 2] = d | 1;a[b + d >> 2] = d
                        }
                        if (255 >= d >>> 0) c = d >>> 3 | 0,
                        d = (c << 3) + 4680 | 0,
                        f = a[1160],
                        c = 1 << c,
                        f & c ? c = a[d + 8 >> 2] : (a[1160] = c | f, c = d),
                        a[d + 8 >> 2] = b,
                        a[c + 12 >> 2] = b,
                        a[b + 12 >> 2] = d,
                        a[b + 8 >> 2] = c;
                        else {
                            a[b + 16 >> 2] = 0;
                            a[b + 20 >> 2] = 0;
                            e = d >>> 8 | 0;
                            c = 0;
                            e && (c = 31, 16777215 < d >>> 0 || (k = e + 1048320 >>> 16 & 8, e <<= k, c = e + 520192 >>> 16 & 4, h = e << c, e = h + 245760 >>> 16 & 2, c = (h << e >>> 15 | 0) - (e | c | k) | 0, c = (c << 1 | d >>> c + 21 & 1) + 28 | 0));
                            a[b + 28 >> 2] = c;
                            e = (c << 2) + 4944 | 0;
                            b: {
                                f = a[1161];
                                k = 1 << c;
                                if (f & k) {
                                    f = d << (31 == (c | 0) ? 0 : 25 - (c >>> 1 | 0) | 0);
                                    for (c = a[e >> 2];;) {
                                        e = c;
                                        if ((a[c + 4 >> 2] & -8) == (d | 0)) break b;
                                        c = f >>> 29 | 0;
                                        f <<= 1;
                                        k = (e + (c & 4) | 0) + 16 | 0;
                                        c = a[k >> 2];
                                        if (!c) break
                                    }
                                    a[k >> 2] = b
                                } else a[1161] = f | k,
                                a[e >> 2] = b;a[b + 24 >> 2] = e;a[b + 12 >> 2] = b;a[b + 8 >> 2] = b;
                                return
                            }
                            d = a[e + 8 >> 2];
                            a[d + 12 >> 2] = b;
                            a[e + 8 >> 2] = b;
                            a[b + 24 >> 2] = 0;
                            a[b + 12 >> 2] = e;
                            a[b + 8 >> 2] = d
                        }
                    }
                }

                function Ua(b) {
                    var d = a[1288],
                        c = b + 3 & -4;
                    b = d + c | 0;
                    if (!(b >>> 0 <= d >>> 0 && 1 <= (c | 0) || b >>> 0 > (p.byteLength / 65536 | 0) << 16 >>> 0 && !Ve(b | 0))) return a[1288] = b, d;
                    a[1142] = 48;
                    return -1
                }

                function oa(b, d, c) {
                    if (512 <=
                        c >>> 0) return We(b | 0, d | 0, c | 0) | 0, b;
                    var h = b + c | 0;
                    if ((b ^ d) & 3)
                        if (4 > h >>> 0) c = b;
                        else {
                            var e = h + -4 | 0;
                            if (e >>> 0 < b >>> 0) c = b;
                            else
                                for (c = b; C[c | 0] = G[d | 0], C[c + 1 | 0] = G[d + 1 | 0], C[c + 2 | 0] = G[d + 2 | 0], C[c + 3 | 0] = G[d + 3 | 0], d = d + 4 | 0, c = c + 4 | 0, c >>> 0 <= e >>> 0;);
                        }
                    else {
                        a: if (1 > (c | 0)) c = b;
                            else if (b & 3)
                            for (c = b;;) {
                                C[c | 0] = G[d | 0];
                                d = d + 1 | 0;
                                c = c + 1 | 0;
                                if (c >>> 0 >= h >>> 0) break a;
                                if (!(c & 3)) break
                            } else c = b;e = h & -4;
                        if (!(64 > e >>> 0)) {
                            var f = e + -64 | 0;
                            if (!(c >>> 0 > f >>> 0))
                                for (; a[c >> 2] = a[d >> 2], a[c + 4 >> 2] = a[d + 4 >> 2], a[c + 8 >> 2] = a[d + 8 >> 2], a[c + 12 >> 2] = a[d + 12 >> 2], a[c + 16 >> 2] = a[d + 16 >>
                                        2], a[c + 20 >> 2] = a[d + 20 >> 2], a[c + 24 >> 2] = a[d + 24 >> 2], a[c + 28 >> 2] = a[d + 28 >> 2], a[c + 32 >> 2] = a[d + 32 >> 2], a[c + 36 >> 2] = a[d + 36 >> 2], a[c + 40 >> 2] = a[d + 40 >> 2], a[c + 44 >> 2] = a[d + 44 >> 2], a[c + 48 >> 2] = a[d + 48 >> 2], a[c + 52 >> 2] = a[d + 52 >> 2], a[c + 56 >> 2] = a[d + 56 >> 2], a[c + 60 >> 2] = a[d + 60 >> 2], d = d - -64 | 0, c = c - -64 | 0, c >>> 0 <= f >>> 0;);
                        }
                        if (!(c >>> 0 >= e >>> 0))
                            for (; a[c >> 2] = a[d >> 2], d = d + 4 | 0, c = c + 4 | 0, c >>> 0 < e >>> 0;);
                    }
                    if (c >>> 0 < h >>> 0)
                        for (; C[c | 0] = G[d | 0], d = d + 1 | 0, c = c + 1 | 0, (h | 0) != (c | 0););
                    return b
                }

                function Jb(b, d, c) {
                    if (c) {
                        var h = b + c | 0;
                        C[h + -1 | 0] = d;
                        C[b | 0] = d;
                        if (!(3 > c >>> 0 || (C[h +
                                -2 | 0] = d, C[b + 1 | 0] = d, C[h + -3 | 0] = d, C[b + 2 | 0] = d, 7 > c >>> 0 || (C[h + -4 | 0] = d, C[b + 3 | 0] = d, 9 > c >>> 0)))) {
                            h = 0 - b & 3;
                            var e = h + b | 0;
                            b = L(d & 255, 16843009);
                            a[e >> 2] = b;
                            c = c - h & -4;
                            d = c + e | 0;
                            a[d + -4 >> 2] = b;
                            if (!(9 > c >>> 0 || (a[e + 8 >> 2] = b, a[e + 4 >> 2] = b, a[d + -8 >> 2] = b, a[d + -12 >> 2] = b, 25 > c >>> 0 || (a[e + 24 >> 2] = b, a[e + 20 >> 2] = b, a[e + 16 >> 2] = b, a[e + 12 >> 2] = b, a[d + -16 >> 2] = b, a[d + -20 >> 2] = b, a[d + -24 >> 2] = b, a[d + -28 >> 2] = b, d = e & 4 | 24, c = c - d | 0, 32 > c >>> 0))))
                                for (h = b, d = d + e | 0; a[d + 24 >> 2] = b, a[d + 28 >> 2] = h, a[d + 16 >> 2] = b, a[d + 20 >> 2] = h, a[d + 8 >> 2] = b, a[d + 12 >> 2] = h, a[d >> 2] = b, a[d + 4 >> 2] = h, d = d + 32 |
                                    0, c = c + -32 | 0, 31 < c >>> 0;);
                        }
                    }
                }

                function Cd(b) {
                    a: {
                        b: {
                            var d = b;
                            if (d & 3) {
                                if (!G[b | 0]) return 0;
                                for (;;) {
                                    d = d + 1 | 0;
                                    if (!(d & 3)) break b;
                                    if (!G[d | 0]) break
                                }
                                break a
                            }
                        }
                        for (;;) {
                            var c = d;
                            d = d + 4 | 0;
                            var e = a[c >> 2];
                            if ((e ^ -1) & e + -16843009 & -2139062144) break
                        }
                        if (!(e & 255)) return c - b | 0;
                        for (; e = G[c + 1 | 0], c = d = c + 1 | 0, e;);
                    }
                    return d - b | 0
                }

                function ce(a, d, c) {
                    var b, h = 0,
                        e = 0;
                    a: {
                        b: {
                            c: {
                                d: {
                                    e: {
                                        f: {
                                            g: {
                                                h: {
                                                    i: {
                                                        if (b = d) {
                                                            var g = c;
                                                            if (!g) break i;
                                                            break h
                                                        }
                                                        S = 0;
                                                        return (a >>> 0) / (c >>> 0) | 0
                                                    }
                                                    if (!a) break g;
                                                    break f
                                                }
                                                if (!(g + -1 & g)) break e;
                                                var k = (wa(g) + 33 | 0) - wa(b) | 0,
                                                    q = 0 - k | 0;
                                                break c
                                            }
                                            S =
                                            0;
                                            return (b >>> 0) / 0 | 0
                                        }
                                        g = 32 - wa(b) | 0;
                                        if (31 > g >>> 0) break d;
                                        break b
                                    }
                                    if (1 == (g | 0)) break a;g = g ? 31 - wa(g + -1 ^ g) | 0 : 32;c = g & 31;32 <= (g & 63) >>> 0 ? (b = 0, a = d >>> c | 0) : (b = d >>> c | 0, a = ((1 << c) - 1 & d) << 32 - c | a >>> c);S = b;
                                    return a
                                }
                                k = g + 1 | 0;q = 63 - g | 0
                            }
                            g = d;b = k & 63;
                            var p = b & 31;32 <= b >>> 0 ? (b = 0, p = g >>> p | 0) : (b = g >>> p | 0, p = ((1 << p) - 1 & g) << 32 - p | a >>> p);q &= 63;g = q & 31;32 <= q >>> 0 ? (d = a << g, a = 0) : (d = (1 << g) - 1 & a >>> 32 - g | d << g, a <<= g);
                            if (k)
                                for (g = -1, q = c + -1 | 0, -1 != (q | 0) && (g = 0);;) {
                                    var l = h = p << 1 | d >>> 31;
                                    b = b << 1 | p >>> 31;
                                    h = g - (b + (q >>> 0 < h >>> 0) | 0) >> 31;
                                    var r = c & h;
                                    p = l - r | 0;
                                    b = b - (l >>> 0 <
                                        r >>> 0) | 0;
                                    d = d << 1 | a >>> 31;
                                    a = e | a << 1;
                                    e = h &= 1;
                                    k = k + -1 | 0;
                                    if (!k) break
                                }
                            S = d << 1 | a >>> 31;
                            return h | a << 1
                        }
                        d = a = 0
                    }
                    S = d;
                    return a
                }

                function ba(a, d, c, e) {
                    var b = c >>> 16 | 0,
                        h = a >>> 16 | 0,
                        n = L(b, h),
                        g = c & 65535,
                        k = a & 65535,
                        q = L(g, k);
                    h = (q >>> 16 | 0) + L(h, g) | 0;
                    b = (h & 65535) + L(b, k) | 0;
                    S = (L(d, c) + n | 0) + L(a, e) + (h >>> 16) + (b >>> 16) | 0;
                    return q & 65535 | b << 16
                }

                function da(a) {
                    var b = a & 31;
                    a = 0 - a & 31;
                    return (-1 >>> b & -2) << b | (-1 << a & -2) >>> a
                }
                var t = k,
                    C = new c.Int8Array(p),
                    yc = new c.Int16Array(p),
                    a = new c.Int32Array(p),
                    G = new c.Uint8Array(p),
                    Te = new c.Uint16Array(p),
                    V = new c.Uint32Array(p),
                    Kb = new c.Float32Array(p),
                    u = new c.Float64Array(p),
                    L = c.Math.imul,
                    Lb = c.Math.fround,
                    Hb = c.Math.abs,
                    wa = c.Math.clz32,
                    Xe = c.Math.ceil,
                    hc = c.Math.sqrt,
                    U = e.abort,
                    Cb = e.__assert_fail,
                    Bd = e.__cxa_allocate_exception,
                    Dd = e.__cxa_throw,
                    Ac = e._embind_register_class,
                    Oe = e._embind_register_function,
                    Ye = e._embind_register_value_object,
                    Pe = e._embind_register_value_object_field,
                    Ze = e._embind_finalize_value_object,
                    ie = e._embind_register_class_constructor,
                    ha = e._embind_register_class_function,
                    $e = e._emval_incref,
                    af = e._emval_decref,
                    bf = e._emval_take_value,
                    Qe = e._embind_register_void,
                    Re = e._embind_register_bool,
                    Sd = e._embind_register_std_string,
                    wc = e._embind_register_std_wstring,
                    Se = e._embind_register_emval,
                    Ba = e._embind_register_integer,
                    Rd = e._embind_register_float,
                    la = e._embind_register_memory_view,
                    Ue = e.abort,
                    Ve = e.emscripten_resize_heap,
                    We = e.emscripten_memcpy_big,
                    g = 5248192,
                    S = 0;
                t[1] = function() {
                    var b = a[1130] + 1 | 0;
                    a[1130] = b;
                    return b | 0
                };
                t[2] = zc;
                t[3] = r;
                t[4] = Ed;
                t[5] = function(a) {
                    R(Ed(a | 0))
                };
                t[6] = function(a, d) {
                    a |= 0;
                    d |= 0;
                    Db(a + 8 | 0, d);
                    fa(a + 56 |
                        0, d)
                };
                t[7] = r;
                t[8] = sb;
                t[9] = function() {
                    U()
                };
                t[10] = r;
                t[11] = Ka;
                t[12] = function(b) {
                    var d;
                    g = d = g - 32 | 0;
                    var c = (b | 0) + 4 | 0,
                        e = d + 8 | 0;
                    b = db(12, 4);
                    var m = fd(d, d + 24 | 0, 1),
                        f;
                    g = f = g - 16 | 0;
                    a[f + 12 >> 2] = b;
                    Ab(e, f + 12 | 0);
                    b = a[m + 4 >> 2];
                    var k = e + 4 | 0;
                    a[k >> 2] = a[m >> 2];
                    a[k + 4 >> 2] = b;
                    g = f + 16 | 0;
                    b = e;
                    e = a[b >> 2];
                    a[e >> 2] = 1460;
                    a[e >> 2] = 1424;
                    Zb(e + 4 | 0, kc(c), $b(d));
                    e = Za(b);
                    c = b;
                    b = a[c >> 2];
                    a[c >> 2] = 0;
                    b && (a[(c + 4 | 0) >> 2], R(b));
                    g = d + 32 | 0;
                    return e | 0
                };
                t[13] = function(b, d) {
                    d |= 0;
                    a[d >> 2] = 1460;
                    a[d >> 2] = 1424;
                    b = (b | 0) + 4 | 0;
                    Zb(d + 4 | 0, kc(b), kc(b))
                };
                t[14] = fb;
                t[15] = function(a) {
                    var b;
                    g = b = g - 16 | 0;
                    R(a | 0);
                    g = b + 16 | 0
                };
                t[16] = function(b) {
                    var d;
                    g = d = g - 16 | 0;
                    b = t[a[(b | 0) + 4 >> 2]]() | 0;
                    g = d + 16 | 0;
                    return b | 0
                };
                t[17] = sb;
                t[18] = r;
                t[19] = Ka;
                t[20] = function(b) {
                    b |= 0;
                    var d;
                    g = d = g - 32 | 0;
                    var c = oc(d + 8 | 0, db(8, 4), nc(d, d + 24 | 0));
                    lc(a[c >> 2], b + 4 | 0, d);
                    b = Za(c);
                    qc(c);
                    g = d + 32 | 0;
                    return b | 0
                };
                t[21] = function(a, d) {
                    a = (a | 0) + 4 | 0;
                    lc(d | 0, a, a)
                };
                t[22] = fb;
                t[23] = pc;
                t[24] = function(b, d) {
                    d |= 0;
                    var c;
                    g = c = g - 32 | 0;
                    b = a[((b | 0) + 4 | 0) >> 2];
                    var e = c + 16 | 0,
                        m = b,
                        f;
                    g = f = g - 848 | 0;
                    qb(f + 832 | 0, m);
                    oa(f + 576 | 0, m + 384 | 0, 256);
                    oa(f + 320 | 0, m + 952 | 0, 256);
                    var k = m + 16 | 0;
                    m = a[m +
                        1208 >> 2];
                    for (m = cc(f + 8 | 0, f + 320 | 0, f + 576 | 0, m, m + 8 | 0, f + 832 | 0); rc(m, f + 576 | 0, k););
                    $a(na(e), J(f, f + 576 | 0, 0));
                    dc(m);
                    g = f + 848 | 0;
                    qb(c, b);
                    hd(c + 16 | 0, d, c);
                    g = c + 32 | 0
                };
                t[25] = sb;
                t[26] = r;
                t[27] = Ka;
                t[28] = function(b) {
                    b |= 0;
                    var d;
                    g = d = g - 32 | 0;
                    var c = oc(d + 8 | 0, db(8, 4), nc(d, d + 24 | 0));
                    sc(a[c >> 2], b + 4 | 0, d);
                    b = Za(c);
                    qc(c);
                    g = d + 32 | 0;
                    return b | 0
                };
                t[29] = function(a, d) {
                    a = (a | 0) + 4 | 0;
                    sc(d | 0, a, a)
                };
                t[30] = fb;
                t[31] = pc;
                t[32] = function(b, d) {
                    d |= 0;
                    var c;
                    g = c = g - 16 | 0;
                    var e = a[((b | 0) + 4 | 0) >> 2];
                    if (1 == a[e + 256 >> 2])
                        for (b = 0; fa(J(c + 8 | 0, e, b), d), b = b + 1 | 0, 16 != (b | 0););
                    g = c + 16 | 0
                };
                t[33] = sb;
                t[34] = r;
                t[35] = Ka;
                t[36] = function(b) {
                    b |= 0;
                    var d;
                    g = d = g - 32 | 0;
                    var c = oc(d + 8 | 0, db(8, 4), nc(d, d + 24 | 0));
                    tc(a[c >> 2], b + 4 | 0, d);
                    b = Za(c);
                    qc(c);
                    g = d + 32 | 0;
                    return b | 0
                };
                t[37] = function(a, d) {
                    a = (a | 0) + 4 | 0;
                    tc(d | 0, a, a)
                };
                t[38] = fb;
                t[39] = pc;
                t[40] = function(b, d) {
                    b = a[((b | 0) + 4 | 0) >> 2];
                    d = a[b + 256 >> 2] + -1 | 0;
                    a[b + 256 >> 2] = d;
                    1 == (d | 0) && Db(b + 264 | 0, b)
                };
                t[41] = sb;
                t[42] = function(a) {
                    u[533] = +a
                };
                t[43] = function(a) {
                    u[534] = +a
                };
                t[44] = function(a) {
                    u[535] = +a
                };
                t[45] = function() {
                    return 4534
                };
                t[46] = function(a) {
                    (a |= 0) && R(B(a))
                };
                t[47] = function(b,
                    d) {
                    b = a[(b | 0) >> 2];
                    t[a[a[b >> 2] + 8 >> 2]](b, d | 0)
                };
                t[48] = function() {
                    return 4537
                };
                t[49] = function(b) {
                    if (b |= 0) {
                        var d = a[b >> 2];
                        a[b >> 2] = 0;
                        d && d && (dc(d + 640 | 0), pa(d + 352 | 0), R(d));
                        R(b)
                    }
                };
                t[50] = function(b, d, c) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    var e = ca(4),
                        h = +Kb[d >> 2],
                        f = +Kb[c >> 2];
                    c = ca(1216);
                    g = d = g - 32 | 0;
                    u[c + 8 >> 3] = f;
                    u[c >> 3] = h;
                    f = c + 16 | 0;
                    g = h = g - 16 | 0;
                    jd(f - -64 | 0);
                    a[h + 12 >> 2] = 0;
                    var k = 16,
                        q = h + 12 | 0;
                    if (k)
                        for (; a[f >> 2] = a[q >> 2], f = f + 4 | 0, k = k + -1 | 0, k;);
                    g = h + 16 | 0;
                    h = d + 8 | 0;
                    g = f = g - 16 | 0;
                    a[f + 8 >> 2] = c;
                    g = k = g - 16 | 0;
                    a[h + 16 >> 2] = 0;
                    lc(h, f + 8 | 0, k + 8 | 0);
                    a[h + 16 >> 2] = h;
                    g = k + 16 | 0;
                    g = f + 16 | 0;
                    f = c + 88 | 0;
                    g = k = g - 16 | 0;
                    a[f + 256 >> 2] = 0;
                    xd(f + 264 | 0, h);
                    a[k + 8 >> 2] = 0;
                    a[k + 12 >> 2] = 0;
                    bc(f, k + 8 | 0);
                    g = k + 16 | 0;
                    pa(h);
                    fd(c + 376 | 0, 4280, f);
                    h = gd(c + 384 | 0);
                    qb(d + 8 | 0, c);
                    k = c + 952 | 0;
                    cc(c + 640 | 0, k, h, 4264, 4272, d + 8 | 0);
                    gd(k);
                    C[c + 1212 | 0] = 0;
                    a[c + 1208 >> 2] = 4264;
                    qb(d + 8 | 0, c);
                    hd(b, h, d + 8 | 0);
                    id(h, h + 256 | 0, f);
                    g = d + 32 | 0;
                    kd(e, c);
                    return e | 0
                };
                t[51] = function(b, d) {
                    b |= 0;
                    d |= 0;
                    var c, e = 0,
                        m;
                    g = c = g - 16 | 0;
                    var f = a[b >> 2] + 384 | 0;
                    for (m = a[b >> 2] + 88 | 0;;) {
                        var k = J(c + 8 | 0, f, e),
                            q = J(c, m, e);
                        fa(k, d);
                        fa(q, d);
                        e = e + 1 | 0;
                        if (16 == (e | 0)) break
                    }
                    b = a[b >> 2] + 936 | 0;
                    g = e = g - 16 | 0;
                    a[e +
                        8 >> 2] = La(a[b >> 2]);
                    a[e >> 2] = La(a[b + 4 >> 2]);
                    if (Ha(e + 8 | 0, e))
                        for (; fa(a[e + 8 >> 2] + 4 | 0, d), b = e + 8 | 0, a[b >> 2] += 12, Ha(e + 8 | 0, e););
                    g = e + 16 | 0;
                    g = c + 16 | 0
                };
                t[52] = function(b, d) {
                    b |= 0;
                    d |= 0;
                    var c;
                    g = c = g - 16 | 0;
                    var e = G[a[b >> 2] + 1212 | 0],
                        m = a[b >> 2] + 384 | 0,
                        f = a[b >> 2] + 16 | 0,
                        k = ~~Xe(.0625 * +(d >>> 0)) >>> 0,
                        q = a[b >> 2] + 376 | 0,
                        p = a[b >> 2] + 640 | 0,
                        l = 0;
                    if (k)
                        for (; l |= nd(q, m) | rc(p, m, f), k = k + -1 | 0, k;);
                    C[a[b >> 2] + 1212 | 0] = !d & 0 != (e | 0) | l & 1;
                    G[a[b >> 2] + 1212 | 0] || (d = a[b >> 2], a[c + 8 >> 2] = a[b >> 2] + 384, d = d + 88 | 0, 1 == a[d + 256 >> 2] && id(d, d + 256 | 0, a[(c + 8 | 0) >> 2]));
                    g = c + 16 | 0;
                    return G[a[b >>
                        2] + 1212 | 0]
                };
                t[53] = function(b, d, c) {
                    od(b | 0, a[(d | 0) >> 2] + 384 | 0, c | 0)
                };
                t[54] = function(b, d, c, e) {
                    d |= 0;
                    c |= 0;
                    e |= 0;
                    var h, f = 0,
                        n;
                    g = h = g - 32 | 0;
                    var k = pb(b | 0);
                    if (0 <= (e | 0)) {
                        var q = +(c | 0);
                        for (n = +(e | 0);;) {
                            if (0 <= (c | 0)) {
                                var p = +(f | 0) / n;
                                for (b = 0;;) {
                                    var l = va(h + 16 | 0, p, +(b | 0) / q);
                                    od(h, a[d >> 2] + 384 | 0, l);
                                    l = k;
                                    var r = h;
                                    V[l + 4 >> 2] < V[(l + 8 | 0) >> 2] ? qd(l, r) : sd(l, r);
                                    l = (b | 0) == (c | 0);
                                    b = b + 1 | 0;
                                    if (l) break
                                }
                            }
                            b = (e | 0) == (f | 0);
                            f = f + 1 | 0;
                            if (b) break
                        }
                    }
                    g = h + 32 | 0
                };
                t[55] = function(b, d, c) {
                    b |= 0;
                    d |= 0;
                    var e;
                    g = e = g + -64 | 0;
                    var h = a[d >> 2] + 384 | 0;
                    c |= 0;
                    var f, k = 0;
                    g = f = g - 32 | 0;
                    var q =
                        jd(f + 24 | 0),
                        p = 1.7976931348623157E308;
                    for (a[f + 20 >> 2] = 0;;) {
                        var r, t = c,
                            K = J(f + 8 | 0, h, k);
                        g = k = g - 16 | 0;
                        a[k + 8 >> 2] = 0;
                        a[k + 12 >> 2] = 0;
                        var F = k + 8 | 0;
                        g = r = g - 32 | 0;
                        u[r + 16 >> 3] = u[t + 8 >> 3];
                        u[r + 8 >> 3] = T(K);
                        u[r + 24 >> 3] = Fb(r + 16 | 0, r + 8 | 0, F);
                        F = K;
                        var H = r + 24 | 0;
                        g = K = g - 16 | 0;
                        u[K + 8 >> 3] = u[t >> 3];
                        u[K >> 3] = X(F);
                        t = Fb(K + 8 | 0, K, H);
                        g = K + 16 | 0;
                        g = r + 32 | 0;
                        r = t;
                        g = k + 16 | 0;
                        k = hc(r);
                        k < p && (md(f, f + 20 | 0), C[f + 28 | 0] = G[f + 4 | 0], a[f + 24 >> 2] = a[f >> 2], p = k);
                        k = a[f + 20 >> 2] + 1 | 0;
                        a[f + 20 >> 2] = k;
                        if (!(16 > k >>> 0)) break
                    }
                    G[q + 4 | 0] ? (g = f + 32 | 0, c = a[q >> 2]) : (Cb(1362, 1245, 169, 1339), U(), c = void 0);
                    C[a[d >> 2] + 1212 | 0] = 1;
                    f = e + 16 | 0;
                    p = a[d >> 2] + 88 | 0;
                    g = q = g - 80 | 0;
                    k = a[p + 256 >> 2];
                    a[p + 256 >> 2] = k + 1;
                    k || Db(p + 264 | 0, p);
                    k = q + 56 | 0;
                    g = r = g - 16 | 0;
                    a[r + 8 >> 2] = p;
                    g = t = g - 16 | 0;
                    a[k + 16 >> 2] = 0;
                    sc(k, r + 8 | 0, t + 8 | 0);
                    a[k + 16 >> 2] = k;
                    g = t + 16 | 0;
                    g = r + 16 | 0;
                    jc(q + 32 | 0, k);
                    r = q + 8 | 0;
                    g = t = g - 16 | 0;
                    a[t + 8 >> 2] = p;
                    g = p = g - 16 | 0;
                    a[r + 16 >> 2] = 0;
                    tc(r, t + 8 | 0, p + 8 | 0);
                    a[r + 16 >> 2] = r;
                    g = p + 16 | 0;
                    g = t + 16 | 0;
                    p = r;
                    yd(f, q + 32 | 0);
                    xd(f + 24 | 0, p);
                    pa(p);
                    pa(q + 32 | 0);
                    pa(k);
                    g = q + 80 | 0;
                    p = e + 16 | 0;
                    f = J(e + 8 | 0, h, c);
                    q = a[d >> 2] + 16 | 0;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] = c;
                    c = h = ca(72);
                    k = p;
                    p = d + 12 | 0;
                    a[c >> 2] = 1404;
                    a[c >> 2] = 1384;
                    r =
                        c + 8 | 0;
                    yd(r, k);
                    jc(r + 24 | 0, k + 24 | 0);
                    g = r = g - 32 | 0;
                    t = k + 24 | 0;
                    k = zd(r + 8 | 0);
                    Ad(t, k);
                    pa(k);
                    g = r + 32 | 0;
                    k = a[p >> 2];
                    c = c + 56 | 0;
                    y(c, f);
                    a[c + 12 >> 2] = k;
                    c = a[c + 8 >> 2] = q;
                    f = k;
                    g = q = g - 16 | 0;
                    a[q + 12 >> 2] = f;
                    p = (f << 2) + c | 0;
                    f = a[p >> 2];
                    a[p >> 2] = f + 1;
                    f || (c = c - -64 | 0, G[c + 4 | 0] || (md(q, q + 12 | 0), C[c + 4 | 0] = G[q + 4 | 0], a[c >> 2] = a[q >> 2]));
                    g = q + 16 | 0;
                    p = b;
                    h = b = kd(d + 8 | 0, h);
                    g = c = g - 16 | 0;
                    q = p;
                    p = f = c + 8 | 0;
                    g = k = g - 16 | 0;
                    a[k + 12 >> 2] = 0;
                    Ab(p, k + 12 | 0);
                    g = k + 16 | 0;
                    l(f, Za(h));
                    z(q, f);
                    B(f);
                    g = c + 16 | 0;
                    l(b, 0);
                    g = d + 16 | 0;
                    ld(e + 16 | 0);
                    g = e - -64 | 0
                };
                t[56] = function(b, d, c) {
                    b |= 0;
                    d = +d;
                    c = +c;
                    var e, h = 0,
                        f, k;
                    g =
                        e = g + -64 | 0;
                    a: {
                        if (0 < d) {
                            if (!(0 < c)) break a;
                            var q = va(e + 48 | 0, d / u[a[b >> 2] >> 3], c / u[a[b >> 2] + 8 >> 3]),
                                p = va(e + 32 | 0, 1, 1);
                            g = f = g - 16 | 0;
                            C[f + 15 | 0] = 1;
                            var l = q;
                            g = k = g - 32 | 0;
                            u[k + 16 >> 3] = u[l + 8 >> 3];
                            u[k + 8 >> 3] = u[p + 8 >> 3];
                            C[k + 31 | 0] = 0 != G[f + 15 | 0] & u[(k + 16 | 0) >> 3] == u[(k + 8 | 0) >> 3];
                            var r;
                            g = r = g - 16 | 0;
                            u[r + 8 >> 3] = u[l >> 3];
                            u[r >> 3] = u[p >> 3];
                            p = 0 != G[k + 31 | 0] & u[(r + 8 | 0) >> 3] == u[r >> 3];
                            g = r + 16 | 0;
                            g = k + 32 | 0;
                            k = hc(+(p >>> 0));
                            g = f + 16 | 0;
                            if (0 == k) {
                                k = a[b >> 2] + 384 | 0;
                                f = a[b >> 2] + 88 | 0;
                                r = e + 32 | 0;
                                l = a[b >> 2];
                                g = p = g - 32 | 0;
                                var t = p + 8 | 0,
                                    y = l + 88 | 0;
                                if (1 == a[y + 256 >> 2]) {
                                    var z;
                                    g = z = g - 32 | 0;
                                    var v = na(z + 16 | 0);
                                    $a(v, J(z + 8 | 0, y, 0));
                                    C[z + 8 | 0] = 1;
                                    C[t | 0] = G[z + 8 | 0];
                                    H(t + 8 | 0, v);
                                    g = z + 32 | 0
                                } else C[t | 0] = 0, na(t + 8 | 0);
                                if (G[p + 8 | 0]) H(r, p + 16 | 0);
                                else {
                                    t = a[l + 380 >> 2];
                                    a[p >> 2] = a[l + 376 >> 2];
                                    a[p + 4 >> 2] = t;
                                    g = y = g - 848 | 0;
                                    qb(y + 832 | 0, l);
                                    oa(y + 576 | 0, l + 384 | 0, 256);
                                    oa(y + 320 | 0, l + 952 | 0, 256);
                                    z = l + 16 | 0;
                                    l = a[l + 1208 >> 2];
                                    for (l = cc(y + 8 | 0, y + 320 | 0, y + 576 | 0, l, l + 8 | 0, y + 832 | 0); t = y + 576 | 0, rc(l, t, z) | nd(p, t););
                                    $a(na(r), J(y, y + 576 | 0, 0));
                                    dc(l);
                                    g = y + 848 | 0
                                }
                                g = p + 32 | 0;
                                a[e >> 2] = f;
                                g = r = g - 16 | 0;
                                $a(na(e + 16 | 0), J(r + 8 | 0, a[e >> 2], 0));
                                g = r + 16 | 0;
                                for (a[e + 8 >> 2] = q; r = e + 8 | 0, p = e + 32 |
                                    0, l = J(e, k, h), Eb(l, p), gc(l, a[r >> 2]), fa(l, p), r = e + 8 | 0, p = e + 16 | 0, l = J(e, f, h), Eb(l, p), gc(l, a[r >> 2]), fa(l, p), h = h + 1 | 0, 16 != (h | 0););
                                h = a[b >> 2] + 656 | 0;
                                g = f = g - 16 | 0;
                                a[f + 8 >> 2] = q;
                                p = h + 256 | 0;
                                k = f + 8 | 0;
                                g = r = g - 16 | 0;
                                a[r + 8 >> 2] = La(a[p >> 2]);
                                a[r >> 2] = La(a[p + 4 >> 2]);
                                if (Ha(r + 8 | 0, r))
                                    for (; l = k, y = a[r + 8 >> 2], g = p = g - 16 | 0, y = y + 32 | 0, t = H(p, a[l >> 2]), g = l = g - 16 | 0, v = t, g = z = g - 32 | 0, u[z + 16 >> 3] = u[y + 8 >> 3], u[z + 8 >> 3] = u[v + 8 >> 3], u[z + 24 >> 3] = bb(z + 16 | 0, z + 8 | 0), ia(y, z + 24 | 0), g = t = g - 32 | 0, u[t + 16 >> 3] = u[y >> 3], u[t + 8 >> 3] = u[v >> 3], u[t + 24 >> 3] = bb(t + 16 | 0, t + 8 | 0), qa(y, t + 24 | 0),
                                        g = t + 32 | 0, g = z + 32 | 0, g = l + 16 | 0, g = p + 16 | 0, p = r + 8 | 0, a[p >> 2] += 56, Ha(r + 8 | 0, r););
                                g = r + 16 | 0;
                                g = f + 16 | 0;
                                k = h + 280 | 0;
                                h = e + 32 | 0;
                                g = f = g - 16 | 0;
                                a[f + 8 >> 2] = La(a[k >> 2]);
                                a[f >> 2] = La(a[k + 4 >> 2]);
                                if (Ha(f + 8 | 0, f))
                                    for (; k = a[f + 8 >> 2] + 4 | 0, Eb(k, h), gc(k, q), fa(k, h), k = f + 8 | 0, a[k >> 2] += 12, Ha(f + 8 | 0, f););
                                g = f + 16 | 0;
                                u[a[b >> 2] >> 3] = d;
                                u[a[b >> 2] + 8 >> 3] = c
                            }
                            g = e - -64 | 0;
                            return
                        }
                        Cb(1024, 1037, 974, 1057);U()
                    }
                    Cb(1069, 1037, 975, 1057);
                    U()
                };
                t[57] = Md;
                t[58] = function() {
                    return na(ca(16)) | 0
                };
                t[59] = function(a) {
                    (a |= 0) && R(a)
                };
                t[60] = function(b, d) {
                    return +u[a[(b | 0) >> 2] + (d | 0) >> 3]
                };
                t[61] = function(b, d, c) {
                    u[a[(b | 0) >> 2] + (d | 0) >> 3] = +c
                };
                t[62] = function() {
                    return 4528
                };
                t[63] = function(a) {
                    (a |= 0) && R(Od(a))
                };
                t[64] = function() {
                    return pb(ca(12)) | 0
                };
                t[65] = function(b, d) {
                    b |= 0;
                    d |= 0;
                    a[b + 4 >> 2] != a[(b + 8 | 0) >> 2] ? qd(b, d) : sd(b, d)
                };
                t[66] = function(b, d, c) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    var e = ja(b);
                    if (e >>> 0 < d >>> 0) {
                        var h = d - e | 0;
                        g = d = g - 32 | 0;
                        if (a[(b + 8 | 0) >> 2] - a[b + 4 >> 2] >> 4 >>> 0 >= h >>> 0) {
                            g = e = g - 16 | 0;
                            b = rd(e, b, h);
                            if (a[b + 4 >> 2] != a[b + 8 >> 2])
                                for (;;) {
                                    H(a[b + 4 >> 2], c);
                                    var f = a[b + 4 >> 2] + 16 | 0;
                                    a[b + 4 >> 2] = f;
                                    if (a[b + 8 >> 2] == (f | 0)) break
                                }
                            ac(b);
                            g = e + 16 | 0
                        } else {
                            e =
                                b + 8 | 0;
                            f = e = td(d + 8 | 0, ud(b, ja(b) + h | 0), ja(b), e);
                            var k;
                            g = k = g - 16 | 0;
                            var p = f + 8 | 0;
                            a[k >> 2] = a[p >> 2];
                            var q = a[p >> 2];
                            a[k + 8 >> 2] = p;
                            a[k + 4 >> 2] = (h << 4) + q;
                            h = k;
                            if (a[h >> 2] != a[h + 4 >> 2])
                                for (; Ja(f + 12 | 0), H(a[h >> 2], c), p = a[h >> 2] + 16 | 0, a[h >> 2] = p, a[h + 4 >> 2] != (p | 0););
                            a[a[h + 8 >> 2] >> 2] = a[h >> 2];
                            g = k + 16 | 0;
                            vd(b, e);
                            wd(e)
                        }
                        g = d + 32 | 0
                    } else e >>> 0 > d >>> 0 && (d = a[b >> 2] + (d << 4) | 0, ja(b), Nd(b, d), Aa(b), ja(b))
                };
                t[67] = ja;
                t[68] = function(b, d, c) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    if (ja(d) >>> 0 > c >>> 0) {
                        var e = a[d >> 2] + (c << 4) | 0;
                        g = d = g - 16 | 0;
                        b >>= 2;
                        c = d + 8 | 0;
                        var h;
                        g = h = g - 16 | 0;
                        a[h + 12 >> 2] = c;
                        var f =
                            H(ca(16), e);
                        e = h + 12 | 0;
                        a[a[e >> 2] >> 2] = f;
                        a[e >> 2] += 8;
                        g = h + 16 | 0;
                        a[b] = bf(4527, c | 0);
                        g = d + 16 | 0
                    } else ta(b, 1)
                };
                t[69] = function(b, d, c) {
                    b |= 0;
                    d |= 0;
                    var e;
                    g = e = g - 16 | 0;
                    c = H(e, c | 0);
                    b = a[b >> 2] + (d << 4) | 0;
                    Fd(b, c);
                    Fd(b + 8 | 0, c + 8 | 0);
                    g = e + 16 | 0;
                    return 1
                };
                t[70] = vc;
                t[71] = function(a, d, c, e) {
                    a |= 0;
                    d |= 0;
                    c = Lb(c);
                    e = Lb(e);
                    var b;
                    g = b = g - 32 | 0;
                    H(b + 16 | 0, d);
                    Kb[b + 12 >> 2] = c;
                    Kb[b + 8 >> 2] = e;
                    a = t[a](b + 16 | 0, b + 12 | 0, b + 8 | 0) | 0;
                    g = b + 32 | 0;
                    return a | 0
                };
                t[72] = vc;
                t[73] = function(b, d, c) {
                    b |= 0;
                    var e = d | 0;
                    d = a[b + 4 >> 2];
                    e = e + (d >> 1) | 0;
                    b = a[b >> 2];
                    return t[d & 1 ? a[b + a[e >> 2] >> 2] : b](e,
                        c | 0) | 0
                };
                t[74] = function(b, d, c) {
                    b |= 0;
                    var e;
                    g = e = g - 16 | 0;
                    var h = a[b + 4 >> 2];
                    d = (d | 0) + (h >> 1) | 0;
                    b = a[b >> 2];
                    t[h & 1 ? a[b + a[d >> 2] >> 2] : b](e, d, c | 0);
                    b = H(ca(16), e);
                    g = e + 16 | 0;
                    return b | 0
                };
                t[75] = function(b, d, c, e) {
                    b |= 0;
                    var h;
                    g = h = g - 16 | 0;
                    var f = a[b + 4 >> 2];
                    d = (d | 0) + (f >> 1) | 0;
                    b = a[b >> 2];
                    t[f & 1 ? a[b + a[d >> 2] >> 2] : b](h, d, c | 0, e | 0);
                    b = ed(ca(12), h);
                    Od(h);
                    g = h + 16 | 0;
                    return b | 0
                };
                t[76] = function(b, d, c) {
                    b |= 0;
                    var e;
                    g = e = g - 16 | 0;
                    var h = a[b + 4 >> 2];
                    d = (d | 0) + (h >> 1) | 0;
                    b = a[b >> 2];
                    t[h & 1 ? a[b + a[d >> 2] >> 2] : b](e + 8 | 0, d, c | 0);
                    b = z(ca(4), e + 8 | 0);
                    B(e + 8 | 0);
                    g = e + 16 | 0;
                    return b |
                        0
                };
                t[77] = function(b, d, c, e) {
                    b |= 0;
                    var h = d | 0;
                    d = a[b + 4 >> 2];
                    h = h + (d >> 1) | 0;
                    b = a[b >> 2];
                    t[d & 1 ? a[b + a[h >> 2] >> 2] : b](h, +c, +e)
                };
                t[78] = Pd;
                t[79] = vc;
                t[80] = function(b, d, c, e) {
                    b |= 0;
                    var h = d | 0;
                    d = a[b + 4 >> 2];
                    h = h + (d >> 1) | 0;
                    b = a[b >> 2];
                    t[d & 1 ? a[b + a[h >> 2] >> 2] : b](h, c | 0, e | 0)
                };
                t[81] = function(b, d) {
                    b |= 0;
                    var c;
                    g = c = g - 16 | 0;
                    var e = d | 0;
                    d = a[b >> 2];
                    b = a[b + 4 >> 2];
                    e = (b >> 1) + e | 0;
                    a[c + 12 >> 2] = t[b & 1 ? a[d + a[e >> 2] >> 2] : d](e);
                    g = c + 16 | 0;
                    return a[c + 12 >> 2]
                };
                t[82] = function(b, d, c) {
                    var e;
                    g = e = g - 16 | 0;
                    t[a[(b | 0) >> 2]](e + 8 | 0, d | 0, c | 0);
                    b = e + 8 | 0;
                    $e(a[b >> 2]);
                    b = a[b >> 2];
                    af(a[e +
                        8 >> 2]);
                    g = e + 16 | 0;
                    return b | 0
                };
                t[83] = function(b, d, c, e) {
                    return t[a[(b | 0) >> 2]](d | 0, c | 0, e | 0) | 0
                };
                t[84] = function(b) {
                    var d;
                    g = d = g - 16 | 0;
                    a[d + 12 >> 2] = b | 0;
                    b = a[d + 12 >> 2];
                    Qd();
                    g = d + 16 | 0;
                    return b | 0
                };
                t[85] = function(b, d, c) {
                    b |= 0;
                    c |= 0;
                    var e = a[b + 20 >> 2],
                        h = a[b + 16 >> 2] - e | 0;
                    h = h >>> 0 > c >>> 0 ? c : h;
                    oa(e, d | 0, h);
                    a[b + 20 >> 2] = h + a[b + 20 >> 2];
                    return c | 0
                };
                t[86] = function(b, d, c, e, m, f) {
                    b |= 0;
                    d = +d;
                    c |= 0;
                    e |= 0;
                    m |= 0;
                    f |= 0;
                    var h, k, n, p = 0,
                        q = 0;
                    g = k = g - 560 | 0;
                    a[k + 44 >> 2] = 0;
                    de(d);
                    var l = S;
                    if (-1 > (l | 0) || -1 >= (l | 0)) {
                        var r = 1,
                            t = 3696;
                        d = -d;
                        de(d);
                        l = S
                    } else m & 2048 ? (r = 1, t = 3699) :
                        (t = (r = m & 1) ? 3702 : 3697, q = !r);
                    a: if (2146435072 == (l & 2146435072)) {
                        var v = r + 3 | 0;
                        Z(b, 32, c, v, m & -65537);
                        M(b, t, r);
                        e = f & 32;
                        M(b, d != d ? e ? 3723 : 3727 : e ? 3715 : 3719, 3)
                    } else {
                        var u = k + 16 | 0;
                        b: {
                            c: {
                                d: {
                                    d = $d(d, k + 44 | 0);d += d;
                                    if (0 != d) {
                                        l = a[k + 44 >> 2];
                                        a[k + 44 >> 2] = l + -1;
                                        var y = f | 32;
                                        if (97 != (y | 0)) break d;
                                        break b
                                    }
                                    y = f | 32;
                                    if (97 == (y | 0)) break b;
                                    var z = a[k + 44 >> 2],
                                        A = 0 > (e | 0) ? 6 : e;
                                    break c
                                }
                                z = l + -29 | 0;a[k + 44 >> 2] = z;d *= 268435456;A = 0 > (e | 0) ? 6 : e
                            }
                            for (h = n = 0 > (z | 0) ? k + 48 | 0 : k + 336 | 0; e = h, l = 4294967296 > d & 0 <= d ? ~~d >>> 0 : 0, a[e >> 2] = l, h = h + 4 | 0, d = 1E9 * (d - +(l >>> 0)), 0 != d;);
                            if (1 >
                                (z | 0)) {
                                e = z;
                                l = h;
                                var B = n
                            } else
                                for (B = n, e = z;;) {
                                    var F = 29 > (e | 0) ? e : 29;
                                    l = h + -4 | 0;
                                    if (!(l >>> 0 < B >>> 0)) {
                                        e = F;
                                        for (v = 0;;) {
                                            var H = l,
                                                aa = v,
                                                J = a[l >> 2];
                                            d = e & 31;
                                            32 <= (e & 63) >>> 0 ? (v = J << d, J = 0) : (v = (1 << d) - 1 & J >>> 32 - d, J <<= d);
                                            d = aa + J | 0;
                                            v = v + 0 | 0;
                                            v = d >>> 0 < J >>> 0 ? v + 1 | 0 : v;
                                            v = ce(d, v, 1E9);
                                            J = H;
                                            H = ba(v, S, 1E9, 0);
                                            a[J >> 2] = d - H;
                                            l = l + -4 | 0;
                                            if (!(l >>> 0 >= B >>> 0)) break
                                        }
                                        v && (B = B + -4 | 0, a[B >> 2] = v)
                                    }
                                    for (; l = h, l >>> 0 > B >>> 0 && (h = l + -4 | 0, !a[h >> 2]););
                                    e = a[k + 44 >> 2] - F | 0;
                                    a[k + 44 >> 2] = e;
                                    h = l;
                                    if (!(0 < (e | 0))) break
                                }
                            if (-1 >= (e | 0))
                                for (p = ((A + 25 | 0) / 9 | 0) + 1 | 0, F = 102 == (y | 0);;) {
                                    v = -9 > (e | 0) ? 9 : 0 -
                                        e | 0;
                                    if (B >>> 0 >= l >>> 0) B = a[B >> 2] ? B : B + 4 | 0;
                                    else {
                                        H = 1E9 >>> v | 0;
                                        d = -1 << v ^ -1;
                                        e = 0;
                                        for (h = B; J = e, e = a[h >> 2], a[h >> 2] = J + (e >>> v | 0), e = L(H, e & d), h = h + 4 | 0, h >>> 0 < l >>> 0;);
                                        B = a[B >> 2] ? B : B + 4 | 0;
                                        e && (a[l >> 2] = e, l = l + 4 | 0)
                                    }
                                    e = v + a[k + 44 >> 2] | 0;
                                    a[k + 44 >> 2] = e;
                                    h = F ? n : B;
                                    l = l - h >> 2 > (p | 0) ? h + (p << 2) | 0 : l;
                                    if (!(0 > (e | 0))) break
                                }
                            h = 0;
                            if (!(B >>> 0 >= l >>> 0 || (h = L(n - B >> 2, 9), e = 10, v = a[B >> 2], 10 > v >>> 0)))
                                for (; h = h + 1 | 0, e = L(e, 10), v >>> 0 >= e >>> 0;);e = (A - (102 == (y | 0) ? 0 : h) | 0) - (103 == (y | 0) & 0 != (A | 0)) | 0;
                            if ((e | 0) < (L(l - n >> 2, 9) + -9 | 0)) {
                                F = e + 9216 | 0;
                                H = (F | 0) / 9 | 0;
                                v = ((H << 2) + (0 > (z | 0) ? k + 48 | 4 :
                                    k + 340 | 0) | 0) + -4096 | 0;
                                e = 10;
                                F = F - L(H, 9) | 0;
                                if (7 >= (F | 0))
                                    for (; e = L(e, 10), F = F + 1 | 0, 8 != (F | 0););
                                F = a[v >> 2];
                                H = (F >>> 0) / (e >>> 0) | 0;
                                p = v + 4 | 0;
                                if ((z = F - L(e, H) | 0) || (p | 0) != (l | 0))
                                    if (d = e >>> 1 | 0, J = z >>> 0 < d >>> 0 ? .5 : (l | 0) == (p | 0) ? (d | 0) == (z | 0) ? 1 : 1.5 : 1.5, d = H & 1 ? 9007199254740994 : 9007199254740992, 45 != G[t | 0] | q || (J = -J, d = -d), z = F - z | 0, a[v >> 2] = z, d + J != d) {
                                        e = e + z | 0;
                                        a[v >> 2] = e;
                                        if (1E9 <= e >>> 0)
                                            for (; a[v >> 2] = 0, v = v + -4 | 0, v >>> 0 < B >>> 0 && (B = B + -4 | 0, a[B >> 2] = 0), e = a[v >> 2] + 1 | 0, a[v >> 2] = e, 999999999 < e >>> 0;);
                                        h = L(n - B >> 2, 9);
                                        e = 10;
                                        z = a[B >> 2];
                                        if (!(10 > z >>> 0))
                                            for (; h = h + 1 | 0,
                                                e = L(e, 10), z >>> 0 >= e >>> 0;);
                                    } e = v + 4 | 0;
                                l = l >>> 0 > e >>> 0 ? e : l
                            }
                            c: {
                                for (;;) {
                                    e = l;
                                    z = 0;
                                    if (l >>> 0 <= B >>> 0) break c;
                                    l = e + -4 | 0;
                                    if (a[l >> 2]) break
                                }
                                z = 1
                            }
                            if (103 != (y | 0)) H = m & 8;
                            else if (l = A ? A : 1, v = (l | 0) > (h | 0) & -5 < (h | 0), A = (v ? h ^ -1 : -1) + l | 0, f = (v ? -1 : -2) + f | 0, H = m & 8, !H) {
                                l = 9;
                                if (z && (v = a[e + -4 >> 2]) && (F = 10, l = 0, !((v >>> 0) % 10)))
                                    for (; !(l = l + 1 | 0, F = L(F, 10), (v >>> 0) % (F >>> 0)););
                                v = L(e - n >> 2, 9) + -9 | 0;
                                70 == (f & -33) ? (H = 0, l = v - l | 0) : (H = 0, l = (v + h | 0) - l | 0);
                                l = 0 < (l | 0) ? l : 0;
                                A = (A | 0) < (l | 0) ? A : l
                            }
                            d = A | H;y = 0 != (d | 0);F = b;aa = c;J = f & -33;l = 0 < (h | 0) ? h : 0;
                            if (70 != (J | 0)) {
                                l = h >> 31;
                                l = hb(l + h ^ l,
                                    0, u);
                                if (1 >= (u - l | 0))
                                    for (; l = l + -1 | 0, C[l | 0] = 48, 2 > (u - l | 0););
                                p = l + -2 | 0;
                                C[p | 0] = f;
                                C[l + -1 | 0] = 0 > (h | 0) ? 45 : 43;
                                l = u - p | 0
                            }
                            v = (l + (y + (A + r | 0) | 0) | 0) + 1 | 0;Z(F, 32, aa, v, m);M(b, t, r);Z(b, 48, c, v, m ^ 65536);c: {
                                d: {
                                    e: {
                                        if (70 == (J | 0)) {
                                            f = k + 16 | 8;
                                            h = k + 16 | 9;
                                            for (B = z = B >>> 0 > n >>> 0 ? n : B;;) {
                                                l = hb(a[B >> 2], 0, h);
                                                if ((B | 0) != (z | 0)) {
                                                    if (!(l >>> 0 <= k + 16 >>> 0))
                                                        for (; l = l + -1 | 0, C[l | 0] = 48, l >>> 0 > k + 16 >>> 0;);
                                                } else(l | 0) == (h | 0) && (C[k + 24 | 0] = 48, l = f);
                                                M(b, l, h - l | 0);
                                                B = B + 4 | 0;
                                                if (!(B >>> 0 <= n >>> 0)) break
                                            }
                                            d && M(b, 3731, 1);
                                            if (1 > (A | 0) | B >>> 0 >= e >>> 0) break e;
                                            for (;;) {
                                                l = hb(a[B >> 2], 0, h);
                                                if (l >>>
                                                    0 > k + 16 >>> 0)
                                                    for (; l = l + -1 | 0, C[l | 0] = 48, l >>> 0 > k + 16 >>> 0;);
                                                M(b, l, 9 > (A | 0) ? A : 9);
                                                l = A + -9 | 0;
                                                B = B + 4 | 0;
                                                if (B >>> 0 >= e >>> 0) break d;
                                                f = 9 < (A | 0);
                                                A = l;
                                                if (!f) break
                                            }
                                            break d
                                        }
                                        f: if (!(0 > (A | 0)))
                                            for (n = z ? e : B + 4 | 0, e = k + 16 | 8, f = k + 16 | 9, h = B;;) {
                                                l = hb(a[h >> 2], 0, f);
                                                (f | 0) == (l | 0) && (C[k + 24 | 0] = 48, l = e);
                                                if ((h | 0) != (B | 0)) {
                                                    if (!(l >>> 0 <= k + 16 >>> 0))
                                                        for (; l = l + -1 | 0, C[l | 0] = 48, l >>> 0 > k + 16 >>> 0;);
                                                } else M(b, l, 1), l = l + 1 | 0, 1 > (A | 0) && !H || M(b, 3731, 1);
                                                z = l;
                                                l = f - l | 0;
                                                M(b, z, (A | 0) > (l | 0) ? l : A);
                                                A = A - l | 0;
                                                h = h + 4 | 0;
                                                if (h >>> 0 >= n >>> 0) break f;
                                                if (!(-1 < (A | 0))) break
                                            }
                                        Z(b, 48, A + 18 | 0, 18, 0);M(b,
                                            p, u - p | 0);
                                        break c
                                    }
                                    l = A
                                }
                                Z(b, 48, l + 9 | 0, 9, 0)
                            }
                            break a
                        }
                        z = (A = f & 32) ? t + 9 | 0 : t;
                        if (!(11 < e >>> 0) && (l = 12 - e | 0)) {
                            for (J = 8; J *= 16, l = l + -1 | 0, l;);
                            d = 45 == G[z | 0] ? -(J + (-d - J)) : d + J - J
                        }
                        h = a[k + 44 >> 2];
                        l = h >> 31;
                        l = hb(l ^ l + h, 0, u);
                        (u | 0) == (l | 0) && (C[k + 15 | 0] = 48, l = k + 15 | 0);
                        h = r | 2;
                        B = a[k + 44 >> 2];
                        n = l + -2 | 0;
                        C[n | 0] = f + 15;
                        C[l + -1 | 0] = 0 > (B | 0) ? 45 : 43;
                        v = m & 8;
                        for (B = k + 16 | 0; f = B, H = A, l = 2147483648 > Hb(d) ? ~~d : -2147483648, C[B | 0] = H | G[l + 3680 | 0], d = 16 * (d - +(l | 0)), B = f + 1 | 0, 1 != (B - (k + 16 | 0) | 0) | (0 == d ? !(0 < (e | 0) | v) : 0) || (C[f + 1 | 0] = 46, B = f + 2 | 0), 0 != d;);
                        l = !e | ((B - k | 0) + -18 | 0) >= (e | 0) ? ((u - (k +
                            16 | 0) | 0) - n | 0) + B | 0 : ((e + u | 0) - n | 0) + 2 | 0;
                        v = l + h | 0;
                        Z(b, 32, c, v, m);
                        M(b, z, h);
                        Z(b, 48, c, v, m ^ 65536);
                        f = B - (k + 16 | 0) | 0;
                        M(b, k + 16 | 0, f);
                        e = u - n | 0;
                        Z(b, 48, l - (e + f | 0) | 0, 0, 0);
                        M(b, n, e)
                    } Z(b, 32, c, v, m ^ 8192);
                    g = k + 560 | 0;
                    return ((v | 0) < (c | 0) ? c : v) | 0
                };
                t[87] = function(b, d) {
                    var c = d |= 0;
                    d = a[d >> 2] + 15 & -16;
                    a[c >> 2] = d + 16;
                    u[(b | 0) >> 3] = pd(a[d >> 2], a[d + 4 >> 2], a[d + 8 >> 2], a[d + 12 >> 2])
                };
                t[88] = Ka;
                t[89] = function() {
                    return 3733
                };
                t[90] = r;
                t[91] = Ka;
                t[92] = function() {
                    return 3853
                };
                t[93] = function(a) {
                    R(zc(a | 0))
                };
                t[94] = Ja;
                t[95] = function(a) {
                    a |= 0;
                    zc(a);
                    R(a)
                };
                t[96] = r;
                t[97] =
                    Ka;
                t[98] = fb;
                t[99] = fb;
                t[100] = function(b, d, c) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    var e;
                    g = e = g + -64 | 0;
                    var h = 1;
                    if (!xa(b, d, 0) && (h = 0, d)) {
                        g = h = g + -64 | 0;
                        var f = a[d >> 2],
                            k = a[f + -4 >> 2],
                            l = a[f + -8 >> 2];
                        a[h + 20 >> 2] = 0;
                        a[h + 16 >> 2] = 4072;
                        a[h + 12 >> 2] = d;
                        a[h + 8 >> 2] = 4120;
                        f = 0;
                        Jb(h + 24 | 0, 0, 39);
                        d = d + l | 0;
                        a: if (xa(k, 4120, 0)) a[h + 56 >> 2] = 1, t[a[a[k >> 2] + 20 >> 2]](k, h + 8 | 0, d, d, 1, 0), f = 1 == a[h + 32 >> 2] ? d : 0;
                            else {
                                t[a[a[k >> 2] + 24 >> 2]](k, h + 8 | 0, d, 1, 0);
                                b: switch (a[h + 44 >> 2]) {
                                    case 0:
                                        f = 1 == a[h + 48 >> 2] ? 1 == a[h + 36 >> 2] ? 1 == a[h + 40 >> 2] ? a[h + 28 >> 2] : 0 : 0 : 0;
                                        break a;
                                    case 1:
                                        break b;
                                    default:
                                        break a
                                }
                                a[h +
                                    48 >> 2] | 1 != a[h + 36 >> 2] | 1 != a[h + 40 >> 2] && 1 != a[h + 32 >> 2] || (f = a[h + 24 >> 2])
                            } g = h - -64 | 0;
                        d = f;
                        h = 0;
                        d && (a[e + 20 >> 2] = -1, a[e + 16 >> 2] = b, a[e + 12 >> 2] = 0, a[e + 8 >> 2] = d, Jb(e + 24 | 0, 0, 39), a[e + 56 >> 2] = 1, t[a[a[d >> 2] + 28 >> 2]](d, e + 8 | 0, a[c >> 2], 1), h = 0, 1 == a[e + 32 >> 2] && (a[c >> 2] = a[e + 24 >> 2], h = 1))
                    }
                    g = e - -64 | 0;
                    return h | 0
                };
                t[101] = function(b, d, c, e, g, f) {
                    d |= 0;
                    c |= 0;
                    e |= 0;
                    g |= 0;
                    xa(b | 0, a[d + 8 >> 2], f | 0) && fe(d, c, e, g)
                };
                t[102] = function(b, d, c, e, g) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    e |= 0;
                    g |= 0;
                    xa(b, a[d + 8 >> 2], g) ? ge(d, c, e) : xa(b, a[d >> 2], g) && (a[d + 20 >> 2] == (c | 0) || a[d + 16 >> 2] == (c | 0) ? 1 == (e |
                        0) && (a[d + 32 >> 2] = 1) : (a[d + 20 >> 2] = c, a[d + 32 >> 2] = e, a[d + 40 >> 2] += 1, 1 != a[d + 36 >> 2] | 2 != a[d + 24 >> 2] || (C[d + 54 | 0] = 1), a[d + 44 >> 2] = 4))
                };
                t[103] = function(b, d, c, e) {
                    d |= 0;
                    c |= 0;
                    e |= 0;
                    xa(b | 0, a[d + 8 >> 2], 0) && ee(d, c, e)
                };
                t[104] = Ka;
                t[105] = function(b, d, c, e, g, f) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    e |= 0;
                    g |= 0;
                    f |= 0;
                    xa(b, a[d + 8 >> 2], f) ? fe(d, c, e, g) : (b = a[b + 8 >> 2], t[a[a[b >> 2] + 20 >> 2]](b, d, c, e, g, f))
                };
                t[106] = function(b, d, c, e, g) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    e |= 0;
                    g |= 0;
                    if (xa(b, a[d + 8 >> 2], g)) ge(d, c, e);
                    else a: if (xa(b, a[d >> 2], g))
                        if (a[d + 20 >> 2] == (c | 0) || a[d + 16 >> 2] == (c | 0)) 1 == (e | 0) && (a[d +
                            32 >> 2] = 1);
                        else {
                            a[d + 32 >> 2] = e;
                            b: if (4 != a[d + 44 >> 2]) {
                                yc[d + 52 >> 1] = 0;
                                b = a[b + 8 >> 2];
                                t[a[a[b >> 2] + 20 >> 2]](b, d, c, c, 1, g);
                                if (G[d + 53 | 0]) {
                                    a[d + 44 >> 2] = 3;
                                    if (!G[d + 52 | 0]) break b;
                                    break a
                                }
                                a[d + 44 >> 2] = 4
                            } a[d + 20 >> 2] = c;
                            a[d + 40 >> 2] += 1;
                            1 != a[d + 36 >> 2] | 2 != a[d + 24 >> 2] || (C[d + 54 | 0] = 1)
                        }
                    else b = a[b + 8 >> 2], t[a[a[b >> 2] + 24 >> 2]](b, d, c, e, g)
                };
                t[107] = function(b, d, c, e) {
                    b |= 0;
                    d |= 0;
                    c |= 0;
                    e |= 0;
                    xa(b, a[d + 8 >> 2], 0) ? ee(d, c, e) : (b = a[b + 8 >> 2], t[a[a[b >> 2] + 28 >> 2]](b, d, c, e))
                };
                return {
                    __wasm_call_ctors: function() {
                        var b, d;
                        g = b = g + -64 | 0;
                        uc(1732, 42);
                        uc(1750, 43);
                        uc(1762,
                            44);
                        Ye(4527, 1778, 1928, 58, 1930, 59);
                        Ld(Ld(b + 56 | 0, 1790, 0), 1792, 8);
                        Ze(4527);
                        var c;
                        g = d = g - 32 | 0;
                        Ac(4528, 4529, 4530, 0, 1972, 62, 1975, 0, 1975, 0, 1794, 1930, 63);
                        g = c = g - 16 | 0;
                        ie(4528, 1, 1980, 1972, 78, 64);
                        g = c + 16 | 0;
                        a[d + 28 >> 2] = 0;
                        a[d + 24 >> 2] = 65;
                        c = a[d + 28 >> 2];
                        a[d + 16 >> 2] = a[d + 24 >> 2];
                        a[d + 20 >> 2] = c;
                        c = d + 16 | 0;
                        var e;
                        g = e = g - 16 | 0;
                        var k = a[c + 4 >> 2];
                        a[e + 8 >> 2] = a[c >> 2];
                        a[e + 12 >> 2] = k;
                        ha(4528, 1942, 3, 1984, 1996, 79, ka(e + 8 | 0) | 0, 0);
                        g = e + 16 | 0;
                        a[d + 28 >> 2] = 0;
                        a[d + 24 >> 2] = 66;
                        c = a[d + 28 >> 2];
                        a[d + 8 >> 2] = a[d + 24 >> 2];
                        a[d + 12 >> 2] = c;
                        c = d + 8 | 0;
                        g = e = g - 16 | 0;
                        k = a[c + 4 >> 2];
                        a[e +
                            8 >> 2] = a[c >> 2];
                        a[e + 12 >> 2] = k;
                        ha(4528, 1952, 4, 2016, 2032, 80, ka(e + 8 | 0) | 0, 0);
                        g = e + 16 | 0;
                        a[d + 28 >> 2] = 0;
                        a[d + 24 >> 2] = 67;
                        c = a[d + 28 >> 2];
                        a[d >> 2] = a[d + 24 >> 2];
                        a[d + 4 >> 2] = c;
                        g = c = g - 16 | 0;
                        e = a[d + 4 >> 2];
                        a[c + 8 >> 2] = a[d >> 2];
                        a[c + 12 >> 2] = e;
                        ha(4528, 1959, 2, 2040, 2048, 81, ka(c + 8 | 0) | 0, 0);
                        g = c + 16 | 0;
                        g = c = g - 16 | 0;
                        a[c + 12 >> 2] = 68;
                        ha(4528, 1964, 3, 2052, 2064, 82, Ib(c + 12 | 0) | 0, 0);
                        g = c + 16 | 0;
                        g = c = g - 16 | 0;
                        a[c + 12 >> 2] = 69;
                        ha(4528, 1968, 4, 2080, 2096, 83, Ib(c + 12 | 0) | 0, 0);
                        g = c + 16 | 0;
                        g = d + 32 | 0;
                        Ac(4534, 4535, 4536, 0, 1972, 45, 1975, 0, 1975, 0, 1806, 1930, 46);
                        a[b + 60 >> 2] = 0;
                        a[b + 56 >> 2] =
                            47;
                        d = a[b + 60 >> 2];
                        a[b + 48 >> 2] = a[b + 56 >> 2];
                        a[b + 52 >> 2] = d;
                        d = b + 48 | 0;
                        g = c = g - 16 | 0;
                        e = a[d + 4 >> 2];
                        a[c + 8 >> 2] = a[d >> 2];
                        a[c + 12 >> 2] = e;
                        ha(4534, 1819, 3, 2104, 1996, 70, ka(c + 8 | 0) | 0, 0);
                        g = c + 16 | 0;
                        Ac(4537, 4538, 4539, 0, 1972, 48, 1975, 0, 1975, 0, 1826, 1930, 49);
                        g = d = g - 16 | 0;
                        ie(4537, 4, 2128, 2144, 71, 50);
                        g = d + 16 | 0;
                        a[b + 60 >> 2] = 0;
                        a[b + 56 >> 2] = 51;
                        d = a[b + 60 >> 2];
                        a[b + 40 >> 2] = a[b + 56 >> 2];
                        a[b + 44 >> 2] = d;
                        d = b + 40 | 0;
                        g = c = g - 16 | 0;
                        e = a[d + 4 >> 2];
                        a[c + 8 >> 2] = a[d >> 2];
                        a[c + 12 >> 2] = e;
                        ha(4537, 1838, 3, 2152, 1996, 72, ka(c + 8 | 0) | 0, 0);
                        g = c + 16 | 0;
                        a[b + 60 >> 2] = 0;
                        a[b + 56 >> 2] = 52;
                        d = a[b + 60 >> 2];
                        a[b +
                            32 >> 2] = a[b + 56 >> 2];
                        a[b + 36 >> 2] = d;
                        d = b + 32 | 0;
                        g = c = g - 16 | 0;
                        e = a[d + 4 >> 2];
                        a[c + 8 >> 2] = a[d >> 2];
                        a[c + 12 >> 2] = e;
                        ha(4537, 1850, 3, 2164, 2064, 73, ka(c + 8 | 0) | 0, 0);
                        g = c + 16 | 0;
                        a[b + 60 >> 2] = 0;
                        a[b + 56 >> 2] = 53;
                        d = a[b + 60 >> 2];
                        a[b + 24 >> 2] = a[b + 56 >> 2];
                        a[b + 28 >> 2] = d;
                        d = b + 24 | 0;
                        g = c = g - 16 | 0;
                        e = a[d + 4 >> 2];
                        a[c + 8 >> 2] = a[d >> 2];
                        a[c + 12 >> 2] = e;
                        ha(4537, 1855, 3, 2176, 2064, 74, ka(c + 8 | 0) | 0, 0);
                        g = c + 16 | 0;
                        a[b + 60 >> 2] = 0;
                        a[b + 56 >> 2] = 54;
                        d = a[b + 60 >> 2];
                        a[b + 16 >> 2] = a[b + 56 >> 2];
                        a[b + 20 >> 2] = d;
                        d = b + 16 | 0;
                        g = c = g - 16 | 0;
                        e = a[d + 4 >> 2];
                        a[c + 8 >> 2] = a[d >> 2];
                        a[c + 12 >> 2] = e;
                        ha(4537, 1871, 4, 2192, 2096, 75,
                            ka(c + 8 | 0) | 0, 0);
                        g = c + 16 | 0;
                        a[b + 60 >> 2] = 0;
                        a[b + 56 >> 2] = 55;
                        d = a[b + 60 >> 2];
                        a[b + 8 >> 2] = a[b + 56 >> 2];
                        a[b + 12 >> 2] = d;
                        d = b + 8 | 0;
                        g = c = g - 16 | 0;
                        e = a[d + 4 >> 2];
                        a[c + 8 >> 2] = a[d >> 2];
                        a[c + 12 >> 2] = e;
                        ha(4537, 1892, 3, 2208, 2064, 76, ka(c + 8 | 0) | 0, 0);
                        g = c + 16 | 0;
                        a[b + 60 >> 2] = 0;
                        a[b + 56 >> 2] = 56;
                        d = a[b + 60 >> 2];
                        a[b >> 2] = a[b + 56 >> 2];
                        a[b + 4 >> 2] = d;
                        g = d = g - 16 | 0;
                        c = a[b + 4 >> 2];
                        a[d + 8 >> 2] = a[b >> 2];
                        a[d + 12 >> 2] = c;
                        ha(4537, 1903, 4, 2224, 2240, 77, ka(d + 8 | 0) | 0, 0);
                        g = d + 16 | 0;
                        g = b - -64 | 0;
                        t[84](4543) | 0
                    },
                    __getTypeName: function(b) {
                        var c;
                        g = c = g - 112 | 0;
                        a[c + 108 >> 2] = b | 0;
                        a[c >> 2] = a[c + 108 >> 2];
                        g = b = g -
                            16 | 0;
                        a[b + 12 >> 2] = c;
                        var e = c + 16 | 0,
                            k;
                        g = k = g - 160 | 0;
                        oa(k + 8 | 0, 3040, 144);
                        a[k + 52 >> 2] = e;
                        a[k + 28 >> 2] = e;
                        var m = -2 - e | 0;
                        m = 2147483647 > m >>> 0 ? m : 2147483647;
                        a[k + 56 >> 2] = m;
                        e = e + m | 0;
                        a[k + 36 >> 2] = e;
                        a[k + 24 >> 2] = e;
                        e = k + 8 | 0;
                        var f;
                        g = f = g - 208 | 0;
                        a[f + 204 >> 2] = c;
                        Jb(f + 160 | 0, 0, 40);
                        a[f + 200 >> 2] = a[f + 204 >> 2];
                        if (!(0 > (xc(0, f + 200 | 0, f + 80 | 0, f + 160 | 0) | 0))) {
                            var l = a[e >> 2];
                            0 >= C[e + 74 | 0] && (a[e >> 2] = l & -33);
                            var p = l & 32;
                            a[e + 48 >> 2] ? xc(e, f + 200 | 0, f + 80 | 0, f + 160 | 0) : (a[e + 48 >> 2] = 80, a[e + 16 >> 2] = f + 80, a[e + 28 >> 2] = f, a[e + 20 >> 2] = f, l = a[e + 44 >> 2], a[e + 44 >> 2] = f, xc(e, f + 200 | 0, f + 80 |
                                0, f + 160 | 0), l && (t[a[e + 36 >> 2]](e, 0, 0) | 0, a[e + 48 >> 2] = 0, a[e + 44 >> 2] = l, a[e + 28 >> 2] = 0, a[e + 16 >> 2] = 0, a[e + 20 >> 2] = 0));
                            a[e >> 2] |= p
                        }
                        g = f + 208 | 0;
                        m && (e = a[k + 28 >> 2], C[e - ((e | 0) == a[k + 24 >> 2]) | 0] = 0);
                        g = k + 160 | 0;
                        g = b + 16 | 0;
                        b = c + 16 | 0;
                        k = Cd(b) + 1 | 0;
                        b = (m = rb(k)) ? oa(m, b, k) : 0;
                        g = c + 112 | 0;
                        return b | 0
                    },
                    __embind_register_native_and_builtin_types: Qd,
                    __errno_location: function() {
                        return 4568
                    },
                    malloc: rb,
                    setThrew: function(b, c) {
                        a[1284] || (a[1285] = c | 0, a[1284] = b | 0)
                    },
                    stackSave: function() {
                        return g | 0
                    },
                    stackRestore: function(a) {
                        g = a | 0
                    },
                    stackAlloc: function(a) {
                        g =
                            a = g - (a | 0) & -16;
                        return a | 0
                    },
                    free: R,
                    __growWasmMemory: function() {
                        return U() | 0
                    },
                    dynCall_i: Pd,
                    dynCall_ii: function(a, c) {
                        return t[a | 0](c | 0) | 0
                    },
                    dynCall_vi: function(a, c) {
                        t[a | 0](c | 0)
                    },
                    dynCall_vii: function(a, c, e) {
                        t[a | 0](c | 0, e | 0)
                    },
                    dynCall_v: function(a) {
                        t[a | 0]()
                    },
                    dynCall_vd: Md,
                    dynCall_iiii: function(a, c, e, g) {
                        return t[a | 0](c | 0, e | 0, g | 0) | 0
                    },
                    dynCall_iii: function(a, c, e) {
                        return t[a | 0](c | 0, e | 0) | 0
                    },
                    dynCall_viii: function(a, c, e, g) {
                        t[a | 0](c | 0, e | 0, g | 0)
                    },
                    dynCall_viiii: function(a, c, e, g, k) {
                        t[a | 0](c | 0, e | 0, g | 0, k | 0)
                    },
                    dynCall_vidd: function(a,
                        c, e, g) {
                        t[a | 0](c | 0, +e, +g)
                    },
                    dynCall_vid: function(a, c, e) {
                        t[a | 0](c | 0, +e)
                    },
                    dynCall_dii: function(a, c, e) {
                        return +t[a | 0](c | 0, e | 0)
                    },
                    dynCall_viid: function(a, c, e, g) {
                        t[a | 0](c | 0, e | 0, +g)
                    },
                    dynCall_iiiff: function(a, c, e, g, k) {
                        a |= 0;
                        c |= 0;
                        e |= 0;
                        g = Lb(g);
                        k = Lb(k);
                        return t[a](c, e, g, k) | 0
                    },
                    dynCall_iiiii: function(a, c, e, g, k) {
                        return t[a | 0](c | 0, e | 0, g | 0, k | 0) | 0
                    },
                    dynCall_viidd: function(a, c, e, g, k) {
                        t[a | 0](c | 0, e | 0, +g, +k)
                    },
                    dynCall_iidiiii: function(a, c, e, g, k, f, l) {
                        return t[a | 0](c | 0, +e, g | 0, k | 0, f | 0, l | 0) | 0
                    },
                    dynCall_viiiiii: function(a, c, e, g,
                        k, f, l) {
                        t[a | 0](c | 0, e | 0, g | 0, k | 0, f | 0, l | 0)
                    },
                    dynCall_viiiii: function(a, c, e, g, k, f) {
                        t[a | 0](c | 0, e | 0, g | 0, k | 0, f | 0)
                    }
                }
            }({
                Int8Array: Int8Array,
                Int16Array: Int16Array,
                Int32Array: Int32Array,
                Uint8Array: Uint8Array,
                Uint16Array: Uint16Array,
                Uint32Array: Uint32Array,
                Float32Array: Float32Array,
                Float64Array: Float64Array,
                NaN: NaN,
                Infinity: Infinity,
                Math: Math
            }, c, e.buffer)
        }(Na, Oa, Pa)
    }

    function Qa() {
        return {
            then: function(c) {
                c({
                    instance: new Ma
                })
            }
        }
    }
    var Va = Error,
        Wa = {};
    Da = [];
    "object" !== typeof Wa && Xa("no native wasm support detected");
    var Oa, Pa = new function(c) {
            var e = Array(c.initial);
            e.grow = function() {
                108 <= e.length && Xa("Unable to grow wasm table. Use a higher value for RESERVED_FUNCTION_POINTERS or set ALLOW_TABLE_GROWTH.");
                e.push(null)
            };
            e.set = function(c, p) {
                e[c] = p
            };
            e.get = function(c) {
                return e[c]
            };
            return e
        }({
            initial: 108,
            maximum: 108,
            element: "anyfunc"
        }),
        Ya = !1,
        ib = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;

    function jb(c, e) {
        var k = kb,
            p = c + e;
        for (e = c; k[e] && !(e >= p);) ++e;
        if (16 < e - c && k.subarray && ib) return ib.decode(k.subarray(c, e));
        for (p = ""; c < e;) {
            var l = k[c++];
            if (l & 128) {
                var q = k[c++] & 63;
                if (192 == (l & 224)) p += String.fromCharCode((l & 31) << 6 | q);
                else {
                    var F = k[c++] & 63;
                    l = 224 == (l & 240) ? (l & 15) << 12 | q << 6 | F : (l & 7) << 18 | q << 12 | F << 6 | k[c++] & 63;
                    65536 > l ? p += String.fromCharCode(l) : (l -= 65536, p += String.fromCharCode(55296 | l >> 10, 56320 | l & 1023))
                }
            } else p += String.fromCharCode(l)
        }
        return p
    }

    function lb(c, e, k) {
        var p = kb;
        if (0 < k) {
            k = e + k - 1;
            for (var l = 0; l < c.length; ++l) {
                var q = c.charCodeAt(l);
                if (55296 <= q && 57343 >= q) {
                    var F = c.charCodeAt(++l);
                    q = 65536 + ((q & 1023) << 10) | F & 1023
                }
                if (127 >= q) {
                    if (e >= k) break;
                    p[e++] = q
                } else {
                    if (2047 >= q) {
                        if (e + 1 >= k) break;
                        p[e++] = 192 | q >> 6
                    } else {
                        if (65535 >= q) {
                            if (e + 2 >= k) break;
                            p[e++] = 224 | q >> 12
                        } else {
                            if (e + 3 >= k) break;
                            p[e++] = 240 | q >> 18;
                            p[e++] = 128 | q >> 12 & 63
                        }
                        p[e++] = 128 | q >> 6 & 63
                    }
                    p[e++] = 128 | q & 63
                }
            }
            p[e] = 0
        }
    }
    var mb = "undefined" !== typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;

    function nb(c, e) {
        for (var k = c >> 1, p = k + e / 2; !(k >= p) && ob[k];) ++k;
        k <<= 1;
        if (32 < k - c && mb) return mb.decode(kb.subarray(c, k));
        k = 0;
        for (p = "";;) {
            var l = tb[c + 2 * k >> 1];
            if (0 == l || k == e / 2) return p;
            ++k;
            p += String.fromCharCode(l)
        }
    }

    function ub(c, e, k) {
        void 0 === k && (k = 2147483647);
        if (2 > k) return 0;
        k -= 2;
        var p = e;
        k = k < 2 * c.length ? k / 2 : c.length;
        for (var l = 0; l < k; ++l) tb[e >> 1] = c.charCodeAt(l), e += 2;
        tb[e >> 1] = 0;
        return e - p
    }

    function vb(c) {
        return 2 * c.length
    }

    function wb(c, e) {
        for (var k = 0, p = ""; !(k >= e / 4);) {
            var l = xb[c + 4 * k >> 2];
            if (0 == l) break;
            ++k;
            65536 <= l ? (l -= 65536, p += String.fromCharCode(55296 | l >> 10, 56320 | l & 1023)) : p += String.fromCharCode(l)
        }
        return p
    }

    function yb(c, e, k) {
        void 0 === k && (k = 2147483647);
        if (4 > k) return 0;
        var p = e;
        k = p + k - 4;
        for (var l = 0; l < c.length; ++l) {
            var q = c.charCodeAt(l);
            if (55296 <= q && 57343 >= q) {
                var F = c.charCodeAt(++l);
                q = 65536 + ((q & 1023) << 10) | F & 1023
            }
            xb[e >> 2] = q;
            e += 4;
            if (e + 4 > k) break
        }
        xb[e >> 2] = 0;
        return e - p
    }

    function zb(c) {
        for (var e = 0, k = 0; k < c.length; ++k) {
            var p = c.charCodeAt(k);
            55296 <= p && 57343 >= p && ++k;
            e += 4
        }
        return e
    }
    var Mb, Nb, kb, tb, ob, xb, Ob, Pb, Qb, Fa = I.INITIAL_MEMORY || 16777216;
    I.wasmMemory ? Oa = I.wasmMemory : Oa = new Ea;
    Oa && (Mb = Oa.buffer);
    Fa = Mb.byteLength;
    var Rb = Mb;
    Mb = Rb;
    I.HEAP8 = Nb = new Int8Array(Rb);
    I.HEAP16 = tb = new Int16Array(Rb);
    I.HEAP32 = xb = new Int32Array(Rb);
    I.HEAPU8 = kb = new Uint8Array(Rb);
    I.HEAPU16 = ob = new Uint16Array(Rb);
    I.HEAPU32 = Ob = new Uint32Array(Rb);
    I.HEAPF32 = Pb = new Float32Array(Rb);
    I.HEAPF64 = Qb = new Float64Array(Rb);
    xb[1288] = 5248192;

    function Sb(c) {
        for (; 0 < c.length;) {
            var e = c.shift();
            if ("function" == typeof e) e(I);
            else {
                var k = e.P;
                "number" === typeof k ? void 0 === e.D ? I.dynCall_v(k) : I.dynCall_vi(k, e.D) : k(void 0 === e.D ? null : e.D)
            }
        }
    }
    var Tb = [],
        Ub = [],
        Vb = [],
        Wb = [];

    function Xb() {
        var c = I.preRun.shift();
        Tb.unshift(c)
    }
    var Bc = 0,
        Cc = null,
        Dc = null;
    I.preloadedImages = {};
    I.preloadedAudios = {};

    function Xa(c) {
        if (I.onAbort) I.onAbort(c);
        ua(c);
        ya(c);
        Ya = !0;
        throw new Va("abort(" + c + "). Build with -s ASSERTIONS=1 for more info.");
    }

    function Ec(c) {
        return String.prototype.startsWith ? c.startsWith("data:application/octet-stream;base64,") : 0 === c.indexOf("data:application/octet-stream;base64,")
    }
    var Fc = "wobbly.wasm";
    if (!Ec(Fc)) {
        var Gc = Fc;
        Fc = I.locateFile ? I.locateFile(Gc, sa) : sa + Gc
    }

    function Hc() {
        try {
            if (Da) return new Uint8Array(Da);
            var c = Fc;
            if (Ec(c)) try {
                var e = Ic(c.slice(37)),
                    k = new Uint8Array(e.length);
                for (c = 0; c < e.length; ++c) k[c] = e.charCodeAt(c);
                var p = k
            } catch (l) {
                throw Error("Converting base64 string to bytes failed.");
            } else p = void 0;
            if (c = p) return c;
            throw "both async and sync fetching of the wasm failed";
        } catch (l) {
            Xa(l)
        }
    }

    function Jc() {
        return Da || "function" !== typeof fetch ? new Promise(function(c) {
            c(Hc())
        }) : fetch(Fc, {
            credentials: "same-origin"
        }).then(function(c) {
            if (!c.ok) throw "failed to load wasm binary file at '" + Fc + "'";
            return c.arrayBuffer()
        }).catch(function() {
            return Hc()
        })
    }
    Ub.push({
        P: function() {
            Kc()
        }
    });

    function Lc() {
        return 0 < Lc.I
    }
    var Mc = {};

    function Nc(c) {
        for (; c.length;) {
            var e = c.pop();
            c.pop()(e)
        }
    }

    function Oc(c) {
        return this.fromWireType(Ob[c >> 2])
    }
    var Pc = {},
        Qc = {},
        Rc = {};

    function Sc(c) {
        if (void 0 === c) return "_unknown";
        c = c.replace(/[^a-zA-Z0-9_]/g, "$");
        var e = c.charCodeAt(0);
        return 48 <= e && 57 >= e ? "_" + c : c
    }

    function Tc(c, e) {
        c = Sc(c);
        return (new Function("body", "return function " + c + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n'))(e)
    }

    function Uc(c) {
        var e = Error,
            k = Tc(c, function(e) {
                this.name = c;
                this.message = e;
                e = Error(e).stack;
                void 0 !== e && (this.stack = this.toString() + "\n" + e.replace(/^Error(:[^\n]*)?\n/, ""))
            });
        k.prototype = Object.create(e.prototype);
        k.prototype.constructor = k;
        k.prototype.toString = function() {
            return void 0 === this.message ? this.name : this.name + ": " + this.message
        };
        return k
    }
    var Vc = void 0;

    function je(c) {
        throw new Vc(c);
    }

    function ke(c, e, k) {
        function p(e) {
            e = k(e);
            e.length !== c.length && je("Mismatched type converter count");
            for (var l = 0; l < c.length; ++l) le(c[l], e[l])
        }
        c.forEach(function(c) {
            Rc[c] = e
        });
        var l = Array(e.length),
            q = [],
            F = 0;
        e.forEach(function(c, e) {
            Qc.hasOwnProperty(c) ? l[e] = Qc[c] : (q.push(c), Pc.hasOwnProperty(c) || (Pc[c] = []), Pc[c].push(function() {
                l[e] = Qc[c];
                ++F;
                F === q.length && p(l)
            }))
        });
        0 === q.length && p(l)
    }

    function me(c) {
        switch (c) {
            case 1:
                return 0;
            case 2:
                return 1;
            case 4:
                return 2;
            case 8:
                return 3;
            default:
                throw new TypeError("Unknown type size: " + c);
        }
    }
    var ne = void 0;

    function oe(c) {
        for (var e = ""; kb[c];) e += ne[kb[c++]];
        return e
    }
    var pe = void 0;

    function P(c) {
        throw new pe(c);
    }

    function le(c, e, k) {
        k = k || {};
        if (!("argPackAdvance" in e)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
        var p = e.name;
        c || P('type "' + p + '" must have a positive integer typeid pointer');
        if (Qc.hasOwnProperty(c)) {
            if (k.W) return;
            P("Cannot register type '" + p + "' twice")
        }
        Qc[c] = e;
        delete Rc[c];
        Pc.hasOwnProperty(c) && (e = Pc[c], delete Pc[c], e.forEach(function(c) {
            c()
        }))
    }

    function qe(c) {
        return {
            count: c.count,
            s: c.s,
            v: c.v,
            c: c.c,
            f: c.f,
            h: c.h,
            i: c.i
        }
    }

    function re(c) {
        P(c.a.f.b.name + " instance already deleted")
    }
    var se = !1;

    function te() {}

    function ue(c) {
        --c.count.value;
        0 === c.count.value && (c.h ? c.i.m(c.h) : c.f.b.m(c.c))
    }

    function ve(c) {
        if ("undefined" === typeof FinalizationGroup) return ve = function(c) {
            return c
        }, c;
        se = new FinalizationGroup(function(c) {
            for (var e = c.next(); !e.done; e = c.next()) e = e.value, e.c ? ue(e) : console.warn("object already deleted: " + e.c)
        });
        ve = function(c) {
            se.register(c, c.a, c.a);
            return c
        };
        te = function(c) {
            se.unregister(c.a)
        };
        return ve(c)
    }
    var we = void 0,
        xe = [];

    function ye() {
        for (; xe.length;) {
            var c = xe.pop();
            c.a.s = !1;
            c["delete"]()
        }
    }

    function ze() {}
    var Ae = {};

    function Be(c, e, k) {
        if (void 0 === c[e].g) {
            var p = c[e];
            c[e] = function() {
                c[e].g.hasOwnProperty(arguments.length) || P("Function '" + k + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + c[e].g + ")!");
                return c[e].g[arguments.length].apply(this, arguments)
            };
            c[e].g = [];
            c[e].g[p.A] = p
        }
    }

    function Ce(c, e, k) {
        I.hasOwnProperty(c) ? ((void 0 === k || void 0 !== I[c].g && void 0 !== I[c].g[k]) && P("Cannot register public name '" + c + "' twice"), Be(I, c, c), I.hasOwnProperty(k) && P("Cannot register multiple overloads of a function with the same number of arguments (" + k + ")!"), I[c].g[k] = e) : (I[c] = e, void 0 !== k && (I[c].ea = k))
    }

    function De(c, e, k, p, l, q, F, r) {
        this.name = c;
        this.constructor = e;
        this.u = k;
        this.m = p;
        this.j = l;
        this.R = q;
        this.w = F;
        this.N = r;
        this.Y = []
    }

    function Ee(c, e, k) {
        for (; e !== k;) e.w || P("Expected null or instance of " + k.name + ", got an instance of " + e.name), c = e.w(c), e = e.j;
        return c
    }

    function Fe(c, e) {
        if (null === e) return this.F && P("null is not a valid " + this.name), 0;
        e.a || P('Cannot pass "' + Ge(e) + '" as a ' + this.name);
        e.a.c || P("Cannot pass deleted object as a pointer of type " + this.name);
        return Ee(e.a.c, e.a.f.b, this.b)
    }

    function He(c, e) {
        if (null === e) {
            this.F && P("null is not a valid " + this.name);
            if (this.C) {
                var k = this.G();
                null !== c && c.push(this.m, k);
                return k
            }
            return 0
        }
        e.a || P('Cannot pass "' + Ge(e) + '" as a ' + this.name);
        e.a.c || P("Cannot pass deleted object as a pointer of type " + this.name);
        !this.B && e.a.f.B && P("Cannot convert argument of type " + (e.a.i ? e.a.i.name : e.a.f.name) + " to parameter type " + this.name);
        k = Ee(e.a.c, e.a.f.b, this.b);
        if (this.C) switch (void 0 === e.a.h && P("Passing raw pointer to smart pointer is illegal"), this.ca) {
            case 0:
                e.a.i ===
                    this ? k = e.a.h : P("Cannot convert argument of type " + (e.a.i ? e.a.i.name : e.a.f.name) + " to parameter type " + this.name);
                break;
            case 1:
                k = e.a.h;
                break;
            case 2:
                if (e.a.i === this) k = e.a.h;
                else {
                    var p = e.clone();
                    k = this.Z(k, Ie(function() {
                        p["delete"]()
                    }));
                    null !== c && c.push(this.m, k)
                }
                break;
            default:
                P("Unsupporting sharing policy")
        }
        return k
    }

    function Je(c, e) {
        if (null === e) return this.F && P("null is not a valid " + this.name), 0;
        e.a || P('Cannot pass "' + Ge(e) + '" as a ' + this.name);
        e.a.c || P("Cannot pass deleted object as a pointer of type " + this.name);
        e.a.f.B && P("Cannot convert argument of type " + e.a.f.name + " to parameter type " + this.name);
        return Ee(e.a.c, e.a.f.b, this.b)
    }

    function Ke(c, e, k) {
        if (e === k) return c;
        if (void 0 === k.j) return null;
        c = Ke(c, e, k.j);
        return null === c ? null : k.N(c)
    }
    var Le = {};

    function Me(c, e) {
        for (void 0 === e && P("ptr should not be undefined"); c.j;) e = c.w(e), c = c.j;
        return Le[e]
    }

    function cf(c, e) {
        e.f && e.c || je("makeClassHandle requires ptr and ptrType");
        !!e.i !== !!e.h && je("Both smartPtrType and smartPtr must be specified");
        e.count = {
            value: 1
        };
        return ve(Object.create(c, {
            a: {
                value: e
            }
        }))
    }

    function df(c, e, k, p) {
        this.name = c;
        this.b = e;
        this.F = k;
        this.B = p;
        this.C = !1;
        this.m = this.Z = this.G = this.L = this.ca = this.X = void 0;
        void 0 !== e.j ? this.toWireType = He : (this.toWireType = p ? Fe : Je, this.l = null)
    }

    function ef(c, e, k) {
        I.hasOwnProperty(c) || je("Replacing nonexistant public symbol");
        void 0 !== I[c].g && void 0 !== k ? I[c].g[k] = e : (I[c] = e, I[c].A = k)
    }

    function ff(c, e) {
        c = oe(c);
        for (var k = I["dynCall_" + c], p = [], l = 1; l < c.length; ++l) p.push("a" + l);
        l = "return function dynCall_" + (c + "_" + e) + "(" + p.join(", ") + ") {\n";
        l += "    return dynCall(rawFunction" + (p.length ? ", " : "") + p.join(", ") + ");\n";
        k = (new Function("dynCall", "rawFunction", l + "};\n"))(k, e);
        "function" !== typeof k && P("unknown function pointer with signature " + c + ": " + e);
        return k
    }
    var gf = void 0;

    function hf(c) {
        c = jf(c);
        var e = oe(c);
        kf(c);
        return e
    }

    function lf(c, e) {
        function k(c) {
            l[c] || Qc[c] || (Rc[c] ? Rc[c].forEach(k) : (p.push(c), l[c] = !0))
        }
        var p = [],
            l = {};
        e.forEach(k);
        throw new gf(c + ": " + p.map(hf).join([", "]));
    }

    function mf(c, e) {
        for (var k = [], p = 0; p < c; p++) k.push(xb[(e >> 2) + p]);
        return k
    }

    function nf(c) {
        var e = Function;
        if (!(e instanceof Function)) throw new TypeError("new_ called with constructor type " + typeof e + " which is not a function");
        var k = Tc(e.name || "unknownFunctionName", function() {});
        k.prototype = e.prototype;
        k = new k;
        c = e.apply(k, c);
        return c instanceof Object ? c : k
    }

    function of (c, e, k, p, l) {
        var q = e.length;
        2 > q && P("argTypes array size mismatch! Must at least get return value and 'this' types!");
        var F = null !== e[1] && null !== k,
            r = !1;
        for (k = 1; k < e.length; ++k)
            if (null !== e[k] && void 0 === e[k].l) {
                r = !0;
                break
            } var B = "void" !== e[0].name,
            z = "",
            y = "";
        for (k = 0; k < q - 2; ++k) z += (0 !== k ? ", " : "") + "arg" + k, y += (0 !== k ? ", " : "") + "arg" + k + "Wired";
        c = "return function " + Sc(c) + "(" + z + ") {\nif (arguments.length !== " + (q - 2) + ") {\nthrowBindingError('function " + c + " called with ' + arguments.length + ' arguments, expected " +
            (q - 2) + " args!');\n}\n";
        r && (c += "var destructors = [];\n");
        var H = r ? "destructors" : "null";
        z = "throwBindingError invoker fn runDestructors retType classParam".split(" ");
        p = [P, p, l, Nc, e[0], e[1]];
        F && (c += "var thisWired = classParam.toWireType(" + H + ", this);\n");
        for (k = 0; k < q - 2; ++k) c += "var arg" + k + "Wired = argType" + k + ".toWireType(" + H + ", arg" + k + "); // " + e[k + 2].name + "\n", z.push("argType" + k), p.push(e[k + 2]);
        F && (y = "thisWired" + (0 < y.length ? ", " : "") + y);
        c += (B ? "var rv = " : "") + "invoker(fn" + (0 < y.length ? ", " : "") + y + ");\n";
        if (r) c +=
            "runDestructors(destructors);\n";
        else
            for (k = F ? 1 : 2; k < e.length; ++k) q = 1 === k ? "thisWired" : "arg" + (k - 2) + "Wired", null !== e[k].l && (c += q + "_dtor(" + q + "); // " + e[k].name + "\n", z.push(q + "_dtor"), p.push(e[k].l));
        B && (c += "var ret = retType.fromWireType(rv);\nreturn ret;\n");
        z.push(c + "}\n");
        return nf(z).apply(null, p)
    }
    var pf = [],
        qf = [{}, {
            value: void 0
        }, {
            value: null
        }, {
            value: !0
        }, {
            value: !1
        }];

    function rf(c) {
        4 < c && 0 === --qf[c].H && (qf[c] = void 0, pf.push(c))
    }

    function Ie(c) {
        switch (c) {
            case void 0:
                return 1;
            case null:
                return 2;
            case !0:
                return 3;
            case !1:
                return 4;
            default:
                var e = pf.length ? pf.pop() : qf.length;
                qf[e] = {
                    H: 1,
                    value: c
                };
                return e
        }
    }

    function Ge(c) {
        if (null === c) return "null";
        var e = typeof c;
        return "object" === e || "array" === e || "function" === e ? c.toString() : "" + c
    }

    function sf(c, e) {
        switch (e) {
            case 2:
                return function(c) {
                    return this.fromWireType(Pb[c >> 2])
                };
            case 3:
                return function(c) {
                    return this.fromWireType(Qb[c >> 3])
                };
            default:
                throw new TypeError("Unknown float type: " + c);
        }
    }

    function tf(c, e, k) {
        switch (e) {
            case 0:
                return k ? function(c) {
                    return Nb[c]
                } : function(c) {
                    return kb[c]
                };
            case 1:
                return k ? function(c) {
                    return tb[c >> 1]
                } : function(c) {
                    return ob[c >> 1]
                };
            case 2:
                return k ? function(c) {
                    return xb[c >> 2]
                } : function(c) {
                    return Ob[c >> 2]
                };
            default:
                throw new TypeError("Unknown integer type: " + c);
        }
    }
    Vc = I.InternalError = Uc("InternalError");
    for (var uf = Array(256), vf = 0; 256 > vf; ++vf) uf[vf] = String.fromCharCode(vf);
    ne = uf;
    pe = I.BindingError = Uc("BindingError");
    ze.prototype.isAliasOf = function(c) {
        if (!(this instanceof ze && c instanceof ze)) return !1;
        var e = this.a.f.b,
            k = this.a.c,
            p = c.a.f.b;
        for (c = c.a.c; e.j;) k = e.w(k), e = e.j;
        for (; p.j;) c = p.w(c), p = p.j;
        return e === p && k === c
    };
    ze.prototype.clone = function() {
        this.a.c || re(this);
        if (this.a.v) return this.a.count.value += 1, this;
        var c = ve(Object.create(Object.getPrototypeOf(this), {
            a: {
                value: qe(this.a)
            }
        }));
        c.a.count.value += 1;
        c.a.s = !1;
        return c
    };
    ze.prototype["delete"] = function() {
        this.a.c || re(this);
        this.a.s && !this.a.v && P("Object already scheduled for deletion");
        te(this);
        ue(this.a);
        this.a.v || (this.a.h = void 0, this.a.c = void 0)
    };
    ze.prototype.isDeleted = function() {
        return !this.a.c
    };
    ze.prototype.deleteLater = function() {
        this.a.c || re(this);
        this.a.s && !this.a.v && P("Object already scheduled for deletion");
        xe.push(this);
        1 === xe.length && we && we(ye);
        this.a.s = !0;
        return this
    };
    df.prototype.S = function(c) {
        this.L && (c = this.L(c));
        return c
    };
    df.prototype.J = function(c) {
        this.m && this.m(c)
    };
    df.prototype.argPackAdvance = 8;
    df.prototype.readValueFromPointer = Oc;
    df.prototype.deleteObject = function(c) {
        if (null !== c) c["delete"]()
    };
    df.prototype.fromWireType = function(c) {
        function e() {
            return this.C ? cf(this.b.u, {
                f: this.X,
                c: k,
                i: this,
                h: c
            }) : cf(this.b.u, {
                f: this,
                c: c
            })
        }
        var k = this.S(c);
        if (!k) return this.J(c), null;
        var p = Me(this.b, k);
        if (void 0 !== p) {
            if (0 === p.a.count.value) return p.a.c = k, p.a.h = c, p.clone();
            p = p.clone();
            this.J(c);
            return p
        }
        p = this.b.R(k);
        p = Ae[p];
        if (!p) return e.call(this);
        p = this.B ? p.M : p.pointerType;
        var l = Ke(k, this.b, p.b);
        return null === l ? e.call(this) : this.C ? cf(p.b.u, {
            f: p,
            c: l,
            i: this,
            h: c
        }) : cf(p.b.u, {
            f: p,
            c: l
        })
    };
    I.getInheritedInstanceCount = function() {
        return Object.keys(Le).length
    };
    I.getLiveInheritedInstances = function() {
        var c = [],
            e;
        for (e in Le) Le.hasOwnProperty(e) && c.push(Le[e]);
        return c
    };
    I.flushPendingDeletes = ye;
    I.setDelayFunction = function(c) {
        we = c;
        xe.length && we && we(ye)
    };
    gf = I.UnboundTypeError = Uc("UnboundTypeError");
    I.count_emval_handles = function() {
        for (var c = 0, e = 5; e < qf.length; ++e) void 0 !== qf[e] && ++c;
        return c
    };
    I.get_first_emval = function() {
        for (var c = 5; c < qf.length; ++c)
            if (void 0 !== qf[c]) return qf[c];
        return null
    };
    var Ic = "function" === typeof atob ? atob : function(c) {
            var e = "",
                k = 0;
            c = c.replace(/[^A-Za-z0-9\+\/=]/g, "");
            do {
                var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(k++)),
                    l = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(k++)),
                    q = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(k++)),
                    F = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(k++));
                p = p << 2 | l >> 4;
                l = (l & 15) << 4 |
                    q >> 2;
                var r = (q & 3) << 6 | F;
                e += String.fromCharCode(p);
                64 !== q && (e += String.fromCharCode(l));
                64 !== F && (e += String.fromCharCode(r))
            } while (k < c.length);
            return e
        },
        Na = {
            __assert_fail: function(c, e, k, p) {
                Xa("Assertion failed: " + (c ? jb(c, void 0) : "") + ", at: " + [e ? e ? jb(e, void 0) : "" : "unknown filename", k, p ? p ? jb(p, void 0) : "" : "unknown function"])
            },
            __cxa_allocate_exception: function(c) {
                return wf(c)
            },
            __cxa_throw: function(c) {
                "uncaught_exception" in Lc ? Lc.I++ : Lc.I = 1;
                throw c;
            },
            _embind_finalize_value_object: function(c) {
                var e = Mc[c];
                delete Mc[c];
                var k = e.G,
                    p = e.m,
                    l = e.K,
                    q = l.map(function(c) {
                        return c.V
                    }).concat(l.map(function(c) {
                        return c.aa
                    }));
                ke([c], q, function(c) {
                    var q = {};
                    l.forEach(function(e, k) {
                        var p = c[k],
                            r = e.T,
                            z = e.U,
                            B = c[k + l.length],
                            F = e.$,
                            Yb = e.ba;
                        q[e.O] = {
                            read: function(c) {
                                return p.fromWireType(r(z, c))
                            },
                            write: function(c, e) {
                                var k = [];
                                F(Yb, c, B.toWireType(k, e));
                                Nc(k)
                            }
                        }
                    });
                    return [{
                        name: e.name,
                        fromWireType: function(c) {
                            var e = {},
                                k;
                            for (k in q) e[k] = q[k].read(c);
                            p(c);
                            return e
                        },
                        toWireType: function(c, e) {
                            for (var l in q)
                                if (!(l in e)) throw new TypeError('Missing field:  "' +
                                    l + '"');
                            var r = k();
                            for (l in q) q[l].write(r, e[l]);
                            null !== c && c.push(p, r);
                            return r
                        },
                        argPackAdvance: 8,
                        readValueFromPointer: Oc,
                        l: p
                    }]
                })
            },
            _embind_register_bool: function(c, e, k, p, l) {
                var q = me(k);
                e = oe(e);
                le(c, {
                    name: e,
                    fromWireType: function(c) {
                        return !!c
                    },
                    toWireType: function(c, e) {
                        return e ? p : l
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: function(c) {
                        if (1 === k) var l = Nb;
                        else if (2 === k) l = tb;
                        else if (4 === k) l = xb;
                        else throw new TypeError("Unknown boolean type size: " + e);
                        return this.fromWireType(l[c >> q])
                    },
                    l: null
                })
            },
            _embind_register_class: function(c,
                e, k, p, l, q, F, r, B, z, y, H, aa) {
                y = oe(y);
                q = ff(l, q);
                r && (r = ff(F, r));
                z && (z = ff(B, z));
                aa = ff(H, aa);
                var W = Sc(y);
                Ce(W, function() {
                    lf("Cannot construct " + y + " due to unbound types", [p])
                });
                ke([c, e, k], p ? [p] : [], function(e) {
                    e = e[0];
                    if (p) var k = e.b,
                        l = k.u;
                    else l = ze.prototype;
                    e = Tc(W, function() {
                        if (Object.getPrototypeOf(this) !== B) throw new pe("Use 'new' to construct " + y);
                        if (void 0 === F.o) throw new pe(y + " has no accessible constructor");
                        var c = F.o[arguments.length];
                        if (void 0 === c) throw new pe("Tried to invoke ctor of " + y + " with invalid number of parameters (" +
                            arguments.length + ") - expected (" + Object.keys(F.o).toString() + ") parameters instead!");
                        return c.apply(this, arguments)
                    });
                    var B = Object.create(l, {
                        constructor: {
                            value: e
                        }
                    });
                    e.prototype = B;
                    var F = new De(y, e, B, aa, k, q, r, z);
                    k = new df(y, F, !0, !1);
                    l = new df(y + "*", F, !1, !1);
                    var H = new df(y + " const*", F, !1, !0);
                    Ae[c] = {
                        pointerType: l,
                        M: H
                    };
                    ef(W, e);
                    return [k, l, H]
                })
            },
            _embind_register_class_constructor: function(c, e, k, p, l, q) {
                0 < e || Xa("Assertion failed: undefined");
                var F = mf(e, k);
                l = ff(p, l);
                var r = [q],
                    B = [];
                ke([], [c], function(c) {
                    c = c[0];
                    var k = "constructor " + c.name;
                    void 0 === c.b.o && (c.b.o = []);
                    if (void 0 !== c.b.o[e - 1]) throw new pe("Cannot register multiple constructors with identical number of parameters (" + (e - 1) + ") for class '" + c.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
                    c.b.o[e - 1] = function() {
                        lf("Cannot construct " + c.name + " due to unbound types", F)
                    };
                    ke([], F, function(p) {
                        c.b.o[e - 1] = function() {
                            arguments.length !== e - 1 && P(k + " called with " + arguments.length + " arguments, expected " +
                                (e - 1));
                            B.length = 0;
                            r.length = e;
                            for (var c = 1; c < e; ++c) r[c] = p[c].toWireType(B, arguments[c - 1]);
                            c = l.apply(null, r);
                            Nc(B);
                            return p[0].fromWireType(c)
                        };
                        return []
                    });
                    return []
                })
            },
            _embind_register_class_function: function(c, e, k, p, l, q, F, r) {
                var B = mf(k, p);
                e = oe(e);
                q = ff(l, q);
                ke([], [c], function(c) {
                    function l() {
                        lf("Cannot call " + p + " due to unbound types", B)
                    }
                    c = c[0];
                    var p = c.name + "." + e;
                    r && c.b.Y.push(e);
                    var z = c.b.u,
                        W = z[e];
                    void 0 === W || void 0 === W.g && W.className !== c.name && W.A === k - 2 ? (l.A = k - 2, l.className = c.name, z[e] = l) : (Be(z, e, p),
                        z[e].g[k - 2] = l);
                    ke([], B, function(l) {
                        l = of (p, l, c, q, F);
                        void 0 === z[e].g ? (l.A = k - 2, z[e] = l) : z[e].g[k - 2] = l;
                        return []
                    });
                    return []
                })
            },
            _embind_register_emval: function(c, e) {
                e = oe(e);
                le(c, {
                    name: e,
                    fromWireType: function(c) {
                        var e = qf[c].value;
                        rf(c);
                        return e
                    },
                    toWireType: function(c, e) {
                        return Ie(e)
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: Oc,
                    l: null
                })
            },
            _embind_register_float: function(c, e, k) {
                k = me(k);
                e = oe(e);
                le(c, {
                    name: e,
                    fromWireType: function(c) {
                        return c
                    },
                    toWireType: function(c, e) {
                        if ("number" !== typeof e && "boolean" !== typeof e) throw new TypeError('Cannot convert "' +
                            Ge(e) + '" to ' + this.name);
                        return e
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: sf(e, k),
                    l: null
                })
            },
            _embind_register_function: function(c, e, k, p, l, q) {
                var F = mf(e, k);
                c = oe(c);
                l = ff(p, l);
                Ce(c, function() {
                    lf("Cannot call " + c + " due to unbound types", F)
                }, e - 1);
                ke([], F, function(k) {
                    ef(c, of (c, [k[0], null].concat(k.slice(1)), null, l, q), e - 1);
                    return []
                })
            },
            _embind_register_integer: function(c, e, k, p, l) {
                function q(c) {
                    return c
                }
                e = oe(e); - 1 === l && (l = 4294967295);
                var F = me(k);
                if (0 === p) {
                    var r = 32 - 8 * k;
                    q = function(c) {
                        return c << r >>> r
                    }
                }
                var B = -1 !=
                    e.indexOf("unsigned");
                le(c, {
                    name: e,
                    fromWireType: q,
                    toWireType: function(c, k) {
                        if ("number" !== typeof k && "boolean" !== typeof k) throw new TypeError('Cannot convert "' + Ge(k) + '" to ' + this.name);
                        if (k < p || k > l) throw new TypeError('Passing a number "' + Ge(k) + '" from JS side to C/C++ side to an argument of type "' + e + '", which is outside the valid range [' + p + ", " + l + "]!");
                        return B ? k >>> 0 : k | 0
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: tf(e, F, 0 !== p),
                    l: null
                })
            },
            _embind_register_memory_view: function(c, e, k) {
                function p(c) {
                    c >>=
                        2;
                    return new l(Mb, Ob[c + 1], Ob[c])
                }
                var l = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][e];
                k = oe(k);
                le(c, {
                    name: k,
                    fromWireType: p,
                    argPackAdvance: 8,
                    readValueFromPointer: p
                }, {
                    W: !0
                })
            },
            _embind_register_std_string: function(c, e) {
                e = oe(e);
                var k = "std::string" === e;
                le(c, {
                    name: e,
                    fromWireType: function(c) {
                        var e = Ob[c >> 2];
                        if (k)
                            for (var p = c + 4, F = 0; F <= e; ++F) {
                                var r = c + 4 + F;
                                if (0 == kb[r] || F == e) {
                                    p = p ? jb(p, r - p) : "";
                                    if (void 0 === B) var B = p;
                                    else B += String.fromCharCode(0), B += p;
                                    p = r + 1
                                }
                            } else {
                                B =
                                    Array(e);
                                for (F = 0; F < e; ++F) B[F] = String.fromCharCode(kb[c + 4 + F]);
                                B = B.join("")
                            }
                        kf(c);
                        return B
                    },
                    toWireType: function(c, e) {
                        e instanceof ArrayBuffer && (e = new Uint8Array(e));
                        var l = "string" === typeof e;
                        l || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array || P("Cannot pass non-string to std::string");
                        var p = (k && l ? function() {
                                for (var c = 0, k = 0; k < e.length; ++k) {
                                    var l = e.charCodeAt(k);
                                    55296 <= l && 57343 >= l && (l = 65536 + ((l & 1023) << 10) | e.charCodeAt(++k) & 1023);
                                    127 >= l ? ++c : c = 2047 >= l ? c + 2 : 65535 >= l ? c + 3 : c +
                                        4
                                }
                                return c
                            } : function() {
                                return e.length
                            })(),
                            r = wf(4 + p + 1);
                        Ob[r >> 2] = p;
                        if (k && l) lb(e, r + 4, p + 1);
                        else if (l)
                            for (l = 0; l < p; ++l) {
                                var B = e.charCodeAt(l);
                                255 < B && (kf(r), P("String has UTF-16 code units that do not fit in 8 bits"));
                                kb[r + 4 + l] = B
                            } else
                                for (l = 0; l < p; ++l) kb[r + 4 + l] = e[l];
                        null !== c && c.push(kf, r);
                        return r
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: Oc,
                    l: function(c) {
                        kf(c)
                    }
                })
            },
            _embind_register_std_wstring: function(c, e, k) {
                k = oe(k);
                if (2 === e) var p = nb,
                    l = ub,
                    q = vb,
                    F = function() {
                        return ob
                    },
                    r = 1;
                else 4 === e && (p = wb, l = yb, q = zb, F = function() {
                        return Ob
                    },
                    r = 2);
                le(c, {
                    name: k,
                    fromWireType: function(c) {
                        for (var k = Ob[c >> 2], l = F(), q, B = c + 4, W = 0; W <= k; ++W) {
                            var ea = c + 4 + W * e;
                            if (0 == l[ea >> r] || W == k) B = p(B, ea - B), void 0 === q ? q = B : (q += String.fromCharCode(0), q += B), B = ea + e
                        }
                        kf(c);
                        return q
                    },
                    toWireType: function(c, p) {
                        "string" !== typeof p && P("Cannot pass non-string to C++ string type " + k);
                        var y = q(p),
                            z = wf(4 + y + e);
                        Ob[z >> 2] = y >> r;
                        l(p, z + 4, y + e);
                        null !== c && c.push(kf, z);
                        return z
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: Oc,
                    l: function(c) {
                        kf(c)
                    }
                })
            },
            _embind_register_value_object: function(c, e, k, p, l,
                q) {
                Mc[c] = {
                    name: oe(e),
                    G: ff(k, p),
                    m: ff(l, q),
                    K: []
                }
            },
            _embind_register_value_object_field: function(c, e, k, p, l, q, F, r, B, z) {
                Mc[c].K.push({
                    O: oe(e),
                    V: k,
                    T: ff(p, l),
                    U: q,
                    aa: F,
                    $: ff(r, B),
                    ba: z
                })
            },
            _embind_register_void: function(c, e) {
                e = oe(e);
                le(c, {
                    da: !0,
                    name: e,
                    argPackAdvance: 0,
                    fromWireType: function() {},
                    toWireType: function() {}
                })
            },
            _emval_decref: rf,
            _emval_incref: function(c) {
                4 < c && (qf[c].H += 1)
            },
            _emval_take_value: function(c, e) {
                var k = Qc[c];
                void 0 === k && P("_emval_take_value has unknown type " + hf(c));
                c = k.readValueFromPointer(e);
                return Ie(c)
            },
            abort: function() {
                Xa()
            },
            emscripten_get_sbrk_ptr: function() {
                return 5152
            },
            emscripten_memcpy_big: function(c, e, k) {
                kb.copyWithin(c, e, e + k)
            },
            emscripten_resize_heap: function() {
                Xa("OOM")
            },
            getTempRet0: function() {
                return Ca
            },
            memory: Oa,
            setTempRet0: function(c) {
                Ca = c
            },
            table: Pa
        };
    (function() {
        function c(c) {
            I.asm = c.exports;
            Bc--;
            I.monitorRunDependencies && I.monitorRunDependencies(Bc);
            0 == Bc && (null !== Cc && (clearInterval(Cc), Cc = null), Dc && (c = Dc, Dc = null, c()))
        }

        function e(e) {
            c(e.instance)
        }

        function k(c) {
            return Jc().then(function() {
                return Qa()
            }).then(c, function(c) {
                ya("failed to asynchronously prepare wasm: " + c);
                Xa(c)
            })
        }
        var p = {
            env: Na,
            wasi_snapshot_preview1: Na
        };
        Bc++;
        I.monitorRunDependencies && I.monitorRunDependencies(Bc);
        if (I.instantiateWasm) try {
            return I.instantiateWasm(p, c)
        } catch (l) {
            return ya("Module.instantiateWasm callback failed with error: " +
                l), !1
        }(function() {
            if (Da || "function" !== typeof Wa.instantiateStreaming || Ec(Fc) || "function" !== typeof fetch) return k(e);
            fetch(Fc, {
                credentials: "same-origin"
            }).then(function(c) {
                return Wa.instantiateStreaming(c, p).then(e, function(c) {
                    ya("wasm streaming compile failed: " + c);
                    ya("falling back to ArrayBuffer instantiation");
                    return k(e)
                })
            })
        })();
        return {}
    })();
    var Kc = I.___wasm_call_ctors = function() {
            return (Kc = I.___wasm_call_ctors = I.asm.__wasm_call_ctors).apply(null, arguments)
        },
        jf = I.___getTypeName = function() {
            return (jf = I.___getTypeName = I.asm.__getTypeName).apply(null, arguments)
        };
    I.___embind_register_native_and_builtin_types = function() {
        return (I.___embind_register_native_and_builtin_types = I.asm.__embind_register_native_and_builtin_types).apply(null, arguments)
    };
    I.___errno_location = function() {
        return (I.___errno_location = I.asm.__errno_location).apply(null, arguments)
    };
    var wf = I._malloc = function() {
        return (wf = I._malloc = I.asm.malloc).apply(null, arguments)
    };
    I._setThrew = function() {
        return (I._setThrew = I.asm.setThrew).apply(null, arguments)
    };
    I.stackSave = function() {
        return (I.stackSave = I.asm.stackSave).apply(null, arguments)
    };
    I.stackRestore = function() {
        return (I.stackRestore = I.asm.stackRestore).apply(null, arguments)
    };
    I.stackAlloc = function() {
        return (I.stackAlloc = I.asm.stackAlloc).apply(null, arguments)
    };
    var kf = I._free = function() {
            return (kf = I._free = I.asm.free).apply(null, arguments)
        },
        Ga = I.__growWasmMemory = function() {
            return (Ga = I.__growWasmMemory = I.asm.__growWasmMemory).apply(null, arguments)
        };
    I.dynCall_i = function() {
        return (I.dynCall_i = I.asm.dynCall_i).apply(null, arguments)
    };
    I.dynCall_ii = function() {
        return (I.dynCall_ii = I.asm.dynCall_ii).apply(null, arguments)
    };
    I.dynCall_vi = function() {
        return (I.dynCall_vi = I.asm.dynCall_vi).apply(null, arguments)
    };
    I.dynCall_vii = function() {
        return (I.dynCall_vii = I.asm.dynCall_vii).apply(null, arguments)
    };
    I.dynCall_v = function() {
        return (I.dynCall_v = I.asm.dynCall_v).apply(null, arguments)
    };
    I.dynCall_vd = function() {
        return (I.dynCall_vd = I.asm.dynCall_vd).apply(null, arguments)
    };
    I.dynCall_iiii = function() {
        return (I.dynCall_iiii = I.asm.dynCall_iiii).apply(null, arguments)
    };
    I.dynCall_iii = function() {
        return (I.dynCall_iii = I.asm.dynCall_iii).apply(null, arguments)
    };
    I.dynCall_viii = function() {
        return (I.dynCall_viii = I.asm.dynCall_viii).apply(null, arguments)
    };
    I.dynCall_viiii = function() {
        return (I.dynCall_viiii = I.asm.dynCall_viiii).apply(null, arguments)
    };
    I.dynCall_vidd = function() {
        return (I.dynCall_vidd = I.asm.dynCall_vidd).apply(null, arguments)
    };
    I.dynCall_vid = function() {
        return (I.dynCall_vid = I.asm.dynCall_vid).apply(null, arguments)
    };
    I.dynCall_dii = function() {
        return (I.dynCall_dii = I.asm.dynCall_dii).apply(null, arguments)
    };
    I.dynCall_viid = function() {
        return (I.dynCall_viid = I.asm.dynCall_viid).apply(null, arguments)
    };
    I.dynCall_iiiff = function() {
        return (I.dynCall_iiiff = I.asm.dynCall_iiiff).apply(null, arguments)
    };
    I.dynCall_iiiii = function() {
        return (I.dynCall_iiiii = I.asm.dynCall_iiiii).apply(null, arguments)
    };
    I.dynCall_viidd = function() {
        return (I.dynCall_viidd = I.asm.dynCall_viidd).apply(null, arguments)
    };
    I.dynCall_iidiiii = function() {
        return (I.dynCall_iidiiii = I.asm.dynCall_iidiiii).apply(null, arguments)
    };
    I.dynCall_viiiiii = function() {
        return (I.dynCall_viiiiii = I.asm.dynCall_viiiiii).apply(null, arguments)
    };
    I.dynCall_viiiii = function() {
        return (I.dynCall_viiiii = I.asm.dynCall_viiiii).apply(null, arguments)
    };

    var xf;
    Dc = function yf() {
        xf || zf();
        xf || (Dc = yf)
    };

    function zf() {
        Sb(Tb);
        Sb(Ub);
        Sb(Wb)
    }

    return I;
})();