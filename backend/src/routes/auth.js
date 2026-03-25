const express = require("express");
const {
  signup,
  login,
  googleCallback,
  getCurrentAuthUser,
  logout,
} = require("../controllers/authController");
const passport = require("passport");
const authMiddleware = require("../middleware/auth");
const { validateSignup, validateLogin } = require("../middleware/validators");

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.get("/me", authMiddleware, getCurrentAuthUser);
router.post("/logout", logout);

// Google OAuth routes
router.get(
  "/google",
  (req, res, next) => {
    const requestedFrontend = req.query.frontendUrl;
    if (typeof requestedFrontend === "string" && requestedFrontend.trim()) {
      res.cookie("oauth_frontend_url", requestedFrontend.trim(), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
      });
    }
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  googleCallback,
);

module.exports = router;
