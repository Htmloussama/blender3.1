import React, { useState, useEffect } from "react";
import { CheckCircle, ShoppingBag, X, Info, HelpCircle, ArrowRight } from "lucide-react";
import { Product } from "./types";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import DownloadPage from "./pages/DownloadPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Router hash state
  const [hash, setHash] = useState(window.location.hash || "#/");

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: "success" | "info" }>({
    message: "",
    visible: false,
    type: "success",
  });

  // 1. Listen for hash router changes
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 2. Fetch products on mount
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?admin=true");
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      }
    } catch (e) {
      console.error("Error loading products catalog", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Load initial cart
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // 3. Navigation helper
  const navigateTo = (newHash: string) => {
    window.location.hash = newHash;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Cart operations
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check duplicate
    if (cart.some((item) => item.id === product.id)) {
      showToast(`${product.title} is already inside your cart!`, "info");
      setIsCartOpen(true);
      return;
    }

    const updated = [...cart, product];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    showToast(`Successfully added ${product.title} to your cart!`, "success");
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // 5. Dynamic Toast Alert helper
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  // =========================================================
  // ROUTER COMPLIANCE COMPILATION
  // =========================================================
  const isProductDetail = hash.startsWith("#/product/");
  const activeProductId = isProductDetail ? hash.replace("#/product/", "").split("?")[0] : "";

  const isDownloadPage = hash.startsWith("#/download");
  // Extract token parameter from e.g. #/download?token=dl_abc
  const downloadToken = isDownloadPage ? (hash.split("token=")[1] || "") : "";

  const isCheckoutSuccess = hash.startsWith("#/checkout/success");
  const successOrderId = isCheckoutSuccess ? (hash.split("orderId=")[1]?.split("&")[0] || "") : "";
  const successToken = isCheckoutSuccess ? (hash.split("token=")[1] || "") : "";

  const isAdminDashboard = hash.startsWith("#/admin");

  return (
    <div className="bg-dark-bg min-h-screen text-white font-sans flex flex-col justify-between">
      
      {/* Dynamic Toast Alert Notification */}
      {toast.visible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] p-4 rounded-2xl bg-dark-card border border-brand-orange/40 text-xs font-mono text-white flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-bounce">
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Info className="w-5 h-5 text-brand-orange animate-spin" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Global Glassmorphic Nav */}
      <Navbar
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        currentHash={hash}
        onNavigate={navigateTo}
      />

      {/* 2. Side Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckoutSuccess={(orderId, token) => {
          navigateTo(`#/checkout/success?orderId=${orderId}&token=${token}`);
        }}
      />

      {/* 3. Render Pages based on parsed Router parameters */}
      <main className="flex-grow">
        {loading ? (
          <div className="min-h-screen flex flex-col items-center justify-center font-mono text-xs text-gray-400">
            <div className="w-10 h-10 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mb-4" />
            <span>SYNCHRONIZING VERSTEX GRAPH INDEX...</span>
          </div>
        ) : (
          <>
            {/* A. Checkout Success Screen */}
            {isCheckoutSuccess && (
              <div className="min-h-screen pt-28 pb-16 px-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md p-8 rounded-[40px] bg-dark-card border border-white/10 text-center space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-green-500/5 rounded-full blur-[40px] pointer-events-none" />
                  
                  <div className="flex flex-col items-center gap-3">
                    <span className="p-4 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 block">
                      <CheckCircle className="w-8 h-8" />
                    </span>
                    <span className="text-[10px] text-green-400 font-mono uppercase tracking-widest font-bold">
                      Mock payment successful
                    </span>
                    <h2 className="text-3xl font-serif text-white">Stripe Checkout OK</h2>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                      Thank you for your investment! Your order <b>{successOrderId}</b> has been securely logged on our merchant terminal.
                    </p>
                  </div>

                  {/* Redirection trigger */}
                  <button
                    onClick={() => navigateTo(`#/download?token=${successToken}`)}
                    className="w-full liquid-glass group py-4 px-6 text-xs text-white uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Enter Secure Download Area</span>
                    <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-600 font-mono">
                    <span>STRIPE GATEWAY STUB</span>
                    <span>SUCCESS_NODE_01</span>
                  </div>
                </div>
              </div>
            )}

            {/* B. Admin Dashboard Page */}
            {isAdminDashboard && (
              <AdminDashboard
                products={products}
                onRefreshProducts={fetchProducts}
                onNavigate={navigateTo}
              />
            )}

            {/* C. Secure Download Area */}
            {isDownloadPage && (
              <DownloadPage
                token={downloadToken}
                onNavigate={navigateTo}
              />
            )}

            {/* D. Product Detail Spec Page */}
            {isProductDetail && (
              <ProductDetail
                productId={activeProductId}
                products={products}
                onBack={() => navigateTo("#/shop")}
                onAddToCart={handleAddToCart}
                onSelectProduct={(id) => navigateTo(`#/product/${id}`)}
              />
            )}

            {/* E. Complete Shop Grid */}
            {hash.startsWith("#/shop") && (
              <Shop
                products={products}
                onSelectProduct={(id) => navigateTo(`#/product/${id}`)}
                onAddToCart={handleAddToCart}
                currentHash={hash}
              />
            )}

            {/* F. Homepage */}
            {(hash === "#/" || hash === "") && (
              <Home
                products={products}
                onSelectProduct={(id) => navigateTo(`#/product/${id}`)}
                onAddToCart={handleAddToCart}
                onNavigate={navigateTo}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
