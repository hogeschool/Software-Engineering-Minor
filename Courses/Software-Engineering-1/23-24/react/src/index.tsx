import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { CoTypedFactory, Coroutine } from './core/Coroutine';
import { BasicUpdater, Unit, Updater, replaceWith } from './core/fun';
import { Widget } from './core/widget';
import { CoroutineComponent } from './core/coroutineToWidget';

const textInput = (currentText:string) : Widget<Updater<string>> =>
  Widget.Default(onOutput =>
    <input value={currentText} onChange={e => onOutput(replaceWith(e.currentTarget.value))} />
  )

type Person = {
  name:string,
  surname:string,
  age: number
}
const Person = {
  Updaters:{
    name:(_:BasicUpdater<string>) : Updater<Person> =>
      Updater(person => ({...person, name:_(person.name)})),
    surname:(_:BasicUpdater<string>) : Updater<Person> =>
      Updater(person => ({...person, surname:_(person.surname)})),
    age:(_:BasicUpdater<number>) : Updater<Person> =>
      Updater(person => ({...person, age:_(person.age)})),
  }
}

type PairProgrammers = {
  programmer1:Person,
  programmer2:Person,
}
const PairProgrammers = {
  Updaters:{
    programmer1:(_:BasicUpdater<Person>) : Updater<PairProgrammers> =>
      Updater(pairProgrammers => ({...pairProgrammers, programmer1:_(pairProgrammers.programmer1)})),
    programmer2:(_:BasicUpdater<Person>) : Updater<PairProgrammers> =>
      Updater(pairProgrammers => ({...pairProgrammers, programmer2:_(pairProgrammers.programmer2)})),
  }
}

const Co = CoTypedFactory<PairProgrammers, PairProgrammers, never>()
const ageIncreaseBackgroundProcess = 
  Co.Seq([
    Co.SetState(PairProgrammers.Updaters.programmer1(Person.Updaters.age(_ => _ + 1))),
    Co.Wait(500),
    Co.SetState(PairProgrammers.Updaters.programmer2(Person.Updaters.age(_ => _ + 2))),
    Co.Wait(500),
  ])

const nameInput = (person:Person) : Widget<Updater<Person>> =>
  textInput(person.name).map(Person.Updaters.name)

const surnameInput = (person:Person) : Widget<Updater<Person>> =>
  textInput(person.surname).map(Person.Updaters.surname)

const person = (person:Person) : Widget<Updater<Person>> =>
  Widget.any([
    nameInput(person).wrapHTML(_ => <div>{_}</div>),
    surnameInput(person).wrapHTML(_ => <div>{_}</div>),
  ])

const ageIncreaser = (pairProgrammers:PairProgrammers) : Widget<Updater<PairProgrammers>> =>
  Widget.Default<Updater<PairProgrammers>>(setState => 
    <CoroutineComponent initialCoroutine={ageIncreaseBackgroundProcess} setState={_ => setState(Updater(_))} currentContext={pairProgrammers} />
    )

const pairProgrammers = (pairProgrammers:PairProgrammers) : Widget<Updater<PairProgrammers>> =>
  Widget.any([
    person(pairProgrammers.programmer1).map(PairProgrammers.Updaters.programmer1).wrapHTML(_ => <div>{_}</div>),
    person(pairProgrammers.programmer2).map(PairProgrammers.Updaters.programmer2).wrapHTML(_ => <div>{_}</div>),
    ageIncreaser(pairProgrammers),
  ])

const helloWorld = (programmers:PairProgrammers) : Widget<Updater<PairProgrammers>> =>
  pairProgrammers(programmers).wrapHTML(_ => 
    <div>
      <h1>Hello to the wonderful world of widgets!!!</h1>
      {_}
      {JSON.stringify(programmers)}
    </div>
  )

const App = (props:{ programmer1:Person, programmer2:Person }) => {
  const [state,setState] = useState<PairProgrammers>(props)

  return <>
    {
      helloWorld(state).run(setState)
    }
  </>
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App programmer1={{ name:"John", surname:"Doe", age:0 }} programmer2={{ name:"Jane", surname:"Doe", age:0 }} />
  </React.StrictMode>,
);
