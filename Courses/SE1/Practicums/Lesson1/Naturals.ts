import { Fun, Unit } from "./Lesson1"

export interface Natural {
  value: Fun<Unit, number>
  succ: (_: Natural) => Natural
  add: (m: Natural) => Natural
}

let succ = Fun<Natural, Natural>((n: Natural) => Natural(n.value.f({}) + 1))

export let Natural = function(v: number): Natural {
  return {
    value: Fun((_) => v),
    succ: function(this: Natural): Natural {
      return Natural(this.value.f({}) + 1)
    },
    add: function(this: Natural, n: Natural): Natural {
      let n_succ = n.value.then(succ.repeat())
      return n_succ.f({}).f(this)
    }
  }
}

