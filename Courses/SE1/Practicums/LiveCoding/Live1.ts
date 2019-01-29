class Int {
  value: number

  constructor() {
    this.value = 0
  }

  incr() {
    this.value = this.value + 1
  }
}

class EvenCounter {
  number: Int

  constructor() {
    this.number = new Int()
  }

  tick() : void {
    this.number.incr()
    this.number.incr()
  }
}

class RegularCounter {
  number: Int

  constructor() {
    this.number = new Int()
  }

  tick() : void {
    this.number.incr()
  }
}

interface Fun<a, b> {
  f: (_: a) => b //f :: a -> b, let f : ('a -> 'b)
  then: <c>(f2: Fun<b,c>) => Fun<a,c>
}

let Fun = function<a,b>(f: (_:a) => b) : Fun<a, b> {
  return {
    f: f, 
    then: function<c>(g:Fun<b,c>) : Fun<a,c> {
      return then(this,g)
    }
  }
}

let incr : Fun<number, number> = Fun<number, number>((x: number) => x + 1)
let convert: Fun<number, string> = Fun<number, string>((x: number) => String(x))

//f: (_: a) => b
//g: (_: b) => c
let then = function<a, b, c>(function1: Fun<a, b>, function2: Fun<b, c>): Fun<a, c> {
  let result = (x: a) => {
    return function2.f(function1.f(x))
  }
  return Fun(result)
}



export let main = function() {
  //console.log(incr.f(5))
  //console.log(then(incr,then(incr,convert)).f(5))
  console.log(incr.then(incr).then(convert).f(5))

}


main()