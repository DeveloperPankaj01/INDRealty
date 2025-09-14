// controllers/whatsNewController.js
const WhatsNew = require("../models/WhatsNew");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const slugify = require("slugify");

// Helper function to generate SEO data
const generateSeoData = (whatsNewData, existingSlug = null) => {
  const seo = whatsNewData.seo || {};
  const slug =
    seo.slug ||
    existingSlug ||
    slugify(whatsNewData.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

  // Generate keywords from WhatsNew data
  const baseKeywords = [
    "real estate news",
    "property updates",
    "India real estate",
  ];
  const locationKeywords = (whatsNewData.locations || []).map(
    (loc) => `real estate news in ${loc}`
  );
  const categoryKeywords = (whatsNewData.categories || []).map(
    (cat) => `${cat} updates`
  );
  const keywords =
    seo.keywords && seo.keywords.length > 0
      ? seo.keywords
      : [...new Set([...baseKeywords, ...locationKeywords, ...categoryKeywords])];

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: whatsNewData.title,
    description: whatsNewData.summary,
    image: whatsNewData.imageUrl,
    url: seo.canonicalUrl || `https://www.indrealty.org/whats-new/${slug}`,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "IndRealty",
    },
  };

  return {
    metaTitle:
      seo.metaTitle || whatsNewData.metaTitle || `${whatsNewData.title} | Latest Updates | IndRealty`,
    metaDescription:
      seo.metaDescription || whatsNewData.metaDescription || `${whatsNewData.summary}`,
    slug,
    keywords,
    ogTitle: seo.ogTitle || whatsNewData.ogTitle || whatsNewData.title,
    ogDescription: seo.ogDescription || whatsNewData.ogDescription || whatsNewData.summary,
    ogImage: seo.ogImage || whatsNewData.ogImage || whatsNewData.imageUrl,
    twitterCard: seo.twitterCard || "summary_large_image",
    canonicalUrl: seo.canonicalUrl || whatsNewData.canonicalUrl || `https://www.indrealty.org/whats-new/${slug}`,
    structuredData,
  };
};

// Create a new whats new listing
const createWhatsNew = async (req, res) => {
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

    const newWhatsNew = new WhatsNew({
      pid: uuidv4(),
      author: user._id,
      title: req.body.title,
      summary: req.body.summary,
      description: req.body.description,
      imageUrl,
      locations: Array.isArray(req.body.locations) ? req.body.locations : [req.body.locations],
      categories: Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories],
      seo: seoData,
    });

    await newWhatsNew.save();

    res.status(201).json({
      success: true,
      message: "WhatsNew created successfully",
      whatsNew: newWhatsNew,
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
          error: "Duplicate WhatsNew ID. Please try again.",
        });
      }
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Whatsnew by slug
const getWhatsNewBySlug = async (req, res) => {
  try {
    const whatsNew = await WhatsNew.findOne({
      "seo.slug": req.params.slug,
    })
      .select('title imageUrl createdAt author categories seo summary description')
      .populate("author", "username")
      .lean();

    if (!whatsNew) {
      return res.status(404).json({
        success: false,
        error: "WhatsNew not found"
      });
    }

    // Get top whatsNew for sidebar
    const topWhatsNew = await WhatsNew.find({
      isTopWhatsNew: true,
      _id: { $ne: whatsNew._id } // Exclude current post
    })
      .select('title imageUrl createdAt seo.slug')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const optimizedTopWhatsNew = topWhatsNew.map(doc => ({
      _id: doc._id,
      title: doc.title,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo?.slug },
      type: 'whatsNew'
    }));

    res.status(200).json({
      success: true,
      whatsNew,
      topPosts: optimizedTopWhatsNew
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update whatsNew SEO data
const updateWhatsNewSeo = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required", });
    }

    const whatsNew = await WhatsNew.findById(req.params.id);
    if (!whatsNew) {
      return res.status(404).json({ error: "WhatsNew not found", });
    }

    // Update SEO data - ensure keywords exists and is an array
    whatsNew.seo.metaTitle = req.body.metaTitle || whatsNew.seo.metaTitle;
    whatsNew.seo.metaDescription =
      req.body.metaDescription || whatsNew.seo.metaDescription;
    whatsNew.seo.keywords = Array.isArray(req.body.keywords)
      ? req.body.keywords
      : whatsNew.seo.keywords;
    whatsNew.seo.ogTitle = req.body.ogTitle || whatsNew.seo.ogTitle;
    whatsNew.seo.ogDescription =
      req.body.ogDescription || whatsNew.seo.ogDescription;

    // If you're changing the slug, you might want to add validation
    if (req.body.slug && req.body.slug !== whatsNew.seo.slug) {
      const existing = await WhatsNew.findOne({ "seo.slug": req.body.slug });
      if (existing) {
        return res.status(400).json({ error: "Slug already exists" });
      }
      WhatsNew.seo.slug = req.body.slug;
    }

    await whatsNew.save();

    res.status(200).json({
      message: "SEO data updated successfully",
      seo: whatsNew.seo,
    });
  } catch (error) {
    console.error("Error updating SEO:", error);
    res.status(400).json({ error: error.message, });
  }
};

// Get all whats new listings
// const getAllWhatsNew = async (req, res) => {
//   try {
//     const { isTopWhatsNew } = req.query;
//     const filter = isTopWhatsNew ? { isTopWhatsNew: true } : {};

//     const whatsNew = await WhatsNew.find(filter)
//       .select('title imageUrl createdAt seo.slug locations categories description')
//       .lean()
//       .sort({ createdAt: -1 });

//     // Optimize response
//     const optimizedWhatsNew = whatsNew.map(doc => ({
//       _id: doc._id,
//       title: doc.title,
//       imageUrl: doc.imageUrl,
//       createdAt: doc.createdAt,
//       seo: { slug: doc.seo.slug },
//       locations: Array.isArray(doc.locations) ? doc.locations : [doc.locations].filter(Boolean),
//       categories: Array.isArray(doc.categories) ? doc.categories : [doc.categories].filter(Boolean),
//       description: doc.description
//     }));

//     res.status(200).json({ whatsNew: optimizedWhatsNew });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getAllWhatsNew = async (req, res) => {
  try {
    const { isTopWhatsNew, search } = req.query;
    const filter = isTopWhatsNew ? { isTopWhatsNew: true } : {};

    // Build query with search functionality
    let query = WhatsNew.find(filter)
      .select('title imageUrl createdAt seo.slug locations categories description')
      .lean();

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.where({
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
      });
    }

    const whatsNew = await query.sort({ createdAt: -1 });

    // Optimize response
    const optimizedWhatsNew = whatsNew.map(doc => ({
      _id: doc._id,
      title: doc.title,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo.slug },
      locations: Array.isArray(doc.locations) ? doc.locations : [doc.locations].filter(Boolean),
      categories: Array.isArray(doc.categories) ? doc.categories : [doc.categories].filter(Boolean),
      description: doc.description
    }));

    res.status(200).json({ whatsNew: optimizedWhatsNew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single whats new by ID
const getWhatsNewById = async (req, res) => {
  const { id } = req.params;

  try {
    const whatsNew = await WhatsNew.findById(id).populate(
      "author",
      "username email"
    );
    if (!whatsNew) {
      return res.status(404).json({ error: "Whats new not found" });
    }
    res.status(200).json({ whatsNew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a whats new listing
const updateWhatsNew = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    summary,
    description,
    imageUrl,
    locations,
    categories,
    username,
  } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin)
      return res
        .status(403)
        .json({ error: "Only admin users can update whats new" });

    const updatedWhatsNew = await WhatsNew.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        description,
        imageUrl,
        locations,
        categories,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedWhatsNew)
      return res.status(404).json({ error: "Whats new not found" });

    res
      .status(200)
      .json({
        message: "Whats new updated successfully",
        whatsNew: updatedWhatsNew,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a whats new listing
const deleteWhatsNew = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  console.log("Deleting whats new with ID:", id); // Add this line

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin)
      return res
        .status(403)
        .json({ error: "Only admin users can delete whats new" });

    const deletedWhatsNew = await WhatsNew.findByIdAndDelete(id);
    if (!deletedWhatsNew)
      return res.status(404).json({ error: "Whats new not found" });

    res.status(200).json({ message: "Whats new deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Top WhatsNew
const toggleTopWhatsNew = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Only admin users can perform this action" });
    }

    const whatsNew = await WhatsNew.findById(id);
    if (!whatsNew) {
      return res.status(404).json({ error: "Whats new not found" });
    }

    whatsNew.isTopWhatsNew = !whatsNew.isTopWhatsNew; // Toggle the isTopWhatsNew field
    await whatsNew.save();

    res
      .status(200)
      .json({ message: "Top WhatsNew status updated successfully", whatsNew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top whatsNew for sidebar
const getTopWhatsNew = async (req, res) => {
  try {
    const whatsNew = await WhatsNew.find({ isTopWhatsNew: true })
      .select('title imageUrl createdAt seo.slug')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const optimizedWhatsNew = whatsNew.map(doc => ({
      _id: doc._id,
      title: doc.title,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo?.slug },
      type: 'whatsNew'
    }));

    res.status(200).json({ whatsNew: optimizedWhatsNew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createWhatsNew,
  getAllWhatsNew,
  getWhatsNewById,
  updateWhatsNew,
  deleteWhatsNew,
  toggleTopWhatsNew,
  getWhatsNewBySlug,
  updateWhatsNewSeo,
  getTopWhatsNew,
};
