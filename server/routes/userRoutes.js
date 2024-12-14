const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", (req, res) => {
  //create cookie and send response
  const options = {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie("token", "1234", options).status(200).json({ message: "ok" });
});

module.exports = router;
