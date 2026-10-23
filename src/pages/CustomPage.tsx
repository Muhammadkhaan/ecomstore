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
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Heart,
  Star,
  Clock,
  Flame,
  ArrowRight as ArrowRightIcon,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  Globe,
  Scissors,
  Headphones,
  ChevronLeft
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
  getFlexJustifyClass,
  getUniversalWidgetStyles,
  generateResponsiveCss,
  parseDimension,
  isElementHidden,
  DeviceViewport
} from '../admin/pageBuilder/styleHelpers.ts';
import { PRODUCTS } from '../data/products.ts';
import { StorefrontSchemas } from '../components/StorefrontSchemas.tsx';

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
  const [isPublished, setIsPublished] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<Record<string, boolean>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishNotice, setPublishNotice] = useState<string | null>(null);

  const effectiveToken = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('laam_admin_token') : null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveDevice: DeviceViewport = isPreview && previewViewport !== 'desktop'
    ? previewViewport
    : windowWidth < 640
    ? 'mobile'
    : windowWidth <= 1024
    ? 'tablet'
    : 'desktop';

  useEffect(() => {
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
    }

    // Pass preview query only when ?preview=true or ?preview=draft is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasPreviewParam = urlParams.get('preview') === 'true' || urlParams.get('preview') === 'draft';
    const query = hasPreviewParam ? '?preview=true' : '';

    fetch(`/api/admin/store/pages/${pageHandle}${query}`, { headers })
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
        setIsPublished(Boolean(data.isPublished));
        setHasDraftChanges(Boolean(data.hasDraftChanges));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pageHandle, effectiveToken]);

  // Synchronize dynamic SEO metadata and document title
  useEffect(() => {
    if (page) {
      const pageTitle = page.seoTitle || page.title;
      document.title = `${pageTitle} | LAAM Official`;

      if (page.seoDescription) {
        let metaTag = document.querySelector('meta[name="description"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', 'description');
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', page.seoDescription);
      }
    }
  }, [page]);

  const handleQuickPublish = async () => {
    if (!page || !effectiveToken) return;
    setIsPublishing(true);

    try {
      const res = await fetch(`/api/admin/storefront/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveToken}`
        },
        body: JSON.stringify({
          action: 'publish',
          builderContent: page.builderContent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to publish');

      setPage(data.page);
      setIsPreview(false);
      setPublishNotice(`Page successfully published live to storefront! (v${data.page.version})`);
      setTimeout(() => setPublishNotice(null), 5000);
    } catch (err: any) {
      setPublishNotice(`Error publishing: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleFaq = (key: string) => {
    setOpenFaqs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    if (isElementHidden(s, effectiveDevice)) return null;

    switch (blk.type) {
      case 'heading': {
        const headingStyle = getHeadingStyles(s, effectiveDevice);
        const level = s.level || 'h2';
        const HeadingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        return (
          <div key={blk.id} id={blk.id} style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <HeadingTag style={headingStyle}>{s.text || 'Section Heading'}</HeadingTag>
          </div>
        );
      }

      case 'text': {
        const textStyle = getParagraphStyles(s, effectiveDevice);
        return (
          <div key={blk.id} id={blk.id} style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph text content detailing collection features and craftsmanship.'}</p>
          </div>
        );
      }

      case 'button': {
        const btnStyle = getButtonStyles(s, effectiveDevice);
        const justifyClass = getFlexJustifyClass(s.alignment);
        return (
          <div key={blk.id} id={blk.id} className={`my-4 flex ${justifyClass}`} style={{ width: '100%' }}>
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
        const imgStyle = getImageStyles(s, effectiveDevice);
        const imgEl = (
          <img
            src={s.imageUrl || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85'}
            alt={s.altText || 'Editorial Image'}
            style={imgStyle}
          />
        );
        return (
          <div key={blk.id} id={blk.id} className="my-4" style={{ width: '100%' }}>
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
        const divStyle = getDividerStyles(s, effectiveDevice);
        return (
          <div key={blk.id} id={blk.id} className="my-4" style={{ width: '100%' }}>
            <hr style={divStyle} />
          </div>
        );
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s, effectiveDevice);
        return <div key={blk.id} id={blk.id} style={spcStyle} />;
      }

      default:
        return (
          <div key={blk.id} id={blk.id} className="my-2 p-3 bg-neutral-50 rounded-xl text-xs text-[#737373]">
            {s.title || s.content || blk.type}
          </div>
        );
    }
  };

  const renderSection = (sec: PageBuilderSection, index: number) => {
    if (sec.disabled) return null;
    const s = sec.settings || {};
    if (isElementHidden(s, effectiveDevice)) return null;

    switch (sec.type) {
      case 'hero':
        return (
          <div
            key={sec.id || index}
            id={sec.id}
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
          <div key={sec.id || index} id={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        const titleStyle = getHeadingStyles({ ...s, level: 'h3', fontFamily: s.fontFamily || 'serif' }, effectiveDevice);
        const bodyStyle = getParagraphStyles(s, effectiveDevice);
        return (
          <div key={sec.id || index} id={sec.id} className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 sm:p-10 shadow-sm space-y-4 text-center">
              {s.title && <h3 style={titleStyle}>{s.title}</h3>}
              {s.content && <div style={bodyStyle} className="whitespace-pre-line max-w-2xl mx-auto">{s.content}</div>}
            </div>
          </div>
        );
      }

      case 'heading': {
        const headingStyle = getHeadingStyles(s, effectiveDevice);
        const level = s.level || 'h2';
        const HeadingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        return (
          <div key={sec.id || index} id={sec.id} className="px-6" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <HeadingTag style={headingStyle}>{s.text || 'Section Heading'}</HeadingTag>
          </div>
        );
      }

      case 'text': {
        const textStyle = getParagraphStyles(s, effectiveDevice);
        return (
          <div key={sec.id || index} id={sec.id} className="px-6" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph text content detailing collection features and craftsmanship.'}</p>
          </div>
        );
      }

      case 'button': {
        const btnStyle = getButtonStyles(s, effectiveDevice);
        const justifyClass = getFlexJustifyClass(s.alignment);
        return (
          <div key={sec.id || index} id={sec.id} className={`px-6 flex ${justifyClass}`} style={{ width: '100%' }}>
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
        const imgStyle = getImageStyles(s, effectiveDevice);
        const imgEl = (
          <img
            src={s.imageUrl || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85'}
            alt={s.altText || 'Editorial Showcase'}
            style={imgStyle}
          />
        );
        return (
          <div key={sec.id || index} id={sec.id} className="px-6" style={{ width: '100%' }}>
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
        const divStyle = getDividerStyles(s, effectiveDevice);
        return (
          <div key={sec.id || index} id={sec.id} className="px-6" style={{ width: '100%' }}>
            <hr style={divStyle} />
          </div>
        );
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s, effectiveDevice);
        return <div key={sec.id || index} id={sec.id} style={spcStyle} />;
      }

      case 'container':
      case 'section': {
        const containerStyle = getContainerStyles(s, sec.type === 'section', effectiveDevice);
        return (
          <div
            key={sec.id || index}
            id={sec.id}
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
        const gridStyle = getColumnsGridStyles(s, effectiveDevice);
        return (
          <div key={sec.id || index} id={sec.id} className="max-w-6xl mx-auto px-6">
            <div style={gridStyle} className="laam-grid-container">
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
          <div key={sec.id || index} id={sec.id} className="max-w-6xl mx-auto px-6">
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
          <div key={sec.id || index} id={sec.id} className="max-w-4xl mx-auto px-6 space-y-4">
            <h3 className="text-2xl font-serif font-bold text-center text-[#141414]">
              {s.heading || 'Frequently Asked Questions'}
            </h3>
            <div className="divide-y divide-[#E5E5E5] bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
              {(s.items || []).map((item: any, iIdx: number) => {
                const itemKey = `${sec.id || index}-${iIdx}`;
                const isOpen = openFaqs[itemKey] ?? (iIdx === 0);
                return (
                  <div
                    key={iIdx}
                    className="p-5 space-y-1.5 cursor-pointer select-none hover:bg-neutral-50/50 transition-colors"
                    onClick={() => toggleFaq(itemKey)}
                  >
                    <div className="font-bold text-sm text-[#141414] flex items-center justify-between">
                      <span>{item.q}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-[#737373] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    {isOpen && (
                      <div className="text-xs text-[#525252] leading-relaxed pt-2 border-t border-neutral-100 mt-2 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div key={sec.id || index} id={sec.id} className="max-w-4xl mx-auto px-6">
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

      case 'newsletter': {
        const isSubscribed = newsletterSubscribed[sec.id || String(index)];
        return (
          <div key={sec.id || index} id={sec.id} className="max-w-3xl mx-auto px-6">
            <div className="bg-[#141414] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
              <Mail className="w-8 h-8 text-[#E04F16] mx-auto" />
              <h3 className="text-2xl font-serif font-bold">{s.heading || 'Join the LAAM Inner Circle'}</h3>
              <p className="text-xs text-white/70 max-w-md mx-auto">
                {s.subheading || 'Receive private invitations to couture launches and 10% off.'}
              </p>
              {isSubscribed ? (
                <div className="p-3.5 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold max-w-md mx-auto flex items-center justify-center gap-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Thank you for subscribing to LAAM VIP updates!</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNewsletterSubscribed((prev) => ({ ...prev, [sec.id || String(index)]: true }));
                  }}
                  className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
                >
                  <input
                    type="email"
                    required
                    placeholder={s.placeholder || 'Enter your email address'}
                    className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#E04F16] flex-1"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#E04F16] text-white rounded-xl text-xs font-semibold hover:bg-[#c23e0c] transition-colors"
                  >
                    {s.buttonText || 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        );
      }

      case 'product_grid': {
        const defaultCols = effectiveDevice === 'mobile'
          ? (Number(s.responsive?.mobile?.columnCount) || 1)
          : effectiveDevice === 'tablet'
          ? (Number(s.responsive?.tablet?.columnCount) || 2)
          : (Number(s.columnCount) || 4);
        const limit = Number(s.limit) || 8;
        const categoryFilter = s.category || 'all';
        const filteredProds = categoryFilter === 'all'
          ? PRODUCTS
          : PRODUCTS.filter((p) => p.category === categoryFilter);
        const productsList = (filteredProds.length > 0 ? filteredProds : PRODUCTS).slice(0, limit);

        return (
          <div key={sec.id || index} id={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" style={getUniversalWidgetStyles(s, effectiveDevice, '1280px')}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E5] pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E04F16]">
                  <Flame className="w-3.5 h-3.5 fill-[#E04F16]" />
                  <span>Official Direct Catalog</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#141414] mt-1">
                  {s.heading || 'Trending Ready to Ship Pret'}
                </h3>
                {s.subheading && <p className="text-xs text-[#737373] mt-1">{s.subheading}</p>}
              </div>
              <button
                onClick={() => onNavigate('/collections')}
                className="text-xs font-semibold text-[#141414] hover:text-[#087443] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <span>View All Catalog</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="grid laam-grid-container"
              style={{
                gridTemplateColumns: `repeat(${defaultCols}, minmax(0, 1fr))`,
                gap: parseDimension(s.gap, effectiveDevice === 'mobile' ? '12px' : '20px')
              }}
            >
              {productsList.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onNavigate(`/products/${prod.id}`)}
                  className="group relative flex flex-col bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-xs hover:border-[#D6D6D6] hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative aspect-[3/4] w-full bg-[#FAF9F6] overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                      {prod.badge ? (
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm bg-[#D3F8DF] text-[#087443] border border-[#73E2A3]/50">
                          {prod.badge}
                        </span>
                      ) : (
                        <span />
                      )}
                      <div className="p-1.5 rounded-full bg-white/90 text-[#424242] shadow-sm">
                        <Heart className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    {prod.readyToShip && (
                      <div className="absolute bottom-2.5 left-2.5 z-10">
                        <span className="inline-flex items-center gap-1 bg-[#141414]/85 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                          <Clock className="w-3 h-3 text-[#73E2A3]" />
                          Dispatches in 24h
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-medium tracking-wider uppercase text-[#737373]">
                        <span>{prod.designer}</span>
                        <span className="text-[#087443] font-semibold text-[10px]">★ {prod.rating || '4.9'}</span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold font-serif text-[#141414] group-hover:text-[#525252] transition-colors truncate">
                        {prod.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#737373] truncate">
                        {prod.fabric || 'Luxury Embroidered Formals'}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-[#E5E5E5]/60">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-[#141414]">${prod.priceUSD} USD</span>
                        {prod.originalPriceUSD && (
                          <span className="text-xs text-[#737373] line-through">${prod.originalPriceUSD}</span>
                        )}
                      </div>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#141414] text-white hover:bg-[#2b2b2b] flex items-center gap-1 shadow-xs transition-colors">
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'featured_product': {
        const prod = PRODUCTS.find((p) => p.id === s.productId) || PRODUCTS[0];
        const title = s.productName || prod?.name || "PD Formal '26 Embellished Silk Kaftan";
        const designer = s.designer || prod?.designer || 'Faiza Saqlain';
        const price = s.priceUSD ?? prod?.priceUSD ?? 195;
        const origPrice = s.originalPriceUSD ?? prod?.originalPriceUSD;
        const img = s.imageUrl || prod?.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85';
        const badge = s.badge || 'SPOTLIGHT ATELIER';
        const btnText = s.buttonText || 'Add to Bag — Fast Dispatch';

        return (
          <div key={sec.id || index} id={sec.id} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={getUniversalWidgetStyles(s, effectiveDevice, '1152px')}>
            <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div
                  className="md:col-span-5 relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#E5E5E5] cursor-pointer"
                  onClick={() => onNavigate(prod ? `/products/${prod.id}` : '/collections')}
                >
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#141414] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {badge}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/40 flex items-center justify-between text-xs font-semibold text-[#141414]">
                    <span>In Stock · Ready to Ship</span>
                    <span className="text-[#087443] flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5" /> 24h
                    </span>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#087443] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{designer} · Couture Spotlight</span>
                    </span>
                    <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                      ★ 4.9 (128 reviews)
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414] leading-tight">
                    {title}
                  </h3>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-2xl font-extrabold text-[#141414] font-serif">${price} USD</span>
                    {origPrice && (
                      <span className="text-sm text-[#A3A3A3] line-through">${origPrice} USD</span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#D3F8DF] text-[#087443]">
                      Original Guaranteed
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                    Meticulously hand-crafted with intricate zardozi, dabka, and resham threadwork. Designed for heirloom celebrations, festive soirées, and high-fashion luxury occasions.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#141414]">Available Sizes:</span>
                    <div className="flex items-center gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'Custom Fit'].map((sz, szIdx) => (
                        <button
                          key={sz}
                          onClick={() => onNavigate(prod ? `/products/${prod.id}` : '/collections')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            szIdx === 2
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-[#FAF9F6] text-[#424242] border-[#E5E5E5] hover:bg-neutral-100'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate(s.buttonLink || (prod ? `/products/${prod.id}` : '/collections'))}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#141414] text-white text-xs font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-md transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{btnText}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E5E5] text-[11px] text-[#525252]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                      <span>100% Original</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                      <span>DHL Express</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                      <span>Bespoke Sizing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'collection_grid': {
        const defaultCols = effectiveDevice === 'mobile'
          ? (Number(s.responsive?.mobile?.columnCount) || 1)
          : effectiveDevice === 'tablet'
          ? (Number(s.responsive?.tablet?.columnCount) || 2)
          : (Number(s.columnCount) || 3);
        const collections = s.collections && s.collections.length > 0
          ? s.collections
          : [
              { title: 'Luxury Pret 2026', image: PRODUCTS[0].image, link: '/collections/pret' },
              { title: 'Bridal Heirloom Couture', image: PRODUCTS[1].image, link: '/collections/bridal' },
              { title: 'Festive Formals Edit', image: PRODUCTS[2].image, link: '/collections/festive' },
            ];

        return (
          <div key={sec.id || index} id={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" style={getUniversalWidgetStyles(s, effectiveDevice, '1280px')}>
            {s.heading && (
              <h3 className="text-2xl font-serif font-bold text-center text-[#141414]">
                {s.heading}
              </h3>
            )}
            <div
              className="grid laam-grid-container"
              style={{
                gridTemplateColumns: `repeat(${defaultCols}, minmax(0, 1fr))`,
                gap: parseDimension(s.gap, '24px')
              }}
            >
              {collections.map((col: any, cIdx: number) => (
                <div
                  key={cIdx}
                  onClick={() => onNavigate(col.link || '/collections')}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-lg transition-all"
                >
                  <img
                    src={col.image || PRODUCTS[0].image}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                    <h4 className="text-xl font-serif font-bold mb-1">{col.title}</h4>
                    <span className="text-xs text-[#E04F16] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore Collection</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'product_carousel': {
        const cat = s.category || 'all';
        const prods = (cat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat)).slice(0, 6);

        return (
          <div key={sec.id || index} id={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" style={getUniversalWidgetStyles(s, effectiveDevice, '1280px')}>
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#087443]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Curated Carousel</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#141414] mt-1">
                  {s.heading || 'New Arrivals · Spring & Festive 2026'}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/collections')}
                className="text-xs font-semibold text-[#141414] hover:text-[#087443] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-stretch gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {prods.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onNavigate(`/products/${prod.id}`)}
                  className="w-60 sm:w-64 shrink-0 bg-white rounded-xl border border-[#E5E5E5] overflow-hidden flex flex-col justify-between hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="aspect-[3/4] bg-[#FAF9F6] relative overflow-hidden">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    {prod.badge && (
                      <span className="absolute top-2 left-2 bg-[#141414]/85 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#737373]">{prod.designer}</span>
                    <h5 className="font-serif font-bold text-xs text-[#141414] truncate">{prod.name}</h5>
                    <div className="text-xs font-bold text-[#141414] pt-0.5">${prod.priceUSD} USD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'image_gallery': {
        const imgs = s.images && s.images.length > 0
          ? s.images
          : [
              'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80'
            ];
        const layoutCols = s.layout === 'grid4' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

        return (
          <div key={sec.id || index} id={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4" style={getUniversalWidgetStyles(s, effectiveDevice, '1280px')}>
            <div className="text-center space-y-1 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#087443] flex items-center justify-center gap-1">
                <Images className="w-3.5 h-3.5" />
                <span>Editorial Lookbook</span>
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#141414]">
                {s.heading || 'Visual Lookbook'}
              </h3>
            </div>
            <div className={`grid ${layoutCols} gap-4`}>
              {imgs.map((imgUrl: string, idx: number) => (
                <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-xs">
                  <img src={imgUrl} alt="Editorial Look" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs font-serif">
                    Editorial Look #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'video':
        return (
          <div key={sec.id || index} id={sec.id} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4" style={getUniversalWidgetStyles(s, effectiveDevice, '1024px')}>
            {s.heading && (
              <h3 className="text-2xl font-serif font-bold text-center text-[#141414]">
                {s.heading}
              </h3>
            )}
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#E5E5E5] bg-black shadow-lg">
              <iframe
                src={s.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                title={s.heading || 'Craftsmanship in Motion'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {s.caption && (
              <p className="text-xs text-[#737373] text-center italic">
                {s.caption}
              </p>
            )}
          </div>
        );

      case 'trust_signals': {
        const t1 = s.item1Title || '100% Original Designer Wear';
        const d1 = s.item1Subtitle || 'Directly sourced from verified Pakistani ateliers';
        const t2 = s.item2Title || 'Express Global Shipping';
        const d2 = s.item2Subtitle || 'Doorstep DHL delivery across 150+ countries';
        const t3 = s.item3Title || 'Secure Checkout Guaranteed';
        const d3 = s.item3Subtitle || 'End-to-end encrypted international transactions';
        const t4 = s.item4Title || 'Direct From Designers';
        const d4 = s.item4Subtitle || 'Authentic pret, luxury couture & bridal wear';

        return (
          <div key={sec.id || index} id={sec.id} className="w-full bg-white border-y border-[#E5E5E5] py-8" style={getUniversalWidgetStyles(s, effectiveDevice, '100%')}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: ShieldCheck, title: t1, desc: d1 },
                  { icon: Globe, title: t2, desc: d2 },
                  { icon: Scissors, title: t3, desc: d3 },
                  { icon: Headphones, title: t4, desc: d4 }
                ].map((feat, fIdx) => {
                  const IconComp = feat.icon;
                  return (
                    <div
                      key={fIdx}
                      className="flex items-start gap-3.5 p-3.5 rounded-xl border border-transparent bg-[#FAF9F6] border-[#E5E5E5]/60 hover:border-[#E5E5E5] transition-colors"
                    >
                      <div className="p-2.5 rounded-lg bg-[#D3F8DF] shrink-0 border border-[#73E2A3]/40 text-[#087443]">
                        <IconComp className="w-5 h-5 text-[#087443]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-[#141414] leading-snug">
                          {feat.title}
                        </h4>
                        <p className="text-xs text-[#525252] leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div key={sec.id || index} id={sec.id} className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 text-xs text-[#737373] space-y-2">
              <div className="font-bold text-[#141414] capitalize">{sec.type.replace('_', ' ')}</div>
              {s.title && <div className="font-semibold text-[#141414]">{s.title}</div>}
              {s.content && <p>{s.content}</p>}
            </div>
          </div>
        );
    }
  };

  const responsiveCss = generateResponsiveCss(sections);

  return (
    <div className="w-full bg-[#FCFBF9] min-h-screen">
      {/* 1. Dynamic JSON-LD Structured Data for this Page */}
      <StorefrontSchemas referenceType="page" referenceId={String(page.id)} />

      {/* 2. Scoped Responsive Stylesheet for Tablet and Mobile Overrides */}
      {responsiveCss && (
        <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      )}

      {/* 3. Success Notification after quick publishing */}
      {publishNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{publishNotice}</span>
        </div>
      )}

      {/* 4. Interactive Admin Preview Bar */}
      {isPreview && (
        <div className="sticky top-0 z-40 bg-[#141414] text-white border-b border-amber-500/50 px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black flex items-center gap-1 shadow-xs">
              <Eye className="w-3 h-3" />
              <span>Admin Preview</span>
            </span>
            <span className="text-white/80 font-mono text-[11px] truncate max-w-[140px] sm:max-w-none">
              /{page.handle}
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                page.status === 'Published'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${page.status === 'Published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{page.status} (v{page.version})</span>
            </span>
            {page.status === 'Draft' ? (
              <span className="hidden md:inline text-white/50 text-[11px]">
                (Not visible to public visitors)
              </span>
            ) : (
              <span className="hidden md:inline text-white/50 text-[11px]">
                (Viewing latest draft changes)
              </span>
            )}
          </div>

          {/* Viewport switchers for testing responsive layout in real storefront */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setPreviewViewport('desktop')}
              className={`p-1 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                previewViewport === 'desktop' ? 'bg-white text-black shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Desktop viewport (100%)"
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewViewport('tablet')}
              className={`p-1 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                previewViewport === 'tablet' ? 'bg-white text-black shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Tablet viewport (768px frame)"
            >
              <Tablet className="w-3 h-3" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setPreviewViewport('mobile')}
              className={`p-1 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                previewViewport === 'mobile' ? 'bg-white text-black shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Mobile viewport (375px frame)"
            >
              <Smartphone className="w-3 h-3" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/admin/pages/builder/${page.id}`)}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Return to visual builder"
            >
              <Layers className="w-3.5 h-3.5 text-[#E04F16]" />
              <span>Edit in Builder</span>
            </button>
            {page.status === 'Published' && (
              <button
                onClick={() => onNavigate(`/pages/${page.handle}`)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="View the currently live published version"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Live Storefront</span>
              </button>
            )}
            {(page.status === 'Draft' || hasDraftChanges) && (
              <button
                onClick={handleQuickPublish}
                disabled={isPublishing}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Publish latest draft to the public storefront"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isPublishing
                    ? 'Publishing...'
                    : page.status === 'Published'
                    ? 'Update Live Store'
                    : 'Publish to Live Store'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Live Storefront Admin Bar (when an admin views the live published page without preview mode) */}
      {!isPreview && effectiveToken && isPublished && page && (
        <div className="sticky top-0 z-40 bg-[#1C1C1C] text-white border-b border-emerald-500/40 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-emerald-300">Live Storefront View</span>
            <span className="text-white/40">•</span>
            <span className="text-white/70">Displaying published version (v{page.version})</span>
            {hasDraftChanges && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Draft Changes Available
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/pages/${page.handle}?preview=true`)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Preview latest draft changes with device frame controls"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Latest Draft</span>
            </button>
            <button
              onClick={() => onNavigate(`/admin/pages/builder/${page.id}`)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Open Visual Builder"
            >
              <Layers className="w-3.5 h-3.5 text-[#E04F16]" />
              <span>Edit in Builder</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (With optional device viewport simulator when in preview mode) */}
      <div
        className={`transition-all duration-300 ${
          isPreview && previewViewport === 'tablet'
            ? 'max-w-[768px] mx-auto shadow-2xl rounded-2xl my-6 border border-[#E5E5E5] bg-white overflow-hidden'
            : isPreview && previewViewport === 'mobile'
            ? 'max-w-[375px] mx-auto shadow-2xl rounded-2xl my-6 border border-[#E5E5E5] bg-white overflow-hidden'
            : 'w-full'
        }`}
      >
        {/* Breadcrumb Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center gap-2 text-[11px] text-[#737373]">
            <button onClick={() => onNavigate('/')} className="hover:text-[#141414] transition-colors">
              Home
            </button>
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
    </div>
  );
};
