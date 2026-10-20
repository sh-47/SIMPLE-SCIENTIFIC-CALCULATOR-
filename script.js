const display = document.getElementById("display");
const simpleTab = document.getElementById("simpleTab");
const scientificTab = document.getElementById("scientificTab");
const scientificButtons = document.getElementById("scientificButtons");

let expression = "";
let justCalculated = false;

function updateDisplay() {
    display.value = expression || "0";
}

function insert(value) {
    if (justCalculated && /[0-9.]|pi|e|sin\(|cos\(|tan\(|sqrt\(|log\(|ln\(|abs\(|\(/.test(value)) {
        expression = "";
    }

    justCalculated = false;

    if (expression === "0" && /^[0-9]$/.test(value)) {
        expression = value;
    } else {
        expression += value;
    }

    updateDisplay();
}

function clearDisplay() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function calculate() {
    try {
        let exp = expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/\^/g, "**")
            .replace(/π/g, "pi")
            .replace(/\bpi\b/g, "Math.PI")
            .replace(/\be\b/g, "Math.E")
            .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        exp = exp
            .replace(/\bsin\(/g, "sin(")
            .replace(/\bcos\(/g, "cos(")
            .replace(/\btan\(/g, "tan(")
            .replace(/\bsqrt\(/g, "sqrt(")
            .replace(/\blog\(/g, "log(")
            .replace(/\bln\(/g, "ln(")
            .replace(/\babs\(/g, "abs(");

        if (!exp || !/^[0-9+\-*/().,\sA-Za-z%]+$/.test(exp)) {
            throw new Error("Invalid expression");
        }

        const sin = x => Math.sin(x * Math.PI / 180);
        const cos = x => Math.cos(x * Math.PI / 180);
        const tan = x => Math.tan(x * Math.PI / 180);
        const sqrt = x => Math.sqrt(x);
        const log = x => Math.log10(x);
        const ln = x => Math.log(x);
        const abs = x => Math.abs(x);

        const result = Function(
            "sin", "cos", "tan", "sqrt", "log", "ln", "abs",
            `"use strict"; return (${exp});`
        )(sin, cos, tan, sqrt, log, ln, abs);

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Math error");
        }

        expression = String(Number(result.toPrecision(12)));
        justCalculated = true;
        updateDisplay();

    } catch {
        display.value = "Math Error";
        expression = "";
        justCalculated = false;
    }
}

document.querySelectorAll("[data-value]").forEach(button => {
    button.addEventListener("click", () => {
        insert(button.dataset.value);
    });
});

document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "clear") clearDisplay();
        if (action === "delete") deleteLast();

        if (action === "equals") calculate();

        if (action === "sign") {
            if (expression) {
                expression = `-(${expression})`;
                justCalculated = false;
                updateDisplay();
            }
        }
    });
});

simpleTab.addEventListener("click", () => {
    scientificButtons.classList.add("hidden");
    simpleTab.classList.add("active");
    scientificTab.classList.remove("active");
});

scientificTab.addEventListener("click", () => {
    scientificButtons.classList.remove("hidden");
    scientificTab.classList.add("active");
    simpleTab.classList.remove("active");
});

document.addEventListener("keydown", event => {
    if (/^[0-9.]$/.test(event.key)) insert(event.key);
    else if (["+", "-", "*", "/", "(", ")", "^", "%"].includes(event.key)) {
        insert(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearDisplay();
    }
});