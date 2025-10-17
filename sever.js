const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "products.json");
app.use(express.json());
function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]");
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
}
function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}
app.get("/products", (req, res) => {
  const products = readProducts();
  res.json(products);
});
app.get("/products/instock", (req, res) => {
  const products = readProducts().filter(p => p.inStock);
  res.json(products);
});

// ✅ POST /products → add new product
app.post("/products", (req, res) => {
  const { name, price, inStock } = req.body;

  if (!name || typeof price !== "number" || typeof inStock !== "boolean") {
    return res.status(400).json({ error: "Invalid product data." });
  }

  const products = readProducts();
  const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { id: newId, name, price, inStock };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});
app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, inStock } = req.body;
  const products = readProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Product not found." });
  if (name !== undefined) products[index].name = name;
  if (price !== undefined) products[index].price = price;
  if (inStock !== undefined) products[index].inStock = inStock;
  writeProducts(products);
  res.json(products[index]);
});
app.delete("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const products = readProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Product not found." });
  products.splice(index, 1);
  writeProducts(products);
  res.json({ message: "Product deleted successfully." });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});