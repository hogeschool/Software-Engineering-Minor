//DO NOT USE CLASSES IN THIS COURSE!!! ONLY FOR THIS EXAMPLE!!!!

class Int {
  value: number

  constructor() {
    this.value = 0
  }

  incr() {
    this.value++
  }

  decr() {
    this.value--
  }
}

class EvenCounter {
  value: Int
  constructor() {
    this.value = new Int()
  }

  tick() {
    this.value.incr()
    this.value.incr()
  }
}

class Counter {
  value: Int
  constructor() {
    this.value = new Int()
  }

  tick() {
    this.value.incr()
  }
}

let ec = new EvenCounter()
let rc = new Counter()

ec.tick()
rc.tick()
console.log(ec.value)
console.log(rc.value)

//THIS IS NOT GOOD!!!

