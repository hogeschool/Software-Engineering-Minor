"use strict";
//DO NOT USE CLASSES IN THIS COURSE!!! ONLY FOR THIS EXAMPLE!!!!
var Int = /** @class */ (function () {
    function Int() {
        this.value = 0;
    }
    Int.prototype.incr = function () {
        this.value++;
    };
    Int.prototype.decr = function () {
        this.value--;
    };
    return Int;
}());
var EvenCounter = /** @class */ (function () {
    function EvenCounter() {
        this.value = new Int();
    }
    EvenCounter.prototype.tick = function () {
        this.value.incr();
        this.value.incr();
    };
    return EvenCounter;
}());
var Counter = /** @class */ (function () {
    function Counter() {
        this.value = new Int();
    }
    Counter.prototype.tick = function () {
        this.value.incr();
    };
    return Counter;
}());
var ec = new EvenCounter();
var rc = new Counter();
ec.tick();
rc.tick();
console.log(ec.value);
console.log(rc.value);
//THIS IS NOT GOOD!!!
