import {
  Layout,
  Box,
  Columns,
  Heading,
  Type,
  FileText,
  MousePointer,
  Image as ImageIcon,
  Minus,
  Maximize2,
  Images,
  Video,
  ShoppingBag,
  Sparkles,
  Grid,
  Sliders,
  SlidersHorizontal,
  Flame,
  HelpCircle,
  MessageSquareQuote,
  Mail,
  Code
} from 'lucide-react';
import { PageBuilderSection, PageBuilderSectionType } from '../../types/pageBuilder.ts';

export interface ElementDefinition {
  type: PageBuilderSectionType;
  label: string;
  category: 'layout' | 'basic' | 'media' | 'ecommerce' | 'content';
  icon: any;
  description: string;
  defaultSettings: Record<string, any>;
}

export const ELEMENT_CATEGORIES = [
  { id: 'layout', label: 'Layout' },
  { id: 'basic', label: 'Basic' },
  { id: 'media', label: 'Media' },
  { id: 'ecommerce', label: 'Ecommerce' },
  { id: 'content', label: 'Content' }
] as const;

export const BUILDER_ELEMENTS: ElementDefinition[] = [
  // Layout
  {
    type: 'section',
    label: 'Section',
    category: 'layout',
    icon: Layout,
    description: 'Full-width structural container for content blocks.',
    defaultSettings: {
      paddingTop: '48px',
      paddingBottom: '48px',
      paddingLeft: '24px',
      paddingRight: '24px',
      backgroundColor: '#FFFFFF',
      backgroundImage: '',
      contentWidth: 'boxed',
      maxWidth: '1280px',
      minHeight: '0px',
      borderWidth: '0px',
      borderColor: '#E5E5E5',
      borderStyle: 'none',
      borderRadius: '0px',
      boxShadow: 'none',
      overflow: 'visible'
    }
  },
  {
    type: 'container',
    label: 'Container',
    category: 'layout',
    icon: Box,
    description: 'Constrained width wrapper with custom padding.',
    defaultSettings: {
      paddingTop: '32px',
      paddingBottom: '32px',
      paddingLeft: '16px',
      paddingRight: '16px',
      backgroundColor: 'transparent',
      backgroundImage: '',
      contentWidth: 'boxed',
      maxWidth: '1024px',
      minHeight: '0px',
      borderWidth: '0px',
      borderColor: '#E5E5E5',
      borderStyle: 'none',
      borderRadius: '0px',
      boxShadow: 'none',
      overflow: 'visible'
    }
  },
  {
    type: 'columns',
    label: 'Columns',
    category: 'layout',
    icon: Columns,
    description: 'Multi-column grid layout for side-by-side elements.',
    defaultSettings: {
      columnCount: 2,
      gap: '24px',
      col1Text: 'First column content or highlight description.',
      col2Text: 'Second column details, feature list, or image.',
      col3Text: 'Third column additional information.'
    }
  },

  // Basic
  {
    type: 'heading',
    label: 'Heading',
    category: 'basic',
    icon: Heading,
    description: 'Editorial typographic heading for titles and sections.',
    defaultSettings: {
      text: 'Artisanal Luxury Pret & Couture',
      level: 'h2',
      fontFamily: 'serif',
      fontSize: '32px',
      fontWeight: '700',
      color: '#141414',
      alignment: 'center',
      lineHeight: '1.25',
      letterSpacing: '-0.02em',
      textTransform: 'none',
      maxWidth: '100%'
    }
  },
  {
    type: 'text',
    label: 'Text',
    category: 'basic',
    icon: Type,
    description: 'Standard paragraph with clean luxury typography.',
    defaultSettings: {
      content: 'Experience authentic South Asian artistry and timeless silhouettes designed for memorable celebrations.',
      fontFamily: 'sans',
      fontSize: '14px',
      fontWeight: '400',
      color: '#404040',
      alignment: 'center',
      lineHeight: '1.6',
      letterSpacing: '0em',
      textTransform: 'none',
      paragraphSpacing: '16px'
    }
  },
  {
    type: 'rich_text',
    label: 'Rich Text',
    category: 'basic',
    icon: FileText,
    description: 'Formatted narrative block with title and body.',
    defaultSettings: {
      title: 'Our Heritage & Design Philosophy',
      content: 'Each garment is hand-embellished by master artisans using generations-old zardozi, dabka, and resham threadwork.',
      fontFamily: 'serif',
      fontSize: '14px',
      color: '#404040',
      alignment: 'center',
      layout: 'centered'
    }
  },
  {
    type: 'button',
    label: 'Button',
    category: 'basic',
    icon: MousePointer,
    description: 'Interactive call-to-action button.',
    defaultSettings: {
      label: 'Explore Collection',
      linkUrl: '/collections',
      linkTarget: '_self',
      variant: 'solid',
      backgroundColor: '#141414',
      textColor: '#FFFFFF',
      fontSize: '12px',
      fontWeight: '600',
      paddingX: '24px',
      paddingY: '12px',
      borderWidth: '1px',
      borderColor: '#141414',
      borderRadius: '12px',
      alignment: 'center',
      fullWidth: false
    }
  },
  {
    type: 'image',
    label: 'Image',
    category: 'basic',
    icon: ImageIcon,
    description: 'High-resolution editorial image with alt text.',
    defaultSettings: {
      imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85',
      altText: 'LAAM Luxury Couture Showcase',
      width: '100%',
      maxWidth: '800px',
      maxHeight: '480px',
      aspectRatio: 'auto',
      objectFit: 'cover',
      borderRadius: '16px',
      alignment: 'center',
      linkUrl: ''
    }
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'basic',
    icon: Minus,
    description: 'Subtle separator line between sections.',
    defaultSettings: {
      width: '100%',
      thickness: '1px',
      color: '#E5E5E5',
      style: 'solid',
      alignment: 'center',
      margin: '32px'
    }
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'basic',
    icon: Maximize2,
    description: 'Adjustable vertical blank spacing.',
    defaultSettings: {
      height: '40px'
    }
  },

  // Media
  {
    type: 'image_gallery',
    label: 'Image Gallery',
    category: 'media',
    icon: Images,
    description: 'Curated 3-image editorial showcase grid.',
    defaultSettings: {
      heading: 'Visual Lookbook',
      images: [
        'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80'
      ]
    }
  },
  {
    type: 'video',
    label: 'Video',
    category: 'media',
    icon: Video,
    description: 'Embedded brand video or campaign reel.',
    defaultSettings: {
      heading: 'Craftsmanship in Motion',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      caption: 'Inside our Lahore couture atelier.'
    }
  },

  // Ecommerce
  {
    type: 'product_grid',
    label: 'Product Grid',
    category: 'ecommerce',
    icon: ShoppingBag,
    description: 'Grid of featured luxury items from the store catalog.',
    defaultSettings: {
      heading: 'Trending Ready to Ship Pret',
      category: 'all',
      itemCount: 4,
      columns: 4
    }
  },
  {
    type: 'featured_product',
    label: 'Featured Product',
    category: 'ecommerce',
    icon: Sparkles,
    description: 'Detailed showcase of a standout couture garment.',
    defaultSettings: {
      heading: 'Colleague Spotlight',
      productId: 'pd-formal-26-265-pret-kaftan-collection',
      productName: 'PD Formal \'26 Embellished Silk Kaftan',
      priceUSD: 195,
      imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85'
    }
  },
  {
    type: 'collection_grid',
    label: 'Collection Grid',
    category: 'ecommerce',
    icon: Grid,
    description: 'Browse cards linking to curated collections.',
    defaultSettings: {
      heading: 'Explore Luxury Curations',
      collections: [
        { title: 'Luxury Pret', handle: 'luxury-pret', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80' },
        { title: 'Festive Formals', handle: 'festive-formals', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80' },
        { title: 'Bridal Couture', handle: 'bridal-couture', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80' }
      ]
    }
  },
  {
    type: 'product_carousel',
    label: 'Product Carousel',
    category: 'ecommerce',
    icon: SlidersHorizontal,
    description: 'Horizontal sliding showcase of bestsellers.',
    defaultSettings: {
      heading: 'New Arrivals · Spring & Festive 2026',
      category: 'pret'
    }
  },

  // Content
  {
    type: 'hero',
    label: 'Hero Banner',
    category: 'content',
    icon: Flame,
    description: 'Full-bleed luxury banner with title, subtitle, and CTA.',
    defaultSettings: {
      heading: 'Royal Festive Edit 2026',
      subheading: 'Pure silk kaftans, handcrafted zardozi, and luminous velvet kalidars.',
      alignment: 'center',
      minHeight: '440px',
      overlayOpacity: 0.4,
      backgroundImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85',
      buttonText: 'Discover The Edit',
      buttonLink: '/collections'
    }
  },
  {
    type: 'image_with_text',
    label: 'Image with Text',
    category: 'content',
    icon: Layout,
    description: 'Split editorial banner with visual asset and narrative.',
    defaultSettings: {
      heading: 'Handcrafted With Heritage',
      text: 'Every stitch tells a story of century-old subcontinental heritage, re-imagined for the contemporary global muse.',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      imagePosition: 'left', // 'left' | 'right'
      buttonText: 'Learn More',
      buttonLink: '/collections'
    }
  },
  {
    type: 'faq',
    label: 'FAQ Accordion',
    category: 'content',
    icon: HelpCircle,
    description: 'Collapsible frequently asked questions for policies and sizing.',
    defaultSettings: {
      heading: 'Frequently Asked Questions',
      items: [
        { q: 'How long does custom stitching take?', a: 'Bespoke couture typically takes 2-3 weeks for handcrafted embroidery and tailoring.' },
        { q: 'Do you offer worldwide express shipping?', a: 'Yes, we provide DHL Express shipping worldwide with doorstep tracking.' },
        { q: 'How do I determine my size?', a: 'Refer to our Global Size Guide or connect with our AI Concierge stylist for assistance.' }
      ]
    }
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    category: 'content',
    icon: MessageSquareQuote,
    description: 'Customer praise and high-society endorsements.',
    defaultSettings: {
      heading: 'Loved by Patrons Worldwide',
      quote: 'The zardozi work is beyond breathtaking. The fabric quality and fit exceeded all expectations for my sister’s wedding.',
      author: 'Dr. Fatima R.',
      location: 'London, United Kingdom',
      rating: 5
    }
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    category: 'content',
    icon: Mail,
    description: 'Email capture card with VIP discount announcement.',
    defaultSettings: {
      heading: 'Join the LAAM Inner Circle',
      subheading: 'Receive private invitations to couture launches and 10% off your first luxury order.',
      buttonText: 'Subscribe',
      placeholder: 'Enter your email address'
    }
  }
];

/**
 * Creates a new section instance with a unique stable ID and default settings.
 */
export function createSectionInstance(type: PageBuilderSectionType): PageBuilderSection {
  const def = BUILDER_ELEMENTS.find(e => e.type === type);
  const stableId = `sec-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  // Default blocks for layout containers
  let initialBlocks: any[] | undefined = undefined;
  if (type === 'container') {
    initialBlocks = [
      createBlockInstance('heading'),
      createBlockInstance('text')
    ];
  } else if (type === 'columns') {
    initialBlocks = [
      createBlockInstance('heading'),
      createBlockInstance('button')
    ];
  }

  return {
    id: stableId,
    type,
    title: def ? def.label : type.replace(/_/g, ' '),
    disabled: false,
    settings: def ? JSON.parse(JSON.stringify(def.defaultSettings)) : {},
    blocks: initialBlocks
  };
}

/**
 * Creates a new block instance for nesting inside containers or sections.
 */
export function createBlockInstance(type: string): any {
  const def = BUILDER_ELEMENTS.find(e => e.type === type);
  const stableId = `blk-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  return {
    id: stableId,
    type,
    title: def ? def.label : type.replace(/_/g, ' '),
    disabled: false,
    settings: def ? JSON.parse(JSON.stringify(def.defaultSettings)) : {}
  };
}

/**
 * Safely duplicates a section with completely fresh IDs for itself and all nested blocks.
 */
export function duplicateSectionInstance(section: PageBuilderSection): PageBuilderSection {
  const cloned = JSON.parse(JSON.stringify(section));
  const newSecId = `sec-${cloned.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  let newBlocks: any[] | undefined = undefined;
  if (Array.isArray(cloned.blocks)) {
    newBlocks = cloned.blocks.map((blk: any) => ({
      ...blk,
      id: `blk-${blk.type || 'item'}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: blk.title ? `${blk.title} (Copy)` : undefined
    }));
  }

  return {
    ...cloned,
    id: newSecId,
    title: `${cloned.title || cloned.type} (Copy)`,
    blocks: newBlocks
  };
}

/**
 * Safely duplicates a nested block with a fresh ID.
 */
export function duplicateBlockInstance(block: any): any {
  const cloned = JSON.parse(JSON.stringify(block));
  return {
    ...cloned,
    id: `blk-${cloned.type || 'item'}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${cloned.title || cloned.type} (Copy)`
  };
}
