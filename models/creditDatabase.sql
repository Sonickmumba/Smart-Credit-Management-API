-- Table structure for table `credit_limit`
DROP TABLE IF EXISTS credit_limit;

CREATE TABLE credit_limit (
    id SERIAL PRIMARY KEY,
    borrower_id VARCHAR(255) NOT NULL,
    credit_limit DOUBLE PRECISION DEFAULT NULL,
    remaining_amount DOUBLE PRECISION DEFAULT NULL,
    used_amount DOUBLE PRECISION DEFAULT NULL
);

-- Table structure for table `loan`
DROP TABLE IF EXISTS loan;

CREATE TABLE loan (
    id SERIAL PRIMARY KEY,
    borrower_id VARCHAR(255) NOT NULL,
    loan_amount DOUBLE PRECISION DEFAULT NULL,
    loan_date DATE DEFAULT NULL,
    paid_date DATE DEFAULT NULL,
    payment_status VARCHAR(255) DEFAULT NULL,
    repayment_date DATE DEFAULT NULL,
    FOREIGN KEY (borrower_id) REFERENCES credit_limit (borrower_id) ON DELETE CASCADE
);

-- Table structure for table `payment_transaction`
DROP TABLE IF EXISTS payment_transaction;

CREATE TABLE payment_transaction (
    id SERIAL PRIMARY KEY,
    loan_amount DOUBLE PRECISION DEFAULT NULL,
    loan_id BIGINT DEFAULT NULL,
    paid_on_date DATE DEFAULT NULL,
    payment_status VARCHAR(255) DEFAULT NULL,
    penalty_amount DOUBLE PRECISION DEFAULT NULL,
    repayment_date DATE DEFAULT NULL,
    total_amount DOUBLE PRECISION DEFAULT NULL,
    FOREIGN KEY (loan_id) REFERENCES loan (id) ON DELETE CASCADE
);
