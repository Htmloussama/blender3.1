import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, FileText, Check, Copy, ShoppingCart, Download, AlertCircle } from "lucide-react";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";

interface ProductDetailProps {
  productId: string;
  products: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (id: string) => void;
}

export default function ProductDetail({
  productId,
  products,
  onBack,
  onAddToCart,
  onSelectProduct,
}: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  // Free download states
  const [downloadEmail, setDownloadEmail] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const [copiedText, setCopiedText] = useState(false);

  // Load specific product details
  useEffect(() => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setProduct(found);
      setActiveImageIdx(0);
      setDownloadEmail("");
      setDownloadName("");
      setDownloadError("");
    }
  }, [productId, products]);

  if (!product) {
    return (
      <div className="bg-dark-bg min-h-screen text-white pt-32 flex flex-col items-center justify-center font-sans">
        <p className="text-gray-400">Loading product index...</p>
        <button onClick={onBack} className="text-brand-orange text-xs uppercase tracking-wider font-mono mt-4">
          ← Return to Store
        </button>
      </div>
    );
  }

  // Related products (same category or top rated, excluding self)
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.price === 0))
    .slice(0, 3);

  // Copy append script mock
  const handleCopyAppend = () => {
    const code = `import bpy\n\n# Append collection from vertex file\nbpy.ops.wm.append(\n    filepath="${product.id}.blend/Collection/",\n    directory="/path/to/${product.id}.blend/Collection/",\n    filename="${product.title.replace(/\s+/g, '_')}"\n)`;
    navigator.clipboard.writeText(code);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Handle Free direct email capture checkout
  const handleFreeDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadEmail || !downloadName) {
      setDownloadError("Please enter your name and email address to download.");
      return;
    }

    setDownloadLoading(true);
    setDownloadError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: downloadEmail,
          productId: product.id,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Redirect directly to download landing page
        window.location.hash = `#/download?token=${data.order.downloadToken}`;
      } else {
        setDownloadError(data.error || "Failed to process free download request.");
      }
    } catch (err) {
      setDownloadError("Connection error. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="bg-dark-bg min-h-screen text-white pt-24 pb-20 px-6 font-sans select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white uppercase tracking-widest font-mono cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-brand-orange" />
          <span>Return to Catalog</span>
        </button>

        {/* Core Layout: Grid splits on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT PANEL (7 columns): Showcase Carousels */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary active viewport */}
            <div className="relative w-full aspect-[4/3] bg-black/40 rounded-[32px] border border-white/5 overflow-hidden flex items-center justify-center font-mono select-none">
              <span className="text-3xl font-mono font-bold text-brand-orange/70 glow-text scale-105">
                {product.placeholders[activeImageIdx]}
              </span>

              {/* Navigation Arrows */}
              {product.placeholders.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev - 1 + product.placeholders.length) % product.placeholders.length)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/70 backdrop-blur-md rounded-full border border-white/10 hover:border-brand-orange/30 text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev + 1) % product.placeholders.length)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/70 backdrop-blur-md rounded-full border border-white/10 hover:border-brand-orange/30 text-white cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Active Slide tag */}
              <span className="absolute bottom-4 left-6 bg-black/70 border border-white/10 text-gray-400 text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-widest">
                VIEWPORT SHADER: {activeImageIdx === 0 ? "SOLID TEXTURED" : activeImageIdx === 1 ? "CLAY WIREFRAME" : `DETAIL_PASS_0${activeImageIdx}`}
              </span>
            </div>

            {/* Thumbnail carousels */}
            <div className="flex gap-4">
              {product.placeholders.map((placeholder, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`flex-1 py-4 px-3 rounded-2xl bg-dark-card border text-center font-mono text-[10px] transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? "border-brand-orange text-white bg-brand-orange/5"
                      : "border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/15"
                  }`}
                >
                  <span className="block font-bold truncate">{placeholder}</span>
                  <span className="block opacity-40 text-[8px] mt-1 uppercase">SLOT 0{idx + 1}</span>
                </button>
              ))}
            </div>

            {/* Product description */}
            <div className="p-8 rounded-3xl bg-dark-card border border-white/5 space-y-4">
              <h3 className="font-serif text-2xl text-white">Project Synthesis</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                {product.description}
              </p>
            </div>
          </div>

          {/* RIGHT PANEL (5 columns): Metadata & Checkout controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Asset Headline card */}
            <div className="p-8 rounded-[32px] bg-dark-card border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-brand-orange/5 rounded-full blur-[40px] pointer-events-none" />
              
              <span className="text-xs font-mono text-brand-orange uppercase tracking-wider block mb-2 font-bold">
                {product.category}
              </span>
              <h2 className="text-3xl font-serif text-white leading-tight">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-2 mt-4 pb-6 border-b border-white/5">
                <span className="text-3xl font-mono font-bold text-white">
                  {product.price === 0 ? "FREE DOWNLOAD" : `$${product.price}`}
                </span>
                {product.price > 0 && <span className="text-[10px] text-gray-500 font-mono">One-time payment</span>}
              </div>

              {/* Specification parameters */}
              <div className="py-6 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">FILE EXTENSION</span>
                  <span className="text-gray-300 font-bold">{product.fileFormat}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">TOPOLOGY SIZE</span>
                  <span className="text-gray-300 font-bold">{product.polyCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">LICENSING OUTLINE</span>
                  <span className="text-gray-300 font-bold">{product.license}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">COMPATIBILITY</span>
                  <span className="text-gray-300 font-bold">Blender 3.0+ (Cycles & EEVEE)</span>
                </div>
              </div>

              {/* Checkout CTA triggers */}
              {product.price > 0 ? (
                // Paid checkout
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <button
                    onClick={(e) => onAddToCart(product, e)}
                    className="w-full liquid-glass group py-4 px-6 text-xs text-white uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <ShoppingCart className="w-4 h-4 text-brand-orange" />
                    <span>Purchase & Add to Cart</span>
                  </button>
                  <span className="text-[9px] text-gray-500 text-center block mt-2">
                    🔒 Instant download link generated securely upon checkout.
                  </span>
                </div>
              ) : (
                // Gumroad-style free download email capture exactly as specified
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="p-4 rounded-2xl bg-black/40 border border-brand-blue/15 text-xs text-brand-blue/90 space-y-1">
                    <span className="font-semibold block">📧 Gumroad Delivery System</span>
                    <span className="opacity-80 block text-[10px] leading-relaxed">
                      Enter your guest contact details below. We'll automatically register your download and deliver the secure `.blend` file link directly.
                    </span>
                  </div>

                  <form onSubmit={handleFreeDownload} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={downloadName}
                        onChange={(e) => setDownloadName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange/50 transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Your Email Address"
                        value={downloadEmail}
                        onChange={(e) => setDownloadEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange/50 transition-colors font-sans"
                      />
                    </div>

                    {downloadError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[11px] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{downloadError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={downloadLoading}
                      className="w-full py-4 px-6 text-xs bg-white text-black uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 hover:scale-[1.01] transition-all disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-brand-blue" />
                      <span>{downloadLoading ? "Verifying..." : "Submit & Download Free"}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Blender Append automation snippet card */}
            <div className="p-6 rounded-[24px] bg-dark-card border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
                  Blender Console Script
                </span>
                <button
                  onClick={handleCopyAppend}
                  className="text-[10px] text-brand-orange hover:underline font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-black/50 rounded-xl font-mono text-[9px] text-gray-400 overflow-x-auto leading-relaxed border border-white/5">
                {`import bpy\n\n# Append collection from vertex file\nbpy.ops.wm.append(\n    filepath="${product.id}.blend/Collection/",\n    directory="/path/to/${product.id}.blend/Collection/",\n    filename="${product.title.replace(/\s+/g, '_')}"\n)`}
              </pre>
            </div>

          </div>
        </div>

        {/* RELATED ASSETS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/5">
            <h3 className="font-serif text-3xl text-white mb-10">
              Related <span className="font-serif italic text-brand-orange">Asset Volumes.</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
