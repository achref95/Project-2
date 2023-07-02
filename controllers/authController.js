const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const cloudinary = require("cloudinary").v2;

// ##########################
// UPDATE PASSWORD POST ROUTE
// ##########################
const updatePostPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.session.currentUser);

    if (bcrypt.compareSync(currentPassword, user.password) && bcrypt.compareSync(newPassword, user.password)) {
      return res.render(`auth/change-password`, {
        errorMessage: "Can not change to the same password",
        userInSession: user,
      });
    }

    if (bcrypt.compareSync(currentPassword, user.password)) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      return res.render(`users/user-profile`, {
        message: "Password Changed",
        auth: true,
        user: user,
        userinSession: req.session.currentUser
      });
    } else {
      res.render("auth/change-password", {
        errorMessage: "Incorrect current Password",
        userInSession: user,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// ############################
// UPDATE PROFILE PICTURE ROUTE
// ############################
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.session.currentUser;
    const file = req.file; // Get the uploaded file from the request
    if (!file) {
      return res.redirect('/')
    }
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path);
    
    // Update the user's profile picture URL in the database
    await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true }
    );

    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

// #######
// EXPORTS
// #######
module.exports = {
  updatePostPassword,
  updateProfilePicture,
};
