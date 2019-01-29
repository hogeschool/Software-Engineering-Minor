import { Fun } from "../Lesson3/practicum3"

type Fun_n<a> = Fun<number, a>

let map_Fun_n = function<a, b>(f: Fun<a, b>): Fun<Fun_n<a>, Fun_n<b>> {
  return Fun<Fun_n<a>, Fun_n<b>>((g: Fun_n<a>): Fun_n<b> => 
    g.then(f))
}

let unit_Fun_n = function<a>(): Fun<a, Fun_n<a>> {
  return Fun<a, Fun_n<a>>((x: a) => {
    return Fun<number, a>((i: number) => x)
  })
}

let join_Fun_n = function<a>(): Fun<Fun_n<Fun_n<a>>, Fun_n<a>> {
  return Fun<Fun_n<Fun_n<a>>, Fun_n<a>>((f: Fun<number, Fun<number, a>>) => {
    return Fun<number, a>((i: number) => f.f(i).f(i))
  })
}

export type Option<a> = ({
  kind: "none"
} | {
  kind: "some",
  value: a
}) & {
  bind: <b>(this: Option<a>, k: Fun<a, Option<b>>) => Option<b>
}

export let None = function<a>(): Option<a> {
  return {
    kind: "none",
    bind: function<b>(this: Option<a>, k: Fun<a, Option<b>>): Option<b> {
      return bind_Option(this, k)
    }
  }
}

export let Some = function<a>(content: a): Option<a> {
  return {
    kind: "some",
    value: content,
    bind: function<b>(this: Option<a>, k: Fun<a, Option<b>>): Option<b> {
      return bind_Option(this, k)
    }
  }
}

export let map_Option = function<a, b>(mapper: Fun<a, b>): Fun<Option<a>, Option<b>> {
  let g = (opt: Option<a>) => {
    if (opt.kind == "none") {
      return None<b>()
    }
    else {
      let newValue = mapper.f(opt.value)
      return Some<b>(newValue)
    }
  }
  return Fun<Option<a>, Option<b>>(g)
}

export let id = function<a>(): Fun<a, a> {
  return Fun<a, a>((x: a) => x)
}

//unit || return: a -> Option<a>
export let unit_Option = function<a>() : Fun<a, Option<a>> {
  let g = (x: a) => {
    return Some<a>(x)
  }
  return Fun<a, Option<a>>(g)
}

//join: Option<Option<a>> -> Option<a>
export let join_Option = function<a>(): Fun<Option<Option<a>>, Option<a>> {
  let g = (opt: Option<Option<a>>) => {
    if (opt.kind == "none") {
      return None<a>()
    }
    else {
      return opt.value
    }
  }
  return Fun<Option<Option<a>>, Option<a>>(g)
}

export let bind_Option = function<a, b>(opt: Option<a>, k: Fun<a, Option<b>>) : Option<b> {
  return map_Option(k).then(join_Option()).f(opt)
}

let safe_div = (a:number, b:number) : Option<number> =>
  b == 0 ? None<number>() : Some<number>(a / b) 
  
  export type Response<a> = ({
    kind: "exception",
    message: string
  } | {
    kind: "some",
    value: a })
  // }) & {
  //   bind: <b>(this: Exception<a>, k: Fun<a, Exception<b>>) => Exception<b>
  // }

  let Throw = function<a>(msg: string): Response<a> {
    return {
      kind: "exception",
      message: msg
    }
  }

  let Result = function<a>(content: a): Response<a> {
    return {
      kind: "some",
      value: content
    }
  }
  
 let map_Exception = function<a, b>(f: Fun<a, b>): Fun<Response<a>, Response<b>> {
   let g = ((res: Response<a>) => {
     if (res.kind == "exception") {
        return Throw<b>(res.message)
     }
     else {
        return Result<b>(f.f(res.value))
     }
   })
   return Fun<Response<a>, Response<b>>(g)
 }

 let unit_Exception = function<a>(): Fun<a, Response<a>> {
   let g = (x: a): Response<a> => {
      return Result<a>(x)
   }
   return Fun<a, Response<a>>(g)
 }

 type Unit = {}

 let join_Exception = function<a>(): Fun<Response<Response<a>>, Response<a>> {
   let g = (res: Response<Response<a>>) => {
     if (res.kind == "exception") {
       return Throw<a>(res.message)
     }
     else {
       return res.value
     }
   }
   return Fun<Response<Response<a>>, Response<a>>(g)
 }

 let bind_Exception = function<a, b>(m: Response<a>, k: Fun<a, Response<b>>): Response<b> {
   return map_Exception<a, Response<b>>(k).then(join_Exception<b>()).f(m)
 }

type Either<a,b> = { kind:"left", value:a } | { kind:"right", value:b }

let inl = <a,b>() : Fun<a, Either<a,b>> => Fun<a, Either<a,b>>(a => ({ kind:"left", value:a }))
let inr = <a,b>() : Fun<b, Either<a,b>> => Fun<b, Either<a,b>>(b => ({ kind:"right", value:b }))

let map_Either = <a,b,c,d>(f:Fun<a,c>,g:Fun<b,d>) 
  : Fun<Either<a,b>,Either<c,d>> =>
  Fun(x => 
      x.kind == "left" ? f.then(inl<c,d>()).f(x.value) : g.then(inr<c,d>()).f(x.value))

type Option2<a> = Either<Unit,a>
  let none = <a>() : Option2<a> => inl<Unit,a>().f({})
  let some = <a>() : Fun<a,Option2<a>> => inr<Unit,a>()
      
let map_Option2 = <a,b>(f:Fun<a,b>) : Fun<Option2<a>,Option2<b>> => 
  map_Either<Unit,a,Unit, b>(id<Unit>(), f)

let unit_Either = <a,b>() : Fun<a,Either<b,a>> => inr<b,a>()

let join_Either = <a,b>() : Fun<Either<b,Either<b,a>>, Either<b,a>> =>
  Fun(x => x.kind == "left" ? inl<b,a>().f(x.value)
                : x.value)