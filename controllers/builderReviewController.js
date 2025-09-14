// const BuilderReview = require("../models/BuilderReview");
// const { v4: uuidv4 } = require("uuid");
// const User = require("../models/User");
// const slugify = require("slugify");

// // Helper function to generate SEO data
// const generateSeoData = (builderReviewData, existingSlug = null) => {
//   const seo = builderReviewData.seo || {};
//   const slug =
//     seo.slug ||
//     existingSlug ||
//     slugify(builderReviewData.title, {
//       lower: true,
//       strict: true,
//       remove: /[*+~.()'"!:@]/g,
//     });

//   // Generate keywords from BuilderReview data
//   const baseKeywords = [
//     "builder review",
//     "real estate builder",
//     "construction company review",
//     "builder ratings",
//   ];
//   const locationKeywords = (builderReviewData.locations || []).map(
//     (loc) => `builder review in ${loc}`
//   );
//   const builderKeywords = [`${builderReviewData.builderName} review`];
//   const categoryKeywords = (builderReviewData.categories || []).map(
//     (cat) => `${cat} builder review`
//   );
//   const keywords =
//     seo.keywords && seo.keywords.length > 0
//       ? seo.keywords
//       : [...new Set([...baseKeywords, ...locationKeywords, ...builderKeywords, ...categoryKeywords])];

//   // Structured data for rich snippets
//   const structuredData = {
//     "@context": "https://schema.org",
//     "@type": "Review",
//     itemReviewed: {
//       "@type": "Organization",
//       name: builderReviewData.builderName
//     },
//     reviewRating: {
//       "@type": "Rating",
//       ratingValue: builderReviewData.rating,
//       bestRating: "5"
//     },
//     author: {
//       "@type": "Organization",
//       name: "IndRealty",
//     },
//     headline: builderReviewData.title,
//     description: builderReviewData.summary,
//     image: builderReviewData.imageUrl,
//     url: seo.canonicalUrl || `https://www.indrealty.org/builder-review/${slug}`,
//     datePublished: new Date().toISOString(),
//     dateModified: new Date().toISOString(),
//   };

//   return {
//     metaTitle:
//       seo.metaTitle || builderReviewData.metaTitle || `${builderReviewData.builderName} Review | ${builderReviewData.title} | IndRealty`,
//     metaDescription:
//       seo.metaDescription || builderReviewData.metaDescription || `${builderReviewData.summary}`,
//     slug,
//     keywords,
//     ogTitle: seo.ogTitle || builderReviewData.ogTitle || builderReviewData.title,
//     ogDescription: seo.ogDescription || builderReviewData.ogDescription || builderReviewData.summary,
//     ogImage: seo.ogImage || builderReviewData.ogImage || builderReviewData.imageUrl,
//     twitterCard: seo.twitterCard || "summary_large_image",
//     canonicalUrl: seo.canonicalUrl || builderReviewData.canonicalUrl || `https://www.indrealty.org/builder-review/${slug}`,
//     structuredData,
//   };
// };

// // Create a new builder review
// const createBuilderReview = async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.body.author });
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ error: "Admin access required" });
//     }

//     // Handle both file upload and direct URL
//     let imageUrl;
//     if (req.file) {
//       imageUrl = `/public/uploads/${req.file.filename}`;
//     } else if (req.body.imageUrl) {
//       imageUrl = req.body.imageUrl;
//     } else {
//       return res.status(400).json({ error: "Either image file or imageUrl is required" });
//     }

//     const seoData = generateSeoData(req.body);

//     const newBuilderReview = new BuilderReview({
//       pid: uuidv4(),
//       author: user._id,
//       builderName: req.body.builderName,
//       title: req.body.title,
//       summary: req.body.summary,
//       description: req.body.description,
//       imageUrl,
//       rating: req.body.rating,
//       categoryRatings: req.body.categoryRatings || {},
//       locations: Array.isArray(req.body.locations) ? req.body.locations : [req.body.locations],
//       categories: Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories],
//       seo: seoData,
//     });

//     await newBuilderReview.save();

//     res.status(201).json({
//       success: true,
//       message: "Builder review created successfully",
//       builderReview: newBuilderReview,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       if (error.keyPattern["seo.slug"]) {
//         return res.status(400).json({
//           success: false,
//           error: "Slug already exists. Please modify the title or provide a custom slug.",
//         });
//       }
//       if (error.keyPattern.pid) {
//         return res.status(400).json({
//           success: false,
//           error: "Duplicate BuilderReview ID. Please try again.",
//         });
//       }
//     }
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

const BuilderReview = require("../models/BuilderReview");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const slugify = require("slugify");

// Helper function to generate SEO data
const generateSeoData = (builderReviewData, existingSlug = null) => {
  const seo = builderReviewData.seo || {};
  const slug =
    seo.slug ||
    existingSlug ||
    slugify(builderReviewData.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

  // Generate keywords from BuilderReview data
  const baseKeywords = [
    "builder review",
    "real estate builder",
    "construction company review",
    "builder ratings",
  ];
  const locationKeywords = (builderReviewData.locations || []).map(
    (loc) => `builder review in ${loc}`
  );
  const builderKeywords = [`${builderReviewData.builderName} review`];
  const categoryKeywords = (builderReviewData.categories || []).map(
    (cat) => `${cat} builder review`
  );
  const keywords =
    seo.keywords && seo.keywords.length > 0
      ? seo.keywords
      : [...new Set([...baseKeywords, ...locationKeywords, ...builderKeywords, ...categoryKeywords])];

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Organization",
      name: builderReviewData.builderName
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: builderReviewData.rating,
      bestRating: "5"
    },
    author: {
      "@type": "Organization",
      name: "IndRealty",
    },
    headline: builderReviewData.title,
    description: builderReviewData.summary,
    image: builderReviewData.imageUrl,
    url: seo.canonicalUrl || `https://www.indrealty.org/builder-review/${slug}`,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };

  return {
    metaTitle:
      seo.metaTitle || builderReviewData.metaTitle || `${builderReviewData.builderName} Review | ${builderReviewData.title} | IndRealty`,
    metaDescription:
      seo.metaDescription || builderReviewData.metaDescription || `${builderReviewData.summary}`,
    slug,
    keywords,
    ogTitle: seo.ogTitle || builderReviewData.ogTitle || builderReviewData.title,
    ogDescription: seo.ogDescription || builderReviewData.ogDescription || builderReviewData.summary,
    ogImage: seo.ogImage || builderReviewData.ogImage || builderReviewData.imageUrl,
    twitterCard: seo.twitterCard || "summary_large_image",
    canonicalUrl: seo.canonicalUrl || builderReviewData.canonicalUrl || `https://www.indrealty.org/builder-review/${slug}`,
    structuredData,
  };
};

// Create a new builder review
const createBuilderReview = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.author });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Handle both file upload and direct URL
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      return res.status(400).json({ error: "Either image file or imageUrl is required" });
    }

    const seoData = generateSeoData(req.body);

    const newBuilderReview = new BuilderReview({
      pid: uuidv4(),
      author: user._id,
      builderName: req.body.builderName,
      title: req.body.title,
      summary: req.body.summary,
      description: req.body.description,
      imageUrl,
      rating: req.body.rating,
      categoryRatings: req.body.categoryRatings || {},
      locations: Array.isArray(req.body.locations) ? req.body.locations : [req.body.locations],
      categories: Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories],
      seo: seoData,
    });

    await newBuilderReview.save();

    res.status(201).json({
      success: true,
      message: "Builder review created successfully",
      builderReview: newBuilderReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern["seo.slug"]) {
        return res.status(400).json({
          success: false,
          error: "Slug already exists. Please modify the title or provide a custom slug.",
        });
      }
      if (error.keyPattern.pid) {
        return res.status(400).json({
          success: false,
          error: "Duplicate BuilderReview ID. Please try again.",
        });
      }
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get BuilderReview by slug
const getBuilderReviewBySlug = async (req, res) => {
  try {
    const builderReview = await BuilderReview.findOne({
      "seo.slug": req.params.slug,
    })
      .select('title imageUrl createdAt author categories seo summary description builderName rating categoryRatings') // Added categoryRatings
      .populate("author", "username")
      .lean();

    if (!builderReview) {
      return res.status(404).json({
        success: false,
        error: "Builder review not found"
      });
    }

    // Get top builder reviews for sidebar
    const topBuilderReviews = await BuilderReview.find({
      isTopBuilderReview: true,
      _id: { $ne: builderReview._id } // Exclude current review
    })
      .select('title imageUrl createdAt seo.slug builderName rating')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const optimizedTopBuilderReviews = topBuilderReviews.map(doc => ({
      _id: doc._id,
      title: doc.title,
      builderName: doc.builderName,
      imageUrl: doc.imageUrl,
      rating: doc.rating,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo?.slug },
      type: 'builderReview'
    }));

    res.status(200).json({
      success: true,
      builderReview,
      topPosts: optimizedTopBuilderReviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update builder review SEO data
const updateBuilderReviewSeo = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    const builderReview = await BuilderReview.findById(req.params.id);
    if (!builderReview) {
      return res.status(404).json({ error: "Builder review not found" });
    }

    // Update SEO data
    builderReview.seo.metaTitle = req.body.metaTitle || builderReview.seo.metaTitle;
    builderReview.seo.metaDescription =
      req.body.metaDescription || builderReview.seo.metaDescription;
    builderReview.seo.keywords = Array.isArray(req.body.keywords)
      ? req.body.keywords
      : builderReview.seo.keywords;
    builderReview.seo.ogTitle = req.body.ogTitle || builderReview.seo.ogTitle;
    builderReview.seo.ogDescription =
      req.body.ogDescription || builderReview.seo.ogDescription;

    if (req.body.slug && req.body.slug !== builderReview.seo.slug) {
      const existing = await BuilderReview.findOne({ "seo.slug": req.body.slug });
      if (existing) {
        return res.status(400).json({ error: "Slug already exists" });
      }
      builderReview.seo.slug = req.body.slug;
    }

    await builderReview.save();

    res.status(200).json({
      message: "SEO data updated successfully",
      seo: builderReview.seo,
    });
  } catch (error) {
    console.error("Error updating SEO:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all builder reviews
const getAllBuilderReviews = async (req, res) => {
  try {
    const { isTopBuilderReview } = req.query;
    const filter = isTopBuilderReview ? { isTopBuilderReview: true } : {};

    const builderReviews = await BuilderReview.find(filter)
      .select('title imageUrl createdAt seo.slug locations categories description builderName rating')
      .lean()
      .sort({ createdAt: -1 });

    // Optimize response
    const optimizedBuilderReviews = builderReviews.map(doc => ({
      _id: doc._id,
      title: doc.title,
      builderName: doc.builderName,
      imageUrl: doc.imageUrl,
      rating: doc.rating,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo.slug },
      locations: Array.isArray(doc.locations) ? doc.locations : [doc.locations].filter(Boolean),
      categories: Array.isArray(doc.categories) ? doc.categories : [doc.categories].filter(Boolean),
      description: doc.description
    }));

    res.status(200).json({ builderReviews: optimizedBuilderReviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single builder review by ID
const getBuilderReviewById = async (req, res) => {
  const { id } = req.params;

  try {
    const builderReview = await BuilderReview.findById(id).populate(
      "author",
      "username email"
    );
    if (!builderReview) {
      return res.status(404).json({ error: "Builder review not found" });
    }
    res.status(200).json({ builderReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a builder review
const updateBuilderReview = async (req, res) => {
  const { id } = req.params;
  const {
    builderName,
    title,
    summary,
    description,
    imageUrl,
    locations,
    categories,
    rating,
    categoryRatings,
    username,
  } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin)
      return res
        .status(403)
        .json({ error: "Only admin users can update builder reviews" });

    const updatedBuilderReview = await BuilderReview.findByIdAndUpdate(
      id,
      {
        builderName,
        title,
        summary,
        description,
        imageUrl,
        locations,
        categories,
        rating,
        categoryRatings,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedBuilderReview)
      return res.status(404).json({ error: "Builder review not found" });

    res.status(200).json({
      message: "Builder review updated successfully",
      builderReview: updatedBuilderReview,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a builder review
const deleteBuilderReview = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin)
      return res
        .status(403)
        .json({ error: "Only admin users can delete builder reviews" });

    const deletedBuilderReview = await BuilderReview.findByIdAndDelete(id);
    if (!deletedBuilderReview)
      return res.status(404).json({ error: "Builder review not found" });

    res.status(200).json({ message: "Builder review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Top BuilderReview
const toggleTopBuilderReview = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Only admin users can perform this action" });
    }

    const builderReview = await BuilderReview.findById(id);
    if (!builderReview) {
      return res.status(404).json({ error: "Builder review not found" });
    }

    builderReview.isTopBuilderReview = !builderReview.isTopBuilderReview;
    await builderReview.save();

    res.status(200).json({
      message: "Top BuilderReview status updated successfully",
      builderReview,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top builder reviews for sidebar
const getTopBuilderReviews = async (req, res) => {
  try {
    const builderReviews = await BuilderReview.find({ isTopBuilderReview: true })
      .select('title imageUrl createdAt seo.slug builderName rating')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const optimizedBuilderReviews = builderReviews.map(doc => ({
      _id: doc._id,
      title: doc.title,
      builderName: doc.builderName,
      imageUrl: doc.imageUrl,
      rating: doc.rating,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo?.slug },
      type: 'builderReview'
    }));

    res.status(200).json({ builderReviews: optimizedBuilderReviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBuilderReview,
  getAllBuilderReviews,
  getBuilderReviewById,
  updateBuilderReview,
  deleteBuilderReview,
  toggleTopBuilderReview,
  getBuilderReviewBySlug,
  updateBuilderReviewSeo,
  getTopBuilderReviews,
};


