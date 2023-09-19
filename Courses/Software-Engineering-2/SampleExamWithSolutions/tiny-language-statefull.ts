import { Map } from "immutable"
import { Statefull, _while, getState, setState, unitStatefull } from "./statefull"
import { Fun } from "./fun"

export type Value = {
  kind: "number",
  value: number
} | {
  kind: "string",
  value: string
}

export const printValue = (value: Value): string => `${value.value}`

export type ExecutionState = Map<string, Value>

export const initialState = Map<string, Value>()

export const getVariable = (variable: string): Statefull<ExecutionState, Value> => 
  getState<ExecutionState>()
  .thenBind(Fun((state: ExecutionState) => unitStatefull<ExecutionState, Value>()(state.get(variable)!)))


export const setVariable = (variable: string, value: Value): Statefull<ExecutionState, void> =>
  getState<ExecutionState>()
  .thenBind(Fun((state: ExecutionState) => setState<ExecutionState>(state.set(variable, value))))


const exercise2 =
  setVariable("x", { kind: "number", value: 1 })
  .thenBind(Fun(_ => setVariable("y", { kind: "number", value: 10 })))
  .thenBind(Fun(_ => _while(
    getVariable("x")
    .thenBind(Fun((x: Value) =>
      getVariable("y")
      .thenBind(Fun((y: Value) => unitStatefull<ExecutionState, boolean>()(x.kind == "number" && y.kind == "number" && x.value < y.value)))
    )),
    getVariable("x")
    .thenBind(Fun((x: Value) => getVariable("y")
      .thenBind(Fun((y: Value) =>
        x.kind == "number" && y.kind == "number" ?
        setVariable("x", {...x, value: x.value * 2 })
        .thenBind(Fun(_ => setVariable("y", {...y, value: y.value + 1}))) :
        unitStatefull<ExecutionState, void>()()
      ))
    ))
  )))

export const runExercise2 = () => exercise2(initialState)