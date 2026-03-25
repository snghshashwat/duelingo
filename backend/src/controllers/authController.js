const jwt = require("jsonwebtoken");
const User = require("../models/User");

const AUTH_COOKIE_NAME = "auth_token";

const generateToken = (userId, username) =>
  jwt.sign({ userId, username }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 15 * 60 * 1000,
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...authCookieOptions,
    maxAge: undefined,
  });
};

const getAllowedFrontendOrigins = () => {
  const envOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    envOrigins.push("http://localhost:5174");
  }

  return Array.from(new Set(envOrigins));
};

const isAllowedFrontendOrigin = (candidate) => {
  if (!candidate || typeof candidate !== "string") {
    return false;
  }

  const allowedOrigins = getAllowedFrontendOrigins();
  if (allowedOrigins.includes(candidate)) {
    return true;
  }

  // Support dynamic localhost dev ports (e.g. Vite auto-increment).
  if (process.env.NODE_ENV !== "production") {
    return /^http:\/\/localhost:\d+$/.test(candidate);
  }

  return false;
};

const resolveFrontendURL = (req) => {
  const cookieFrontend = req.cookies?.oauth_frontend_url;
  if (isAllowedFrontendOrigin(cookieFrontend)) {
    return cookieFrontend;
  }

  const fallback = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .find(Boolean);

  return fallback || "http://localhost:5173";
};

const serializeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  rating: user.rating,
  wins: user.wins,
  losses: user.losses,
  totalMatches: user.totalMatches,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  nativeLanguage: user.nativeLanguage,
  learningLanguage: user.learningLanguage,
  country: user.country,
});

const signup = async (req, res) => {
  try {
    const { username, email, password, nativeLanguage, learningLanguage } =
      req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({
      username,
      email,
      password,
      nativeLanguage: nativeLanguage || "English",
      learningLanguage: learningLanguage || "Spanish",
    });
    await user.save();

    const token = generateToken(user._id, user.username);
    setAuthCookie(res, token);
    return res.status(201).json({ user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.username);
    setAuthCookie(res, token);
    return res.json({ user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const frontendURL = resolveFrontendURL(req);
    res.clearCookie("oauth_frontend_url", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    if (!user) {
      return res.redirect(`${frontendURL}/login?error=auth_failed`);
    }

    const token = generateToken(user._id, user.username);
    setAuthCookie(res, token);
    return res.redirect(`${frontendURL}/auth-callback`);
  } catch (error) {
    const frontendURL = resolveFrontendURL(req);
    return res.redirect(`${frontendURL}/login?error=callback_failed`);
  }
};

const getCurrentAuthUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
};

module.exports = {
  signup,
  login,
  generateToken,
  googleCallback,
  getCurrentAuthUser,
  logout,
};
