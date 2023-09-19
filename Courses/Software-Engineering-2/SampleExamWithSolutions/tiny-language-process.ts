import { Map, update } from "immutable"
import { Process, _throw, getState, setState, unitProcess } from "./process"
import { Fun } from "./fun"

export type Memory = Map<string, Value>

type Value = {
  kind: "number"
  value: number
} | {
  kind: "string"
  value: string
}

export const getVariable = (variable: string): Process<Memory, string, Value> =>
  getState<Memory, string>()
  .thenBind(Fun((memory: Memory): Process<Memory, string, Value> => {
    const value = memory.get(variable)
    if (value) {
      return unitProcess<Memory, string, Value>()(value)
    }
    return _throw<Memory, string, Value>()(`Undefined variable ${variable}`)
  }))

export const setVariable = (variable: string, value: Value): Process<Memory,string, void> =>
  getState<Memory, string>()
  .thenBind(Fun((memory: Memory) => {
    const maybeValue = memory.get(variable)
    if (maybeValue) {
      if (value.kind == maybeValue.kind) {
        return setState<Memory, string>(memory.set(variable, value))
      }
      return _throw<Memory, string, void>()(`Variable ${variable} has type ${maybeValue.kind} but ${value.kind} was given`)
    }
    return setState<Memory, string>(memory.set(variable, value))
  }))

//x = expr(x)
export const updateVariable = (variable: string, updater: Fun<Value, Process<Memory, string, Value>>) =>
  getVariable(variable)
  .thenBind(Fun((currentValue: Value) => updater(currentValue)
  ))
  .thenBind(Fun((newValue: Value) => setVariable(variable, newValue)))

export const _while = (condition: Process<Memory, string, boolean>, body: Process<Memory, string, void>):
  Process<Memory, string, void> =>
  condition
  .thenBind(Fun((check: boolean) => {
    if (check) {
      return body.thenBind(Fun(_ => _while(condition, body)))
    }
    return unitProcess<Memory, string, void>()()
  }
  ))
