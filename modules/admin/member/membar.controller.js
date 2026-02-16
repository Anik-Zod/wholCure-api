import Member from "./membar.model.js";
import cloudinary from "../../../config/cloudinary.js";

// create member
export async function createMember(req, res) {
  try {
    const { name, email, phone, address, socialMedia, description, role } =
      req.body || {};

    if (!name) {
      return res.status(400).json({
        error: "Name  required",
      });
    }

    let photoUrl;

    if (req.file) {
      photoUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "wholcare/members",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });
    }

    const member = await Member.create({
      name,
      role,
      photo: photoUrl ? photoUrl.secure_url : undefined,
      email,
      phone,
      address,
      socialMedia,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error creating member:", error);
    return res.status(500).json({
      error: "Failed to create member",
      details: error.message,
    });
  }
}

//update member
export async function updateMember(req, res) {
  const { id } = req.params;
  const { name, email, phone, address, socialMedia, description, role } =
    req.body;

  try {
    const updateData = {
      name,
      email,
      phone,
      address,
      socialMedia,
      description,
      role,
    };

    // Only upload new image if provided
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "wholcare/members",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });
      updateData.photo = uploadResult.secure_url;
    }

    const member = await Member.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return res.status(500).json({
      error: "Failed to update member",
      details: error.message,
    });
  }
}
//delete member
export async function deleteMember(req, res) {
  const { id } = req.params;
  try {
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({
      error: "Failed to delete member",
      details: error.message,
    });
  }
}
//get all members
export async function getAllMembers(req, res) {
  try {
    const members = await Member.find();
    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch members" });
  }
}
//get member by id
export async function getMemberById(req, res) {
  const { id } = req.params;
  try {
    const member = await Member.findById(id);
    return res.status(200).json(member);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch member" });
  }
}
