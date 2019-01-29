"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var practicum3_1 = require("../Lesson3/practicum3");
exports.None = function () {
    return {
        kind: "none",
        then: function (k) {
            return exports.map_Option(k).then(exports.join_Option()).f(this);
        }
    };
};
exports.Some = function (content) {
    return {
        kind: "some",
        value: content,
        then: function (k) {
            return exports.map_Option(k).then(exports.join_Option()).f(this);
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
var bind_List = function (l, k) {
    return exports.map_List2(k).then(exports.join_List()).f(l);
};
exports.Empty = function () {
    return {
        kind: "empty",
        then: function (k) {
            return bind_List(this, k);
        }
    };
};
exports.Cons = function (first, rest) {
    return {
        kind: "::",
        head: first,
        tail: rest,
        then: function (k) {
            return bind_List(this, k);
        }
    };
};
exports.map_List2 = function (mapper) {
    var g = function (l) {
        if (l.kind == "empty") {
            return exports.Empty();
        }
        else {
            var newList = g(l.tail);
            var newHead = mapper.f(l.head);
            return exports.Cons(newHead, newList);
        }
    };
    return practicum3_1.Fun(g);
};
//unit for the list functor
exports.unit_List = function () {
    return practicum3_1.Fun(function (x) { return exports.Cons(x, exports.Empty()); });
};
//join for the list functor
//[[1;2;3];[4;5];[6]] -> [1;2;3;4;5;6] <- [1;2;3] concat [4;5] concat [6]
var concat = function (l1, l2) {
    if (l1.kind == "empty") {
        return l2;
    }
    else {
        var restConcat = concat(l1.tail, l2);
        return exports.Cons(l1.head, restConcat);
    }
};
//[1;2;3] concat [4;5]
//[2;3] concat[4;5]
//[3] concat [4;5]
//[] concat [4;5] -> [4;5]
//[3] concat [4;5] -> [3;4;5]
//[2;3] concat [4;5] -> [2;3;4;5]
//[1;2;3] concat [4;5] -> [1;2;3;4;5]
exports.join_List = function () {
    var g = function (l) {
        if (l.kind == "empty") {
            return exports.Empty();
        }
        else if (l.tail.kind == "empty") {
            return l.head;
        }
        else {
            var flattened = concat(l.head, l.tail.head);
            var flattenRest = g(l.tail.tail);
            return concat(flattened, flattenRest);
        }
    };
    return practicum3_1.Fun(g);
};
exports.printList = function () {
    var g = function (l) {
        if (l.kind == "empty") {
            return "";
        }
        else {
            return (String(l.head)) + " " + (g(l.tail));
        }
    };
    return practicum3_1.Fun(g);
};
//concat ([1;2;3],[3;4]) -> [1;2;3;3;4]
//concat ([2;3],[3;4]) -> [2;3;3;4]
//concat ([3],[3;4]) -> [3;3;4]
//concat ([],[3;4]) -> [3;4]
//list with one element
// let incr = Fun<number, number>(x => x + 1)
// let l = Cons(6,Cons(5,Empty()))
// let r = Cons(-1,Cons(5,Empty()))
// let z = Cons(-1,Cons(5,Empty()))
// let ll = Cons(l,Cons(r, Cons(z, Empty())))
// console.log(printList(join_List().f(ll)))
