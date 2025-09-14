// // models/Investment.js
// const mongoose = require("mongoose");
// const seoDataSchema = require("./SeoData");

// const investmentSchema = new mongoose.Schema({
//   pid: { type: String, unique: true },
//   author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   title: { type: String, required: true },
//   summary: { type: String, required: true },
//   description: { type: String, required: true },
//   imageUrl: { type: String, required: true },
//   locations: { type: [String], required: true },
//   categories: { type: [String], required: true },
//   isTopInvestment: { type: Boolean, default: false },
//   interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   seo: seoDataSchema,
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// }, {
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Text index for search
// investmentSchema.index({
//   title: 'text',
//   summary: 'text',
//   description: 'text',
//   'seo.metaTitle': 'text',
//   'seo.metaDescription': 'text',
//   'seo.keywords': 'text'
// });

// // Virtual for canonical URL
// investmentSchema.virtual('canonicalUrl').get(function() {
//   return `https://www.indrealty.org/investment/${this.seo.slug}`;
// });

// // Pre-save hook to update timestamps
// investmentSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model("Investment", investmentSchema);

// models/Investment.js
const mongoose = require("mongoose");
const seoDataSchema = require("./SeoData");

const investmentSchema = new mongoose.Schema({
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
  isTopInvestment: { 
    type: Boolean, 
    default: false 
  },
  interestedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
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
investmentSchema.index({
  title: 'text',
  summary: 'text',
  description: 'text',
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.keywords': 'text',
  locations: 'text',
  categories: 'text'
});

// Index for filtering and sorting
investmentSchema.index({ createdAt: -1 });
investmentSchema.index({ isTopInvestment: 1, createdAt: -1 });
investmentSchema.index({ categories: 1, createdAt: -1 });
investmentSchema.index({ locations: 1, createdAt: -1 });
investmentSchema.index({ 'seo.slug': 1 }, { unique: true });

// Virtual for canonical URL
investmentSchema.virtual('canonicalUrl').get(function() {
  return `https://www.indrealty.org/investment/${this.seo.slug}`;
});

// Pre-save hook to update timestamps
investmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Investment", investmentSchema);
