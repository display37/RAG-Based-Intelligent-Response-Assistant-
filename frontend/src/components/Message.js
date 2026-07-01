import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Message({ role, text }) {
  return (
    <div className={`w-full py-5 ${role === "assistant" ? "bg-[#343541]" : "bg-[#40414f]"}`}>
      <div className="max-w-3xl mx-auto flex gap-4 px-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gray-600 text-white">
          {role === "user" ? "U" : "AI"}
        </div>
        <div className="prose prose-invert max-w-none text-sm text-gray-100">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-700 px-1 py-0.5 rounded text-xs">
                    {children}
                  </code>
                );
              },
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
