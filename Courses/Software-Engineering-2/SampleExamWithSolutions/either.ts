import { Fun } from "./fun"

export type Either<a, b> = {
  kind: "left",
  value: a
} | {
  kind: "right",
  value: b
}

export const inl = <a, b>(): Fun<a, Either<a, b>> => Fun(
  (value: a) => ({
    kind: "left",
    value: value
  })
)

export const inr = <a, b>(): Fun<b, Either<a, b>> => Fun(
  (value: b) => ({
    kind: "right",
    value: value
  })
)