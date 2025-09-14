// controllers/searchController.js
const Property = require("../models/Property");
const Investment = require("../models/Investment");
const WhatsNew = require("../models/WhatsNew");
const BuilderReview = require("../models/BuilderReview");

// Global search across all content types
const globalSearch = async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: "Search term is required"
      });
    }

    const searchRegex = new RegExp(searchTerm, 'i');

    // Search across all collections in parallel
    const [properties, investments, whatsNew, builderReviews] = await Promise.all([
      Property.find({
        $or: [
          { title: { $regex: searchRegex } },
          { summary: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { 'seo.metaTitle': { $regex: searchRegex } },
          { 'seo.metaDescription': { $regex: searchRegex } },
          { 'seo.keywords': { $regex: searchRegex } },
          { locations: { $regex: searchRegex } },
          { categories: { $regex: searchRegex } }
        ]
      })
      .select('title imageUrl createdAt seo.slug locations categories description')
      .limit(parseInt(limit))
      .lean(),

      Investment.find({
        $or: [
          { title: { $regex: searchRegex } },
          { summary: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { 'seo.metaTitle': { $regex: searchRegex } },
          { 'seo.metaDescription': { $regex: searchRegex } },
          { 'seo.keywords': { $regex: searchRegex } },
          { locations: { $regex: searchRegex } },
          { categories: { $regex: searchRegex } }
        ]
      })
      .select('title imageUrl createdAt seo.slug categories description')
      .limit(parseInt(limit))
      .lean(),

      WhatsNew.find({
        $or: [
          { title: { $regex: searchRegex } },
          { summary: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { 'seo.metaTitle': { $regex: searchRegex } },
          { 'seo.metaDescription': { $regex: searchRegex } },
          { 'seo.keywords': { $regex: searchRegex } },
          { locations: { $regex: searchRegex } },
          { categories: { $regex: searchRegex } }
        ]
      })
      .select('title imageUrl createdAt seo.slug locations categories description')
      .limit(parseInt(limit))
      .lean(),

      BuilderReview.find({
        $or: [
          { title: { $regex: searchRegex } },
          { summary: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { builderName: { $regex: searchRegex } },
          { 'seo.metaTitle': { $regex: searchRegex } },
          { 'seo.metaDescription': { $regex: searchRegex } },
          { 'seo.keywords': { $regex: searchRegex } },
          { locations: { $regex: searchRegex } },
          { categories: { $regex: searchRegex } }
        ]
      })
      .select('title imageUrl createdAt seo.slug locations categories description builderName rating')
      .limit(parseInt(limit))
      .lean()
    ]);

    // Format results with type information
    const results = [
      ...properties.map(item => ({ ...item, type: 'property' })),
      ...investments.map(item => ({ ...item, type: 'investment' })),
      ...whatsNew.map(item => ({ ...item, type: 'whatsNew' })),
      ...builderReviews.map(item => ({ ...item, type: 'builderReview' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      results,
      counts: {
        properties: properties.length,
        investments: investments.length,
        whatsNew: whatsNew.length,
        builderReviews: builderReviews.length,
        total: results.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform search. Please try again later.'
    });
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q: searchTerm, limit = 5 } = req.query;

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }

    const searchRegex = new RegExp(searchTerm, 'i');

    // Get suggestions from all collections
    const [propertyTitles, investmentTitles, whatsNewTitles, builderReviewTitles, builderNames] = await Promise.all([
      Property.find({ title: { $regex: searchRegex } })
        .select('title seo.slug')
        .limit(parseInt(limit))
        .lean(),
      
      Investment.find({ title: { $regex: searchRegex } })
        .select('title seo.slug')
        .limit(parseInt(limit))
        .lean(),
      
      WhatsNew.find({ title: { $regex: searchRegex } })
        .select('title seo.slug')
        .limit(parseInt(limit))
        .lean(),
      
      BuilderReview.find({ title: { $regex: searchRegex } })
        .select('title seo.slug')
        .limit(parseInt(limit))
        .lean(),
      
      BuilderReview.find({ builderName: { $regex: searchRegex } })
        .select('builderName')
        .limit(parseInt(limit))
        .lean()
    ]);

    // Format suggestions
    const suggestions = [
      ...propertyTitles.map(item => ({
        text: item.title,
        type: 'property',
        slug: item.seo.slug
      })),
      ...investmentTitles.map(item => ({
        text: item.title,
        type: 'investment',
        slug: item.seo.slug
      })),
      ...whatsNewTitles.map(item => ({
        text: item.title,
        type: 'whatsNew',
        slug: item.seo.slug
      })),
      ...builderReviewTitles.map(item => ({
        text: item.title,
        type: 'builderReview',
        slug: item.seo.slug
      })),
      ...builderNames.map(item => ({
        text: item.builderName,
        type: 'builder',
        slug: null
      }))
    ].slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get search suggestions.'
    });
  }
};

module.exports = {
  globalSearch,
  getSearchSuggestions
};