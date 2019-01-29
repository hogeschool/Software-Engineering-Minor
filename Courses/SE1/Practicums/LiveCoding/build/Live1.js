"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Int = /** @class */ (function () {
    function Int() {
        this.value = 0;
    }
    Int.prototype.incr = function () {
        this.value = this.value + 1;
    };
    return Int;
}());
var EvenCounter = /** @class */ (function () {
    function EvenCounter() {
        this.number = new Int();
    }
    EvenCounter.prototype.tick = function () {
        this.number.incr();
        this.number.incr();
    };
    return EvenCounter;
}());
var RegularCounter = /** @class */ (function () {
    function RegularCounter() {
        this.number = new Int();
    }
    RegularCounter.prototype.tick = function () {
        this.number.incr();
    };
    return RegularCounter;
}());
var Fun = function (f) {
    return {
        f: f,
        then: function (g) {
            return then(this, g);
        }
    };
};
var incr = Fun(function (x) { return x + 1; });
var convert = Fun(function (x) { return String(x); });
//f: (_: a) => b
//g: (_: b) => c
var then = function (function1, function2) {
    var result = function (x) {
        return function2.f(function1.f(x));
    };
    return Fun(result);
};
exports.main = function () {
    //console.log(incr.f(5))
    //console.log(then(incr,then(incr,convert)).f(5))
    console.log(incr.then(incr).then(convert).f(5));
};
exports.main();
