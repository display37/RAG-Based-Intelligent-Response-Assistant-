import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Message({ role, text }) {
  return (
    <div className={`w-full py-5 ${role === "assistant" ? "bg-darkBg" : "bg-card"}`}>
      <div className="max-w-3xl mx-auto flex gap-4 px-4">

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
          {role === "user" ? "U" : "AI"}
        </div>

        {/* Message */}
        <div className="prose prose-invert max-w-none text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");

                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-700 px-1 py-0.5 rounded">
                    {children}
                  </code>
                );
              }
            }}
          >
            {text}
          </ReactMarkdown>
        </div>

      </div>
    </div>
  );
}