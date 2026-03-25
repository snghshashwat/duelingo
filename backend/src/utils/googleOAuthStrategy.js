const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error("Google account does not have a valid email"));
        }

        let user = await User.findOne({ email });

        if (!user) {
          const rawName = profile.displayName || email.split("@")[0] || "user";
          const baseUsername = rawName.replace(/\s+/g, "").toLowerCase();
          let normalizedUsername = baseUsername;
          let suffix = 1;

          // Ensure generated usernames do not collide.
          while (await User.findOne({ username: normalizedUsername })) {
            normalizedUsername = `${baseUsername}${suffix}`;
            suffix += 1;
          }

          const avatarFromGoogle = profile.photos?.[0]?.value || "";

          user = new User({
            username: normalizedUsername,
            email,
            password: Math.random().toString(36).slice(2) + "oauth",
            avatarUrl: avatarFromGoogle,
            isOAuthUser: true,
            nativeLanguage: "English",
            learningLanguage: "Spanish",
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
