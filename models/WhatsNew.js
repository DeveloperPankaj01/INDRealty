// models/WhatsNew.js
const mongoose = require("mongoose");
const seoDataSchema = require("./SeoData");

const whatsNewSchema = new mongoose.Schema({
  pid: { type: String, unique: true }, // Property ID
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  locations: { type: [String], required: true }, // Array of locations
  categories: { type: [String], required: true }, // Array of categories
  isTopWhatsNew: { type: Boolean, default: false }, // New field to mark as Top WhatsNew
  seo: seoDataSchema, // Embed the SEO schema
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search
whatsNewSchema.index({
  title: 'text',
  summary: 'text',
  description: 'text',
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.keywords': 'text'
});

// Virtual for canonical URL
whatsNewSchema.virtual('canonicalUrl').get(function() {
  return `https://www.indrealty.org/whats-new/${this.seo.slug}`;
});

// Pre-save hook to update timestamps
whatsNewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("WhatsNew", whatsNewSchema);


