import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Grid, Archive, Filter, RefreshCw } from "lucide-react";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";

interface ShopProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  currentHash: string;
}

export default function Shop({ products, onSelectProduct, onAddToCart, currentHash }: ShopProps) {
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceType, setPriceType] = useState<"all" | "free" | "paid">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "popularity">("newest");

  // Handle incoming filters from query params (e.g., #/shop?filter=free)
  useEffect(() => {
    if (currentHash.includes("filter=free")) {
      setPriceType("free");
    } else {
      setPriceType("all");
    }
  }, [currentHash]);

  // Extract all unique categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // Perform filtering and sorting
  const filteredProducts = products
    .filter((product) => {
      // 1. Search Query
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

      // 3. Price type
      const matchesPrice =
        priceType === "all" ||
        (priceType === "free" && product.price === 0) ||
        (priceType === "paid" && product.price > 0);

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      if (sortBy === "popularity") {
        // Sort by downloadsCount + salesCount combined
        const popA = (a.downloadsCount || 0) + (a.salesCount || 0);
        const popB = (b.downloadsCount || 0) + (b.salesCount || 0);
        return popB - popA;
      }
      return 0;
    });

  return (
    <div className="bg-dark-bg min-h-screen text-white pt-24 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-white/5 pb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-orange block mb-2">
            Asset Repository
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">
            The Complete <span className="font-serif italic text-brand-orange">Asset Catalog.</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-xl font-light">
            Search, filter, and extract production-grade Blender elements with quad meshes and native Blender Cycles setups.
          </p>
        </div>

        {/* Toolbar Filter / Search Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="space-y-6 lg:border-r lg:border-white/5 lg:pr-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-orange" /> Filter Controls
              </span>
              {(searchQuery || selectedCategory !== "All" || priceType !== "all" || sortBy !== "newest") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setPriceType("all");
                    setSortBy("newest");
                  }}
                  className="text-[10px] text-brand-orange font-mono hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {/* 1. Category list */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-2">
                Categories
              </label>
              <div className="flex flex-wrap lg:flex-col gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs rounded-xl font-mono border text-left cursor-pointer transition-all ${
                      selectedCategory === cat
                        ? "bg-brand-orange/10 border-brand-orange text-white"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Price Tier */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-2">
                Price Tier
              </label>
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 font-mono text-xs text-center text-gray-400">
                <button
                  onClick={() => setPriceType("all")}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    priceType === "all" ? "bg-white/5 text-white" : "hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPriceType("free")}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    priceType === "free" ? "bg-white/5 text-white" : "hover:text-white"
                  }`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPriceType("paid")}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    priceType === "paid" ? "bg-white/5 text-white" : "hover:text-white"
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* 3. Sort ordering */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-2">
                Sort Hierarchy
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-brand-orange/50 transition-colors font-mono cursor-pointer"
              >
                <option value="newest">Release Date (Newest)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="popularity">Popularity Index</option>
              </select>
            </div>
          </div>

          {/* Right Product Grid Area */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by keywords, tags, categories, or mesh features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all font-sans"
              />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="h-96 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-6">
                <span className="p-4 bg-white/5 border border-white/10 rounded-full text-gray-500 block mb-4">
                  <Archive className="w-8 h-8" />
                </span>
                <p className="text-gray-400 text-sm font-sans">No matching 3D assets found in active index.</p>
                <span className="text-[10px] text-gray-600 block mt-1">
                  Try adjusting your keywords or clearing active filters.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            )}
            
            {/* Grid statistics status bar */}
            <div className="p-4 border border-white/5 rounded-2xl bg-black/20 flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>ACTIVE INDEX COMPILATION: GREEN</span>
              <span>LISTING {filteredProducts.length} OF {products.length} OBJECTS</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
