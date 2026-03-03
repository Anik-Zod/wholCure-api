import aboutUsModel from "./about-us.model.js";
import cloudinary from "../../../config/cloudinary.js";

// upload image helper
const uploadImage = async (file) => {
  if (!file || !file.buffer) return null;
    
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "aboutUs", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};


// CREATE / UPDATE
export const createOrUpdateAboutUs = async (req, res) => {
  try {
    console.log("About Us update request received");
    // prefer provided URLs in body; fall back to uploaded files
    const firstImageFile = req.files?.firstImage?.[0];
    const secondImageFile = req.files?.secondImage?.[0];
    const faqImageFile = req.files?.FaqImage?.[0];
    const bannerImageFile = req.files?.bannerImage?.[0];

    const firstImage = req.body.firstImage || (await uploadImage(firstImageFile));
    const secondImage = req.body.secondImage || (await uploadImage(secondImageFile));
    const FaqImage = req.body.FaqImage || (await uploadImage(faqImageFile));
    const bannerImage = req.body.bannerImageURL || (await uploadImage(bannerImageFile));

    let about = await aboutUsModel.findOne();

    // Parse FAQ and banner if they are strings (from FormData)
    let FAQ = req.body.FAQ;
    if (typeof FAQ === 'string') {
      try { FAQ = JSON.parse(FAQ); } catch (e) { }
    }

    let banner = req.body.banner;
    if (typeof banner === 'string') {
      try { banner = JSON.parse(banner); } catch (e) { }
    }

    if (about) {
      console.log("Updating existing About Us record");
      about.firstImage = firstImage || about.firstImage;
      about.secondImage = secondImage || about.secondImage;
      about.FaqImage = FaqImage || about.FaqImage;
      if (FAQ) about.FAQ = FAQ;

      // if banner updates provided, merge
      if (banner) {
        const existingBanner = (about.banner && typeof about.banner.toObject === 'function')
          ? about.banner.toObject()
          : (about.banner || {});
        about.banner = { ...existingBanner, ...banner };
      }
      if (bannerImage) {
        if (!about.banner) about.banner = {};
        about.banner.image = bannerImage;
      }

      await about.save();
      console.log("About Us updated successfully");
      return res.json(about);
    }

    console.log("Creating new About Us record");
    const newAbout = await aboutUsModel.create({
      firstImage,
      secondImage,
      FaqImage,
      FAQ: FAQ || [],
      banner: {
        ...(banner || {}),
        image: bannerImage,
      },
    });

    console.log("About Us created successfully");
    res.status(201).json(newAbout);
  } catch (error) {
    console.error("About Us update error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};


// GET
export const getAboutUs = async (req, res) => {
  try {
    const about = await aboutUsModel.findOne();

    if (!about) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
