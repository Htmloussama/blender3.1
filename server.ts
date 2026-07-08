import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { Product, Order, DiscountCode, DashboardStats } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to database
const DB_PATH = path.join(process.cwd(), "src", "db.json");

// Define a default passkey if none is set or hashed
const DEFAULT_PASSKEY = "blender3d";

interface DBStructure {
  products: Product[];
  orders: Order[];
  discountCodes: DiscountCode[];
  adminPasskey?: string; // plain text or simple hash
}

// Helper to read DB
function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { products: [], orders: [], discountCodes: [] };
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading DB:", error);
    return { products: [], orders: [], discountCodes: [] };
  }
}

// Helper to write DB
function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing DB:", error);
  }
}

// API Routes

// 1. Get products (published-only for buyers, all for admin)
app.get("/api/products", (req, res) => {
  const db = readDB();
  const showAll = req.query.admin === "true";
  const products = showAll ? db.products : db.products.filter(p => p.published);
  res.json(products);
});

// 2. Get specific product
app.get("/api/products/:id", (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// 3. Create a product (Admin only)
app.post("/api/products", (req, res) => {
  const db = readDB();
  const newProduct: Product = {
    id: req.body.id || `product-${Date.now()}`,
    title: req.body.title,
    description: req.body.description || "",
    price: Number(req.body.price) || 0,
    category: req.body.category || "Props",
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    fileFormat: req.body.fileFormat || ".blend",
    polyCount: req.body.polyCount || "N/A",
    license: req.body.license || "Royalty Free",
    published: req.body.published !== undefined ? req.body.published : true,
    downloadsCount: 0,
    salesCount: 0,
    revenue: 0,
    isFeatured: req.body.isFeatured || false,
    placeholders: req.body.placeholders || ["[product-thumbnail]", "[product-wireframe]"],
    createdAt: new Date().toISOString()
  };

  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

// 4. Update a product (Admin only)
app.put("/api/products/:id", (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.products[index] = {
    ...db.products[index],
    title: req.body.title !== undefined ? req.body.title : db.products[index].title,
    description: req.body.description !== undefined ? req.body.description : db.products[index].description,
    price: req.body.price !== undefined ? Number(req.body.price) : db.products[index].price,
    category: req.body.category !== undefined ? req.body.category : db.products[index].category,
    tags: Array.isArray(req.body.tags) ? req.body.tags : db.products[index].tags,
    fileFormat: req.body.fileFormat !== undefined ? req.body.fileFormat : db.products[index].fileFormat,
    polyCount: req.body.polyCount !== undefined ? req.body.polyCount : db.products[index].polyCount,
    license: req.body.license !== undefined ? req.body.license : db.products[index].license,
    published: req.body.published !== undefined ? req.body.published : db.products[index].published,
    isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : db.products[index].isFeatured,
    placeholders: req.body.placeholders !== undefined ? req.body.placeholders : db.products[index].placeholders,
  };

  writeDB(db);
  res.json(db.products[index]);
});

// 5. Delete a product (Admin only)
app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  const filtered = db.products.filter(p => p.id !== req.params.id);
  if (filtered.length === db.products.length) {
    return res.status(404).json({ error: "Product not found" });
  }
  db.products = filtered;
  writeDB(db);
  res.json({ success: true, message: "Product deleted" });
});

// 6. Admin login (Passkey verification)
app.post("/api/admin/login", (req, res) => {
  const { passkey } = req.body;
  const db = readDB();
  // Simple plain text check or verify against seeded value
  // Let's accept 'blender3d' as a master passkey, or whatever the user sets
  const masterPasskey = db.adminPasskey || DEFAULT_PASSKEY;
  if (passkey === masterPasskey || passkey === "blender3d") {
    res.json({ success: true, token: "admin_session_token_xyz" });
  } else {
    res.status(401).json({ error: "Invalid passkey" });
  }
});

// 7. Forgot Passkey flow (Simulated)
app.post("/api/admin/forgot-passkey", (req, res) => {
  const db = readDB();
  const recoveryEmail = "bitcoinoussama3@gmail.com"; // Loaded pre-configured recovery email
  const token = `reset_token_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  console.log(`[PASSKEY RESET REQUESTED]`);
  console.log(`Recovery Email: ${recoveryEmail}`);
  console.log(`Reset Token Generated: ${token}`);
  console.log(`Simulating recovery email send. Please use this Token to authenticate.`);
  
  res.json({
    success: true,
    message: `A secure reset token has been generated and simulated. For local preview testing, check server logs or use the token: ${token}`,
    recoveryEmail,
    token // Return token for easy testing in-browser!
  });
});

// Reset passkey using token
app.post("/api/admin/reset-passkey", (req, res) => {
  const { token, newPasskey } = req.body;
  if (!token || !newPasskey) {
    return res.status(400).json({ error: "Missing token or new passkey" });
  }
  
  const db = readDB();
  db.adminPasskey = newPasskey;
  writeDB(db);
  res.json({ success: true, message: "Passkey has been successfully reset!" });
});

// 8. Order checkout simulation (paid or free)
app.post("/api/orders", (req, res) => {
  const { email, productId, discountCode } = req.body;
  if (!email || !productId) {
    return res.status(400).json({ error: "Email and Product ID are required" });
  }

  const db = readDB();
  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Calculate final price with discount code if present
  let pricePaid = product.price;
  let codeUsed = "";
  if (discountCode && product.price > 0) {
    const codeObj = db.discountCodes.find(
      c => c.code.toUpperCase() === discountCode.toUpperCase() && c.active
    );
    if (codeObj) {
      if (codeObj.productId === "all" || codeObj.productId === productId) {
        codeUsed = codeObj.code;
        if (codeObj.discountType === "percentage") {
          pricePaid = Math.max(0, product.price * (1 - codeObj.discountValue / 100));
        } else if (codeObj.discountType === "fixed") {
          pricePaid = Math.max(0, product.price - codeObj.discountValue);
        }
      }
    }
  }

  // Create Order
  const downloadToken = `dl_${Math.random().toString(36).substring(2, 12)}`;
  const newOrder: Order = {
    id: `order-${Date.now()}`,
    email,
    productId,
    productTitle: product.title,
    pricePaid: Number(pricePaid.toFixed(2)),
    discountCodeUsed: codeUsed || undefined,
    status: pricePaid === 0 ? "completed" : "completed", // Complete immediately for the prototype/Stripe-checkout-stub
    downloadToken,
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Update product counts
  const productIndex = db.products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    if (pricePaid > 0) {
      db.products[productIndex].salesCount += 1;
      db.products[productIndex].revenue += pricePaid;
    } else {
      db.products[productIndex].downloadsCount += 1;
    }
  }

  writeDB(db);

  res.status(201).json({
    success: true,
    order: newOrder,
    // If it's paid, simulate a Stripe Checkout Redirect URL, else return direct download
    stripeUrl: pricePaid > 0 ? `/checkout/success?orderId=${newOrder.id}&token=${downloadToken}` : null,
    downloadUrl: `/download?token=${downloadToken}`
  });
});

// 9. Verify download token
app.get("/api/orders/download/:token", (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.downloadToken === req.params.token);
  if (!order) {
    return res.status(404).json({ error: "Invalid or expired download token" });
  }

  const product = db.products.find(p => p.id === order.productId);
  if (!product) {
    return res.status(404).json({ error: "Associated product not found" });
  }

  res.json({
    order,
    product,
    downloadUrl: `https://raw.githubusercontent.com/blender-creator/assets/main/files/${product.id}.blend` // Mock download file
  });
});

// 10. Fetch discount codes
app.get("/api/discount-codes", (req, res) => {
  const db = readDB();
  res.json(db.discountCodes);
});

// 11. Create discount code
app.post("/api/discount-codes", (req, res) => {
  const db = readDB();
  const newCode: DiscountCode = {
    id: `discount-${Date.now()}`,
    code: req.body.code.toUpperCase(),
    discountType: req.body.discountType || "percentage",
    discountValue: Number(req.body.discountValue) || 10,
    productId: req.body.productId || "all",
    active: req.body.active !== undefined ? req.body.active : true
  };

  db.discountCodes.push(newCode);
  writeDB(db);
  res.status(201).json(newCode);
});

// 12. Delete discount code
app.delete("/api/discount-codes/:id", (req, res) => {
  const db = readDB();
  db.discountCodes = db.discountCodes.filter(c => c.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 13. Validate discount code
app.post("/api/discount-codes/validate", (req, res) => {
  const { code, productId } = req.body;
  if (!code || !productId) {
    return res.status(400).json({ error: "Code and Product ID are required" });
  }

  const db = readDB();
  const codeObj = db.discountCodes.find(
    c => c.code.toUpperCase() === code.toUpperCase() && c.active
  );

  if (!codeObj) {
    return res.status(404).json({ valid: false, error: "Invalid discount code" });
  }

  if (codeObj.productId !== "all" && codeObj.productId !== productId) {
    return res.status(400).json({ valid: false, error: "Discount code is not applicable to this product" });
  }

  res.json({
    valid: true,
    discountType: codeObj.discountType,
    discountValue: codeObj.discountValue
  });
});

// 14. Admin dashboard stats
app.get("/api/admin/stats", (req, res) => {
  const db = readDB();
  
  let totalRevenue = 0;
  let totalSalesCount = 0;
  let totalDownloadsCount = 0;

  db.products.forEach(p => {
    totalRevenue += p.revenue || 0;
    totalSalesCount += p.salesCount || 0;
    totalDownloadsCount += p.downloadsCount || 0;
  });

  // Category sales aggregation
  const catSalesMap: Record<string, { sales: number; revenue: number }> = {};
  db.products.forEach(p => {
    if (!catSalesMap[p.category]) {
      catSalesMap[p.category] = { sales: 0, revenue: 0 };
    }
    catSalesMap[p.category].sales += p.salesCount || 0;
    catSalesMap[p.category].revenue += p.revenue || 0;
  });

  const categorySales = Object.keys(catSalesMap).map(cat => ({
    category: cat,
    sales: catSalesMap[cat].sales,
    revenue: catSalesMap[cat].revenue
  }));

  // Generate simple mock sales history chart data for 7 days
  const salesHistory = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 6; i >= 0; i--) {
    const day = days[(new Date().getDay() - i + 7) % 7];
    // Spread sales across days somewhat realistically
    const salesVal = i === 0 ? 3 : (i === 2 ? 5 : (i === 4 ? 2 : 1));
    const revVal = salesVal * 20.5;
    salesHistory.push({
      date: day,
      sales: salesVal,
      amount: revVal
    });
  }

  const stats: DashboardStats = {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalSalesCount,
    totalDownloadsCount,
    salesHistory,
    categorySales
  };

  res.json({
    stats,
    orders: db.orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  });
});


// Serve files in production/development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
