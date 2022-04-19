const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");
const getCoordsForAddress = require("../util/location");

/*
 * getPlaceById method
 */

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Something went wrong", 500);
    return next(err);
  }

  if (!place) {
    const err = new HttpError("Couldn't find a place for provided id", 404);
    return next(err);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

/*
 * getPlaceByUserId method
 */

const getPlacesByUserID = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  console.log("hello");
  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Fetching place failed", 500);
    return next(err);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Couldn't find a place for the provided user id", 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

/*
 * CREATE PLACE
 */

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    next(new HttpError("Invalid inouts", 422));
  }

  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createPlace = new Place({
    title,
    description,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
    address,
    location: coordinates,
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError("Creating place failed", 500);
    return next(err);
  }

  if (!user) {
    const err = new HttpError("Could not find user for provided id", 404);
    return next(err);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createPlace.save({ session: sess });
    user.places.push(createPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    const err = new HttpError("Creating place failed", 500);
    return next(err);
  }

  res.status(201).json(createPlace);
};

/*
 * UPDATE PLACE
 */

const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Something went wrong", 500);
    return next(err);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err = new HttpError("Something went wrong", 500);
    return next(err);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

/*
 * DELETE PLACE
 */

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    // populate() give full object instead of just objID from different collection so that we can edit that
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    const err = new HttpError("Something went wrong while deleting place", 500);
    return next(err);
  }

  if (!place) {
    const err = new HttpError("Could not find place for this id", 404);
    return next(err);
  }

  try {
    console.log("done till here");
    const sess = await mongoose.startSession();
    sess.startTransaction();
    console.log("done till here");
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    console.log("done till here");
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    const err = new HttpError("Something went wrong while deleting place", 500);
    return next(err);
  }

  res.status(200).json({ message: "Delete complete" });
};

exports.createPlace = createPlace;
exports.getPlaceByID = getPlaceById;
exports.getPlacesByUserID = getPlacesByUserID;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
