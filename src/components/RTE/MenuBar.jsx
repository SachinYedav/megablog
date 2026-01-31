import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  List,
  ListOrdered,
  ListTodo, 
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Youtube,
  Table as TableIcon,
} from "lucide-react";

export default function MenuBar({ editor, onImageClick, onYoutubeClick }) {
  if (!editor) return null;

  const getBtnClass = (isActive) =>
    `p-2 rounded-lg transition-colors ${
      isActive
        ? "bg-primary-light text-white shadow-md"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  //  Add Youtube Video
  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
      {/* 1. Basic Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={getBtnClass(editor.isActive("bold"))}
        title="Bold (Ctrl+B)"
      >
        <Bold size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={getBtnClass(editor.isActive("italic"))}
        title="Italic (Ctrl+I)"
      >
        <Italic size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={getBtnClass(editor.isActive("underline"))}
        title="Underline (Ctrl+U)"
      >
        <Underline size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={getBtnClass(editor.isActive("strike"))}
        title="Strike"
      >
        <Strikethrough size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={getBtnClass(editor.isActive("highlight"))}
        title="Highlight"
      >
        <Highlighter size={18} />
      </button>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 2. Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getBtnClass(editor.isActive("heading", { level: 1 }))}
        title="Heading 1 (#)"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getBtnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2 (##)"
      >
        <Heading2 size={18} />
      </button>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 3. Lists & Structure */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getBtnClass(editor.isActive("bulletList"))}
        title="Bullet List (-)"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getBtnClass(editor.isActive("orderedList"))}
        title="Ordered List (1.)"
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={getBtnClass(editor.isActive("taskList"))}
        title="Task List ([ ])"
      >
        <ListTodo size={18} />
      </button>

      {/* 4. Advanced: Code, Blockquote, Table */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={getBtnClass(editor.isActive("codeBlock"))}
        title="Code Block (```)"
      >
        <Code size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getBtnClass(editor.isActive("blockquote"))}
        title="Quote (>)"
      >
        <Quote size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className={getBtnClass(false)}
        title="Insert Table"
      >
        <TableIcon size={18} />
      </button>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 5. Media */}
      <button
        type="button"
        onClick={onImageClick}
        className={getBtnClass(false)}
        title="Insert Image"
      >
        <ImageIcon size={18} />
      </button>

      <button
        type="button"
        onClick={onYoutubeClick} 
        className={getBtnClass(editor.isActive("youtube"))}
        title="Add YouTube Video"
      >
        <Youtube size={18} />
      </button>

      {/* Undo/Redo */}
      <div className="ml-auto flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={getBtnClass(false)}
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={getBtnClass(false)}
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
}
