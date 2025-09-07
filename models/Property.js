
// models/Property.js
const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const seoDataSchema = require("./SeoData");

const propertySchema = new mongoose.Schema({
  pid: { type: String, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  locations: { type: [String], required: true },
  categories: { type: [String], required: true },
  isTopProperty: { type: Boolean, default: false },
  seo: seoDataSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search
propertySchema.index({
  title: 'text',
  summary: 'text',
  description: 'text',
  'seo.metaTitle': 'text',
  'seo.metaDescription': 'text',
  'seo.keywords': 'text'
});

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

