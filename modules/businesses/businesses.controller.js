import mongoose from "mongoose";
import { business } from "./businesses.model.js";

 d
// add business
export default async function addBusiness(req,res,next){
    const {title,description,tags,logo,details} = req.body;

    if(!title || !description){
        return res.status(400).json({message:"Title and Description are required"});
    } 

    const response  = await business.create({
        title,
        description,
        tags,
        logo,
        details
    });

    if(!response){
        return res.status(500).json({message:"Failed to create business"});
    }

    res.status(201).json({message:"Business created successfully",data:response});    
}


//edit business
export async function editBusiness(req, res, next) {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ message: "Business ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Business ID" });
    }

    const { title, description, tags, logo, details } = req.body;
    
    // Create an object with only the fields that aren't undefined
    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (tags !== undefined) updateFields.tags = tags;
    if (logo !== undefined) updateFields.logo = logo;
    if (details !== undefined) updateFields.details = details;

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