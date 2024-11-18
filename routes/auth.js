const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const accessTokenSecret = process.env.JWT_SECRET;
const upload = require("./../middlewares/uploadMiddleware");
const fs = require("fs");
//const path = require("path");
const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sgMail = require("@sendgrid/mail"); // Import SendGrid mail library

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Configure API key

var mainURL = "http://localhost:3000";
var sendToAI = [];

// Utility function to send emails using SendGrid
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_SENDER_EMAIL, // Verified sender email
      name: "AlertMe 9Ja Team", // Optional sender name
    },
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(
      `Failed to send email: ${error.response?.body?.errors || error.message}`
    );
  }
};

router.get("/", (req, res) => {
  res.render("index");
});

/* Sign Up */
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", upload.none(), async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    gender,
    dob,
    city,
    country,
    aboutMe,
  } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      return res.json({
        status: "error",
        message: "Email or username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      gender,
      profileImage: "",
      coverPhoto: "",
      dob,
      city,
      country,
      aboutMe,
      friends: [],
      pages: [],
      notifications: [],
      groups: [],
      posts: [],
    });

    const subject = "Welcome to AlertMe 9Ja!";
    const text = `Hello ${name},\n\nWelcome to AlertMe 9Ja! We're excited to have you on board.\n\nBest Regards,\nAlertMe 9Ja Team`;
    const html = `<p>Hello <strong>${name}</strong>,</p>
                      <p>Welcome to <strong>AlertMe 9Ja</strong>! We're excited to have you on board.</p>
                      <p>Best Regards,<br>AlertMe 9Ja Team</p>`;
    await sendEmail(email, subject, text, html);

    await newUser.save();
    res.json({
      status: "success",
      message: "Signed up successfully, you can log in now.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

/* Login */

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", upload.none(), async (req, res) => {
  const { email, password, location } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({
        status: "error",
        message: "Email does not exist",
      });
    }

    const isVerify = await bcrypt.compare(password, user.password);

    if (isVerify) {
      const accessToken = jwt.sign(
        { email: email, id: user._id },
        accessTokenSecret
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true, // More secure as it prevents client-side access
        secure: true, // Ensures the cookie is only sent over HTTPS (good for production)
        maxAge: 24 * 60 * 60 * 1000, // Expire after 1 day
      });

      // Update the user with the new access token
      user.accessToken = accessToken;
      user.location = location;
      await user.save(); // Save the updated user
      return res.json({
        status: "success",
        message: "Login successfully",
        accessToken: accessToken,
        profileImage: user.profileImage,
        location: location,
      });
    } else {
      return res.json({
        status: "error",
        message: "Incorrect password",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

/*
uddateProfile
*/
router.get("/updateProfile", async (req, res) => {
  const accessToken = req.cookies.accessToken;
  try {
    const user = await User.findOne({ accessToken });

    if (user) {
      // Check if profileImage and coverPhoto are defined and then convert to base64
      const profileImage =
        user.profileImage && user.profileImage.data
          ? `data:${
              user.profileImage.contentType
            };base64,${user.profileImage.data.toString("base64")}`
          : null;
      const coverPhoto =
        user.coverPhoto && user.coverPhoto.data
          ? `data:${
              user.coverPhoto.contentType
            };base64,${user.coverPhoto.data.toString("base64")}`
          : null;

      res.render("updateProfile", {
        profileImage: profileImage,
        coverPhoto: coverPhoto,
        name: user.name,
        username: user.username,
        email: user.email,
        dob: user.dob,
        city: user.city,
        country: user.country,
        aboutMe: user.aboutMe,
        isBot: user.isBot,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error in /updateProfile route:", error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

/* 
POSt
Update profile

*/

router.post("/updateProfile", upload.none(), async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const { name, dob, city, country, aboutMe } = req.body;

  try {
    const user = await User.findOne({ accessToken });

    if (!user) {
      return res.json({
        status: "error",
        message: "User has been logged out. Please login again",
      });
    }

    // Validate and ensure dob is in DD/MM/YYYY format
    let formattedDob = null;
    if (dob) {
      const momentDob = moment(dob, "DD/MM/YYYY", true);
      if (!momentDob.isValid()) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date format. Use DD/MM/YYYY.",
        });
      }
      formattedDob = momentDob.format("DD/MM/YYYY");
    }

    // Update fields
    user.set({
      name,
      dob: formattedDob, // Save formatted DOB
      city,
      country,
      aboutMe,
    });

    await user.save();

    res.json({
      status: "success",
      message: "Profile has been updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
});

router.post("/getUser", async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) {
    return res.json({
      status: "error",
      message: "User has been logged out. Please login again",
    });
  }

  try {
    // Verify the JWT
    const decodedToken = jwt.verify(accessToken, accessTokenSecret);

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.json({
        status: "error",
        message: "User has been logged out. Please login again",
      });
    }

    res.json({
      status: "success",
      message: "Record has been fetched.",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

// Route to upload cover photo
router.post(
  "/uploadCoverPhoto",
  upload.single("coverPhoto"),
  async (req, res) => {
    const accessToken = req.body.accessToken; // Access token should be in req.body

    try {
      const user = await User.findOne({ accessToken });

      if (!user) {
        return res.json({
          status: "error",
          message: "User has been logged out. Please login again.",
        });
      }

      user.coverPhoto = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      await user.save();

      const base64Image = `data:${
        user.coverPhoto.contentType
      };base64,${user.coverPhoto.data.toString("base64")}`;

      // Respond with the new cover photo URL
      res.json({
        status: "success",
        message: "Cover photo has been updated",
        data: base64Image,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "error", message: "Internal server error." });
    }
  }
);

//upload profile image

router.post(
  "/uploadProfileImage",
  upload.single("profileImage"),
  async (req, res) => {
    const accessToken = req.body.accessToken;

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "error", message: "No file uploaded" });
    }

    try {
      const user = await User.findOne({ accessToken });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found or logged out. Please log in again.",
        });
      }

      user.profileImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      await user.save();

      const base64Image = `data:${
        user.profileImage.contentType
      };base64,${user.profileImage.data.toString("base64")}`;

      res.json({
        status: "success",
        message: "Profile image updated successfully",
        data: base64Image,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "error", message: "Internal server error." });
    }
  }
);

router.get("/posts", async (req, res) => {
  const accessToken = req.cookies.accessToken;

  try {
    const user = await User.findOne({ accessToken });
    if (!user) {
      return res.redirect("/login");
    }

    const profileImage =
      user.profileImage && user.profileImage.data
        ? `data:${
            user.profileImage.contentType
          };base64,${user.profileImage.data.toString("base64")}`
        : null;

    const coverPhoto =
      user.coverPhoto && user.coverPhoto.data
        ? `data:${
            user.coverPhoto.contentType
          };base64,${user.coverPhoto.data.toString("base64")}`
        : null;

    res.render("post", {
      profileImage: profileImage,
      coverPhoto: coverPhoto,
      user,
    });
  } catch (error) {
    console.error("Error in / route:", error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

router.post(
  "/addPost",
  upload.fields([{ name: "image" }, { name: "video" }]),
  async (req, res) => {
    const { accessToken, caption, type } = req.body;
    const createdAt = new Date().getTime();

    try {
      const user = await User.findOne({ accessToken });
      if (!user) {
        return res
          .status(401)
          .json({
            status: "error",
            message: "User not found or logged out. Please log in again.",
          });
      }

      let image = null;
      let video = null;

      if (req.files["image"]) {
        const imgFile = req.files["image"][0];
        image = {
          data: imgFile.buffer.toString("base64"),
          contentType: imgFile.mimetype,
        };
      }

      if (req.files["video"]) {
        const vidFile = req.files["video"][0];
        video = {
          data: vidFile.buffer.toString("base64"),
          contentType: vidFile.mimetype,
        };
      }

      const newPost = {
        caption,
        type,
        createdAt,
        image,
        video,
        likers: [],
        comments: [],
        shares: [],
        user: {
          _id: user._id,
          name: user.name,
          profileImage: user.profileImage,
        },
      };

      user.posts.push(newPost);
      sendToAI = [newPost.caption];
      // Save the user document with the new post
      await user.save();

      res.json({
        status: "success",
        message: "Post added successfully!",
        post: newPost,
      });
    } catch (error) {
      console.error("Error in /addPost route:", error);
      res
        .status(500)
        .json({ status: "error", message: "Internal server error." });
    }
  }
);

/*
POST
 getNewsfeed
*/
router.post("/getNewsfeed", async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"

  try {
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "No access token provided" });
    }

    // Validate the token (if using JWT, decode it here or find user using token)
    const user = await User.findOne({ accessToken: token });
    if (!user) {
      return res
        .status(401)
        .json({
          status: "error",
          message: "User not found or logged out. Please log in again.",
        });
    }

    // Retrieve the user's posts sorted by creation date
    const posts = user.posts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5); // Limit to 5 latest posts

    res.json({
      status: "success",
      message: "Record has been fetched",
      data: posts,
    });
  } catch (error) {
    console.error("Error in /getNewsfeed route:", error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

router.post("/toggleLikePost", async (req, res) => {
  const id = req.headers["post-id"];
  const accessToken = req.headers.authorization && req.headers.authorization.split(" ")[1];

  try {
    // Find the user by access token
    const user = await User.findOne({ accessToken });
    if (!user) {
      return res
        .status(401)
        .json({
          status: "error",
          message: "User not found or logged out. Please log in again.",
        });
    }

    // Locate the post in the user's own posts array by `id`
    const post = user.posts.find((p) => p._id === id);
    if (!post) {
      return res
        .status(404)
        .json({ status: "error", message: "Post not found." });
    }

    // Check if the user has already liked the post
    const hasLiked = post.likers.some(
      (likerId) => likerId.toString() === user._id.toString()
    );

    if (hasLiked) {
      // If the user has liked the post, remove their like
      post.likers = post.likers.filter(
        (likerId) => likerId.toString() !== user._id.toString()
      );
      await user.save();
      return res.json({
        status: "unliked",
        message: "Post unliked successfully.",
      });
    } else {
      // If the user hasn't liked the post, add their like
      post.likers.push(user._id);

      // Create a new notification for the like
      const notification = {
        type: "photo-liked",
        content: `${user.name} has liked your post.`,
        profileImage: user.profileImage, // Assuming `profileImage` is a field on the User model
        createdAt: new Date(),
      };
      user.notifications.push(notification);

      await user.save();
      return res.json({
        status: "success",
        message: "Post liked successfully.",
      });
    }
  } catch (error) {
    console.error("Error in /toggleLikePost route:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

//nNb
router.get("/logout", function (req, res) {
  res.redirect("/login");
});

/* AI routes */

router.get("/aiBotProfile", async (req, res) => {
  const accessToken = req.cookies.accessToken; // Assuming you're using cookies to store access token

  if (!accessToken) {
    // If no access token, redirect to login page
    return res.redirect("/login");
  }

  try {
    // Find the AI Bot user (using `isBot: true` to get the AI Bot's profile)
    const aiBot = await User.findOne({ isBot: true });

    if (aiBot) {
      // Render the updateProfile view with AI Bot data
      res.render("updateAIProfile", {
        name: aiBot.name,
        username: aiBot.username,
        email: aiBot.email,
        dob: aiBot.dob,
        city: aiBot.city,
        country: aiBot.country,
        aboutMe: aiBot.aboutMe,
        isBot: true, // Indicating this is a bot profile
      });
    } else {
      // If no AI Bot profile is found
      res
        .status(404)
        .json({ status: "error", message: "AI Bot profile not found." });
    }
  } catch (error) {
    console.error("Error in /aiBotProfile route:", error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

router.post("/generate-post", async (req, res) => {
  try {
    // Fetch Angela's user record
    const angela = await User.findOne({ name: "Angela" });
    if (!angela) {
      return res.status(404).json({ error: "Angela (AI Bot) not found." });
    }

    let arr = ["crimes", "flooding", "natural and artificial disaster"];
    let randomItem = arr[Math.floor(Math.random() * arr.length)];

    const context = `In less than 100 words write post to teach the public on ${randomItem}, let it be easy to understand End your writeup with a quote on safety`;

    const gemini_api_key = process.env.API_KEY;
    const googleAI = new GoogleGenerativeAI(gemini_api_key);
    const geminiConfig = {
      temperature: 0.9,
      topP: 1,
      topK: 1,
      maxOutputTokens: 4096,
    };

    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-pro",
      geminiConfig,
    });

    const prompt = `${context}`;
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const generatedPost = response.text();

    // Push the post into Angela's `posts` array
    angela.posts.push({
      content: generatedPost,
      createdAt: new Date(),
    });

    // Save the updated user record
    await angela.save();

    res.status(201).json({
      message: "Post generated and saved successfully to Angela's profile!",
      //post: generatedPost,
    });
  } catch (error) {
    console.error("Error generating or saving the post:", error);
    res.status(500).json({
      error: "An error occurred while generating the post.",
    });
  }
});

// Render Angela's profile with her posts
router.post("/angela-posts", async (req, res) => {
  try {
    const angela = await User.findOne({ name: "Angela" });

    if (!angela) {
      return res.status(404).send("Angela (AI Bot) not found.");
    }
    const posts = angela.posts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5); // Limit to 5 latest posts

    res.json({
      status: "success",
      message: "Record has been fetched",
      data: posts,
    });
  } catch (error) {
    console.error("Error rendering Angela's posts:", error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/angela-posts", async (req, res) => {
  try {
    const angela = await User.findOne({ name: "Angela" });

    if (!angela) {
      return res.status(404).send("Angela (AI Bot) not found.");
    }

    res.render("aiPosts", {
      data: angela,
    });
  } catch (error) {
    console.error("Error in / route:", error);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
});

/*
Notification system
*/


router.post("/send-notification", async (req, res) => {
  const emails = [];
  //The logged in user
  //const accessToken = req.cookies.accessToken;
  const accessToken =  req.headers.authorization && req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"

  const user = await User.findOne({ accessToken });

  if (!user) {
    console.log("user not found")
    return res
      .status(401)
      .json({
        status: "error",
        message: "User not found or logged out. Please log in again.",
      });
  }

  const location = user.location;
  const users = await User.find({ location });
  
  if (users.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "No users found in this location.",
    });
  }

  users.forEach((user) => {
    emails.push(user.email);
  });
  //console.log(emails)

  try {
    let post = sendToAI;

    let instruction = `In less than 50 words write a notification to the people in that location letting 
                            them know of the disaster type and educate them on the write course of action to take`;
    let safety = `Don't teach just Write one safety quote or tip`;

    const context = `Understand post "${post}",If its a disaster post: ${instruction},
                        if its not a disaster post: ${safety}`;

    const gemini_api_key = process.env.API_KEY;
    const googleAI = new GoogleGenerativeAI(gemini_api_key);
    const geminiConfig = {
      temperature: 0.9,
      topP: 1,
      topK: 1,
      maxOutputTokens: 4096,
    };

    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-pro",
      geminiConfig,
    });

    const prompt = `${context}`;
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const generatedPost = response.text();

    //console.log(generatedPost)

    const subject = "Disaster Notification";
    const text = generatedPost;
    const html = `<p>${generatedPost}</p>`;

    await sendEmail(emails, subject, text, html);

    res.status(201).json({
      message: "Notification generated and sent successfully",
      post: generatedPost,
    });
  } catch (error) {
    console.error("Error generating or saving the post:", error);
    
    res.status(500).json({
      error: "An error occurred while generating the post.",
    });
  }
});

module.exports = router;

/*


async function addAIBot() {

    try {
        const botExists = await User.findOne({ name: "Angela" });
        if (botExists) {
            console.log("AI Bot already exists in the database.");
            return;
        }

         const aiBot = new User({
            name: "Angela",
            email: "alertme9ja@gmail.com",
            dob: "16/11/2024", 
            city: "Virtual City",
            country: "nigeria",
            aboutMe: "I am Angela, your AI assistant dedicated to promoting community safety and disaster awareness.",
            profileImage: "/img/cover.webp",
            coverPhoto: "/img/angela.webp",
            friends: [], 
            pages: [], 
            notifications: [], 
            groups: [],
            posts: [], 
            isBot: true,
            accessToken: null
        });

        await aiBot.save();
        console.log("AI Bot has been successfully added to the database.");
    } catch (error) {
        console.error("Error adding AI Bot:", error);
    } 
}

addAIBot();

now lets use openai api to generate 

const OpenAI = require("openai");
const openai = new OpenAI();

async function generateEducationalPost(req, res) {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `${context} + Generate a different education tweet about climates or earthquakes or disasters or flooding or anything natural or artificial disaster`,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const generatedTweet = response.choices[0].text;

*/
