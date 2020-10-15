const express = require('express');
const router = express.Router();
const routesController = require('../controllers/RoutesController');

router.route('/')
    .get(routesController.index);

module.exports = router;