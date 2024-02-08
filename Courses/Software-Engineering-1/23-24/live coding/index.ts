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

console.log(
  Course.Updaters.teacher(
    Person.Updaters.fullName(doctorify).then(
    Person.Updaters.age(decr.then(decr)))
  )(course))
