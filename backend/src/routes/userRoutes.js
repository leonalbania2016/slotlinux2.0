import express from "express";
import { ensureAuthed } from "../auth.js";

const router = express.Router();

router.get("/me", ensureAuthed, (req, res) => {
  if (!req.user) return res.status(401).json({ loggedIn: false });
  const { id, username, discriminator, avatar } = req.user;
  res.json({ id, username, discriminator, avatar });
});

export default router;