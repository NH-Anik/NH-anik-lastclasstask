import mongoose from 'mongoose'

const clientPostSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    user:{
      type: mongoose.ObjectId,
      ref: "user",
      required: true,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);
    
export default mongoose.model('clientPost', clientPostSchema)