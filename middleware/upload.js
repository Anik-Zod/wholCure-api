// import multer from "multer";

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "application/pdf",
//       "image/jpeg",
//       "image/png",
//       "image/jpg",
//       "image/webp",
//       "image/gif",
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image or PDF files are allowed"), false);
//     }
//   },
// });

// export default upload;

// import multer from "multer";

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// // middleware/upload.js

// fileFilter: (req, file, cb) => {
//     // Agar file exist hi nahi karti (optional field), toh error mat do
//     if (!file) {
//         return cb(null, true);
//     }

//     const allowedTypes = [
//         "application/pdf",
//         "application/x-pdf",
//         "image/jpeg",
//         "image/png",
//         "image/jpg",
//         "image/webp",
//         "image/gif",
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         // Sirf tab error do jab file ho lekin uska type galat ho
//         cb(new Error("Only image or PDF files are allowed"), false);
//     }
// }
// });

// export default upload;
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
 if (!file || !file.originalname) {
        return cb(null, true);
    }

    const allowedTypes = [
    
      "application/pdf",
      "application/x-pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];

   
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
  
       cb(null, true);
     
    }
  },
});

export default upload;

