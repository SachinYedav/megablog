import React, { useState, useEffect } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, Extension } from "@tiptap/react";
import { Controller } from "react-hook-form";
import { marked } from "marked";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// --- EXTENSIONS ---
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

// --- LOCAL COMPONENTS ---
import MenuBar from "./MenuBar";
import ImageModal from "./ImageModal";
import YoutubeModal from "./YoutubeModal";
import ResizableImageNode from "./ResizableImageNode";
import ResizableYoutubeNode from "./ResizableYoutubeNode";
import "./styles.css";

// 1. CUSTOM MARKDOWN PASTE
const MarkdownPaste = Extension.create({
  name: "markdownPaste",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste: (view, event, slice) => {
            const item = event.clipboardData?.items[0];
            if (item?.type === "text/plain") {
              const text = event.clipboardData.getData("text/plain");
              // Check for markdown syntax
              const isMarkdown = /^(#|##|###|\*|-|1\.|>|`)/m.test(text) || /(\*\*|__)/.test(text);
              
              if (isMarkdown) {
                try {
                  const html = marked.parse(text);
                  this.editor.commands.insertContent(html);
                  return true; // Prevent default paste
                } catch (e) {
                  console.error("Markdown parsing error:", e);
                }
              }
            }
            return false; // Allow default paste
          },
        },
      }),
    ];
  },
});

//  2. CUSTOM IMAGE (Resizable)
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      textAlign: { default: "center" },
      rotation: { default: 0 },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },
});

//  3. CUSTOM YOUTUBE 
const CustomYoutube = Youtube.configure({
  controls: false,
  nocookie: true, 
  allowFullscreen: true,
  autoplay: false,
  ccLanguage: 'en',
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: 640 },
      height: { default: 480 },
      textAlign: { default: "center" },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableYoutubeNode);
  },
});

// 4. ALL EXTENSIONS CONFIGURATION
const EXTENSIONS = [
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
  }),
  MarkdownPaste,
  CustomImage,
  CustomYoutube,
  Link.configure({ openOnClick: false }),
  Underline,
  Placeholder.configure({
    placeholder: "Write something amazing... (Type '/' for commands)",
  }),
  TextAlign.configure({ types: ["heading", "paragraph", "image", "youtube"] }), 
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

export default function RTE({ name, control, label, defaultValue = "" }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);

  // Initialize Tiptap
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert lg:prose-xl max-w-none focus:outline-none min-h-[400px] p-6 cursor-text",
      },
    },
  });

  useEffect(() => {
    if (editor && defaultValue) {
      const currentContent = editor.getHTML();
      if ((currentContent === "<p></p>" || currentContent === "") && defaultValue) {
        editor.commands.setContent(defaultValue);
      }
    }
  }, [defaultValue, editor]);

  // Handler: Insert Image
  const handleImageSubmit = ({ src, width, alt }) => {
    if (editor) {
      editor.chain().focus().setImage({ src, alt, width: width ? parseInt(width) : null }).run();
    }
    setIsImageModalOpen(false);
  };

  // Handler: Insert Youtube
  const handleYoutubeSubmit = ({ src, width }) => {
    if (editor) {
      const w = width ? parseInt(width) : 640;
      editor.commands.setYoutubeVideo({ src: src, width: Math.max(320, w) });
    }
    setIsYoutubeModalOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="inline-block mb-2 pl-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex flex-col transition-all focus-within:ring-2 focus-within:ring-primary-light/50">
        {/* Toolbar */}
        <MenuBar
          editor={editor}
          onImageClick={() => setIsImageModalOpen(true)}
          onYoutubeClick={() => setIsYoutubeModalOpen(true)}
        />

        {/* Editor Area with React Hook Form Controller */}
        <Controller
          name={name || "content"}
          control={control}
          defaultValue={defaultValue}
          render={({ field: { onChange } }) => {
            // Sync Editor -> React Hook Form
            if (editor && !editor.options.element.oninput) {
              editor.options.element.oninput = true;
              editor.on("update", () => {
                const htmlOutput = editor.getHTML();
                onChange(htmlOutput);
              });
            }
            return <EditorContent editor={editor} />;
          }}
        />
      </div>

      {/* Modals */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSubmit={handleImageSubmit}
      />

      <YoutubeModal
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        onSubmit={handleYoutubeSubmit}
      />
    </div>
  );
}