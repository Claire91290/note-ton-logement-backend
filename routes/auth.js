// routes/auth.js
import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

router.post("/verify-google-token", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token manquant" });

  try {
    const userData = await verifyGoogleToken(token);

    let user = await User.findOne({ googleId: userData.sub });
    if (!user) {
      user = new User({
        googleId: userData.sub,
        email: userData.email,
        name: userData.name,
      });
      await user.save();
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
});

export default router;
