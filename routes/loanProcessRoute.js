const express = require('express');

const loanController = require('../controllers/loanController');

const router = express.Router();

router.get('/', loanController.viewAllLoans);
router.get('/:loanId', loanController.viewLoanById);
router.post('/process', loanController.processLoanApplication);



module.exports = router;