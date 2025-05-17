import itemModel from '../models/itemModel';

// Get all items
const getItemController = async (req, res) => {
    try {
        const items = await itemModel.find();
        res.status(200).send(items);
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to get items");
    }
};

// Add item
const addItemController = async (req, res) => {
    try {
        const newItem = new itemModel(req.body);
        await newItem.save();
        res.status(201).send("Item Created Successfully!");
    } catch (error) {
        console.log(error);
        res.status(400).send("Error adding item");
    }
};

// Delete item
const deleteItemController = async (req, res) => {
    try {
        const { itemId } = req.body;
        await itemModel.findOneAndDelete({ _id: itemId });
        res.status(200).json("Item Deleted");
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

// Edit item
const editItemController = async (req, res) => {
    try {
        const { id } = req.params;
        const item = req.body;
        await itemModel.findOneAndUpdate({ _id: req.body.itemId }, req.body);
        res.status(201).json("Item Updated");
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

export { getItemController, addItemController, editItemController, deleteItemController };
