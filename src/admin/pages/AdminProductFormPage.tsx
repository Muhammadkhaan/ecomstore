import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, Image as ImageIcon, Sparkles, Layers, Package, Globe, Tag, AlertCircle } from 'lucide-react';
import { MediaPickerModal } from '../components/MediaPickerModal.tsx';
import { SchemaManagerTab } from '../components/SchemaManagerTab.tsx';

interface AdminProductFormPageProps {
  token: string;
  productId?: string | null;
  onNavigate: (path: string) => void;
}

interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  image: string;
}

export const AdminProductFormPage: React.FC<AdminProductFormPageProps> = ({ token, productId, onNavigate }) => {
  const isEditing = Boolean(productId);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [designer, setDesigner] = useState('LAAM Pret Couture');
  const [category, setCategory] = useState('pret');
  const [price, setPrice] = useState('195');
  const [compareAtPrice, setCompareAtPrice] = useState('250');
  const [costPrice, setCostPrice] = useState('80');
  const [sku, setSku] = useState(`LAAM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [barcode, setBarcode] = useState(`8901234${Math.floor(1000 + Math.random() * 9000)}`);
  const [inventory, setInventory] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>('Active');
  
  // Media / Images with alt text & variant assignment
  const [images, setImages] = useState<Array<{ url: string; alt: string; variantColor?: string }>>([
    { url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67', alt: 'Front view luxury raw silk outfit', variantColor: 'Ruby Red' },
    { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', alt: 'Detail embroidery and Zardozi work', variantColor: 'Ruby Red' }
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  // Variants & Matrix
  const [sizes, setSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState<string[]>(['Ruby Red', 'Emerald', 'Ivory']);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [variantMatrix, setVariantMatrix] = useState<ProductVariant[]>([]);

  // Tags & Collections
  const [tagsInput, setTagsInput] = useState('Handmade, Pure Silk, Festive 2026, Zardozi');
  const [collections, setCollections] = useState<string[]>(['Pret', 'Ready to Ship']);

  // Shipping details
  const [weightKg, setWeightKg] = useState('0.8');
  const [dimensions, setDimensions] = useState('30x20x5 cm');
  const [shippingClass, setShippingClass] = useState('DHL Express Standard');

  // SEO & URL
  const [urlSlug, setUrlSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  useEffect(() => {
    if (isEditing && productId) {
      setFetching(true);
      fetch(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            const p = data.product;
            setTitle(p.title || '');
            setDescription(p.description || '');
            setDesigner(p.designer || 'LAAM Pret Couture');
            setCategory(p.category || 'pret');
            setPrice(String(p.price || 195));
            setCompareAtPrice(p.compareAtPrice !== null && p.compareAtPrice !== undefined ? String(p.compareAtPrice) : '');
            setCostPrice(p.costPrice !== null && p.costPrice !== undefined ? String(p.costPrice) : '');
            setSku(p.sku || '');
            setBarcode(p.barcode || '');
            setInventory(String(p.inventory || 50));
            setStatus(p.status || 'Active');
            
            if (Array.isArray(p.images) && p.images.length > 0) {
              setImages(p.images.map((img: any) => typeof img === 'string' ? { url: img, alt: p.title } : img));
            } else if (p.image) {
              setImages([{ url: p.image, alt: p.title }]);
            }

            if (Array.isArray(p.variants)) {
              if (typeof p.variants[0] === 'string') {
                setSizes(p.variants);
              }
            }
            if (Array.isArray(p.collections)) setCollections(p.collections);
            if (p.shippingDetails) {
              setWeightKg(String(p.shippingDetails.weightKg || '0.8'));
              setDimensions(p.shippingDetails.dimensions || '30x20x5 cm');
              setShippingClass(p.shippingDetails.shippingClass || 'DHL Express Standard');
            }
            setUrlSlug(p.urlSlug || '');
            setSeoTitle(p.seoTitle || '');
            setSeoDescription(p.seoDescription || '');
          }
          setFetching(false);
        })
        .catch(err => {
          console.error(err);
          setFetching(false);
        });
    }
  }, [isEditing, productId, token]);

  // Generate variant combinations when sizes or colors change
  useEffect(() => {
    if (sizes.length > 0 && colors.length > 0) {
      const generated: ProductVariant[] = [];
      sizes.forEach((s) => {
        colors.forEach((c) => {
          generated.push({
            id: `${s}-${c}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            sku: `${sku}-${s}-${c.substring(0, 3).toUpperCase()}`,
            size: s,
            color: c,
            price: Number(price) || 195,
            compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
            inventory: Math.round(Number(inventory) / (sizes.length * colors.length)) || 10,
            image: images[0]?.url || ''
          });
        });
      });
      setVariantMatrix(generated);
    }
  }, [sizes, colors, price, compareAtPrice, inventory, sku]);

  // Auto-generate slug and SEO title when title changes
  useEffect(() => {
    if (!isEditing && title && !urlSlug) {
      setUrlSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
    if (!isEditing && title && !seoTitle) {
      setSeoTitle(`${title} | Laam Luxury Fashion`);
    }
    if (!isEditing && title && !seoDescription) {
      setSeoDescription(`Shop ${title} by ${designer}. Handcrafted luxury South Asian fashion with worldwide express delivery.`);
    }
  }, [title]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, { url: newImageUrl.trim(), alt: newImageAlt.trim() || title, variantColor: colors[0] }]);
    setNewImageUrl('');
    setNewImageAlt('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([item, ...rest]);
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;
    setImages(reordered);
  };

  const handleAddSize = () => {
    if (!newSize.trim() || sizes.includes(newSize.trim())) return;
    setSizes([...sizes, newSize.trim()]);
    setNewSize('');
  };

  const handleRemoveSize = (s: string) => {
    setSizes(sizes.filter(item => item !== s));
  };

  const handleAddColor = () => {
    if (!newColor.trim() || colors.includes(newColor.trim())) return;
    setColors([...colors, newColor.trim()]);
    setNewColor('');
  };

  const handleRemoveColor = (c: string) => {
    setColors(colors.filter(item => item !== c));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variantMatrix];
    updated[index] = { ...updated[index], [field]: value };
    setVariantMatrix(updated);
  };

  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'Active' | 'Draft' | 'Archived') => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const finalStatus = targetStatus || status;
    const imageUrls = images.map(img => img.url);

    const payload = {
      title,
      description,
      designer,
      category,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: costPrice ? Number(costPrice) : null,
      sku,
      barcode,
      inventory: Number(inventory),
      lowStockThreshold: Number(lowStockThreshold),
      status: finalStatus,
      images: imageUrls,
      image: imageUrls[0] || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67',
      variants: sizes,
      variantMatrix,
      colors,
      collections,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      shippingDetails: {
        weightKg: Number(weightKg),
        dimensions,
        shippingClass
      },
      seoTitle,
      seoDescription,
      urlSlug
    };

    const url = isEditing ? `/api/admin/products/${productId}` : '/api/admin/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setSuccessMessage(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => {
        onNavigate('/admin/products');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-16 text-center text-[#737373] text-xs">
        Loading product management suite...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/products')}
            className="p-2 text-[#737373] hover:text-[#141414] hover:bg-white rounded-xl border border-[#E5E5E5] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-[#141414]">
              {isEditing ? `Edit: ${title || 'Product'}` : 'Add New Product'}
            </h1>
            <p className="text-xs text-[#737373]">
              Shopify-grade product catalog manager with variant matrix, media gallery, inventory locations & SEO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/admin/products')}
            className="px-4 py-2.5 bg-white border border-[#E5E5E5] text-[#737373] rounded-xl text-xs font-semibold hover:bg-[#FAF9F6]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'Draft')}
            className="px-4 py-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'Active')}
            className="px-5 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : (isEditing ? 'Update & Publish' : 'Save & Publish')}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage} Redirecting to product list...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Product Details</h2>
            
            <div>
              <label className="block text-xs font-semibold text-[#737373] mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pure Raw Silk Hand-Embroidered Bridal Set"
                className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#141414]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#737373] mb-1">Description & Craftsmanship Story</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the luxury fabric, Zardozi, Resham work, and styling recommendations..."
                className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Designer / Brand House</label>
                <input
                  type="text"
                  value={designer}
                  onChange={(e) => setDesigner(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#141414] bg-white"
                >
                  <option value="pret">Pret</option>
                  <option value="festive">Festive</option>
                  <option value="bridal">Bridal</option>
                  <option value="kaftan">Kaftan</option>
                  <option value="velvet">Velvet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#737373] mb-1">Product Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Silk, Wedding, Luxury, Zardozi"
                className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
              />
            </div>
          </div>

          {/* Media Gallery */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Media Gallery ({images.length})</h2>
              <span className="text-[11px] text-[#737373]">First image is primary thumbnail</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#FAF9F6] flex flex-col shadow-sm">
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5 flex gap-1">
                      {idx === 0 ? (
                        <span className="px-2 py-0.5 bg-[#141414] text-white text-[10px] font-bold rounded shadow">
                          ★ Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="px-2 py-0.5 bg-white/90 hover:bg-[#141414] hover:text-white text-[#141414] text-[10px] font-bold rounded shadow transition-colors"
                          title="Set as primary image"
                        >
                          Make Primary
                        </button>
                      )}
                    </div>
                    {/* Reorder arrows on image */}
                    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 rounded px-1 py-0.5 backdrop-blur-sm">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, 'left')}
                        className="text-white disabled:opacity-30 hover:text-emerald-400 text-xs px-1"
                        title="Move Left"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMoveImage(idx, 'right')}
                        className="text-white disabled:opacity-30 hover:text-emerald-400 text-xs px-1"
                        title="Move Right"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between bg-white space-y-2">
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => {
                        const updated = [...images];
                        updated[idx].alt = e.target.value;
                        setImages(updated);
                      }}
                      placeholder="Alt text for SEO..."
                      className="w-full text-[10px] px-2 py-1 border border-[#E5E5E5] rounded text-[#141414]"
                    />
                    <div className="flex items-center justify-between pt-1 border-t border-[#E5E5E5]">
                      <span className="text-[10px] text-[#737373]">Pos #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                        title="Remove image from product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL (Unsplash or CDN)..."
                className="sm:col-span-2 px-3.5 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
              />
              <input
                type="text"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                placeholder="Alt description"
                className="px-3.5 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image URL</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E5E5] text-[#141414] rounded-xl text-xs font-semibold hover:bg-neutral-100 flex items-center gap-1.5 shadow-sm"
              >
                <ImageIcon className="w-4 h-4 text-[#E04F16]" />
                <span>Select from Media Library</span>
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Pricing & Margins</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Base Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Compare-at Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="Original price for sale badge"
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Cost per Item ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="For profit margin analytics"
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>
            </div>
          </div>

          {/* Variants & Matrix Management */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Variant Matrix (Sizes & Colors)</h2>
              <span className="text-xs text-[#737373]">{variantMatrix.length} combinations generated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#737373]">Sizes</label>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg text-xs font-medium flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => handleRemoveSize(s)} className="text-gray-400 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add size (e.g. XXL)"
                    className="flex-1 px-3 py-1.5 border border-[#E5E5E5] rounded-xl text-xs"
                  />
                  <button type="button" onClick={handleAddSize} className="px-3 py-1.5 bg-[#141414] text-white rounded-xl text-xs">Add Size</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#737373]">Colors / Swatches</label>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((c) => (
                    <span key={c} className="px-2.5 py-1 bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg text-xs font-medium flex items-center gap-1">
                      {c}
                      <button type="button" onClick={() => handleRemoveColor(c)} className="text-gray-400 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add color (e.g. Peach)"
                    className="flex-1 px-3 py-1.5 border border-[#E5E5E5] rounded-xl text-xs"
                  />
                  <button type="button" onClick={handleAddColor} className="px-3 py-1.5 bg-[#141414] text-white rounded-xl text-xs">Add Color</button>
                </div>
              </div>
            </div>

            {/* Variant Table Matrix */}
            {variantMatrix.length > 0 && (
              <div className="border border-[#E5E5E5] rounded-xl overflow-hidden mt-4">
                <div className="bg-[#FAF9F6] px-4 py-2 border-b border-[#E5E5E5] text-[11px] font-bold text-[#737373] uppercase tracking-wider flex items-center justify-between">
                  <span>Generated Variant Combinations</span>
                  <span>SKU & Stock Control</span>
                </div>
                <div className="divide-y divide-[#E5E5E5] max-h-72 overflow-y-auto">
                  {variantMatrix.map((v, idx) => (
                    <div key={v.id} className="p-3 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center bg-white hover:bg-[#FAF9F6]">
                      <div className="text-xs font-bold text-[#141414]">
                        {v.size} / {v.color}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          className="w-full px-2 py-1 border border-[#E5E5E5] rounded text-[11px] font-mono"
                          placeholder="SKU"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-[#E5E5E5] rounded text-[11px]"
                          placeholder="Price"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={v.inventory}
                          onChange={(e) => handleVariantChange(idx, 'inventory', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-[#E5E5E5] rounded text-[11px] font-bold text-[#087443]"
                          placeholder="Stock"
                        />
                      </div>
                      <div className="text-[11px] text-[#737373] text-right">
                        Ready
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inventory & SKU */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Inventory & Warehouse Locations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Parent SKU *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-mono text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Barcode (ISBN / UPC)</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-mono text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Total Stock Quantity</label>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#087443]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Warehouse Location</label>
                <select className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs bg-white">
                  <option value="main">Lahore Fulfillment Center (Default)</option>
                  <option value="dubai">Dubai International Hub</option>
                  <option value="london">London UK Studio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Shipping & Fulfillment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Package Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] mb-1">Shipping Class</label>
                <input
                  type="text"
                  value={shippingClass}
                  onChange={(e) => setShippingClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>
            </div>
          </div>

          {/* SEO & URL Slug */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Search Engine Optimization (SEO)</h2>
              <span className="text-[11px] text-[#737373]">Google Search Preview</span>
            </div>

            {/* Live Search Snippet Preview */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl space-y-1">
              <div className="text-[11px] text-[#006621] font-mono">https://laam.com/products/{urlSlug || 'product-handle'}</div>
              <div className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer">{seoTitle || title || 'Product Title'}</div>
              <div className="text-xs text-[#545454] line-clamp-2">{seoDescription || description || 'Product SEO description snippet...'}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#737373] mb-1">URL Handle / Slug</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-[#FAF9F6] border border-r-0 border-[#E5E5E5] rounded-l-xl text-xs text-[#737373]">
                  laam.com/products/
                </span>
                <input
                  type="text"
                  value={urlSlug}
                  onChange={(e) => setUrlSlug(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 border border-[#E5E5E5] rounded-r-xl text-xs font-mono text-[#141414]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#737373] mb-1">SEO Page Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#737373] mb-1">SEO Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
              />
            </div>
          </div>

          {/* Schema Markup Manager */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <SchemaManagerTab token={token} referenceType="product" referenceId={productId || 'new-product'} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Product Status</h2>
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#141414] bg-white"
              >
                <option value="Active">Active (Published on Store)</option>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <p className="text-[11px] text-[#737373]">
              {status === 'Active' ? 'This product is live on the Laam storefront for international customers.' : 'This product is saved as draft and not visible to shoppers.'}
            </p>
          </div>

          {/* Collections Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Collections</h2>
            <div className="space-y-2">
              {['Pret', 'Festive Formals 2026', 'Bridal Luxury', 'Ready to Ship', 'Velvet Edit', 'Kaftan Capsule'].map((col) => {
                const checked = collections.includes(col);
                return (
                  <label key={col} className="flex items-center gap-2.5 text-xs font-medium text-[#141414] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setCollections([...collections, col]);
                        else setCollections(collections.filter(c => c !== col));
                      }}
                      className="rounded border-[#E5E5E5]"
                    />
                    <span>{col}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </form>

      <MediaPickerModal
        token={token}
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setImages([...images, { url, alt: title || 'Product Image' }]);
        }}
      />
    </div>
  );
};
