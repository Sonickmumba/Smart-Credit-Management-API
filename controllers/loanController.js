const pool = require("../models/database");

const processLoanApplication = async (req, res) => {
  const { borrowerId, loanAmount } = req.body;

  // Input validation
  if (!borrowerId || borrowerId === "" || !loanAmount || loanAmount <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or Missing input" });
  }

  try {

    // Begin transaction
    await pool.query('BEGIN');

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
    } else {
      creditLimitData = borrowerResults;
    }

    const remainingCreditLimit =
    creditLimitData.rows[0].credit_limit - creditLimitData.rows[0].used_amount;

    // Check for unpaid loans
    const unpaidLoans = await pool.query(
      "SELECT * FROM loan WHERE borrower_id = $1 AND repayment_date < NOW() AND payment_status = 'Not Paid'",
      [borrowerId]
    );

    if (unpaidLoans.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        Success: false,
        message:
          "There are existing unpaid loans with crossed repayment dates."
      });
    }

    if (loanAmount > remainingCreditLimit) {
      await pool.query('ROLLBACK');
      return res.status(400).json({
        Success: false,
        message: "Loan amount exceeds the remaining credit limit."
      });
    }

    const loanDate = new Date();
    const repaymentDate = new Date(loanDate);
    repaymentDate.setMonth(repaymentDate.getMonth() + 1);
    const paymentStatus = "Not Paid";
    const paidDate = null;

    const loanInsert = await pool.query(
      "INSERT INTO loan (borrower_id, loan_amount, loan_date, repayment_date, payment_status, paid_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [borrowerId, loanAmount, loanDate, repaymentDate, paymentStatus, paidDate]
    );

    await pool.query(
      "UPDATE credit_limit SET used_amount = used_amount + $1, remaining_amount = credit_limit - used_amount - $1 WHERE borrower_id = $2 RETURNING *",
      [loanAmount, borrowerId]
    );

    const loanId = loanInsert.rows[0].id;
    const penaltyAmount = 0.0;
    const totalAmount = penaltyAmount + loanAmount;
    const paidOnDate = null;

    await pool.query(
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

    // Commit transaction
    await pool.query('COMMIT');

    return res.status(200).json(loanInsert.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the loan application"
    });
  }
};

const viewAllLoans = async (req, res) => {

  try {
    const allLoans = await pool.query('SELECT * FROM loan');

    if (allLoans.rows.length === 0) {
      return res.status(204).json({
        success: false,
        message: 'No loans were found',
        data: []
      })
    }
    res.status(200).json({success: true, data: allLoans.rows});
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
};


const viewLoanById = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const loanById = await pool.query('SELECT * FROM loan WHERE id = $1', [id]);
    if (!loanById) {
      return res.status(404).json({
        success: false,
        message: 'Loan not foumd with provided ID'
      })
    }
    return res.status(200).json({ success: true, data: loanById.rows[0]})
  } catch (error) {
    
  }
};

exports.viewLoansByBorrowerId = () => {};
exports.viewCreditLimitByBorrowerId = () => {};
exports.getPaymentDetails = () => {};
exports.repayLoan = () => {};

module.exports = {
  processLoanApplication,
  viewAllLoans,
  viewLoanById,
};
