import { model, Schema } from "mongoose";
import { TBlog } from "./blog.interface";

const BlogSchema = new Schema<TBlog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:""
    },
    tags: [{
      type: String,
    }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

BlogSchema.pre("find", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

BlogSchema.pre("findOne", function (next) {
  this.findOne({ isDeleted: { $ne: true } });
  next();
});

BlogSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

// BlogSchema.statics.isServiceExists = async function (id: string) {
//   const existingService = await Blog.findOne({ id });
//   return existingService;
// };

export const Blog = model<TBlog>("Blog", BlogSchema);