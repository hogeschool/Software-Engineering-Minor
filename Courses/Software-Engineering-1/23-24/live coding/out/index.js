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
// ...and their processing
console.log(tmp(c_s));
const map_Id = (f) => f;
const Option = {
    Default: {
        Empty: () => ({ kind: "empty" }),
        Full: (content) => ({ kind: "full", content: content }),
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
const m3 = map(AACO)(incr);
