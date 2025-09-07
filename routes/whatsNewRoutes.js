// routes/whatsNewRoutes.js
const express = require("express");
const router = express.Router();
const whatsNewController = require("../controllers/whatsNewController");
const { isAdmin } = require("../middleware/authMiddleware");
const upload = require('../config/multer');

// Optimized: Get only top whats new (must be before :id route)
router.get('/whatsNew/top', whatsNewController.getTopWhatsNew);

// Whats new routes
// router.post("/whatsNew", whatsNewController.createWhatsNew);
router.post('/whatsNew', upload.single('image'), whatsNewController.createWhatsNew);
router.get("/whatsNew", whatsNewController.getAllWhatsNew);
router.get("/whatsNew/:id", whatsNewController.getWhatsNewById);
router.get("/whatsNew/slug/:slug", whatsNewController.getWhatsNewBySlug);
router.put("/whatsNew/:id", isAdmin, whatsNewController.updateWhatsNew);
router.put("/whatsNew/:id/seo", isAdmin, whatsNewController.updateWhatsNewSeo);
router.delete("/whatsNew/:id", isAdmin, whatsNewController.deleteWhatsNew);
router.put("/whatsNew/:id/toggle-top", isAdmin, whatsNewController.toggleTopWhatsNew);

module.exports = router;
