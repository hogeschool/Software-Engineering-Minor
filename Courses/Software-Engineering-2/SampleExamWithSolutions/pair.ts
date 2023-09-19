import { Fun } from "./fun"

export interface Pair<a, b> {
  first: a
  second: b
}

export const mapPair = <a, a1, b, b1>(f: Fun<a, a1>, g: Fun<b, b1>): Fun<Pair<a, b>, Pair<a1, b1>> => Fun(
  (pair: Pair<a, b>): Pair<a1, b1> => ({
    first: f(pair.first),
    second: g(pair.second)
  })
)