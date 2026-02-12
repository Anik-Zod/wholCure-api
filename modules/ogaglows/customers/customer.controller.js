import Customer from "./customer.model.js";


//create customer
export const createCustomer = async (req, res) => {
    const { name, email, phone, city, address } = req.body || {};
    if (!name || !email || !city || !address || !phone) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const customer = await Customer.create({ name, email, phone, city, address });

    if (!customer) {
        return res.status(500).json({ success: false, message: "Failed to create customer" });
    }

    return res.status(201).json({ success: true, data: customer });
}


//get all customer list
export const getAllCustomers = async (req, res) => {
    const customers = await Customer.find();

    if (!customers) {
        return res.status(500).json({ success: false, message: "Failed to get customer list" });
    }

    return res.status(200).json({ success: true, data: customers });
}