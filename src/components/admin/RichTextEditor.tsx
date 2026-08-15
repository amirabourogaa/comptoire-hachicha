import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import MonacoEditor from '@monaco-editor/react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Code, Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  rows?: number;
}

const FONT_FAMILIES = [
  { label: 'Par défaut', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px'];

const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#33CC33', '#3366FF', '#9933FF',
  '#FF3366', '#FF9966', '#FFFF66', '#66FF66', '#66CCFF', '#CC66FF',
];

export function RichTextEditor({ value, onChange, label, rows = 5 }: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const sanitizedExternalValue = sanitizeRichTextHtml(value || '');
  const [htmlContent, setHtmlContent] = useState(sanitizedExternalValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
    ],
    content: sanitizedExternalValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const sanitized = sanitizeRichTextHtml(html);
      setHtmlContent(sanitized);
      onChange(sanitized);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (sanitizedExternalValue !== htmlContent) {
      editor.commands.setContent(sanitizedExternalValue, { emitUpdate: false });
      setHtmlContent(sanitizedExternalValue);
    }
  }, [editor, sanitizedExternalValue, htmlContent]);

  const handleHtmlChange = (newVal: string | undefined) => {
    const val = newVal || '';
    setHtmlContent(val);
    const sanitized = sanitizeRichTextHtml(val);
    onChange(sanitized);
    if (editor) {
      editor.commands.setContent(sanitized, { emitUpdate: false });
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-2 border rounded-md overflow-hidden bg-background">
      {label && <label className="block text-sm font-medium px-4 pt-3">{label}</label>}
      
      <div className="flex items-center justify-between border-b px-2 py-1 bg-muted/30">
        <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as any)} size="sm">
          <ToggleGroupItem value="visual" aria-label="Visual Editor">
            <Eye className="h-4 w-4 mr-2" /> Visuel
          </ToggleGroupItem>
          <ToggleGroupItem value="html" aria-label="HTML Editor">
            <Code className="h-4 w-4 mr-2" /> HTML / CSS
          </ToggleGroupItem>
        </ToggleGroup>

        {mode === 'visual' && (
          <div className="flex items-center gap-1 flex-wrap border-l pl-2">
            {/* Font Family */}
            <Select
              value={editor.getAttributes('textStyle').fontFamily || ''}
              onValueChange={(v) => {
                if (v) {
                  editor.chain().focus().setFontFamily(v).run();
                } else {
                  editor.chain().focus().unsetFontFamily().run();
                }
              }}
            >
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue placeholder="Police" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((f) => (
                  <SelectItem key={f.value || 'default'} value={f.value || 'default'} className="text-xs" style={{ fontFamily: f.value || undefined }}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Font Size */}
            <Select
              value=""
              onValueChange={(v) => {
                editor.chain().focus().setMark('textStyle', { fontSize: v }).run();
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue placeholder="Taille" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-px h-4 bg-border mx-1" />

            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run()}}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run()}}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('underline') ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run()}}>
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            {/* Color Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3" align="start">
                <p className="text-xs font-medium mb-2">Couleur du texte</p>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      onClick={() => editor.chain().focus().setColor(c).run()}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  className="h-8 w-full cursor-pointer"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                />
              </PopoverContent>
            </Popover>

            <div className="w-px h-4 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run()}}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run()}}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run()}}>
              <AlignRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run()}}>
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run()}}>
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="p-0">
        {mode === 'visual' ? (
          <div className={`prose max-w-none p-4 min-h-[${Math.max(150, rows * 24)}px] focus:outline-none`}>
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div className="min-h-[300px] border-t">
            <MonacoEditor
              height="300px"
              language="html"
              theme="vs-dark"
              value={htmlContent}
              onChange={handleHtmlChange}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
