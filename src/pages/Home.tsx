import React from "react";
import HeroReveal from "../components/HeroReveal";
import InfiniteMarquee from "../components/InfiniteMarquee";
import FeaturedCards from "../components/FeaturedCards";
import ProductCard from "../components/ProductCard";
import CharacterRevealText from "../components/CharacterRevealText";
import { Product } from "../types";
import { Sparkles, Download, ArrowRight, Heart } from "lucide-react";

interface HomeProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onNavigate: (hash: string) => void;
}

export default function Home({ products, onSelectProduct, onAddToCart, onNavigate }: HomeProps) {
  // Get free products
  const freeProducts = products.filter((p) => p.price === 0).slice(0, 3);

  const aboutArtistParagraph = 
    "I am a technical 3D artist specializing in photorealistic environment kitbashes, rigged sci-fi vehicles, and modular hard-surface mesh design. My assets are created with Blender, and structured with production-level geometry, complete PBR materials, and pre-baked lighting arrays. I distribute high-end resources for concept designers and indie developers looking to rapidly expand their visual fidelity without bloating memory bounds.";

  return (
    <div className="bg-dark-bg min-h-screen text-white overflow-x-hidden">
      {/* 1. Motion Hero Cursor-spotlight "wireframe to render" reveal */}
      <HeroReveal onBrowse={() => onNavigate("#/shop")} />

      {/* 2. Infinite marquee row — "asset showcase" strip */}
      <InfiniteMarquee />

      {/* 3. Sticky-stacking "Featured Assets" cards */}
      <FeaturedCards products={products} onSelectProduct={onSelectProduct} />

      {/* 4. About the Artist Strip with Scroll Character Reveal */}
      <section id="about" className="py-24 bg-dark-card border-y border-white/5 relative px-6 overflow-hidden">
        {/* Subtle grid accent */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative z-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-orange font-mono font-bold block mb-1">
              THE DESIGNER
            </span>
            <h3 className="font-serif text-3xl md:text-5xl text-white font-medium tracking-tight">
              Aesthetic <br />
              <span className="italic font-serif text-brand-orange">Honesty.</span>
            </h3>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-brand-orange bg-black/40 flex items-center justify-center font-mono text-sm text-brand-orange font-bold">
                [V3D]
              </div>
              <div>
                <span className="text-sm font-semibold block text-white">Vertex3D Creator</span>
                <span className="text-xs text-gray-500 font-mono block">3D & Tech Artist</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Character Reveal text animation exactly as requested */}
            <CharacterRevealText text={aboutArtistParagraph} />
            
            <div className="flex flex-wrap gap-4 pt-4 font-mono text-xs">
              <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-gray-300">
                ⚡ Cycles / EEVEE Engine Preset
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-gray-300">
                📦 Quad-Only Topology
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-gray-300">
                🎨 Clean UV Unwrap Atlas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "Free Downloads" row (Separate from paid) */}
      <section className="py-24 bg-dark-bg px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-blue font-mono font-bold flex items-center gap-1.5 mb-1">
                <Download className="w-3.5 h-3.5 text-brand-blue" /> Expand your Toolkit
              </span>
              <h2 className="font-serif text-4xl md:text-6xl text-white font-medium tracking-tight">
                Free <span className="font-serif italic text-brand-blue">Blender Downloads.</span>
              </h2>
            </div>
            
            <button
              onClick={() => onNavigate("#/shop?filter=free")}
              className="text-xs text-brand-blue font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 hover:underline group cursor-pointer"
            >
              <span>See All Free Files</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Grid of Free Asset cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {freeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact Details */}
      <footer className="py-16 bg-[#080808] border-t border-white/5 px-6 font-mono text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-2 text-white">
            <span className="font-serif text-xl tracking-wide font-medium italic">
              Vertex<span className="text-brand-orange">3D</span>
            </span>
            <span className="text-gray-600 text-[10px]">| © 2026 Blender Asset Hub</span>
          </div>

          {/* Social Links exactly as requested */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a 
              href="https://whatsapp.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-orange transition-colors"
            >
              WhatsApp
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-orange transition-colors"
            >
              Facebook
            </a>
            <a 
              href="mailto:bitcoinoussama3@gmail.com" 
              className="hover:text-brand-orange transition-colors"
            >
              Email (bitcoinoussama3@gmail.com)
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-orange transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-right text-[10px] text-gray-600 flex items-center gap-1">
            <span>Built with Love for Blender Artists</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}
