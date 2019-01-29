import {Fun, Unit} from "../Lesson3/practicum3"

type List<a> = {
  kind: "empty"
} | {
  kind: "cons",
  head: a,
  tail: List<a>
}

let Empty = function<a>(): List<a> {
  return { kind: "empty" }
}

let List = function<a>(head: a, tail: List<a>): List<a> {
  return {
    kind: "cons",
    head: head,
    tail: tail
  }
}

let map_List = function<a, b>(f: Fun<a, b>): Fun<List<a>, List<b>> {
  let g = (l: List<a>): List<b> => {
    if (l.kind == "empty") {
      return Empty<b>()
    }
    else {
      let newTail = g(l.tail)
      return List<b>(f.f(l.head), newTail)
    }
  }
  return Fun<List<a>, List<b>>(g)
}

let concat = function<a>(l2: List<a>) : Fun<List<a>, List<a>> {
  let g = (l1: List<a>): List<a> => {
    if (l1.kind == "empty") {
      return l2
    }
    else {
      let c = g(l1.tail)
      return List<a>(l1.head,c)
    }
  }
  return Fun(g)
}

let id = <a>() => Fun<a, a>((x: a) => x)

let listString = function<a>() : Fun<List<a>, string> {
  let g = (l: List<a>) : string => {
    if (l.kind == "empty") {
      return ""
    }
    else {
      return String(l.head) + " " + g(l.tail)
    }
  }
  return Fun<List<a>, string>(g)
}

let join_List = function<a>() : Fun<List<List<a>>, List<a>> {
  let g = (l: List<List<a>>): List<a> => {
    if (l.kind == "empty") {
      return l
    }
    else {
      let rest = g(l.tail)
      return concat(rest).f(l.head)
    }
  }
  return Fun<List<List<a>>, List<a>>(g)
}

let bind_List = function<a, b>(k: Fun<a, List<b>>): Fun<List<a>, List<b>> {
  return map_List(k).then(join_List())
}

let l1 = List(5,List(-3,List(2,List(0,Empty()))))
let l2 = List(4,List(-3,List(2,List(0,Empty()))))
let l3 = List(3,List(0,Empty()))
let ll: List<List<number>> = List(l1,List(l2,List(l3,Empty())))
console.log(concat(l2).then(listString()).f(l1))
console.log(join_List().then(listString()).f(ll))