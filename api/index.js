require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');

app.use(cors())
const port = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URL;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(express.static("public"));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send(`
        <html>
            <head>
                <title>Home</title>
            </head>
            <body>
                <h1>Welcome</h1>
            </body>
        </html>
      `);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));

app.listen(port, () => console.log(`Server ready on port ${port}.`));

module.exports = app;
