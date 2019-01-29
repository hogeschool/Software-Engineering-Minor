"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fun = function (f) {
    return {
        f: f,
        then: function (g) {
            var _this = this;
            return exports.Fun(function (x) {
                return g.f(_this.f(x));
            });
        }
    };
};
var pair = function (fst, snd) {
    return { fst: fst, snd: snd };
};
//string monoid
var zero_String = exports.Fun(function (_) { return ""; });
var plus_String = exports.Fun(function (p) {
    return p.fst + p.snd;
});
exports.empty = function () { return { kind: "empty" }; };
exports.cons = function (head, tail) {
    return {
        kind: "cons",
        head: head,
        tail: tail
    };
};
var zero_List = function () {
    return exports.Fun(function (_) { return exports.empty(); });
};
var concat = function (p) {
    if (p.fst.kind == "empty") {
        return p.snd;
    }
    else {
        var rest = concat(pair(p.fst.tail, p.snd));
        return exports.cons(p.fst.head, rest);
    }
};
var sum_List = function () {
    return exports.Fun(concat);
};
var map_Identity = function (_) {
    return exports.Fun(function (x) { return x; });
};
exports.main = function () {
    var s1 = "Hi";
    var s2 = " noobs!";
    var l1 = exports.cons(3, exports.cons(5, exports.cons(4, exports.empty())));
    var l2 = exports.cons(1, exports.cons(4, exports.cons(8, exports.cons(10, exports.cons(-2, exports.empty())))));
    var cl = sum_List().f(pair(l1, l2));
    console.log(cl);
};
//main()
