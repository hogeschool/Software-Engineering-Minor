"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var practicum3_1 = require("../Lesson3/practicum3");
var map_Fun_n = function (f) {
    return practicum3_1.Fun(function (g) {
        return g.then(f);
    });
};
var unit_Fun_n = function () {
    return practicum3_1.Fun(function (x) {
        return practicum3_1.Fun(function (i) { return x; });
    });
};
var join_Fun_n = function () {
    return practicum3_1.Fun(function (f) {
        return practicum3_1.Fun(function (i) { return f.f(i).f(i); });
    });
};
exports.None = function () {
    return {
        kind: "none",
        bind: function (k) {
            return exports.bind_Option(this, k);
        }
    };
};
exports.Some = function (content) {
    return {
        kind: "some",
        value: content,
        bind: function (k) {
            return exports.bind_Option(this, k);
        }
    };
};
exports.map_Option = function (mapper) {
    var g = function (opt) {
        if (opt.kind == "none") {
            return exports.None();
        }
        else {
            var newValue = mapper.f(opt.value);
            return exports.Some(newValue);
        }
    };
    return practicum3_1.Fun(g);
};
exports.id = function () {
    return practicum3_1.Fun(function (x) { return x; });
};
//unit || return: a -> Option<a>
exports.unit_Option = function () {
    var g = function (x) {
        return exports.Some(x);
    };
    return practicum3_1.Fun(g);
};
//join: Option<Option<a>> -> Option<a>
exports.join_Option = function () {
    var g = function (opt) {
        if (opt.kind == "none") {
            return exports.None();
        }
        else {
            return opt.value;
        }
    };
    return practicum3_1.Fun(g);
};
exports.bind_Option = function (opt, k) {
    return exports.map_Option(k).then(exports.join_Option()).f(opt);
};
var safe_div = function (a, b) {
    return b == 0 ? exports.None() : exports.Some(a / b);
};
// }) & {
//   bind: <b>(this: Exception<a>, k: Fun<a, Exception<b>>) => Exception<b>
// }
var Throw = function (msg) {
    return {
        kind: "exception",
        message: msg
    };
};
var Result = function (content) {
    return {
        kind: "some",
        value: content
    };
};
var map_Exception = function (f) {
    var g = (function (res) {
        if (res.kind == "exception") {
            return Throw(res.message);
        }
        else {
            return Result(f.f(res.value));
        }
    });
    return practicum3_1.Fun(g);
};
var unit_Exception = function () {
    var g = function (x) {
        return Result(x);
    };
    return practicum3_1.Fun(g);
};
var join_Exception = function () {
    var g = function (res) {
        if (res.kind == "exception") {
            return Throw(res.message);
        }
        else {
            return res.value;
        }
    };
    return practicum3_1.Fun(g);
};
var bind_Exception = function (m, k) {
    return map_Exception(k).then(join_Exception()).f(m);
};
var inl = function () { return practicum3_1.Fun(function (a) { return ({ kind: "left", value: a }); }); };
var inr = function () { return practicum3_1.Fun(function (b) { return ({ kind: "right", value: b }); }); };
var map_Either = function (f, g) {
    return practicum3_1.Fun(function (x) {
        return x.kind == "left" ? f.then(inl()).f(x.value) : g.then(inr()).f(x.value);
    });
};
var none = function () { return inl().f({}); };
var some = function () { return inr(); };
var map_Option2 = function (f) {
    return map_Either(exports.id(), f);
};
var unit_Either = function () { return inr(); };
