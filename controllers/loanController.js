const pool = require("../db");

exports.processLoanApplication =  (req, res) => {
    const { borrowedId, loanAmount } = req.body;
    if(!borrowedId || borrowedId === '') {
        res.status(400).json({Success: false, message: 'Invalid or Missing input'});
    }
    if (loanAmount === undefined || loanAmount <= 0 ){
        res.status(400).json({Success: false, message: 'Invalid or Missing input'});
    }
    try {
        const row = pool.query('SELECT * FROM credit_limit WHERE borrowed_id = ?', [borrowedId]);

        if (row.length === 0) {
            const baseCreditLimit = 5000.0;
            pool.query('INSERT INTO credit_limit (borrowed_id, credit_limit) VALUES ($1, $2) RETURNING id', [borrowedId, baseCreditLimit]);
            res.status(400).json({ Success: true, message: 'New borrower added' })
        } else {
            const results = pool.query('SELECT * FROM credit_limit WHERE borrowed_id = ?', [borrowedId]);
            const remainingCreditLimit = results[0].credit_limit - loanAmount;
            if (loanAmount < results[0].credit_limit)
            res.status(200).json({ Success: true, credit_limit: results[0].credit_limit });
        }
    } catch (error) {
        
    }

    
};
exports.viewAllLoans = () => {};
exports.viewLoanById = () => {};
exports.viewLoansByBorrowerId = () => {};
exports.viewCreditLimitByBorrowerId = () => {};
exports.getPaymentDetails = () => {};
exports.repayLoan = () => {};
