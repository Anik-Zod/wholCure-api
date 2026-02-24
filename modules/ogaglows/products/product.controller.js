import Product from "./product.model.js";
import reviewModel from "../reviews/review.model.js";
import cloudinary from "../../../config/cloudinary.js";

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
      "_id name description price discount images category averageRating totalReviews countInStock finalPrice howToUse ingredients benefits"
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

// @desc    Delete product
// @route   DELETE /api/ogaglow/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (error) {
            console.error("Cloudinary Delete Error during product deletion:", error);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};





// @desc    Add new product
// @route   POST /api/ogaglow/products
export const addProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    discountValue,
    discountType,
    discountStartDate,
    discountEndDate,
    discountIsActive,
    category,
    countInStock,
    howToUse,
    ingredients,
    benefits,
  } = req.body;

  // ---------- Validation ----------
  if (
    !name ||
    !description ||
    price === undefined ||
    !category ||
    countInStock === undefined ||
    !howToUse ||
    !ingredients ||
    !benefits
  ) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing",
    });
  }

  // ---------- Discount ----------
  const discount = {
    type: discountType || "percentage",
    value: Number(discountValue) || 0,
    startDate: discountStartDate ? new Date(discountStartDate) : undefined,
    endDate: discountEndDate ? new Date(discountEndDate) : undefined,
    isActive: discountIsActive === "true" || discountIsActive === true || Number(discountValue) > 0,
  };

  // ---------- Images Upload ----------
  let images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "wholcare/products", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      images.push({
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      });
    }
  }

  // ---------- Create Product ----------
  const product = await Product.create({
    name,
    description,
    price: Number(price),
    discount,
    category,
    images,
    countInStock: Number(countInStock),
    howToUse,
    ingredients,
    benefits,
  });

  return res.status(201).json({
    success: true,
    data: product,
    message: "Product created successfully",
  });
};

// @desc    Update product
// @route   PUT /api/ogaglow/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating product ID:", id);
    console.log("Request Body:", req.body);
    console.log("Files:", req.files ? req.files.length : 0);

    const {
      name, description, price, discountValue,
      discountType, discountIsActive, discountStartDate, discountEndDate,
      category, countInStock, howToUse, ingredients, benefits,
      existingImages
    } = req.body;

    let { removedImages } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Initialize discount if it doesn't exist
    if (!product.discount) {
      product.discount = { type: "percentage", value: 0, isActive: false };
    }

    // Update nested discount fields
    if (discountValue !== undefined) product.discount.value = Number(discountValue) || 0;
    if (discountType !== undefined) product.discount.type = discountType;
    if (discountIsActive !== undefined) {
      product.discount.isActive = discountIsActive === "true" || discountIsActive === true;
    }
    if (discountStartDate !== undefined) {
      product.discount.startDate = discountStartDate ? new Date(discountStartDate) : undefined;
    }
    if (discountEndDate !== undefined) {
      product.discount.endDate = discountEndDate ? new Date(discountEndDate) : undefined;
    }

    // ---------- Images Handling ----------
    let updatedImages = [];

    // 1. Keep existing images
    if (existingImages) {
      try {
        updatedImages = JSON.parse(existingImages);
      } catch (error) {
        console.error("Error parsing existingImages:", error);
      }
    }

    // 2. Upload new images if any
    if (req.files && req.files.length > 0) {
      console.log("Uploading new images to Cloudinary...");
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "wholcare/products", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        updatedImages.push({
          public_id: uploaded.public_id,
          url: uploaded.secure_url,
        });
      }
    }

    // 3. Delete removed images from Cloudinary
    if (removedImages) {
      console.log("Removing images from Cloudinary:", removedImages);
      const imagesToDelete = Array.isArray(removedImages) ? removedImages : [removedImages];
      for (const publicId of imagesToDelete) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Cloudinary Delete Error:", error);
        }
      }
    }

    product.images = updatedImages;

    // ---------- Update top-level fields ----------
    const updateData = { name, description, price, category, countInStock, howToUse, ingredients, benefits };
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        if (["price", "countInStock"].includes(key)) {
          product[key] = Number(updateData[key]) || 0;
        } else {
          product[key] = updateData[key];
        }
      }
    });

    console.log("Saving product...");
    await product.save();

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
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