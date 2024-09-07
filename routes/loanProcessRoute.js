const express = require('express');

const loanController = require('../controllers/loanController');

const router = express.Router();

router.get('/', loanController.viewAllLoans);

router.get('/:loanId', loanController.viewLoanById);

router.get('/borrowers/:borrowerId', loanController.viewLoansByBorrowerId);
router.get('/creditlimit/:borrowerId', loanController.viewCreditLimitByBorrowerId);
router.get('/paymentdetails/:loanId', loanController.getPaymentDetails);
router.post('/process', loanController.processLoanApplication);
router.post('/paymentdetails/:loanId/repayment', loanController.repayLoan);



module.exports = router;
