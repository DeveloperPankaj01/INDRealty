const Property = require("../models/Property");
const Investment = require("../models/Investment");
const WhatsNew = require("../models/WhatsNew");

const getTopPosts = async (req, res) => {
  try {
    // Fetch top 3 from each, select only needed fields
    const [properties, investments, whatsNew] = await Promise.all([
      Property.find()
        .select('title imageUrl createdAt seo.slug author locations summary')
        .lean(),
      Investment.find()
        .select('title imageUrl createdAt seo.slug author locations summary')
        .lean(),
      WhatsNew.find()
        .select('title imageUrl createdAt seo.slug author locations summary')
        .lean(),
    ]);

    // Add type to each
    const allPosts = [
      ...properties.map(item => ({ ...item, type: 'property' })),
      ...investments.map(item => ({ ...item, type: 'investment' })),
      ...whatsNew.map(item => ({ ...item, type: 'whatsNew' })),
    ];

    // Sort by createdAt and take top 3
    const topPosts = allPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);

    res.status(200).json({ topPosts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTopPosts };
