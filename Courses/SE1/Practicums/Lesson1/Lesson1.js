"use strict";
exports.__esModule = true;
exports.id = function () {
    return exports.Fun(function (x) { return x; });
};
var repeat = function (f, n) {
    if (n <= 0) {
        return exports.id();
    }
    else {
        return f.then(repeat(f, n - 1));
    }
};
var repeatUntil = function (f, predicate) {
    var g = function (x) {
        if (predicate.f(x)) {
            return exports.id().f(x);
        }
        else {
            return f.then(repeatUntil(f, predicate)).f(x);
        }
    };
    return exports.Fun(g);
};
exports.Fun = function (f) {
    return {
        f: f,
        then: function (g) {
            var _this = this;
            return exports.Fun(function (a) { return g.f(_this.f(a)); });
        },
        repeat: function () {
            var _this = this;
            return exports.Fun(function (n) { return repeat(_this, n); });
        },
        repeatUntil: function () {
            var _this = this;
            return exports.Fun(function (p) { return repeatUntil(_this, p); });
        }
    };
};
