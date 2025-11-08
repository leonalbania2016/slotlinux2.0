import express from 'express';
import { ensureAuthed } from '../auth.js';


const router = express.Router();


router.get('/me', ensureAuthed, async (req, res) => {
const { id, username, discriminator, avatar } = req.user;
res.json({ id, username, discriminator, avatar });
});


export default router;