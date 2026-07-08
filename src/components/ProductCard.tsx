import React, { useState, useEffect, useRef } from "react";
import { Download, ShoppingCart, Tag, ExternalLink } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: any;
  product: Product;
  onSelect: (id: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export default function ProductCard({ product, onSelect, onAddToCart }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Hover image cycle state
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Magnetic tilt transform state
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 1. Hover Multi-image Cycle (Crossfade every ~1.2s)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isHovered && product.placeholders.length > 1) {
      intervalId = setInterval(() => {
        setActiveImgIndex((prev) => (prev + 1) % product.placeholders.length);
      }, 1200);
    } else {
      setActiveImgIndex(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovered, product.placeholders]);

  // 2. Magnetic / Tilt Effect on Hover (3-5deg max)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Cursor position relative to card center (from -0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    // 3-5 degrees rotation max
    const maxRotation = 5;
    const rotateY = relativeX * maxRotation;
    // Invert rotateX so moving cursor up tilts card forward
    const rotateX = -relativeY * maxRotation;

    // Small translation too for complete floating look
    const translateX = relativeX * 8;
    const translateY = relativeY * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 12px)`,
      transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsTransitioning(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsTransitioning(false);
    // Smooth ease out on mouse-leave (0.6s out as requested)
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)",
      transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(product.id)}
      style={tiltStyle}
      className="bg-dark-card border border-white/5 hover:border-brand-orange/20 rounded-3xl p-5 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-brand-orange/5 transition-all group"
    >
      {/* Top Container: Multi-Image Showcase Area */}
      <div className="relative w-full h-[200px] md:h-[240px] bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center font-mono">
        {/* Gallery Crossfade Slide Loop */}
        {product.placeholders.map((placeholder, idx) => (
          <div
            key={idx}
            style={{
              opacity: activeImgIndex === idx ? 1 : 0,
              transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="absolute inset-0 flex flex-col justify-between p-4"
          >
            {/* Viewport label overlay */}
            <div className="flex justify-between items-center text-[10px] text-gray-500">
              <span>IMG {idx + 1}/{product.placeholders.length}</span>
              <span className="opacity-60">{product.polyCount}</span>
            </div>

            {/* Central Caption */}
            <div className="text-center py-6">
              <span className={`text-sm md:text-base font-bold font-mono tracking-wider block transition-all ${
                activeImgIndex === idx ? "text-brand-orange scale-105" : "text-gray-600"
              }`}>
                {placeholder}
              </span>
              <span className="text-[9px] text-gray-500/40 block mt-1 uppercase tracking-widest">
                {idx === 0 ? "SOLID MESH" : idx === 1 ? "WIREFRAME VIEW" : "TEXTURED SPECS"}
              </span>
            </div>

            {/* Mesh tags */}
            <div className="flex justify-between items-center text-[9px] text-gray-600">
              <span>{product.fileFormat}</span>
              <span>Cycles Ready</span>
            </div>
          </div>
        ))}

        {/* Floating Category badge */}
        <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 text-brand-orange text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">
          {product.category}
        </span>
      </div>

      {/* Product Information */}
      <div className="mt-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-white font-serif text-lg md:text-xl group-hover:text-brand-orange transition-colors">
              {product.title}
            </h4>
            <span className="text-sm font-semibold text-white font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded">
              {product.price === 0 ? "FREE" : `$${product.price}`}
            </span>
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-gray-400 mt-2 font-light line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2 z-10">
          <div className="flex gap-1.5 flex-wrap">
            {product.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                #{tag}
              </span>
            ))}
          </div>

          {/* Add to Cart or Download button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.price === 0) {
                // Instant Inspect/Download
                onSelect(product.id);
              } else {
                onAddToCart(product, e);
              }
            }}
            className="p-2 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-brand-orange/10 hover:border-brand-orange/40 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            title={product.price === 0 ? "Free download" : "Add to Cart"}
          >
            {product.price === 0 ? (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono pr-1">Free</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono pr-1">Buy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
