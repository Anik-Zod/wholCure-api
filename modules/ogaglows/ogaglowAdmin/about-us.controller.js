import aboutUsModel from "./about-us.model.js";
import cloudinary from "../../../config/cloudinary.js";

// upload image helper
const uploadImage = async (file) => {
  if (!file) return null;

  const result = await cloudinary.uploader.upload(file.path, {
    folder: "aboutUs",
  });

  return result.secure_url;
};


// CREATE / UPDATE
export const createOrUpdateAboutUs = async (req, res) => {

  // prefer provided URLs in body; fall back to uploaded files
  const firstImageFile = req.files?.firstImage?.[0];
  const secondImageFile = req.files?.secondImage?.[0];
  const faqImageFile = req.files?.FaqImage?.[0];
  const bannerImageFile = req.files?.bannerImage?.[0];

  const firstImage = req.body.firstImage || (await uploadImage(firstImageFile));
  const secondImage = req.body.secondImage || (await uploadImage(secondImageFile));
  const FaqImage = req.body.FaqImage || (await uploadImage(faqImageFile));
  const bannerImage = req.body.banner?.image || (await uploadImage(bannerImageFile));

  let about = await aboutUsModel.findOne();

  if (about) {
    about.firstImage = firstImage || about.firstImage;
    about.secondImage = secondImage || about.secondImage;
    about.FaqImage = FaqImage || about.FaqImage;
    // if banner updates provided, merge
    if (req.body.banner) {
      about.banner = { ...about.banner.toObject(), ...req.body.banner };
      if (bannerImage) about.banner.image = bannerImage;
    }

    await about.save();
    return res.json(about);
  }

  const newAbout = await aboutUsModel.create({
    firstImage,
    secondImage,
    FaqImage,
    banner: {
      ...req.body.banner,
      image: bannerImage,
    },
  });

  res.status(201).json(newAbout);
};


// GET
export const getAboutUs = async (req, res) => {
  const about = await aboutUsModel.findOne();

  if (!about) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(about);
};

