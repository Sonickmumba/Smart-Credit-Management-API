const express = require('express');
require("dotenv").config();

const bodyParser = require('body-parser');

const loanProcessRoute = require('./routes/loanProcessRoute');


const app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.json({
    info: "Node.js, Express, and Postgres API Template by Sonick",
  });
});

app.use('/loan', loanProcessRoute);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
})