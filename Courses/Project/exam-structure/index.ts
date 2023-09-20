import * as Immutable from "immutable"

interface Fun<input,output> {
  (_:input) : output,
  then<finalOutput>(postProcess:Fun<output, finalOutput>) : Fun<input,finalOutput>
}

const then = <input, intermediateOutput, output>(
  first:Fun<input,intermediateOutput>,second:Fun<intermediateOutput,output>) : Fun<input,output> =>
    fun((input:input) => second(first(input)))

const fun = <input,output>(f:(_:input) => output) : Fun<input,output> => {
  const fDecorated = f as Fun<input,output>
  fDecorated.then = function<finalOutput>(this:Fun<input, output>, postProcess:Fun<output, finalOutput>) : Fun<input,finalOutput> {
    return then(this, postProcess)
  }
  return fDecorated
}
const apply = <input,output>() : Fun<[Fun<input,output>, input], output> => fun(([f,i]) => f(i))

const id = <inputOutput>() => fun<inputOutput,inputOutput>(x => x)
const map2par = <input1,input2,output1,output2>(f:Fun<input1,output1>, g:Fun<input2,output2>) : Fun<[input1,input2], [output1,output2]> => fun(input => [f(input[0]), g(input[1])])
const map2 = <input,output1,output2>(f:Fun<input,output1>, g:Fun<input,output2>) : Fun<input, [output1,output2]> => fun(input => [f(input), g(input)])

type Countainer<content> = { content:content, counter:number }

const initCountainer = <content>(initialContent:content) : Countainer<content> => ({ content:initialContent, counter:0 })
const resetCountainer = <content>() => fun((countainer:Countainer<content>) : Countainer<content> => ({...countainer, counter:0 }))
const tickCountainer = <content>() => fun((countainer:Countainer<content>) : Countainer<content> => ({...countainer, counter:countainer.counter+1 }))
const untickCountainer = <content>() => fun((countainer:Countainer<content>) : Countainer<content> => ({...countainer, counter:countainer.counter-1 }))

const mapCountainer = <inputContent, outputContent>(f
  : Fun<           inputContent,             outputContent >)   // wraps/lifts this input function...
  : Fun<Countainer<inputContent>, Countainer<outputContent>> => // ...to countainers
    fun(countainer => ({...countainer, content:f(countainer.content)}))

// Option is a functor
type Either<content1, content2> = { kind:"content1", content:content1 } | { kind:"content2", content:content2 }
const createContent1 = <content1, content2>(content:content1) : Either<content1,content2> => ({ kind:"content1", content })
const createContent2 = <content1, content2>(content:content2) : Either<content1,content2> => ({ kind:"content2", content })
const map2Either = <inputContent1, outputContent1, inputContent2, outputContent2>(f1:Fun<inputContent1, outputContent1>, f2:Fun<inputContent2, outputContent2>) 
  : Fun<Either<inputContent1, inputContent2>, Either<outputContent1, outputContent2>> => 
    fun(input => 
      input.kind == "content1" ? createContent1(f1(input.content))
      : createContent2(f2(input.content))
    )

type Option<content> = Either<"empty",content>
const createEmpty = <content>() : Option<content> => createContent1("empty")
const createFull = <content>(content:content) : Option<content> => createContent2(content)
const mapOption = <inputContent, outputContent>(f:Fun<inputContent, outputContent>) 
  : Fun<Option<inputContent>, Option<outputContent>> => 
    map2Either(id(), f)

const mapArray = <inputContent, outputContent>(f:Fun<inputContent, outputContent>) 
: Fun<Array<inputContent>, Array<outputContent>> => 
  fun(input => input.map(f))

const mapPromise = <inputContent, outputContent>(f:Fun<inputContent, outputContent>) 
: Fun<Promise<inputContent>, Promise<outputContent>> => 
  fun(input => input.then(f))

const plusMonoid = {
  join:fun<[number,number], number>(([x,y]) => x + y),
  zero: <_>() => fun<_,number>(_ => 0),
}

const countainerMonoid = {
  zero:<content>() : Fun<content, Countainer<content>> => fun(initCountainer),
  join:<content>() : Fun<Countainer<Countainer<content>>, Countainer<content>> => fun(countainer2 => ({ content:countainer2.content.content, counter:countainer2.counter + countainer2.content.counter }))
}

const arrayMonoid = {
  zero:<content>() : Fun<content, Array<content>> => fun(x => [x]),
  join:<content>() : Fun<Array<Array<content>>, Array<content>> => fun(array2 => ([] as Array<content>).concat(...array2))
}

const optionMonoid = {
  zero:<content>() : Fun<content, Option<content>> => fun(createFull),
  join:<content>() : Fun<Option<Option<content>>, Option<content>> => fun(option2 => option2.kind == "content1" ? option2 : option2.content)
}

const promiseMonoid = {
  zero:<content>() : Fun<content, Promise<content>> => fun(x => Promise.resolve(x)),
  join:<content>() : Fun<Promise<Promise<content>>, Promise<content>> => fun(promise2 => promise2.then(_ => _))
}

const bindCountainer = <intermediateOutput, finalOutput>(firstInstance:Countainer<intermediateOutput>, postProcessing:Fun<intermediateOutput, Countainer<finalOutput>>) : Countainer<finalOutput> =>
  countainerMonoid.join<finalOutput>()(mapCountainer(postProcessing)(firstInstance))

const bindArray = <intermediateOutput, finalOutput>(firstInstance:Array<intermediateOutput>, postProcessing:Fun<intermediateOutput, Array<finalOutput>>) : Array<finalOutput> =>
  arrayMonoid.join<finalOutput>()(mapArray(postProcessing)(firstInstance))

const bindOption = <intermediateOutput, finalOutput>(firstInstance:Option<intermediateOutput>, postProcessing:Fun<intermediateOutput, Option<finalOutput>>) : Option<finalOutput> =>
  optionMonoid.join<finalOutput>()(mapOption(postProcessing)(firstInstance))

const bindPromise = <intermediateOutput, finalOutput>(firstInstance:Promise<intermediateOutput>, postProcessing:Fun<intermediateOutput, Promise<finalOutput>>) : Promise<finalOutput> =>
  promiseMonoid.join<finalOutput>()(mapPromise(postProcessing)(firstInstance))


const safeDivision = (x:Option<number>, y:Option<number>) : Option<number> =>
  bindOption(x, fun(valueX =>
    bindOption(y, fun(valueY =>
      valueY == 0 ? createEmpty() : createFull(valueX / valueY)
      ))
  ))

type Box<content> = { content:content } // == a
type Producer<result> = Fun<{}, result>
const mapProducer = <intermediateOutput, finalOutput>(f:Fun<intermediateOutput, finalOutput>) 
  : Fun<Producer<intermediateOutput>, Producer<finalOutput>> => 
    fun(inputProducer => inputProducer.then(f))

type Reader<context,result> = Fun<context, result>
const mapReader = <context, intermediateOutput, finalOutput>(f:Fun<intermediateOutput, finalOutput>) 
  : Fun<Reader<context, intermediateOutput>, Reader<context, finalOutput>> => 
    fun(inputReader => inputReader.then(f))

type Process<state,result> = { run:Fun<state, [result, state]>, then:<result2>(nextStep:(_:result) => Process<state,result2>) => Process<state,result2> }
const bindProcess = <state, intermediateOutput, finalOutput>(firstInstance:Process<state,intermediateOutput>, postProcessing:Fun<intermediateOutput, Process<state,finalOutput>>) : Process<state,finalOutput> =>
  processMonoid.join<state,finalOutput>()(
    mapProcess<state, intermediateOutput, Process<state,finalOutput>>(postProcessing)(firstInstance) // : Process<state,Process<state,finalOutput>>
  ) // : Process<state,finalOutput>
const processToRun = <state,result>() : Fun<Process<state,result>, Fun<state, [result, state]>> => fun(process => process.run)
const processFromRun = <state,result>(run:Fun<state, [result, state]>) : Process<state,result> => ({
  run:run,
  then:function(this, nextStep) { return bindProcess(this, fun(nextStep)) }
})
const mapProcess = <state, intermediateOutput, finalOutput>(f:Fun<intermediateOutput, finalOutput>) 
  : Fun<Process<state, intermediateOutput>, Process<state, finalOutput>> => 
    fun(inputProcess => processFromRun(inputProcess.run.then(map2par(f, id<state>()))))
const processMonoid = {
  return:<state,result>() : Fun<result, Process<state,result>> => fun(result => processFromRun(fun(state => [result,state]))),
  join:<state,result>() : Fun<Process<state,Process<state,result>>, Process<state,result>> => 
    fun(process2 => processFromRun(process2.run.then(map2par(processToRun(), id())).then(apply())))
}


type FailableProcess<state,error,result> = Fun<state, Either<error, [result, state]>>
type InterruptibleProcess<state,result> = Fun<state, Either<[InterruptibleProcess<state,result>, state], [result, state]>>
type InterruptibleFailableProcess<state,error,result> = Fun<state, Either<error, Either<[InterruptibleFailableProcess<state,error,result>, state], [result, state]>>>
