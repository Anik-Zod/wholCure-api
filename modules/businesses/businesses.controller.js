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
      isVerified, location, website, mainDescription,
      mainButtonRewrite, mainButtonPDF, serviceHeading,
      serviceSubHeading, features, industries,
      whyWeBest, partners
    } = req.body;


    if (!title || !description) {
      return res.status(400).json({ message: "Title and Description are required" });
    }

    const isVerifiedFlag = String(isVerified) === "true" || isVerified === true;


    let logoUrl = req.body.logo || "";
    
 
    if (req.files && req.files.logo && req.files.logo[0]) {
      try {
        const result = await uploadBuffer(req.files.logo[0].buffer, "wholcare/businesses/logos");
        logoUrl = result.secure_url;
      } catch (err) {
        console.error("Logo upload failed, continuing without it:", err);
        // Yahan 'return' nahi karna, taake business save ho jaye
      }
    }


    let mainButtonLinkUrl = typeof req.body.mainButtonLink === "string" ? req.body.mainButtonLink : "";
    
    if (req.files && req.files.mainButtonLink && req.files.mainButtonLink[0]) {
      try {
        const result = await uploadBuffer(
          req.files.mainButtonLink[0].buffer,
          "wholcare/businesses/attachments"
        );
        mainButtonLinkUrl = result.secure_url;
      } catch (err) {
        console.error("Attachment upload failed, continuing:", err);
   
      }
    }

  
    const payload = {
      title,
      description,
      category,
      tags: normalizeArray(tags),
      isVerified: isVerifiedFlag,
      location: location || "Global / Remote",
      website,
      mainDescription,
      mainButtonRewrite,
      mainButtonLink: mainButtonLinkUrl,
      mainButtonPDF,
      serviceHeading,
      serviceSubHeading,
      features: normalizeArray(features),
      industries: normalizeArray(industries),
      whyWeBest,
      partners: normalizeArray(partners),
      logo: logoUrl,
      services: normalizeArray(req.body.services)
    };

    
    const response = await business.create(payload);

    return res.status(201).json({ 
      message: "Business created successfully", 
      data: response 
    });

  } catch (error) {
    console.error("Add Business Error:", error);
    return res.status(500).json({ 
      message: "Failed to create business", 
      error: error.message 
    });
  }
}

export const editBusiness = async (req, res) => {
  try {
    // DEBUG: Check karein ke file aa rahi hai ya nahi
    console.log("Files received:", req.files);
    console.log("Body received:", req.body);

    let updateData = { ...req.body };

    // 1. Services parsing
    if (updateData.services && typeof updateData.services === 'string') {
      try {
        updateData.services = JSON.parse(updateData.services);
      } catch (e) {
        console.log("Services parsing failed");
      }
    }

    // 2. Logo Upload Logic
    if (req.files && req.files.logo && req.files.logo[0]) {
      console.log("Uploading image to Cloudinary...");
      const result = await uploadBuffer(req.files.logo[0].buffer, "wholcare/businesses/logos");
      
      // Yahan hum updateData mein direct link daal rahe hain
      updateData.logo = result.secure_url; 
      console.log("New Logo URL:", updateData.logo);
    }

    // 3. Update in Database
    const updatedBusiness = await business.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // $set use karna zyada safe hota hai
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    res.status(200).json({ success: true, data: updatedBusiness });
  } catch (error) {
    console.error("Backend Error Details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
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
