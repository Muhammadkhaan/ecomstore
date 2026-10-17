import React from 'react';

/**
 * Shared style resolvers between the Visual Builder Canvas and the Storefront CustomPage.
 * Ensures that changes made in the properties panel render identically in preview, editor, and storefront.
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
 * Heading Styles: Resolves H1-H6 typography, colors, spacing, alignments, transformations
 */
export function getHeadingStyles(s: Record<string, any>): React.CSSProperties {
  const fontFam = getFontFamilyValue(s.fontFamily || 'serif');

  const defaultSize =
    s.level === 'h1'
      ? '36px'
      : s.level === 'h3'
      ? '22px'
      : s.level === 'h4'
      ? '18px'
      : s.level === 'h5'
      ? '16px'
      : s.level === 'h6'
      ? '13px'
      : '28px';

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
export function getParagraphStyles(s: Record<string, any>): React.CSSProperties {
  const fontFam = getFontFamilyValue(s.fontFamily || 'sans');

  return {
    fontFamily: fontFam,
    fontSize: parseDimension(s.fontSize, '14px'),
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
export function getButtonStyles(s: Record<string, any>): React.CSSProperties {
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

  return {
    backgroundColor: bg,
    color: txtColor,
    fontFamily: getFontFamilyValue(s.fontFamily || 'sans'),
    fontSize: parseDimension(s.fontSize, '12px'),
    fontWeight: s.fontWeight || '600',
    paddingTop: parseDimension(s.paddingY, '12px'),
    paddingBottom: parseDimension(s.paddingY, '12px'),
    paddingLeft: parseDimension(s.paddingX, '24px'),
    paddingRight: parseDimension(s.paddingX, '24px'),
    borderRadius: parseDimension(s.borderRadius, '12px'),
    borderWidth: borderW,
    borderStyle: borderW !== '0px' ? s.borderStyle || 'solid' : 'none',
    borderColor: borderCol,
    width: s.fullWidth ? '100%' : 'auto',
    textAlign: 'center',
    display: s.fullWidth ? 'block' : 'inline-block',
    boxShadow: getBoxShadowValue(s.boxShadow),
    textDecoration: isText ? 'underline' : 'none',
    transition: 'all 0.2s ease-in-out'
  };
}

/**
 * Image Styles: Resolves max width, max height, object fit, border, shadow, radius
 */
export function getImageStyles(s: Record<string, any>): React.CSSProperties {
  return {
    width: parseDimension(s.width, '100%'),
    maxWidth: s.maxWidth && s.maxWidth !== 'none' ? parseDimension(s.maxWidth, '800px') : '100%',
    maxHeight: s.maxHeight && s.maxHeight !== 'none' ? parseDimension(s.maxHeight, '480px') : undefined,
    objectFit: (s.objectFit as any) || 'cover',
    borderRadius: parseDimension(s.borderRadius, '16px'),
    borderWidth: s.borderWidth && s.borderWidth !== '0px' ? parseDimension(s.borderWidth, '0px') : '0px',
    borderColor: s.borderColor || '#E5E5E5',
    borderStyle: s.borderWidth && s.borderWidth !== '0px' ? s.borderStyle || 'solid' : 'none',
    boxShadow: getBoxShadowValue(s.boxShadow),
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
export function getContainerStyles(s: Record<string, any>, isSection: boolean = false): React.CSSProperties {
  const isFull = s.contentWidth === 'full';
  const defaultMax = isSection ? '1280px' : '1024px';
  const defaultPadY = isSection ? '48px' : '32px';
  const defaultPadX = isSection ? '24px' : '16px';

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
 * Divider Styles: Resolves thickness, color, style, width, margins, alignment
 */
export function getDividerStyles(s: Record<string, any>): React.CSSProperties {
  const marginY = parseDimension(s.margin, '32px');
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
export function getSpacerStyles(s: Record<string, any>): React.CSSProperties {
  return {
    height: parseDimension(s.height, '40px'),
    width: '100%',
    display: 'block'
  };
}

/**
 * Columns Grid Styles: Resolves column count, gap, vertical alignment
 */
export function getColumnsGridStyles(s: Record<string, any>): React.CSSProperties {
  const cols = Number(s.columnCount) || 2;
  const gap = parseDimension(s.gap, '24px');
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
