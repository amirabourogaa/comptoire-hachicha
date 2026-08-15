export type BlockType = 'text' | 'image' | 'button' | 'columns' | 'spacer' | 'divider' | 'video' | 'hero' | 'contact_form' | 'key_points';

export interface TextBlockData {
  content: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fontStyle?: 'normal' | 'italic';
  fontWeight?: 'normal' | 'medium' | 'bold';
  textColor?: string;
}

export interface ImageBlockData {
  url: string;
  alt: string;
  width?: 'full' | 'medium' | 'small';
  rectangleSize?: 'banner' | 'small' | 'medium' | 'large' | 'hero' | 'full';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ButtonBlockData {
  label: string;
  link: string;
  variant?: 'primary' | 'outline' | 'ghost';
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export interface ColumnsBlockData {
  columns: number; // 2 or 3
  children: PageBlock[][];
}

export interface SpacerBlockData {
  height: number; // px
}

export interface DividerBlockData {
  style: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export interface VideoBlockData {
  url: string; // YouTube or direct URL
  caption?: string;
}

export interface HeroBlockData {
  title: string;
  subtitle?: string;
  backgroundUrl?: string;
  buttonLabel?: string;
  buttonLink?: string;
  align?: 'left' | 'center' | 'right';
  overlay?: boolean;
}

export interface ContactFormBlockData {
  title?: string;
  subtitle?: string;
  fields?: ('name' | 'email' | 'phone' | 'message')[];
  customFields?: CustomFormField[];
  buttonLabel?: string;
  recipientEmail?: string;
  cardStyle?: boolean;
  confirmationMessage?: string;
}

export interface CustomFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select type
}

export interface KeyPointItem {
  id: string;
  iconUrl: string;
  title: string;
  description?: string;
}

export interface KeyPointsBlockData {
  items: KeyPointItem[];
  columns?: 2 | 3 | 4;
  align?: 'left' | 'center';
  cardStyle?: boolean;
  displayStyle?: 'bullet' | 'check' | 'arrow' | 'star';
  showIcons?: boolean;
}

// Cover style options (global default or per-page override)
export interface CoverStyleOptions {
  height?: 'sm' | 'md' | 'lg' | 'xl';
  overlayOpacity?: number; // 0-100
  overlayColor?: string;
  titleSize?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  titleAlign?: 'left' | 'center' | 'right';
  titleColor?: string;
  subtitleEnabled?: boolean;
  subtitle?: string;
  textShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontFamily?: 'sans' | 'serif' | 'mono';
  animation?: 'none' | 'fade' | 'slide' | 'scale' | 'bounce' | 'pulse';
  showBadge?: boolean;
  badgeText?: string;
  showCta?: boolean;
  ctaText?: string;
  ctaLink?: string;
  showScrollIndicator?: boolean;
  showStats?: boolean;
}

export interface PageBlock {
  id: string;
  type: BlockType;
  data: TextBlockData | ImageBlockData | ButtonBlockData | ColumnsBlockData | SpacerBlockData | DividerBlockData | VideoBlockData | HeroBlockData | ContactFormBlockData | KeyPointsBlockData;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  blocks: PageBlock[];
  is_published: boolean;
  show_in_navbar: boolean;
  navbar_label: string | null;
  cover_image_url: string | null;
  cover_style?: CoverStyleOptions | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}
