export type PageBuilderSectionType =
  // Layout
  | 'section'
  | 'container'
  | 'columns'
  // Basic
  | 'heading'
  | 'text'
  | 'rich_text'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer'
  // Media
  | 'image_gallery'
  | 'video'
  // Ecommerce
  | 'product_grid'
  | 'featured_product'
  | 'collection_grid'
  | 'product_carousel'
  // Content
  | 'hero'
  | 'banner'
  | 'image_with_text'
  | 'faq'
  | 'testimonials'
  | 'newsletter'
  | 'trust_signals'
  | 'custom_html';

export interface PageBuilderBlock {
  id: string;
  type: string;
  title?: string;
  disabled?: boolean;
  settings: Record<string, any>;
}

export interface PageBuilderSection {
  id: string;
  type: PageBuilderSectionType | string;
  title?: string;
  disabled?: boolean;
  settings: Record<string, any>;
  blocks?: PageBuilderBlock[];
}

export interface PageBuilderData {
  schemaVersion: number;
  sections: PageBuilderSection[];
  globalStyles?: {
    maxWidth?: string;
    paddingY?: string;
    backgroundColor?: string;
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  meta?: {
    lastEditedDevice?: 'desktop' | 'tablet' | 'mobile';
    customCss?: string;
    [key: string]: any;
  };
}

export interface StorePage {
  id: string;
  title: string;
  handle: string;
  type: 'page' | 'landing' | 'policy' | 'blog' | string;
  content: string;
  builderContent: PageBuilderData | null;
  publishedContent: PageBuilderData | null;
  status: 'Draft' | 'Published' | 'Archived';
  version: number;
  seoTitle?: string;
  seoDescription?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface PageVersionRecord {
  id: number | string;
  pageId: string;
  version: number;
  title: string;
  builderContent: PageBuilderData | null;
  content: string;
  status: string;
  changeSummary?: string;
  createdBy?: string;
  createdAt: string;
}

/**
 * Validates a PageBuilderData payload.
 * Returns { valid: boolean, error?: string, sanitized?: PageBuilderData }
 */
export function validatePageBuilderData(data: any): { valid: boolean; error?: string; sanitized?: PageBuilderData } {
  if (!data || typeof data !== 'object') {
    return {
      valid: true,
      sanitized: {
        schemaVersion: 1,
        sections: []
      }
    };
  }

  const schemaVersion = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;
  const rawSections = Array.isArray(data.sections) ? data.sections : [];

  const sanitizedSections: PageBuilderSection[] = [];
  for (let i = 0; i < rawSections.length; i++) {
    const s = rawSections[i];
    if (!s || typeof s !== 'object') continue;
    const secId = typeof s.id === 'string' && s.id.trim() ? s.id.trim() : `sec-${Date.now()}-${i}`;
    const secType = typeof s.type === 'string' && s.type.trim() ? s.type.trim() : 'rich_text';
    const settings = typeof s.settings === 'object' && s.settings !== null ? s.settings : {};
    const disabled = Boolean(s.disabled);
    
    let blocks: PageBuilderBlock[] | undefined = undefined;
    if (Array.isArray(s.blocks)) {
      blocks = s.blocks.map((b: any, bIdx: number) => ({
        id: typeof b?.id === 'string' && b.id.trim() ? b.id.trim() : `blk-${secId}-${bIdx}`,
        type: typeof b?.type === 'string' ? b.type : 'block',
        title: typeof b?.title === 'string' ? b.title : undefined,
        disabled: Boolean(b?.disabled),
        settings: typeof b?.settings === 'object' && b.settings !== null ? b.settings : {}
      }));
    }

    sanitizedSections.push({
      id: secId,
      type: secType,
      title: s.title || undefined,
      disabled,
      settings,
      blocks
    });
  }

  return {
    valid: true,
    sanitized: {
      schemaVersion,
      sections: sanitizedSections,
      globalStyles: typeof data.globalStyles === 'object' && data.globalStyles !== null ? data.globalStyles : undefined,
      meta: typeof data.meta === 'object' && data.meta !== null ? data.meta : undefined
    }
  };
}
