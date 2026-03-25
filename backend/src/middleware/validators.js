const mongoose = require("mongoose");

const OBJECT_ID = mongoose.Types.ObjectId;

const isNonEmptyString = (value, maxLen = 200) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= maxLen;

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isValidObjectId = (value) =>
  typeof value === "string" && OBJECT_ID.isValid(value);

const sendBadRequest = (res, message) =>
  res.status(400).json({ error: message });

const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body || {};

  if (!isNonEmptyString(username, 32)) {
    return sendBadRequest(
      res,
      "Username is required and must be 1-32 characters",
    );
  }

  if (!isValidEmail(email)) {
    return sendBadRequest(res, "A valid email is required");
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return sendBadRequest(res, "Password must be 8-128 characters");
  }

  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!isValidEmail(email)) {
    return sendBadRequest(res, "A valid email is required");
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return sendBadRequest(res, "Password must be 8-128 characters");
  }

  return next();
};

const validateAddFriend = (req, res, next) => {
  const { username } = req.body || {};
  if (!isNonEmptyString(username, 32)) {
    return sendBadRequest(
      res,
      "Username is required and must be 1-32 characters",
    );
  }
  return next();
};

const validateObjectIdBody = (field) => (req, res, next) => {
  const value = req.body?.[field];
  if (!isValidObjectId(value)) {
    return sendBadRequest(res, `${field} must be a valid id`);
  }
  return next();
};

const validateObjectIdParam = (field) => (req, res, next) => {
  const value = req.params?.[field];
  if (!isValidObjectId(value)) {
    return sendBadRequest(res, `${field} must be a valid id`);
  }
  return next();
};

const validateSearchQuery = (req, res, next) => {
  const { query } = req.query || {};
  if (query === undefined) {
    return sendBadRequest(res, "query is required");
  }

  if (typeof query !== "string" || query.trim().length > 80) {
    return sendBadRequest(res, "query must be a string up to 80 characters");
  }

  return next();
};

const validateUpdateProfile = (req, res, next) => {
  const { bio, avatarUrl, nativeLanguage, learningLanguage, country } =
    req.body || {};

  if (bio !== undefined && (typeof bio !== "string" || bio.length > 240)) {
    return sendBadRequest(res, "bio must be a string up to 240 characters");
  }

  if (
    avatarUrl !== undefined &&
    (typeof avatarUrl !== "string" || avatarUrl.length > 500)
  ) {
    return sendBadRequest(
      res,
      "avatarUrl must be a string up to 500 characters",
    );
  }

  if (
    nativeLanguage !== undefined &&
    (typeof nativeLanguage !== "string" || nativeLanguage.length > 60)
  ) {
    return sendBadRequest(
      res,
      "nativeLanguage must be a string up to 60 characters",
    );
  }

  if (
    learningLanguage !== undefined &&
    (typeof learningLanguage !== "string" || learningLanguage.length > 60)
  ) {
    return sendBadRequest(
      res,
      "learningLanguage must be a string up to 60 characters",
    );
  }

  if (
    country !== undefined &&
    (typeof country !== "string" || country.length > 80)
  ) {
    return sendBadRequest(res, "country must be a string up to 80 characters");
  }

  return next();
};

const validateMarkNotifications = (req, res, next) => {
  const { notificationIds } = req.body || {};

  if (notificationIds === undefined) {
    return next();
  }

  if (!Array.isArray(notificationIds) || notificationIds.length > 200) {
    return sendBadRequest(
      res,
      "notificationIds must be an array with at most 200 ids",
    );
  }

  const invalid = notificationIds.some((id) => !isValidObjectId(id));
  if (invalid) {
    return sendBadRequest(res, "notificationIds must contain valid ids");
  }

  return next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateAddFriend,
  validateObjectIdBody,
  validateObjectIdParam,
  validateSearchQuery,
  validateUpdateProfile,
  validateMarkNotifications,
};
