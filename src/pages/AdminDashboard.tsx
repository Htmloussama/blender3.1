import React, { useState, useEffect } from "react";
import { Lock, Shield, Eye, EyeOff, LayoutDashboard, Plus, Trash2, Edit, Tag, ToggleLeft, ToggleRight, DollarSign, Download, ShoppingBag, PlusCircle, Calendar, RefreshCw, LogOut, Check, AlertCircle } from "lucide-react";
import { Product, Order, DiscountCode, DashboardStats } from "../types";

interface AdminDashboardProps {
  products: Product[];
  onRefreshProducts: () => void;
  onNavigate: (hash: string) => void;
}

export default function AdminDashboard({ products, onRefreshProducts, onNavigate }: AdminDashboardProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Forgot passkey states
  const [forgotTokenMsg, setForgotTokenMsg] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPasskey, setNewPasskey] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Dashboard state loading from API
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<DiscountCode[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Tab views
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "coupons">("overview");

  // Product CRUD Modal/Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form values
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("0");
  const [pCategory, setPCategory] = useState("Environments");
  const [pTags, setPTags] = useState("");
  const [pFileFormat, setPFileFormat] = useState(".blend");
  const [pPolyCount, setPPolyCount] = useState("");
  const [pLicense, setPLicense] = useState("Royalty Free");
  const [pPublished, setPPublished] = useState(true);
  const [pIsFeatured, setPIsFeatured] = useState(false);

  // Coupon manager states
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [cCode, setCCode] = useState("");
  const [cType, setCType] = useState<"percentage" | "fixed">("percentage");
  const [cValue, setCValue] = useState("10");
  const [cProductId, setCProductId] = useState("all");

  // Check existing session token on mount
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken === "admin_session_token_xyz") {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  // Fetch admin dashboard data from API
  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.stats);
        setOrders(statsData.orders);
      }

      const couponsRes = await fetch("/api/discount-codes");
      const couponsData = await couponsRes.json();
      if (couponsRes.ok) {
        setCoupons(couponsData);
      }
    } catch (err) {
      console.error("Connection error loading stats");
    } finally {
      setLoadingStats(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setForgotTokenMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setLoginError(data.error || "Incorrect passkey. Access Denied.");
      }
    } catch (err) {
      setLoginError("Connection error.");
    }
  };

  // Forgot passkey handler (Simulates secure recovery token generation)
  const handleForgotPasskey = async () => {
    setLoginError("");
    setResetSuccess("");
    try {
      const res = await fetch("/api/admin/forgot-passkey", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setForgotTokenMsg(`A secure recovery token has been simulated. Check server terminal or utilize: ${data.token}`);
      }
    } catch (err) {
      setLoginError("Failed to initiate passkey recovery flow.");
    }
  };

  // Reset passkey with token
  const handleResetPasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setResetSuccess("");
    if (!resetToken || !newPasskey) return;

    try {
      const res = await fetch("/api/admin/reset-passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPasskey }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess("Passkey has been reset successfully! Please sign in.");
        setForgotTokenMsg("");
        setResetToken("");
        setNewPasskey("");
      } else {
        setLoginError(data.error || "Reset token validation failed.");
      }
    } catch (err) {
      setLoginError("Failed to reset passkey.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setPasskey("");
  };

  // Open product creator form
  const handleOpenProductModal = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPTitle(prod.title);
      setPDesc(prod.description);
      setPPrice(String(prod.price));
      setPCategory(prod.category);
      setPTags(prod.tags.join(", "));
      setPFileFormat(prod.fileFormat);
      setPPolyCount(prod.polyCount);
      setPLicense(prod.license);
      setPPublished(prod.published);
      setPIsFeatured(prod.isFeatured);
    } else {
      setEditingProduct(null);
      setPTitle("");
      setPDesc("");
      setPPrice("0");
      setPCategory("Environments");
      setPTags("");
      setPFileFormat(".blend");
      setPPolyCount("");
      setPLicense("Royalty Free");
      setPPublished(true);
      setPIsFeatured(false);
    }
    setShowProductModal(true);
  };

  // Submit Product Create or Edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim()) return;

    const payload = {
      title: pTitle,
      description: pDesc,
      price: Number(pPrice) || 0,
      category: pCategory,
      tags: pTags.split(",").map((t) => t.trim()).filter(Boolean),
      fileFormat: pFileFormat,
      polyCount: pPolyCount,
      license: pLicense,
      published: pPublished,
      isFeatured: pIsFeatured,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowProductModal(false);
        onRefreshProducts();
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to save product changes");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this asset registry?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshProducts();
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Connection error deleting product");
    }
  };

  // Toggle Free ↔ Paid instantly
  const handleToggleProductPriceType = async (prod: Product) => {
    const updatedPrice = prod.price > 0 ? 0 : 15; // default mock price of 15 when transitioning to paid
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: updatedPrice }),
      });
      if (res.ok) {
        onRefreshProducts();
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Error toggling product type");
    }
  };

  // Toggle Published ↔ Draft instantly
  const handleTogglePublishStatus = async (prod: Product) => {
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !prod.published }),
      });
      if (res.ok) {
        onRefreshProducts();
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Error toggling publication status");
    }
  };

  // Create Coupon Code
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim()) return;

    try {
      const res = await fetch("/api/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cCode.toUpperCase(),
          discountType: cType,
          discountValue: Number(cValue) || 10,
          productId: cProductId,
        }),
      });

      if (res.ok) {
        setShowCouponModal(false);
        setCCode("");
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to create discount code");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/discount-codes/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to delete coupon");
    }
  };

  // =========================================================
  // LOCK SCREEN: PASSKEY ONLY SIGN-IN
  // =========================================================
  if (!isAuthenticated) {
    return (
      <div className="bg-dark-bg min-h-screen text-white pt-28 flex flex-col items-center justify-center px-6 font-sans select-none">
        <div className="w-full max-w-md p-8 md:p-10 rounded-[36px] bg-dark-card border border-white/10 relative overflow-hidden space-y-6 text-center">
          
          {/* Lock Header */}
          <div className="flex flex-col items-center gap-3">
            <span className="p-3.5 bg-brand-orange/10 border border-brand-orange/30 rounded-full text-brand-orange">
              <Lock className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <span className="text-[10px] text-brand-orange font-mono uppercase tracking-widest font-bold">
                Admin Access Only
              </span>
              <h2 className="text-2xl font-serif text-white">Console Authorization</h2>
              <p className="text-xs text-gray-500 font-light max-w-xs mx-auto">
                Authorized developer console for Blender marketplace modifications and revenue trackers.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPasskey ? "text" : "password"}
                required
                placeholder="Enter Access Passkey (e.g. blender3d)"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-center text-white focus:outline-none focus:border-brand-orange/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-white cursor-pointer"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-left flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs text-left flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </form>

          {/* Reset password button */}
          {!forgotTokenMsg && (
            <button
              onClick={handleForgotPasskey}
              className="text-[10px] text-gray-500 hover:text-brand-orange transition-colors font-mono cursor-pointer"
            >
              Forgot passkey? Trigger simulated reset
            </button>
          )}

          {/* Forgot Passkey input panel */}
          {forgotTokenMsg && (
            <div className="pt-4 border-t border-white/5 space-y-4 text-left">
              <div className="p-3 rounded-lg bg-black/50 border border-brand-orange/20 text-[10px] text-brand-orange font-mono break-all leading-normal">
                {forgotTokenMsg}
              </div>

              <form onSubmit={handleResetPasskeySubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Paste Reset Token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
                <input
                  type="password"
                  required
                  placeholder="New Access Passkey"
                  value={newPasskey}
                  onChange={(e) => setNewPasskey(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-orange text-white text-xs font-mono font-bold rounded-lg hover:bg-brand-orange/90 transition-colors cursor-pointer"
                >
                  Verify Token & Save
                </button>
              </form>
            </div>
          )}

          <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-600 font-mono">
            <span>SECURE CRYPTO CONSOLE</span>
            <span>NODE_V_2026</span>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD MAIN VIEW
  // =========================================================
  return (
    <div className="bg-dark-bg min-h-screen text-white pt-24 pb-20 px-6 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-mono uppercase tracking-widest text-brand-orange font-bold">
                Gumroad / CGTrader Merchant Hub
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight">
              Seller <span className="font-serif italic text-brand-orange">Console.</span>
            </h1>
          </div>

          {/* Quick Stats Toolbar */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Sales Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-white/5 font-mono text-xs text-gray-400 gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 px-2 transition-colors cursor-pointer ${
              activeTab === "overview" ? "border-brand-orange text-white" : "border-transparent hover:text-white"
            }`}
          >
            Overview & Sales
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 border-b-2 px-2 transition-colors cursor-pointer ${
              activeTab === "products" ? "border-brand-orange text-white" : "border-transparent hover:text-white"
            }`}
          >
            Manage Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`pb-3 border-b-2 px-2 transition-colors cursor-pointer ${
              activeTab === "coupons" ? "border-brand-orange text-white" : "border-transparent hover:text-white"
            }`}
          >
            Discount Coupons ({coupons.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & SALES HISTORIES */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Revenue */}
              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 relative overflow-hidden">
                <span className="p-2 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange inline-block mb-4">
                  <DollarSign className="w-5 h-5" />
                </span>
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block">
                  Aggregate Revenue
                </span>
                <span className="text-2xl md:text-3xl font-mono font-bold text-white block mt-1">
                  ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : "0.00"}
                </span>
                <span className="text-[10px] text-gray-600 font-mono block mt-2">
                  SECURED MERCHANT WALLET
                </span>
              </div>

              {/* Card 2: Sales */}
              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 relative overflow-hidden">
                <span className="p-2 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange inline-block mb-4">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block">
                  Product Sales
                </span>
                <span className="text-2xl md:text-3xl font-mono font-bold text-white block mt-1">
                  {stats?.totalSalesCount || 0} units
                </span>
                <span className="text-[10px] text-gray-600 font-mono block mt-2">
                  PAID STRIPE CONVERSIONS
                </span>
              </div>

              {/* Card 3: Free downloads */}
              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 relative overflow-hidden">
                <span className="p-2 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue inline-block mb-4">
                  <Download className="w-5 h-5" />
                </span>
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block">
                  Free Library Downloads
                </span>
                <span className="text-2xl md:text-3xl font-mono font-bold text-white block mt-1">
                  {stats?.totalDownloadsCount || 0} files
                </span>
                <span className="text-[10px] text-gray-600 font-mono block mt-2">
                  GUMROAD EMAIL LEADS ACQUIRED
                </span>
              </div>

            </div>

            {/* Custom SVG Sales Chart and Recent Orders split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sales Chart (7 columns) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-white font-medium">Weekly Conversion Velocity</h3>
                  <span className="text-[10px] text-brand-orange font-mono bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Interactive SVG
                  </span>
                </div>

                {/* SVG Graph Drawing */}
                <div className="h-[200px] w-full bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col justify-between relative font-mono text-[9px] text-gray-500">
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-5">
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                  </div>

                  {/* SVG Container drawing polyline */}
                  <div className="flex-1 w-full relative h-[120px] pt-4">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e8702a" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#e8702a" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      {/* Area */}
                      <polygon 
                        points="5,30 20,20 35,27 50,15 65,22 80,10 95,5 95,30" 
                        fill="url(#chartGrad)" 
                      />
                      {/* Stroke */}
                      <polyline 
                        fill="none" 
                        stroke="#e8702a" 
                        strokeWidth="0.7" 
                        points="5,30 20,20 35,27 50,15 65,22 80,10 95,5" 
                        strokeDasharray="100" 
                        strokeDashoffset="0"
                      />
                      {/* Nodes */}
                      <circle cx="5" cy="30" r="0.8" fill="#e8702a" />
                      <circle cx="20" cy="20" r="0.8" fill="#e8702a" />
                      <circle cx="35" cy="27" r="0.8" fill="#e8702a" />
                      <circle cx="50" cy="15" r="0.8" fill="#e8702a" />
                      <circle cx="65" cy="22" r="0.8" fill="#e8702a" />
                      <circle cx="80" cy="10" r="0.8" fill="#e8702a" />
                      <circle cx="95" cy="5" r="0.8" fill="#e8702a" />
                    </svg>
                  </div>

                  {/* X-Axis labels */}
                  <div className="flex justify-between border-t border-white/5 pt-2 px-1 text-center font-bold">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders List (5 columns) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg text-white font-medium">Recent Orders Log</h3>
                  <span className="text-[10px] text-gray-500 font-mono">Gumroad Feed</span>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {orders.length === 0 ? (
                    <p className="text-xs text-gray-500 font-mono py-8 text-center">No orders documented.</p>
                  ) : (
                    orders.map((o) => (
                      <div
                        key={o.id}
                        className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] flex justify-between items-center gap-2"
                      >
                        <div>
                          <span className="text-white block font-semibold truncate max-w-[140px]">{o.productTitle}</span>
                          <span className="text-gray-500 block text-[9px] truncate max-w-[140px] mt-0.5">{o.email}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold block">${o.pricePaid}</span>
                          <span className="text-brand-orange text-[8px] block uppercase mt-0.5">{o.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT CRUD LIST */}
        {activeTab === "products" && (
          <div className="space-y-6">
            
            {/* Header action */}
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-white">Marketplace Product Registries</h3>
              <button
                onClick={() => handleOpenProductModal(null)}
                className="liquid-glass text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-white"
              >
                <PlusCircle className="w-4 h-4 text-brand-orange" />
                <span>Add New Asset</span>
              </button>
            </div>

            {/* List Table */}
            <div className="border border-white/5 rounded-2xl bg-dark-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-gray-400">
                  <thead className="bg-black/60 text-gray-500 uppercase text-[9px] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-4 px-6">Product Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Type Toggle</th>
                      <th className="py-4 px-6">Release Node</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        {/* Title */}
                        <td className="py-4 px-6 font-semibold text-white">
                          <div className="flex flex-col">
                            <span>{p.title}</span>
                            <span className="text-[9px] text-gray-500 font-normal mt-0.5">ID: {p.id}</span>
                          </div>
                        </td>
                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="text-xs">{p.category}</span>
                        </td>
                        {/* Price */}
                        <td className="py-4 px-6 text-white font-bold">
                          {p.price === 0 ? "FREE" : `$${p.price}`}
                        </td>
                        {/* Toggle Free/Paid */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleProductPriceType(p)}
                            className="text-brand-orange hover:underline uppercase text-[9px] font-bold cursor-pointer"
                          >
                            Set to {p.price > 0 ? "Free" : "Paid"}
                          </button>
                        </td>
                        {/* Draft/Published toggle */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleTogglePublishStatus(p)}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            {p.published ? (
                              <span className="text-green-400 flex items-center gap-1">
                                <ToggleRight className="w-4 h-4" /> Published
                              </span>
                            ) : (
                              <span className="text-gray-500 flex items-center gap-1">
                                <ToggleLeft className="w-4 h-4" /> Draft
                              </span>
                            )}
                          </button>
                        </td>
                        {/* CRUD actions */}
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenProductModal(p)}
                            className="p-1.5 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:border-white/10 transition-colors cursor-pointer inline-block"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer inline-block"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DISCOUNT COUPONS */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            
            {/* Action Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-white">Active Store Coupons</h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="liquid-glass text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-white"
              >
                <PlusCircle className="w-4 h-4 text-brand-orange" />
                <span>Create Coupon</span>
              </button>
            </div>

            {/* Coupons list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-dark-card border border-white/5 flex justify-between items-center font-mono text-xs hover:border-brand-orange/20 transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-white font-bold text-sm bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
                      {c.code}
                    </span>
                    <p className="text-gray-500 text-[10px] pt-1">
                      DEDUCTION: {c.discountType === "percentage" ? `${c.discountValue}% Off` : `$${c.discountValue} Off`}
                    </p>
                    <p className="text-gray-600 text-[9px]">
                      APPLICABILITY: {c.productId === "all" ? "GLOBAL (All Products)" : `Product: ${c.productId}`}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD / EDIT PRODUCT DIALOG */}
        {/* ========================================================= */}
        {showProductModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            {/* Backdrop overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
            
            {/* Modal Body */}
            <div className="relative w-full max-w-lg bg-dark-card border border-white/10 rounded-[32px] p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 z-10 font-sans">
              
              <h3 className="font-serif text-2xl text-white">
                {editingProduct ? "Revise Asset Registry" : "Introduce New 3D Asset"}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                
                {/* Title */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Asset Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyberpunk Vending Machine"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-orange/50 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide modularity details, packed textures descriptions..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-orange/50 transition-colors leading-relaxed"
                  />
                </div>

                {/* Price, Category Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Price ($USD, 0 for Free)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-orange/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Environments">Environments</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="Characters">Characters</option>
                      <option value="Shaders/Materials">Shaders/Materials</option>
                      <option value="Props">Props</option>
                      <option value="Addons">Addons</option>
                    </select>
                  </div>
                </div>

                {/* Format, Polycount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">File Extension Format</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. .blend, .fbx"
                      value={pFileFormat}
                      onChange={(e) => setPFileFormat(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Vertex Topology Size</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 42k Verts, Procedural Nodes"
                      value={pPolyCount}
                      onChange={(e) => setPPolyCount(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Licensing, Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Licensing Type</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royalty Free / CC-BY"
                      value={pLicense}
                      onChange={(e) => setPLicense(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Sci-Fi, Rigged, Modular"
                      value={pTags}
                      onChange={(e) => setPTags(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Featured and Publication status toggles */}
                <div className="flex gap-6 items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-gray-400">
                    <input
                      type="checkbox"
                      checked={pPublished}
                      onChange={(e) => setPPublished(e.target.checked)}
                      className="accent-brand-orange"
                    />
                    <span>Publish Asset Registry</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-gray-400">
                    <input
                      type="checkbox"
                      checked={pIsFeatured}
                      onChange={(e) => setPIsFeatured(e.target.checked)}
                      className="accent-brand-orange"
                    />
                    <span>Flag as Featured Stack</span>
                  </label>
                </div>

                {/* Placeholder image slot instructions */}
                <div className="p-3 bg-black/50 border border-dashed border-white/5 rounded-xl font-mono text-[9px] text-gray-500 uppercase space-y-1">
                  <span className="text-white block font-bold">📂 Media slot placeholder guidelines</span>
                  <span>System will auto-allocate visual slots based on details:</span>
                  <span className="block mt-0.5">[{pTitle.toLowerCase().replace(/\s+/g, '-')}-render], [{pTitle.toLowerCase().replace(/\s+/g, '-')}-wireframe]</span>
                </div>

                {/* Submit actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-semibold uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    {editingProduct ? "Save Edits" : "Launch Asset"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD COUPON CODE DIALOG */}
        {/* ========================================================= */}
        {showCouponModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCouponModal(false)} />
            
            <div className="relative w-full max-w-sm bg-dark-card border border-white/10 rounded-[32px] p-6 space-y-4 z-10 font-sans">
              <h3 className="font-serif text-xl text-white">Create Discount Code</h3>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER30"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-orange/50 uppercase font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Reduction Type</label>
                    <select
                      value={cType}
                      onChange={(e) => setCType(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cash ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Deduction Value</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={cValue}
                      onChange={(e) => setCValue(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Applicable Product</label>
                  <select
                    value={cProductId}
                    onChange={(e) => setCProductId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  >
                    <option value="all">GLOBAL (Applicable to All Products)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCouponModal(false)}
                    className="flex-1 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-semibold uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
