const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i;
  const extname = allowedTypes.test(path.extname(file.originalname));
  const mimetype = file.mimetype.startsWith("application/");

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only document files are allowed (.pdf, .docx, etc)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;
