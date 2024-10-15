import express from "express";
import User from "../models/User.mjs";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    const user = await newUser.save();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// router.get("/register", (req, res) => {
//   res.send("register router");
// });

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("ユーザーが見つかりません");
    
    const vailedPassword = req.body.password === user.password;
    if (!vailedPassword) return res.status(400).json("パスワードが違います");

    await user.updateOne({
      $set: {
        isAdmin: true,
      },
    });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.put("/logout", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("ユーザーが見つかりません");

    await user.updateOne({
      $set: {
        isAdmin: false,
      },
    });
    return res.status(200).json("ログアウトしました。");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// router.get("/", (req, res) => {
//   res.send("auth router");
// });

export default router;
