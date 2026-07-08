import { useState, useEffect } from "react";
import { ShoppingCart, Hammer, Lock } from "lucide-react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  currentHash: string;
  onNavigate: (hash: string) => void;
}

export default function Navbar({ cartCount, onOpenCart, currentHash, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-dark-bg/85 backdrop-blur-md py-3 border-b border-white/5" : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => onNavigate("#/")}
          className="flex items-center gap-2 text-white group cursor-pointer"
        >
          <div className="p-1.5 bg-brand-orange/10 rounded-lg border border-brand-orange/30 group-hover:border-brand-orange transition-colors">
            <Hammer className="w-5 h-5 text-brand-orange animate-pulse" />
          </div>
          <span className="font-serif text-2xl tracking-wide font-medium italic group-hover:text-brand-orange transition-colors">
            Vertex<span className="text-brand-orange">3D</span>
          </span>
        </button>

        {/* Floating Centered Pill Links */}
        <div className="hidden md:flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-1.5 gap-6 text-sm text-gray-300">
          <button
            onClick={() => onNavigate("#/")}
            className={`transition-colors hover:text-white cursor-pointer py-1 px-3 rounded-full ${
              currentHash === "#/" || currentHash === "" ? "text-brand-orange bg-white/5" : ""
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate("#/shop")}
            className={`transition-colors hover:text-white cursor-pointer py-1 px-3 rounded-full ${
              currentHash.startsWith("#/shop") ? "text-brand-orange bg-white/5" : ""
            }`}
          >
            Shop Assets
          </button>
          <a
            href="https://blender.org"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white py-1 px-3"
          >
            Blender.org
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Icon Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-gray-300 hover:text-brand-orange transition-colors rounded-full hover:bg-white/5 cursor-pointer"
            id="nav-cart-btn"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border border-dark-bg">
                {cartCount}
              </span>
            )}
          </button>

          {/* Liquid Glass CTA button */}
          <button
            onClick={() => onNavigate("#/shop")}
            className="liquid-glass text-xs text-white uppercase tracking-wider font-semibold px-5 py-2.5 rounded-full cursor-pointer hover:scale-[1.03]"
          >
            Browse Store
          </button>
        </div>
      </div>
    </nav>
  );
}
