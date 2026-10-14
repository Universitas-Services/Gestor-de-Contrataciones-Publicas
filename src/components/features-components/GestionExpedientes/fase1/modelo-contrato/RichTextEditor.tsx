"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  className?: string;
  minHeightClassName?: string;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  className,
  minHeightClassName = "min-h-[180px]",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-3 py-2 focus:outline-none text-foreground",
          minHeightClassName
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-card", className)}>
      {!disabled ? (
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Negrita"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Cursiva"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Lista"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Lista numerada"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
