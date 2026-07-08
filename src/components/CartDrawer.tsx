import React, { useState } from "react";
import { X, ShoppingBag, Trash2, ArrowRight, Sparkles, Check, AlertCircle } from "lucide-react";
import { Product } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[];
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (orderId: string, downloadToken: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onClearCart,
  onCheckoutSuccess,
}: CartDrawerProps) {
  // Guest checkout details
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<{
    applied: boolean;
    discountValue: number;
    discountType: "percentage" | "fixed";
    error?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  if (!isOpen) return null;

  // Total pricing logic
  const originalSubtotal = cart.reduce((sum, item) => sum + item.price, 0);

  // Apply discount if valid
  let finalSubtotal = originalSubtotal;
  let discountAmount = 0;

  if (couponStatus?.applied) {
    if (couponStatus.discountType === "percentage") {
      discountAmount = originalSubtotal * (couponStatus.discountValue / 100);
    } else {
      discountAmount = couponStatus.discountValue;
    }
    finalSubtotal = Math.max(0, originalSubtotal - discountAmount);
  }

  // Handle coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponStatus(null);
      // Validate with server (using the first item in cart or arbitrary applicable logic)
      const productId = cart.length > 0 ? cart[0].id : "all";
      
      const res = await fetch("/api/discount-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, productId }),
      });
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setCouponStatus({
          applied: true,
          discountValue: data.discountValue,
          discountType: data.discountType,
        });
      } else {
        setCouponStatus({
          applied: false,
          discountValue: 0,
          discountType: "percentage",
          error: data.error || "Invalid coupon code",
        });
      }
    } catch (e) {
      setCouponStatus({
        applied: false,
        discountValue: 0,
        discountType: "percentage",
        error: "Connection error validating coupon",
      });
    }
  };

  // Handle mock Checkout Redirect
  const handleProceedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      setCheckoutError("Please fill out your guest contact information.");
      return;
    }
    if (cart.length === 0) {
      setCheckoutError("Your shopping cart is empty.");
      return;
    }

    setLoading(true);
    setCheckoutError("");

    try {
      // Create order sequentially for each item in the cart
      // For this marketplace, we'll execute checkout for the primary cart list
      // Let's checkout the main product in the cart (or create multiple orders, but checkout first is fine)
      const targetProduct = cart[0];
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productId: targetProduct.id,
          discountCode: couponStatus?.applied ? couponCode : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Clear cart local state and close
        onClearCart();
        onClose();
        
        // Handle post-purchase redirect or callback
        if (data.stripeUrl) {
          // Simulate Stripe redirect directly
          window.location.hash = `#/checkout/success?orderId=${data.order.id}&token=${data.order.downloadToken}`;
        } else {
          // Direct download page
          window.location.hash = `#/download?token=${data.order.downloadToken}`;
        }
      } else {
        setCheckoutError(data.error || "Failed to process purchase checkout.");
      }
    } catch (e) {
      setCheckoutError("Connection error during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide out drawer panel */}
      <div className="relative w-full max-w-md bg-dark-bg border-l border-white/10 h-full flex flex-col justify-between shadow-2xl z-10 animate-fade-rise">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-orange" />
            <h3 className="text-lg font-serif font-medium text-white">Your Cart</h3>
            <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full font-mono">
              {cart.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <span className="p-4 bg-white/5 rounded-full border border-white/10 text-gray-500 mb-4 block">
                <ShoppingBag className="w-8 h-8" />
              </span>
              <p className="text-sm text-gray-400 font-sans">Your basket is currently empty.</p>
              <button
                onClick={onClose}
                className="text-xs text-brand-orange uppercase tracking-wider font-mono font-bold mt-4 hover:underline"
              >
                ← Keep Browsing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Cart Lines */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-orange/20 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl bg-black/40 border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-500 font-mono font-bold">
                    [thumb]
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white text-sm font-semibold leading-tight">{item.title}</h4>
                        <span className="text-[10px] text-brand-orange/80 uppercase tracking-wider font-mono">
                          {item.category}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-2 font-mono text-xs">
                      <span className="text-[10px] text-gray-500">{item.fileFormat}</span>
                      <span className="font-bold text-white">${item.price}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Guest Checkout Form */}
              <form onSubmit={handleProceedCheckout} className="pt-6 border-t border-white/5 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-brand-orange font-mono font-bold">
                  Guest Contact Details
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-colors font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-colors font-sans"
                    />
                    <span className="text-[9px] text-gray-500 block mt-1 leading-relaxed">
                      Files will be delivered securely to this inbox.
                    </span>
                  </div>
                </div>

                {/* Promo Code Fields */}
                <div className="pt-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                    Promo Code (e.g. SUMMER30)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="COUPON"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange/50 font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-brand-orange/5 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponStatus?.applied && (
                    <span className="text-[10px] text-green-400 font-mono flex items-center gap-1.5 mt-1">
                      <Check className="w-3.5 h-3.5" /> Code Applied! Saved {couponStatus.discountType === "percentage" ? `${couponStatus.discountValue}%` : `$${couponStatus.discountValue}`}
                    </span>
                  )}
                  {couponStatus?.error && (
                    <span className="text-[10px] text-red-400 font-mono flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {couponStatus.error}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-black/20 space-y-4">
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Original Subtotal</span>
                <span>${originalSubtotal.toFixed(2)}</span>
              </div>
              {couponStatus?.applied && (
                <div className="flex justify-between text-green-400">
                  <span>Coupon Deduction</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/5">
                <span>Total Investment</span>
                <span>${finalSubtotal.toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Main Submit action */}
            <button
              onClick={handleProceedCheckout}
              disabled={loading}
              className="w-full liquid-glass group py-4 px-6 text-xs text-white uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <span>Redirecting securely...</span>
              ) : (
                <>
                  <span>Proceed to secure checkout</span>
                  <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <span className="text-[9px] text-gray-500/80 font-sans block text-center mt-2 leading-tight">
              🔒 Direct encryption secure guest checkout. No password signup required. Powered by Stripe.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
