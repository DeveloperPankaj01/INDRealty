// // models/BuilderReview.js
// const mongoose = require("mongoose");
// const seoDataSchema = require("./SeoData");

// const builderReviewSchema = new mongoose.Schema({
//   pid: { type: String, unique: true },
//   author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   builderName: { type: String, required: true },
//   title: { type: String, required: true },
//   summary: { type: String, required: true },
//   description: { type: String, required: true },
//   imageUrl: { type: String, required: true },
//   locations: { type: [String], required: true },
//   categories: { type: [String], required: true },
//   rating: { type: Number, min: 1, max: 5, required: true },
//   categoryRatings: {
//     type: Map,
//     of: Number,
//     default: {}
//   },
//   isTopBuilderReview: { type: Boolean, default: false },
//   seo: seoDataSchema,
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// }, {
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Add text index for search
// builderReviewSchema.index({
//   title: 'text',
//   summary: 'text',
//   description: 'text',
//   builderName: 'text',
//   'seo.metaTitle': 'text',
//   'seo.metaDescription': 'text',
//   'seo.keywords': 'text'
// });

// // Virtual for canonical URL
// builderReviewSchema.virtual('canonicalUrl').get(function() {
//   return `https://www.indrealty.org/builder-review/${this.seo.slug}`;
// });

// // Pre-save hook to update timestamps
// builderReviewSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model("BuilderReview", builderReviewSchema);

// models/BuilderReview.js
const mongoose = require("mongoose");
const seoDataSchema = require("./SeoData");

const builderReviewSchema = new mongoose.Schema({
  pid: { 
    type: String, 
    unique: true,
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  builderName: { 
    type: String, 
    required: true,
    trim: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  summary: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true
  },
  imageUrl: { 
    type: String, 
    required: true
  },
  locations: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one location is required'
    }
  },
  categories: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one category is required'
    }
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  categoryRatings: {
    type: Map,
    of: Number,
    default: {}
  },
  isTopBuilderReview: { 
    type: Boolean, 
    default: false 
  },
  seo: seoDataSchema,
  // News metadata for news sitemap
  isNews: {
    type: Boolean,
    default: false
  },
  newsMeta: {
    publicationDate: {
      type: Date,
      default: Date.now
    },
    genres: [String],
    stockTickers: [String]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// Text index for search
builderReviewSchema.index({
  title: 'text',
  summary: 'text',
  description: 'text',
  builderName: 'text',
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.keywords': 'text',
  locations: 'text',
  categories: 'text'
});

// Index for filtering and sorting
builderReviewSchema.index({ createdAt: -1 });
builderReviewSchema.index({ isTopBuilderReview: 1, createdAt: -1 });
builderReviewSchema.index({ categories: 1, createdAt: -1 });
builderReviewSchema.index({ locations: 1, createdAt: -1 });
builderReviewSchema.index({ rating: -1, createdAt: -1 });
builderReviewSchema.index({ builderName: 1, createdAt: -1 });
builderReviewSchema.index({ 'seo.slug': 1 }, { unique: true });

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
