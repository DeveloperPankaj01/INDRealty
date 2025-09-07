// authController.js
const { auth } = require('../config/firebaseConfig');
const {signInWithEmailAndPassword } = require('firebase/auth');
const User = require('../models/User');

const register = async (req, res) => {
  const { uid, email, username, isAdmin = false } = req.body;

  try {
    // Check if the user already exists in MongoDB
    const existingUser = await User.findOne({ $or: [{ uid }, { email }] });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Save user to MongoDB
    const newUser = new User({
      uid,
      email,
      username,
      isAdmin,
    });

    await newUser.save();
    console.log("User saved to MongoDB:", newUser);

    res.status(200).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login with email/password
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    res.status(200).json({ message: 'User logged in successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login with Google
const loginWithGoogle = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, providerId, username } = req.body; // Add username

    // Check if the user already exists in MongoDB
    let user = await User.findOne({ uid });

    if (!user) {
      // If the user doesn't exist, create a new user
      user = new User({
        uid,
        email,
        displayName,
        photoURL,
        providerId,
        username, // Save username
      });
      await user.save();
    }

    res.status(200).json({ message: 'User logged in with Google', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login with Facebook
const loginWithFacebook = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, providerId, username } = req.body; // Add username

    // Check if the user already exists in MongoDB
    let user = await User.findOne({ uid });

    if (!user) {
      // If the user doesn't exist, create a new user
      user = new User({
        uid,
        email,
        displayName,
        photoURL,
        providerId,
        username, // Save username
      });
      await user.save();
    }

    res.status(200).json({ message: 'User logged in with Facebook', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user by uid
const getUserByUid = async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, loginWithGoogle, loginWithFacebook, getUserByUid };


