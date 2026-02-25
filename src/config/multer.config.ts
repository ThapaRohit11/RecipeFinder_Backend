import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const recipeUploadDir = path.join(uploadDir, "recipe");
if (!fs.existsSync(recipeUploadDir)) {
  fs.mkdirSync(recipeUploadDir, { recursive: true });
}

const createStorage = (destinationDir: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationDir);
    },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
  });

// File filter to allow only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const createUpload = (storage: multer.StorageEngine) =>
  multer({
    storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
    fileFilter: fileFilter,
  });

export const upload = createUpload(createStorage(uploadDir));
export const recipeUpload = createUpload(createStorage(recipeUploadDir));
