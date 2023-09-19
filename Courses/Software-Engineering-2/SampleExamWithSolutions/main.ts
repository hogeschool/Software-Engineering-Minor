import { runExercise6 } from "./drawing"
import { runExercise4a, runExercise4b } from "./server"
import { printValue, runExercise2 } from "./tiny-language-statefull"

console.log("-------------------------")
console.log("Exercise 2")
const exercise2Result = runExercise2()
console.log(`x = ${printValue(exercise2Result.second.get("x")!)}\ny = ${printValue(exercise2Result.second.get("y")!)}`)

console.log("-------------------------")
console.log("Exercise 4")
const exercise3Result1 = runExercise4a()
console.log(exercise3Result1.kind == "right" ? exercise3Result1.value.first : `$Code = ${exercise3Result1.value.code}, Message = ${exercise3Result1.value.message}`)
console.log("-------------------------")
const exercise3Result2 = runExercise4b()
console.log(exercise3Result2.kind == "right" ? exercise3Result2.value.first : `$Code = ${exercise3Result2.value.code}, Message = ${exercise3Result2.value.message}`)
console.log("-------------------------")
console.log("Exercise 6")
runExercise6()
