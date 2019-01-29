import * as Immutable from "immutable"
import { Fun } from "../Lesson3/practicum3"
import { State, map_State, unit_State, join_State, get_state, set_state, Unit } from "./StateMonad"

type Value = {
  kind: "number",
  value: number
} | {
  kind: "bool",
  value: boolean
}

let Number = (v: number): Value => { 
  return {
    kind: "number", 
    value: v
 } 
}

let Bool = (b: boolean): Value => {
  return {
    kind: "bool",
    value: b
  }
}

type Memory = Immutable.Map<string, Value>
type Statement<a> = State<Memory, a>

let skip = () => unit_State<Memory, Unit>().f({})

let getVar = (_var: string): Statement<Value> => {
   return get_state<Memory>().then(Fun((m: Memory) => {
    let x = m.get(_var)
    return unit_State<Memory, Value>().f(x)
  }))
}

let setVar = (_var: string, value: Value): Statement<Unit> => {
  return get_state<Memory>().then(Fun((m: Memory) => {
    let m1 = m.set(_var, value)
    return set_state<Memory>(m1)
  }))
}

let incrVar = (_var: string): Statement<Unit> => {
  return getVar(_var).then(Fun((x: Value) => {
    if (x.kind == "number") {
      return setVar(_var, Number(x.value + 1))    
    }
    else {
      return unit_State<Memory, Value>().f(x)
    }
  }))
}

let decrVar = (_var: string): Statement<Unit> => {
  return getVar(_var).then(Fun((x: Value) => {
    if (x.kind == "number") {
      return setVar(_var, Number(x.value - 1))    
    }
    else {
      return unit_State<Memory, Value>().f(x)
    }
  }))
}

let printMemory = Fun<Memory, string>((m: Memory) => {
  let s = "{ "
  m.forEach(x =>  (x == undefined) ? "" : s += String(x.value) + " ")
  return s +"}" 
})

let ifThenElse = (condition: Statement<boolean>, _then: Statement<Unit>, _else: Statement<Unit>): Statement<Unit> {
  return condition.then(Fun((b: boolean): Statement<Unit> => {
    if (b) {
      return _then
    }
    else {
      return _else
    }
  }))
}

let _while = (condition: Statement<boolean>, body: Statement<Unit>): Statement<Unit> => {
  return condition.then(Fun((b: boolean): Statement<Unit> => {
    if (b) {
      return body.then(Fun((_: Unit): Statement<Unit> => _while(condition, body)))
    }
    else {
      return skip()
    }
  }))
}

let varPositive = (_var: string): Statement<boolean> => {
  return getVar(_var).then(Fun((v: Value): Statement<boolean> => {
    return unit_State<Memory, boolean>().f(v.kind == "number" ? v.value > 0 : false)
  }))
}

let seq = (current: Statement<Unit>, next: Statement<Unit>): Statement<Unit> => {
  return current.then(Fun((_: Unit) => next))
}

let m = Immutable.Map<string, Value>([["x", Number(5)], ["y", Number(3)]])
let program = 
  setVar("z", Bool(true)).then(Fun((_: Unit): Statement<Unit> => {
    return incrVar("x").then(Fun((_: Unit) => {
      return incrVar("y")
    }))
    })).run.f(m)
let testConditional =
    ifThenElse(varPositive("x"), decrVar("x"), incrVar("x")).run.f(m)
let testLoop =
    _while(varPositive("x"), seq(decrVar("x"), seq(incrVar("y"), skip()))).run.f(m)
console.log(printMemory.f(testLoop.snd))