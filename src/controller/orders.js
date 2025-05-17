// Middleware function to handle sending orders
export const sendOrders = async (req, res, next) => {
    const { orderName, supplier, date, noOfitems } = req.body;

    // Check if required fields are provided
    if (!orderName || !supplier || !date || !noOfitems) {
        return next(new ErrorHandler("Enter Order Details!", 400));
    }

    try {
        // Create a new order
        await Orders.create({ orderName, supplier, date, noOfitems });

        // Send success response
        res.status(200).json({
            success: true,
            message: "Order Details Addessd Successfully!",
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === "ValidationError") {
            const ValidationErrors = Object.values(error.errors).map(
                (err) => err.message
            );
            return next(new ErrorHandler(ValidationErrors.join(" , "), 400));
        }
z
        // Handle other errors
        return next(error);
    }
};
