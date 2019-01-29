"use strict";
exports.__esModule = true;
var Lesson1_1 = require("./Lesson1");
var succ = Lesson1_1.Fun(function (n) { return exports.Natural(n.value.f({}) + 1); });
exports.Natural = function (v) {
    return {
        value: Lesson1_1.Fun(function (_) { return v; }),
        succ: function () {
            return exports.Natural(this.value.f({}) + 1);
        },
        add: function (n) {
            var n_succ = n.value.then(succ.repeat());
            return n_succ.f({}).f(this);
        }
    };
};
