import { useEffect, useState } from "react";
import { CheckCircle, Download, FileText, ArrowRight, ExternalLink, HelpCircle } from "lucide-react";
import { Product, Order } from "../types";

interface DownloadPageProps {
  token: string;
  onNavigate: (hash: string) => void;
}

export default function DownloadPage({ token, onNavigate }: DownloadPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Missing download token.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/orders/download/${token}`);
        const data = await res.json();

        if (res.ok) {
          setOrder(data.order);
          setProduct(data.product);
          setDownloadUrl(data.downloadUrl);
        } else {
          setError(data.error || "This download token is invalid or has expired.");
        }
      } catch (err) {
        setError("Failed to verify credentials due to a connection error.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const triggerDownload = () => {
    // Simulate real file download trigger
    setDownloadSuccess(true);
    // Create mock download element
    const element = document.createElement("a");
    const fileContent = `MOCK 3D BLENDER ASSET FILE CONTENT FOR: ${product?.title || "Asset"}\nID: ${product?.id || "unknown"}\nLicense: ${product?.license || "Royalty-free"}`;
    const file = new Blob([fileContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${product?.id || "blender-asset"}.blend`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="bg-dark-bg min-h-screen text-white pt-32 px-6 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 font-mono text-xs">VERIFYING SECURE DOWNLOAD TOKEN...</p>
      </div>
    );
  }

  if (error || !product || !order) {
    return (
      <div className="bg-dark-bg min-h-screen text-white pt-32 px-6 flex flex-col items-center justify-center font-sans text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-medium text-white">Verification Failed</h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">
          {error || "The requested secure token is no longer available on this node."}
        </p>
        <button
          onClick={() => onNavigate("#/shop")}
          className="mt-8 liquid-glass text-xs text-white uppercase tracking-wider font-mono font-bold px-6 py-3 rounded-full cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg min-h-screen text-white pt-28 pb-20 px-6 font-sans select-none">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Card */}
        <div className="p-8 md:p-12 rounded-[40px] bg-dark-card border border-white/10 relative overflow-hidden space-y-8">
          {/* Accent lighting */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-green-500/5 rounded-full blur-[50px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
            <div className="flex items-center gap-4">
              <span className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl block">
                <CheckCircle className="w-8 h-8" />
              </span>
              <div>
                <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider block font-bold">
                  Order Verified Securely
                </span>
                <h1 className="text-2xl md:text-3xl font-serif text-white mt-1">
                  Ready to download.
                </h1>
              </div>
            </div>
            
            <div className="text-left md:text-right font-mono text-xs text-gray-500">
              <span className="block">ORDER ID: {order.id}</span>
              <span className="block mt-0.5">DATE: {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Asset Summary */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-black/40 border border-white/5 items-center">
            <div className="w-20 h-20 rounded-xl bg-dark-card border border-dashed border-white/10 flex items-center justify-center font-mono text-xs text-gray-500 font-bold">
              [blend]
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] text-brand-orange uppercase tracking-wider font-mono block">
                {product.category}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{product.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start font-mono text-[10px] text-gray-500 mt-2">
                <span>FORMAT: {product.fileFormat}</span>
                <span>•</span>
                <span>POLYS: {product.polyCount}</span>
                <span>•</span>
                <span>LICENSE: {product.license}</span>
              </div>
            </div>

            <div className="font-mono text-right text-sm">
              <span className="text-gray-500 text-xs block">INVESTMENT</span>
              <span className="font-bold text-white">${order.pricePaid}</span>
            </div>
          </div>

          {/* Secure Download triggers */}
          <div className="space-y-4">
            <button
              onClick={triggerDownload}
              className="w-full py-5 px-8 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-white/5"
            >
              <Download className="w-5 h-5 text-brand-blue" />
              <span>Download Blender Asset Bundle</span>
            </button>

            {downloadSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-2xl text-center leading-relaxed">
                🎉 Your `.blend` asset bundle has started downloading! Import into your scene via <b>File → Append</b>.
              </div>
            )}
          </div>

          {/* Details / Help links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5 font-mono text-xs text-gray-500">
            <div className="space-y-2">
              <span className="text-white font-bold block uppercase tracking-wider text-[10px]">
                Delivery details
              </span>
              <p className="leading-relaxed font-sans text-gray-400 text-[11px]">
                We have also sent an automated email containing this secure link to <b>{order.email}</b>. You can return to this page anytime within 30 days to re-download.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-white font-bold block uppercase tracking-wider text-[10px]">
                Technical specifications
              </span>
              <p className="leading-relaxed font-sans text-gray-400 text-[11px]">
                This is a packed native Blend file containing all baked images and raw meshes. If textures appear pink, go to <b>File → External Data → Find Missing Files</b>.
              </p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="mt-8 flex justify-between items-center font-mono text-xs">
          <button
            onClick={() => onNavigate("#/shop")}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Return to Store
          </button>
          
          <button
            onClick={() => onNavigate("#/")}
            className="text-brand-orange hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Visit homepage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
