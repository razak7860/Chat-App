const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

exports.loginUser = async (req, res) => {
  //console.log(req.body);
  console.log("cookie is:");
  console.log(req.cookies);
  const { email, password } = req.body;
  console.log({ email, password });
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    //create cookie and send response
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res
      .cookie("token", token, options)
      .status(200)
      .json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// Register New User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  if (user) {
    //create cookie and send response
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    const token = generateToken(user.id);
    res.cookie("token", token, options).status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
  } else {
    res.status(400).json({ message: "Failed to register user" });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
