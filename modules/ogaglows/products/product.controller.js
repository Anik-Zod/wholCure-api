import Product from "./product.model.js";

// Get all products with search, filter, sort, pagination
export const getAllProducts = async (req, res) => {
  const {
    keyword,
    category,
    page = 1,
    limit = 10,
    sort,
    minPrice = 0,
    maxPrice = Infinity,
  } = req.query;

  const query = {};

  if (keyword) query.name = { $regex: keyword, $options: "i" };
  if (category) query.category = category;

  if (minPrice || maxPrice !== Infinity) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice !== Infinity) query.price.$lte = Number(maxPrice);
  }

  // Multi-field sort
  let sortOption = { createdAt: -1 }; // default
  if (sort) {
    sortOption = {};
    sort.split(",").forEach((s) => {
      const [field, order] = s.split("_");
      sortOption[field] = order === "asc" ? 1 : -1;
    });
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .select(
      "name price offerPrice images category averageRating totalReviews countInStock"
    )
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  });
};

// Add product
export const addProduct = async (req, res) => {
  const { name, description, price, offerPrice, category, images = [], countInStock } = req.body || {};

  if (!name || !description || !price || !category || countInStock === undefined) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const product = await Product.create({ name, description, price, offerPrice, category, images, countInStock });

  res.status(201).json({ success: true, data: product });
};

// Update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, offerPrice, category, images = [], countInStock } = req.body || {};

  if (!name || !description || !price || !category || countInStock === undefined) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { name, description, price, offerPrice, category, images, countInStock },
    { new: true }
  );

  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  res.json({ success: true, data: product });
};

// Mark product as out of stock
export const markOutOfStock = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndUpdate(id, { countInStock: 0 }, { new: true });

  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  res.json({ success: true, data: product });
};
