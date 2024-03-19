const multer = require('multer');

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
  };

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, "public/uploads");
        // cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = file.originalname.replace(' ', '-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, fileName + '-' + uniqueSuffix + '.' + ext);
    }
});

module.exports = multer({
    storage: storage
});