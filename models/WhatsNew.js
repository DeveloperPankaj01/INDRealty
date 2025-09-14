// // models/WhatsNew.js
// const mongoose = require("mongoose");
// const seoDataSchema = require("./SeoData");

// const whatsNewSchema = new mongoose.Schema({
//   pid: { type: String, unique: true }, // Property ID
//   author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   title: { type: String, required: true },
//   summary: { type: String, required: true },
//   description: { type: String, required: true },
//   imageUrl: { type: String, required: true },
//   locations: { type: [String], required: true }, // Array of locations
//   categories: { type: [String], required: true }, // Array of categories
//   isTopWhatsNew: { type: Boolean, default: false }, // New field to mark as Top WhatsNew
//   seo: seoDataSchema, // Embed the SEO schema
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// }, {
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Add text index for search
// whatsNewSchema.index({
//   title: 'text',
//   summary: 'text',
//   description: 'text',
//   'seo.metaTitle': 'text',
//   'seo.metaDescription': 'text',
//   'seo.keywords': 'text'
// });

// // Virtual for canonical URL
// whatsNewSchema.virtual('canonicalUrl').get(function() {
//   return `https://www.indrealty.org/whats-new/${this.seo.slug}`;
// });

// // Pre-save hook to update timestamps
// whatsNewSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model("WhatsNew", whatsNewSchema);

// models/WhatsNew.js
const mongoose = require("mongoose");
const seoDataSchema = require("./SeoData");

const whatsNewSchema = new mongoose.Schema({
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
  isTopWhatsNew: { 
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
whatsNewSchema.index({
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
whatsNewSchema.index({ createdAt: -1 });
whatsNewSchema.index({ isTopWhatsNew: 1, createdAt: -1 });
whatsNewSchema.index({ categories: 1, createdAt: -1 });
whatsNewSchema.index({ locations: 1, createdAt: -1 });
whatsNewSchema.index({ 'seo.slug': 1 }, { unique: true });

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

