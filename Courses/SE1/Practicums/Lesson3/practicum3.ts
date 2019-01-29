export interface Fun<a, b> {
  f: (_: a) => b
  then: <c>(g: Fun<b, c>) => Fun<a, c>
}

export let Fun = function<a, b>(f: (_: a) => b): Fun<a, b> {
  return {
    f: f,
    then: function<c>(g: Fun<b,c>): Fun<a, c> {
      return Fun<a, c>((x: a) => {
        return g.f(this.f(x))
      })
    }
  }
}

export type Unit = {}


interface Pair<a, b> {
  fst: a
  snd: b
}

let pair = function<a, b>(fst: a, snd: b): Pair<a, b> {
  return {fst: fst, snd: snd }
}

//string monoid
let zero_String = Fun<Unit, string>((_: Unit) => "")
let plus_String = Fun<Pair<string, string>, string>((p: Pair<string, string>) => {
  return p.fst + p.snd
})

//list monoid
export type List<a> = {
  kind: "empty"
} | {
  kind: "cons"
  head: a
  tail: List<a>
}

export let empty = function<a>(): List<a> {return {kind: "empty"} }
export let cons = function<a>(head: a, tail: List<a>): List<a> {
  return {
    kind: "cons",
    head: head,
    tail: tail
  }
}
let zero_List = function<a>(): Fun<Unit, List<a>> {
  return Fun<Unit, List<a>>((_: Unit) => empty<a>())
}

let concat = function<a>(p: Pair<List<a>,List<a>>): List<a> {
  if (p.fst.kind == "empty") {
    return p.snd
  }
  else {
    let rest = concat(pair(p.fst.tail, p.snd))
    return cons<a>(p.fst.head, rest)
  }
}

let sum_List = function<a>(): Fun<Pair<List<a>, List<a>>, List<a>> {
  return Fun(concat)
}

//identity functor
type Identity<a> = Unit

let map_Identity = function<a, b>(_: (_: a) => b): Fun<Identity<a>, Identity<b>> {
  return Fun((x: Identity<a>) => x)
}

export let main = function() {
  let s1 = "Hi"
  let s2 = " noobs!"
  let l1 = cons(3, cons(5, cons(4, empty())))
  let l2 = cons(1, cons(4, cons(8, cons(10, cons(-2, empty())))))
  let cl = sum_List().f(pair(l1, l2))
  console.log(cl)
}

//main()