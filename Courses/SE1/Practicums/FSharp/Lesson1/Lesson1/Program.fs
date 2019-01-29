type Fun<'a,'b> = 
  {
    f: 'a -> 'b // (i:a) => b
  }
  with
    static member Fun(f: 'a -> 'b) = { f = f }
    member this.Then(g: Fun<'b,'c>): Fun<'a,'c> = Fun.Fun(fun x -> g.f(this.f(x)))

let incr = Fun.Fun(fun (x: int) -> x + 1)
      
  

[<EntryPoint>]
let main argv = 
  printfn "%A" (incr.f(5))
  0 // return an integer exit code
