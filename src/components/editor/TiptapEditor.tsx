"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'div'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[400px] px-4 py-2",
      },
    },
  });

  if (!isMounted || !editor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const { url } = await response.json();
        editor.chain().focus().setImage({ src: url }).run();
        toast.success("Image uploaded!");
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setIsUploadingImage(false);
      }
    };

    input.click();
  };

  const setImageSize = (size: 'small' | 'medium' | 'large' | 'full') => {
    const { state } = editor;
    const { from, to } = state.selection;
    
    // Check if we have an image selected or cursor is on an image
    let imageNode = null;
    let imagePos = null;
    
    // Check if selection contains an image
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'image') {
        imageNode = node;
        imagePos = pos;
        return false; // Stop searching
      }
    });
    
    // If no image in selection, check if cursor is next to an image
    if (!imageNode) {
      const nodeBefore = state.doc.nodeAt(from - 1);
      const nodeAfter = state.doc.nodeAt(from);
      
      if (nodeBefore?.type.name === 'image') {
        imageNode = nodeBefore;
        imagePos = from - 1;
      } else if (nodeAfter?.type.name === 'image') {
        imageNode = nodeAfter;
        imagePos = from;
      }
    }

    if (imageNode && imagePos !== null) {
      const sizes = {
        small: '300px',
        medium: '500px', 
        large: '700px',
        full: '100%'
      };
      
      editor.commands.updateAttributes('image', {
        width: sizes[size],
        style: `width: ${sizes[size]}; height: auto; max-width: 100%;`
      });
      
      toast.success(`Image resized to ${size}`);
    } else {
      toast.error("Please click on an image first to resize it");
    }
  };

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-2 bg-gray-50">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bold") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("italic") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            I
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("strike") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            S
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bulletList") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("orderedList") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'left' }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          >
            ⬅️
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'center' }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >
            ↔️
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'right' }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >
            ➡️
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'justify' }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Justify"
          >
            ↕️
          </Button>
        </div>

        {/* Image Upload */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleImageUpload}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? "Uploading..." : "📷 Image"}
          </Button>
        </div>

        {/* Image Size Controls */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setImageSize('small')}
            title="Small (300px)"
          >
            S
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setImageSize('medium')}
            title="Medium (500px)"
          >
            M
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setImageSize('large')}
            title="Large (700px)"
          >
            L
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setImageSize('full')}
            title="Full Width (100%)"
          >
            Full
          </Button>
        </div>

        {/* Table Controls */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert Table (3x3)"
          >
            📊 Table
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            title="Add Column Before"
          >
            ⬅️+
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            title="Add Column After"
          >
            +➡️
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            title="Delete Column"
          >
            ❌📊
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            title="Add Row Before"
          >
            ⬆️+
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            title="Add Row After"
          >
            +⬇️
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            title="Delete Row"
          >
            ❌📋
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            title="Delete Table"
          >
            🗑️📊
          </Button>
        </div>

        {/* Text Color */}
        <div className="flex gap-1 border-l pl-2">
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
            className="w-8 h-8 rounded cursor-pointer"
            title="Text Color"
          />
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[400px]" />

      {/* Help Text */}
      <div className="border-t p-2 text-xs text-gray-500 bg-gray-50">
        💡 Tip: Click on an image, then use S/M/L/Full buttons to resize. Use alignment buttons to position images.
      </div>
    </div>
  );
}