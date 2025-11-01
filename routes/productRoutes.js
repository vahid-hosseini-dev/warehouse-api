const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authenticateToken = require('../middleware/authMiddleware');
const Product = require('../models/Product');

const router = express.Router();

// GET all products (with filters)
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 10, name, minPrice, maxPrice } = req.query;

    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const query = {};

    if (name) query.name = new RegExp(name, 'i'); // case-insensitive
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalProducts,
      page,
      limit,
      totalPages,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(400).json({ message: 'Invalid product ID' });
  }
});

// POST new product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE single product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE multiple products
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: 'IDs should be an array' });

    const result = await Product.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'No products found to delete' });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
