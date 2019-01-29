import { Fun } from "../Lesson3/practicum3"

export type Pair<a, b> = {
  fst: a
  snd: b
}

export type Unit = {}

export let map_Pair = function<a,a1,b,b1>(f: Fun<a, a1>, g: Fun<b, b1> ): Fun<Pair<a, b>, Pair<a1, b1>> {
  return Fun<Pair<a, b>, Pair<a1, b1>>((p: Pair<a, b>) => {
    return Pair<a1, b1>(f.f(p.fst), g.f(p.snd))
  })
}

export let Pair = function<a, b>(x: a, y: b): Pair<a, b> {
  return { fst: x, snd: y }
}

export let id = function<a>(): Fun<a, a> { return Fun<a, a>((x: a) => x)}

export interface State<s, a> { 
  run: Fun<s, Pair<a, s>>
  then: <b>(k: Fun<a, State<s, b>>) => State<s, b>
}

export let State = <s, a>(): Fun<Fun<s, Pair<a,s>>, State<s, a>> => {
  return Fun((s: Fun<s, Pair<a,s>>): State<s, a> => {
    return {
      run: s,
      then: function<b>(k: Fun<a, State<s, b>>): State<s, b> {
        return bind_State(this, k)
      }
    }
  })
}


export let map_State = function<s, a, b>(f: Fun<a, b>): Fun<State<s, a>, State<s, b>> {
  return Fun<State<s, a>, State<s, b>>((s: State<s, a>) => {
    let a = s.run.then(map_Pair(f, id<s>()))
    return State<s, b>().f(a)
  })
}

export let unit_State = function<s, a>(): Fun<a, State<s, a>> {
  return Fun<a, State<s, a>>((x: a) => {
    return State<s, a>().f(Fun<s, Pair<a, s>>((state: s) => Pair<a, s>(x, state)))
  })
}

let apply = <a, b>() : Fun<Pair<Fun<a, b>, a>, b> => Fun<Pair<Fun<a, b>, a>, b>(fa => fa.fst.f(fa.snd))

export let join_State = function<s, a>(): Fun<State<s, State<s, a>>, State<s, a>> {
  return Fun<State<s, State<s, a>>, State<s, a>>((p: State<s, State<s, a>>): State<s, a> => {
    let g = Fun((s: State<s, a>) => s.run)
    return State<s, a>().f(p.run.then(map_Pair(g, id<s>())).then(apply()))
  })
}

export let bind_State = function<s, a, b>(m: State<s, a>, k: Fun<a, State<s, b>>): State<s, b>{
  return map_State<s, a, State<s, b>>(k).then(join_State()).f(m)
}

export let get_state = function<s>(): State<s, s> {
  return State<s, s>().f(Fun((state: s) => Pair<s, s>(state, state)))
}

export let set_state = function<s>(state: s): State<s, Unit> {
  return State<s, Unit>().f(Fun((_: s) => Pair<Unit, s>({}, state)))
}