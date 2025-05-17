import userModel from '../models/userModel.js';

// Login Controller
const loginController = async (req, res) => {
    try {
        const { userId, password } = req.body;
        // Find user with matching userId and password
        const user = await userModel.findOne({ userId, password });
        if (user) {
            res.status(200).send(user);
        } else {
            res.json({ message: "Invalid Credentials" });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to Login' });
    }
};

// Register Controller
const registerController = async (req, res) => {
    try {
        const newUser = new userModel({ ...req.body, verified: true });
        await newUser.save();
        res.status(201).json({ message: 'New User Added Successfully!' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Error adding User' });
    }
};

export { loginController, registerController };
