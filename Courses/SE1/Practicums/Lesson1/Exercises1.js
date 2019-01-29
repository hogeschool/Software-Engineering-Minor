"use strict";
exports.__esModule = true;
var Lesson1_1 = require("./Lesson1");
var incr = Lesson1_1.Fun(function (x) { return x + 1; });
var double = Lesson1_1.Fun(function (x) { return x * 2; });
var square = Lesson1_1.Fun(function (x) { return x * x; });
var isPositive = Lesson1_1.Fun(function (x) { return x > 0; });
var isEven = Lesson1_1.Fun(function (x) { return x % 2 == 0; });
var invert = Lesson1_1.Fun(function (x) { return -x; });
var squareRoot = Lesson1_1.Fun(function (x) { return Math.sqrt(x); });
var ifThenElse = function (p, _then, _else) {
    return Lesson1_1.Fun(function (x) {
        if (p.f(x)) {
            return _then.f(x);
        }
        else {
            return _else.f(x);
        }
    });
};
//implementation
//1. Increment a number and then check if it is positive
var ex1 = incr.then(isPositive);
//2. Increment a number, double it and check if it is positive
var ex2 = incr.then(double).then(isPositive);
//3. Implement a function that computes the square root if the input is positive, otherwise inverts it and then performs the square root
var ex3 = ifThenElse(Lesson1_1.Fun(function (x) { return x >= 0; }), squareRoot, invert.then(squareRoot));
//4. Square a number and then if it is even invert it otherwise do the square root
var ex4 = square.then(ifThenElse(isEven, invert, squareRoot));
exports.main = function () {
    console.log(ex1.f(4));
    console.log(ex2.f(-3));
    console.log(ex3.f(-9));
    console.log(ex4.f(3));
    console.log(incr.repeatUntil().f(Lesson1_1.Fun(function (x) { return x >= 5; })).f(0));
};
exports.main();
