const express = require('express');
const router = express.Router();
const { getTopPosts } = require('../controllers/topPostsController');

router.get('/top-posts', getTopPosts);

module.exports = router;
