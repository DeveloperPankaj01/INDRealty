// controllers/investmentController.js
const Investment = require("../models/Investment");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

// Helper function to generate SEO data
const generateSeoData = (investmentData, existingSlug = null) => {
  const seo = investmentData.seo || {};
  const slug =
    seo.slug ||
    existingSlug ||
    slugify(investmentData.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

  // Generate keywords from investment data
  const baseKeywords = [
    "real estate investment",
    "property investment",
    "India investment",
  ];
  const locationKeywords = (investmentData.locations || []).map(
    (loc) => `investment in ${loc}`
  );
  const categoryKeywords = (investmentData.categories || []).map(
    (cat) => `${cat} investment`
  );
  const keywords =
    seo.keywords && seo.keywords.length > 0
      ? seo.keywords
      : [...new Set([...baseKeywords, ...locationKeywords, ...categoryKeywords])];

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "InvestmentOrDeposit",
    name: investmentData.title,
    description: investmentData.summary,
    image: investmentData.imageUrl,
    url: seo.canonicalUrl || `https://www.indrealty.org/investment/${slug}`,
    investmentType: (investmentData.categories || []).join(", "),
    areaServed: (investmentData.locations || []).join(", "),
    offers: {
      "@type": "Offer",
      category: "RealEstateInvestment",
    },
  };

  return {
    metaTitle:
      seo.metaTitle || investmentData.metaTitle || `${investmentData.title} | Investment Opportunity | IndRealty`,
    metaDescription:
      seo.metaDescription || investmentData.metaDescription || `${investmentData.summary}`,
    slug,
    keywords,
    ogTitle: seo.ogTitle || investmentData.ogTitle || investmentData.title,
    ogDescription: seo.ogDescription || investmentData.ogDescription || investmentData.summary,
    ogImage: seo.ogImage || investmentData.ogImage || investmentData.imageUrl,
    twitterCard: seo.twitterCard || "summary_large_image",
    canonicalUrl: seo.canonicalUrl || investmentData.canonicalUrl || `https://www.indrealty.org/investment/${slug}`,
    structuredData,
  };
};

// Create a new investment listing
const createInvestment = async (req, res) => {
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

    const newInvestment = new Investment({
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

    await newInvestment.save();

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      investment: newInvestment,
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
          error: "Duplicate investment ID. Please try again.",
        });
      }
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get investment by slug
const getInvestmentBySlug = async (req, res) => {
  try {
    const investment = await Investment.findOne({ "seo.slug": req.params.slug })
      .select('title imageUrl createdAt author categories seo summary description')
      .populate("author", "username")
      .lean();

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: "Investment not found"
      });
    }

    // Get top investments for sidebar
    const topInvestments = await Investment.find({
      isTopInvestment: true,
      _id: { $ne: investment._id } // Exclude current investment
    })
      .select('title imageUrl createdAt seo.slug')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const optimizedTopInvestments = topInvestments.map(doc => ({
      _id: doc._id,
      title: doc.title,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo?.slug },
      type: 'investment'
    }));

    res.status(200).json({
      success: true,
      investment,
      topPosts: optimizedTopInvestments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update investment SEO data
const updateInvestmentSeo = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }

    // Update SEO data - ensure keywords exists and is an array
    investment.seo.metaTitle = req.body.metaTitle || investment.seo.metaTitle;
    investment.seo.metaDescription =
      req.body.metaDescription || investment.seo.metaDescription;
    investment.seo.keywords = Array.isArray(req.body.keywords)
      ? req.body.keywords
      : investment.seo.keywords;
    investment.seo.ogTitle = req.body.ogTitle || investment.seo.ogTitle;
    investment.seo.ogDescription =
      req.body.ogDescription || investment.seo.ogDescription;

    // If you're changing the slug, you might want to add validation
    if (req.body.slug && req.body.slug !== investment.seo.slug) {
      const existing = await Investment.findOne({ "seo.slug": req.body.slug });
      if (existing) {
        return res.status(400).json({ error: "Slug already exists" });
      }
      investment.seo.slug = req.body.slug;
    }

    await investment.save();

    res.status(200).json({
      message: "SEO data updated successfully",
      seo: investment.seo,
    });
  } catch (error) {
    console.error("Error updating SEO:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all property listings
// const getAllInvestments = async (req, res) => {
//   try {
//     const { isTopInvestment } = req.query;
//     const filter = isTopInvestment ? { isTopInvestment: true } : {};

//     const investments = await Investment.find(filter)
//       .select('title imageUrl createdAt seo.slug categories description')
//       .lean()
//       .sort({ createdAt: -1 });

//     // Optimize response
//     const optimizedInvestments = investments.map(doc => ({
//       _id: doc._id,
//       title: doc.title,
//       imageUrl: doc.imageUrl,
//       createdAt: doc.createdAt,
//       seo: { slug: doc.seo.slug },
//       categories: Array.isArray(doc.categories) ? doc.categories : [doc.categories].filter(Boolean),
//       description: doc.description
//     }));

//     res.status(200).json({ investments: optimizedInvestments });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getAllInvestments = async (req, res) => {
  try {
    const { isTopInvestment, search } = req.query;
    const filter = isTopInvestment ? { isTopInvestment: true } : {};

    // Build query with search functionality
    let query = Investment.find(filter)
      .select('title imageUrl createdAt seo.slug categories description')
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

    const investments = await query.sort({ createdAt: -1 });

    // Optimize response
    const optimizedInvestments = investments.map(doc => ({
      _id: doc._id,
      title: doc.title,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo.slug },
      categories: Array.isArray(doc.categories) ? doc.categories : [doc.categories].filter(Boolean),
      description: doc.description
    }));

    res.status(200).json({ investments: optimizedInvestments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single property by ID
const getInvestmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const investment = await Investment.findById(id)
      .populate("author", "username email")
      .populate("interestedUsers", "username email"); // Populate interestedUsers
    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }
    res.status(200).json({ investment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a property listing
const updateInvestment = async (req, res) => {
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
        .json({ error: "Only admin users can update properties" });

    const updatedInvestment = await Investment.findByIdAndUpdate(
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

    if (!updatedInvestment)
      return res.status(404).json({ error: "Investment not found" });

    res.status(200).json({
      message: "Investment updated successfully",
      investment: updatedInvestment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a property listing
const deleteInvestment = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  console.log("Deleting Investment with ID:", id); // Add this line

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin)
      return res
        .status(403)
        .json({ error: "Only admin users can delete properties" });

    const deletedInvestment = await Investment.findByIdAndDelete(id);
    if (!deletedInvestment)
      return res.status(404).json({ error: "Investment not found" });

    res.status(200).json({ message: "Investment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Express interest in an investment
const expressInterest = async (req, res) => {
  const { investmentId } = req.params;
  const { userId } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }

    // Check if the user is already in the interestedUsers array
    if (investment.interestedUsers.includes(user._id)) {
      return res.status(400).json({ error: "User already expressed interest" });
    }

    // Add the user's ObjectId to the interestedUsers array
    investment.interestedUsers.push(user._id);
    await investment.save();

    res
      .status(200)
      .json({ message: "Interest expressed successfully", investment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Top Property
const toggleTopInvestment = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Only admin users can perform this action" });
    }

    const investment = await Investment.findById(id);
    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }

    investment.isTopInvestment = !investment.isTopInvestment; // Toggle the isTopInvestment field
    await investment.save();

    res.status(200).json({
      message: "Top Investment status updated successfully",
      investment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top investments for sidebar
const getTopInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ isTopInvestment: true })
      .select('title imageUrl createdAt seo.slug')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const optimizedInvestments = investments.map(doc => ({
      _id: doc._id,
      title: doc.title,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      seo: { slug: doc.seo?.slug },
      type: 'investment'
    }));

    res.status(200).json({ investments: optimizedInvestments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createInvestment,
  getAllInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  expressInterest,
  toggleTopInvestment,
  getInvestmentBySlug,
  updateInvestmentSeo,
  getTopInvestments,
};
