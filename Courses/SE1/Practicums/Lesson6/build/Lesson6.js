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
    return Fun(function (p) {
        return p.then(apply());
    });
};
var bind_State = function (p, f) {
    return map_State(f).then(join_State()).f(p);
};
var get_State = function () {
    return Fun(function (state) { return Pair(state, state); });
};
var set_State = function (state) {
    return Fun(function (_) { return Pair({}, state); });
};
var getVar = function (_var) {
    return bind_State(get_State(), Fun(function (m) {
        var m1 = m.get(_var);
        return unit_State().f(m1);
    }));
};
var setVar = function (_var, value) {
    return bind_State(get_State(), Fun(function (m) {
        var m1 = m.set(_var, value);
        return set_State(m1);
    }));
};
var swap = function (var1, var2) {
    return bind_State(getVar(var1), Fun(function (v1) {
        return bind_State(getVar(var2), Fun(function (v2) {
            return bind_State(setVar(var1, v2), Fun(function (_) {
                return setVar(var2, v1);
            }));
        }));
    }));
};
var skip = function () { return unit_State().f({}); };
var seq = function (current, next) {
    return bind_State(current, Fun(function (_) { return next; }));
};
var ifThenElse = function (condition, _then, _else) {
    return bind_State(condition, Fun(function (b) {
        if (b) {
            return _then;
        }
        else {
            return _else;
        }
    }));
};
var _while = function (condition, body) {
    return bind_State(condition, Fun(function (b) {
        if (b) {
            return bind_State(body, Fun(function (_) { return _while(condition, body); }));
        }
        else {
            return skip();
        }
    }));
};
var isPositive = function (_var) {
    return bind_State(getVar(_var), Fun(function (v) {
        return unit_State().f(v > 0);
    }));
};
var decr = function (_var) {
    return bind_State(getVar(_var), Fun(function (v) { return setVar(_var, v - 1); }));
};
var map_Process = function (f) {
    return Fun(function (p) {
        return p.then(map_Either(id(), map_Pair(f, id())));
    });
};
var unit_Process = function () {
    return Fun(function (x) { return Fun(function (state) { return unit_Either().f(Pair(x, state)); }); });
};
var join_Process = function () {
    return Fun(function (p) {
        return p.then(map_Either(id(), apply())).then(join_Either());
    });
};
var memory = Immutable.Map([["x", 5], ["y", 3]]);
var testConditional = ifThenElse(isPositive("x"), swap("x", "y"), skip());
var loopBody = seq(decr("x"), seq(decr("y"), skip()));
var testLoop = _while(isPositive("x"), loopBody);
console.log(testLoop.f(memory).snd);
