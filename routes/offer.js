const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const Offer = require("../models/Offer");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../middlewares/isAuthenticated");

const app = express();
app.use(express.json());

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      if (!req.files || !req.files.picture)
        return res.status(400).json({ message: "Missing picture" });
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],

        owner: req.user,
      });

      // console.log(req.files);
      const picture = req.files.picture;
      console.log(req.files.picture);
      const pictureUpload = await cloudinary.uploader.upload(
        convertToBase64(picture),
        { folder: `/vinted${newOffer.id}` }
      );
      newOffer.product_image = pictureUpload;

      await newOffer.save();

      res.json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax } = req.query;
    let filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = {
        $gte: priceMin,
      };
    }

    if (priceMax && priceMin) {
      filters.product_price = {
        $gte: priceMin,
        $lte: priceMax,
      };
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    }
    if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    }

    let page;

    if (Number(req.query.page) < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    let limit = 5;

    const offers = await Offer.find(filters)
      .populate({
        path: "owner",
        select: "account",
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offer);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
