import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  HelpCircle,
  MessageSquareQuote,
  Mail,
  Video,
  Images,
  Layers
} from 'lucide-react';
import { StorePage, PageBuilderSection, PageBuilderBlock } from '../types/pageBuilder.ts';
import {
  getHeadingStyles,
  getParagraphStyles,
  getButtonStyles,
  getImageStyles,
  getContainerStyles,
  getDividerStyles,
  getSpacerStyles,
  getColumnsGridStyles,
  getFlexJustifyClass
} from '../admin/pageBuilder/styleHelpers.ts';

interface CustomPageProps {
  pageHandle: string;
  onNavigate: (path: string) => void;
  adminToken?: string | null;
}

export const CustomPage: React.FC<CustomPageProps> = ({ pageHandle, onNavigate, adminToken }) => {
  const [page, setPage] = useState<StorePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    fetch(`/api/admin/store/pages/${pageHandle}`, { headers })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('This page does not exist or has not been published yet.');
          }
          throw new Error('Failed to load page');
        }
        return res.json();
      })
      .then((data) => {
        setPage(data.page);
        setIsPreview(Boolean(data.isPreview));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pageHandle, adminToken]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
        <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#737373] tracking-widest uppercase font-mono">Loading Page...</span>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-5">
        <div className="w-16 h-16 bg-[#FAF9F6] border border-[#E5E5E5] rounded-full flex items-center justify-center mx-auto text-[#737373]">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#141414]">Page Not Found</h2>
        <p className="text-xs text-[#737373] leading-relaxed">
          {error || 'The page you are looking for is either in draft mode or unavailable.'}
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront Home</span>
        </button>
      </div>
    );
  }

  const sections: PageBuilderSection[] = page.builderContent?.sections || [];

  const renderSingleBlock = (blk: PageBuilderBlock) => {
    if (blk.disabled) return null;
    const s = blk.settings || {};

    switch (blk.type) {
      case 'heading': {
        const headingStyle = getHeadingStyles(s);
        const level = s.level || 'h2';
        const HeadingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as keyof JSX.IntrinsicElements;
        return (
          <div key={blk.id} style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <HeadingTag style={headingStyle}>{s.text || 'Section Heading'}</HeadingTag>
          </div>
        );
      }

      case 'text': {
        const textStyle = getParagraphStyles(s);
        return (
          <div key={blk.id} style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph text content detailing collection features and craftsmanship.'}</p>
          </div>
        );
      }

      case 'button': {
        const btnStyle = getButtonStyles(s);
        const justifyClass = getFlexJustifyClass(s.alignment);
        return (
          <div key={blk.id} className={`my-4 flex ${justifyClass}`} style={{ width: '100%' }}>
            {s.linkTarget === '_blank' ? (
              <a
                href={s.linkUrl || '/collections'}
                target="_blank"
                rel="noopener noreferrer"
                style={btnStyle}
                className="transition-transform hover:scale-105"
              >
                {s.label || 'Explore Collection'}
              </a>
            ) : (
              <button
                onClick={() => onNavigate(s.linkUrl || '/collections')}
                style={btnStyle}
                className="transition-transform hover:scale-105"
              >
                {s.label || 'Explore Collection'}
              </button>
            )}
          </div>
        );
      }

      case 'image': {
        const imgStyle = getImageStyles(s);
        const imgEl = (
          <img
            src={s.imageUrl || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85'}
            alt={s.altText || 'Editorial Image'}
            style={imgStyle}
          />
        );
        return (
          <div key={blk.id} className="my-4" style={{ width: '100%' }}>
            {s.linkUrl ? (
              s.linkTarget === '_blank' ? (
                <a href={s.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                  {imgEl}
                </a>
              ) : (
                <div onClick={() => onNavigate(s.linkUrl)} className="cursor-pointer">
                  {imgEl}
                </div>
              )
            ) : (
              imgEl
            )}
          </div>
        );
      }

      case 'divider': {
        const divStyle = getDividerStyles(s);
        return (
          <div key={blk.id} className="my-4" style={{ width: '100%' }}>
            <hr style={divStyle} />
          </div>
        );
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s);
        return <div key={blk.id} style={spcStyle} />;
      }

      default:
        return (
          <div key={blk.id} className="my-2 p-3 bg-neutral-50 rounded-xl text-xs text-[#737373]">
            {s.title || s.content || blk.type}
          </div>
        );
    }
  };

  const renderSection = (sec: PageBuilderSection, index: number) => {
    if (sec.disabled) return null;
    const s = sec.settings || {};

    switch (sec.type) {
      case 'hero':
        return (
          <div
            key={sec.id || index}
            className="relative overflow-hidden bg-[#141414] text-white min-h-[440px] flex items-center justify-center text-center p-8 sm:p-16"
            style={{
              backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: s.overlayOpacity ?? 0.45 }}
            />
            <div className="relative max-w-4xl mx-auto space-y-4">
              {s.badge && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] tracking-widest uppercase font-semibold text-white">
                  {s.badge}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white drop-shadow-sm">
                {s.heading || page.title}
              </h1>
              {s.subheading && (
                <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm">
                  {s.subheading}
                </p>
              )}
              {s.buttonText && (
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(s.buttonLink || '/collections')}
                    className="px-6 py-3 bg-[#E04F16] text-white rounded-xl text-xs font-semibold hover:bg-[#c23e0c] shadow-lg transition-transform hover:scale-105"
                  >
                    {s.buttonText}
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'banner':
        return (
          <div key={sec.id || index} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
                {s.heading || s.title || 'Collection Showcase'}
              </h2>
              {s.subheading && (
                <p className="text-xs sm:text-sm text-[#737373] max-w-xl mx-auto">
                  {s.subheading}
                </p>
              )}
            </div>
          </div>
        );

      case 'rich_text': {
        const titleStyle = getHeadingStyles({ ...s, level: 'h3', fontFamily: s.fontFamily || 'serif' });
        const bodyStyle = getParagraphStyles(s);
        return (
          <div key={sec.id || index} className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 sm:p-10 shadow-sm space-y-4 text-center">
              {s.title && <h3 style={titleStyle}>{s.title}</h3>}
              {s.content && <div style={bodyStyle} className="whitespace-pre-line max-w-2xl mx-auto">{s.content}</div>}
            </div>
          </div>
        );
      }

      case 'heading': {
        const headingStyle = getHeadingStyles(s);
        const level = s.level || 'h2';
        const HeadingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as keyof JSX.IntrinsicElements;
        return (
          <div key={sec.id || index} className="px-6" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <HeadingTag style={headingStyle}>{s.text || 'Section Heading'}</HeadingTag>
          </div>
        );
      }

      case 'text': {
        const textStyle = getParagraphStyles(s);
        return (
          <div key={sec.id || index} className="px-6" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph text content detailing collection features and craftsmanship.'}</p>
          </div>
        );
      }

      case 'button': {
        const btnStyle = getButtonStyles(s);
        const justifyClass = getFlexJustifyClass(s.alignment);
        return (
          <div key={sec.id || index} className={`px-6 flex ${justifyClass}`} style={{ width: '100%' }}>
            {s.linkTarget === '_blank' ? (
              <a
                href={s.linkUrl || '/collections'}
                target="_blank"
                rel="noopener noreferrer"
                style={btnStyle}
                className="transition-transform hover:scale-105"
              >
                {s.label || 'Explore Collection'}
              </a>
            ) : (
              <button
                onClick={() => onNavigate(s.linkUrl || '/collections')}
                style={btnStyle}
                className="transition-transform hover:scale-105"
              >
                {s.label || 'Explore Collection'}
              </button>
            )}
          </div>
        );
      }

      case 'image': {
        const imgStyle = getImageStyles(s);
        const imgEl = (
          <img
            src={s.imageUrl || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85'}
            alt={s.altText || 'Editorial Showcase'}
            style={imgStyle}
          />
        );
        return (
          <div key={sec.id || index} className="px-6" style={{ width: '100%' }}>
            {s.linkUrl ? (
              s.linkTarget === '_blank' ? (
                <a href={s.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                  {imgEl}
                </a>
              ) : (
                <div onClick={() => onNavigate(s.linkUrl)} className="cursor-pointer">
                  {imgEl}
                </div>
              )
            ) : (
              imgEl
            )}
          </div>
        );
      }

      case 'divider': {
        const divStyle = getDividerStyles(s);
        return (
          <div key={sec.id || index} className="px-6" style={{ width: '100%' }}>
            <hr style={divStyle} />
          </div>
        );
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s);
        return <div key={sec.id || index} style={spcStyle} />;
      }

      case 'container':
      case 'section': {
        const containerStyle = getContainerStyles(s, sec.type === 'section');
        return (
          <div
            key={sec.id || index}
            style={containerStyle}
          >
            {/* Background darkening overlay if image is present */}
            {s.backgroundImage && (s.overlayOpacity ?? 0) > 0 && (
              <div
                className="absolute inset-0 bg-black pointer-events-none rounded-[inherit]"
                style={{ opacity: s.overlayOpacity }}
              />
            )}
            <div className="relative z-10">
              {sec.blocks && sec.blocks.length > 0 ? (
                <div className="space-y-4">
                  {sec.blocks.map(renderSingleBlock)}
                </div>
              ) : null}
            </div>
          </div>
        );
      }

      case 'columns': {
        const gridStyle = getColumnsGridStyles(s);
        return (
          <div key={sec.id || index} className="max-w-6xl mx-auto px-6">
            <div style={gridStyle}>
              {sec.blocks && sec.blocks.length > 0 ? (
                sec.blocks.map(renderSingleBlock)
              ) : (
                <>
                  <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm space-y-2">
                    <h4 className="font-serif font-bold text-base text-[#141414]">Column 1</h4>
                    <p className="text-xs text-[#525252] leading-relaxed">{s.col1Text || 'Handcrafted luxury and artisan tailoring.'}</p>
                  </div>
                  <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm space-y-2">
                    <h4 className="font-serif font-bold text-base text-[#141414]">Column 2</h4>
                    <p className="text-xs text-[#525252] leading-relaxed">{s.col2Text || 'Global express shipping directly to your doorstep.'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }

      case 'image_with_text': {
        const isLeft = s.imagePosition !== 'right';
        return (
          <div key={sec.id || index} className="max-w-6xl mx-auto px-6">
            <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-10 shadow-sm ${isLeft ? '' : 'md:flex-row-reverse'}`}>
              <div className="w-full md:w-1/2">
                <img
                  src={s.imageUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'}
                  alt={s.heading || 'Editorial'}
                  className="rounded-2xl object-cover w-full h-[320px] shadow-sm"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
                  {s.heading || 'Handcrafted With Heritage'}
                </h3>
                <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                  {s.text || 'Every stitch tells a story of century-old subcontinental heritage, re-imagined for the contemporary global muse.'}
                </p>
                {s.buttonText && (
                  <button
                    onClick={() => onNavigate(s.buttonLink || '/collections')}
                    className="px-5 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors"
                  >
                    {s.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'faq':
        return (
          <div key={sec.id || index} className="max-w-4xl mx-auto px-6 space-y-4">
            <h3 className="text-2xl font-serif font-bold text-center text-[#141414]">
              {s.heading || 'Frequently Asked Questions'}
            </h3>
            <div className="divide-y divide-[#E5E5E5] bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
              {(s.items || []).map((item: any, iIdx: number) => (
                <div key={iIdx} className="p-5 space-y-1.5">
                  <div className="font-bold text-sm text-[#141414]">{item.q}</div>
                  <div className="text-xs text-[#525252] leading-relaxed">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div key={sec.id || index} className="max-w-4xl mx-auto px-6">
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <MessageSquareQuote className="w-8 h-8 text-[#E04F16] mx-auto opacity-70" />
              <blockquote className="text-base sm:text-lg font-serif italic text-[#141414] max-w-2xl mx-auto">
                &ldquo;{s.quote || 'The craftsmanship and fit exceeded all expectations. Exceptional luxury service.'}&rdquo;
              </blockquote>
              <div>
                <div className="font-bold text-xs text-[#141414]">{s.author || 'Fatima R.'}</div>
                <div className="text-[11px] text-[#737373]">{s.location || 'London, UK'}</div>
              </div>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div key={sec.id || index} className="max-w-3xl mx-auto px-6">
            <div className="bg-[#141414] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
              <Mail className="w-8 h-8 text-[#E04F16] mx-auto" />
              <h3 className="text-2xl font-serif font-bold">{s.heading || 'Join the LAAM Inner Circle'}</h3>
              <p className="text-xs text-white/70 max-w-md mx-auto">{s.subheading || 'Receive private invitations to couture launches and 10% off.'}</p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  placeholder={s.placeholder || 'Enter your email address'}
                  className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#E04F16] flex-1"
                />
                <button type="submit" className="px-6 py-2.5 bg-[#E04F16] text-white rounded-xl text-xs font-semibold hover:bg-[#c23e0c] transition-colors">
                  {s.buttonText || 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return (
          <div key={sec.id || index} className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 text-xs text-[#737373] space-y-2">
              <div className="font-bold text-[#141414] capitalize">{sec.type.replace('_', ' ')}</div>
              {s.title && <div className="font-semibold text-[#141414]">{s.title}</div>}
              {s.content && <p>{s.content}</p>}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-[#FCFBF9]">
      {/* Draft Preview Bar */}
      {isPreview && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm">
          <Eye className="w-4 h-4" />
          <span>Admin Preview Mode: Viewing unpublished draft (v{page.version}) for &quot;/{page.handle}&quot;</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-2 text-[11px] text-[#737373]">
          <button onClick={() => onNavigate('/')} className="hover:text-[#141414] transition-colors">Home</button>
          <ChevronRight className="w-3 h-3 text-[#A3A3A3]" />
          <span className="text-[#141414] font-medium capitalize">{page.title}</span>
        </div>
      </div>

      {/* Render Structured Sections or Fallback Content */}
      {sections.length > 0 ? (
        <div className="space-y-12 pb-16">
          {sections.map(renderSection)}
        </div>
      ) : (
        /* Fallback traditional content */
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 sm:p-12 shadow-sm space-y-6">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#141414]">{page.title}</h1>
            <div className="text-xs sm:text-sm text-[#404040] leading-relaxed whitespace-pre-line">
              {page.content || 'Content for this page is being curated.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
