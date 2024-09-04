const pool = require("../models/database");

const processLoanApplication = async (req, res) => {
  const { borrowerId, loanAmount } = req.body;

  // Input validation
  if (!borrowerId || borrowerId === '' || !loanAmount || loanAmount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid or Missing input" });
  }

  // if (!borrowerId || borrowerId === "") {
  //   return res
  //     .status(400)
  //     .json({ Success: false, message: "Invalid or Missing input" });
  // }
  // if (loanAmount === undefined || loanAmount <= 0) {
  //   return res
  //     .status(400)
  //     .json({ Success: false, message: "Invalid or Missing input" });
  // }

  try {
    const borrowerResults = await pool.query(
      "SELECT * FROM credit_limit WHERE borrower_id = $1",
      [borrowerId]
    );

    let creditLimitData;

    if (borrowerResults.rows.length === 0) {
      const baseCreditLimit = 5000.0;
      creditLimitData = await pool.query(
        "INSERT INTO credit_limit (borrower_id, credit_limit, used_amount) VALUES ($1, $2, $3) RETURNING id",
        [borrowerId, baseCreditLimit, 0]
      );
      // res.status(201).json({ Success: true, message: "New borrower added" });
    } else {
      creditLimitData = borrowerResults;
    }

    



  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing the loan application",
    });
  }
};
exports.viewAllLoans = () => {};
exports.viewLoanById = () => {};
exports.viewLoansByBorrowerId = () => {};
exports.viewCreditLimitByBorrowerId = () => {};
exports.getPaymentDetails = () => {};
exports.repayLoan = () => {};

module.exports = {
  processLoanApplication,
};
