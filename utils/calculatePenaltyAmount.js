const calculatePenaltyAmount = (loanAmount, repaymentDate) => {
  const penaltyRate = 0.2 / 100;
  const currentDate = new Date();
  const daysOverdue = Math.max(Math.floor(timeDifference / (1000 * 60 * 60 * 24)), 0);
  return loanAmount * penaltyRate * daysOverdue;
}