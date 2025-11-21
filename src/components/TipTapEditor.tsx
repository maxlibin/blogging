"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Quote, Strikethrough, Undo, Redo } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

const ToolbarButton = ({ 
  onClick, 
  isActive, 
  disabled, 
  children,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children?: React.ReactNode;
  title?: string;
}) => (
  <Button
    type="button"
    variant={isActive ? "secondary" : "ghost"}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={cn("h-8 w-8 p-0", isActive && "bg-slate-200 text-slate-900")}
    title={title}
  >
    {children}
  </Button>
);

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange, className }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline',
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if it changes externally (e.g. new generation)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only update if the content is significantly different to avoid cursor jumps
      // For this use case, we mainly care about initial load or full reset
       if (Math.abs(editor.getHTML().length - content.length) > 10) {
          editor.commands.setContent(content);
       }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>
        
        <div className="w-px h-4 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </ToolbarButton>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={16} />
        </ToolbarButton>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto min-h-[400px]" />
    </div>
  );
};