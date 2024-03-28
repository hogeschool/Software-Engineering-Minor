import React from "react"
import { Coroutine } from "./Coroutine"
import { BasicFun, BasicUpdater, Unit } from "./fun"

export type CoroutineComponentProps<context, state> = 
  {
    currentContext: context,
    setState: BasicFun<BasicUpdater<state>, void>,
    initialCoroutine: Coroutine<context, state, never, Unit>
  }

export type CoroutineComponentState<context, state> = 
{
  currentCoroutine: Coroutine<context, state, never, Unit>
}

export class CoroutineComponent<context, state> extends React.Component<
  CoroutineComponentProps<context, state>,
  CoroutineComponentState<context, state>
  > {
  constructor(props: CoroutineComponentProps<context, state>) {
    super(props)
 
    this.state = { currentCoroutine:props.initialCoroutine }
  }

  running = false
  animationId:number = -1
  componentDidMount(): void {
    let lastTimestamp = Date.now()
    this.running = true
    const tick = () => {
      if (!this.running) {
        clearInterval(this.animationId)
        return
      }
      let currentTimestamp = Date.now()
      let deltaT = currentTimestamp - lastTimestamp
      lastTimestamp = currentTimestamp

      const step = Coroutine.Tick<context, state, never, Unit>(this.props.currentContext, [], this.state.currentCoroutine, deltaT)
      if (step.kind == "done") {
        this.setState(s => ({...s, currentCoroutine: this.props.initialCoroutine}), () => {
          if (step.state != undefined) {
            this.props.setState(step.state)
          }
        })
      } else {
        this.setState(s => ({...s, currentCoroutine: step.next}), () => {
          if (step.state != undefined) {
            this.props.setState(step.state)
          }
        })
      }
    }
    this.animationId = setInterval(tick, 50)
  }

  componentWillUnmount(): void {
    this.running = false
    clearInterval(this.animationId)
  }

  shouldComponentUpdate(): boolean {
    return false
  }

  render() {
    return <></>
  }
}

// const coroutineRunner = <state,>(state:state, initialCoroutine:) : Widget<Updater<state>> =>
//   Widget.Default<Updater<state>>(setState => 
//     <CoroutineComponent initialCoroutine={ageIncreaseBackgroundProcess} setState={_ => setState(Updater(_))} currentContext={pairProgrammers} />
//     )
