import React, { useEffect } from "react";
import parse from "html-react-parser";
import hljs from "highlight.js";
import toast from "react-hot-toast";

import "highlight.js/styles/atom-one-dark-reasonable.css";

export default function ParseHTML({ content }) {
  
  if (typeof content !== "string") {
    return null;
  }

  useEffect(() => {
    // 1️ SMART CONFIGURATION 
    try {
      hljs.configure({ ignoreUnescapedHTML: true });
      
      hljs.registerAliases(
        ["javascriptreact", "jsx", "tsx", "typescriptreact", "vue"], 
        { languageName: "javascript" }
      );
      hljs.registerAliases(["sh", "zsh", "shell"], { languageName: "bash" });
    } catch (e) {
    }

    const preBlocks = document.querySelectorAll("pre");

    preBlocks.forEach((pre) => {
      // 2 APPLY HIGHLIGHTING
      const codeBlock = pre.querySelector("code");
      
      if (codeBlock) {
        if (codeBlock.className.includes("language-javascriptreact")) {
           codeBlock.className = codeBlock.className.replace("language-javascriptreact", "language-javascript");
        }
        hljs.highlightElement(codeBlock);
      }

      // 3️ INJECT SMART COPY BUTTON 
      if (pre.querySelector(".copy-btn")) return;

      const button = document.createElement("button");
      button.className = "copy-btn";
      button.setAttribute("aria-label", "Copy code to clipboard");
      
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;

      button.addEventListener("click", async () => {
        const codeText = codeBlock ? codeBlock.innerText : pre.innerText;
        let success = false;

        try {
          // Modern API
          await navigator.clipboard.writeText(codeText);
          success = true;
        } catch (err) {
          try {
            const textArea = document.createElement("textarea");
            textArea.value = codeText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            success = true;
          } catch (e) {
            toast.error("Failed to copy code.");
          }
        }

        if (success) {
          toast.success("code copied to clipboard successfully", {
             style: { background: "#333", color: "#fff", borderRadius: "8px" }
          });

          button.classList.add("copied");
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span style="color: #4ade80">Copied</span>
          `;

          setTimeout(() => {
            button.classList.remove("copied");
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        }
      });

      pre.appendChild(button);
    });

  }, [content]);

  const styles = `
    /* Container: Mac Terminal Style */
    .prose pre {
      background: #1e1e1e !important; /* VS Code Dark BG */
      padding: 3rem 1.5rem 1.5rem 1.5rem; /* Top padding for Header */
      border-radius: 12px;
      overflow-x: auto;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      margin: 1.5em 0;
    }

    /* 🔴🟡🟢 Mac Dots */
    .prose pre::before {
      content: "";
      position: absolute;
      top: 18px;
      left: 18px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ff5f56;
      box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
      z-index: 10;
    }

    /* Code Text */
    .prose pre code {
      font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
      font-size: 0.9em;
      line-height: 1.6;
      background: transparent !important;
      padding: 0;
      border: none;
      font-weight: normal;
    }

    /* Scrollbar Styling */
    .prose pre::-webkit-scrollbar { height: 8px; }
    .prose pre::-webkit-scrollbar-track { background: transparent; }
    .prose pre::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
    .prose pre::-webkit-scrollbar-thumb:hover { background: #6b7280; }

    /* 🟢 SMART COPY BUTTON */
    .copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #a1a1aa;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: sans-serif;
      backdrop-filter: blur(4px);
      z-index: 20;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
    
    .copy-btn:active {
      transform: translateY(0px);
    }

    .copy-btn.copied {
      background: rgba(74, 222, 128, 0.1);
      border-color: rgba(74, 222, 128, 0.2);
    }

    .copy-btn svg { opacity: 0.8; }

    /* General Typography Fixes */
    .prose code:not(pre code) {
      color: #ef4444; /* Tailwind Red-500 */
      background: rgba(239, 68, 68, 0.1);
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.85em;
    }
    
    .prose img { border-radius: 12px; margin: 2rem auto; display: block; max-width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .prose table { border-collapse: separate; border-spacing: 0; width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 2em 0; }
    .dark .prose table { border-color: #374151; }
    .prose th, .prose td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
    .dark .prose th, .dark .prose td { border-color: #374151; }
    .prose th { background-color: #f9fafb; font-weight: 600; }
    .dark .prose th { background-color: #1f2937; color: #fff; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="prose dark:prose-invert max-w-none w-full break-words">
        {parse(content)}
      </div>
    </>
  );
}