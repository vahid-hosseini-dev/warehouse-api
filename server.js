const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/db");
let swaggerDocument;

try {
  swaggerDocument = require("./swagger/swagger.json");
} catch (err) {
  console.warn("⚠️ Swagger file not found, skipping /api-docs route.");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);

if (swaggerDocument) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ Warehouse API is running. Go to /api-docs for documentation.");
});

// Connect DB and start server
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
  