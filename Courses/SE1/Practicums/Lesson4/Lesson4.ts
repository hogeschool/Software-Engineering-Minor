import { Fun } from "../Lesson3/practicum3"

export type Option<a> = ({
  kind: "none"
} | {
  kind: "some",
  value: a
}) & {
  then: <b>(this: Option<a>, k: Fun<a, Option<b>>) => Option<b>
}

export let None = function<a>(): Option<a> {
  return {
    kind: "none",
    then: function<b>(this: Option<a>, k: Fun<a, Option<b>>): Option<b> {
      return map_Option(k).then(join_Option()).f(this)
    }
  }
}

export let Some = function<a>(content: a): Option<a> {
  return {
    kind: "some",
    value: content,
    then: function<b>(this: Option<a>, k: Fun<a, Option<b>>): Option<b> {
      return map_Option(k).then(join_Option()).f(this)
    }
  }
}

export let map_Option = function<a, b>(mapper: Fun<a, b>): Fun<Option<a>, Option<b>> {
  let g = (opt: Option<a>) => {
    if (opt.kind == "none") {
      return None<b>()
    }
    else {
      let newValue = mapper.f(opt.value)
      return Some<b>(newValue)
    }
  }
  return Fun<Option<a>, Option<b>>(g)
}

export let id = function<a>(): Fun<a, a> {
  return Fun<a, a>((x: a) => x)
}

//unit || return: a -> Option<a>
export let unit_Option = function<a>() : Fun<a, Option<a>> {
  let g = (x: a) => {
    return Some<a>(x)
  }
  return Fun<a, Option<a>>(g)
}

//join: Option<Option<a>> -> Option<a>
export let join_Option = function<a>(): Fun<Option<Option<a>>, Option<a>> {
  let g = (opt: Option<Option<a>>) => {
    if (opt.kind == "none") {
      return None<a>()
    }
    else {
      return opt.value
    }
  }
  return Fun<Option<Option<a>>, Option<a>>(g)
}

export let bind_Option = function<a, b>(opt: Option<a>, k: Fun<a, Option<b>>) : Option<b> {
  return map_Option(k).then(join_Option()).f(opt)
}

//MONOID
//(+): Monoid<a> -> Monoid<a> -> Monoid<a>
//x + zero = zero + x = x IDENTITY PROPERTY
//x + (y + z) = (x + y) + z

//STRING
//(concat) string -> string -> string
//s concat "" = "" concat s = s
//zero := ""

//LIST
//zero := []
//[1;2;3] @ [] = [] @ [1;2;3] = [1;2;3]
//[1;2] @ ([3;4] @ [5;6]) = ([1;2] @ [3;4]) @ [5;6] = [1;2;3;4;5;6]

//LIST MONOID
export type List<a> = ({
  kind: "empty"
} | {
  kind: "::" //x :: xs
  head: a
  tail: List<a>
}) & {
  then: <b>(k: Fun<a, List<b>>) => List<b>
}

let bind_List = function<a,b>(l: List<a>, k: Fun<a, List<b>>): List<b> {
  return map_List2(k).then(join_List()).f(l)
}

export let Empty = function<a>(): List<a> {
  return { 
    kind: "empty",
    then: function<b>(k: Fun<a, List<b>>): List<b> {
      return bind_List(this, k)
    }
  }
}

export let Cons = function<a>(first: a, rest: List<a>): List<a> {
  return {
    kind: "::",
    head: first,
    tail: rest,
    then: function<b>(k: Fun<a, List<b>>): List<b> {
      return bind_List(this, k)
    }
  }
}


export let map_List2 = function<a, b>(mapper: Fun<a, b>): Fun<List<a>, List<b>> {
  let g = (l: List<a>): List<b> => {
    if (l.kind == "empty") {
      return Empty<b>()
    }
    else {
      let newList = g(l.tail)
      let newHead = mapper.f(l.head)
      return Cons<b>(newHead, newList)
    }
  }
  return Fun<List<a>, List<b>>(g)
}

//unit for the list functor
export let unit_List = function<a>() : Fun<a, List<a>> {
  return Fun<a, List<a>>((x: a) => Cons<a>(x, Empty<a>()))
}

//join for the list functor
//[[1;2;3];[4;5];[6]] -> [1;2;3;4;5;6] <- [1;2;3] concat [4;5] concat [6]
let concat = function<a>(l1: List<a>, l2:List<a>): List<a> {
  if (l1.kind == "empty") {
    return l2
  }
  else {
    let restConcat = concat(l1.tail, l2)
    return Cons<a>(l1.head, restConcat) 
  }
}

//[1;2;3] concat [4;5]
//[2;3] concat[4;5]
//[3] concat [4;5]
//[] concat [4;5] -> [4;5]
//[3] concat [4;5] -> [3;4;5]
//[2;3] concat [4;5] -> [2;3;4;5]
//[1;2;3] concat [4;5] -> [1;2;3;4;5]

export let join_List = function<a>() : Fun<List<List<a>>, List<a>> {
  let g = (l : List<List<a>>): List<a> => {
    if (l.kind == "empty") {
      return Empty<a>()
    }
    else if (l.tail.kind == "empty") {
      return l.head
    }
    else {
      let flattened = concat(l.head,l.tail.head)
      let flattenRest = g(l.tail.tail)
      return concat(flattened,flattenRest)
    }
  }
  return Fun<List<List<a>>, List<a>>(g)
}

export let printList = function<a>() : Fun<List<a>, string> {
  let g = (l: List<a>): string => {
    if (l.kind == "empty") {
      return ""
    }
    else {
      return (String(l.head)) + " " + (g(l.tail))
    }
  }
  return Fun(g)
}
//concat ([1;2;3],[3;4]) -> [1;2;3;3;4]
//concat ([2;3],[3;4]) -> [2;3;3;4]
//concat ([3],[3;4]) -> [3;3;4]
//concat ([],[3;4]) -> [3;4]
//list with one element
// let incr = Fun<number, number>(x => x + 1)
// let l = Cons(6,Cons(5,Empty()))
// let r = Cons(-1,Cons(5,Empty()))
// let z = Cons(-1,Cons(5,Empty()))
// let ll = Cons(l,Cons(r, Cons(z, Empty())))
// console.log(printList(join_List().f(ll)))




