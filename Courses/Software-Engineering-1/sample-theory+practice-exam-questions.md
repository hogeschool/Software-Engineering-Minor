> You may use the various functions and types we have seen in class: `Fun`, `Countainer`, `mapCountainer`, `mapOption`, `incr`, `decr`, etc.

# Question - defining simple functions. Examples of the question:
Write a Fun<number,number> which multiplies the input by three.
Write a Fun<[number,number],number> which performs a sum.
Write a Fun<[boolean,boolean],boolean> which performs a logical and.

# Typing simple functions.
What is the type of Fun(x => x + 1)?
What is the type of Fun(x => x > 0)?
What is the type of Fun(x => !x)?
What is the type of Fun(([x,y]) => x * y + 1)?
What is the type of Fun(([x,y]) => x + ", " + y)?

# Defining a chain of functions with composition. 
Define a chain function that increments, doubles, and then decrements
Define a chain function that increments and then checks if the result is greater than zero
Define a chain function that checks if a value is greater than zero and then flips the result

# Typing a chain of functions.
What is the type of incr.then(gtz)?
What is the type of incr.then(double)?
What is the type of id.then(incr)?
What is the type of gtz.then(not)?

# Invoking a map function. 
What is the value of mapId(incr)(id(10))?
What is the value of mapArray(gtz)([1,-2,3,-4])?
What is the value of mapOption(f)(Option.Default.empty())?
What is the value of mapOption(gtz)(Option.Default.full(-5))?

# Typing map functions.
What is the type of mapId(incr)?
What is the type of mapArray(incr)?
What is the type of mapOption(gtz)?

# Composing map functions.
Define a map function that transforms all the options inside an array.
Define a map function that transforms the option inside a countainer.
Define a map function that transforms all the countainers inside an option inside an array.

# Typing composed map functions.
What is the type of mapArray(mapOption(incr))?
What is the type of mapOption(mapOption(incr))?
What is the type of mapOption(mapList(gtz))?
What is the type of mapCountainer(mapOption(mapList(gtz)))?

# Typing map functions over compositions.
What is the type of mapArray(incr.then(gtz))?
What is the type of mapOption(mapOption(gtz.then(not)))?
What is the type of mapOption(mapList(incr.then(double)))?

<!-- # Invoking composed map functions
Invoking a map function with f.then(g)
Invoking monoid operations.
Invoking functor units.
Invoking functor joins.
Invoking functor joins over units.
Defining and invoking a type safe instance of a composite functor -->


# Defining fun
Complete the definition of the `Fun` type (replace `[...]` with the correct code):
```ts
type Fun< input, output > = {
  (input : input) : output 
  then: [...]
}
```

Complete the definition of the `Fun` constructor (replace `[...]` with the correct code):
```ts
function Fun< input, output >( implementation:(input:input) => output ) : Fun< input, output > {
  const tmp = implementation as Fun<input, output>
  tmp.then = nextStep => Fun(input => [...])
  return tmp
}
```

# Defining functors
Complete the definition of the following `map` function:
```ts
const mapId = <a,b>(f:Fun<a,b>) : Fun<Id<a>, Id<b>> => [...]
```

Complete the definition of the following `map` function:
```ts
const mapArray = <a,b>(f:Fun<a,b>) : Fun<[...]> => Fun(inputArray => inputArray.map(f))
```

Complete the definition of the following `map` function:
```ts
const mapCountainer = <a,b>(f:Fun<a,b>) : Fun<Countainer<a>, Countainer<b>> =>
  Fun(inputCountainer => ({...inputCountainer, content:[...]}))
```

Complete the definition of the following `map` function:
```ts
const mapOption = <a,b>(f:Fun<a,b>) : Fun<Option<a>, Option<b>> =>
  Fun(inputOption => inputOption.kind == [...] ? empty() : full(f(inputOption.content)))
```

Complete the definition of the following `map` function:
```ts
const mapList = <a,b>(f:Fun<a,b>) : Fun<[...]> => Fun(l => l.map(f))
```

Complete the following definition:
```ts
const empty = <a>() : Option<a> => ({ kind:"empty" })
const full = <a>(content:a) : Option<a> => ({ kind:"full", content:[...] })
```

Given type `type Either<a,b> = ({ kind:"left", content:a } | { kind:"right", content:b })`, complete the following definition:
```ts
type Option<a> = Either<a,[...]>
```

# Defining monoids
Complete the following monoid definition:
```ts
(number,+,[...]) 
```

Complete the following monoid definition:
```ts
(number,*,[...]) 
```

Complete the following monoid definition:
```ts
(string,+,[...]) 
```

Complete the following monoid definition:
```ts
(Array<a>,[...],[...]) 
```

# Monads
Complete the following definition:
```ts
class OptionFunctor {
  static join<T>(nestedValue:Option<Option<T>>) : Option<T> {
    return nestedValue.kind == "empty" ? [...] : 
      nestedValue.content.kind == "empty" ? [...] :
      [...]
  }
  static unit<T>(unstructuredValue:T) : Option<T> {
    return [...]
  }
}
```

Complete the following definition:
```ts
class CountainerFunctor {
  static join<T>(nestedValue:Countainer<Countainer<T>>) : Countainer<T> {
    return ({ content:[...], counter:[...] })
  }
  static unit<T>(unstructuredValue:T) : Countainer<T> {
    return Countainer(unstructuredValue)
  }
}
```

Complete the following definition:
```ts
type Process<s,a> = Fun<s, [s,a]>
const mapProcess = <s,a,b>(f:Fun<a,b>) : Fun<Process<s,a>, Process<s,b>> =>
  Fun(p0 =>
    Fun(s0 => {
      const [s1,result] = p0(s0)
      const transformedResult = f(result)
      return [s1,transformedResult]
    })
  )
class ProcessFunctor {
  static join<S,T>(pp0:Process<S,Process<S,T>>) : Process<S,T> {
    return Fun(s0 => {
      const [s1,p1] = pp0(s0)
      return [...]
    })
  }
  static unit<S,T>(unstructuredValue:T) : Process<S,T> {
    return Fun(s => [s,unstructuredValue])
  }
}
```


# Advanced monads and functors
Complete the following definition:
```tsx
import React from "react";

export type Widget<o> = {
  run: (onOutput: (_: o) => void) => JSX.Element;
  map: [...];
  wrapHTML: (f: (_: JSX.Element) => JSX.Element) => Widget<o>;
};

export const Widget = {
  Default: <o,>(actual: (onOutput: (_: o) => void) => JSX.Element): Widget<o> => ({
    run: actual,
    map: function <o2>(this: Widget<o>, f: (_: o) => o2): Widget<o2> {
            return [...]
        );
      },
    wrapHTML: function (this: Widget<o>, f: (_: JSX.Element) => JSX.Element): Widget<o> {
        return Widget.Default(onOutput => f(this.run(onOutput))
      );
    }
  }),
  any: <o,>(ws: Array<Widget<o>>): Widget<o> => 
    Widget.Default<o>(onOutput => 
      <>{
        ws.map(w => w.run(onOutput))
      }</>
    )
};
```


Complete the following type definitions
```ts
export type Coroutine<context, state, events, result> = {
  ([context, deltaT, events]: [context, DeltaT, Array<events>]): CoroutineStep<
    context,
    state,
    events,
    result
  >;

export type CoroutineStep<context, state, events, result> = {
  newState: BasicUpdater<state> | undefined;
} & (
  | { kind: "result"; [...] }
  | {
      kind: "then";
      p: Coroutine<context, state, events, any>;
      k: BasicFun<any, Coroutine<context, state, events, result>>;
    }
  | { kind: "yield"; next: [...] }
  | {
      kind: "waiting";
      msLeft: number;
      next: [...];
    }
)
```