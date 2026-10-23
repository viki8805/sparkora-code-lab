import { useEffect, useMemo, useState } from "react";
import "./ExplainCode.css";

interface ExplainCodeProps {
  code: string;
}

interface Token {
  text: string;
  meaning: string;
  emoji: string;
  type: string;
}

const keywords = new Set([
  "if",
  "elif",
  "else",
  "for",
  "while",
  "def",
  "return",
  "in",
  "and",
  "or",
  "not",
  "break",
  "continue",
  "pass",
  "import",
  "from",
  "as",
  "class",
  "True",
  "False",
  "None",
]);

function tokenize(code: string): Token[] {
  const regex =
    /#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_]\w*\b|==|!=|<=|>=|\*\*|\/\/|[=+\-*/%():,\[\]{}<>]|\S/g;

  const matches = code.match(regex) || [];

  return matches.map((text) => {
    if (text.startsWith("#")) {
      return {
        text,
        meaning:
          "This is a comment. Comments help people understand the code. Python does not execute comments.",
        emoji: "📝",
        type: "comment",
      };
    }

    if (text === "print") {
      return {
        text,
        meaning:
          "The print() function displays information on the screen. We can use it to show messages, numbers, and results.",
        emoji: "🖥️",
        type: "function",
      };
    }

    if (text === "input") {
      return {
        text,
        meaning:
          "The input() function asks the user to enter information. Python receives the entered information as text.",
        emoji: "⌨️",
        type: "function",
      };
    }

    if (text === "range") {
      return {
        text,
        meaning:
          "The range() function creates a sequence of numbers. It is often used with loops.",
        emoji: "🔢",
        type: "function",
      };
    }

    if (text === "len") {
      return {
        text,
        meaning:
          "The len() function counts the number of items in a collection or the number of characters in a string.",
        emoji: "📏",
        type: "function",
      };
    }

    if (text === "int" || text === "float" || text === "str") {
      return {
        text,
        meaning:
          `${text}() is a built-in Python function used to convert a value to a different data type.`,
        emoji: "🔄",
        type: "function",
      };
    }

    if (text === "=") {
      return {
        text,
        meaning:
          "This is the assignment operator. It stores a value in a variable. Imagine placing an object inside a labeled magic box!",
        emoji: "➡️",
        type: "operator",
      };
    }

    if (text === "==") {
      return {
        text,
        meaning:
          "This is the equality operator. It compares two values and checks whether they are equal.",
        emoji: "⚖️",
        type: "operator",
      };
    }

    if (text === "!=") {
      return {
        text,
        meaning:
          "This operator checks whether two values are different.",
        emoji: "⚖️",
        type: "operator",
      };
    }

    if (text === "+" || text === "-" || text === "*" || text === "/") {
      const descriptions: Record<string, string> = {
        "+": "The plus operator adds numbers. It can also join strings.",
        "-": "The minus operator subtracts one number from another.",
        "*": "The multiplication operator multiplies numbers. It can also repeat certain sequences.",
        "/": "The division operator divides one number by another.",
      };

      return {
        text,
        meaning: descriptions[text],
        emoji:
          text === "+"
            ? "➕"
            : text === "-"
            ? "➖"
            : text === "*"
            ? "✖️"
            : "➗",
        type: "operator",
      };
    }

    if (text === "%") {
      return {
        text,
        meaning:
          "The modulo operator finds the remainder after division.",
        emoji: "🧮",
        type: "operator",
      };
    }

    if (text === "**") {
      return {
        text,
        meaning:
          "The exponentiation operator raises a number to a power.",
        emoji: "🔢",
        type: "operator",
      };
    }

    if (text === "//") {
      return {
        text,
        meaning:
          "The floor division operator divides two numbers and rounds the result down to the nearest whole number.",
        emoji: "🧮",
        type: "operator",
      };
    }

    if (/^\d+(\.\d+)?$/.test(text)) {
      return {
        text,
        meaning: text.includes(".")
          ? `${text} is a floating-point number. It contains a decimal point.`
          : `${text} is an integer. An integer is a whole number without a decimal point.`,
        emoji: "🔢",
        type: "number",
      };
    }

    if (text.startsWith('"') || text.startsWith("'")) {
      return {
        text,
        meaning:
          `${text} is a string. A string is text written inside quotation marks. Strings can store names, words, and messages.`,
        emoji: "💬",
        type: "string",
      };
    }

    if (text === "for") {
      return {
        text,
        meaning:
          "A for loop repeats instructions for each item in a sequence. It helps us perform repetitive tasks.",
        emoji: "🔁",
        type: "keyword",
      };
    }

    if (text === "while") {
      return {
        text,
        meaning:
          "A while loop repeats instructions as long as its condition remains true.",
        emoji: "🔄",
        type: "keyword",
      };
    }

    if (text === "if") {
      return {
        text,
        meaning:
          "An if statement helps Python make decisions. Its code block runs only when the condition is true.",
        emoji: "🤔",
        type: "keyword",
      };
    }

    if (text === "elif") {
      return {
        text,
        meaning:
          "An elif statement checks another condition when the previous conditions were false.",
        emoji: "🔀",
        type: "keyword",
      };
    }

    if (text === "else") {
      return {
        text,
        meaning:
          "An else statement provides an alternative block of code when the previous conditions are false.",
        emoji: "🔀",
        type: "keyword",
      };
    }

    if (text === "def") {
      return {
        text,
        meaning:
          "The def keyword creates a function. A function is a reusable group of instructions.",
        emoji: "🛠️",
        type: "keyword",
      };
    }

    if (text === "return") {
      return {
        text,
        meaning:
          "The return statement sends a result back from a function and ends that function call.",
        emoji: "📤",
        type: "keyword",
      };
    }

    if (text === "True" || text === "False") {
      return {
        text,
        meaning:
          `${text} is a Boolean value. Boolean values represent true or false conditions.`,
        emoji: "✅",
        type: "boolean",
      };
    }

    if (text === "and" || text === "or" || text === "not") {
      return {
        text,
        meaning:
          `${text} is a logical operator. Logical operators help us combine or change conditions.`,
        emoji: "🧠",
        type: "keyword",
      };
    }

    if (text === "in") {
      return {
        text,
        meaning:
          "The in keyword checks membership in a collection. It is also used to iterate through sequences.",
        emoji: "🔎",
        type: "keyword",
      };
    }

    if (text === "(" || text === ")") {
      return {
        text,
        meaning:
          "Parentheses help group expressions and are used when calling functions.",
        emoji: "🧩",
        type: "symbol",
      };
    }

    if (text === "[" || text === "]") {
      return {
        text,
        meaning:
          "Square brackets are used to create lists and access items from sequences or dictionaries.",
        emoji: "📋",
        type: "symbol",
      };
    }

    if (text === "{" || text === "}") {
      return {
        text,
        meaning:
          "Curly braces are used to create dictionaries and sets.",
        emoji: "📚",
        type: "symbol",
      };
    }

    if (text === ":") {
      return {
        text,
        meaning:
          "A colon marks the beginning of an indented code block in statements such as if, for, while, and def.",
        emoji: "🚦",
        type: "symbol",
      };
    }

    if (text === ",") {
      return {
        text,
        meaning:
          "A comma separates items or arguments in Python.",
        emoji: "🔹",
        type: "symbol",
      };
    }

    if (keywords.has(text)) {
      return {
        text,
        meaning:
          `${text} is a Python keyword. Keywords have special meanings in the Python language.`,
        emoji: "🐍",
        type: "keyword",
      };
    }

    if (/^[a-zA-Z_]\w*$/.test(text)) {
      return {
        text,
        meaning:
          `${text} is an identifier. It may be the name of a variable, function, or another part of the program. When used as a variable, imagine it as a labeled magic box that stores information.`,
        emoji: "📦",
        type: "variable",
      };
    }

    return {
      text,
      meaning:
        `${text} is a symbol used in Python. Its purpose depends on how it appears in the program.`,
      emoji: "🧩",
      type: "symbol",
    };
  });
}

export default function ExplainCode({ code }: ExplainCodeProps) {
  const tokens = useMemo(() => tokenize(code), [code]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setStarted(false);
    setCompleted(false);
  }, [code]);

  const activeToken = tokens[activeIndex];

  function startExplanation() {
    setActiveIndex(0);
    setStarted(true);
    setCompleted(false);
  }

  function nextStep() {
    if (activeIndex < tokens.length - 1) {
      setActiveIndex((previous) => previous + 1);
    } else {
      setCompleted(true);
    }
  }

  function previousStep() {
    setActiveIndex((previous) => Math.max(0, previous - 1));
    setCompleted(false);
  }

  return (
    <div className="explain-container">
      <h2>🪄 Magic Code Explainer</h2>

      <p>
        Discover how Python works, one tiny step at a time!
      </p>

      {!started ? (
        <button
          className="explain-btn"
          onClick={startExplanation}
          disabled={tokens.length === 0}
        >
          ✨ Start Explanation
        </button>
      ) : (
        <>
          <p>
            Step {activeIndex + 1} of {tokens.length}
          </p>

          <div className="token-container">
            {tokens.map((token, index) => (
              <button
                key={`${index}-${token.text}`}
                className={`token-box ${
                  activeIndex === index ? "active-token" : ""
                }`}
                onClick={() => {
                  setActiveIndex(index);
                  setCompleted(false);
                }}
                title={token.meaning}
                style={{
                  animationDelay: `${Math.min(index * 0.07, 1)}s`,
                }}
              >
                <span>{token.emoji}</span>
                <strong>{token.text}</strong>
              </button>
            ))}
          </div>

          {activeToken && !completed && (
            <div
              className="magic-explanation"
              key={`${activeIndex}-${activeToken.text}`}
            >
              <div className="magic-emoji">
                {activeToken.emoji}
              </div>

              <h3>{activeToken.text}</h3>

              <p>{activeToken.meaning}</p>

              {activeToken.type === "variable" && (
                <div className="magic-box-animation">
                  📦
                  <span>Magic Box</span>
                </div>
              )}
            </div>
          )}

          {completed ? (
            <div className="complete-message">
              🎉 Wonderful! You explored every part of your code!

              <div>
                <button
                  className="explain-btn"
                  onClick={startExplanation}
                >
                  🔄 Explain Again
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <button
                className="next-step-btn"
                onClick={previousStep}
                disabled={activeIndex === 0}
              >
                ⬅️ Previous
              </button>

              <button
                className="next-step-btn"
                onClick={nextStep}
              >
                {activeIndex === tokens.length - 1
                  ? "🎉 Finish"
                  : "Next Step ➡️"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}