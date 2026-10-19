(function () {
  var out = document.getElementById("out");
  var exprEl = document.getElementById("expr");
  var SYM = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  var cur = "0";     // number being typed (or the last result)
  var prev = null;   // number stored before an operator
  var op = null;     // pending operator
  var fresh = false; // next digit starts a new number
  var expr = "";

  function str(n) {
    if (!isFinite(n)) return "Error";
    return String(parseFloat(n.toPrecision(12)));
  }

  function show() {
    out.textContent = cur;
    exprEl.textContent = expr;
    var len = cur.length;
    out.style.fontSize = len > 14 ? "1.6rem" : len > 11 ? "2.1rem" : len > 8 ? "2.7rem" : "3.4rem";
  }

  function compute(a, b, o) {
    if (o === "+") return a + b;
    if (o === "-") return a - b;
    if (o === "*") return a * b;
    if (o === "/") return b === 0 ? NaN : a / b;
    return b;
  }

  function clear() { cur = "0"; prev = null; op = null; fresh = false; expr = ""; }

  function digit(d) {
    if (cur === "Error") clear();
    if (fresh) { cur = d; fresh = false; }
    else if (cur.replace(/[-.]/g, "").length < 14) cur = cur === "0" ? d : cur + d;
  }

  function dot() {
    if (cur === "Error") clear();
    if (fresh) { cur = "0."; fresh = false; return; }
    if (cur.indexOf(".") === -1) cur += ".";
  }

  function operator(o) {
    if (cur === "Error") return;
    if (op !== null && fresh) { op = o; }          // changed my mind about the operator
    else {
      if (op !== null) {                            // chain: 2 + 3 + ...
        var r = str(compute(prev, Number(cur), op));
        cur = r;
        if (r === "Error") { prev = null; op = null; expr = ""; return; }
      }
      prev = Number(cur);
      op = o;
      fresh = true;
    }
    expr = str(prev) + " " + SYM[o];
  }

  function equals() {
    if (op === null || cur === "Error") return;
    var b = Number(cur);
    var r = str(compute(prev, b, op));
    expr = str(prev) + " " + SYM[op] + " " + str(b) + " =";
    cur = r;
    prev = null; op = null; fresh = true;
    if (r === "Error") expr = "Can't divide by zero";
  }

  function percent() {
    if (cur === "Error") return;
    cur = str(Number(cur) / 100);
    fresh = true;
  }

  function negate() {
    if (cur === "Error" || cur === "0") return;
    cur = cur[0] === "-" ? cur.slice(1) : "-" + cur;
  }

  function back() {
    if (cur === "Error") { clear(); return; }
    if (fresh) return;
    cur = (cur.length > 1 && !(cur.length === 2 && cur[0] === "-")) ? cur.slice(0, -1) : "0";
  }

  document.getElementById("keys").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.num !== undefined) digit(b.dataset.num);
    else if (b.dataset.op) operator(b.dataset.op);
    else {
      var a = b.dataset.act;
      if (a === "clear") clear();
      else if (a === "back") back();
      else if (a === "percent") percent();
      else if (a === "negate") negate();
      else if (a === "dot") dot();
      else if (a === "equals") equals();
    }
    show();
  });

  document.addEventListener("keydown", function (e) {
    var k = e.key;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[0-9]$/.test(k)) digit(k);
    else if (k === ".") dot();
    else if (k === "+" || k === "-" || k === "*" || k === "/") { e.preventDefault(); operator(k); }
    else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); }
    else if (k === "Backspace") back();
    else if (k === "Escape") clear();
    else if (k === "%") percent();
    else return;
    show();
  });

  show();
})();
