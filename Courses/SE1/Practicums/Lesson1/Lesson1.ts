export interface Fun<a, b> {
  f: (i: a) => b,
  then: <c>(g: Fun<b, c>) => Fun<a, c>
  repeat: () => Fun<number,Fun<a, a>>
  repeatUntil: () => Fun<Fun<a, boolean>, Fun<a, a>>
}

export type Unit = { }

export let id = function<a>(): Fun<a, a> {
  return Fun<a, a>(x => x)
}

let repeat = function<a>(f: Fun<a, a>, n: number): Fun<a, a> {
  if (n <= 0) {
    return id<a>()
  }
  else {
    return f.then(repeat(f, n - 1))
  }
}

//repeat(f,3)
//f.then.f.then.f.then.id

let repeatUntil = function<a>(f: Fun<a, a>, predicate: Fun<a, boolean>) : Fun<a, a> {
  let g =
    (x: a) => {
      if (predicate.f(x)) {
        return id<a>().f(x)
      }
      else {
        return f.then(repeatUntil(f, predicate)).f(x)
      }
    }
  return Fun<a, a>(g)
}

export let Fun = function <a, b>(f: (_: a) => b): Fun<a, b> {
  return {
    f: f,
    then: function <c>(this: Fun<a, b>, g: Fun<b, c>): Fun<a, c> {
      return Fun<a, c>(a => g.f(this.f(a)))},
    repeat: function(this: Fun<a, a>): Fun<number,Fun<a, a>> {
      return Fun(n => repeat(this, n))
    },
    repeatUntil: function(this: Fun<a, a>): Fun<Fun<a, boolean>, Fun<a, a>> {
      return Fun(p => repeatUntil(this, p))
    }
  }
}

let incr = Fun<number, number>(x => x + 1)

export let main = function() {
  console.log(repeat(incr,3).f(4))
}




