import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/discord", passport.authenticate("discord"));

router.get(
  "/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    // Move tokens from user._oauth to session for later calls
    if (req.user && req.user._oauth) {
      req.session.oauth = req.user._oauth;
    }

    // ✅ Fix redirect for Render
const redirect =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL // https://slots.darksideorg.com
    : "http://localhost:5173";

res.redirect(redirect);
  }
);

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

export default router;
