
// // models/Property.js
// const mongoose = require("mongoose");
// const mongoosePaginate = require('mongoose-paginate-v2');
// const seoDataSchema = require("./SeoData");

// const propertySchema = new mongoose.Schema({
//   pid: { type: String, unique: true },
//   author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   title: { type: String, required: true },
//   summary: { type: String, required: true },
//   description: { type: String, required: true },
//   imageUrl: { type: String, required: true },
//   locations: { type: [String], required: true },
//   categories: { type: [String], required: true },
//   isTopProperty: { type: Boolean, default: false },
//   seo: seoDataSchema,
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// }, {
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Text index for search
// propertySchema.index({
//   title: 'text',
//   summary: 'text',
//   description: 'text',
//   'seo.metaTitle': 'text',
//   'seo.metaDescription': 'text',
//   'seo.keywords': 'text'
// });

// // Virtual for canonical URL
// propertySchema.virtual('canonicalUrl').get(function() {
//   return `https://www.indrealty.org/properties/${this.seo.slug}`;
// });

// // Pre-save hook to update timestamps
// propertySchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// propertySchema.plugin(mongoosePaginate);
// module.exports = mongoose.model("Property", propertySchema);

// models/Property.js
const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const seoDataSchema = require("./SeoData");

const propertySchema = new mongoose.Schema({
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
  isTopProperty: { 
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
propertySchema.index({
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
propertySchema.index({ createdAt: -1 });
propertySchema.index({ isTopProperty: 1, createdAt: -1 });
propertySchema.index({ categories: 1, createdAt: -1 });
propertySchema.index({ locations: 1, createdAt: -1 });
propertySchema.index({ 'seo.slug': 1 }, { unique: true });

// Virtual for canonical URL
propertySchema.virtual('canonicalUrl').get(function() {
  return `https://www.indrealty.org/properties/${this.seo.slug}`;
});

// Pre-save hook to update timestamps
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

propertySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Property", propertySchema);
