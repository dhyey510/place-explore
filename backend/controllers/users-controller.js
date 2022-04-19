const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

/*
 * GET ALL USERS
 */

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password"); //extract all users without password attribute
  } catch (error) {
    const err = new HttpError("Fetching users failed", 500);
    return next(err);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

/*
 * SIGN UP
 */

const signup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Singup failed, Please try again later", 500);
    return next(err);
  }

  if (existingUser) {
    const err = new HttpError("User already exist, please login instead", 422);
    return next(err);
  }

  const createUser = new User({
    name,
    email,
    image: req.file.path,
    password,
    places: [],
  });

  try {
    await createUser.save();
  } catch (error) {
    const err = new HttpError("Creating user failed", 500);
    return next(err);
  }

  res.status(201).json({ user: createUser.toObject({ getters: true }) });
};

/*
 * LOGIN
 */

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Login in failed, Please try again later", 500);
    return next(err);
  }

  if (!existingUser || existingUser.password !== password) {
    const err = new HttpError("Invalid credentials, could not log you in", 401);
    return next(err);
  }

  res.json({
    message: "Logged in!",
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
