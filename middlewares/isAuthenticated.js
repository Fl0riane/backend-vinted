const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  console.log(req.headers.authorization);
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ massage: "Unauthorized" });
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log(token);
    const user = await User.findOne({ token: token }).select("account");
    console.log(user);
    // Si je n'en trouve pas ====> erreur
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Si J'en trouve un, je le stocke dans req.user pour le garder sous la main et pouvoir le réutiliser dans ma route

// Je passe au middleware suivant

module.exports = isAuthenticated;
