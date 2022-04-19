const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes.js");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

/**
 * Set CROS policy
 */

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");

  next();
});

/*
 *this means it import all Rest apis connect with /api/places... like /api/places/:pid*
 */
app.use("/api/places", placesRoutes);
app.use("/api/user", userRoutes);

// app.use(placesRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Couldn't find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred! " });
});

/**
 * mongodb and node server
 */
mongoose
  .connect(
    "mongodb+srv://dhyey:dhyey@cluster0.1954n.mongodb.net/explorer?retryWrites=true&w=majority"
  )
  .then(
    app.listen(5000, () => {
      console.log("listening on 5000");
    })
  )
  .catch((err) => console.log(err));
