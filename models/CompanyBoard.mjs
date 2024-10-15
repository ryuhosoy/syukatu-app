import mongoose from "mongoose";

const CompanyBoardSchema = new mongoose.Schema(
  {
    postsCompanyName: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

export default mongoose.model("CompanyBoard", CompanyBoardSchema);
