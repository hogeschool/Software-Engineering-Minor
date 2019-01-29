"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = __importStar(require("immutable"));
var Fun = function (f) {
    return {
        f: f,
        then: function (g) {
            var _this = this;
            return Fun(function (x) { return g.f(_this.f(x)); });
        }
    };
};
var inl = function () {
    return Fun(function (x) {
        return {
            kind: "left",
            value: x
        };
    });
};
var inr = function () {
    return Fun(function (x) {
        return {
            kind: "right",
            value: x
        };
    });
};
var map_Either = function (f, g) {
    return Fun(function (e) {
        if (e.kind == "left") {
            var newValue = f.f(e.value);
            return inl().f(newValue);
        }
        else {
            var newValue = g.f(e.value);
            return inr().f(newValue);
        }
    }); // e.kind == "Left" ? f.then(inl()) : g.then(inr()) 
};
var unit_Either = function () { return inr(); };
var join_Either = function () {
    return Fun(function (x) { return x.kind == "left" ? inl().f(x.value)
        : x.value; });
};
var id = function () { return Fun(function (x) { return x; }); };
var map_Option = function (f) {
    return map_Either(id(), f);
};
var unit_Option = function () { return inr(); };
var join_Option = function () {
    return Fun(function (opt) {
        if (opt.kind == "left") {
            return inl().f({});
        }
        else {
            return opt.value;
        }
    });
};
var Pair = function (x, y) {
    return {
        fst: x,
        snd: y
    };
};
var map_Pair = function (f, g) {
    return Fun(function (p) { return Pair(f.f(p.fst), g.f(p.snd)); });
};
var map_State = function (f) {
    return Fun(function (p) { return p.then(map_Pair(f, id())); });
};
var unit_State = function () {
    return Fun(function (x) {
        return Fun(function (state) { return Pair(x, state); });
    });
};
var apply = function () {
    return Fun(function (p) { return p.fst.f(p.snd); });
};
var join_State = function () {
    return Fun(function (p) { return p.then(apply()); });
};
var bind_State = function (p, f) {
    return map_State(f).then(join_State()).f(p);
};
var get_State = function () { return Fun(function (state) { return Pair(state, state); }); };
var set_State = function (state) {
    return Fun(function (_) { return Pair({}, state); });
};
var getVar = function (_var) {
    return bind_State(get_State(), Fun(function (m) {
        var val = m.get(_var);
        return unit_State().f(val);
    }));
};
var setVar = function (_var, val) {
    return bind_State(get_State(), Fun(function (m) {
        var m1 = m.set(_var, val);
        return set_State(m1);
    }));
};
var map_Process = function (f) {
    return Fun(function (p) {
        return p.then(map_Either(id(), map_Pair(f, id())));
    });
};
var unit_Process = function () {
    return Fun(function (x) { return Fun(function (p) { return unit_Either().f(Pair(x, p)); }); });
};
var join_Process = function () {
    return Fun(function (p) {
        var x = p.then(map_Either(id(), apply())).then;
        return p.then(map_Either(id(), apply())).then(join_Either());
    });
};
var testMemory = Immutable.Map([["x", 5], ["y", 10]]);
// let result = getVar("x").f(testMemory)
var result = setVar("y", -10).f(testMemory);
console.log(result);
