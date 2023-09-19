import { Map } from "immutable"
import { Coroutine, _throw, concurrent, getState, parallel, runCoroutine, setState, unitCoroutine, wait } from "./coroutine"
import { Fun } from "./fun"

export type Value = {
  kind: "number"
  value: number
} | {
  kind: "string"
  value: string
}

export type Memory = Map<string, Value>


export interface InterruptibleState {
  deltaTime: number
  memory: Memory
}

export const getVariable = (variable: string): Coroutine<InterruptibleState, string, Value> =>
  getState<InterruptibleState, string>()
  .thenBind(Fun((state: InterruptibleState) => {
    const maybeValue = state.memory.get(variable)
    if (maybeValue) {
      return unitCoroutine<InterruptibleState, string, Value>()(maybeValue)
    }
    return _throw<InterruptibleState, string, Value>()(`Variable ${variable} is undefined.`)
  }))

export const setVariable = (variable: string, value: Value): Coroutine<InterruptibleState, string, void> =>
  getState<InterruptibleState, string>()
  .thenBind(Fun((state: InterruptibleState) => {
    const maybeValue = state.memory.get(variable)
    if (maybeValue && maybeValue.kind != value.kind) {
      return _throw<InterruptibleState, string, void>()(`Variable ${variable} has type ${maybeValue.kind} but ${value.kind} was given.`)
    }
    return setState<InterruptibleState, string>({
      ...state,
      memory: state.memory.set(variable, value)
    })
  }))

export const program = 
  setVariable("x", { kind: "number", value: 1 })
  .thenBind(Fun(_ => wait(1)))
  .thenBind(Fun(_ => {
    console.log("Done waiting program 1")
    return setVariable("x", { kind: "number", value: 5 })
  }))

  export const program2 = 
  setVariable("y", { kind: "number", value: 3 })
  .thenBind(Fun(_ => wait(5)))
  .thenBind(Fun(_ => {
    console.log("Done waiting program 2")
    return setVariable("y", { kind: "number", value: 1 })
  }))

const initialState: InterruptibleState = {
  deltaTime: 0,
  memory: Map()
}