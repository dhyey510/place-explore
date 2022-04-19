const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const placeController = require("../controllers/places-controllers");

/*
 *Route order matter
 */

router.get("/:pid", placeController.getPlaceByID);

router.get("/user/:uid", placeController.getPlacesByUserID);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength(5),
    check("address").not().isEmpty(),
  ],
  placeController.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeController.updatePlace
);

router.delete("/:pid", placeController.deletePlace);

module.exports = router;
