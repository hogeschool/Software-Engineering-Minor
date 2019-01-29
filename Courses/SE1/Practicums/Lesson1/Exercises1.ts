import { Fun, Unit } from "./Lesson1"
import { Natural } from "./Naturals"

let incr = Fun((x: number) => x + 1)
let double = Fun((x: number) => x * 2)
let square = Fun((x: number) => x * x)
let isPositive = Fun<number,boolean>((x: number) => x > 0)
let isEven = Fun((x: number) => x % 2 == 0)
let invert = Fun((x: number) => -x)
let convert = Fun((x: number) => String(x))
let squareRoot = Fun((x: number) => Math.sqrt(x))
let ifThenElse =
  function<a, b>(p: Fun<a, boolean>, _then: Fun<a, b>, _else: Fun<a, b>) : Fun<a, b> {
    return Fun((x: a) => {
      if (p.f(x)) {
        return _then.f(x)
      }
      else {
        return _else.f(x)
      }
    })
  }

//implementation

//1. Increment a number and then check if it is positive
let ex1 = incr.then(isPositive)

//2. Increment a number, double it and check if it is positive
let ex2 = incr.then(double).then(isPositive)

//3. Implement a function that computes the square root if the input is positive, otherwise inverts it and then performs the square root
let ex3 = ifThenElse(isPositive, squareRoot, invert.then(squareRoot))

//4. Square a number and then if it is even invert it otherwise do the square root
let ex4 = square.then(ifThenElse(isEven, invert, squareRoot))

let test = incr.then(convert).then


export let main = function () {
  // console.log(ex1.f(4))
  // console.log(ex2.f(-3))
  // console.log(ex3.f(-9))
  // console.log(ex4.f(3))
  // console.log(incr.repeatUntil().f(Fun((x: number) => x >= 5)).f(0))
}

main()