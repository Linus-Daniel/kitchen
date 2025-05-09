import { Schema, model, models } from 'mongoose';

const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
  imageUrl: { type: String, required: true },
  author: { type: String, required: true, default: "umason studio" },
  authorAvatar: { type: String, required: true, default: "/imges/logo.png" },
  date: { type: Date, default: Date.now }
});

export default models.BlogPost || model('BlogPost', BlogPostSchema);