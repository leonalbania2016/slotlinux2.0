import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/discord", passport.authenticate("discord"));

router.get(
  "/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    console.log("🎉 Discord login successful:", req.user);

    // ✅ Make sure session is saved before redirect
    req.session.save(() => {
      const redirect =
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL // e.g. https://slots.darksideorg.com
          : "http://localhost:5173";

      res.redirect(redirect);
    });
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

// ✅ Logout route
router.post("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".darksideorg.com",
      });
      res.json({ ok: true, message: "Logged out" });
    });
  });
});

export default router;
