# About the course

Writing correct software is a challenge. 

The first and foremost source of complexity is of course the ability of a programmer to interpret a real-world phenomenon and translate it into code. Some of the difficulty lies indeed in the translation from human language to a programming language: human language is less precise and makes heavier use of an implied context, whereas computer languages are much more precise (*nothing* can be left to deduction) and moreover have only a basic mathematical context to build upon.

In this course, we will focus on patterns that guide us towards the construction of well-defined software. Our ambition is to reach the point where we write code which, thanks to type safety, composition, and referential transparency, **just works**. We hope to show that the usual frantic cycle of writing code, testing, despairing is not all there is to software development, and that programming can actually be a source of reliable reasoning which produces quality results without much trial and error.


## The issue of correctness

To make matters worse, programming is often done with an *imperative mindset* and *without thinking much about types*. The implications of this reach much farther than we are often led to believe. Let us explore these two points in depth.


### Extraneous imperative thoughts
Imperative programming focuses on defining **how things are computed**. For example, suppose we were writing a program which, given a number `n`, must compute a string of `n` asterisks.

For example, given `n=3`, we would expect `***` as result.

A typical imperative implementation would then be:

```
def f(n):
  s = ""
  while n > 0:"
    s = s + "*"
    n = n - 1
```

There is nothing particularly wrong with this implementation, but it does impose some cognitive overhead which we usually learn to ignore. Still, it is there, in the form of lurking hidden complexity. This hidden complexity is, in this case, embodied by the existence of variable `s`: it is nowhere to be found in the original problem description, which only talks about `n` and the resulting string.

In our effort to focus about *how we should compute*, we have introduced a new concept (`s`) which is completely extraneous to what the original problem contained. This means that the code we are writing now has to deal with more than just the problem, because the solution itself contains parts of the problem.


### Data races

A source of dangers commonly practiced in imperative programming is _shared mutable state_. Sharing mutable state is very easy to accomplish, as we will now illustrate with a contrived example. Let us first define a simple data structure to wrap integer numbers. This will be the basis for our shared state:

```
class Int:
  def __init__(self):
    self.value = 0
  def incr(self):
    self.value = self.value + 1
  def decr(self):
    self.value = self.value - 1
```

Consider now a `Counter` class using an instance of `Int` in its constructor, and which enumerates even numbers:

```
class EvenCounter:
  def __init__(self):
    self.i = Int()
  def tick():
    self.i.incr()
    self.i.incr()
```

We might expect that the class defined above will always have an even value

Of course we might have more counters, for example a vanilla counter which only increments in steps of one:

```
class RegularCounter:
  def __init__(self):
    self.i = Int()
  def tick():
    self.i.incr()
```

Let us now imagine a program where two counters are initialized and then subsequently used:

```
ec = EvenCounter()
rc = RegularCounter()

...ec.tick()...
...rc.tick()...
```

We can always expect that the behavior of both counters will respect their implementation, and that reading their implementation is sufficient to build a mental model which *precisely tracks all facts* about how these objects behave.

Unfortunately, we can easily break this. For example, we could share the state between the two counters:

```
ec = EvenCounter()
rc = RegularCounter()

ec.i = rc.i # written by junior developer with good intentions

... # lots of code in between

ec.tick() # ec is now at 2, which is an even number as expected
rc.tick() # ec is now at 3, which is completely unexpected!

...
```

Investigation of the problem might lead us to further look into `EvenCounter`, given that it looks like the class is showing unexpected behavior. To make matters much worse, we could imagine that `ec` and `rc` are used in different threads, and as such the race condition might only present itself in some strange situation based on a combination of external factors.

In our case we have written very little code, but usually the shared state will be a bigger and more complex data structure, and there will be a lot of code, spread over many files, declaring and using this data structure. Each file may look correct and innocent, and only the sum of all parts of the program will lead to the bug manifesting itself. Testing isolated parts of the system will not help, since *the parts are correct*.

This sort of bug, often called a _data race_ or a _race condition_ is very difficult to diagnose, let alone fix. Moreover, the traditional imperative toolbox of locks adds to the complexity of the situation, given that locks might solve some of the issues, but also cause extra problems such as deadlocks. 


### Issues with uninteresting type safety

Another common source of issues in mainstream programming practice is the detailed representation of irrelevant information when it comes to types and type safety.

Types are seen by many developers as a tool for (verbosely) specifying trivial information which is not particularly valuable, but which some primitive compilers need in painful detail in order to allow us to run our programs.

An example of a typical class definition in a statically typed language could be:

```
class Person {
  private string name;
  private string surname;
  private Date birth_date;
  public Person(string name, string surname, Date birth_date) {
    this.name = name;
    this.surname = surname;
    this.birth_date = birth_date;
  }
  ...
}
```

In about ten lines of code we have said very little, but still, in a Java-like language there are no alternatives to this rite of passage before we have a chance to just use a new datatype. Moreover, some languages even require initialization to look as follows:

```
Person p = new Person("James", "Semaj", new Date(1, 1, 2001));
```

Once again we are confronted with verbosity and repetition of information: `Person` appears both left and right of `p`, which is pointless: saying it once should be enough. This is slowly evolving with the introduction of type inference, but we are still a long way from usable type systems.


#### A better way

Types are not uniquely meant to represent concrete information which will mirror reality. The usual definition of classes to model `Person`, `Customer`, `Car`, and other concrete entities we encounter in reality is not really the strength of types.

Types are annotations that define much more than which data and functions we can expect to find in a variable or symbol: types allow us to model all sorts of provable properties of data, and can be used to model even dynamic abstract information such as effects or exceptions.

A typical example of this would be defining a datatype to represent stateful processes. A stateful process takes as input an initial state of arbitrary type `s`, and returns as output both a new state `s` and some value of an arbitrary type `a` which is the result of the process.

We could model this as a type:

```
type Process s a = s -> (a*s)
```

Where `a*s` denotes a pair containing both an `a` and an `s`. Moreover, we could model the fact that processes may fail, therefore a process will not always return `a*s`, but might also return `e`, which is an arbitrary type representing an error:

```
type FailableProcess e s a = s -> (a*s + e)
```

`a*s+e` here denotes a value which might either be `a*s`, or `e`.

Notice that we are using types to model abstract notions of processes, instead of concrete notions of simple data structures.

Moreover, we could then use such type definitions to run and combine processes. For example, running two processes in sequence will produce both their results:

```
after : Process e s a * Process e s b -> Process e s (a*b)
```

And much more. Depending on the programming language, it will be easier or harder to express such abstract concepts in our programs. Unfortunately, if we do not model our domain in terms of such abstract concepts, then it does not matter how far the language can take us: we will not even try.


## Moving beyond
In this course we will focus on a series of fundamental properties of code which are easy to verify, in order to ensure that our libraries are well built, and that they do not suffer from the issues we discussed.

We will begin by modelling every construct we discuss by means of statically typed, "strong" definitions which a good compiler will be able to verify for us. We will then show the essential aspects of computation without sharing state, and ensure that our constructs can be composed in infinitely many new forms in order to achieve higher and higher complexity, without suddenly encountering race conditions or similar issues.

We will discuss a series of abstract constructs, known as _functors_ and _monads_, and their general properties which, if present, ensure that the implementation will be reliable and composable. Moreover, we will show that these constructs can be used in practice, and indeed we will provide multiple examples of commercial, enterprise-grade libraries which are based on these constructs.

#### About the chosen language
The main language used in this text will be TypeScript. TypeScript combines an expressive and elegant type system, decent type-inference, higher order functions, and is a mainstream language used in many companies. Its type system is even Turing-Complete, meaning that it can express some very articulated concepts. Nevertheless, such a choice of language is quite peculiar given the topic, and indeed one might expect to encounter more academically inclined languages such as Haskell, or even Agda or Coq. The reason we will go with TypeScript is to make it immediately, unambiguously clear that the used concepts can and must be applied in practice, and must not be seen in isolation from the practice of software engineering when building actual software. Using a more research-oriented language would most certainly lead us to more elegant constructs and a fuller representation of all they stand for. Unfortunately, lack of applicability in realistic contexts would also give the false impression that there exists a gap between the world of theory and practice, which is actually not the case.

TypeScript is our attempt at harmonizing theory and practice, so that they may both show their rich interaction and mutual benefit.


# Basic toolbox

The computational model we refer to is essentially based on types and functions.

Types are given as primitives, for example `int`, `float`, `string`, etc. We will later see how to extend our types with new custom types.

Given two arbitrary types `a` and `b`, we can define a function `f` that takes as input values of type `a` and which returns values of type `b`. We denote such a function with the suggestive notation:

`f : a -> b`

## A simple wrapper

Given the centrality of functions, let us define a wrapper datatype for functions. We will need it through the whole course.

```
type Fun<a,b> = { (i:a):b }
```

Let us also define a lifting operator which takes as input a regular function and returns our (not yet, soon to be) enriched function definition:

```
let Fun = function<a,b>(f:(_:a)=>b) : Fun<a,b> { return f }
```

At this point we can move on to some basic examples. 

## First examples
When presenting examples, we will mostly manipulate simple arithmetic functions in order to keep the discussion simple, yet showing how the concept are implemented. Occasionally we will move on to a more articulated case study.

Let us begin with a couple of functions to increment and double numbers:

```
let incr = Fun<number,number>(x => x + 1)
let double = Fun<number,number>(x => x * 2)
```

We could also define a function to negate a boolean value:

```
let negate= Fun<boolean,boolean>(x => !x)
```

At this point we could always define a function which "bridges the gap" between integers and booleans, for example by checking whether or not it is even:

```
let is_even = Fun<number,boolean>(x => x % 2 == 0)
```


## Composition
The underpinning principle that we will try to carry around during the whole course is that of _composition_. The basic idea of composition is that, given two entities of the same sort, we can compose them into a new one.

This is not necessarily our direct practical experience in real-life: combining two tomatoes does not always yield a bigger tomato, but combining two bowls of tomato sauce does certainly require a bigger bowl. This vegetable-oriented example suggests that liquids, being flexible and having no structure, can be combined together into more of the same, whereas solid objects cannot. Abstract concepts such as the ones we manipulate in the context of programming, on the other hand, often offer us the possibility to combine. Numbers would be the first example: given two numbers, say `10` and `2`, we can combine them as follows:

```
10 + 2 = 12
10 / 2 = 5
10 * 2 = 20
```

Notice that in all cases, the composition has led us to a new number. We might conclude that numbers are quite a flexible medium, given that it allows us infinitely many ways to compose numbers while still obtaining numbers as results.

Composition also has a distinct advantage. Instead of forcing us to carry multiple (connected) concepts together, we can compose them and carry just one. This makes it easier for us to reason, because instead of having many separate objects and concepts, we now have a single one which combines the interesting essence of all of the original objects.

Throughout the whole course, we will focus on how far composition can take us: we will try to find structures which support composition in computing, and thanks to this composition we will build large architectures from smaller components with very little effort. This goal of building large architectures from smaller components is **the essence of software engineering**. Whence the name of the course.


## Function composition

Given two functions, `f` and `g`, it is sometimes possible to compose them into a new function. The usual way to perform such a composition would be to create a new function which feeds its input to `f`, and the output of `f` to `g`. The output which `g` then produces should become the output of the composition. 

For this to be possible, though, a condition must hold: the two functions must be "compatible". If the output of `f` is, for example, a `string`, but the input of `g` is an `int`, then the composition makes no sense: moreover, passing an argument of type `string` where an `int` is expected will produce no reasonable result, and in most programming languages this will result in a crash.

We encode this by saying that, given  `f : a -> b` and `g : b -> c`, no matter what the types `a`, `b`, and `c` are, we can generate a new function `(f;g) : a -> c`. We read this function as _`f`, then `g`_.

### Implementing function composition:

Let us define a `then` operator which takes as input two functions and build a new one which is the composition of the two:

```
let then = function<a,b,c>(f:Fun<a,b>, g:Fun<b,c>) : Fun<a,c> {
  return Fun<a,c>(a => g.f(f.f(a))))
}
```

The composition of two functions simply creates a new function (notice the call to `Fun<a,c>`, which indeed creates a new function), which will invoke first `f`, and then `g`.

Instead of using this operator right away, let us ensure that the experience of a programmer composing functions is sufficiently smooth. We now extend the `Fun` type definition so that it also offers a `then` method:

```
type Fun<a,b> = { f:(i:a) => b, then:<c>(g:Fun<b,c>) => Fun<a,c> }
```

Of course, creating a new function must also define `then`. Here we use the implicit binding of `this` to our advantage:

```
let Fun = function<a,b>(f:(_:a)=>b) : Fun<a,b> { 
  return { 
    f:f,
    then:function<c>(this:Fun<a,b>, g:Fun<b,c>) : Fun<a,c> { 
      return then(this,g) }
  }
}
```

Note that in TypeScript it is not necessary to specify the type of `this` when declaring a new method, but, unlike in Java or C#, it is always required to define `this` when defining its implementation
We can now compose existing functions, for example by saying:

```
let incr_twice = incr.then(incr)
let double_twice = double.then(double)
let incr_then_double = incr.then(double)
let my_f = incr.then(is_even)
```

and so on.

Of course, we can now invoke any of these composed functions:

```
console.log(incr_twice.f(3))
console.log(double_twice.f(5))
```

etc.

Composition is not limited to a single step. We can further compose the result of a composition, in order to add even more steps. As long as the input and output types match as requested, then we can keep composing. For example, we could write the following compositions in more steps:

```
let f = incr.then(double.then(incr.then(is_double)))
```


### Identity function

A special mention must go to a special function which exhibits a unique behavior: the identity function. The identity function is an apparently useless function which, when given a parameter, simply returns it right away without modification. This function thus does absolutely nothing.

The identity function on, for example, integers, would be defined as:

```
let id_num = Fun<number,number>(x => x)
```

Given that the identity function does not care what the input is (it just returns it right away, so it could be anything and the identity function would still work exactly the same way), we can give a similar definition for strings, arrays, and in general all imaginable data structures. Since all of these definitions are, in effect, the same, we could just define identity once and for all possible types, in the form of a generic function:

```
let id = function<a>() : Fun<a,a>(x => x)
```

This way, to _get_ the identity function, we would need to invoke `id<number>()`. This would give us the identity function back for the given generic argument.

The uniqueness of the identity function is its behavior with respect to composition. Composing the identity function with any other function will produce no change whatsoever, meaning that `f.then(id())` and `id().then(f)` are exactly the same as just `f`.

The identity function is thus the _neutral element_ of composition, that is it behaves similarly to $0$ with respect to addition, and to $1$ with respect to product: $0 + x = x + 0 = x$ and $1 \times x = x \times 1 = x$, no matter what $x$ was.

### Updaters
A special variation of `Fun` operates on a single type parameter.

...let's just define it as a type alias of `Fun`...

...used in, for example, React...

...horizontal composition...

...vertical composition...

```ts
type Class = {
  teacher:Person,
  students:Map<Person["id"], Person>,
}

type Person = {
  id:string,
  name:string,
  age:number
}

const Class = {
  Updaters:{
    teacher:...
    students:...
    student:...
  }
}

const Person = {
  Updaters:{
    name:(_:Updater<Person["name"]>) : Updater<Person> => ...,
    age:(_:Updater<Person["age"]>) : Updater<Person> => ...,
  }
}
```

We can also go for a flourish, and define `Map.Updaters.update` to update a single element and therefore make the `Class.Updaters.student` updater more elegant:

```ts
const Map = {
  Updaters:{
    update:<k,v>(k:k, u:Updater<v>) : Updater<Map<k,v>> => ...
  }
}
```



## Referential transparency

The closing note of this chapter discusses an important requirement for function composition.

Let us take a short step back. Composition in general implies that the properties of the entities being composed are somehow preserved by the composition. For example, if our starting point were two bowls of tomato sauce, it would be very odd if pouring them both in a larger bowl would result in, say, the same amount of substance transmuted into milk.

Similarly, when we say that `2 + 3 = 5`, then we could conclude that somehow `5` preserves the properties necessary to define both `2` and `3`. Indeed, `+` preserves the basic properties associated with counting, so our target does indeed hold.

When composing functions, we must look for similar properties that are somehow preserved. The fundamental properties of functions is quite simple. Consider, for example, the following program:

```
x = f(3)
...
y = f(3)
```

Our intuitive expectation when reading code is _determinism_: code will behave the same as long as the _surrounding circumstances_ remain the same. This predictability would therefore lead us to conclude that ` x ` and `y` must be the same.

Unfortunately, this is not always the same. For example, suppose that `f` were implemented as follows:

```
let counter = 0
let f = function(x:number) => {
  counter = counter + 1
  if (counter > 1000) return -1
  else return x + 2
}
```

This implementation would be quite hard to debug: lots of calls would simply return the input plus two, but all of a sudden, and only after the program has been running long enough, it would start giving a different result.

The function is therefore non-deterministic, in that its output does not depend only on its input. Functions in which the output only depends on the input are called _pure_, and enjoy the property of _referential transparency_.

Referential transparency ensures that a function will always behave the exact same way when called with the same parameters. In other words we could also say that, with referential transparency, it is always possible to replace every occurrence of an _expression_ in the program with its value without altering the result.

In order to better understand this, consider the following simple imperative program

```
def foo(x):
  print(x)
  x = x + 1
  print(x)
```
and imagine that we are calling `foo(5)`. In the first line of the function the value of `x` is 5. After re-assigning `x` its value will be 6. If we now try to replace `x` in the last `print` statement we would insert 6. This means that, in the first `print` the expression `x` is replaced with 5, and the very same expression in the second print is replaced with 6. This means that this program is not referentially transparent. Indeed the value that we use to replace `x` depends on the state of the program. This means that the order of the computation changes the final result of the program. Indeed if we swapped the variable assignment with the last print, we would print 5 twice and then assign 6 to variable `x`.

On the other hand, you know from previous courses that, in functional programming languages, it is always possible to replace an expression with the same value for all its occurrences in the program because its value does not depend on a specific state of the program.


### Is it really relevant?
Let us consider the exact opposite of referential transparency, and build a program which is non-deterministic and unpredictable by default.

Let us suppose we have a `car` object, which can be used for driving on the highway or to be repaired by a mechanic.

We could then write the following program (in pseudo-code):

```
car = new Car(...)

drive = new Thread(
  while True:
     car.accelerate()
)

repair = new Thread(
   car.open_bonnet()
   while car.engine_broken():
     car.repair_engine()
   car.close_bonnet()
)

drive.start()
repair.start()
```

By running such a program, we would encounter a variable number of issues: if we are very lucky, then the `repair` thread will be done before the `drive` thread actually starts. If we are very unlucky, the `drive` thread will accelerate with an open bonnet and a mechanic trying to work on the engine. Such a situation is not only wrong in code, but would also constitute a source of life-threatening danger if attempted in real-life.

Moreover, when the threads of a program are started only when given situations are encountered (for example upon the user's request), then we would encounter yet another layer of complexity and unpredictability: only when many unfortunate circumstances align (a specific sequence of user inputs, timings, etc.) would we witness the bug, and often not on the developer's machine.


### Referentially transparent architectures

A software architecture based on referential transparency will be focused on _transformations_ of a state, which tracks all we know about a program, along a _pipeline_, which tracks all we want to do to the state.

The pipeline is composed by using operators such as `then`, and only when we actually start the pipeline with some initial state that computation will start.

Using `then` we will accumulate all desired operations, plugins, etc. (potentially also dynamically based on user input). The constructs composed are all referentially transparent, so we expect no strange interactions: each construct simply performs its own processing of (parts of) the state, and returns an output for the next stages of the pipeline. No invisible lines connect different parts of the pipeline, such as the sharing of the `car` in the threads we have seen above. All interactions are given by the position of elements in the pipeline, and by which parts of the state they get to see.

Referential transparency ensures that our code will behave in a consistent and predictable way, no matter the circumstances, and that the behavior of each component will behave the same, given the same input, notwithstanding other external circumstances. Testing and debugging becomes easier, and the quality of our software will start resembling the quality of other, longer established engineering disciplines such as mechanical or architectural engineering.


# Structures and structure-preserving transformations
In this chapter we discuss the structure inherent to container data structures. We then discuss how such data structures all support a special sort of transformation, which is meant to transform the content of the data structure without destroying its structure. This sort of transformation, which we call a _structure preserving transformation_, allows us to build programs which formally match our notion of _reliability_ and _correctness_. 

Moreover, we will notice how this notion of structural preservation is entirely based on the concepts we had seen previously of function composition.

## Structures

Structures, or (data) structures are a fundamental pillar of modern computing. They allow us to think in terms of _what exists in our program at any given time_, and (in a statically typed programming language, which is our focus at the moment) also guarantee that **nothing else** exists outside the given data types. So, types are all and only the allowed shapes of data in our programs.

Containers can be simple. For example, we could define a container such as a `Point`, which contains two coordinates:

```ts
type Point = { x:number, y:number }
```

Such a container is simple. It certainly performs a useful function, but does not offer anything besides its strictly defined, predetermined structure. It cannot be adapted, nor changed to support, for example, two strings, or two dates, or even more. Our original goal was to improve the quality of our programs, by building flexible and composable building blocks which are defined (and debugged!) once and then used in many different contexts, without having to reinvent the wheel for each new context.


### Generic structures

Data structures are called _generic_ when they can change the way they behave (intuitively, the data they contain or process) depending on some parameters. This is called generic programming, or parametric polymorphism. 

For example, we might want to define a container which might store data of arbitrary type, together with a counter of sorts. Since we want to store data of any type, then we need to define a parametrically polymorphic data structure which can be instantiated to contain values of different types as follows. We will call this datatype `Countainer` as it is a _counting container_:

```ts
type Countainer<a> = { content:a, counter:number }
```

The definition of `Countainer` is not of a single, concrete datatype. Rather, `Countainer` defines, in one go, infinitely many data structures, one for each possible type `a`. We could define, and use, concrete instances of `Countainer` by passing it different concrete types as input:

```ts
let c_i:Countainer<number>({ content:10, counter:0 })
let c_s:Countainer<string>({ content:"Howdy!", counter:0 })
let c_ss:Countainer<Array<string>>({ content:["Howdy", "!"], counter:0 })
```

and so on.

It is worthy of notice that the choice of many modern languages of `<` and `>` as delimiters for generic parameters and arguments is not random. `Countainer`, like all other generic datatypes, is a compile-time function: it takes as input a type, and returns as output the counting container for that type!

## Transforming containers

Suppose we had a function that turns numbers into booleans, say `is_even:Fun<number,boolean>`. We can of course invoke this function by passing it a `number`, and this will inevitably produce a `boolean` as result. 

Consider now the scenario of having indeed the `is_even` function, but instead of a number,a `Countainer<number>`. A `Countainer<number>` is not very different from just a `number`: it only carries a bit of extra information (the `counter`). 

This suggests that we might want to perform the `is_even` transformation on the `content` of the `Countainer`. A well behaved transformation on the `content` could take as input the whole `Countainer<number>`, transform its `content` into a `boolean`, and then repackage the whole thing into a `Container<boolean>`. This extra repackaging step is crucial: this way we _preserve_ the extra information (the `counter`) which we have no reason to want to throw away! A simple implementation for this pattern would be:

```ts
let transform_countainer_content_num_to_bool = 
  function(f:Fun<number,boolean>, c:Countainer<number>) 
  : Countainer<boolean> { 
  return { content:f.f(c.content), counter:c.counter }
}
```

This sort of transformation is often called `map` in modern programming languages. Notice though that such a function could very well be defined for any type of container content, not only `number` and `boolean`. We might indeed reformulate the above function in a more generic way, so that it can accept inputs, and produce outputs, of arbitrary types. We achieve this result with a generic function, which is specified not on concrete types such as `number` or `string`, or `Array<string>`, but on generic types (in our case `a` and `b`) to be specified later:

```ts
let map_countainer = 
  function<a,b>(f:Fun<a,b>, c:Countainer<a>) 
  : Countainer<b> { 
  return { content:f.f(c.content), counter:c.counter }
}
```

The function above could be invoked as follows:

```ts
let c:Countainer<number> = { content:3, counter:0 }
let l:Countainer<boolean> = map_countainer(is_even, c)
```

`l` would then become `{ content:false, counter:0 }`. Of course, since containers can be mapped by passing them arbitrary instances of `Fun`, nothing stops us from invoking `map_countainer` with a `Fun` produced by composing other `Fun`'s:

```ts
let c:Countainer<number> = { content:3, counter:0 }
let l:Countainer<boolean> = map_countainer(incr.then(is_even), c)
```

This results in `l.content` becoming `4`, as `map` will first increment, and then check whether or not the value is even.

A function such as `map_countainer` is known as a _structure preserving transformation_. We will later see what this means more precisely. For the moment, our intuition is that such a transformation will:
- apply the given `Fun` to all available values of type `a`, so that they become of type `b` (the `content`);
- repackage the `b`'s into a new structure, by just copying over the remaining information (the `counter`).


## Harmonizing the interface
Let us take a moment to observe the interface of `map_countainer`:

`map_countainer : <a,b>(f:Fun<a,b>, c:Countainer<a>) : Countainer<b>`

The function has a big issue: it does somehow interrupt our ability to make chains through function composition. This means that the powerful elegance and simplicity of the `then` operator is now lost!

In order to improve the situation, we might reformulate the function into having a new signature:

`map_countainer :<a,b>(f:Fun<a,b>) :Fun<Countainer<a>, Countainer<b>>`

According to this new formulation, `map_countainer` simply takes as input a function on arbitrary datatypes, and _elevates_ it in level of abstraction by making it able to work on `Countainer`'s. We could implement it as follows:

```ts
let map_countainer = 
  function<a,b>(f:Fun<a,b>) : Fun<Countainer<a>, Countainer<b>> { 
  return Fun(c =>{ content:f.f(c.content), counter:c.counter })
}
```

This apparently minor change has a profound impact on our ability to chain computations: namely, we can now produce new functions by combining existing ones, in two ways:
- we can compose functions in a pipeline via `then`;
- we can elevate functions to the domain of `Countainer` via `map_countainer`.

For example, we could simply define:

```ts
let incr_countainer:Fun<Countainer<number>,Countainer<number>> = 
  map_countainer(incr)
let is_countainer_even:Fun<Countainer<number>,Countainer<boolean>> = 
  map_countainer(is_even)
```

and so on. 


## Composition of maps
Container transformation functions are now `Fun`'s. This means that, just like all other functions, they can be composed together, as long as the output of one function has the same type as the input of the next. This means that we could compose together the functions we just defined into a new pipeline of `Countainer` transformations:

```ts
let my_f = incr_countainer.then(is_countainer_even)
```

`my_f` would take as input a `Countainer<number>`, increment its content, check whether or not it is even, and store the resulting boolean into the final `Countainer<boolean>`. Notice that the transformation _preserves the extra structure_, meaning that `map_countainer` guarantees that the `counter` will not be unduly modified. We could of course define a function to increment the counter of a container though:

```ts
let tick : Fun<Countainer<number>,Countainer<number>> = 
  Fun(c => ({...c, counter:c.counter+1}))
```

(Note: `{...c, counter:c.counter+1}` copies `c` over and overwrites the `counter` of the result; this is called a _spread operator_).

We can now make use of our `tick` function as part of our pipelines, as follows:

```ts
let my_g = incr_countainer.then(is_countainer_even).then(tick)
```


## A generalization

Let us generalize the constructs we have just put to use. We started with `Countainer`, which is a generic type. Then we defined a generic function that lifted an existing function to the domain of `Countainer`'s, transforming the generic content, and preserving the rest. 

The same process of defining such a transformation could be applied to more than just our `Countainer`. Suppose we had an arbitrary generic datatype:

```
type F<a> = ...
```

We use "..." to denote that we really do not care about its content or shape.

We could then define a transformation function which takes as input an arbitrary function, and lifts it to work with `F`'s:

```
map_F : <a,b>(f:Fun<a,b>) : Fun<F<a>, F<b>>
```

Of course we cannot just implement `F` here, since we do not know how `F` really is defined, but we can at least postulate what its interface is supposed to be. 

(Note: unfortunately, we cannot really (easily) define such an interface in modern languages such as TypeScript: `F` itself would be a generic parameter of this interface, but it is not a type (rather a generic type itself!). Most modern languages do not support generic types as parameters of another generic type.)


### Extra constraints
When we have both a generic type `F`, and its corresponding structure preserving transformation `map_F`, then we want to put a few extra constraints in order to guarantee that `F` is well behaved. Mostly, these constraints ensure that `map_F` does not do anything surprising (surprises go, by definition, against our intuition, and as such cause unexpected behavior and, inevitably, bugs).

#### Identity
The first, unsurprising behavior is that `map_F` preserves the identity function. Specifically,if we invoke `map_F` with `id` as input, given that `id` will not change the content, then we expect the final `F` to be the same as the original. This can be stated as:

`map_F<a,a>(id<a>()) = id<F<a>>()`

Suppose that, in the case of the `Countainer`, `map_countainer` increased the `counter` (which would change the surrounding structure, and thus not be a valid structure preserving transformation). Then the above equality would not hold, because `id<Countainer<a>>()` would return exactly the same value, `counter` included, whereas `map_Countainer<a,a>(id<a>())` would increase the underlying `counter`.

#### Distribution
The second constraint is more articulated, and just as interesting. When composing functions, we expect that the resulting function behaves as the sum of the composed functions, and nothing more. What about composing the result of structure preserving transformations though?

Consider two composable functions `f:Fun<a,b>` and `g:Fun<b,c>`. We can of course lift them to `F` via `map_F`:

```
let f_F:Fun<F<a>,F<b>> = map_F<a,b>(f)
let g_F:Fun<F<b>,F<c>> = map_F<b,c>(g)
```

We implicitly obtain two paths between `F<a>` and `F<c>`, one passing directly through values of type `F` via `F_f` then `g_F`, the other passing through `f` then `g`, but lifting the resulting composition:

```
let path1:Fun<F<a>,F<c>> = f_F.then(g_F)
let path2:Fun<F<a>,F<c>> = map_F<a,c>(f.then(g))
```

`path1` will run `f` on the content of the first input of type `F<a>` per definition of `map_F` (how we obtained `f_F`), and then it will run `g` on the transformed content. `path2` will do the same, but instead of packaging and repackaging twice, it will unpack the input of type `F` once, apply `f` then `g` right away, and repackaging once and for all.

## Functors
A type constructor `F` and its transformation `map_F` are called a **functor** if the following holds for all `f:Fun<a,b>` and `g:Fun<b,c>`:

```
map_F : (f:Fun<a,b>) : Fun<F<a>,F<b>>
map_F<a>(id<a>()) = id<F<a>>()
map_F<a,b>(f).then(map_F<b,c>(g)) = map_F<a,c>(f.then(g))
```

A functor is a well behaved data structure that always behaves in a reliable, intuitive way. It will be the foundation of the course.


## An example
Let us now check a couple of examples of actual functors, in order to see how they translate into practice.

### `Option`
The `Option` functor offers a type-safe alternative to managing values which might, for whatever reason, be absent. Think of a computation that might either produce a number, or fail: its return type should represent the fact that there might be no number at all!

Option is defined as a discriminated union, that is a union of two different types which must be explicitly checked by means of a shared constant:

```
type Option<a> = { kind:"none" } | { kind:"some", value:a }
```

When given a value of type `Option<a>`, the only value accessible will be the `kind`, which has type `"none" | "some"`. We cannot read the `value` right away, so the following code would give a compile-time error:

```
function DOES_NOT_WORK(x:Option<number>) : number {
  return x.value
}
```

On the other hand, the following function would work because it first checks for availability of `value`:

```
function print(x:Option<number>) : string {
  if (x.kind == "some")
    return `the value is ${x.value}`
  else 
    return "there is no value"
}
```

Inside the _then_ branch, the type of `x` is adjusted, because we know that it is not just an `Option<number>`, but the more specific `{ kind:"some", value:number }`.

The map function of `Option` will have to check for availability of the `value`, and if a `value` is present, then we transform it, otherwise we simply repackage a `none`:

```
let none : function<a>() : Option<a> { return { kind:"none" } }
let some : function<a>(x:a) : Option<a> { 
  return { kind:"some", value:x } }

let map_Option = function<a,b>(f:Fun<a,b>) : Fun<Option<a>,Option<b>> {
  return Fun(x => x.kind == "none" ? none<b>() : some<b>(f.f(x.value)))
}
```

Thanks to `Option` and its `map_Option`, we can safely manipulate values which might be absent by simply chaining operations on the content, and then mapping the result:

```
let pipeline:Fun<Option<number>,Option<boolean>> =
  map_Option(
    incr.then(
    double.then(
    is_greater_than_zero)))
```

Notice that we do not need to check whether or not the original value was present, as this is all done implicitly by `map_Option`. Moreover, the property that:

`map_Option(f).then(map_Option(g)) = map_Option(f.then(g))`

is also very useful for optimization: performing `map_Option` just once will evaluate one conditional less, meaning that the right hand side with a single `map_Option` produces the same result as the left hand side, but requires a bit less computation and as such is expected to be slightly faster.


# Composition of structures
An important property of abstractions is that they must be composable. The ability to compose allows us to define basic building blocks, test them, ensure they work, and then "glue" them together along some predefined composition mechanisms which are guaranteed to preserve the essential properties of the individual elements in a logical way.

Following this philosophy, we defined the concept of `then` to compose functions, in a way that results in a new function that, at its core, is entirely based on the original two. Composition also usually features a sort of starting point, which when composed with other constructs, does nothing but yield them back. The identity function, which returns the input intact, was the starting point of function composition: `f.then(id()) = id().then(f)  = f`.


## Composition of functors
Just like functions, functors can also be composed. Let us consider two functors, `F` and `G`, together with their transformations `map_F : Fun<a,b> => Fun<F<a>, F<b>>` and `map_G : Fun<a,b> => Fun<G<a>, G<b>>`.

We would like to compose both `F` and `G` together, so that we get a new functor `F . G` which encapsulates the properties of both `F` and `G`.

Fortunately, this is surprisingly easy to do. The resulting functor will have type:

`type F_G<a> = F<G<a>>`

Its transformation will simply transform all elements of the external `F` by using `map_F`, and the internal elements of `G` with `map_G`:

```
let map_F_G = function<a,b>(f:Fun<a,b>) => Fun<F_G<a>, F_G<b>> {
  return map_F<G<a>,G<b>>(map_G<a,b>(f))
}
```

It is possible to prove, but we will not do it here for the sake of brevity, that functor composition preserves all properties of a functor, such as identity and distribution of composition. Suffice here to state that the composed functor will be a fully valid functor as well.

The "basic" functor which preserves composition will, unsurprisingly, be the identity functor which adds no structure whatsoever:

```
type Id<a> = a
let map_Id = function<a,b>(f:Fun<a,b>) : Fun<Id<a>,Id<b>> {
  return f
}
```


## A concrete example
Let us consider both functors `Countainer` and `Option`. We might use them to define a possibly empty `Countainer` as follows:

```
type CountainerMaybe<a> = Countainer<Option<a>>
let map_Countainer_Maybe = function<a,b>(f:Fun<a,b>) : 
  Fun<CountainerMaybe<a>, CountainerMaybe<b>> {
  return map_Countainer<Option<a>,Option<b>>(map_Option<a,b>(f)));
}
```
Our `CountainerMaybe` will have a counter associated with a container which might be empty. Transforming the composed functor will first transform the `content` of the external `Countainer`, turning it from `Option<a>` into `Option<b>`. This transformation is achieved by transforming `Option` via its own map.

## Type-safe functors
We can implement functors in a fully type safe way thanks to Typescript' advanced types. Brace yourselves, because the following snippet of code is epic:

```ts
type Unit = null
type Functors<a> = {
  Id:Id<a>
  Array:Array<a>
  List:List<a>
  Option:Option<a>
  Countainer:Countainer<a>
}

type Functor<F extends keyof Functors<Unit>> = F
const Functor = <F extends keyof Functors<Unit>>(f:F) => f

type Then<F extends keyof Functors<Unit>,G> = { Before:F, After:G }
const Then = <F extends keyof Functors<Unit>,G>(f:F, g:G) : Then<F,G> => ({ Before:f, After:g })

const LLCO = Then("List", Then("List", Then("Countainer", Functor("Option"))))
const LLO = Then("List", Then("List", Functor("Option")))
const COL = Then("Countainer", Then("Option", Functor("List")))

type Apply<F, a> =
  F extends keyof Functors<Unit> ? Functors<a>[F]
  : F extends Then<infer G, infer H> ? Apply<G, Apply<H, a>>
  : "Cannot apply because F is neither primitive nor composed"

type Mapping<F> = <a,b>(f:Fun<a,b>) => Fun<Apply<F,a>, Apply<F,b>>
type Mappings = {
  [F in keyof Functors<Unit>]: Mapping<F>
}
const mappings : Mappings = {
  Id: mapId,
  Array: mapMany,
  Option: mapOption,
  Countainer: mapCountainer,
  List: mapList
}

const map = <F>(F:F) : Mapping<F> => 
  typeof(F) == "string" && F in mappings ? (mappings as any)[F]
  : "After" in (F as any) && "Before" in (F as any) ? 
    <a,b>(f:Fun<a,b>) => map((F as any)["Before"])(map((F as any)["After"])(f))
  : null!

const m1 = map(LLCO)
const m2 = map(LLO)
const m3 = map(COL)
console.log(map(Then("Array", Then("Array", Functor("Option"))))<number, number>(Fun(_ => _ * 2))([[empty(), full(1)], [empty(), full(2)], [empty()]]))
```

# Monoids
## Introduction

Some datatypes have even more structure than just functors. This structure appears in different forms. Some forms are very primitive, for example in the sense of some builtin operators that mirror our mathematical understanding of a given structure. Some forms are more abstract, and, when combined with functors, give rise to some very powerful design patterns that play a crucial role in the definition of higher order meta programming abstractions.

## Numbers

Consider a simple example, `number`. We know that `number` supports some operations with important properties and also has some special elements which behave in a very specific way.

The first such operation would be `+`, together with its special element `0`, which is called the _identity_ of `+`.

We know that, for all numbers `a`, `b`, and `c`, the following holds: 

`a + (b + c) = (a + b) + c` 

(this is known as _association law_). Moreover, the _identity law_ states that, for all numbers `x`, the following holds:

`x + 0 = 0 + x = x`

Similarly, we could observe that, for the product:

`a * (b * c) = (a * b) * c`

and 

`x * 1 = 1 * x = x`.


## More similar types

`number` is not the only datatype supporting such a structure. Consider for example another datatype, `string`. Just like numbers, strings can be added together into new strings, and the empty string `""` acts as the identity. Given arbitrary strings `a`, `b`, and `c`, then the following always holds:

```
a + (b + c) = (a + b) + c
a + "" = "" + a = a
```

Arrays of arbitrary types also support this structure, but instead of `+` we use the `concat` operation, and the identity is the empty array `[]`. Consider arbitrary arrays `a`, `b`, and `c` (all of type `Array<a>`, thus with the same content), then the following always holds:

```
a.concat(b.concat(c)) = (a.concat(b)).concat(c)
a.concat([]) = [].concat(a) = a
```

In short, we can find this structure in many datatypes, always following the same set of underlying rules, even if the underlying datatypes are very different from each other.


### Towards a generalization
We can generalize these rules as follows:
- we have a datatype `T`;
- we have a composition operation `<+> : (T,T) => T` that takes as input two values of type `T` and returns a new `T`;
- we have an identity element `e:T`;
- the following holds for all `a:T`, `b:T`, `c:T`:
  - `a <+> (b <+> c) = (a <+> b) <+> c`
  - `a <+> e = e <+> a = a`

Such a structure is called a **monoid**, and plays a fundamental role in the rest of our narrative.

Keep in mind that, in this case, the operator <+> does not have specific semantics, like + for numbers, but stands for any possible associative operator. The same holds for the identity, which is not to be intended with a specific meaning, like 0 for numbers.


## Monoid definition, revisited
We stated before that monoids are characterized by a structure `T`, a binary operation `<+>`, and an identity element `e` (with associativity and identity laws in place).

This definition is a bit at odds with our previous work: we have built a framework of functions and ways to combine them together into new functions with `then`, but our definition of monoid does not really mix well with functions and composition.

The identity element `e`, in particular, is problematic. In order to be able to take advantage of our composition framework, everything needs to be a function. `e` is just a value, and is therefore not composable and thus 
"isolated" from the rest of our discoveries.

We can redefine the identity as a special function though, which takes no input and always returns `e`:

```
let zero : () => T = () => e
```

Unfortunately, our composition framework requires functions to always accept an input, but `zero` does not. We can thus further reformulate `zero` to take a "fake" input which does not carry any real information, which we will call the `Unit` type:

```
type Unit = {}

let zero: (_:Unit) : T => e
```

Now `zero` is fully composable. The binary operation though, is not, as function composition requires functions in a single argument and never two. We can thus wrap the arguments in an appropriate container, the pair:

```
type Pair<a,b> = { fst:a, snd:b }

let plus: (p:Pair<T,T>) : T => ...
```

Now `plus` is also composable. We redefine thus a monoid, in a way that is compatible with our composition framework, as follows:
- a type `T`;
- a function `plus : Pair<T,T> => T`;
- a function `zero : Unit => T`;
- the identity law: `plus(zero({}), x) = plus(x, zero({})) = x`;
- the associative law: `plus({ fst:a, snd:plus({fst:b, snd:c})}) = plus({ fst:plus({ fst:a, snd:b }), snd:c })`.

## Generalizing from types to functors
Our discussion on monoids started from very concrete data types which programmers manipulate on a daily basis (strings, numbers, lists). Whenever confronted with a repeating pattern, we try to capture and understand its general properties. 

_This way, next time we encounter an instance of it, we will quickly be able to understand what we can expect from it without reinventing the wheel._ 

The more general our definition of the pattern, the more we will be able to apply it. Monoids are indeed a structure which comes back in a very large number of contexts. For this reason, we take one last extra abstraction step. Instead of defining monoids in terms of a concrete type `T`, we will define them in terms of a functor `F`.

The monoid functions and laws must therefore be reformulated so that they work with functor `F` instead of type `T`. Let us begin with `zero : Unit => T`: instead of `T`, we expect to find an `F`, but `F` is a functor, and as such it cannot be used for a standalone declaration. This means that it must take as input a type parameter, which we add to the definition, obtaining a first working draft:

`unit : <a>(?) => F<a>`

The input of the monoidal identity on functors is also a bit challenging. Recall that the input of the `zero` function had been chosen as `Unit`, because we did not want to inject any extra structure. When we do the same for functors, we obtain the functor which carries no information, the identity functor:

```
type Id<a> = a
let map_Id = function<a,b>(f:Fun<a,b>) : Fun<Id<a>, Id<b>> { return f }
```

We can use this functor as the equivalent of `Unit`, therefore obtaining the following definition:

`unit : <a>(Id<a>) => F<a>`

Since `Id<a>` is just `a`, we can reformulate the definition one last time into the final version:

`unit : <a>(a) => F<a>`

The beauty of this definition is that, even though the path to get to it was quite tortuous, it now clearly shows that `unit` gives us a way to embed a value into a functor, and is therefore the familiar concept of  a **constructor**.

The same considerations and refactoring can be performed on the `plus : Pair<T,T> => T` operation. First of all, we will need to replace `T` with `F<a>` for some `a`. Let us do so for the return type:

`join: <a>(Pair<T,T>) => F<a>`

`Pair<T,T>` is a composition of two types (`T` and `T`) into a single type. In order to translate it faithfully, we would like to take two functors (`F` and `F`) and compose them into a single functor. Functors can easily be composed, leading us to:

`join : <a>(F<F<a>>) => F<a>`.

A monoid is therefore a functor `F`, equipped with two extra operations in addition to `map_F`:
- `unit : a =>  F<a>`, which takes as input a value of an arbitrary type `a` and embeds it into its simplest possible representation within `F`;
- `join : F<F<a>> => F<a>`, which takes as input `F` nested twice, and flattens it into a single `F`.

The associativity and identity laws can also be translated in this functional framework in terms of function compositions. 

The _associativity law_ becomes the following equivalence:
- ` join<F<a>> == map_F<F<F<a>>, F<a>>(join<a>)`, where both sides are functions with type `Fun<F<F<F<a>>>, F<a>>`.

Although it might seem odd, the type is indeed made of three nested functors. In order to avoid confusion, let us rename the generic argument of the definition of `join` to `a1`. The definition thus becomes `join : <a1>(F<F<a1>>) => F<a1>`. When we use join, it is possible to instantiate its generic argument with any type, including another type which requires generic arguments. This is the case of `F<a>` used when calling `join`. In the definition of `join` we replace `a1` with `Fun<a>` thus obtaining `join : <F<a>>(F<F<F<a>>>)`. In the definition of the identity law, the scope of `a` in the `join` definition and in `Fun<a>` is different.

The _identity law_ becomes the following equivalence:
- `unit<F<a>>.then(join<a>) == map_F<a, F<a>>(unit<a>).then(join<a>) == id<F<a>>`, where both sides are functions with type `Fun<F<a>, F<a>>`.


# Introduction

Whenever we are working with a functor which, at the same time, exhibits the monoidal structure of having `unit` and `join`, and the associative and identity laws, then this functor is also called a _monad_, and plays a very important role in building advanced design patterns. We will see more technical details about this, but first let us take a brief philosophical detour.

The importance of monads cannot be understated. Monads arise everywhere: concurrency via `async/await` in C# and JavaScript, LINQ in C#, streams in Java, `Promise` in JavaScript are only some of the examples of mainstream application of monads. Monads also arise in most advanced languages: Scala, F#, Haskell all feature monads prominently.

The power of monads arises from their combination of structure and flexibility. Monads are not applicable to a single domain, but rather are a meta pattern that tells us how to build libraries which "make sense", in many different domains. This way, instead of having to reinvent the wheel at each turn, we will be able to recognize the underlying monad, implement its operators, and be done. This allows us to leverage lots of structure and knowledge, at minimal cost, in domains that include (but are not limited to):
- exception handling;
- list comprehensions;
- state management;
- concurrency;
- backtracking ("classic AI").

Moreover, monads can be composed into new monads, "just" like functions can be composed into new functions by means of `then`. This means that a standard toolkit of monads is not the final stop, and is actually just the beginning: most problems will be solvable with some composition of different basic monads.


# Monads: (endo)functors with monoidal structure

Consider a functor `F` (actually an _endo_-functor, given that it goes from types to types, and therefore does not change domain). The functor implements the following "module":

```
type F<a> = ...
let map_F : <a,b>(f:Fun<a,b>) => Fun<F<a>, F<b>>
```

The functor `map_F` guarantees the important properties of preserving the internal structure, and preserving the identities. This means that `map_F` will only transform the `a`'s into `b`'s, and do nothing more to the rest of the information available.

A functor can also have a monoidal structure. This means that it would also feature the following functionality:

```
let unit : <a>() => Fun<a,F<a>>
let join : <a>() => Fun<F<F<a>>, F<a>>
```

Seen from this perspective, a monad would simply seem to be **a generic datatype `F` which can be transformed (`map_F`), constructed (`unit`) and flattened (`join`)**.


## Operators
The power of monads arises from the fact that, even within the vague boundaries that we have just set up, it possible to define quite a lot of useful methods on monads, without ever having to think about the concrete monad. Let us begin with the two most used such operators, `bind` and `kleisli`.

The `bind` operator allows us to link two instances of a monad, where the second instance depends on the _content_ of the first. `bind` results in a new instance of the monad, which is then often used as input of the following `bind` operation:

```
let bind = <a,b>(p:F<a>, q:Fun<a,F<b>>) : F<b> => map_F<a,F<b>>(q).then(join<b>()).f(p)
```

The first `map_F(q)` goes from `F<a>` to `F<F<b>>`. `join` will then flatten the `F<F<b>>` into a single `F<b>`. Of course the chain of functions needs to be called with `p`.

We can use `bind` in order to write code that will look as follows:

```
bind(p, x =>
bind(q, y =>
bind(r, z =>
...unit(...)...) 
```

Where `p`, `q`, and `r` are all instances of the monad `F`, but `q` might be computed from `x`, `r` might be computed from `x` and `y`.

`bind` is usually not defined and used so explicitly. A typical trick would be to augment `F` so that it contains another method, `then`, which performs a `bind`. This version of `bind` simply uses a lambda instead of `Fun` as second argument for better readability.

```
then: <a, b>(f: (_: a) => F<b>): F<b>
```
`then` can simply call `bind` by wrapping its lambda argument into a `Fun` and then passing it to `bind`. Note that `then` takes only one argument (while `bind` takes two where the first argument is `F<a>`), because it is a method and `this`, which has type `F<a>`, is implicitly passed.

Thanks to such a method, the code above would turn into:

```
p.then(x => 
q.then(y =>
r.then(z =>
...unit(...)...)
```

> The attentive reader might have noticed that this pattern is very common, in this very same format, in the JavaScript world: `Promise`, the fundamental data structure used to perform remote calls, has a `then` method which is used exactly as we just described. The only minor difference is that instead of `unit`, we would then use `Promise.resolve`, which has the very same meaning but another name.



## A first example: the `Fun` monad
Let us explore some examples of basic monads. These monads are not particularly exciting or mind-blowingly useful by themselves, but they are self contained and complex enough to let us acquaint with the reality of the practical application of monads.

We begin with a monad which we actually already know: `Fun`. Let us consider functions from a fixed type, for example `number`:

```
type Fun_n<a> = Fun<number,a>
```

This interface is trivially a functor:

```
let map_Fun_n = <a,b>(f:Fun<a,b>, p:Fun_n<a>) : Fun_n<b> => p.then(f)
```

The `unit` and `join` operators are also quite simple, as they just involve calling and creating functions:

```
let unit_Fun_n = <a>() => Fun<a, Fun_n<a>>(x => Fun(i => x))
let join_Fun_n = <a>() => Fun<Fun_n<Fun_n<a>>>,Fun_n<a>>(f => Fun(i => f.f(i).f(i)))
```

The `Fun_n` monad is therefore a monad which encapsulates the composition, but also the creation and simplification, of functions. It is, in a sense, a strict extension of the original definition of function, because that definition did not provide facilities to create new functions (`unit_Fun_n` creates a constant function, that is a function that always returns a given constant), nor to flatten functions (`then` only made it possible to compose functions at the same level, but not simplify nested functions).



## A data container: `Pair` as two monads

Recall the `Pair` datatype which contains values of two arbitrary types:

```
type Pair<a,b> = { x:a, y:b }
let fst = <a,b>():Fun<Pair<a,b>,a> => Fun(p => p.x)
let snd = <a,b>():Fun<Pair<a,b>,b> => Fun(p => p.y)
let map_Pair = <a,b,a1,b1>(f:Fun<a,a1>, g:Fun<b,b1>) : Fun<Pair<a,b>,Pair<a1,b1>> => 
  Fun(p => ({ x:f.f(p.x), y:g.f(p.y) }))
```

From `Pair` it is possible to effortlessly generate two monads, one per generic parameter. Let us fix the second parameter, say to `number` (any other type would do) and thus define the `WithNum` generic container:

```
type WithNum<a> = Pair<a,number>
```

It might occur to the reader that this is not really different from the `Countainer` we worked with when introducing functors, and indeed we are now working with a generalization of that sort of datatype.

The structure preserving transformation will therefore map the whole pair, while preserving the right side of the pair with the identity function:

```
let map_WithNum = <a,b>(f:Fun<a,b>) : Fun<WithNum<a>,WithNum<b>> =>
  map_Pair(f, id<number>())
```

The monadic operators arise quite easily, by taking advantage of the underlying monoidal structure of `number`:

```
let unit_WithNum : <a>() : Fun<a,WithNum<a>> => Fun(x => { x:x, y:0 })
let join_WithNum : <a>() : Fun<WithNum<WithNum<a>, WithNum<a>> =>
  Fun(x => { x:x.x.x, y:x.y + x.x.y })
```

We could have given an alternate definition that uses another monoid on numbers, for example with `1` and `*` in place of `0` and `+`, obtaining yet another monad.


### The right version
Notice that the monad just presented is based on the left-hand side of the pair. It is possible to swap `x` and `y`, therefore obtaining another (almost identical) monad which varies the second argument (the `b`) instead of the first (the `a`). We leave this as a trivial exercise to the reader.



# The identity monad

Just like functions and monoids have an identity, which is a sort of safe starting point of many chains of computations, monads have an identity as well. This identity is interesting as a case study, as it illustrates 

The identity monad is based on the identity functor, which does (on purpose) absolutely nothing:

```
type Id<a> = a
let map_Id = <a,b>(f:Fun<a,b>) : Fun<Id<a>,Id<b>> => f
```

The monadic combinators are also quite straightforward:

```
let unit_Id = <a>() : Fun<a,Id<a>> = id<a>()
let join_Id = <a>() : Fun<Id<Id<a>>, Id<a>> = id<a>()
```




# Another perspective on `bind`
The `bind` operator allows us to merge together (the "content") of a monad to a function which turns that content into another monad. The result of this merging operation is a monad itself.

`bind` has one minor issue though: it is completely disconnected from our original principles of _composing through functions_, which we have seen has shown its usefulness ubiquitously. We can reformulate `bind` in a way which, while being substantially equivalent, emphasizes that this sort of operator is nothing but a way of composing specially defined functions:

```
let then_F = <a,b>(f:Fun<a,F<b>>, g:Fun<b,F<c>>) : Fun<a,F<c>> =>
  f.then(map_F<b,F<c>>(g)).then(join_F<c>())
```

This new formulation of function composition when the return value is encapsulated in an instance of a monad, is  also known as _Kleisli composition_. Its importance arises from the fact that this new composition operator clearly shows how binding different instances of a monad together is no more than a fancy composition. Both `bind` and `then_F` will be used throughout the rest of the text, depending on which of the two operators best matches the given problem.


## Monoid laws, revisited

Given Kleisli composition, we can reformulate the monoid laws in a much more elegant way. The elegance arises from the fact that these laws are now precisely mirroring the monoidal laws, but using Kleisli composition in place of the monoidal composition operation.

The identity laws (recall: `x <+> e = e <+> x = x`) replaces `<+>` with `then_F` and the identity element `e` with `unit()`:

```
then_F<a,b,b>(f, unit<b>()) : Fun<a,F<b>> == 
then_F<a,a,b>(unit<a>(), f) : Fun<a,F<b>> == 
f
```
Intuitively, `f` will take us from `a` to `F<b>`. `unit` will pack either the `b` or the `a` in an `F<b>` or `F<a>`, but `then_F` will take care of the flattening for us, therefore annulling the packing performed by `unit`.

The association laws (recall: `f <+> (g <+> h) = (f <+> g) <+> h`) replaces `<+>` with `then_F` as well, leading us to:

```
then_F(f, then_F(g,h)) == then_F(then_F(f,g), h)
```

Intuitively, both sides of the equation will pass the result of `f` `g`, which then produces a result which is fed into `h`. In the first case (to the left) we pass the result of `f` to `then_F(g,h)`, which does nothing but propagating the chain. In the second case we pass the result of _directly_ to `g`, but we delegate to the outer `then_F` the role of passing it on to `h`.

We omit a more formal verification of these properties, given the scope of this text.


# Introduction
In this chapter we will discuss the first practical application of monads in order to solve, or simplify, a concrete problem. We will begin with a traditional example which is simple enough to be simple to oversee, but complex enough to show a powerful feature that improves the quality of our software by showcasing all that monads are powerful at.


## Error management

Consider a computation which might succeed, or fail. We want to model failure in a way that is type safe, so that the compiler will be able to help us check all error conditions, and ensure that we are making no dangerous assumptions such as "This method will always succeed, no need to check for errors!", or "I am in a hurry, I will add the check later!".

Invariably, these faulty assumptions will turn against us: methods that always succeeded will suddenly start failing at Friday, 17.55, and checks that were meant to be added later slowly turn to history, then legend, and finally become myth.

Let us therefore define a new datatype which forces us to perform the proper checks and steers us clear of faulty assumptions. This datatype will model the possible results of a method which might return some value of some arbitrary type `a`, or might return no value at all:

```
type Option<a> = { kind:"none" } | { kind:"some", value:a }
```

In order to simplify working with a polymorphic datatype such as `Option`, it is considered common courtesy and practice to also define some handy ways to construct it, one function per concrete shape:

```
let none = <a>() : Fun<Unit,Option<a>> => Fun(_ => ({ kind:"none" }))
let some = <a>() : Fun<a,Option<a>> => Fun(a => ({ kind:"some", value:a }))
```

Notice that we are defining functions that are compatible with our previous framework, given that we do not want to step out of it and rather extend it. This means that invoking, for example, `some<number>()`, gives us back the `Fun<number,Option<number>>` which will then actually know how to create an `Option<number>` from a `number`.

Let us now consider the `map_Option` method. This method must transform an `Option<a>` into an `Option<b>`, by checking whether or not it is a `none`, and if this is not the case, transforming the value and re-wrapping the content in a new `some`.

```
let map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>,Option<b>> =>
  Fun(x => x.kind == "none" ? none<b>() : f.then(some<b>()))
```

Notice that, thanks to our `Fun`, we can simply concatenate `f` and `some` together, into a reasonably linear and elegant implementation.

The monadic operators are then `unit_Option`, and `join_Option`. Let us begin with the simplest of the two:

```
let unit_Option = <a>() : Fun<a,Option<a>> = some<a>()
```

The `join` operator is a bit more challenging, as it requires checking for `none` in order to simplify the `none<Option<Option<a>>` into `none<Option<a>>`:

```
let join_Option = <a>() : Fun<Option<Option<a>>, Option<a>> =>
  Fun(x => x.kind == "none" ? none<a>() : x.value)  
```

Of course we could define `bind_Option` trivially from `map_Option` and `join_Option`, and augment `Option<a>` with a method `then`. Armed with these (trivial) additions, we would end up with the following implementation:

```
let bind_Option = function<a, b>(opt: Option<a>, k: Fun<a, Option<b>>) : Option<b> {
  return map_Option(k).then(join_Option()).f(opt)
}

type Option<a> = ({
  kind: "none"
} | {
  kind: "some",
  value: a
}) & {
  then: <b>(f: (_: a) => Option<b>) => Option<b>
}
```

This implementation would then allow us to define methods which gracefully fail such as, for example, safe division:

```
let safe_div = (a:number, b:number) : Option<number> =>
  b == 0 ? none<number>() : some<number>(a // b)
```

Suppose now that we wanted to perform safe division on the result of a safe division, therefore implementing patterns such as `(x / y) / z`. Then `safe_div` would be reformulated as:

```
let safe_div = (a:Option<number>, b:Option<number>) : Option<number> =>
  a.then(a_val =>
  b.then(b_val =>
  b_val == 0 ? none<number>()
  : unit_Option(a_val / b_val)))
```

Thanks to this new formulation, we would be able to define complex nested patterns such as:

```
let div3 = (x:Option<number>, y:Option<number>, z:Option<number>) :
  Option<number> =>
  safe_div(safe_div(x,y),z)
```


### Example application

As a concrete example of application, we might consider that `Option` has found its way in most mainstream languages.

.Net has had `Nullable` for quite a while, `Option` is available in Rust, ML, `Maybe` is part of Haskell, Java has seen `Optional` added to the latest versions of the standard library.

The typical applications of `Option` are found when something might fail or to represent invalid state. For example, consider a webpage which must draw a list of customers. When the page is instantiated, there are no customers to show, as they must yet be loaded. We might be tempted to store an empty array of customers, but this would be mistaken, as we would then be unable to distinguish between a list being loaded, and an actually empty list of customers. The proper representation would then become `Option<List<Customer>>`. Rendering such a component would then be forced to check the `Option` as follows:

```
function render(customers:Option<List<Customer>>) {
  if (customer.kind == "none") {
     render_loading_screen()
     // customer.value is not available 
    //     accessing it causes a compiler error
  } else {
     // customer.value is simply available 
     // render the list of customers found there
     render_customers(customer.value)
  }
}
```


## From `Option` to `Either`

Suppose now that we wanted to extend our `Option` to also carry extra information together with `none`. This extra information could be considered an extra payload, for example useful if we want to store, for example, error data or some additional optional attachment of sorts.

This would lead us to the following datatype definition, which is a strict generalization of `Option`:

```
type Either<a,b> = { kind:"left", value:a } | { kind:"right", value:b }
```

The two utility functions to initialize the concrete shapes of `Either` will both look like `some`, but with both type arguments. Traditionally they are called `inl` and `inr`, meaning "left embedding" and "right embedding":

```
let inl = <a,b>() : Fun<a, Either<a,b>> => Fun(a => ({ kind:"left", value:a }))
let inr = <a,b>() : Fun<b, Either<a,b>> => Fun(b => ({ kind:"right", value:b }))
```

The structure preserving transformation is then:

```
let map_Either = <a,b,c,d>(f:Fun<a,c>,g:Fun<b,d>) 
  : Fun<Either<a,b>,Either<c,d>> =>
  Fun(x => 
      x.kind == "left" ? f.then(inl<a,b>()).f(x.value) 
      : g.then(inr<a,b>()).f(x.value))
```

We can now show how to implement `Option` only in terms of `Either`. `Option` then becomes just a shell implementation, only calling existing methods from `Either`. This clearly shows that `Option` is no more than an _instance_ of `Either`: 

```
type Option<a> = Either<Unit,a>
let none = <a>() : Option<a> => inl<Unit,a>().f({})
let some = <a>() : Fun<a,Option<a>> => inr<Unit,a>()

let map_Option = <a,b>(f:Fun<a,b>) : Fun<Option<a>,Option<b>> => 
  map_Either<a,Unit,b,Unit>(f, id<Unit>())
```

In order to complete the generalization of the previous definition of `Option`, let us define the monadic operators for `Either`. `unit_Either` is trivially just the right injection (thus we assume that the binding happens on the right hand of `Either`):

```
let unit_Either = <a,b>() : Fun<a,Either<b,a>> => inr<b,a>()
```

Joining is also quite similar, but it only requires the realization that the monad is thus all focused on the right side of the `Either`, and that the left side contains information that is simply propagated, without further processing:

```
let join_Either = <a,b>() : Fun<Either<b,Either<b,a>>, Either<b,a>> =>
  Fun(x => x.kind == "left" ? inl<b,a>().f(x.value)
                : x.value)
```


### Sketch of practical applications
Just like `Option` denoted absence of value (for example while loading something from a server), `Either` denotes absence of value and presence of other information, such as for example exception information. Thus, we could define a simple exception system as:

```
type Exceptional<a> = Either<string, a>
```

A function returning `Exceptional<Customer>` would therefore contain a `Customer`, if the computation has succeeded, and a `string` (containing an error description) if the computation has failed.


# Introduction
Datatypes have been, so far, almost exclusively used to model state. State is, inherently, static, and models *what things are*, not *what they do*.

This leaves a weakness in our ability to model *dynamic processes*. Such processes are also, in a sense, *things*, so they should be modeled with datatypes. At the same time, they *perform actions*, so they should also include dynamic parts in their definition.

In this chapter we will focus our discussion on the modelling of simple processes, and how monads arise naturally as a complement to such models. We will then, in later chapters, explore richer models of more complex processes.


# Stateful processes
Let us consider a process that works on state. Such a process will be able, at all times, to both **read** from and *write** to the state. A process also represents a computation, and it will therefore produce a result, of an arbitrary type.

Since the process performs a computation that will give us a result of an arbitrary type, let us start from this definition and enrich it in steps until we reach a satisfactory formulation. Our starting point therefore only encapsulates the performing of a computation:

```
type Producer<a> = Fun<Unit,a>
```

Of course, this computation needs the ability to access the state. This means that the state, of some arbitrary type, must be passed to this computation:

```
type Reader<s,a> = Fun<s,a>
```

Of course, we want the process to also be able to redefine the value of the state (remember: we want to be referentially transparent, so we will not mutate `s` in place!), and we can achieve this by letting our process return a new value of the updated state. This is usually called `State` monad, and we will conform to this definition:

```
type State<s,a> = Fun<s,Pair<a,s>>
```

In order to complete the monadic definition, we need (as usual) the `map_State` function, the `unit_State`, and `join_State`. Let us begin with the functoriality of our `State`, which takes advantage of the fact that the stateful process is no more than a function, and as such it can be concatenated with the inner transform `f`:

```
let map_State = <s,a,b>(f:Fun<a,b>) : Fun<State<s,a>, State<s,b>> =>
  Fun(s => s.then(map_Pair(f,id<s>()))
```

Of course creating a state via `unit_State` will require us to simply create a function which always returns the same value `a`. Such a function is the closest thing to a whole process built for modeling a constant:

```
let unit_State = <s,a>() : Fun<a,State<s,a>> =>
  Fun(x => Fun(s => ({ x:x, y:s }))
```

Joining a nested process is also similarly simple, 

```
let apply = <a,b>() : Fun<Pair<Fun<a,b>,a>, b> => Fun(fa => fa.fst.f(fa.snd)) 

let join_State = function<s, a>(): Fun<State<s, State<s, a>>, State<s, a>> {
  return Fun<State<s, State<s, a>>, State<s, a>>((p: State<s, State<s, a>>): State<s, a> => {
    return p.then(apply())
  })
}
```

As a very last addition to the library, consider two basic functions to read and write to the state as a whole:

```
let get_state = <s>() : State<s,s> => Fun(s => ({ x:s, y:s }))
let set_state = <s>(s:s) : State<s,Unit> => Fun(_ => ({ x:{}, y:s }))
```

Thanks to these functions, stateful processes will actually be able to access the state when needed!



# A practical application
Let us now get acquainted with the state monad in a simple case: a text-based renderer.

A renderer takes a rendering buffer as input, and produces a new rendering buffer (remember: referential transparency! The actual drawing is done as late as possible) with the extra drawing operations somehow applied to it. Eventually we put the rendering buffer on the actual screen.

This description mirrors the signature of the state monad quite closely, with the only minor difference that we do not use the result parameter but only the state. Moreover, let us assume that rendering in our case means ASCII-rendering, that is drawing figures with special characters on strings. This will keep things visual, but simple.

```
type RenderingBuffer = string
type Renderer = State<RenderingBuffer,Unit>
```

Let us begin with a very simple primitive renderer, which renders nothing:

```
let render_nothing : Renderer = Fun(b => ({ x:{}, y:b }))
```

Let us then add a very simple primitive renderer, which just adds a string to the buffer:

```
let render_string = (s:string) : Renderer => Fun(b => ({ x:{}, y:b + s}))
```

We can then use this function to render some fixed primitives:

```
let render_asterisk = render_string("*")
let render_space    = render_string(" ")
let render_newline  = render_string("\n")
```

Consider now the rendering of a sequence of asterisks of length `n`:

```
let render_line = (n:number) : Renderer => 
  n == 0 ? render_asterisk.then(render_line(n-1))
  : render_nothing
``` 

We could actually generalize this pattern of repetition of a computation on the state, on the state monad itself, as follows:

```
let repeat = <s,a>(n:number, f:(_:a) => State<s,a>) : (_:a) => State<s,Unit> =>
  a =>
    n == 0 ? unit_State(a)
    : f(a).then(a => repeat(n-1, f)(a))
```

This would make it possible to elegantly restructure our repeated renderer as follows:

```
let render_line = (n:number) : Renderer => 
  repeat<RenderingBuffer,Unit>(n, _ => render_asterisk)({})
``` 

Similarly, we could define a renderer of, for example, a square, by repetition of the line renderer:

```
let render_square = (n:number) : Renderer => 
  repeat<RenderingBuffer,Unit>(n, _ => 
    render_line(n).then(_ => render_newline)({})
``` 

The actual rendering would then be performed by running a renderer (thus calling its function with some initial buffer) and then printing the state from the resulting tuple:

```
console.log(render_square(10).f("").x)
```


## Case study: modeling a tiny DSL
Let us now use the state monad to model a tiny programming language. While a language at this scale is not really useful for much, the structure presented is the core of many complex libraries, making it didactically quite useful.

An instruction produces either a result, or a change in memory, and is always able to read from memory to perform its action. This is modeled with a generic instruction as follows:

```
type Memory = Immutable.Map<string, number>
type Instruction<a> = State<Memory, a>
```

Basic instructions (unsafe, but we will fix this in the coming chapters) would manipulate variables as follows:

```
let get_var = (v:string) : Instruction<number> => 
  get_state().then(m =>
  unit_State(m.get(v))

let set_var = (v:string, n:number) : Instruction<Unit> => 
  get_state().then(m =>
  set_state(m.set(v,n))
```

Let us now define a new instruction that, at the same time, increments and returns a variable:

```
let incr_var (v:string) : Instruction<number> =>
  get_var(v).then(v_val =>
  set_var(v, v_val + 1).then(_ =>
  unit_State(v_val)))
```

We can now combine these instructions together in order to build a minimal program, embedded in our application:

```
let swap_a_b: Instruction<Unit> = 
  get_var("a").then(a_val =>
  get_var("b").then(b_val =>
  set_var("b", a_val).then(_ =>
  set_var("a", b_val))))
```

Of course the example above is a bit contrived, but it should be clear that whenever we need to build an interpreter of sorts, then this would be the way to go. Interpreters come in handy more often than not: a search/filter API, for example, would need to run some custom instruction, a plugin system would do the same, and so on.


# Error management
Consider the state monad that we discussed in the previous chapter. This monad is based on the assumption that a process will always succeed, and therefore produce both a new state `s`, and a result `a`.

Of course, this sort of luxury is not always part of the case at hand. Processes in real life fail, and therefore return no result. Fortunately, we have already modeled absence of result and presence of exceptions, via `Either`.

Therefore, we could consider combining the `Either` and `State` monads into a single monad, which we will call `Process`:

```
type Process <s,e,a> = Fun<s, Either<e, Pair<a,s>>>
```

This monad could be seen as a state, where the result might be replaced by some arbitrary error `e`. The operators will therefore borrow either the general idea, or outright make us of, the implementations of the operators, of both `State` and `Either`. Let us begin with `unit_Process`, which invokes `unit_Either` to encapsulate the result as needed:

```
let unit_Process = <s, e, a>(): Fun<a, Process<s, e, a>> =>
  Fun((x: a) => Fun((state: s) => unit_Either<Pair<a, s>, e>().f(Pair<a, s>(x, state))))

```

Joining processes requires launching a process, then propagating the possible errors (the left hand side of `map_Either`) and then joining the resulting nested `Either` after the nested inner process has been evaluated as well.

```
let join_Process = <s, e, a>(): Fun<Process<s, e, Process<s, e, a>>, Process<s, e, a>> =>
  Fun<Process<s, e, Process<s, e, a>>, Process<s, e, a>>
     ((p: Process<s, e, Process<s, e, a>>) =>
     p.then(map_Either(id<e>(), apply())).then(join_Either()))
```

The final combinator is transforming processes, which simply transforms the resulting `Either`:

```
let map_Process = <s, e, a, b>(f: Fun<a, b>): Fun<Process<s, e, a>, Process<s, e, b>> =>
  Fun<Process<s, e, a>, Process<s, e, b>>((p: Process<s, e, a>) => 
        p.then(map_Either(id<e>(), map_Pair(f, id<s>()))))
```


## An applied example
Let us now consider an example application of our `Process` monad. Let us define errors as simply strings, and the state as, once again, a memory map:

```
type Memory = Immutable.Map<string, number>
type Error = string
type Instruction<a> = Process<Memory, Error, a>
```

The core instructions therefore become reading and writing to memory, but this time, when the variable name is not available, we can gracefully handle the error:

```
let get_var = (v:string) : Instruction<number> =>
  get_state().then(m =>
  m.has(v) ? unit_Process(m.get(v))
  : inl(`Error: variable ${v} does not exist`))

let set_var = (v:string, n:number) : Instruction<Unit> =>
  get_state().then(m =>
  set_state(m.set(v, n)))
```

We can also define error recovery mechanisms. For example, we could try running an instruction, and if it fails, running another instruction. This is the same mechanism as exception handling:

```
let try_catch = <a>(p:Instruction<a>, q:Instruction<a>) : Instruction<a> =>
  Fun(m => p.then(map_Either(q.f(m), id())).f(m))
```

We can now build a simple program which gracefully handles missing variables:

```
let swap_a_b = () : Instruction<Unit> =>
  try_catch(get_var("a"), set_var("a", 0).then(get_var("a")).then(a_val =>
  try_catch(get_var("b"), set_var("b", 0).then(get_var("b")).then(b_val =>
  set_var("a", b_val).then(
  set_var("b", a_val))))
```


# Introduction
The processes that we have modeled so far are complete, but offer little in the way of interaction with the rest of the application. For example, suppose that we were modeling a process which takes a really long time to compute, for example a machine-learning process which selects the most likely products a user would buy given his past shopping behavior. The only possible action we can perform given a process is to run it, and thus freeze every other operation until the process is done and produces either a result, or an error.

In this chapter, we will define the last extension to our process modeling framework, so that processes become *interruptible*. Interruptible processes do not necessarily run until completion: they may choose to pause themselves, therefore better integrating with interactive applications. During an interruption of such a process, the application will be able to update animations, handle user input, and so on.


# Coroutines

Interruptible processes are an old and powerful concept, known by many names.
 *soft thread*, *coroutine*, *green thread*, and many others. We will use *coroutine* in the rest of the chapter, but it is a bit of an arbitrary choice.

The core idea of coroutines is that running the process will result in either of three possible outcomes: a result, an error, or an interruption. We already know how to handle results and errors, but interruptions are a new concept. An interruption gives us an insight in the state of the coroutine so far, but also tells us how we could resume execution in order to move further towards the completion of the process. This "rest of the process" is quite easily represented as a process itself. This leads us to the following definition:

```
type Coroutine<s,e,a> = Fun<s, Either<NoRes<s,e,a>,Pair<a,s>>>
type NoRes<s,e,a> = Either<e,Continuation<s,e,a>>
type Continuation<s,e,a> = Pair<s,Coroutine<s,e,a>>
```

Notice that `Coroutine` has the same structure as the `Process` from the previous chapter: it is an instance of either a result (`Pair<a,s>`, containing both the final result and state), or something that is not a result (`NoRes<s,e,a>`). `NoRes<s,e,a>` is then either an error, or the rest of the process (`Continuation`), which in turn is the current state of the process so far, and the coroutine that would perform the rest of the process.

Let us now define the monadic operators. Let us begin with `unit_Co`, which simply encapsulates the proper result, which is the right hand side of the resulting `Either`:

```
let unit_Co = <s,e,a>(x:a) : Coroutine<s,e,a> => 
  Fun(s => inr().f({ x:x, y:s }))
```

Joining a nested coroutine is a tad trickier. This complexity stems from the fact that running a nested coroutine might produce a continuation, which itself is a nested coroutine and must, therefore, be joined. We take some more explicit steps in the implementation in order to illustrate this aspect:

```
let join_Co = <s,e,a> : Fun<Coroutine<s,e,Coroutine<s,e,a>>, 
  Coroutine<s,e,a>> => Fun(p => Fun(s => {
    let res : Either<NoRes<s,e,Coroutine<s,e,a>>,
                     Pair<Coroutine<s,e,a>,s>> = p.f(s)
    if (res.kind == "left") {
      if (res.value.kind == "left") {
        return inl().then(inl()).f(res.value.value)
      } else {
        let rest : Pair<s,Coroutine<s,e,Coroutine<s,e,a>>> = res.value.value
        return inl().then(inr()).then(map_Pair(id<s>(), join_Co()).f(rest))
      }
    } else {
        let final_res : Pair<s,Coroutine<s,e,a>> = res.value
        return final_res.y.f(final_res .x)
    }
  }))
```

The structure preserving transformation that arises from the fact that a coroutine is a functor looks a lot like `join_Co`, in the sense that the continuation must be recursively transformed as well:

```
let map_Co = <s,e,a,b>(f:Fun<a,b>) : Fun<Coroutine<s,e,a>, 
  Coroutine<s,e,b>> => Fun(p => Fun(s => {
    let res : Either<NoRes<s,e,a>,
                     Pair<a,s>> = p.f(s)
    if (res.kind == "left") {
      if (res.value.kind == "left") {
        return inl().then(inl()).f(res.value.value)
      } else {
        let rest : Pair<s,Coroutine<s,e,a>> = res.value.value
        return inl().then(inr()).then(map_Pair(id<s>(), map_Co(f)).f(rest))
      }
    } else {
        let final_res : Pair<s,a> = res.value
        return map_Pair(id<s>(), f).f(final_res)
    }
  }))
```


# Suspensions
Coroutines are built in order to provide a mechanism for the representation of process which might be interrupted. For example, an interactive process or a process that produces intermediate results which would need to be shown to the user to give an insight of how far a long running computation has come, would be ideally modeled as a process with interruptions.

Our coroutine easily supports interruptions. Interruptions are modeled as a  way to construct a coroutine which suspends once, and then (after it is resumed) simply returns a result (of no consequence):

```
let suspend = <s,e>() : Coroutine<s,e,Unit> =>
  Fun(s => inl().inr().f({ x:unit_Co({}), y:s })
```

Thanks to this utility function, our coroutines will be able to perform computations, suspend them, and even fail if needed.


## Animations
Armed with our powerful library, it is now possible to build some pretty advanced applications with minimal code complexity. This minimal code complexity is of paramount importance. When the architecture of code does not allow sufficient expressive power, then advanced applications can grow in complexity exponentially over a very short amount of time. This makes some features almost impossible to build in terms of costs, and ultimately results in the unpleasantness associated with working with some legacy applications and their jumble of unreadable code.

Our goal is to build animations, which we will be running on the command line. Of course, it should be noted that such animations are not bound the command line in any way. The same code could be use to animate a more complex application based on, for example, an HTML `Canvas`, an *Angular* or *Reactjs* application, or even non-web applications.

Let us begin by defining our rendering operations as coroutines where the state is a rendering string buffer (`R`), and errors are strings (`E`). The short names are chosen because they will be repeated *a lot*:

```
type R = string
type E = string
type Op<a> = Coroutine<R, E, a>
```

Drawing a string is a process which terminates right away, but with a modified state with the string to draw concatenated:

```
let draw_string = (s:string) : Op<Unit> =>
  Fun(r => inr().f({ x:{}, y:r + s }))
```

Some utilities that will come in handy draw some specific characters that we will draw in various contexts:

```
let draw_nothing = draw_string("")
let draw_asterisk = draw_string("*")
let draw_space = draw_string(" ")
let draw_newline = draw_string("\n")
```

We can now draw an alternating line, that is a line where the symbols alternate between asterisks and spaces:

```
let draw_alt_line = (c:number,n:number) : Op<Unit> => 
  c >= n ? draw_nothing : 
  (c % 2 == 0 ? draw_asterisk : draw_space).then(_ => 
   draw_alt_line(c+1,n))
```

By using the alternating line renderer, we can draw a checkerboard square:

```
let draw_alt_square = (r:number, n:number) : Op<Unit> => 
  r >= n ? draw_nothing :
  draw_alt_line(r % 2,n + r % 2).then(_ => 
  draw_newline.then(_ => 
  draw_alt_square(r+1, n)))
```

It is now time to draw the actual animation. The animation will draw the square once, then suspend, then draw it with an offset of 1, so that the animation is visible by alternating pixels between space and asterisk, suspend again, and finally repeat itself:

```
let draw_animation = () : Op<Unit> =>
  draw_alt_square(0,5).then(_ =>
  suspend<R,E>().then(_ =>
  draw_alt_square(1,6).then(_ =>
  suspend<R,E>().then(_ =>
  draw_animation()))))
```

At this point we can perform the actual rendering. The actual rendering is a reusable function (at least in our rendering context) which takes as input a rendering process, invokes it, draws the result, and repeats the whole process (with a delay of some tens of milliseconds), if the process was not done:

```
let run_animation = (a:Op<Unit>) => {
  let res = a.run.f("")
  console.clear()
  if (res.kind == "left" && res.value.kind == "left") 
    return console.log("error", res.value.value)
  if (res.kind == "left" && res.value.kind == "right") 
    return console.log(res.value.value.snd)
  console.log(res.value.value.snd)
  let rest = res.value.value.fst
  setTimeout(() => run_animation(rest), 250)
}

run_animation(draw_animation())
```

Note how the code has become linear, and is quite readable. Moreover, the code contains very little unnecessary technical details. Most of the words are actually carrying a lot of meaning, related to the problem and its solution, and is not just machinery for the sake of machinery. By striving towards elegance and expressive power, we can let our creative power roam free and soar to heights previously undreamed of. And this is the power, and beauty, of programming.
