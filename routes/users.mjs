import express from "express";
import User from "../models/User.mjs";

const router = express.Router();

router.put("/:id/addToFavoriteCompanies", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      await user.updateOne({
        $push: {
          favoriteCompanies: req.body.addFavoriteCompanyContent,
        },
      });
      return res.status(200).json("会社をお気に入り追加できました。");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(500)
      .json("ログインしないと会社をお気に入りに追加できません。");
  }
});

router.delete("/:id", async (req, res) => {
  console.log("req.body.userId", req.body.userId);
  console.log("req.params.id", req.params.id);  
  console.log("req.body.isAdmin", req.body.isAdmin);  

  
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("ユーザー情報が削除されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("あなたは自分のアカウントの時だけ情報を削除できます");
  }
});

router.delete("/:id/deleteFromFavoriteCompanies", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      await user.updateOne({
        $pull: {
          favoriteCompanies: req.body.deleteFavoriteCompanyContent,
        },
      });
      return res.status(200).json("会社をお気に入りから削除できました。");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(500)
      .json("ログインしないと会社をお気に入りに追加できません。");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/:id/fetchFavoriteCompanies", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { favoriteCompanies } = user._doc;
    res.status(200).json(favoriteCompanies);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
