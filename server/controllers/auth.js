import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import User from "../models/User.js";

//registering
export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation,
        } = req.body;

        const salt = await bcrypt.genSalt();
        const hashpassword = await bcrypt.hash(password, salt);
        const newuser = new User({
            firstName,
            lastName,
            email,
            password: hashpassword,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000)
        })
        const savedUser = await newuser.save();
        res.status(201).json(savedUser);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
}

//logging in
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });//user fetches all the data linked to that particular emailid.
        if (!user) return res.status(400).json({ msg: "user does not exist" });

        const ismatch = await bcrypt.compare(password, user.password);//user.password is fetched while fetching or comparing email.
        if (!ismatch) return res.status(400).json({ msg: "invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        delete user.password //so that our frontend cant access it.
        res.status(300).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
}