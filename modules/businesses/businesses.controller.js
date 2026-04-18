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
        return typeof input === "string" ? input.split(",").map(s => s.trim()).filter(Boolean) : [input];
    }
};

// add business
export default async function addBusiness(req, res, next) {
    try {
        const {
            title, description, category, tags,
            isVerified, location, website,
            mainDescription, mainButtonRewrite, mainButtonLink, mainButtonPDF,
            serviceHeading, serviceSubHeading, features, industries,
            whyWeBest, partners
        } = req.body;

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
            isVerified: isVerified === "true" || isVerified === true,
            location: location || "Global / Remote",
            website,
            mainDescription,
            mainButtonRewrite,
            mainButtonLink,
            mainButtonPDF,
            serviceHeading,
            serviceSubHeading,
            features: normalizeArray(features),
            industries: normalizeArray(industries),
            whyWeBest,
            partners: normalizeArray(partners),
            logo: logoUrl,
            coverPhoto: coverPhotoUrl,
            images: imagesUrls,
            services: normalizeArray(req.body.services)
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

        const {
            title, description, category, tags,
            isVerified, location, website,
            mainDescription, mainButtonRewrite, mainButtonLink, mainButtonPDF,
            serviceHeading, serviceSubHeading, features, industries,
            whyWeBest, partners
        } = req.body;

        const updateFields = {};

        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (category !== undefined) updateFields.category = category;
        if (tags !== undefined) updateFields.tags = normalizeArray(tags);
        if (isVerified !== undefined) updateFields.isVerified = (isVerified === "true" || isVerified === true);
        if (location !== undefined) updateFields.location = location;
        if (website !== undefined) updateFields.website = website;
        if (mainDescription !== undefined) updateFields.mainDescription = mainDescription;
        if (mainButtonRewrite !== undefined) updateFields.mainButtonRewrite = mainButtonRewrite;
        if (mainButtonLink !== undefined) updateFields.mainButtonLink = mainButtonLink;
        if (mainButtonPDF !== undefined) updateFields.mainButtonPDF = mainButtonPDF;
        if (serviceHeading !== undefined) updateFields.serviceHeading = serviceHeading;
        if (serviceSubHeading !== undefined) updateFields.serviceSubHeading = serviceSubHeading;
        if (features !== undefined) updateFields.features = normalizeArray(features);
        if (industries !== undefined) updateFields.industries = normalizeArray(industries);
        if (whyWeBest !== undefined) updateFields.whyWeBest = whyWeBest;
        if (partners !== undefined) updateFields.partners = normalizeArray(partners);
        if (req.body.services !== undefined) updateFields.services = normalizeArray(req.body.services);

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

        console.log(`Updating Business ${id}:`, updateFields);

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

// Add service to business
export async function addService(req, res) {
    try {
        const { id } = req.params;
        const { title, description, bgColour } = req.body;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Business ID" });
        }

        if (!title) {
            return res.status(400).json({ message: "Service title is required" });
        }

        const updatedBusiness = await business.findByIdAndUpdate(
            id,
            { $push: { services: { title, description, bgColour } } },
            { new: true, runValidators: true }
        );

        if (!updatedBusiness) {
            return res.status(404).json({ message: "Business not found" });
        }

        // Return the specific added service by taking the last element
        const addedService = updatedBusiness.services[updatedBusiness.services.length - 1];

        res.status(201).json({
            message: "Service added successfully",
            data: addedService
        });
    } catch (error) {
        console.error("Add Service Error:", error);
        res.status(500).json({ message: "Failed to add service", error: error.message });
    }
}

// Edit service in business
export async function editService(req, res) {
    try {
        const { id, serviceId } = req.params;
        const { title, description, bgColour } = req.body;

        if (!id || !mongoose.Types.ObjectId.isValid(id) || !serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: "Invalid Business or Service ID" });
        }

        // Construct update object for $set
        const updateObj = {};
        if (title !== undefined) updateObj["services.$.title"] = title;
        if (description !== undefined) updateObj["services.$.description"] = description;
        if (bgColour !== undefined) updateObj["services.$.bgColour"] = bgColour;

        if (Object.keys(updateObj).length === 0) {
            return res.status(400).json({ message: "No fields provided to update" });
        }

        const updatedBusiness = await business.findOneAndUpdate(
            { _id: id, "services._id": serviceId },
            { $set: updateObj },
            { new: true, runValidators: true }
        );

        if (!updatedBusiness) {
            return res.status(404).json({ message: "Business or service not found" });
        }

        const updatedService = updatedBusiness.services.id(serviceId);

        res.status(200).json({
            message: "Service updated successfully",
            data: updatedService
        });
    } catch (error) {
        console.error("Edit Service Error:", error);
        res.status(500).json({ message: "Failed to update service", error: error.message });
    }
}

// Delete service from business
export async function deleteService(req, res) {
    try {
        const { id, serviceId } = req.params;

        const updatedBusiness = await business.findByIdAndUpdate(
            id,
            { $pull: { services: { _id: serviceId } } },
            { new: true }
        );

        if (!updatedBusiness) {
            return res.status(404).json({ message: "Business not found" });
        }

        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete service", error: error.message });
    }
}
