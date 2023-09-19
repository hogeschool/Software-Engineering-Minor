export interface Fun<a, b> {
  (_: a): b
  then: <c>(g: Fun<b, c>) => Fun<a, c>
  repeat: (times: number) => Fun<a, a>
  repeatUntil: (condition: Fun<a, boolean>) => Fun<a, a>
}


export const Fun = function<a, b>(f: (_: a) => b): Fun<a, b> {
  const functionWrapper = f as Fun<a, b>
  functionWrapper.then =
    function<c>(this: Fun<a, b>, g: Fun<b, c>): Fun<a, c> {
      return Fun<a, c>(
        x => g(this(x))
      )
    }
  functionWrapper.repeat =
    function(this: Fun<a, a>, times: number): Fun<a, a> {
      if (times > 0) {
        return this.then(this.repeat(times - 1))
      }
      return Fun<a, a>(x => x)
    }
  functionWrapper.repeatUntil =
    function(this: Fun<a, a>, condition: Fun<a, boolean>): Fun<a, a> {
      return Fun<a, a>(
        x => 
          !condition(x) ? 
          this.then(this.repeatUntil(condition))(x) :
          x
      )
    }
  return functionWrapper
}

export const id = <a>(): Fun<a, a> => Fun(
  (x: a) => x
)