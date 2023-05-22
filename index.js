require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const SHA256 = require("crypto-js/sha256");
const enBAse64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const fileUpload = require("express-fileupload");
const isAuthenticated = require("./middlewares/isAuthenticated");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.LOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

//routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "route doesn't exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
