// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { createGzip } = require("zlib");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const whatsNewRoutes = require("./routes/whatsNewRoutes");
const builderReviewRoutes = require("./routes/builderReviewRoutes");
const connectDB = require("./config/db");
require("dotenv").config();
const compression = require("compression");
const upload = require("./config/multer");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const port = process.env.PORT || 8000;

// WWW Redirection Middleware
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.hostname === "indrealty.org"
  ) {
    return res.redirect(301, `https://www.${req.hostname}${req.originalUrl}`);
  }
  next();
});

// Allowed origins
const allowedOrigins = [
  "http://69.62.78.100:4173/",
  "http://69.62.78.100",
  "http://localhost:5173",
  "https://www.indrealty.org",
  "https://indrealty.org",
  "http://localhost:5173",
  "http://www.indrealty.org",
  "http://indrealty.org",
  "https://www.indrealty.org",
  "https://indrealty.org",
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed for origin: ${origin}`), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(compression());

// Add this near other middleware in index.js
app.use("/public", express.static(path.join(__dirname, "public")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/api", propertyRoutes);
app.use("/api", investmentRoutes);
app.use("/api", whatsNewRoutes);
app.use("/api", builderReviewRoutes);
app.use("/api", require("./routes/topPostsRoutes"));

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Construct the correct URL
  const imageUrl = `${req.protocol}://${req.get("host")}/public/uploads/${
    req.file.filename
  }`;

  res.json({
    success: true,
    imageUrl,
  });
});

// Simple root route
app.get("/", (req, res) => {
  res.send("Welcome to IndRealty API");
});

// SEO Routes
app.get("/sitemap.xml", async (req, res) => {
  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "gzip");

  try {
    const Property = require("./models/Property");
    const Investment = require("./models/Investment");
    const WhatsNew = require("./models/WhatsNew");
    const BuilderReview = require("./models/BuilderReview");

    const smStream = new SitemapStream({
      hostname: "https://www.indrealty.org",
      lastmodDateOnly: true,
      xmlns: {
        news: true,
        xhtml: true,
        image: true,
        video: true,
      },
    });

    const pipeline = smStream.pipe(createGzip());

    // Static pages
    smStream.write({ url: "/", changefreq: "daily", priority: 1.0 });
    smStream.write({ url: "/properties", changefreq: "weekly", priority: 0.9 });
    smStream.write({ url: "/investment", changefreq: "weekly", priority: 0.9 });
    smStream.write({ url: "/whats-new", changefreq: "weekly", priority: 0.9 });

    // Dynamic property pages
    const properties = await Property.find({}).select("seo.slug updatedAt");
    properties.forEach((property) => {
      smStream.write({
        url: `/properties/${property.seo.slug}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: property.updatedAt,
      });
    });

    // Dynamic investment pages
    const investment = await Investment.find({}).select("seo.slug updatedAt");
    investment.forEach((investment) => {
      smStream.write({
        url: `/investment/${investment.seo.slug}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: investment.updatedAt,
        img: investment.imageUrl ? [{ url: investment.imageUrl }] : [],
      });
    });

    // Dynamic WhatsNew pages
    const whatsNewList = await WhatsNew.find({}).select(
      "seo.slug updatedAt imageUrl"
    );
    whatsNewList.forEach((whatsNew) => {
      smStream.write({
        url: `/whats-new/${whatsNew.seo.slug}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: whatsNew.updatedAt,
        img: whatsNew.imageUrl ? [{ url: whatsNew.imageUrl }] : [],
      });
    });

    // Add this inside the sitemap.xml route after other dynamic pages
    const builderReviews = await BuilderReview.find({}).select(
      "seo.slug updatedAt"
    );
    builderReviews.forEach((review) => {
      smStream.write({
        url: `/builder-review/${review.seo.slug}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: review.updatedAt,
      });
    });

    smStream.end();
    pipeline.pipe(res).on("error", (e) => {
      throw e;
    });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

app.get("/news-sitemap.xml", async (req, res) => {
  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "gzip");

  try {
    const Property = require("./models/Property");
    const Investment = require("./models/Investment");
    const WhatsNew = require("./models/WhatsNew");
    const BuilderReview = require("./models/BuilderReview");

    const smStream = new SitemapStream({
      hostname: "https://www.indrealty.org",
      // lastmodDateOnly: true,
      xmlns: {
        news: true,
        xhtml: true,
        image: true,
        // video: true
      },
    });

    const pipeline = smStream.pipe(createGzip());

    // Get news articles (limit to 1000 as per Google's limit)
    const newsItems = await WhatsNew.find({ isNews: true })
      .sort({ "newsMeta.publicationDate": -1 })
      .limit(1000)
      .select(
        "seo.slug title newsMeta.publicationDate newsMeta.genres seo.keywords imageUrl updatedAt"
      );

    // Add news items to sitemap
    newsItems.forEach((item) => {
      smStream.write({
        url: `/whats-new/${item.seo.slug}`,
        lastmod: item.updatedAt,
        news: {
          publication: {
            name: "IndRealty",
            language: "en",
          },
          publication_date: item.newsMeta.publicationDate.toISOString(),
          title: item.title,
          genres: item.newsMeta.genres?.join(", ") || "RealEstate",
          keywords: item.seo.keywords?.join(", ") || "",
        },
        img: item.imageUrl ? [{ url: item.imageUrl }] : [],
      });
    });

    // Get news-worthy properties if any
    const newsProperties = await Property.find({ isNews: true })
      .sort({ "newsMeta.publicationDate": -1 })
      .limit(1000 - newsItems.length)
      .select(
        "seo.slug title newsMeta.publicationDate newsMeta.genres seo.keywords imageUrl updatedAt"
      );

    newsProperties.forEach((item) => {
      smStream.write({
        url: `/properties/${item.seo.slug}`,
        lastmod: item.updatedAt,
        news: {
          publication: {
            name: "IndRealty",
            language: "en",
          },
          publication_date: item.newsMeta.publicationDate.toISOString(),
          title: item.title,
          genres: item.newsMeta.genres?.join(", ") || "RealEstate",
          keywords: item.seo.keywords?.join(", ") || "",
        },
        img: item.imageUrl ? [{ url: item.imageUrl }] : [],
      });
    });

    //  Get news-worthy investments if any
    const newsInvestments = await Investment.find({ isNews: true })
      .sort({ "newsMeta.publicationDate": -1 })
      .limit(1000 - newsItems.length - newsProperties.length)
      .select(
        "seo.slug title newsMeta.publicationDate newsMeta.genres seo.keywords imageUrl updatedAt"
      );

    newsInvestments.forEach((item) => {
      smStream.write({
        url: `/investment/${item.seo.slug}`,
        lastmod: item.updatedAt,
        news: {
          publication: {
            name: "IndRealty",
            language: "en",
          },
          publication_date: item.newsMeta.publicationDate.toISOString(),
          title: item.title,
          genres: item.newsMeta.genres?.join(", ") || "Investment",
          keywords: item.seo.keywords?.join(", ") || "",
          stock_tickers: item.newsMeta.stockTickers?.join(" ") || "",
        },
        img: item.imageUrl ? [{ url: item.imageUrl }] : [],
      });
    });

    // Get news-worthy what's new if any
    const newsWhatsNew = await WhatsNew.find({ isNews: true })
      .sort({ "newsMeta.publicationDate": -1 })
      .limit(
        1000 - newsItems.length - newsProperties.length - newsInvestments.length
      )
      .select(
        "seo.slug title newsMeta.publicationDate newsMeta.genres seo.keywords imageUrl updatedAt"
      );

    newsWhatsNew.forEach((item) => {
      smStream.write({
        url: `/whats-new/${item.seo.slug}`,
        lastmod: item.updatedAt,
        news: {
          publication: {
            name: "IndRealty",
            language: "en",
          },
          publication_date: item.newsMeta.publicationDate.toISOString(),
          title: item.title,
          genres: item.newsMeta.genres?.join(", ") || "RealEstate",
          keywords: item.seo.keywords?.join(", ") || "",
        },
        img: item.imageUrl ? [{ url: item.imageUrl }] : [],
      });
    });

    // Get news-worthy builder reviews if any
    const newsBuilderReviews = await BuilderReview.find({ isNews: true })
      .sort({ "newsMeta.publicationDate": -1 })
      .limit(
        1000 - newsItems.length - newsProperties.length - newsInvestments.length
      )
      .select(
        "seo.slug title newsMeta.publicationDate newsMeta.genres seo.keywords imageUrl updatedAt"
      );

    newsBuilderReviews.forEach((item) => {
      smStream.write({
        url: `/builder-review/${item.seo.slug}`,
        lastmod: item.updatedAt,
        news: {
          publication: {
            name: "IndRealty",
            language: "en",
          },
          publication_date: item.newsMeta.publicationDate.toISOString(),
          title: item.title,
          genres: item.newsMeta.genres?.join(", ") || "RealEstate",
          keywords: item.seo.keywords?.join(", ") || "",
        },
        img: item.imageUrl ? [{ url: item.imageUrl }] : [],
      });
    });

    smStream.end();

    // Cache the sitemap for 1 hour
    let sitemap;
    try {
      sitemap = await streamToPromise(pipeline);
    } catch (err) {
      throw err;
    }

    res.send(sitemap);
  } catch (e) {
    console.error("Failed to generate news sitemap:", e);
    res.status(500).end();
  }
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: https://www.indrealty.org/sitemap.xml
Sitemap: https://www.indrealty.org/news-sitemap.xml`);
});

// ⭐ Serve Frontend (Vite Build) ⭐
if (process.env.NODE_ENV === "production") {
  const root = path.join(__dirname, "client", "dist");
  app.use(express.static(root));

  app.get("*", (req, res) => {
    res.sendFile("index.html", { root });
  });
}

// Serve static files and handle SPA routing in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));

  app.get("*", (req, res) => {
    const indexFile = path.join(__dirname, "client/dist", "index.html");
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.status(404).send("Page not found");
    }
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


