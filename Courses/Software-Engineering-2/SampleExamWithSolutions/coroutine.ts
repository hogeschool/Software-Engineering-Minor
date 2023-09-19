
import { Either, inl, inr } from "./either";
import { Fun } from "./fun";
import { Pair } from "./pair";
/*
  x = 5
  wait 2
  while x > 0 {
    x = x - 1
    wait 1
  }

  EXECUTION:
    FRAME 1:
    x = 5
    State: { x : 5 }
    Continuation:
      wait 1.999998
      while x > 0 {
        x = x - 1
        wait 1
      }

  1. A coroutine returns either a result or not
  2. If it does not return a result, it can be because of an error or because it has stopped.
  3. If it stops, we need to remember the current state and the next part of the code to run.
*/

export type Coroutine<State, Error, a> = Fun<State, Either<NoRes<State, Error, a>, Pair<a, State>>> & {
  thenBind: <b>(this: Coroutine<State, Error, a>, f: Fun<a, Coroutine<State, Error, b>>) => Coroutine<State, Error, b>
  parallel: <b>(this: Coroutine<State, Error, a>, coroutine: Coroutine<State, Error, b>) => Coroutine<State, Error, Pair<a, b>>
  concurrent: <b>(this: Coroutine<State, Error, a>, coroutine: Coroutine<State, Error, b>) => Coroutine<State, Error, Either<a, b>>
  onlyIf: (this: Coroutine<State, Error, a>, condition: Coroutine<State, Error, boolean>) => Coroutine<State, Error, a>
}
type NoRes<State, Error, a> = Either<Error, Continuation<State, Error, a>>
type Continuation<State, Error, a> = Pair<State, Coroutine<State, Error, a>>

export const Coroutine = function<State, Error, a>(f: Fun<State, Either<NoRes<State, Error, a>, Pair<a, State>>>): Coroutine<State, Error, a> {
  const coroutineWrapper = f as Coroutine<State, Error, a>
  coroutineWrapper.thenBind = function<b>(this: Coroutine<State, Error, a>, f: Fun<a, Coroutine<State, Error, b>>): Coroutine<State, Error, b> {
    return bindCoroutine(this, f)
  }
  coroutineWrapper.parallel = function<b>(this: Coroutine<State, Error, a>, coroutine: Coroutine<State, Error, b>): Coroutine<State, Error, Pair<a, b>> {
    return parallel(this, coroutine)
  }
  coroutineWrapper.concurrent = function<b>(this: Coroutine<State, Error, a>, coroutine: Coroutine<State, Error, b>): Coroutine<State, Error, Either<a, b>> {
    return concurrent(this, coroutine)
  }
  coroutineWrapper.onlyIf = function(this: Coroutine<State, Error, a>, condition: Coroutine<State, Error, boolean>): Coroutine<State, Error, a> {
    return onlyIf(condition, this)
  }
  return coroutineWrapper
}

export const unitCoroutine = <State, Error, a>(): Fun<a, Coroutine<State, Error, a>> =>
  Fun((value: a): Coroutine<State, Error, a> => Coroutine(Fun(
    (state: State): Either<NoRes<State, Error, a>, Pair<a, State>> =>
      inr<NoRes<State, Error, a>, Pair<a, State>>()({
        first: value,
        second: state
      }) 
  ) 
  ))

export const _throw = <State, Error, a>(): Fun<Error, Coroutine<State, Error, a>> =>
  Fun((error: Error): Coroutine<State, Error, a> =>
    Coroutine(Fun((_: State) => inl<Error, Continuation<State, Error, a>>()
    .then(inl<NoRes<State, Error, a>, Pair<a, State>>())(error)
    )
  ))

export const suspend = <State, Error, a>(): Fun<Coroutine<State, Error, a>, Coroutine<State, Error, a>> => 
  Fun((next: Coroutine<State, Error, a>): Coroutine<State, Error, a> =>
    Coroutine(Fun((state: State) =>
      inr<Error, Continuation<State, Error, a>>().then(
        inl<NoRes<State, Error, a>, Pair<a, State>>()
      )({
        first: state,
        second: next
      })
    )
  ))

export const mapCoroutine = <State, Error, a, b>(f: Fun<a, b>): 
  Fun<Coroutine<State, Error, a>, Coroutine<State, Error, b>> => Fun(
    (coroutine: Coroutine<State, Error, a>): Coroutine<State, Error, b> => Coroutine(Fun(
      (state: State): Either<NoRes<State, Error, b>, Pair<b, State>> => {
        const currentResult = coroutine(state)
        //Result or not?
        switch (currentResult.kind) {
          //No Result
          case "left":
            //Error or Suspension?
            switch (currentResult.value.kind) {
              //Error
              case "left": return inl<Error, Continuation<State, Error, b>>()
              .then(inl<NoRes<State, Error, b>, Pair<b, State>>())(currentResult.value.value)
              //Suspension
              case "right":
                const innerResult = currentResult.value.value
                return inr<Error, Continuation<State, Error, b>>()
                .then(inl<NoRes<State, Error, b>, Pair<b, State>>())({
                  first: innerResult.first,
                  second: mapCoroutine<State, Error, a, b>(f)(innerResult.second)
                })
            }
          //I have a result
          case "right":
            return inr<NoRes<State, Error, b>, Pair<b, State>>()({
              first: f(currentResult.value.first),
              second: currentResult.value.second
            })
        }
      }
    )
  ))

export const joinCoroutine = <State, Error, a>(): 
  Fun<Coroutine<State, Error, Coroutine<State, Error, a>>, Coroutine<State, Error, a>> => Fun(
    (nestedCoroutine: Coroutine<State, Error, Coroutine<State, Error, a>>) => Coroutine(Fun(
      (state: State): Either<NoRes<State, Error, a>, Pair<a, State>> => {
        const nestedCoroutineResult = nestedCoroutine(state)
        //Result or not?
        switch (nestedCoroutineResult.kind) {
          //No Result
          case "left":
            //Error or Suspension?
            switch (nestedCoroutineResult.value.kind) {
              //Error
              case "left":
                return inl<Error, Continuation<State, Error, a>>().then(
                  inl<NoRes<State, Error, a>, Pair<a, State>>()
                )(nestedCoroutineResult.value.value)
              //Suspension
              case "right":
                return inr<Error, Continuation<State, Error, a>>().then(
                  inl<NoRes<State, Error, a>, Pair<a, State>>()
                )({
                  first: nestedCoroutineResult.value.value.first,
                  second: joinCoroutine<State, Error, a>()(nestedCoroutineResult.value.value.second)
                })
            }
          //I have a result
          case "right":
            const { first: currentCoroutine, second: currentState } = nestedCoroutineResult.value
            return currentCoroutine(currentState)
        }
      }
    )
  ))

export const bindCoroutine = <State, Error, a, b>
  (coroutine: Coroutine<State, Error, a>, f: Fun<a, Coroutine<State, Error, b>>): Coroutine<State, Error, b> =>
  mapCoroutine<State, Error, a, Coroutine<State, Error, b>>(f).then(joinCoroutine())(coroutine)

export const getState = <State, Error>(): Coroutine<State, Error, State> => Coroutine(Fun(
  (state: State) => inr<NoRes<State, Error, State>, Pair<State, State>>()({
    first: state,
    second: state
  })
))

export const setState = <State, Error>(state: State): Coroutine<State, Error, void> => Coroutine(Fun(
  (_: State) => inr<NoRes<State, Error, void>, Pair<void, State>>()({
    first: undefined,
    second: state
  })
))

export const wait = <State extends { deltaTime: number }, Error>(duration: number): Coroutine<State, Error, void> => {
  if (duration > 0) {
    return getState<State, Error>()
    .thenBind(Fun((state: State) => suspend<State, Error, void>()(wait(duration - state.deltaTime))))
  }
  return unitCoroutine<State, Error, void>()()
}

export const waitUntil = <State, Error>(_event: Coroutine<State, Error, boolean>): Coroutine<State, Error, void> =>
  _event
  .thenBind(Fun((condition: boolean) => {
    if (condition) {
      return unitCoroutine<State, Error, void>()()
    }
    return suspend<State, Error, void>()(waitUntil(_event))
  }))

export const parallel = <State, Error, a, b>(
  coroutine1: Coroutine<State, Error, a>, 
  coroutine2: Coroutine<State, Error, b>) => 
  /*
    both coroutine return => unitCoroutine({ first: coroutine1.res, second: coroutine2.res })
    first coroutine throws => throw(coroutine1.error)
    second coroutine throws => throw(coroutine2.error)
    both coroutine suspend => parralel(coroutine1.continuation, coroutine2.continuation)
    first suspends, second returns => parallel(coroutine1.continuation, unitCoroutine(coroutine2.res))
    first returns, seconds suspends => parallel(unitCoroutine(coroutine1.res), coroutine2.continuation))
  */

  Coroutine(Fun(
    (state: State): Either<NoRes<State, Error, Pair<a, b>>, Pair<Pair<a, b>, State>> => {
        const execution1 = coroutine1(state)
        //first coroutine throws
        if (execution1.kind == "left" && execution1.value.kind == "left") {
          return _throw<State, Error, Pair<a, b>>()(execution1.value.value)(state)
        }
        //first coroutine returns
        else if (execution1.kind == "right") {
          const execution2 = coroutine2(execution1.value.second)
          //second coroutine throws
          if (execution2.kind == "left" && execution2.value.kind == "left") {
            return _throw<State, Error, Pair<a, b>>()(execution2.value.value)(state)
          }
          //second coroutine returns
          else if (execution2.kind == "right") {
            return unitCoroutine<State, Error, Pair<a, b>>()({
              first: execution1.value.first,
              second: execution2.value.first
            })(execution2.value.second)
          }
          //second coroutine suspends
  
          /*
            x = 1               y = 3
            wait 3              wait 5
            wait 2              wait 4
            wait 1              wait 3
            x = 5               
            return ()
                                wait 2
                                wait 1
                                y = 1
                                return ()
          */
          else if (execution2.kind == "left" && execution2.value.kind == "right") {
            return suspend<State, Error, Pair<a, b>>()(
              parallel(
                unitCoroutine<State, Error, a>()(execution1.value.first),
                execution2.value.value.second
              ))(execution2.value.value.first)
          }
        }
        //first coroutine suspends
        else if (execution1.kind == "left" && execution1.value.kind == "right") {
          const execution2 = coroutine2(execution1.value.value.first)
          //second coroutine returns
          if (execution2.kind == "right") {
            return suspend<State, Error, Pair<a, b>>()(parallel(
                execution1.value.value.second,
                unitCoroutine<State, Error, b>()(execution2.value.first)
              )
            )(execution2.value.second)
          }
          //second coroutine throws
          else if (execution2.kind == "left" && execution2.value.kind == "left") {
            return _throw<State, Error, Pair<a, b>>()(execution2.value.value)(state)
          }
          //second coroutine suspends
          else if (execution2.kind == "left" && execution2.value.kind == "right") {
            return suspend<State, Error, Pair<a, b>>()(parallel(
                execution1.value.value.second,
                execution2.value.value.second
              )
            )(execution2.value.value.first)
          }
        }
        return undefined!
      }
  ))

export const concurrent = <State, Error, a, b>(coroutine1: Coroutine<State, Error, a>, coroutine2: Coroutine<State, Error, b>): Coroutine<State, Error, Either<a, b>> =>
      Coroutine(Fun(
        (state: State): Either<NoRes<State, Error, Either<a, b>>, Pair<Either<a, b>, State>> => {
          const execution1 = coroutine1(state)
          //first coroutine throws
          if (execution1.kind == "left" && execution1.value.kind == "left") {
            return _throw<State, Error, Either<a, b>>()(execution1.value.value)(state)
          }
          //first coroutine returns
          else if (execution1.kind == "right") {
            return unitCoroutine<State, Error, Either<a, b>>()(inl<a, b>()(execution1.value.first))(execution1.value.second)
          }
          //first coroutine suspends
          else if (execution1.kind == "left" && execution1.value.kind == "right") {
            const execution2 = coroutine2(execution1.value.value.first)
            //second coroutine throws
            if (execution2.kind == "left" && execution2.value.kind == "left") {
              return _throw<State, Error, Either<a, b>>()(execution2.value.value)(state)
            }
            //second coroutine returns
            else if (execution2.kind == "right") {
              return unitCoroutine<State, Error, Either<a, b>>()(inr<a, b>()(execution2.value.first))(execution2.value.second)
            }
            //second coroutine suspends
            else if (execution2.kind == "left" && execution2.value.kind == "right") {
              return suspend<State, Error, Either<a, b>>()(
                concurrent<State, Error, a, b>(
                  execution1.value.value.second,
                  execution2.value.value.second
                )
              )(execution2.value.value.first)
            }
          }
          return undefined!
        }
      ))

  export const onlyIf = <State, Error, a>(_event: Coroutine<State, Error, boolean>, _then: Coroutine<State, Error, a>): 
    Coroutine<State, Error, a> =>
    waitUntil(_event)
    .thenBind(Fun(_ => _then))
    

export const runCoroutine = <State extends { deltaTime: number }, Error, a>
  (initialState: State, coroutine: Coroutine<State, Error, a>): Pair<a, State> | Error => {
    let currentFrame = {
      state: initialState,
      next: coroutine,
      currentTime: new Date()
    }
    while (true) {
      const now = new Date()
      const dt = (now.getTime() - currentFrame.currentTime.getTime()) / 1000
      currentFrame.currentTime = now
      const next =
        getState<State, Error>()
        .thenBind(Fun((state: State) => setState<State, Error>({
          ...state,
          deltaTime: dt
        })))
        .thenBind(Fun(_ => currentFrame.next))
      const result = next(currentFrame.state)
      if (result.kind == "left") {
        if (result.value.kind == "left") {
          return result.value.value
        }
        currentFrame.state = result.value.value.first
        currentFrame.next = result.value.value.second
      }
      else if (result.kind == "right") {
        return result.value
      }
    }
  }


  
  

