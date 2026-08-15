import { useState } from 'react';
import { PageBlock, TextBlockData, ImageBlockData, ButtonBlockData, ColumnsBlockData, SpacerBlockData, DividerBlockData, VideoBlockData, HeroBlockData, ContactFormBlockData, KeyPointsBlockData, CustomFormField } from '@/types/pageBuilder';
import { Image as ImageIcon, Check, ChevronRight, Star } from 'lucide-react';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlockRendererProps {
  block: PageBlock;
  isPreview?: boolean;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function BlockRenderer({ block, isPreview }: BlockRendererProps) {
  switch (block.type) {
    case 'text': {
      const data = block.data as TextBlockData;
      const fontSizeClass = { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' }[data.fontSize || 'base'] || 'text-base';
      const fontWeightClass = { normal: 'font-normal', medium: 'font-medium', bold: 'font-bold' }[data.fontWeight || 'normal'] || '';
      const fontStyleClass = data.fontStyle === 'italic' ? 'italic' : '';
      return (
        <div
          className={`prose prose-sm max-w-none ${fontSizeClass} ${fontWeightClass} ${fontStyleClass}`}
          style={{ textAlign: 'justify', color: data.textColor || undefined }}
          dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(data.content || '') }}
        />
      );
    }
   case 'image': {
      const data = block.data as ImageBlockData;
      
      // Options de taille pour format rectangle pleine largeur
      const sizeOptions = {
        banner: 'w-full h-32 md:h-40 lg:h-48',
        small: 'w-full h-48 md:h-56 lg:h-64',
        medium: 'w-full h-56 md:h-64 lg:h-72',
        large: 'w-full h-64 md:h-72 lg:h-80',
        hero: 'w-full h-72 md:h-80 lg:h-96',
        full: 'w-full h-auto',
      };
      
      // Taille sélectionnée (par défaut: medium)
      const selectedSize = data.rectangleSize || 'medium';
      const sizeClass = sizeOptions[selectedSize as keyof typeof sizeOptions] || sizeOptions.medium;
      
      const radiusClass = { 
        none: 'rounded-none', 
        sm: 'rounded-sm', 
        md: 'rounded-lg', 
        lg: 'rounded-xl', 
        xl: 'rounded-2xl', 
        full: 'rounded-full' 
      }[data.borderRadius || 'md'] || 'rounded-lg';
      
      const shadowClass = { 
        none: '', 
        sm: 'shadow-sm', 
        md: 'shadow-md', 
        lg: 'shadow-lg' 
      }[data.shadow || 'none'] || '';
      
      return (
        <div className="w-full overflow-hidden">
          {data.url ? (
            <img
              src={data.url}
              alt={data.alt || ''}
              className={`${sizeClass} ${radiusClass} ${shadowClass} object-contain w-full`}
              loading="lazy"
            />
          ) : (
            <div className={`${sizeClass} bg-muted rounded-lg flex items-center justify-center text-muted-foreground`}>
              <div className="text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span>Aucune image</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    case 'button': {
      const data = block.data as ButtonBlockData;
      const alignClass = data.align === 'center' ? 'justify-center' : data.align === 'right' ? 'justify-end' : 'justify-start';
      const sizeClass = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3', lg: 'px-8 py-4 text-lg' }[data.size || 'md'] || 'px-6 py-3';
      const variantClass =
        data.variant === 'outline'
          ? 'border border-primary text-primary hover:bg-primary/10'
          : data.variant === 'ghost'
          ? 'text-primary hover:bg-primary/10'
          : 'bg-primary text-primary-foreground hover:opacity-90';
      return (
        <div className={`flex ${alignClass}`}>
          {isPreview ? (
            <span className={`inline-flex items-center ${sizeClass} rounded-lg font-medium transition-colors ${variantClass}`}>
              {data.label || 'Bouton'}
            </span>
          ) : (
            <a
              href={data.link || '#'}
              className={`inline-flex items-center ${sizeClass} rounded-lg font-medium transition-colors ${variantClass}`}
            >
              {data.label || 'Bouton'}
            </a>
          )}
        </div>
      );
    }
    case 'columns': {
      const data = block.data as ColumnsBlockData;
      const cols = data.columns || 2;
      return (
        <div className={`grid gap-6 ${cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {data.children?.map((columnBlocks, colIdx) => (
            <div key={colIdx} className="space-y-4">
              {columnBlocks.map((childBlock) => (
                <BlockRenderer key={childBlock.id} block={childBlock} isPreview={isPreview} />
              ))}
              {columnBlocks.length === 0 && (
                <div className="h-20 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-muted-foreground/40 text-sm">
                  Colonne vide
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    case 'spacer': {
      const data = block.data as SpacerBlockData;
      return <div style={{ height: `${data.height || 40}px` }} />;
    }
    case 'divider': {
      const data = block.data as DividerBlockData;
      return (
        <hr
          className="border-0 border-t-2 border-border mx-auto max-w-2xl"
          style={{
            borderStyle: data.style || 'solid',
            borderColor: data.color || undefined,
          }}
        />
      );
    }
    case 'video': {
      const data = block.data as VideoBlockData;
      const embedUrl = data.url ? getYoutubeEmbedUrl(data.url) : null;
      return (
        <div className="space-y-2">
          {embedUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                title={data.caption || 'Vidéo'}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : data.url ? (
            <video src={data.url} controls className="w-full rounded-lg" />
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Aucune vidéo
            </div>
          )}
          {data.caption && <p className="text-sm text-muted-foreground text-center">{data.caption}</p>}
        </div>
      );
    }
    case 'hero': {
      const data = block.data as HeroBlockData;
      const alignClass = data.align === 'right' ? 'items-end text-right' : data.align === 'center' ? 'items-center text-center' : 'items-start text-left';
      return (
        <div
          className="relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[400px] flex"
          style={{
            backgroundImage: data.backgroundUrl ? `url(${data.backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: data.backgroundUrl ? undefined : 'hsl(var(--muted))',
          }}
        >
          {data.overlay !== false && data.backgroundUrl && (
            <div className="absolute inset-0 bg-black/40" />
          )}
          <div className={`relative z-10 flex flex-col ${alignClass} justify-center p-8 md:p-16 w-full`}>
            {data.title && (
              <h2 className={`text-3xl md:text-5xl font-bold ${data.backgroundUrl ? 'text-white' : 'text-foreground'} mb-4`}>
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className={`text-lg md:text-xl ${data.backgroundUrl ? 'text-white/80' : 'text-muted-foreground'} mb-6 max-w-xl`}>
                {data.subtitle}
              </p>
            )}
            {data.buttonLabel && (
              isPreview ? (
                <span className="inline-flex items-center px-8 py-3 rounded-lg font-medium bg-primary text-primary-foreground">
                  {data.buttonLabel}
                </span>
              ) : (
                <a href={data.buttonLink || '#'} className="inline-flex items-center px-8 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  {data.buttonLabel}
                </a>
              )
            )}
          </div>
        </div>
      );
    }
    case 'contact_form': {
      return <ContactFormRenderer block={block} isPreview={isPreview} />;
    }
    case 'key_points': {
      return <KeyPointsRenderer block={block} />;
    }
    default:
      return null;
  }
}

function ContactFormRenderer({ block, isPreview }: { block: PageBlock; isPreview?: boolean }) {
  const data = block.data as ContactFormBlockData;
  const customFields = data.customFields || [];
  const [form, setForm] = useState<Record<string, string>>({ name: '', email: '', phone: '', message: '' });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [sending, setSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      toast.info('Aperçu : le formulaire ne sera pas envoyé');
      return;
    }
    if (!form.name?.trim() || !form.email?.trim() || !form.message?.trim()) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    for (const field of customFields) {
      if (field.required) {
        if (field.type === 'file') {
          if (!files[`custom_${field.id}`]) {
            toast.error(`Le champ "${field.label}" est requis`);
            return;
          }
        } else if (!form[`custom_${field.id}`]?.trim()) {
          toast.error(`Le champ "${field.label}" est requis`);
          return;
        }
      }
    }
    setSending(true);

    if (data.confirmationMessage) {
      setShowConfirmation(true);
    } else {
      toast.success('Message envoyé avec succès !');
    }
    setForm({ name: '', email: '', phone: '', message: '' });
    setFiles({});
    setSending(false);
  };

  const wrapper = data.cardStyle !== false
    ? 'max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm'
    : 'max-w-2xl mx-auto';

  return (
    <div className={wrapper}>
      {data.title && <h3 className="text-2xl font-bold mb-2 text-foreground">{data.title}</h3>}
      {data.subtitle && <p className="text-muted-foreground mb-6">{data.subtitle}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nom *</Label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Votre nom" required />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" required />
          </div>
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+216 XX XXX XXX" />
        </div>
        <div>
          <Label>Message *</Label>
          <Textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Votre message..." rows={5} required />
        </div>

        {customFields.map((field) => (
          <div key={field.id}>
            <Label>{field.label} {field.required && '*'}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={form[`custom_${field.id}`] || ''}
                onChange={(e) => setForm(f => ({ ...f, [`custom_${field.id}`]: e.target.value }))}
                placeholder={field.placeholder}
                required={field.required}
                rows={3}
              />
            ) : field.type === 'select' ? (
              <Select value={form[`custom_${field.id}`] || ''} onValueChange={(v) => setForm(f => ({ ...f, [`custom_${field.id}`]: v }))}>
                <SelectTrigger><SelectValue placeholder={field.placeholder || 'Sélectionner...'} /></SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'file' ? (
              <Input
                type="file"
                onChange={(e) => setFiles(f => ({ ...f, [`custom_${field.id}`]: e.target.files?.[0] || null }))}
                required={field.required}
              />
            ) : (
              <Input
                type={field.type}
                value={form[`custom_${field.id}`] || ''}
                onChange={(e) => setForm(f => ({ ...f, [`custom_${field.id}`]: e.target.value }))}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}

        <Button type="submit" disabled={sending} className="w-full md:w-auto">
          {data.buttonLabel || 'Envoyer'}
        </Button>
      </form>

      {/* Confirmation popup */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-3">
              <CheckCircle className="w-12 h-12 text-green-500" />
              Envoyé !
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground whitespace-pre-line">{data.confirmationMessage}</p>
          <Button onClick={() => setShowConfirmation(false)} className="mt-2">Fermer</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KeyPointsRenderer({ block }: { block: PageBlock }) {
  const data = block.data as KeyPointsBlockData;
  const items = data.items || [];
  const cols = data.columns || 3;
  const colsClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }[cols] || 'grid-cols-2 md:grid-cols-3';

  // Palette de bleus pour varier les cartes
  const blueVariants = [
    { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
    { border: 'border-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50' },
    { border: 'border-cyan-500', text: 'text-cyan-600', bg: 'bg-cyan-50' },
    { border: 'border-sky-500', text: 'text-sky-600', bg: 'bg-sky-50' },
  ];

  const displayStyle = data.displayStyle || 'bullet';
  const showIcons = data.showIcons !== false;

  const renderBullet = (small: boolean = false, colorClass: string = 'text-blue-600') => {
    const baseClass = small ? 'w-3 h-3' : 'w-4 h-4';
    switch (displayStyle) {
      case 'check': return <Check className={`${baseClass} ${colorClass}`} />;
      case 'arrow': return <ChevronRight className={`${baseClass} ${colorClass}`} />;
      case 'star': return <Star className={`${baseClass} ${colorClass}`} />;
      default: return <div className={`${small ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full ${colorClass.replace('text', 'bg')}`} />;
    }
  };

  return (
   <div className={`grid ${colsClass} gap-6 md:gap-8`}>
  {items.map((item, index) => {
    const variant = blueVariants[index % blueVariants.length];
    const titleColor = variant.text;
    const borderColor = variant.border;
    const bgColor = variant.bg;
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ y: -8 }}
        className="group"
      >
        <div
          className={`
            ${data.cardStyle !== false 
              ? `relative overflow-hidden ${bgColor} border-2 ${borderColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-opacity-100` 
              : 'p-4 hover:bg-muted/30 rounded-xl transition-all duration-300'
            }
          `}
        >
          {/* Effet de brillance au hover */}
          {data.cardStyle !== false && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          )}
          
          {/* Contenu principal */}
          <div className="relative z-10">
            {/* Titre avec icône */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${data.cardStyle !== false 
                  ? `${bgColor} group-hover:scale-110 group-hover:shadow-md` 
                  : ''
                }
              `}>
                {showIcons && item.iconUrl ? (
                  <img 
                    src={item.iconUrl} 
                    alt="" 
                    className="w-7 h-7 object-contain" 
                  />
                ) : (
                  renderBullet(false, titleColor)
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`
                  font-serif text-xl font-semibold tracking-tight transition-all duration-300
                  ${data.cardStyle !== false 
                    ? `${titleColor} group-hover:brightness-110 group-hover:translate-x-1` 
                    : 'text-foreground group-hover:text-primary'
                  }
                `}>
                  {item.title}
                </h4>
              </div>
            </div>

            {/* Description en liste */}
            {item.description && (
              <div className="pl-4 border-l-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                <ul className="space-y-3">
                  {item.description.split('\n').map((line, i) => (
                    line.trim() && (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 mt-0.5">
                          {renderBullet(true, titleColor)}
                        </span>
                        <span className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                          {line}
                        </span>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}

            {/* Ligne décorative animée */}
            {data.cardStyle !== false && (
              <div className="mt-6 h-0.5 w-12 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full group-hover:w-full transition-all duration-500" />
            )}
          </div>
        </div>
      </motion.div>
    );
  })}
</div>
  );
}