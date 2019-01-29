"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var practicum3_1 = require("../Lesson3/practicum3");
var Empty = function () {
    return { kind: "empty" };
};
var List = function (head, tail) {
    return {
        kind: "cons",
        head: head,
        tail: tail
    };
};
var map_List = function (f) {
    var g = function (l) {
        if (l.kind == "empty") {
            return Empty();
        }
        else {
            var newTail = g(l.tail);
            return List(f.f(l.head), newTail);
        }
    };
    return practicum3_1.Fun(g);
};
var concat = function (l2) {
    var g = function (l1) {
        if (l1.kind == "empty") {
            return l2;
        }
        else {
            var c = g(l1.tail);
            return List(l1.head, c);
        }
    };
    return practicum3_1.Fun(g);
};
var id = function () { return practicum3_1.Fun(function (x) { return x; }); };
var listString = function () {
    var g = function (l) {
        if (l.kind == "empty") {
            return "";
        }
        else {
            return String(l.head) + " " + g(l.tail);
        }
    };
    return practicum3_1.Fun(g);
};
var join_List = function () {
    var g = function (l) {
        if (l.kind == "empty") {
            return l;
        }
        else {
            var rest = g(l.tail);
            return concat(rest).f(l.head);
        }
    };
    return practicum3_1.Fun(g);
};
var bind_List = function (k) {
    return map_List(k).then(join_List());
};
// var l1 = List(5, List(-3, List(2, List(0, Empty()))));
// var l2 = List(4, List(-3, List(2, List(0, Empty()))));
// var l3 = List(3, List(0, Empty()));
// var ll = List(l1, List(l2, List(l3, Empty())));
// console.log(concat(l2).then(listString()).f(l1));
// console.log(join_List().then(listString()).f(ll));
