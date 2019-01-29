var Int = (function () {
    function Int() {
        this.value = 0;
    }
    Int.prototype.incr = function () {
        this.value = this.value + 1;
    };
    return Int;
})();
var EvenCounter = (function () {
    function EvenCounter() {
        this.number = new Int();
    }
    EvenCounter.prototype.tick = function () {
        this.number.incr();
        this.number.incr();
    };
    return EvenCounter;
})();
var RegularCounter = (function () {
    function RegularCounter() {
        this.number = new Int();
    }
    RegularCounter.prototype.tick = function () {
        this.number.incr();
        this.number.incr();
    };
    return RegularCounter;
})();
exports.main = function () {
    var ec = new EvenCounter();
    console.log(ec);
};
