import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    desc: {
      type: String,
      max: 200,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    companyName: {
      type: String,
    },
  },

  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
