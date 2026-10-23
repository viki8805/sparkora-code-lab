import { useEffect, useRef, useState } from "react";
import ExplainCode from "../components/ExplainCode";

const DEFAULT_CODE = `name = "Sparkora"
age = 10

print("Hello", name)
print("My age is", age)`;

export default function Playground() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [showExplain, setShowExplain] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Python Worker
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/python.worker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current = worker;

    worker.onmessage = (event) => {
      const data = event.data;

      if (data.type === "ready") {
        setIsReady(true);
        setError("");
      }

      if (data.type === "result") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setOutput(String(data.output ?? ""));
        setIsRunning(false);
      }

      if (data.type === "error") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setError(String(data.output ?? "Python execution failed."));
        setIsRunning(false);
      }
    };

    worker.onerror = () => {
      setError("Python engine could not be loaded.");
      setIsReady(false);
      setIsRunning(false);
    };

    return () => {
      worker.terminate();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Run Python Code
  const runCode = () => {
    if (!workerRef.current || !isReady || isRunning) {
      return;
    }

    setIsRunning(true);
    setOutput("");
    setError("");

    workerRef.current.postMessage({
      type: "run",
      code: code,
    });

    timeoutRef.current = setTimeout(() => {
      workerRef.current?.terminate();
      workerRef.current = null;

      setIsRunning(false);
      setIsReady(false);
      setError(
        "Execution timed out. Refresh the page to restart Python."
      );
    }, 12000);
  };

  // Reset Code
  const resetCode = () => {
    setCode(DEFAULT_CODE);
    setOutput("");
    setError("");
    setShowExplain(false);
  };

  // Explain Code
  const explainCode = () => {
    setShowExplain(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fffd",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              color: "#0f766e",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            🐍 Sparkora Python Playground
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "10px",
              fontSize: "16px",
            }}
          >
            Write Python code, run it, and learn with magic animations!
          </p>
        </div>

        {/* Code Editor */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
            border: "1px solid #ccfbf1",
          }}
        >
          <h2
            style={{
              color: "#164e63",
              marginBottom: "15px",
            }}
          >
            💻 Python Code Editor
          </h2>

          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setShowExplain(false);
            }}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: "280px",
              padding: "20px",
              borderRadius: "15px",
              border: "2px solid #99f6e4",
              background: "#102a43",
              color: "#d1fae5",
              fontFamily: "Consolas, monospace",
              fontSize: "16px",
              lineHeight: "1.8",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={runCode}
              disabled={!isReady || isRunning}
              style={{
                background: "#22c55e",
                color: "white",
                border: "none",
                padding: "13px 24px",
                borderRadius: "12px",
                cursor: isReady ? "pointer" : "not-allowed",
                fontWeight: "bold",
                fontSize: "15px",
                opacity: !isReady || isRunning ? 0.6 : 1,
              }}
            >
              {isRunning
                ? "⏳ Running..."
                : !isReady
                ? "⏳ Loading Python..."
                : "▶ Run Code"}
            </button>

            <button
              onClick={explainCode}
              style={{
                background: "#0ea5e9",
                color: "white",
                border: "none",
                padding: "13px 24px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              🪄 Explain Code
            </button>

            <button
              onClick={resetCode}
              style={{
                background: "#fce7f3",
                color: "#be185d",
                border: "none",
                padding: "13px 24px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              🔄 Reset Code
            </button>
          </div>
        </div>

        {/* Output */}
        <div
          style={{
            background: "white",
            marginTop: "25px",
            padding: "24px",
            borderRadius: "20px",
            border: "1px solid #ccfbf1",
          }}
        >
          <h2
            style={{
              color: "#164e63",
              marginBottom: "15px",
            }}
          >
            🖥️ Python Output
          </h2>

          <pre
            style={{
              background: "#ecfdf5",
              padding: "20px",
              borderRadius: "12px",
              minHeight: "80px",
              color: "#065f46",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontFamily: "Consolas, monospace",
              fontSize: "15px",
            }}
          >
            {output || "Click Run Code to see your output here!"}
          </pre>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "15px",
                borderRadius: "12px",
                marginTop: "15px",
                whiteSpace: "pre-wrap",
              }}
            >
              ❌ {error}
            </div>
          )}
        </div>

        {/* Magic Explain Code */}
        {showExplain && (
          <div style={{ marginTop: "25px" }}>
            <ExplainCode code={code} />
          </div>
        )}
      </div>
    </div>
  );
}