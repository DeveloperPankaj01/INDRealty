// controllers/propertyController.js
// const Property = require("../models/Property");
// const { v4: uuidv4 } = require("uuid"); // Import uuid
// const User = require("../models/User"); // Import the User model
// const slugify = require("slugify");

// // Helper function to generate SEO data
// const generateSeoData = (propertyData, existingSlug = null) => {
//   const seo = propertyData.seo || {};
//   const slug =
//     seo.slug ||
//     existingSlug ||
//     slugify(propertyData.title, {
//       lower: true,
//       strict: true,
//       remove: /[*+~.()'"!:@]/g,
//     });

//   // Generate keywords from Property data
//   const baseKeywords = [
//     "real estate news",
//     "property updates",
//     "India real estate",
//   ];
//   const locationKeywords = (propertyData.locations || []).map(
//     (loc) => `real estate news in ${loc}`
//   );
//   const categoryKeywords = (propertyData.categories || []).map(
//     (cat) => `${cat} updates`
//   );
//   const keywords =
//     seo.keywords && seo.keywords.length > 0
//       ? seo.keywords
//       : [...new Set([...baseKeywords, ...locationKeywords, ...categoryKeywords])];

//   // Structured data for rich snippets
//   const structuredData = {
//     "@context": "https://schema.org",
//     "@type": "NewsArticle",
//     headline: propertyData.title,
//     description: propertyData.summary,
//     image: propertyData.imageUrl,
//     url: seo.canonicalUrl || `https://www.indrealty.org/properties/${slug}`,
//     datePublished: new Date().toISOString(),
//     dateModified: new Date().toISOString(),
//     author: {
//       "@type": "Organization",
//       name: "IndRealty",
//     },
//   };

//   return {
//     metaTitle:
//       seo.metaTitle || propertyData.metaTitle || `${propertyData.title} | Latest Updates | IndRealty`,
//     metaDescription:
//       seo.metaDescription || propertyData.metaDescription || `${propertyData.summary}`,
//     slug,
//     keywords,
//     ogTitle: seo.ogTitle || propertyData.ogTitle || propertyData.title,
//     ogDescription: seo.ogDescription || propertyData.ogDescription || propertyData.summary,
//     ogImage: seo.ogImage || propertyData.ogImage || propertyData.imageUrl,
//     twitterCard: seo.twitterCard || "summary_large_image",
//     canonicalUrl: seo.canonicalUrl || propertyData.canonicalUrl || `https://www.indrealty.org/properties/${slug}`,
//     structuredData,
//   };
// };

// // Create a new property listing
// const createProperty = async (req, res) => {
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

//     const newProperty = new Property({
//       pid: uuidv4(),
//       author: user._id,
//       title: req.body.title,
//       summary: req.body.summary,
//       description: req.body.description,
//       imageUrl,
//       locations: Array.isArray(req.body.locations) ? req.body.locations : [req.body.locations],
//       categories: Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories],
//       seo: seoData,
//     });

//     await newProperty.save();

//     res.status(201).json({
//       success: true,
//       message: "Property created successfully",
//       property: newProperty,
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
//           error: "Duplicate Property ID. Please try again.",
//         });
//       }
//     }
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

const Property = require("../models/Property");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const slugify = require("slugify");

// Helper function to generate SEO data
const generateSeoData = (propertyData, existingSlug = null) => {
  const seo = propertyData.seo || {};
  const slug =
    seo.slug ||
    existingSlug ||
    slugify(propertyData.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

  // Generate keywords from Property data
  const baseKeywords = [
    "real estate news",
    "property updates",
    "India real estate",
  ];
  const locationKeywords = (propertyData.locations || []).map(
    (loc) => `real estate news in ${loc}`
  );
  const categoryKeywords = (propertyData.categories || []).map(
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
    headline: propertyData.title,
    description: propertyData.summary,
    image: propertyData.imageUrl,
    url: seo.canonicalUrl || `https://www.indrealty.org/properties/${slug}`,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "IndRealty",
    },
  };

  return {
    metaTitle:
      seo.metaTitle || propertyData.metaTitle || `${propertyData.title} | Latest Updates | IndRealty`,
    metaDescription:
      seo.metaDescription || propertyData.metaDescription || `${propertyData.summary}`,
    slug,
    keywords,
    ogTitle: seo.ogTitle || propertyData.ogTitle || propertyData.title,
    ogDescription: seo.ogDescription || propertyData.ogDescription || propertyData.summary,
    ogImage: seo.ogImage || propertyData.ogImage || propertyData.imageUrl,
    twitterCard: seo.twitterCard || "summary_large_image",
    canonicalUrl: seo.canonicalUrl || propertyData.canonicalUrl || `https://www.indrealty.org/properties/${slug}`,
    structuredData,
  };
};

// Create a new property listing
const createProperty = async (req, res) => {
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

    const newProperty = new Property({
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

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: newProperty,
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
          error: "Duplicate Property ID. Please try again.",
        });
      }
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get property by slug
const getPropertyBySlug = async (req, res) => {
  try {
    const property = await Property.findOne({
      "seo.slug": req.params.slug
    })
      .select('title imageUrl createdAt author categories seo summary description locations')
      .populate("author", "username email")
      .lean();

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.status(200).json({
      property,
      seo: {
        ...property.seo,
        canonicalUrl: property.canonicalUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update property SEO data
const updatePropertySeo = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Update SEO data - ensure keywords exists and is an array
    property.seo.metaTitle = req.body.metaTitle || property.seo.metaTitle;
    property.seo.metaDescription =
      req.body.metaDescription || property.seo.metaDescription;
    property.seo.keywords = Array.isArray(req.body.keywords)
      ? req.body.keywords
      : property.seo.keywords;
    property.seo.ogTitle = req.body.ogTitle || property.seo.ogTitle;
    property.seo.ogDescription =
      req.body.ogDescription || property.seo.ogDescription;

    // If you're changing the slug, you might want to add validation
    if (req.body.slug && req.body.slug !== property.seo.slug) {
      const existing = await Property.findOne({ "seo.slug": req.body.slug });
      if (existing) {
        return res.status(400).json({ error: "Slug already exists" });
      }
      property.seo.slug = req.body.slug;
    }

    await property.save();

    res.status(200).json({
      message: "SEO data updated successfully",
      seo: property.seo,
    });
  } catch (error) {
    console.error("Error updating SEO:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const {
      isTopProperty,
      page = 1,
      limit = 4,
      category,
      location
    } = req.query;

    // Build lean query with only necessary fields
    const query = Property.find()
      .select('title imageUrl createdAt seo.slug locations categories description')
      .lean();

    // Apply filters
    if (isTopProperty) query.where('isTopProperty').equals(true);
    if (category && category !== 'all') query.where('categories').equals(category);
    if (location) query.where('locations').equals(location);

    // Pagination options
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };

    // Execute paginated query
    const properties = await Property.paginate(query, options);

    // Optimize response
    const response = {
      success: true,
      properties: properties.docs.map(doc => ({
        _id: doc._id,
        title: doc.title,
        imageUrl: doc.imageUrl,
        createdAt: doc.createdAt,
        seo: { slug: doc.seo.slug },
        locations: Array.isArray(doc.locations) ? doc.locations : [doc.locations].filter(Boolean),
        categories: Array.isArray(doc.categories) ? doc.categories : [doc.categories].filter(Boolean),
        description: doc.description
      })),
      pagination: {
        total: properties.totalDocs,
        pages: properties.totalPages,
        page: properties.page,
        hasNext: properties.hasNextPage
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties. Please try again later.'
    });
  }
};

// Get a single property by ID
const getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id).populate(
      "author",
      "username email"
    );
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.status(200).json({ property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a property listing
const updateProperty = async (req, res) => {
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

    const updatedProperty = await Property.findByIdAndUpdate(
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

    if (!updatedProperty)
      return res.status(404).json({ error: "Property not found" });

    res
      .status(200)
      .json({
        message: "Property updated successfully",
        property: updatedProperty,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a property listing
const deleteProperty = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  console.log("Deleting property with ID:", id); // Add this line

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin)
      return res
        .status(403)
        .json({ error: "Only admin users can delete properties" });

    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty)
      return res.status(404).json({ error: "Property not found" });

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Top Property
const toggleTopProperty = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Only admin users can perform this action" });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    property.isTopProperty = !property.isTopProperty; // Toggle the isTopProperty field
    await property.save();

    res
      .status(200)
      .json({ message: "Top Property status updated successfully", property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Optimized: Get only top properties for sidebar (minimal fields)
const getTopProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isTopProperty: true })
      .select('title imageUrl createdAt seo.slug')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all properties for admin dashboard (no pagination)
const getAllPropertiesForAdmin = async (req, res) => {
  try {
    const { isTopProperty, category, location } = req.query;

    // Build query with all necessary fields for admin
    const query = Property.find()
      .select('title imageUrl createdAt seo.slug locations categories description summary isTopProperty')
      .sort({ createdAt: -1 })
      .lean();

    // Apply filters
    if (isTopProperty) query.where('isTopProperty').equals(true);
    if (category && category !== 'all') query.where('categories').equals(category);
    if (location) query.where('locations').equals(location);

    // Execute query without pagination
    const properties = await query;

    // Optimize response
    const response = {
      success: true,
      properties: properties.map(doc => ({
        _id: doc._id,
        title: doc.title,
        imageUrl: doc.imageUrl,
        createdAt: doc.createdAt,
        summary: doc.summary,
        seo: { slug: doc.seo.slug },
        locations: Array.isArray(doc.locations) ? doc.locations : [doc.locations].filter(Boolean),
        categories: Array.isArray(doc.categories) ? doc.categories : [doc.categories].filter(Boolean),
        description: doc.description,
        isTopProperty: doc.isTopProperty
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching properties for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties. Please try again later.'
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  toggleTopProperty,
  getPropertyBySlug,
  updatePropertySeo,
  getTopProperties,
  getAllPropertiesForAdmin,
};


