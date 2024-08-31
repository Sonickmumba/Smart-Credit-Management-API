const pool = require("../models/database");

const processLoanApplication = async (req, res) => {
  const { borrowerId, loanAmount } = req.body;

  if (!borrowerId || borrowerId === "") {
    return res
      .status(400)
      .json({ Success: false, message: "Invalid or Missing input" });
  }
  if (loanAmount === undefined || loanAmount <= 0) {
    return res
      .status(400)
      .json({ Success: false, message: "Invalid or Missing input" });
  }

  try {
    const results = await pool.query(
      "SELECT * FROM credit_limit WHERE borrower_id = $1",
      [borrowerId]
    );

    if (results.rows.length === 0) {
      const baseCreditLimit = 5000.0;
      await pool.query(
        "INSERT INTO credit_limit (borrower_id, credit_limit, used_amount) VALUES ($1, $2, $3) RETURNING id",
        [borrowerId, baseCreditLimit, 0]
      );
      res.status(201).json({ Success: true, message: "New borrower added" });
    } else {
      const remainingCreditLimit =
        results.rows[0].credit_limit - results.rows[0].used_amount;

      const unpaidLoans = await pool.query(
        "SELECT * FROM loan WHERE borrower_id = $1 AND repayment_date < NOW() AND payment_status = 'unpaid'",
        [borrowerId]
      );

      if (unpaidLoans.rows.length > 0) {
        return res.status(400).json({
          message:
            "There are existing unpaid loans with crossed repayment dates.",
          Success: false,
        });
      }

      if (loanAmount > remainingCreditLimit) {
        return res.status(400).json({
          message: "Loan amount exceeds the remaining credit limit.",
          Success: false,
        });
      }

      const loanDate = new Date();
      const repaymentDate = new Date(loanDate);
      repaymentDate.setMonth(repaymentDate.getMonth() + 1); // Set repayment date to next month
      const paymentStatus = "Not paid";
      const paidDate = null;

      const loanInsert = await pool.query(
        "INSERT INTO loan (borrower_id, loan_amount, loan_date, paid_date, payment_status, repayment_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          borrowerId,
          loanAmount,
          loanDate,
          paidDate,
          paymentStatus,
          repaymentDate,
        ]
      );
      console.log(loanInsert.rows);
      await pool.query(
        "UPDATE credit_limit SET used_amount = used_amount + $1, remaining_amount = credit_limit - used_amount - $1 WHERE borrower_id = $2 RETURNING *",
        [loanAmount, borrowerId]
      );

      const loanId = loanInsert.rows[0].id;
      const penaltyAmount = 0.0;
      const totalAmount = penaltyAmount + loanAmount;
      const paidOnDate = null;

      const paymentTransactionInsert = await pool.query(
        "INSERT INTO payment_transaction (loan_id, loan_amount, penalty_amount, total_amount, repayment_date, paid_on_date, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          loanId,
          loanAmount,
          penaltyAmount,
          totalAmount,
          repaymentDate,
          paidOnDate,
          paymentStatus,
        ]
      );

      return res.status(200).json(paymentTransactionInsert.rows[0]);
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
