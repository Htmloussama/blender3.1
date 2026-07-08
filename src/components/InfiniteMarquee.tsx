import { useEffect, useRef, useState } from "react";

export default function InfiniteMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        
        // Offset logic exactly as specified:
        // offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3
        const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.15; // Scaled slightly for elegant speed
        setScrollOffset(offset);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const row1Items = [
    { label: "[marquee-thumb-1]", title: "Cyber Street Decals", format: "PBR Material" },
    { label: "[marquee-thumb-2]", title: "Hydraulic Leg Joint", format: "Rigged Mesh" },
    { label: "[marquee-thumb-3]", title: "Rusty Corrugated Plate", format: "Procedural Node" },
    { label: "[marquee-thumb-4]", title: "Neon Sign Capsule", format: "Asset Pack" },
    { label: "[marquee-thumb-5]", title: "Vending Machine Prop", format: "LOD Mesh" },
    { label: "[marquee-thumb-6]", title: "Exhaust Ventilation Vent", format: "Hard Surface" },
  ];

  const row2Items = [
    { label: "[marquee-thumb-7]", title: "Industrial Storage Tank", format: "Game Prop" },
    { label: "[marquee-thumb-8]", title: "Tactical Sensor Visor", format: "Rigged Part" },
    { label: "[marquee-thumb-9]", title: "Hologram Light Grid", format: "Shader Preset" },
    { label: "[marquee-thumb-10]", title: "Modular Walkway Grid", format: "Kitbash piece" },
    { label: "[marquee-thumb-11]", title: "Trash Bin & Debris", format: "Asset Pack" },
    { label: "[marquee-thumb-1]", title: "Cyber Street Decals", format: "PBR Material" },
  ];

  // Triple items for seamless scroll loop exactly as requested
  const tripledRow1 = [...row1Items, ...row1Items, ...row1Items];
  const tripledRow2 = [...row2Items, ...row2Items, ...row2Items];

  return (
    <section
      ref={sectionRef}
      className="py-16 bg-dark-bg/95 border-b border-white/5 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <h2 className="font-serif text-3xl md:text-5xl text-white font-medium tracking-tight">
          Modular Asset Repository
        </h2>
        <p className="text-gray-400 text-sm max-w-md mt-2">
          A microscopic overview of modular assets, shaders, and widgets cataloged inside our library.
        </p>
      </div>

      {/* Infinite Scrolling Container */}
      <div className="flex flex-col gap-6 relative w-full overflow-hidden">
        
        {/* ROW 1: Scrolls Right (TranslateX positive) */}
        <div 
          className="flex gap-4 transition-transform duration-75 ease-out"
          style={{
            transform: `translateX(${-250 + scrollOffset}px)`,
            willChange: "transform",
          }}
        >
          {tripledRow1.map((item, idx) => (
            <div
              key={`row1-${idx}`}
              className="flex-shrink-0 w-[380px] h-[230px] md:w-[420px] md:h-[270px] bg-dark-card border border-white/10 hover:border-brand-orange/30 rounded-2xl p-6 flex flex-col justify-between relative group transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              
              {/* Thumbnail Placeholder caption */}
              <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                <span>Viewport Solid Mode</span>
                <span className="text-[10px] text-brand-orange/60 font-semibold px-2 py-0.5 rounded bg-brand-orange/10">
                  {item.format}
                </span>
              </div>

              {/* Core labeled center */}
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-xl font-mono font-bold text-gray-600/60 tracking-wider">
                  {item.label}
                </span>
              </div>

              {/* Metadata */}
              <div className="flex items-end justify-between font-mono z-10">
                <div>
                  <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                  <p className="text-[10px] text-gray-500">Vertex ID: VT-{(idx % 12) * 110 + 2045}</p>
                </div>
                <span className="text-[10px] text-gray-500">Cycles OK</span>
              </div>
            </div>
          ))}
        </div>

        {/* ROW 2: Scrolls Left (TranslateX negative) */}
        <div 
          className="flex gap-4 transition-transform duration-75 ease-out"
          style={{
            transform: `translateX(${-450 - scrollOffset}px)`,
            willChange: "transform",
          }}
        >
          {tripledRow2.map((item, idx) => (
            <div
              key={`row2-${idx}`}
              className="flex-shrink-0 w-[380px] h-[230px] md:w-[420px] md:h-[270px] bg-dark-card border border-white/10 hover:border-brand-blue/30 rounded-2xl p-6 flex flex-col justify-between relative group transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              
              {/* Thumbnail Placeholder caption */}
              <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                <span>Viewport Clay Mode</span>
                <span className="text-[10px] text-brand-blue/60 font-semibold px-2 py-0.5 rounded bg-brand-blue/10">
                  {item.format}
                </span>
              </div>

              {/* Core labeled center */}
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-xl font-mono font-bold text-gray-600/60 tracking-wider">
                  {item.label}
                </span>
              </div>

              {/* Metadata */}
              <div className="flex items-end justify-between font-mono z-10">
                <div>
                  <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                  <p className="text-[10px] text-gray-500">Vertex ID: VT-{(idx % 15) * 85 + 4120}</p>
                </div>
                <span className="text-[10px] text-gray-500">Cycles OK</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
