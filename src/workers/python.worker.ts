import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;

type RunMessage = {
  type: "run";
  code: string;
};

type ResetMessage = {
  type: "reset";
};

type WorkerMessage = RunMessage | ResetMessage;

async function initializePython(): Promise<PyodideInterface> {
  if (pyodide) {
    return pyodide;
  }

  if (!loadingPromise) {
    loadingPromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
    }).then((instance) => {
      pyodide = instance;
      return instance;
    }).catch((error) => {
      loadingPromise = null;
      throw error;
    });
  }

  return loadingPromise;
}

async function runPython(code: string) {
  try {
    self.postMessage({
      type: "loading",
      message: "Preparing your Python playground...",
    });

    const python = await initializePython();

    let output = "";

    python.setStdout({
      batched: (text: string) => {
        output += text + "\n";
      },
    });

    python.setStderr({
      batched: (text: string) => {
        output += text + "\n";
      },
    });

    self.postMessage({
      type: "running",
      message: "Running your Python code...",
    });

    try {
      const result = await python.runPythonAsync(code);

      if (result !== undefined && result !== null && !output.trim()) {
        output = String(result);
      }

      self.postMessage({
        type: "result",
        output: output.trimEnd() || "Code executed successfully!",
      });
    } catch (error) {
      self.postMessage({
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  if (message.type === "run") {
    await runPython(message.code);
  }

  if (message.type === "reset") {
    pyodide = null;
    loadingPromise = null;

    self.postMessage({
      type: "reset",
      message: "Python playground reset successfully.",
    });
  }
};

export {};