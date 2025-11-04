import { useState } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [language, setLanguage] = useState("binary");
  const [inputString, setInputString] = useState("010101");
  const [mode, setMode] = useState("RE");
  const [output, setOutput] = useState("");
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  // --- Simple decider logic ---
  const decider = (L, w) => {
    L = L.toLowerCase();
    if (L.includes("even")) return parseInt(w) % 2 === 0;
    if (L.includes("odd")) return parseInt(w) % 2 !== 0;
    if (L.includes("length")) {
      const len = parseInt(L.match(/\d+/)?.[0] || -1, 10);
      return w.length === len;
    }
    if (L.includes("binary")) return /^[01]+$/.test(w);
    return false;
  };

  // --- Recognizer simulation ---
  const recognizer = (L, w, isComplement = false) =>
    new Promise((resolve) => {
      const belongs = decider(L, w);
      setTimeout(() => {
        if (!isComplement) {
          // normal recognizer for L
          if (belongs) resolve("✅ ACCEPT (halts)");
          else resolve("⏳ ...running (no halt)");
        } else {
          // complement recognizer
          if (!belongs) resolve("✅ ACCEPT (halts)");
          else resolve("⏳ ...running (no halt)");
        }
      }, 800);
    });

  // --- Main logic ---
  const handleRun = async () => {
    setOutput("");
    setLog([]);
    setRunning(true);

    if (!language || inputString === "") {
      setOutput("⚠️ Please provide both L (language) and w (string).");
      setRunning(false);
      return;
    }

    if (mode === "R") {
      const res = decider(language, inputString);
      const resL = res ? "✅ ACCEPT (halts)" : "❌ REJECT (halts)";
      const resComp = res ? "❌ REJECT (halts)" : "✅ ACCEPT (halts)";

      setOutput(
        `🧮 Recursive Mode:
Input: w = ${inputString}
Language: L = { ${language} }

M_L(w): ${resL}
M_𝐿̄(w): ${resComp}

✅ Closure confirmed: Recursive languages are closed under complement.`
      );
      setRunning(false);
      return;
    }

    // --- RE Mode ---
    setLog((l) => [...l, "Running recognizer for L..."]);
    const resL = await recognizer(language, inputString);
    setLog((l) => [...l, `M_L(w): ${resL}`]);

    setLog((l) => [...l, "Running recognizer for complement(L)..."]);
    const resComp = await recognizer(language, inputString, true);
    setLog((l) => [...l, `M_𝐿̄(w): ${resComp}`]);

    setOutput(
      `⚙️ RE Mode:
Input: w = ${inputString}
Language: L = { ${language} }

M_L(w): ${resL}
M_𝐿̄(w): ${resComp}

❌ Not closed under complement.
Counterexample: Halting Problem L_H = {⟨M, w⟩ | M halts on w}.`
    );

    setRunning(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500">
      <div className="relative w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-white">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Recursive vs Recursively Enumerable
        </h1>
        <p className="text-center text-white/80 mb-4">
          Visualizing closure under complement — Theory of Computation Demo
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Language (L)</label>
            <input
              className="w-full p-3 rounded-xl bg-white/20 border border-white/25 text-white"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder='e.g. "even numbers", "odd numbers", "binary", "length 3"'
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Input w</label>
            <input
              className="w-full p-3 rounded-xl bg-white/20 border border-white/25 text-white"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              placeholder='e.g. "4", "7", "010101", "abc"'
            />
          </div>

          <div className="flex justify-center gap-3">
            <button
              className={`px-5 py-2 rounded-full font-semibold ${
                mode === "RE" ? "bg-orange-400 text-black" : "bg-white/20 text-white"
              }`}
              onClick={() => setMode("RE")}
              disabled={running}
            >
              RE
            </button>
            <button
              className={`px-5 py-2 rounded-full font-semibold ${
                mode === "R" ? "bg-green-400 text-black" : "bg-white/20 text-white"
              }`}
              onClick={() => setMode("R")}
              disabled={running}
            >
              Recursive (R)
            </button>
          </div>

          <div>
            <button
              onClick={handleRun}
              className="w-full py-3 rounded-2xl bg-white text-black font-bold disabled:opacity-60"
              disabled={running}
            >
              {running ? "⏳ Running..." : "▶ Run Simulation"}
            </button>
          </div>

          {/* Output */}
          {output && (
            <div className="mt-4 p-4 bg-white/20 rounded-xl border border-white/25 font-mono text-sm whitespace-pre-wrap text-white">
              {output}
            </div>
          )}

          {/* Logs */}
          {log.length > 0 && (
            <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/10 text-sm text-white">
              <strong>Execution Log:</strong>
              <div className="mt-2 space-y-1">
                {log.map((entry, i) => (
                  <div key={i}>• {entry}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-white/80 text-center">
          Note: RE recognizer halts only on positives, complement recognizer halts only on negatives — not closed under complement.
        </div>
      </div>
    </div>
  );
}
