import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Zap, Layers, Cpu } from "lucide-react";
import { Product } from "../types";

interface FeaturedCardsProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
}

export default function FeaturedCards({ products, onSelectProduct }: FeaturedCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter only featured products (or take first 3 if none flagged)
  const featured = products.filter(p => p.isFeatured).slice(0, 3);
  const totalCards = featured.length;

  return (
    <section ref={containerRef} className="py-24 bg-dark-bg relative px-6">
      <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-orange font-mono font-bold flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5" /> Curated masterworks
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-white font-medium tracking-tight">
            Featured <span className="font-serif italic text-brand-orange">3D Assets.</span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm max-w-sm font-sans">
          Each model represents hours of meticulous subdivision modeling, quad-remeshing, and lighting tests in cycles.
        </p>
      </div>

      {/* Cards stack layout */}
      <div className="max-w-5xl mx-auto flex flex-col gap-16 md:gap-24 relative pb-24">
        {featured.map((product, index) => {
          // Use dynamic key transforms for sticky stacking scale effect
          // Since it's sticky, we can wrap each card in a motion.div that tracks scroll
          return (
            <FeaturedCardWrapper 
              key={product.id} 
              product={product} 
              index={index} 
              totalCards={totalCards} 
              onSelect={onSelectProduct}
            />
          );
        })}
      </div>
    </section>
  );
}

interface CardWrapperProps {
  key?: any;
  product: Product;
  index: number;
  totalCards: number;
  onSelect: (id: string) => void;
}

function FeaturedCardWrapper({ product, index, totalCards, onSelect }: CardWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  // Calculate targetScale exactly as specified:
  // targetScale = 1 - (totalCards - 1 - index) * 0.03
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  // Icons for decorative cards
  const decorativeIcons = [
    <Cpu className="w-5 h-5 text-brand-orange" />,
    <Layers className="w-5 h-5 text-brand-blue" />,
    <Zap className="w-5 h-5 text-brand-orange" />
  ];

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        // Each offset by top: index * 28px exactly as requested
        top: `${96 + index * 28}px`,
      }}
      className="sticky top-24 w-full bg-dark-card border border-white/10 rounded-[48px] p-8 md:p-12 shadow-[0_-15px_40px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row gap-8 justify-between cursor-pointer group hover:border-brand-orange/25 transition-colors"
      onClick={() => onSelect(product.id)}
    >
      {/* Left Column: Product Info */}
      <div className="flex-1 flex flex-col justify-between gap-8">
        <div>
          {/* Metadata tag */}
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 rounded-xl bg-white/5 border border-white/10">
              {decorativeIcons[index % decorativeIcons.length]}
            </span>
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-orange font-mono font-semibold">
                {product.category}
              </span>
              <span className="text-[10px] text-gray-500 font-mono block">
                POLYS: {product.polyCount}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-3xl md:text-5xl text-white font-serif tracking-tight leading-tight group-hover:text-brand-orange transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mt-4 leading-relaxed font-sans font-light">
            {product.description}
          </p>
        </div>

        {/* Action Bottom */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5 font-mono">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-widest block">Investment</span>
            <span className="text-2xl font-bold text-white">
              {product.price === 0 ? "FREE" : `$${product.price}`}
            </span>
          </div>

          {/* Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product.id);
            }}
            className="liquid-glass flex items-center gap-2 text-xs text-white uppercase tracking-wider font-semibold px-6 py-3.5 rounded-full hover:scale-105 cursor-pointer"
          >
            <span>Inspect Asset</span>
            <ArrowUpRight className="w-4 h-4 text-brand-orange" />
          </button>
        </div>
      </div>

      {/* Right Column: Placeholder Image Grid (Magazine layout style) */}
      {/* "contains title/category/price + a placeholder image grid (2 small stacked + 1 tall, same layout style as a magazine spread)." */}
      <div className="w-full lg:w-[480px] h-[320px] md:h-[380px] flex gap-4">
        
        {/* Left Subgrid: 2 Small Stacked */}
        <div className="flex-1 flex flex-col gap-4">
          {/* 1st Small Placeholder */}
          <div className="flex-1 bg-black/40 border border-dashed border-white/5 hover:border-brand-orange/20 rounded-3xl p-4 flex flex-col justify-between font-mono text-[10px] text-gray-600 transition-colors">
            <span className="text-left font-bold">{product.placeholders[1] || "[wireframe-inset]"}</span>
            <div className="text-center py-2">
              <span className="block opacity-40">Clay Mesh View</span>
              <span className="text-[8px] opacity-20">Vertices: {index * 12 + 4}k</span>
            </div>
            <span className="text-right text-gray-700">Subdiv lvl: 2</span>
          </div>

          {/* 2nd Small Placeholder */}
          <div className="flex-1 bg-black/40 border border-dashed border-white/5 hover:border-brand-orange/20 rounded-3xl p-4 flex flex-col justify-between font-mono text-[10px] text-gray-600 transition-colors">
            <span className="text-left font-bold">{product.placeholders[2] || "[nodes-inset]"}</span>
            <div className="text-center py-2">
              <span className="block opacity-40">PBR Material Nodes</span>
              <span className="text-[8px] opacity-20">Procedural Noise</span>
            </div>
            <span className="text-right text-gray-700">Cycles Optimized</span>
          </div>
        </div>

        {/* Right Subgrid: 1 Tall Placeholder */}
        <div className="flex-1 bg-black/60 border border-dashed border-white/10 hover:border-brand-orange/30 rounded-3xl p-4 flex flex-col justify-between font-mono text-xs text-brand-orange/40 transition-colors relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-orange/5 to-transparent pointer-events-none" />
          <span className="text-left font-bold font-mono text-[10px] text-gray-500">
            {product.placeholders[0] || "[main-render-placeholder]"}
          </span>
          <div className="text-center py-4 z-10">
            <span className="block font-serif italic text-lg text-white">Full Render</span>
            <span className="text-[9px] text-gray-400 opacity-60 font-mono block mt-1">RAYTRACED BOUNCES</span>
          </div>
          <span className="text-right text-gray-600 text-[9px] font-mono">Format: {product.fileFormat}</span>
        </div>

      </div>
    </motion.div>
  );
}
