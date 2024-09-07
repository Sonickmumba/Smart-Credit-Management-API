const calculatePenaltyAmount = (loanAmount, repaymentDate) => {
  const penaltyRate = 0.2 / 100;
  const currentDate = new Date();

  // Convert the repaymentDate string to a Date object
  const repaymentDateObj = new Date(repaymentDate);

  // Calculate the difference in time and convert to days
  const timeDifference = currentDate - repaymentDateObj;
  const daysOverdue = Math.max(Math.floor(timeDifference / (1000 * 60 * 60 * 24)), 0); // Ensure daysOve

  return loanAmount * penaltyRate * daysOverdue;
}




module.exports = calculatePenaltyAmount;