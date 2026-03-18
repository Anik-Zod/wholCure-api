import mongoose from "mongoose";
import { business } from "./businesses.model.js";
import { uploadBuffer } from "../../config/cloudinary.js";

// Helper to handle array fields coming from form-data (can be string, array, or JSON string)
const normalizeArray = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        return typeof input === "string" ? input.split(",").map(s => s.trim()) : [input];
    }
};

// add business
export default async function addBusiness(req, res, next) {
    try {
        const { title, description, category, tags, details, whyWeBest, partners, website, location, isVerified } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title and Description are required" });
        }

        // Handle Image Uploads
        let logoUrl = req.body.logo || "";
        if (req.files?.logo?.[0]) {
            const result = await uploadBuffer(req.files.logo[0].buffer, "wholcare/businesses/logos");
            logoUrl = result.secure_url;
        }

        let coverPhotoUrl = req.body.coverPhoto || "";
        if (req.files?.coverPhoto?.[0]) {
            const result = await uploadBuffer(req.files.coverPhoto[0].buffer, "wholcare/businesses/covers");
            coverPhotoUrl = result.secure_url;
        }

        let imagesUrls = normalizeArray(req.body.images);
        if (req.files?.images?.length) {
            const uploadPromises = req.files.images.map(file =>
                uploadBuffer(file.buffer, "wholcare/businesses/projects")
            );
            const uploadResults = await Promise.all(uploadPromises);
            const newImages = uploadResults.map(r => r.secure_url);
            imagesUrls = [...imagesUrls, ...newImages];
        }

        const response = await business.create({
            title,
            description,
            category,
            tags: normalizeArray(tags),
            logo: logoUrl,
            coverPhoto: coverPhotoUrl,
            location: location || "Global / Remote",
            isVerified: isVerified === "true" || isVerified === true,
            details,
            whyWeBest,
            partners: normalizeArray(partners),
            website,
            images: imagesUrls
        });

        res.status(201).json({ message: "Business created successfully", data: response });
    } catch (error) {
        console.error("Add Business Error:", error);
        res.status(500).json({ message: "Failed to create business", error: error.message });
    }
}


//edit business
export async function editBusiness(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Business ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Business ID" });
        }

        const { title, description, category, tags, details, whyWeBest, partners, website, location, isVerified } = req.body;

        const updateFields = {};

        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (category !== undefined) updateFields.category = category;
        if (tags !== undefined) updateFields.tags = normalizeArray(tags);
        if (details !== undefined) updateFields.details = details;
        if (whyWeBest !== undefined) updateFields.whyWeBest = whyWeBest;
        if (partners !== undefined) updateFields.partners = normalizeArray(partners);
        if (website !== undefined) updateFields.website = website;
        if (location !== undefined) updateFields.location = location;
        if (isVerified !== undefined) updateFields.isVerified = (isVerified === "true" || isVerified === true);

        // Handle Image Updates
        if (req.files?.logo?.[0]) {
            const result = await uploadBuffer(req.files.logo[0].buffer, "wholcare/businesses/logos");
            updateFields.logo = result.secure_url;
        } else if (req.body.logo !== undefined) {
            updateFields.logo = req.body.logo;
        }

        if (req.files?.coverPhoto?.[0]) {
            const result = await uploadBuffer(req.files.coverPhoto[0].buffer, "wholcare/businesses/covers");
            updateFields.coverPhoto = result.secure_url;
        } else if (req.body.coverPhoto !== undefined) {
            updateFields.coverPhoto = req.body.coverPhoto;
        }

        if (req.files?.images?.length) {
            const uploadPromises = req.files.images.map(file =>
                uploadBuffer(file.buffer, "wholcare/businesses/projects")
            );
            const uploadResults = await Promise.all(uploadPromises);
            const newImages = uploadResults.map(r => r.secure_url);
            
            const baseImages = normalizeArray(req.body.images);
            updateFields.images = [...baseImages, ...newImages];
        } else if (req.body.images !== undefined) {
            updateFields.images = normalizeArray(req.body.images);
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No valid fields provided to update" });
        }

        const response = await business.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!response) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json({
            message: "Business updated successfully",
            data: response
        });
    } catch (error) {
        console.error("Edit Business Error:", error);
        res.status(500).json({ message: "Failed to update business", error: error.message });
    }
}

//delete business
export async function deleteBusiness(req,res,next){
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:"Business ID is required"});
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Business ID" });
    }
    const response = await business.findByIdAndDelete(id);
    if(!response){
        return res.status(404).json({message:"Business not found"});
    }
    res.status(200).json({message:"Business deleted successfully"});
} 

//get all businesses
export async function getAllBusiness(req,res,next){
    const response = await business.find({});
    res.status(200).json({data:response});
}

//get business by id
export async function getBusinessById(req,res,next){
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:"Business ID is required"});
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Business ID" });
    }
    const response = await business.findById(id);
    if(!response){
        return res.status(404).json({message:"Business not found"});
    }
    res.status(200).json({data:response});
}

