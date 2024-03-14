"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = __importDefault(require("immutable"));
const Fun = (actual) => {
    const f = actual;
    f.then = function (other) {
        return Fun(input => other(this(input)));
    };
    return f;
};
const apply = () => Fun(([f, a]) => f(a));
const Updater = Fun;
const id = () => Fun(x => x);
const Person = {
    Updaters: {
        fullName: (fieldUpdater) => Updater(person => (Object.assign(Object.assign({}, person), { fullName: fieldUpdater(person.fullName) }))),
        age: (fieldUpdater) => Updater(person => (Object.assign(Object.assign({}, person), { age: fieldUpdater(person.age) }))),
    }
};
const Course = {
    Updaters: {
        teacher: (fieldUpdater) => Updater(course => (Object.assign(Object.assign({}, course), { teacher: fieldUpdater(course.teacher) }))),
        students: (fieldUpdater) => Updater(course => (Object.assign(Object.assign({}, course), { students: fieldUpdater(course.students) }))),
    }
};
const isStringEmpty = Updater((s) => s.length == 0);
const doctorify = Updater((s) => `Dr ${s}`);
const incr = Fun((x) => x + 1);
const decr = Fun((x) => x - 1);
const double = Fun((x) => x * 2);
const gtz = Fun((x) => x > 0);
const neg = Fun((x) => !x);
const course = {
    teacher: { id: "gm", fullName: "Giuseppe Maggiore", age: 38 },
    students: immutable_1.default.Map()
};
const Countainer = (data) => (Object.assign(Object.assign({}, data), { map: function (f) { return map_Countainer(f)(this); } }));
const increment = (input) => (Object.assign(Object.assign({}, input), { counter: input.counter + 1 }));
const map_Countainer = (f) => Fun(input => Countainer(Object.assign(Object.assign({}, input), { content: f(input.content) })));
// operations on specific countainers
const tmp = map_Countainer(doctorify.then(isStringEmpty)).then(Fun(increment));
// values of actual countainers in memory...
const c_n = Countainer({ content: 0, counter: 0 });
const c_s = Countainer({ content: "Content", counter: 0 });
const map_Id = (f) => f;
const Option = {
    Default: {
        Empty: () => ({ kind: "empty", then: function (f) { return then_Option(this, f); } }),
        Full: (content) => ({ kind: "full", content: content, then: function (f) { return then_Option(this, f); } }),
    }
};
const map_Option = (f) => Fun(input => input.kind == "empty" ? Option.Default.Empty() : Option.Default.Full(f(input.content)));
const map_Array = (f) => Fun(input => input.map(f));
const Functor = (f) => f;
const Then = (f, g) => ({ Before: f, After: g });
const mappings = {
    Id: map_Id,
    Array: map_Array,
    Countainer: map_Countainer,
    Option: map_Option
};
const map = (F) => typeof (F) == "string" && F in mappings ? mappings[F]
    : "After" in F && "Before" ?
        (f) => map(F["Before"])(map(F["After"])(f))
        : null;
const m1 = map(Functor("Array"));
const m2 = map(Then("Countainer", Functor("Option")))(incr.then(gtz));
const AACO = Then("Array", Then("Array", Then("Countainer", Functor("Option"))));
const AAO = Then("Array", Then("Array", Functor("Option")));
const m3 = map(AACO)(incr.then(gtz));
const associate = () => Fun(([a, [b, c]]) => [[a, b], c]);
const map2_Pair = (l, r) => Fun(p => [l(p[0]), r(p[1])]);
const mkPair = (l, r) => Fun(c => [l(c), r(c)]);
const stringPlus = {
    join: Fun(([s1, s2]) => s1 + s2),
    getZero: Fun((_) => "")
};
const numberPlus = {
    join: Fun(([s1, s2]) => s1 + s2),
    getZero: Fun((_) => 0)
};
// const borkedMonoid : Monoid<number> = {
//   join:Fun(([s1,s2]:Pair<number,number>) => s1+s2),
//   getZero:Fun((_:Unit) => 1)
// }
const identityLaw = (m, samples) => {
    const pointlessPath1 = mkPair(m.getZero, id()).then(m.join);
    const pointlessPath2 = mkPair(id(), m.getZero).then(m.join);
    samples.forEach(s => {
        if (s != pointlessPath1(s))
            console.error("m is not a monoid!!!");
        if (s != pointlessPath2(s))
            console.error("m is not a monoid!!!");
    });
};
const OptionMonad = {
    unit: () => Fun((Option.Default.Full)),
    join: () => Fun(o2 => o2.kind == "empty" ? Option.Default.Empty() : o2.content.kind == "empty" ? Option.Default.Empty() : Option.Default.Full(o2.content.content))
};
const then_Option = (p, f) => map_Option(Fun(f)).then(OptionMonad.join())(p);
const maybeAdd = (x, y) => x.then(x_v => y.then(y_v => Option.Default.Full(x_v + y_v)));
const State = (actual) => {
    const tmp = actual;
    tmp.then_State = function (f) {
        return then_State(this, f);
    };
    return tmp;
};
let map_State = (f) => Fun(p0 => State(p0.then(map2_Pair(f, id()))));
const StateMonad = () => ({
    unit: () => Fun(a => State(Fun(s0 => [a, s0]))),
    join: () => Fun(p_p => State(p_p.then(apply()))),
    getState: () => State(Fun(s0 => [s0, s0])),
    setState: (newState) => State(Fun(_ => [{}, newState])),
    updateState: (stateUpdater) => State(Fun(s0 => [{}, stateUpdater(s0)])),
});
const then_State = (p, f) => map_State(Fun(f)).then(StateMonad().join())(p);
const Memory = {
    a: (_) => Fun(current => (Object.assign(Object.assign({}, current), { a: _(current.a) }))),
    b: (_) => Fun(current => (Object.assign(Object.assign({}, current), { b: _(current.b) }))),
    c: (_) => Fun(current => (Object.assign(Object.assign({}, current), { c: _(current.c) }))),
    d: (_) => Fun(current => (Object.assign(Object.assign({}, current), { d: _(current.d) }))),
};
const Ins = Object.assign(Object.assign({}, StateMonad()), { getVar: (k) => Ins.getState().then_State(current => Ins.unit()(current[k])), setVar: (k, v) => Ins.updateState(current => (Object.assign(Object.assign({}, current), { [k]: v }))) });
// Ins.updateState(currentState => ({...currentState, a:currentState.a+1})).then_State(() => 
//   Ins.updateState(currentState => ({...currentState, b:currentState.b+1}))
// )
const myProgram1 = Ins.getVar("a").then_State(a => Ins.setVar("a", a + 1).then_State(() => Ins.getVar("c").then_State(c => Ins.getVar("d").then_State(d => Ins.setVar("c", c + d)))));
const thenMaybe = (f, g) => f != undefined && g != undefined ? f.then(g)
    : f != undefined ? f : g;
const Coroutine = () => ({
    Default: (actual) => {
        const co = actual;
        co.then = function (f) {
            return Coroutine().then(this, f);
        };
        return co;
    },
    map: (f) => Fun(_ => Coroutine().Default(Fun(_).then(CoroutineStep().map(f)))),
    unit: (result) => Coroutine().Default(_ => CoroutineStep().Default.result(result, undefined)),
    wait: (msLeft) => Coroutine().Default(_ => CoroutineStep().Default.waiting(msLeft, Coroutine().unit({}), undefined)),
    suspend: () => Coroutine().Default(_ => CoroutineStep().Default.suspended(Coroutine().unit({}), undefined)),
    setState: (nextState) => Coroutine().Default(_ => CoroutineStep().Default.result({}, nextState)),
    getContext: () => Coroutine().Default(_ => CoroutineStep().Default.result(_[0], undefined)),
    join: () => Fun(np => Coroutine().Default(Fun(([context, deltaT]) => {
        const tmp1 = np([context, deltaT]);
        if (tmp1.kind == "result") {
            const tmp2 = tmp1.result([context, deltaT]);
            const newState = thenMaybe(tmp1.newState, tmp2.newState);
            return Object.assign(Object.assign({}, tmp2), { newState: newState });
        }
        else if (tmp1.kind == "waiting") {
            const nextJoined = Coroutine().join()(tmp1.next);
            return CoroutineStep().Default.waiting(tmp1.msLeft, nextJoined, tmp1.newState);
        }
        else {
            const nextJoined = Coroutine().join()(tmp1.next);
            return CoroutineStep().Default.suspended(nextJoined, tmp1.newState);
        }
    }))),
    then: (p, f) => 
    // p == Co.wait(30)
    // f == () => Co.setState(Memory.b(incr))
    Coroutine().map(Fun(f)).then(Coroutine().join())(p),
    seq: (ps) => ps.length == 0 ? Coroutine().unit({})
        : ps[0].then(() => Coroutine().seq(ps.slice(1))),
    any: (ps) => Coroutine().Default(([context, deltaT]) => {
        const newPs = [];
        let newState = undefined;
        for (const p of ps) {
            const step = p([context, deltaT]);
            newState = thenMaybe(newState, step.newState);
            if (step.kind == "result") {
                return CoroutineStep().Default.result(step.result, newState);
            }
            else {
                newPs.push(step.next);
            }
        }
        return CoroutineStep().Default.suspended(Coroutine().any(newPs), newState);
    }),
    repeat: () => (p) => Coroutine().seq([
        p,
        Coroutine().suspend(),
        Coroutine().repeat()(p)
    ])
});
const CoroutineStep = () => ({
    Default: {
        result: (result, newState) => ({ kind: "result", result, newState }),
        suspended: (next, newState) => ({ kind: "suspended", newState, next }),
        waiting: (msLeft, next, newState) => ({ kind: "waiting", msLeft, newState, next }),
    },
    map: (f) => Fun(_ => _.kind == "result" ? CoroutineStep().Default.result(f(_.result), _.newState)
        : _.kind == "suspended" ? CoroutineStep().Default.suspended(Coroutine().map(f)(_.next), _.newState)
            : CoroutineStep().Default.waiting(_.msLeft, Coroutine().map(f)(_.next), _.newState))
});
const Co = Coroutine();
let p = Co.seq([
    Co.any([
        Co.seq([
            Co.setState(Memory.a(incr)),
            Co.wait(10)
        ]),
        Co.seq([
            Co.setState(Memory.b(incr)),
            Co.wait(10)
        ])
    ]),
    Co.getContext().then(context => context.a < 5 ?
        Co.wait(30 * context.a)
        : Co.unit({})),
    Co.setState(Memory.b(incr)),
    Co.wait(30),
    Co.setState(Memory.a(incr))
]);
let currentMemory = { a: 0, b: 0, c: "c", d: "d" };
let deltaT = 10;
let running = true;
do {
    console.log("about to run an iteration", currentMemory);
    const step = p([Object.assign(Object.assign({}, currentMemory), { authenticationHeaders: "blah blah super secure" }), deltaT]);
    if (step.newState != undefined)
        currentMemory = step.newState(currentMemory);
    if (step.kind == "waiting") {
        if (step.msLeft <= deltaT) {
            p = step.next;
        }
        else {
            const next = step.next;
            p = Co.wait(step.msLeft - deltaT).then(() => next);
        }
    }
    else if (step.kind == "suspended") {
        p = step.next;
    }
    else {
        running = false;
    }
    console.log("iteration finished with", step, currentMemory);
} while (running);
