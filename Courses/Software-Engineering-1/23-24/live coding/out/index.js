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
console.log(Course.Updaters.teacher(Person.Updaters.fullName(doctorify).then(Person.Updaters.age(decr.then(decr))))(course));
