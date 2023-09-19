import { Either, inl, inr } from "./either";
import { Fun } from "./fun";
import { Pair } from "./pair";

export type Process<State, Error, a> = Fun<State, Either<Error, Pair<a, State>>> & {
  thenBind: <b>(f: Fun<a, Process<State, Error, b>>) => Process<State, Error, b>
}

export const Process = function<State, Error, a>(f: Fun<State, Either<Error, Pair<a, State>>>): Process<State, Error, a> {
  const processWrapper = f as Process<State, Error, a>
  processWrapper.thenBind = function<b>(this: Process<State, Error, a>, f: Fun<a, Process<State, Error, b>>): 
    Process<State, Error, b> {
      return bindProcess(this, f)
    }
  return processWrapper
}

export const unitProcess = <State, Error, a>(): Fun<a, Process<State, Error, a>> =>
  Fun(
    (value: a) => Process(Fun(
      (state: State): Either<Error, Pair<a, State>> => inr<Error, Pair<a, State>>()({
        first: value,
        second: state
      })
    ))
  )

export const _throw = <State, Error, a>(): Fun<Error, Process<State, Error, a>> =>
Fun(
  (error: Error) => Process(Fun(
    (_: State): Either<Error, Pair<a, State>> => inl<Error, Pair<a, State>>()(error)
  ))
)

export const mapProcess = <State, Error, a, b>(f: Fun<a, b>): Fun<Process<State, Error, a>, Process<State, Error, b>> => Fun(
  (process: Process<State, Error, a>): Process<State, Error, b> => Process(Fun(
    (state: State): Either<Error, Pair<b, State>> => {
      const result = process(state)
      switch (result.kind) {
        case "left": return result
        case "right": return inr<Error, Pair<b, State>>()({
          first: f(result.value.first),
          second: result.value.second
        })
      }
    }
  ))
)

export const joinProcess = <State, Error, a>(): Fun<Process<State, Error, Process<State, Error, a>>, Process<State, Error, a>> => Fun(
  (nestedProcess: Process<State, Error, Process<State, Error, a>>): Process<State, Error, a> => Process(Fun(
    (state: State): Either<Error, Pair<a, State>> => {
      const nestedProcessResult = nestedProcess(state)
      switch (nestedProcessResult.kind) {
        case "left": return nestedProcessResult
        case "right":
          const innerProcessResult = nestedProcessResult.value.first(nestedProcessResult.value.second)
          return innerProcessResult
      }
    }
  ))
)

export const bindProcess = <State, Error, a, b>(process: Process<State, Error, a>, f: Fun<a, Process<State, Error, b>>): 
  Process<State, Error, b> => mapProcess<State, Error, a, Process<State, Error, b>>(f).then(joinProcess())(process)


export const getState = <State, Error>(): Process<State, Error, State> =>
  Process(Fun((state: State) => 
    inr<Error, Pair<State, State>>()({
      first: state,
      second: state
    })
  ))

export const setState = <State, Error>(state: State): Process<State, Error, void> =>
    Process(Fun((_: State) =>
      inr<Error, Pair<void, State>>()({
        first: undefined,
        second: state
      })
    ))