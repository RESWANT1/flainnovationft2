// State
let language = "binary";
let inputString = "010101";
let mode = "RE";
let running = false;

// DOM Elements
const languageInput = document.getElementById("language");
const inputStringInput = document.getElementById("inputString");
const reBtn = document.getElementById("reBtn");
const rBtn = document.getElementById("rBtn");
const runBtn = document.getElementById("runBtn");
const outputContainer = document.getElementById("outputContainer");
const output = document.getElementById("output");
const logContainer = document.getElementById("logContainer");
const logContent = document.getElementById("logContent");
const runText = runBtn.querySelector(".run-text");
const loadingText = runBtn.querySelector(".loading-text");

// Simple decider logic
function decider(L, w) {
    L = L.toLowerCase();
    
    if (L.includes("even")) {
        const num = parseInt(w);
        return !isNaN(num) && num % 2 === 0;
    }
    
    if (L.includes("odd")) {
        const num = parseInt(w);
        return !isNaN(num) && num % 2 !== 0;
    }
    
    if (L.includes("length")) {
        const match = L.match(/\d+/);
        const len = match ? parseInt(match[0]) : -1;
        return w.length === len;
    }
    
    if (L.includes("binary")) {
        return /^[01]+$/.test(w);
    }
    
    return false;
}

// Recognizer simulation
function recognizer(L, w, isComplement = false) {
    return new Promise((resolve) => {
        const belongs = decider(L, w);
        setTimeout(() => {
            if (!isComplement) {
                if (belongs) {
                    resolve("✅ ACCEPT (halts)");
                } else {
                    resolve("⏳ ...running (no halt)");
                }
            } else {
                if (!belongs) {
                    resolve("✅ ACCEPT (halts)");
                } else {
                    resolve("⏳ ...running (no halt)");
                }
            }
        }, 800);
    });
}

// Add log entry
function addLogEntry(message) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = "• " + message;
    logContent.appendChild(entry);
}

// Clear log
function clearLog() {
    logContent.innerHTML = "";
}

// Main run logic
async function handleRun() {
    // Clear previous results
    output.textContent = "";
    clearLog();
    outputContainer.style.display = "none";
    logContainer.style.display = "none";
    
    // Set running state
    running = true;
    runBtn.disabled = true;
    reBtn.disabled = true;
    rBtn.disabled = true;
    runText.style.display = "none";
    loadingText.style.display = "flex";

    // Validate inputs
    if (!language || inputString === "") {
        output.textContent = "⚠️ Please provide both L (language) and w (string).";
        outputContainer.style.display = "block";
        resetRunButton();
        return;
    }

    if (mode === "R") {
        // Recursive mode
        const res = decider(language, inputString);
        const resL = res ? "✅ ACCEPT (halts)" : "❌ REJECT (halts)";
        const resComp = res ? "❌ REJECT (halts)" : "✅ ACCEPT (halts)";

        output.textContent = `🧮 Recursive Mode:
Input: w = ${inputString}
Language: L = { ${language} }

M_L(w): ${resL}
M_𝐿̄(w): ${resComp}

✅ Closure confirmed: Recursive languages are closed under complement.`;
        
        outputContainer.style.display = "block";
        resetRunButton();
        return;
    }

    // RE Mode
    logContainer.style.display = "block";
    
    addLogEntry("Running recognizer for L...");
    const resL = await recognizer(language, inputString);
    addLogEntry(`M_L(w): ${resL}`);

    addLogEntry("Running recognizer for complement(L)...");
    const resComp = await recognizer(language, inputString, true);
    addLogEntry(`M_𝐿̄(w): ${resComp}`);

    output.textContent = `⚙️ RE Mode:
Input: w = ${inputString}
Language: L = { ${language} }

M_L(w): ${resL}
M_𝐿̄(w): ${resComp}

❌ Not closed under complement.
Counterexample: Halting Problem L_H = {⟨M, w⟩ | M halts on w}.`;

    outputContainer.style.display = "block";
    resetRunButton();
}

function resetRunButton() {
    running = false;
    runBtn.disabled = false;
    reBtn.disabled = false;
    rBtn.disabled = false;
    runText.style.display = "block";
    loadingText.style.display = "none";
}

// Set mode
function setMode(newMode) {
    mode = newMode;
    
    if (newMode === "RE") {
        reBtn.classList.add("active");
        rBtn.classList.remove("active");
    } else {
        reBtn.classList.remove("active");
        rBtn.classList.add("active");
    }
}

// Event listeners
languageInput.addEventListener("input", (e) => {
    language = e.target.value;
});

inputStringInput.addEventListener("input", (e) => {
    inputString = e.target.value;
});

reBtn.addEventListener("click", () => {
    if (!running) setMode("RE");
});

rBtn.addEventListener("click", () => {
    if (!running) setMode("R");
});

runBtn.addEventListener("click", handleRun);

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    languageInput.value = language;
    inputStringInput.value = inputString;
    setMode(mode);
});
