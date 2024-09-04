const express = require('express');

const loanController = require('../controllers/loanController');

const router = express.Router();

router.post('/', loanController.viewAllLoans);

router.post('/process', loanController.processLoanApplication);


module.exports = router;