import Immutable, { ContainObject } from "immutable"

type Fun<input, output> = {
  (input: input): output,
  then: <nextOutput>(other: Fun<output, nextOutput>) => Fun<input, nextOutput>
}

const Fun = <input, output>(actual: (_: input) => output): Fun<input, output> => {
  const f = actual as Fun<input, output>
  f.then = function <nextOutput>(this: Fun<input, output>, other: Fun<output, nextOutput>):
    Fun<input, nextOutput> {
    return Fun(input => other(this(input)))
  }
  return f
}

const apply = <a, b>(): Fun<Pair<Fun<a, b>, a>, b> => Fun(([f, a]) => f(a))

type Updater<s> = Fun<s, s>
const Updater = Fun

const id = <s>() => Fun<s, s>(x => x)

// ^ universal library
////////////////////////////////////////
// customer specific stuff

type Person = {
  id: string,
  fullName: string,
  age: number
}

const Person = {
  Updaters: {
    fullName: (fieldUpdater: Updater<Person["fullName"]>): Updater<Person> =>
      Updater(person => ({ ...person, fullName: fieldUpdater(person.fullName) })),
    age: (fieldUpdater: Updater<Person["age"]>): Updater<Person> =>
      Updater(person => ({ ...person, age: fieldUpdater(person.age) })),
  }
}

type Course = {
  teacher: Person
  students: Immutable.Map<Person["id"], Person>
}

const Course = {
  Updaters: {
    teacher: (fieldUpdater: Updater<Course["teacher"]>): Updater<Course> =>
      Updater(course => ({ ...course, teacher: fieldUpdater(course.teacher) })),
    students: (fieldUpdater: Updater<Course["students"]>): Updater<Course> =>
      Updater(course => ({ ...course, students: fieldUpdater(course.students) })),
  }
}

const isStringEmpty = Updater((s: string) => s.length == 0)
const doctorify = Updater((s: string) => `Dr ${s}`)
const incr = Fun((x: number) => x + 1)
const decr = Fun((x: number) => x - 1)
const double = Fun((x: number) => x * 2)
const gtz = Fun((x: number) => x > 0)
const neg = Fun((x: boolean) => !x)

const course: Course = {
  teacher: { id: "gm", fullName: "Giuseppe Maggiore", age: 38 },
  students: Immutable.Map()
}

// console.log(
//   Course.Updaters.teacher(
//     Person.Updaters.fullName(doctorify).then(
//     Person.Updaters.age(decr.then(decr)))
//   )(course))


// foundational framework
type CountainerData<content> = { content: content, counter: number }
type Countainer<content> = CountainerData<content> & { map: <output>(f: Fun<content, output>) => Countainer<output> }
const Countainer = <content>(data: CountainerData<content>): Countainer<content> => ({
  ...data,
  map: function <output>(this: Countainer<content>, f: Fun<content, output>): Countainer<output> { return map_Countainer(f)(this) }
})
const increment = <content>(input: Countainer<content>): Countainer<content> => ({ ...input, counter: input.counter + 1 })
const map_Countainer = <input, output>(f: Fun<input, output>): Fun<Countainer<input>, Countainer<output>> =>
  Fun(input =>
    Countainer({ ...input, content: f(input.content) })
  )

// operations on specific countainers
const tmp = map_Countainer(doctorify.then(isStringEmpty)).then(Fun(increment))


// values of actual countainers in memory...
const c_n: Countainer<number> = Countainer({ content: 0, counter: 0 })
const c_s: Countainer<string> = Countainer({ content: "Content", counter: 0 })

// ...and their processing
// console.log(tmp(c_s))


/*
Structure (type) with a structure-preserving transformation (map function over that type)

A type with a generic parameter "content"
A generic function which lifts an existing ("simpler") function f into the domain of our generic type by transforming the content and preserving the rest of the structure

type F<a> = ...a...
map_F = <a,b>(f:Fun<a,b>) : Fun<F<a>, F<b>>
*/

type Id<a> = a
const map_Id = <a, b>(f: Fun<a, b>): Fun<Id<a>, Id<b>> => f

type Option<a> = ({ kind: "empty" } | { kind: "full", content: a }) & { then: <b>(f: (_: a) => Option<b>) => Option<b> }
const Option = {
  Default: {
    Empty: <a>(): Option<a> => ({ kind: "empty", then: function <b>(this: Option<a>, f: (_: a) => Option<b>) { return then_Option(this, f) } }),
    Full: <a>(content: a): Option<a> => ({ kind: "full", content: content, then: function <b>(this: Option<a>, f: (_: a) => Option<b>) { return then_Option(this, f) } }),
  }
}
const map_Option = <a, b>(f: Fun<a, b>): Fun<Option<a>, Option<b>> =>
  Fun(input => input.kind == "empty" ? Option.Default.Empty() : Option.Default.Full(f(input.content)))

const map_Array = <a, b>(f: Fun<a, b>): Fun<Array<a>, Array<b>> =>
  Fun(input => input.map(f))


/*
law I) we want to preserve the identify
map_F(id()) == id()

law II) we want to distribute over function composition
map_F(f.then(g)) == map_F(f).then(map_F(g))
*/

// map_Array(incr.then(double)) == map_Array(incr).then(map_Array(double)))
// [1,2,3] -> [4,6,8]           == [1,2,3] -> [2,3,4] -> [4,6,8]


// F<a>, map_F, respecting our 2 laws is called a FUNCTOR

/*
given two functors, F and G with map_F and map_g respectively, then:

type FG<a> = F<G<a>>
let map_FG = <a,b>(f:Fun<a,b>) : Fun<FG<a>, FG<b>> => map_F(map_G(f))

is also a functor
*/

type Unit = {}
type Functors<a> = {
  Id: Id<a>,
  Array: Array<a>,
  Option: Option<a>,
  Countainer: Countainer<a>,
}

type Functor<F extends keyof Functors<Unit>> = F
const Functor = <F extends keyof Functors<Unit>>(f: F) => f

type Then<F extends keyof Functors<Unit>, G> = { Before: F, After: G }
const Then = <F extends keyof Functors<Unit>, G>(f: F, g: G): Then<F, G> => ({ Before: f, After: g })

type Apply<F, a> =
  F extends keyof Functors<Unit> ? Functors<a>[F]
  : F extends Then<infer G, infer H> ? Apply<G, Apply<H, a>>
  : "Cannot apply because F is neither a primitive nor a composite functor"

type Mapping<F> = <a, b>(f: Fun<a, b>) => Fun<Apply<F, a>, Apply<F, b>> // == Fun<F<a>, F<b>>
type Mappings = {
  [F in keyof Functors<Unit>]: Mapping<F>
}

const mappings: Mappings = {
  Id: map_Id,
  Array: map_Array,
  Countainer: map_Countainer,
  Option: map_Option
}

const map = <F>(F: F): Mapping<F> =>
  typeof (F) == "string" && F in mappings ? (mappings as any)[F]
    : "After" in (F as any) && "Before" ?
      <a, b>(f: Fun<a, b>) => map((F as any)["Before"])(map((F as any)["After"])(f)) as any
      : null!

const m1 = map(Functor("Array"))
const m2 = map(Then("Countainer", Functor("Option")))(incr.then(gtz))

const AACO = Then("Array", Then("Array", Then("Countainer", Functor("Option"))))
const AAO = Then("Array", Then("Array", Functor("Option")))
const m3 = map(AACO)(incr.then(gtz))


/*
Monoids

number, +, 0
0 is the identity of +
x + 0 == 0 + x == x
(fun x => x + 0) == id == (fun x => 0 + x)
associativity
(a + b) + c == a + (b + c) == a + b + c


number, *, 1
1 is the identity of *
x * 1 == 1 * x == x
(fun x => x * 1) == id == (fun x => 1 * x)
associativity
(a * b) * c == a * (b * c) == a * b * c


string, +, ""
"" is the identity of +
x + "" == x == "" + x
(a + b) + c == a + (b + c) == a + b + c


Array<a>, concat, []
[] is the identity of concat
x.concat([]) == x == [].concat(x)
(a.concat(b)).concat(c) == a.concat(b.concat(c))


- we have a type T
- we have a composition operation <+> : (T, T) => T
- we have an identity element e:T
- the following must hold for (T,<+>,e) to be a monoid:
  - a <+> e == e <+> a == a    for each a in T
  - (a <+> b) <+> c == a <+> (b <+> c) == a <+> b <+> c    for each a, b, and c in T


- we have a type T
- we have a composition operation join : Fun<Pair<T, T>, T>
- we have an identity element getZero:Fun<Unit,T>
- the following must hold for (T,<+>,e) to be a monoid:
  - join([a, getZero()]) == join([getZero(), a]) == a    for each a in T
    - fun a => join([a, getZero()]) == id == fun a => join([getZero(), a])
    - mkPair(getZero, id).then(join) == id
  - join(join(a, b), c) == join(a, join(b, c))    for each a, b, and c in T
    - map2_Pair(id<string>(), stringPlus.join).then(stringPlus.join) == associate<string,string,string>().then(map2_Pair(stringPlus.join, id<string>()).then(stringPlus.join))
*/



type Pair<a, b> = [a, b]

const associate = <a, b, c>(): Fun<Pair<a, Pair<b, c>>, Pair<Pair<a, b>, c>> => Fun(([a, [b, c]]) => [[a, b], c])
const map2_Pair = <a, b, a1, b1>(l: Fun<a, a1>, r: Fun<b, b1>): Fun<Pair<a, b>, Pair<a1, b1>> => Fun(p => [l(p[0]), r(p[1])])
const mkPair = <c, a, b>(l: Fun<c, a>, r: Fun<c, b>): Fun<c, Pair<a, b>> => Fun(c => [l(c), r(c)])


type Monoid<T> = { join: Fun<Pair<T, T>, T>, getZero: Fun<Unit, T> }

const stringPlus: Monoid<string> = {
  join: Fun(([s1, s2]: Pair<string, string>) => s1 + s2),
  getZero: Fun((_: Unit) => "")
}

const numberPlus: Monoid<number> = {
  join: Fun(([s1, s2]: Pair<number, number>) => s1 + s2),
  getZero: Fun((_: Unit) => 0)
}

// const borkedMonoid : Monoid<number> = {
//   join:Fun(([s1,s2]:Pair<number,number>) => s1+s2),
//   getZero:Fun((_:Unit) => 1)
// }

const identityLaw = <T extends {}>(m: Monoid<T>, samples: Array<T>) => {
  const pointlessPath1 = mkPair(m.getZero, id<T>()).then(m.join)
  const pointlessPath2 = mkPair(id<T>(), m.getZero).then(m.join)
  samples.forEach(s => {
    if (s != pointlessPath1(s)) console.error("m is not a monoid!!!")
    if (s != pointlessPath2(s)) console.error("m is not a monoid!!!")
  })
}

// identityLaw(stringPlus, ["a", "abc", "", "abcd"])

// // const pp1:Pair<string, Pair<string, string>> = ["a",["b","c"]]
// // const pp2:Pair<Pair<string, string>, string> = [["a","b"],"c"]
// const f1 = map2_Pair(id<number>(), numberPlus.join).then(numberPlus.join)
// const f2 = associate<number,number,number>().then(map2_Pair(numberPlus.join, id<number>()).then(numberPlus.join))


/*
- we have a functor F (type F<a> = ..., map_F : Fun<a,b> => Fun<F<a>,F<b>>)
- we have an identity element unit<a>:Fun<Id<a>,F<a>> == Fun<a,F<a>>
- we have a composition operation join : Fun<F<F<a>>, F<a>>
- the following must hold for (T,<+>,e) to be a monoid:
  - F<a> -> F<F<a>> -> F<a> == id
    - unit<F<a>>.then(join) == id == map_F<a,F<a>>(unit).then(join) == id
  - F<F<F<a>>> -> F<F<a>> -> F<a>
    - join.then(join) == map_F(join).then(join)
*/


// Monoidal functors are just MONADS
type Monad<F> = {
  unit: <a>() => Fun<Apply<Functor<"Id">, a>, Apply<F, a>>,
  join: <a>() => Fun<Apply<F, Apply<F, a>>, Apply<F, a>>
}
const OptionMonad: Monad<Functor<"Option">> = {
  unit: <a>() => Fun(Option.Default.Full<a>),
  join: <a>() => Fun<Option<Option<a>>, Option<a>>(o2 => o2.kind == "empty" ? Option.Default.Empty() : o2.content.kind == "empty" ? Option.Default.Empty() : Option.Default.Full(o2.content.content))
}

const then_Option = <a, b>(p: Option<a>, f: (_: a) => Option<b>): Option<b> => map_Option(Fun(f)).then(OptionMonad.join())(p)


const maybeAdd = (x: Option<number>, y: Option<number>): Option<number> =>
  x.then(x_v =>
    y.then(y_v =>
      Option.Default.Full(x_v + y_v)
    )
  )


type State<s, a> = Fun<s, Pair<a, s>> & { then_State: <b>(f: (_: a) => State<s, b>) => State<s, b> }
const State = <s, a>(actual: Fun<s, Pair<a, s>>): State<s, a> => {
  const tmp = actual as State<s, a>
  tmp.then_State = function <b>(this: State<s, a>, f: (_: a) => State<s, b>): State<s, b> {
    return then_State(this, f)
  }
  return tmp
}

let map_State = <s, a, b>(f: Fun<a, b>): Fun<State<s, a>, State<s, b>> =>
  Fun(p0 => State(p0.then(map2_Pair(f, id<s>()))))

const StateMonad = <s>() => ({
  unit: <a>(): Fun<Id<a>, State<s, a>> => Fun(a => State(Fun(s0 => [a, s0]))),
  join: <a>(): Fun<State<s, State<s, a>>, State<s, a>> => Fun(p_p => State(p_p.then(apply<s, Pair<a, s>>()))),
  getState: (): State<s, s> => State(Fun(s0 => [s0, s0])),
  setState: (newState: s): State<s, Unit> => State(Fun(_ => [{}, newState])),
  updateState: (stateUpdater: (_: s) => s): State<s, Unit> => State(Fun(s0 => [{}, stateUpdater(s0)])),
})

const then_State = <state, intermediateResult, finalResult>(
  p: State<state, intermediateResult>,
  f: (_: intermediateResult) => State<state, finalResult>): State<state, finalResult> =>
  map_State<state, intermediateResult, State<state, finalResult>>(Fun(f)).then(StateMonad<state>().join<finalResult>())(p)

type Memory = {
  a: number,
  b: number,
  c: string,
  d: string,
}
const Memory = {
  Default:({ a:0, b:0, c:"c", d:"d" }),
  a: (_: Updater<Memory["a"]>): Updater<Memory> => Fun(current => ({ ...current, a: _(current.a) })),
  b: (_: Updater<Memory["b"]>): Updater<Memory> => Fun(current => ({ ...current, b: _(current.b) })),
  c: (_: Updater<Memory["c"]>): Updater<Memory> => Fun(current => ({ ...current, c: _(current.c) })),
  d: (_: Updater<Memory["d"]>): Updater<Memory> => Fun(current => ({ ...current, d: _(current.d) })),
}

type Instruction<a> = State<Memory, a>
const Ins = {
  ...StateMonad<Memory>(),
  getVar: <k extends keyof Memory>(k: k): Instruction<Memory[k]> =>
    Ins.getState().then_State(current => Ins.unit<Memory[k]>()(current[k])),
  setVar: <k extends keyof Memory>(k: k, v: Memory[k]): Instruction<Unit> =>
    Ins.updateState(current => ({ ...current, [k]: v }))
}


// Ins.updateState(currentState => ({...currentState, a:currentState.a+1})).then_State(() => 
//   Ins.updateState(currentState => ({...currentState, b:currentState.b+1}))
// )

const myProgram1 =
  Ins.getVar("a").then_State(a =>
    Ins.setVar("a", a + 1).then_State(() =>
      Ins.getVar("c").then_State(c =>
        Ins.getVar("d").then_State(d =>
          Ins.setVar("c", c + d)
        )
      )
    )
  )

// console.log(myProgram1({ a:0, b:0, c:"c", d:"d" }))

type DeltaT = number
type Coroutine<c,s,a> = {
  ([context, deltaT]:[c & s,DeltaT]) : CoroutineStep<c,s,a>,
  then:<b>(k:(_:a) => Coroutine<c,s,b>) => Coroutine<c,s,b>,
}
type CoroutineStep<c,s,a> = (
  | { kind:"result", value:a } 
  | { kind:"suspend", next:Coroutine<c,s,a> }
  | { kind:"waiting", msLeft:DeltaT, next:Coroutine<c,s,a> }
) & { updateState:Option<Updater<s>> }

const thenMaybe = <s>(f:Option<Updater<s>>, g:Option<Updater<s>>) : Option<Updater<s>> =>
  f.kind == "full" && g.kind == "full" ? Option.Default.Full(f.content.then(g.content))
  : f.kind == "full" ? f : g
  
const Coroutine = <c,s>() => ({
  // constructors
  Default:<a>(actual:([context, deltaT]:[c & s,DeltaT]) => CoroutineStep<c,s,a>) : Coroutine<c,s,a> => {
    const result = actual as Coroutine<c,s,a>
    result.then = function<b>(this:Coroutine<c,s,a>, k:(_:a) => Coroutine<c,s,b>) : Coroutine<c,s,b> { return Coroutine<c,s>().then(this, Fun(k)) }
    return result
  },
  Result:<a>(value:a) : Coroutine<c,s,a> => Coroutine<c,s>().Default((_) => CoroutineStep<c,s>().Result(value)),
  Suspend:() : Coroutine<c,s,Unit> => Coroutine<c,s>().Default((_) => CoroutineStep<c,s>().Suspend(Coroutine<c,s>().Result({}))),
  Wait:(msLeft:DeltaT) : Coroutine<c,s,Unit> => Coroutine<c,s>().Default((_) => CoroutineStep<c,s>().Wait(msLeft, Coroutine<c,s>().Result({}))),
  GetState:() : Coroutine<c,s,c & s> => Coroutine<c,s>().Default(([context, deltaT]) => CoroutineStep<c,s>().Result(context)),
  SetState:(updateState:Updater<s>) : Coroutine<c,s,Unit> => Coroutine<c,s>().Default(([context, deltaT]) => CoroutineStep<c,s>().SetState(updateState)),
  
  // combinators
  Tick:<a>(context:c & s, deltaT:number, p:Coroutine<c,s,a>) : ({ kind:"done", result:a } | { kind:"continuing", next:Coroutine<c,s,a> }) & { updateState:Option<Updater<s>> } => {
    const step = p([context, deltaT])
    if (step.kind == "result") {
      return { kind:"done", result:step.value, updateState:step.updateState }
    } else if (step.kind == "suspend") {
      return { kind:"continuing", next:step.next, updateState:step.updateState }
    } else {
      if (step.msLeft <= deltaT)
        return { kind:"continuing", next:step.next, updateState:step.updateState }
      else
        return { kind:"continuing", next:Coroutine<c,s>().Wait(step.msLeft - deltaT).then(() => step.next), updateState:step.updateState }
    }
  },
  Seq:(ps:Array<Coroutine<c,s,Unit>>) : Coroutine<c,s,Unit> => ps.length <= 0 ? Coroutine<c,s>().Result({}) : ps[0].then(() => Coroutine<c,s>().Seq(ps.slice(1))),
  Repeat:(p:() => Coroutine<c,s,Unit>) : Coroutine<c,s,Unit> => p().then(() => Coroutine<c,s>().Repeat(p)),
  Any:<a>(ps:Array<Coroutine<c,s,a>>) : Coroutine<c,s,a> => {
    return Coroutine<c,s>().Default(([context, deltaT]) => {

      const ps1:Array<Coroutine<c,s,a>> = []
      let nextState = Option.Default.Empty<Updater<s>>()
      for (const p of ps) {
        const step = Coroutine<c,s>().Tick(context, deltaT, p)
        nextState = thenMaybe(nextState, step.updateState)
        if (step.kind == "done") return { kind:"result", value:step.result, updateState:nextState }
        else {
          ps1.push(step.next)
        }
      }
      return { kind:"suspend", next:Coroutine<c,s>().Any(ps1), updateState:nextState }
    })
  },

  // functoriality and monadicity
  map:<a,b>(f:Fun<a,b>) : Fun<Coroutine<c,s,a>, Coroutine<c,s,b>> => Fun(p => 
    Coroutine<c,s>().Default(
      Fun(p).then(CoroutineStep<c,s>().map(f))
    )
  ),
  join:<a>(pp:Coroutine<c,s,Coroutine<c,s,a>>) : Coroutine<c,s,a> => 
    Coroutine<c,s>().Default(([context, deltaT]) => {
      const step = pp([context, deltaT])
      if (step.kind == "result") {
        const step1 = step.value([context, deltaT])
        return {...step1, updateState:thenMaybe(step.updateState, step1.updateState) }
      } else {
        const joinedNext = Coroutine<c,s>().join(step.next)
        return {...step, next:joinedNext}
      }
    }),
  then:<a,b>(p:Coroutine<c,s,a>, k:Fun<a, Coroutine<c,s,b>>) : Coroutine<c,s,b> =>
    Coroutine<c,s>().join(Coroutine<c,s>().map(k)(p)),
})

const CoroutineStep = <c,s>() => ({
  SetState:(updateState:Updater<s>) : CoroutineStep<c,s,Unit> => ({ kind:"result", value:{}, updateState:Option.Default.Full(updateState) }),
  Result:<a>(value:a) : CoroutineStep<c,s,a> => ({ kind:"result", value:value, updateState:Option.Default.Empty() }),
  Suspend:<a>(next:Coroutine<c,s,a>) : CoroutineStep<c,s,a> => ({ kind:"suspend", next:next, updateState:Option.Default.Empty() }),
  Wait:<a>(msLeft:DeltaT,next:Coroutine<c,s,a>) : CoroutineStep<c,s,a> => ({ kind:"waiting", next:next, msLeft:msLeft, updateState:Option.Default.Empty() }),

  map:<a,b>(f:Fun<a,b>) : Fun<CoroutineStep<c,s,a>, CoroutineStep<c,s,b>> => Fun(cs => 
    cs.kind == "result" ? {...cs, value:f(cs.value) }
    : {...cs, next:Coroutine<c,s>().map(f)(cs.next) }
  )
})


const Co = Coroutine<Unit, Memory>()

const p = 
  Co.Seq([
    Co.SetState(Memory.a(incr)),
    Co.Wait(60),
    Co.SetState(Memory.b(incr)),
    Co.Wait(40),
    Co.Any([
      Co.Repeat(() =>
        Co.Seq([
          Co.SetState(Memory.a(incr)),
          Co.Wait(20),
        ])
      ),
      Co.Wait(200)
    ])
  ])

const deltaT = 10
const run = (currentState:Memory, p:Coroutine<Unit, Memory, Unit>) : void => {
  const step = Co.Tick(currentState, deltaT, p)
  const nextState = (step.updateState.kind == "full" ? step.updateState.content : id<Memory>())(currentState)
  console.log(`New state: ${JSON.stringify(nextState)}`)
  if (step.kind == "done") return
  return run(nextState, step.next)
}

run(Memory.Default, p)
