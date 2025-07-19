import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
try{
    if(!fullName || !email || !password){
        return res.status(400).json({message: "All fields are required"})
    }
    if(password.length < 6){
        return res.status(400).json({message: "Password must be at least 6 characters long"})
    }
    if(fullName.length < 3){
        return res.status(400).json({message: "Full name must be at least 3 characters long"})
    }

    const user = await User.findOne({email});

    if(user){
        return res.status(400).json({message: "User already exists"})
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
        fullName,
        email,
        password: hashedPassword
    });

    try {
        const savedUser = await newUser.save();
        generateToken(savedUser._id, res);
        res.status(201).json({
            message: "User created successfully",
            user: savedUser
        });
    } catch (error) {
        return res.status(400).json({
            message: "Failed to save user",
            error: error.message
        });
    }
}catch(error){
    return res.status(500).json({message: "Internal server error"})
}
};

export const login = async(req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "User not found"})
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid password"})
        }

        generateToken(user._id, res);
        res.status(200).json({
            message: "User logged in successfully",
            user
        })
    }catch(error){
        return res.status(500).json({message: "Internal server error"})
    }
};

export const logout = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({message: "User logged out successfully"})
};

export const updateProfile = async (req, res) => {
}
