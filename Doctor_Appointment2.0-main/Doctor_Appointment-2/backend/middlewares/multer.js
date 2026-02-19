import multer from 'multer';

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

// We are using Cloudinary for storage, but this middleware just handles the file upload to disk temporarily if needed, 
// OR simpler using just memory storage if we stream, but the adminController logic used `req.file.path`, so DiskStorage is expected.

const upload = multer({ storage });

export default upload;
