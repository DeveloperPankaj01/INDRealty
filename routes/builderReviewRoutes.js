const express = require("express");
const router = express.Router();
const builderReviewController = require("../controllers/builderReviewController");
const { isAdmin } = require("../middleware/authMiddleware");
const upload = require('../config/multer');

// Builder review routes
router.get('/builderReview/top', builderReviewController.getTopBuilderReviews);
router.post('/builderReview', upload.single('image'), builderReviewController.createBuilderReview);
router.get("/builderReview", builderReviewController.getAllBuilderReviews);
router.get("/builderReview/:id", builderReviewController.getBuilderReviewById);
router.get("/builderReview/slug/:slug", builderReviewController.getBuilderReviewBySlug);
router.put("/builderReview/:id", isAdmin, builderReviewController.updateBuilderReview);
router.put("/builderReview/:id/seo", isAdmin, builderReviewController.updateBuilderReviewSeo);
router.delete("/builderReview/:id", isAdmin, builderReviewController.deleteBuilderReview);
router.put("/builderReview/:id/toggle-top", isAdmin, builderReviewController.toggleTopBuilderReview);

module.exports = router;

