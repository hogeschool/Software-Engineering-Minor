"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var practicum3_1 = require("../Lesson3/practicum3");
var None = function () {
    return {
        kind: "none",
        then: function (k) {
            return map_Option(k).then(join_Option()).f(this);
        }
    };
};
var Some = function (content) {
    return {
        kind: "some",
        value: content,
        then: function (k) {
            return map_Option(k).then(join_Option()).f(this);
        }
    };
};
var map_Option = function (mapper) {
    var g = function (opt) {
        if (opt.kind == "none") {
            return None();
        }
        else {
            var newValue = mapper.f(opt.value);
            return Some(newValue);
        }
    };
    return practicum3_1.Fun(g);
};
var id = function () {
    return practicum3_1.Fun(function (x) { return x; });
};
//unit || return: a -> Option<a>
var unit_Option = function () {
    var g = function (x) {
        return Some(x);
    };
    return practicum3_1.Fun(g);
};
//join: Option<Option<a>> -> Option<a>
var join_Option = function () {
    var g = function (opt) {
        if (opt.kind == "none") {
            return None();
        }
        else {
            return opt.value;
        }
    };
    return practicum3_1.Fun(g);
};
var bind_Option = function (opt, k) {
    return map_Option(k).then(join_Option()).f(opt);
};
var Empty = function () {
    return { kind: "empty" };
};
var Cons = function (first, rest) {
    return {
        kind: "::",
        head: first,
        tail: rest
    };
};
var map_List2 = function (mapper) {
    var g = function (l) {
        if (l.kind == "empty") {
            return Empty();
        }
        else {
            var newList = g(l.tail);
            var newHead = mapper.f(l.head);
            return Cons(newHead, newList);
        }
    };
    return practicum3_1.Fun(g);
};
//unit for the list functor
var unit_List = function () {
    return practicum3_1.Fun(function (x) { return Cons(x, Empty()); });
};
//join for the list functor
//[[1;2;3];[4;5];[6]] -> [1;2;3;4;5;6] <- [1;2;3] concat [4;5] concat [6]
var concat = function (l1, l2) {
    if (l1.kind == "empty") {
        return l2;
    }
    else {
        var restConcat = concat(l1.tail, l2);
        return Cons(l1.head, restConcat);
    }
};
//[1;2;3] concat [4;5]
//[2;3] concat[4;5]
//[3] concat [4;5]
//[] concat [4;5] -> [4;5]
//[3] concat [4;5] -> [3;4;5]
//[2;3] concat [4;5] -> [2;3;4;5]
//[1;2;3] concat [4;5] -> [1;2;3;4;5]
var join_List = function () {
    var g = function (l) {
        if (l.kind == "empty") {
            return Empty();
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
var printList = function (l) {
    if (l.kind == "empty") {
        return "";
    }
    else {
        return (String(l.head)) + " " + (printList(l.tail));
    }
};
//concat ([1;2;3],[3;4]) -> [1;2;3;3;4]
//concat ([2;3],[3;4]) -> [2;3;3;4]
//concat ([3],[3;4]) -> [3;3;4]
//concat ([],[3;4]) -> [3;4]
//list with one element
var incr = practicum3_1.Fun(function (x) { return x + 1; });
var l = Cons(6, Cons(5, Empty()));
var r = Cons(-1, Cons(5, Empty()));
var z = Cons(-1, Cons(5, Empty()));
var ll = Cons(l, Cons(r, Cons(z, Empty())));
console.log(printList(join_List().f(ll)));
