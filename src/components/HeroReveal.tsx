import React, { useEffect, useRef, useState } from "react";
import { Hammer, Sparkles, ChevronRight } from "lucide-react";

interface HeroRevealProps {
  onBrowse: () => void;
}

export default function HeroReveal({ onBrowse }: HeroRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealLayerRef = useRef<HTMLDivElement>(null);

  // Mouse position states (raw and smoothed)
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
  const [hasMoved, setHasMoved] = useState(false);

  // Handle window resizing and container boundaries
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || window.innerWidth,
          height: rect.height || 700,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update canvas sizing whenever dimensions change
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;
    }
  }, [dimensions]);

  // Set initial spotlight in the center so it doesn't render completely blank
  useEffect(() => {
    mouse.current = { x: dimensions.width / 2, y: dimensions.height / 2 };
    smooth.current = { x: dimensions.width / 2, y: dimensions.height / 2 };
  }, [dimensions]);

  // Track cursor position inside the container
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!hasMoved) setHasMoved(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current && e.touches.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
      if (!hasMoved) setHasMoved(true);
    }
  };

  // Continuous animation loop via requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const animateSpotlight = () => {
      // Easing calculation exactly as specified: smooth.x += (mouse.x - smooth.x) * 0.1
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;

      const canvas = canvasRef.current;
      const revealDiv = revealLayerRef.current;

      if (canvas && revealDiv) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw specified radial gradient
          const radius = 280; // ~260px as requested
          const grad = ctx.createRadialGradient(
            smooth.current.x,
            smooth.current.y,
            0,
            smooth.current.x,
            smooth.current.y,
            radius
          );

          grad.addColorStop(0, "rgba(255, 255, 255, 1)");
          grad.addColorStop(0.4, "rgba(255, 255, 255, 1)");
          grad.addColorStop(0.6, "rgba(255, 255, 255, 0.75)");
          grad.addColorStop(0.75, "rgba(255, 255, 255, 0.4)");
          grad.addColorStop(0.88, "rgba(255, 255, 255, 0.12)");
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(smooth.current.x, smooth.current.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Apply as mask image data URL to the reveal layer
          try {
            const dataUrl = canvas.toDataURL();
            revealDiv.style.maskImage = `url(${dataUrl})`;
            revealDiv.style.webkitMaskImage = `url(${dataUrl})`;
            revealDiv.style.maskSize = "100% 100%";
            revealDiv.style.webkitMaskSize = "100% 100%";
          } catch (e) {
            // Fallback for some security or browser settings
            const percentageX = (smooth.current.x / dimensions.width) * 100;
            const percentageY = (smooth.current.y / dimensions.height) * 100;
            const maskGradient = `radial-gradient(circle 280px at ${percentageX}% ${percentageY}%, black 40%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.1) 85%, transparent 100%)`;
            revealDiv.style.maskImage = maskGradient;
            revealDiv.style.webkitMaskImage = maskGradient;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animateSpotlight);
    };

    animationFrameId = requestAnimationFrame(animateSpotlight);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, hasMoved]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-[620px] md:h-[750px] bg-dark-bg overflow-hidden cursor-crosshair select-none border-b border-white/5"
    >
      {/* Hidden canvas for drawing gradient */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ========================================================= */}
      {/* BASE LAYER (z-10): Clay/Wireframe Blender Viewport (Wireframe-Render) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-10 bg-[#161616] flex flex-col justify-between p-4 font-mono select-none">
        {/* Wireframe background pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(#e8702a 0.5px, transparent 0.5px), 
            linear-gradient(to right, rgba(232, 112, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(232, 112, 42, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 48px 48px, 48px 48px"
        }} />
        
        {/* Mock Blender Grid Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[500px] h-[300px] border border-dashed border-brand-orange rounded-lg flex items-center justify-center">
            <span className="text-brand-orange text-xs">[Perspective Grid Viewport]</span>
          </div>
        </div>

        {/* Blender Header stats */}
        <div className="flex justify-between text-[11px] text-gray-500 z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange" /> Solid Viewport</span>
            <span>Vertices: 422,105</span>
            <span>Edges: 839,401</span>
            <span>Objects: 1/14</span>
          </div>
          <div className="text-right">
            <span>Grid Spacing: 1.0m</span>
          </div>
        </div>

        {/* Core display caption */}
        <div className="flex flex-col items-center justify-center flex-1 z-10 text-center select-none text-gray-600/40 font-mono">
          <span className="text-2xl font-bold border border-dashed border-gray-700/50 px-6 py-4 rounded-xl bg-black/20">
            [hero-wireframe-render]
          </span>
          <span className="text-xs mt-2 text-gray-500/30">Blender Solid Shader Representation (Clay Mode)</span>
        </div>

        {/* Blender Footer controls */}
        <div className="flex justify-between text-[10px] text-gray-600 z-10">
          <span>Scale: 1.000</span>
          <span>Mesh Object Mode</span>
          <span>X: 0.00 Y: 0.00 Z: 0.00</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REVEAL LAYER (z-30): Cycles Final Lit PBR Shader Render (Final-Render) */}
      {/* ========================================================= */}
      <div
        ref={revealLayerRef}
        className="absolute inset-0 z-30 bg-[#060606] flex flex-col justify-between p-4 font-mono select-none"
        style={{
          // Spotlight starts with small circle if not yet initialized, then masked dynamically
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat"
        }}
      >
        {/* Glamour glossy background gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#1b0a03] via-[#080808] to-[#040c16] opacity-90" />
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(#ffffff 0.5px, transparent 0.5px), 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 96px 96px, 96px 96px"
        }} />

        {/* Cinematic Render Lights Glowing */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-orange/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Render status */}
        <div className="flex justify-between text-[11px] text-brand-orange z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Cycles Render Active</span>
            <span className="text-brand-blue">OptiX Denoiser ON</span>
            <span>Samples: 2048/2048</span>
            <span>Time: 00:08.42</span>
          </div>
          <div className="text-right">
            <span>Resolution: 3840 x 2160</span>
          </div>
        </div>

        {/* Core display caption */}
        <div className="flex flex-col items-center justify-center flex-1 z-10 text-center select-none text-brand-orange/60 font-mono">
          <span className="text-2xl font-bold border border-solid border-brand-orange/40 px-6 py-4 rounded-xl bg-brand-orange/5 shadow-[0_0_30px_rgba(232,112,42,0.1)]">
            [hero-final-render]
          </span>
          <span className="text-xs mt-2 text-brand-orange/40">Photorealistic PBR Materials, Raytraced Indirect Bounce Lights</span>
        </div>

        {/* Blender Footer */}
        <div className="flex justify-between text-[10px] text-brand-orange/50 z-10">
          <span>OptiX Accelerated CUDA</span>
          <span>Active Camera: Frame_Cam</span>
          <span className="text-green-500">Render Successful</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TEXT/CONTENT OVERLAY (z-50): Sit atop both layers, cursor-tracking unaffected */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-center items-center px-6">
        <div className="max-w-4xl text-center flex flex-col items-center gap-4">
          
          {/* Tagline */}
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-brand-orange tracking-wider uppercase animate-fade-rise">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Indie Blender Asset Studio</span>
          </div>

          {/* Headline */}
          <h1 className="pointer-events-auto text-5xl md:text-8xl text-white font-serif tracking-tight leading-[0.9] mt-2 animate-fade-rise-delay">
            Raw wireframe to <br />
            <span className="font-serif italic text-brand-orange glow-text">cinematic render.</span>
          </h1>

          {/* Subtext */}
          <p className="pointer-events-auto text-sm md:text-base text-gray-400 max-w-xl mt-4 leading-relaxed font-sans font-light animate-fade-rise-delay-2">
            Fully optimized, production-ready Blender 3D models. Equipped with seamless procedural shaders, pristine rigging, and studio-grade lighting templates. Hover your cursor above to reveal the mesh.
          </p>

          {/* Interactive instruction indicator */}
          {!hasMoved && (
            <div className="text-[10px] text-brand-orange/60 uppercase tracking-widest font-mono animate-bounce mt-3">
              ← Move Cursor to Reveal Textures →
            </div>
          )}

          {/* CTAs */}
          <div className="pointer-events-auto mt-8 flex flex-col sm:flex-row items-center gap-4 animate-fade-rise-delay-3">
            <button
              onClick={onBrowse}
              className="liquid-glass group text-xs text-white uppercase tracking-wider font-semibold px-8 py-4 rounded-full cursor-pointer flex items-center gap-2 hover:scale-[1.03] hover:border-brand-orange/40 shadow-xl"
            >
              <span>Explore Store Assets</span>
              <ChevronRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="#about"
              className="text-xs text-gray-400 hover:text-white transition-colors py-2 px-4 uppercase tracking-widest font-semibold font-mono"
            >
              Learn the Process
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
