import Product from "./product.model.js";
import reviewModel from "../reviews/review.model.js";

// @desc    Get all products with search, filter, sort, pagination
// @route   GET /api/ogaglow/products
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
  let sortOption = { createdAt: -1 }; 
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
      "name description price discount images category averageRating totalReviews countInStock"
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



// @desc    Get single product
// @route   GET /api/ogaglow/products/:id
export const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("reviews");

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
};





// @desc    Add new product
// @route   POST /api/ogaglow/products
export const addProduct = async (req, res) => {
  const { 
    name, description, price, discountValue, 
    discountType, category, images, countInStock 
  } = req.body;

  if (!name || !description || !price || !category || countInStock === undefined) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  const discount = {
    type: discountType || "percentage",
    value: discountValue || 0,
    isActive: discountValue > 0,
  };

  const product = await Product.create({
    name,
    description,
    price,
    discount,
    category,
    images,
    countInStock
  });

  res.status(201).json({ success: true, data: product, message: "Product created successfully" });
};

// @desc    Update product
// @route   PUT /api/ogaglow/products/:id
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { 
    name, description, price, discountValue, 
    discountType, discountIsActive, category, images, countInStock 
  } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Update nested discount fields
  if (discountValue !== undefined) product.discount.value = discountValue;
  if (discountType !== undefined) product.discount.type = discountType;
  if (discountIsActive !== undefined) product.discount.isActive = discountIsActive;

  // Update top-level fields
  const updateData = { name, description, price, category, images, countInStock };
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) product[key] = updateData[key];
  });

  await product.save();

  res.json({ success: true, data: product, message: "Product updated successfully" });
};

// @desc    Mark product as out of stock
// @route   PUT /api/ogaglow/products/:id/out-of-stock
export const markOutOfStock = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, { countInStock: 0 }, { new: true });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
};