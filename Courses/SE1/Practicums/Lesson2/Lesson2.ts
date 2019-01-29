import { Fun,id,Unit } from "../Lesson1/Lesson1"

export type Option<a> = ({
  kind: "none" } | { 
  kind: "some", 
  value: a })

export let None = function<a>() : Option<a> {
  return {
    kind: "none"
    }
  }

export let Some = function<a>(v: a) : Option<a> {
  return {
    kind: "some",
    value: v
  }
}

let arithmeticOp = function(operator: Fun<number, Fun<number, Option<number>>>) {
  return Fun ((x: number) => {
    return Fun((y: number) => {
      return operator.f(x).f(y)
    })
  })
}

let div = function() : Fun<number, Fun<number, Option<number>>> {
  let divF: Fun<number, Fun<number, Option<number>>> =
    Fun((x: number) => {
      return Fun((y: number) => {
          if (y == 0) {
            return None()
          }
          else {
            return Some(x / y)
          }
        })
      })
  return arithmeticOp(divF)
}

export let mapOption = function<a, b>(f: Fun<a, b>) : Fun<Option<a>, Option<b>> {
    return Fun((opt : Option<a>) => {
      if (opt.kind == "none") {
        return None()
      }
      else {
        return Some(f.f(opt.value))
      }
    })
}

interface Triplet<a> {
  x:    a,
  y:    a,
  z:    a
}

let vectorMap = function <a, b>(f: Fun<a, b>): Fun<Triplet<a>, Triplet<b>> {
  return Fun((t: Triplet<a>) => {
    return {
      x:    f.f(t.x),
      y:    f.f(t.y),
      z:    f.f(t.z) 
    }
  })
}




