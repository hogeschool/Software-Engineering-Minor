"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = __importStar(require("immutable"));
var practicum3_1 = require("../Lesson3/practicum3");
var StateMonad_1 = require("./StateMonad");
var Number = function (v) {
    return {
        kind: "number",
        value: v
    };
};
var Bool = function (b) {
    return {
        kind: "bool",
        value: b
    };
};
var skip = function () { return StateMonad_1.unit_State().f({}); };
var getVar = function (_var) {
    return StateMonad_1.get_state().then(practicum3_1.Fun(function (m) {
        var x = m.get(_var);
        return StateMonad_1.unit_State().f(x);
    }));
};
var setVar = function (_var, value) {
    return StateMonad_1.get_state().then(practicum3_1.Fun(function (m) {
        var m1 = m.set(_var, value);
        return StateMonad_1.set_state(m1);
    }));
};
var incrVar = function (_var) {
    return getVar(_var).then(practicum3_1.Fun(function (x) {
        if (x.kind == "number") {
            return setVar(_var, Number(x.value + 1));
        }
        else {
            return StateMonad_1.unit_State().f(x);
        }
    }));
};
var decrVar = function (_var) {
    return getVar(_var).then(practicum3_1.Fun(function (x) {
        if (x.kind == "number") {
            return setVar(_var, Number(x.value - 1));
        }
        else {
            return StateMonad_1.unit_State().f(x);
        }
    }));
};
var printMemory = practicum3_1.Fun(function (m) {
    var s = "{ ";
    m.forEach(function (x) { return (x == undefined) ? "" : s += String(x.value) + " "; });
    return s + "}";
});
var ifThenElse = function (condition, _then, _else) {
    return condition.then(practicum3_1.Fun(function (b) {
        if (b) {
            return _then;
        }
        else {
            return _else;
        }
    }));
};
var _while = function (condition, body) {
    return condition.then(practicum3_1.Fun(function (b) {
        if (b) {
            return body.then(practicum3_1.Fun(function (_) { return _while(condition, body); }));
        }
        else {
            return skip();
        }
    }));
};
var varPositive = function (_var) {
    return getVar(_var).then(practicum3_1.Fun(function (v) {
        return StateMonad_1.unit_State().f(v.kind == "number" ? v.value > 0 : false);
    }));
};
var seq = function (current, next) {
    return current.then(practicum3_1.Fun(function (_) { return next; }));
};
var m = Immutable.Map([["x", Number(5)], ["y", Number(3)]]);
var program = setVar("z", Bool(true)).then(practicum3_1.Fun(function (_) {
    return incrVar("x").then(practicum3_1.Fun(function (_) {
        return incrVar("y");
    }));
})).run.f(m);
var testConditional = ifThenElse(varPositive("x"), decrVar("x"), incrVar("x")).run.f(m);
var testLoop = _while(varPositive("x"), seq(decrVar("x"), seq(incrVar("y"), skip()))).run.f(m);
console.log(printMemory.f(testLoop.snd));
