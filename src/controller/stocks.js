export const sendStocks = async (req, res) => {
    const { itemName, category, inStock, date, statusOfItem } = req.body;

    // Check if required fields are provided
    if (!itemName || !category || !inStock || !date || !statusOfItem) {
        return res.status(400).json({
            success: false,
            message: "Enter Stock Details !"
        });
    }

    // Proceed with stock creation and saving
    try {
        const newStock = new Stocks(req.body);
        await newStock.save();
        res.status(201).json({
            success: true,
            message: "Stock added successfully!",
            data: newStock
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }

    
};
