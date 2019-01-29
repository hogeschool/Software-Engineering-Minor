import { Fun, Unit, id } from "../Lesson1/Lesson1"

type List<a> = {
  kind: "Cons"
  head: a
  tail: List<a>
} | {
  kind: "Empty"
}

let empty = function<a>(): List<a> { 
  return { 
    kind: "Empty"
  } 
}
let cons = function<a>(x: a, xs: List<a>) : List<a> {
  return {
    kind: "Cons",
    head: x,
    tail: xs
  }
}

let map_List = <a, b>(f: Fun<a,b>) : Fun<List<a>, List<b>> => {
  let g = (l: List<a>) => {
    if (l.kind == "Empty") {
      return empty<b>()
    }
    else {
      let xs = map_List<a, b> (f).f(l.tail)
      let x = f.f(l.head)
      return cons<b>(x, xs)
    }
  }
  return Fun<List<a>, List<b>>(g)
}

let encode: Fun<number, Fun<List<string>, List<string>>> =
  Fun<number, Fun<List<string>, List<string>>>((shift: number) => {
    return Fun<List<string>, List<string>>((text: List<string>) => {
      let encoding = Fun<string, string>((s: string) => String.fromCharCode(s.charCodeAt(0) + shift))
      return map_List(encoding).f(text)
    })})

export let main = function() {
  let testList = cons("H", cons("i", cons("!", empty())))
  console.log(encode.f(10).f(testList))
}

main()