// models/SeoData.js
const mongoose = require("mongoose");

const seoDataSchema = new mongoose.Schema({
  metaTitle: { 
    type: String, 
    required: [true, 'Meta title is required'],
    // trim: true,
    // maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: { 
    type: String, 
    required: [true, 'Meta description is required'],
    // trim: true,
    // maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  slug: { 
    type: String, 
    unique: true, 
    required: [true, 'Slug is required'],
    // trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain letters, numbers and hyphens']
  },
  keywords: [{ 
    type: String,
    // trim: true,
    // lowercase: true
  }],
  ogTitle: {
    type: String,
    // trim: true,
    // maxlength: 60
  },
  ogDescription: {
    type: String,
    // trim: true,
    // maxlength: 160
  },
  ogImage: {
    type: String,
    // trim: true
  },
  twitterCard: {
    type: String,
    enum: ['summary', 'summary_large_image', 'app', 'player'],
    default: 'summary_large_image'
  },
  structuredData: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

module.exports = seoDataSchema;

