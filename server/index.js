//redis
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import multer from "multer";
import morgan from "morgan";
//used for configuring paths from different modules
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { createPost } from "./controllers/posts.js";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js"
import Post from "./models/Post.js"
import { users, posts } from "./data/index.js"

//configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);//handle relative paths in module
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());//set security-related HTTP response headers.
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common")); //tells about api requests made 
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());//indicate any origins (different in terms of protocol, hostname, or port)
app.use("/assets", express.static(path.join(__dirname, 'public/assets'))); //to access other files like images,etc

//file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {   //cb==callback
        cb(null, "public/assets");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
//storage is basically used when the user uploads a image on website and save it in /public/assets
//whenever we need to upload a file we will use upload variable here.
const upload = multer({ storage });

//routes with files
app.post('/auth/register', upload.single("picture"), register); //here register is a callback function of post route imported from controllers folder.
//controllers folder used to send or handle responses from server to client.//simply post routes callback functions.
//we used this route here rather than route folder because we had to use "upload" variable to upload image.

app.post("/posts", verifyToken, upload.single("picture"), createPost);



//routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);





//mongoose setup
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => {
        console.log(`connect to database at ${PORT}`);
    })
    //upload data only 1 time.
    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((err) => {
    console.log(err);
})


