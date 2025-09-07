// models/BuilderReview.js
const mongoose = require("mongoose");
const seoDataSchema = require("./SeoData");

const builderReviewSchema = new mongoose.Schema({
  pid: { type: String, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  builderName: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  locations: { type: [String], required: true },
  categories: { type: [String], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  categoryRatings: {
    type: Map,
    of: Number,
    default: {}
  },
  isTopBuilderReview: { type: Boolean, default: false },
  seo: seoDataSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search
builderReviewSchema.index({
  title: 'text',
  summary: 'text',
  description: 'text',
  builderName: 'text',
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.keywords': 'text'
});

// Virtual for canonical URL
builderReviewSchema.virtual('canonicalUrl').get(function() {
  return `https://www.indrealty.org/builder-review/${this.seo.slug}`;
});

// Pre-save hook to update timestamps
builderReviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("BuilderReview", builderReviewSchema);
