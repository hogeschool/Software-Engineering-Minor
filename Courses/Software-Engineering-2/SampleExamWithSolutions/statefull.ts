import { Fun } from "./fun";
import { Pair } from "./pair";

export type Statefull<State, a> = Fun<State, Pair<a, State>> & {
  thenBind: <b>(this: Statefull<State, a>, f: Fun<a, Statefull<State, b>>) => Statefull<State, b>
}

export const Statefull = function<State, a>(f: Fun<State, Pair<a, State>>): Statefull<State, a> {
  const statefullWrapper = f as Statefull<State, a>
  statefullWrapper.thenBind = function<b>(this: Statefull<State, a>, f: Fun<a, Statefull<State, b>>): Statefull<State, b> {
    return bindStatefull(this, f)
  }
  return statefullWrapper
}

export const unitStatefull = <State, a>(): Fun<a, Statefull<State, a>> =>
  Fun(
    (value: a): Statefull<State, a> => Statefull(Fun(
      (state: State): Pair<a, State> => ({
        first: value,
        second: state
      })
    ))
  )

export const mapStatefull = <State, a, b>(f: Fun<a, b>): Fun<Statefull<State, a>, Statefull<State, b>> => Fun(
  (stateful: Statefull<State, a>): Statefull<State, b> => Statefull(Fun(
    (state: State): Pair<b, State> => {
      const execution = stateful(state)
      return {
        first: f(execution.first),
        second: execution.second
      }
    } 
  ))
)

export const joinStatefull = <State, a>(): Fun<Statefull<State, Statefull<State, a>>, Statefull<State, a>> => Fun(
  (nestedStateful: Statefull<State, Statefull<State, a>>): Statefull<State, a> => Statefull(Fun(
    (state: State): Pair<a, State> => {
      const nestedExecution = nestedStateful(state)
      return nestedExecution.first(nestedExecution.second)
    }
  ))
)

export const bindStatefull = <State, a, b>(statefull: Statefull<State, a>, f: Fun<a, Statefull<State, b>>): Statefull<State, b> =>
  mapStatefull<State, a, Statefull<State, b>>(f).then(joinStatefull())(statefull)


export const getState = <State>(): Statefull<State, State> => Statefull(Fun(
  (state: State): Pair<State, State>  => ({
    first: state,
    second: state
  })
))

export const setState = <State>(state: State): Statefull<State, void> => Statefull(Fun(
  (_: State): Pair<void, State> => ({
    first: undefined,
    second: state
  })
))

export const _while = <State>(condition: Statefull<State, boolean>, body: Statefull<State, void>): Statefull<State, void> =>
  condition
  .thenBind(Fun((c: boolean) => {
    if (c) {
      return body.thenBind(Fun(_ => _while(condition, body)))
    }
    return unitStatefull<State, void>()()
  }))