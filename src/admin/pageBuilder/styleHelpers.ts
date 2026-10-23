import React from 'react';
import { PageBuilderSection, PageBuilderBlock } from '../../types/pageBuilder.ts';

export type DeviceViewport = 'desktop' | 'tablet' | 'mobile';

export const RESPONSIVE_PROPERTY_KEYS = [
  'fontSize',
  'alignment',
  'lineHeight',
  'letterSpacing',
  'width',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingY',
  'paddingX',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'columnCount',
  'gap',
  'borderRadius',
  'objectFit',
  'aspectRatio',
  'fullWidthMobile',
  'hideOnDesktop',
  'hideOnTablet',
  'hideOnMobile'
] as const;

export type ResponsivePropertyKey = (typeof RESPONSIVE_PROPERTY_KEYS)[number];

/**
 * Shared style resolvers between the Visual Builder Canvas and the Storefront CustomPage.
 * Implements a strict inheritance hierarchy:
 * - Desktop: Base settings
 * - Tablet: Inherits Desktop, overridden by settings.responsive?.tablet
 * - Mobile: Inherits Tablet (which inherits Desktop), overridden by settings.responsive?.mobile
 */

// Helper to ensure dimension has units (e.g. "24" -> "24px")
export function parseDimension(value: any, fallback: string = '0px'): string {
  if (value === undefined || value === null || value === '') return fallback;
  const str = String(value).trim();
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return `${str}px`;
  }
  return str;
}

export function getBoxShadowValue(shadow?: string): string | undefined {
  switch (shadow) {
    case 'sm':
      return '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)';
    case 'md':
      return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    case 'lg':
      return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
    case 'xl':
      return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    default:
      return undefined;
  }
}

export function getFontFamilyValue(font?: string): string {
  switch (font) {
    case 'serif':
      return 'Playfair Display, Georgia, serif';
    case 'mono':
      return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    case 'sans':
    default:
      return 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
}

/**
 * Resolves effective settings for a given target device by applying inheritance.
 */
export function resolveResponsiveSettings(
  settings: Record<string, any> = {},
  device: DeviceViewport = 'desktop'
): Record<string, any> {
  if (!settings || typeof settings !== 'object') return {};

  const base = { ...settings };
  delete base.responsive;

  if (device === 'desktop') {
    return base;
  }

  // Tablet inherits Desktop base, overridden by tablet overrides
  const tabletOverrides = settings.responsive?.tablet || {};
  const tabletMerged = { ...base, ...tabletOverrides };

  if (device === 'tablet') {
    return tabletMerged;
  }

  // Mobile inherits Tablet (which inherited Desktop), overridden by mobile overrides
  const mobileOverrides = settings.responsive?.mobile || {};
  return { ...tabletMerged, ...mobileOverrides };
}

/**
 * Checks if an element is hidden on a given device.
 */
export function isElementHidden(settings: Record<string, any> = {}, device: DeviceViewport = 'desktop'): boolean {
  if (!settings) return false;
  if (device === 'desktop') return Boolean(settings.hideOnDesktop);
  if (device === 'tablet') return Boolean(settings.hideOnTablet || settings.responsive?.tablet?.hideOnTablet);
  if (device === 'mobile') return Boolean(settings.hideOnMobile || settings.responsive?.mobile?.hideOnMobile);
  return false;
}

/**
 * Heading Styles: Resolves H1-H6 typography, colors, spacing, alignments, transformations
 */
export function getHeadingStyles(rawSettings: Record<string, any>, device: DeviceViewport = 'desktop'): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const fontFam = getFontFamilyValue(s.fontFamily || 'serif');

  const defaultSize =
    s.level === 'h1'
      ? (device === 'mobile' ? '28px' : device === 'tablet' ? '32px' : '36px')
      : s.level === 'h3'
      ? '22px'
      : s.level === 'h4'
      ? '18px'
      : s.level === 'h5'
      ? '16px'
      : s.level === 'h6'
      ? '13px'
      : (device === 'mobile' ? '24px' : '28px');

  return {
    fontFamily: fontFam,
    fontSize: parseDimension(s.fontSize, defaultSize),
    fontWeight: s.fontWeight || (s.level === 'h1' || s.level === 'h2' ? '700' : '600'),
    color: s.color || s.textColor || '#141414',
    textAlign: (s.alignment as any) || 'center',
    lineHeight: s.lineHeight || '1.25',
    letterSpacing: s.letterSpacing || (s.fontFamily === 'serif' ? '-0.02em' : 'normal'),
    textTransform: s.textTransform && s.textTransform !== 'none' ? s.textTransform : undefined,
    maxWidth: s.maxWidth && s.maxWidth !== 'none' ? parseDimension(s.maxWidth, '100%') : '100%',
    marginTop: parseDimension(s.marginTop, '0px'),
    marginBottom: parseDimension(s.marginBottom, '0px'),
    wordBreak: 'break-word'
  };
}

/**
 * Paragraph / Text Styles: Resolves typography, margins, paragraph spacing, alignments
 */
export function getParagraphStyles(rawSettings: Record<string, any>, device: DeviceViewport = 'desktop'): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const fontFam = getFontFamilyValue(s.fontFamily || 'sans');

  return {
    fontFamily: fontFam,
    fontSize: parseDimension(s.fontSize, device === 'mobile' ? '13px' : '14px'),
    fontWeight: s.fontWeight || '400',
    color: s.color || s.textColor || '#404040',
    textAlign: (s.alignment as any) || 'center',
    lineHeight: s.lineHeight || '1.6',
    letterSpacing: s.letterSpacing || '0em',
    textTransform: s.textTransform && s.textTransform !== 'none' ? s.textTransform : undefined,
    maxWidth: s.maxWidth && s.maxWidth !== 'none' ? parseDimension(s.maxWidth, '100%') : '100%',
    marginTop: parseDimension(s.marginTop, '0px'),
    marginBottom: parseDimension(s.paragraphSpacing || s.marginBottom, '16px'),
    wordBreak: 'break-word'
  };
}

/**
 * Button Styles: Resolves variant, colors, typography, paddings, borders, radius, width, shadow
 */
export function getButtonStyles(rawSettings: Record<string, any>, device: DeviceViewport = 'desktop'): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const isOutline = s.variant === 'outline';
  const isText = s.variant === 'text';
  const isOrange = s.variant === 'orange';

  const bg =
    isOutline || isText
      ? 'transparent'
      : s.backgroundColor || (isOrange ? '#E04F16' : '#141414');

  const txtColor = isOutline
    ? s.textColor || '#141414'
    : isText
    ? s.textColor || '#141414'
    : s.textColor || '#FFFFFF';

  const borderCol = isOutline
    ? s.borderColor || s.textColor || '#141414'
    : s.borderColor || 'transparent';

  const borderW = isOutline
    ? parseDimension(s.borderWidth, '1px')
    : s.borderWidth && s.borderWidth !== '0px'
    ? parseDimension(s.borderWidth, '1px')
    : '0px';

  const defaultPadY = device === 'mobile' ? '10px' : '12px';
  const defaultPadX = device === 'mobile' ? '18px' : '24px';
  const isFull = Boolean(s.fullWidth || (device === 'mobile' && s.fullWidthMobile));

  return {
    backgroundColor: bg,
    color: txtColor,
    fontFamily: getFontFamilyValue(s.fontFamily || 'sans'),
    fontSize: parseDimension(s.fontSize, '12px'),
    fontWeight: s.fontWeight || '600',
    paddingTop: parseDimension(s.paddingY, defaultPadY),
    paddingBottom: parseDimension(s.paddingY, defaultPadY),
    paddingLeft: parseDimension(s.paddingX, defaultPadX),
    paddingRight: parseDimension(s.paddingX, defaultPadX),
    borderRadius: parseDimension(s.borderRadius, '12px'),
    borderWidth: borderW,
    borderStyle: borderW !== '0px' ? s.borderStyle || 'solid' : 'none',
    borderColor: borderCol,
    width: isFull ? '100%' : 'auto',
    textAlign: 'center',
    display: isFull ? 'block' : 'inline-block',
    boxShadow: getBoxShadowValue(s.boxShadow),
    textDecoration: isText ? 'underline' : 'none',
    transition: 'all 0.2s ease-in-out'
  };
}

/**
 * Image Styles: Resolves max width, max height, object fit, border, shadow, radius
 */
export function getImageStyles(rawSettings: Record<string, any>, device: DeviceViewport = 'desktop'): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const defaultMaxHeight = device === 'mobile' ? '300px' : device === 'tablet' ? '400px' : '480px';

  return {
    width: parseDimension(s.width, '100%'),
    maxWidth: s.maxWidth && s.maxWidth !== 'none' ? parseDimension(s.maxWidth, '800px') : '100%',
    maxHeight: s.maxHeight && s.maxHeight !== 'none' ? parseDimension(s.maxHeight, defaultMaxHeight) : undefined,
    objectFit: (s.objectFit as any) || 'cover',
    borderRadius: parseDimension(s.borderRadius, device === 'mobile' ? '12px' : '16px'),
    borderWidth: s.borderWidth && s.borderWidth !== '0px' ? parseDimension(s.borderWidth, '0px') : '0px',
    borderColor: s.borderColor || '#E5E5E5',
    borderStyle: s.borderWidth && s.borderWidth !== '0px' ? s.borderStyle || 'solid' : 'none',
    boxShadow: getBoxShadowValue(s.boxShadow),
    aspectRatio: s.aspectRatio && s.aspectRatio !== 'auto' ? s.aspectRatio : undefined,
    display: 'block',
    margin:
      s.alignment === 'left'
        ? '0 auto 0 0'
        : s.alignment === 'right'
        ? '0 0 0 auto'
        : '0 auto'
  };
}

/**
 * Section & Container Styles: Resolves full/boxed widths, 4-sided paddings/margins, borders, shadow, backgrounds
 */
export function getContainerStyles(
  rawSettings: Record<string, any>,
  isSection: boolean = false,
  device: DeviceViewport = 'desktop'
): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const isFull = s.contentWidth === 'full';
  const defaultMax = isSection ? '1280px' : '1024px';

  // Responsive padding defaults
  const defaultPadY = isSection
    ? (device === 'mobile' ? '28px' : device === 'tablet' ? '36px' : '48px')
    : (device === 'mobile' ? '20px' : device === 'tablet' ? '24px' : '32px');

  const defaultPadX = isSection
    ? (device === 'mobile' ? '16px' : device === 'tablet' ? '20px' : '24px')
    : (device === 'mobile' ? '12px' : device === 'tablet' ? '16px' : '16px');

  const padTop = parseDimension(s.paddingTop || s.paddingY, defaultPadY);
  const padBottom = parseDimension(s.paddingBottom || s.paddingY, defaultPadY);
  const padLeft = parseDimension(s.paddingLeft || s.paddingX, defaultPadX);
  const padRight = parseDimension(s.paddingRight || s.paddingX, defaultPadX);

  const marTop = parseDimension(s.marginTop, '0px');
  const marBottom = parseDimension(s.marginBottom, '0px');
  const marLeft = parseDimension(s.marginLeft, 'auto');
  const marRight = parseDimension(s.marginRight, 'auto');

  const borderW = s.borderWidth && s.borderWidth !== '0px' ? parseDimension(s.borderWidth, '1px') : '0px';

  return {
    width: '100%',
    maxWidth: isFull ? '100%' : parseDimension(s.maxWidth, defaultMax),
    minHeight: s.minHeight && s.minHeight !== '0px' ? parseDimension(s.minHeight, '0px') : undefined,
    paddingTop: padTop,
    paddingBottom: padBottom,
    paddingLeft: padLeft,
    paddingRight: padRight,
    marginTop: marTop,
    marginBottom: marBottom,
    marginLeft: isFull ? '0px' : marLeft,
    marginRight: isFull ? '0px' : marRight,
    backgroundColor: s.backgroundColor !== 'transparent' && s.backgroundColor ? s.backgroundColor : undefined,
    backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderWidth: borderW,
    borderColor: s.borderColor || '#E5E5E5',
    borderStyle: borderW !== '0px' ? s.borderStyle || 'solid' : 'none',
    borderRadius: parseDimension(s.borderRadius, '0px'),
    boxShadow: getBoxShadowValue(s.boxShadow),
    overflow: (s.overflow as any) || 'visible',
    position: 'relative'
  };
}

/**
 * Universal Section & Widget Wrapper Styles:
 * Resolves padding, margin, background color/image, border, radius, shadow, maxWidth, minHeight
 * so ANY element can have Elementor-grade styling.
 */
export function getUniversalWidgetStyles(
  rawSettings: Record<string, any>,
  device: DeviceViewport = 'desktop',
  defaultMaxWidth: string = '100%'
): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const padTop = parseDimension(s.paddingTop || s.paddingY, '0px');
  const padBottom = parseDimension(s.paddingBottom || s.paddingY, '0px');
  const padLeft = parseDimension(s.paddingLeft || s.paddingX, '0px');
  const padRight = parseDimension(s.paddingRight || s.paddingX, '0px');

  const marTop = parseDimension(s.marginTop, '0px');
  const marBottom = parseDimension(s.marginBottom, '0px');
  const marLeft = parseDimension(s.marginLeft, 'auto');
  const marRight = parseDimension(s.marginRight, 'auto');

  const borderW = s.borderWidth && s.borderWidth !== '0px' ? parseDimension(s.borderWidth, '0px') : '0px';

  return {
    width: parseDimension(s.width, '100%'),
    maxWidth: s.maxWidth && s.maxWidth !== 'none' ? parseDimension(s.maxWidth, defaultMaxWidth) : defaultMaxWidth,
    minHeight: s.minHeight && s.minHeight !== '0px' ? parseDimension(s.minHeight, '0px') : undefined,
    maxHeight: s.maxHeight && s.maxHeight !== 'none' ? parseDimension(s.maxHeight) : undefined,
    paddingTop: padTop !== '0px' ? padTop : undefined,
    paddingBottom: padBottom !== '0px' ? padBottom : undefined,
    paddingLeft: padLeft !== '0px' ? padLeft : undefined,
    paddingRight: padRight !== '0px' ? padRight : undefined,
    marginTop: marTop !== '0px' ? marTop : undefined,
    marginBottom: marBottom !== '0px' ? marBottom : undefined,
    marginLeft: s.contentWidth === 'full' ? '0px' : marLeft,
    marginRight: s.contentWidth === 'full' ? '0px' : marRight,
    backgroundColor: s.backgroundColor && s.backgroundColor !== 'transparent' ? s.backgroundColor : undefined,
    backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
    backgroundSize: s.backgroundSize || 'cover',
    backgroundPosition: s.backgroundPosition || 'center',
    backgroundRepeat: 'no-repeat',
    borderWidth: borderW !== '0px' ? borderW : undefined,
    borderColor: s.borderColor || '#E5E5E5',
    borderStyle: borderW !== '0px' ? s.borderStyle || 'solid' : undefined,
    borderRadius: s.borderRadius && s.borderRadius !== '0px' ? parseDimension(s.borderRadius) : undefined,
    boxShadow: getBoxShadowValue(s.boxShadow),
    overflow: (s.overflow as any) || undefined,
    zIndex: s.zIndex !== undefined && s.zIndex !== '' ? Number(s.zIndex) : undefined,
    position: 'relative'
  };
}

/**
 * Divider Styles: Resolves thickness, color, style, width, margins, alignment
 */
export function getDividerStyles(rawSettings: Record<string, any>, device: DeviceViewport = 'desktop'): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const marginY = parseDimension(s.margin, device === 'mobile' ? '20px' : '32px');
  return {
    width: parseDimension(s.width, '100%'),
    borderTopWidth: parseDimension(s.thickness, '1px'),
    borderTopColor: s.color || '#E5E5E5',
    borderTopStyle: (s.style as any) || 'solid',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    marginTop: marginY,
    marginBottom: marginY,
    marginLeft: s.alignment === 'right' ? 'auto' : s.alignment === 'center' ? 'auto' : '0',
    marginRight: s.alignment === 'left' ? 'auto' : s.alignment === 'center' ? 'auto' : '0'
  };
}

/**
 * Spacer Styles: Resolves height
 */
export function getSpacerStyles(rawSettings: Record<string, any>, device: DeviceViewport = 'desktop'): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const defaultHeight = device === 'mobile' ? '24px' : device === 'tablet' ? '32px' : '40px';
  return {
    height: parseDimension(s.height, defaultHeight),
    width: '100%',
    display: 'block'
  };
}

/**
 * Columns Grid Styles: Resolves column count, gap, vertical alignment for device
 */
export function getColumnsGridStyles(rawSettings: Record<string, any>, device: DeviceViewport = 'desktop'): React.CSSProperties {
  const s = resolveResponsiveSettings(rawSettings, device);
  const defaultCols = device === 'mobile' ? 1 : device === 'tablet' ? 2 : (Number(s.columnCount) || 2);
  const cols = Number(s.columnCount) || defaultCols;
  const gap = parseDimension(s.gap, device === 'mobile' ? '16px' : '24px');

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap: gap,
    alignItems: s.verticalAlign || 'stretch',
    width: '100%'
  };
}

/**
 * Alignment helper classes for flex layouts
 */
export function getFlexJustifyClass(alignment?: string): string {
  switch (alignment) {
    case 'left':
      return 'justify-start text-left';
    case 'right':
      return 'justify-end text-right';
    case 'space-between':
      return 'justify-between';
    case 'center':
    default:
      return 'justify-center text-center';
  }
}

export function getFlexItemsClass(vAlign?: string): string {
  switch (vAlign) {
    case 'top':
      return 'items-start';
    case 'bottom':
      return 'items-end';
    case 'stretch':
      return 'items-stretch';
    case 'center':
    default:
      return 'items-center';
  }
}

/**
 * Generates scoped CSS with media queries for storefront and live preview.
 * Maps tablet (max-width: 1024px) and mobile (max-width: 640px) overrides safely.
 */
export function generateResponsiveCss(sections: PageBuilderSection[]): string {
  if (!Array.isArray(sections) || sections.length === 0) return '';

  const desktopRules: string[] = [];
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];

  const processItem = (id: string, s: Record<string, any>) => {
    if (!id || !s) return;
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '');

    // Desktop visibility
    if (s.hideOnDesktop) {
      desktopRules.push(`#${cleanId} { display: none !important; }`);
    }

    // Tablet overrides
    const tablet = s.responsive?.tablet || {};
    const tRules: string[] = [];
    if (s.hideOnTablet || tablet.hideOnTablet) {
      tRules.push('display: none !important;');
    }
    if (tablet.fontSize) tRules.push(`font-size: ${parseDimension(tablet.fontSize)} !important;`);
    if (tablet.alignment) tRules.push(`text-align: ${tablet.alignment} !important;`);
    if (tablet.lineHeight) tRules.push(`line-height: ${tablet.lineHeight} !important;`);
    if (tablet.letterSpacing) tRules.push(`letter-spacing: ${tablet.letterSpacing} !important;`);
    if (tablet.paddingTop) tRules.push(`padding-top: ${parseDimension(tablet.paddingTop)} !important;`);
    if (tablet.paddingBottom) tRules.push(`padding-bottom: ${parseDimension(tablet.paddingBottom)} !important;`);
    if (tablet.paddingLeft) tRules.push(`padding-left: ${parseDimension(tablet.paddingLeft)} !important;`);
    if (tablet.paddingRight) tRules.push(`padding-right: ${parseDimension(tablet.paddingRight)} !important;`);
    if (tablet.paddingY) {
      tRules.push(`padding-top: ${parseDimension(tablet.paddingY)} !important;`);
      tRules.push(`padding-bottom: ${parseDimension(tablet.paddingY)} !important;`);
    }
    if (tablet.paddingX) {
      tRules.push(`padding-left: ${parseDimension(tablet.paddingX)} !important;`);
      tRules.push(`padding-right: ${parseDimension(tablet.paddingX)} !important;`);
    }
    if (tablet.marginTop) tRules.push(`margin-top: ${parseDimension(tablet.marginTop)} !important;`);
    if (tablet.marginBottom) tRules.push(`margin-bottom: ${parseDimension(tablet.marginBottom)} !important;`);
    if (tablet.marginLeft) tRules.push(`margin-left: ${parseDimension(tablet.marginLeft)} !important;`);
    if (tablet.marginRight) tRules.push(`margin-right: ${parseDimension(tablet.marginRight)} !important;`);
    if (tablet.width) tRules.push(`width: ${parseDimension(tablet.width)} !important;`);
    if (tablet.maxWidth) tRules.push(`max-width: ${parseDimension(tablet.maxWidth)} !important;`);
    if (tablet.minHeight) tRules.push(`min-height: ${parseDimension(tablet.minHeight)} !important;`);
    if (tablet.maxHeight) tRules.push(`max-height: ${parseDimension(tablet.maxHeight)} !important;`);
    if (tablet.height) tRules.push(`height: ${parseDimension(tablet.height)} !important;`);
    if (tablet.columnCount) {
      tRules.push(`grid-template-columns: repeat(${tablet.columnCount}, minmax(0, 1fr)) !important;`);
      tabletRules.push(`#${cleanId} .laam-grid-container { grid-template-columns: repeat(${tablet.columnCount}, minmax(0, 1fr)) !important; }`);
    }
    if (tablet.gap) {
      tRules.push(`gap: ${parseDimension(tablet.gap)} !important;`);
      tabletRules.push(`#${cleanId} .laam-grid-container { gap: ${parseDimension(tablet.gap)} !important; }`);
    }
    if (tablet.borderRadius) tRules.push(`border-radius: ${parseDimension(tablet.borderRadius)} !important;`);
    if (tablet.objectFit) tRules.push(`object-fit: ${tablet.objectFit} !important;`);
    if (tablet.aspectRatio) tRules.push(`aspect-ratio: ${tablet.aspectRatio} !important;`);

    if (tRules.length > 0) {
      tabletRules.push(`#${cleanId} { ${tRules.join(' ')} }`);
    }

    // Mobile overrides
    const mobile = s.responsive?.mobile || {};
    const mRules: string[] = [];
    if (s.hideOnMobile || mobile.hideOnMobile) {
      mRules.push('display: none !important;');
    }
    if (mobile.fontSize) mRules.push(`font-size: ${parseDimension(mobile.fontSize)} !important;`);
    if (mobile.alignment) mRules.push(`text-align: ${mobile.alignment} !important;`);
    if (mobile.lineHeight) mRules.push(`line-height: ${mobile.lineHeight} !important;`);
    if (mobile.letterSpacing) mRules.push(`letter-spacing: ${mobile.letterSpacing} !important;`);
    if (mobile.paddingTop) mRules.push(`padding-top: ${parseDimension(mobile.paddingTop)} !important;`);
    if (mobile.paddingBottom) mRules.push(`padding-bottom: ${parseDimension(mobile.paddingBottom)} !important;`);
    if (mobile.paddingLeft) mRules.push(`padding-left: ${parseDimension(mobile.paddingLeft)} !important;`);
    if (mobile.paddingRight) mRules.push(`padding-right: ${parseDimension(mobile.paddingRight)} !important;`);
    if (mobile.paddingY) {
      mRules.push(`padding-top: ${parseDimension(mobile.paddingY)} !important;`);
      mRules.push(`padding-bottom: ${parseDimension(mobile.paddingY)} !important;`);
    }
    if (mobile.paddingX) {
      mRules.push(`padding-left: ${parseDimension(mobile.paddingX)} !important;`);
      mRules.push(`padding-right: ${parseDimension(mobile.paddingX)} !important;`);
    }
    if (mobile.marginTop) mRules.push(`margin-top: ${parseDimension(mobile.marginTop)} !important;`);
    if (mobile.marginBottom) mRules.push(`margin-bottom: ${parseDimension(mobile.marginBottom)} !important;`);
    if (mobile.marginLeft) mRules.push(`margin-left: ${parseDimension(mobile.marginLeft)} !important;`);
    if (mobile.marginRight) mRules.push(`margin-right: ${parseDimension(mobile.marginRight)} !important;`);
    if (mobile.width) mRules.push(`width: ${parseDimension(mobile.width)} !important;`);
    if (mobile.maxWidth) mRules.push(`max-width: ${parseDimension(mobile.maxWidth)} !important;`);
    if (mobile.minHeight) mRules.push(`min-height: ${parseDimension(mobile.minHeight)} !important;`);
    if (mobile.maxHeight) mRules.push(`max-height: ${parseDimension(mobile.maxHeight)} !important;`);
    if (mobile.height) mRules.push(`height: ${parseDimension(mobile.height)} !important;`);
    if (mobile.columnCount) {
      mRules.push(`grid-template-columns: repeat(${mobile.columnCount}, minmax(0, 1fr)) !important;`);
      mobileRules.push(`#${cleanId} .laam-grid-container { grid-template-columns: repeat(${mobile.columnCount}, minmax(0, 1fr)) !important; }`);
    }
    if (mobile.gap) {
      mRules.push(`gap: ${parseDimension(mobile.gap)} !important;`);
      mobileRules.push(`#${cleanId} .laam-grid-container { gap: ${parseDimension(mobile.gap)} !important; }`);
    }
    if (mobile.borderRadius) mRules.push(`border-radius: ${parseDimension(mobile.borderRadius)} !important;`);
    if (mobile.objectFit) mRules.push(`object-fit: ${mobile.objectFit} !important;`);
    if (mobile.aspectRatio) mRules.push(`aspect-ratio: ${mobile.aspectRatio} !important;`);

    if (mRules.length > 0) {
      mobileRules.push(`#${cleanId} { ${mRules.join(' ')} }`);
    }
  };

  sections.forEach((sec) => {
    processItem(sec.id, sec.settings || {});
    if (Array.isArray(sec.blocks)) {
      sec.blocks.forEach((blk) => processItem(blk.id, blk.settings || {}));
    }
  });

  let output = '';
  if (desktopRules.length > 0) {
    output += `@media (min-width: 1025px) {\n  ${desktopRules.join('\n  ')}\n}\n`;
  }
  if (tabletRules.length > 0) {
    output += `@media (max-width: 1024px) {\n  ${tabletRules.join('\n  ')}\n}\n`;
  }
  if (mobileRules.length > 0) {
    output += `@media (max-width: 640px) {\n  ${mobileRules.join('\n  ')}\n}\n`;
  }

  return output;
}
