import Immutable from "immutable"

type Fun<input,output> = {
  (input:input) : output,
  then:<nextOutput>(other:Fun<output, nextOutput>) => Fun<input, nextOutput>
}

const Fun = <input,output>(actual:(_:input) => output) : Fun<input,output> => {
  const f = actual as Fun<input,output>
  f.then = function<nextOutput>(this:Fun<input,output>, other:Fun<output, nextOutput>) : 
    Fun<input, nextOutput> {
      return Fun(input => other(this(input)))
    }
  return f
}

type Updater<s> = Fun<s,s>
const Updater = Fun

const id = <s>() => Fun<s,s>(x => x)

// ^ universal library
////////////////////////////////////////
// customer specific stuff

type Person = {
  id:string,
  fullName:string,
  age:number
}

const Person = {
  Updaters:{
    fullName:(fieldUpdater:Updater<Person["fullName"]>) : Updater<Person> =>
      Updater(person => ({...person, fullName:fieldUpdater(person.fullName)})),
    age:(fieldUpdater:Updater<Person["age"]>) : Updater<Person> =>
      Updater(person => ({...person, age:fieldUpdater(person.age)})),
  }
}

type Course = {
  teacher:Person
  students:Immutable.Map<Person["id"], Person>
}

const Course = {
  Updaters:{
    teacher:(fieldUpdater:Updater<Course["teacher"]>) : Updater<Course> =>
      Updater(course => ({...course, teacher:fieldUpdater(course.teacher)})),
    students:(fieldUpdater:Updater<Course["students"]>) : Updater<Course> =>
      Updater(course => ({...course, students:fieldUpdater(course.students)})),
  }
}

const isStringEmpty = Updater((s:string) => s.length == 0)
const doctorify = Updater((s:string) => `Dr ${s}`)
const incr    = Fun((x:number) => x + 1)
const decr    = Fun((x:number) => x - 1)
const double  = Fun((x:number) => x * 2)
const gtz     = Fun((x:number) => x > 0)
const neg     = Fun((x:boolean) => !x)

const course:Course = {
  teacher:{ id:"gm", fullName:"Giuseppe Maggiore", age:38 },
  students:Immutable.Map()
}

// console.log(
//   Course.Updaters.teacher(
//     Person.Updaters.fullName(doctorify).then(
//     Person.Updaters.age(decr.then(decr)))
//   )(course))


// foundational framework
type CountainerData<content> = { content:content, counter:number }
type Countainer<content> = CountainerData<content> & { map:<output>(f:Fun<content,output>) => Countainer<output> }
const Countainer = <content>(data:CountainerData<content>) : Countainer<content> => ({
  ...data,
  map:function<output>(this:Countainer<content>, f:Fun<content,output>) : Countainer<output> { return map_Countainer(f)(this) }
})
const increment = <content>(input:Countainer<content>) : Countainer<content> => ({...input, counter:input.counter+1})
const map_Countainer = <input,output>(f:Fun<input,output>) : Fun<Countainer<input>,Countainer<output>> =>
  Fun(input => 
    Countainer({...input, content:f(input.content)})
  )

// operations on specific countainers
const tmp = map_Countainer(doctorify.then(isStringEmpty)).then(Fun(increment))


// values of actual countainers in memory...
const c_n:Countainer<number> = Countainer({ content:0, counter:0 })
const c_s:Countainer<string> = Countainer({ content:"Content", counter:0 })

// ...and their processing
console.log(tmp(c_s))


/*
Structure (type) with a structure-preserving transformation (map function over that type)

A type with a generic parameter "content"
A generic function which lifts an existing ("simpler") function f into the domain of our generic type by transforming the content and preserving the rest of the structure

type F<a> = ...a...
map_F = <a,b>(f:Fun<a,b>) : Fun<F<a>, F<b>>
*/

type Id<a> = a
const map_Id = <a,b>(f:Fun<a,b>) : Fun<Id<a>, Id<b>> => f

type Option<a> = { kind:"empty" } | { kind:"full", content:a }
const Option = { 
  Default:{
    Empty:<a>() : Option<a> => ({ kind:"empty" }),
    Full:<a>(content:a) : Option<a> => ({ kind:"full", content:content }),
  }
}
const map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>, Option<b>> =>
  Fun(input => input.kind == "empty" ? Option.Default.Empty() : Option.Default.Full(f(input.content)))

const map_Array = <a,b>(f:Fun<a,b>) : Fun<Array<a>, Array<b>> =>
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

type Unit = null
type Functors<a> = {
  Id:Id<a>,
  Array:Array<a>,
  Option:Option<a>,
  Countainer:Countainer<a>,
}

type Functor<F extends keyof Functors<Unit>> = F
const Functor = <F extends keyof Functors<Unit>>(f:F) => f

type Then<F extends keyof Functors<Unit>, G> = { Before:F, After:G }
const Then = <F extends keyof Functors<Unit>, G>(f:F, g:G) : Then<F,G> => ({ Before:f, After:g })

type Apply<F, a> = 
  F extends keyof Functors<Unit> ? Functors<a>[F]
  : F extends Then<infer G, infer H> ? Apply<G, Apply<H,a>>
  : "Cannot apply because F is neither a primitive nor a composite functor"

type Mapping<F> = <a,b>(f:Fun<a,b>) => Fun<Apply<F,a>,Apply<F,b>> // == Fun<F<a>, F<b>>
type Mappings = {
  [F in keyof Functors<Unit>] : Mapping<F>
}

const mappings: Mappings = {
  Id:map_Id,
  Array:map_Array,
  Countainer:map_Countainer,
  Option:map_Option  
}

const map = <F>(F:F) : Mapping<F> => 
  typeof(F) == "string" && F in mappings ? (mappings as any)[F]
  : "After" in (F as any) && "Before" ? 
    <a,b>(f:Fun<a,b>) => map((F as any)["Before"])(map((F as any)["After"])(f)) as any
  : null!

const m1 = map(Functor("Array"))
const m2 = map(Then("Countainer", Functor("Option")))(incr.then(gtz))

const AACO = Then("Array", Then("Array", Then("Countainer", Functor("Option"))))
const AAO = Then("Array", Then("Array", Functor("Option")))
const m3 = map(AACO)(incr.then(gtz))


