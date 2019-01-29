"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var practicum3_1 = require("../Lesson3/practicum3");
exports.map_Pair = function (f, g) {
    return practicum3_1.Fun(function (p) {
        return exports.Pair(f.f(p.fst), g.f(p.snd));
    });
};
exports.Pair = function (x, y) {
    return { fst: x, snd: y };
};
exports.id = function () { return practicum3_1.Fun(function (x) { return x; }); };
exports.State = function () {
    return practicum3_1.Fun(function (s) {
        return {
            run: s,
            then: function (k) {
                return exports.bind_State(this, k);
            }
        };
    });
};
exports.map_State = function (f) {
    return practicum3_1.Fun(function (s) {
        var a = s.run.then(exports.map_Pair(f, exports.id()));
        return exports.State().f(a);
    });
};
exports.unit_State = function () {
    return practicum3_1.Fun(function (x) {
        return exports.State().f(practicum3_1.Fun(function (state) { return exports.Pair(x, state); }));
    });
};
var apply = function () { return practicum3_1.Fun(function (fa) { return fa.fst.f(fa.snd); }); };
exports.join_State = function () {
    return practicum3_1.Fun(function (p) {
        var g = practicum3_1.Fun(function (s) { return s.run; });
        return exports.State().f(p.run.then(exports.map_Pair(g, exports.id())).then(apply()));
    });
};
exports.bind_State = function (m, k) {
    return exports.map_State(k).then(exports.join_State()).f(m);
};
exports.get_state = function () {
    return exports.State().f(practicum3_1.Fun(function (state) { return exports.Pair(state, state); }));
};
exports.set_state = function (state) {
    return exports.State().f(practicum3_1.Fun(function (_) { return exports.Pair({}, state); }));
};
