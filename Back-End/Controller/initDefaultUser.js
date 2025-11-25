const UserLogin = require("../Models/LogInSchema");

const initDefaultUser = async () => {
  const userCount = await UserLogin.countDocuments();

  if (userCount === 0) {
    const defaultAdmin = new UserLogin({
      first_name: process.env.DEFAULT_ADMIN_FIRSTNAME || "Admin",
      last_name: process.env.DEFAULT_ADMIN_LASTNAME || "User",
      username: process.env.DEFAULT_ADMIN_EMAIL,
      password: process.env.DEFAULT_ADMIN_PASSWORD,
      confirmPassword: process.env.DEFAULT_ADMIN_PASSWORD,
      role: "admin",
      contact_number: process.env.DEFAULT_ADMIN_CONTACT || 9999999999,
      isVerified: true,
      theme: process.env.DEFAULT_ADMIN_THEME || "light",
    });

    const savedAdmin = await defaultAdmin.save();

    savedAdmin.linkedId = savedAdmin._id;
    await savedAdmin.save();

    console.log("Default admin account created with linkedId!");
  } else {
    console.log("Admin account already exists.");
  }
};

module.exports = initDefaultUser;
