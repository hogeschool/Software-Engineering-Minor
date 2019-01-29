"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fun = function (f) {
    return {
        f: f,
        then: function (g) {
            var _this = this;
            return Fun(function (x) {
                return g.f(_this.f(x));
            });
        }
    };
};
var pair = function (fst, snd) {
    return { fst: fst, snd: snd };
};
//string monoid
var zero_String = Fun(function (_) { return ""; });
var plus_String = Fun(function (p) {
    return p.fst + p.snd;
});
var empty = function () { return { kind: "empty" }; };
var cons = function (head, tail) {
    return {
        kind: "cons",
        head: head,
        tail: tail
    };
};
var zero_List = function () {
    return Fun(function (_) { return empty(); });
};
var concat = function (p) {
    if (p.fst.kind == "empty") {
        return p.snd;
    }
    else {
        var rest = concat(pair(p.fst.tail, p.snd));
        return cons(p.fst.head, rest);
    }
};
var sum_List = function () {
    return Fun(concat);
};
var map_Identity = function (_) {
    return Fun(function (x) { return x; });
};
exports.main = function () {
    var s1 = "Hi";
    var s2 = " noobs!";
    var l1 = cons(3, cons(5, cons(4, empty())));
    var l2 = cons(1, cons(4, cons(8, cons(10, cons(-2, empty())))));
    var cl = sum_List().f(pair(l1, l2));
    console.log(cl);
};
exports.main();
//# sourceMappingURL=practicum3.js.map