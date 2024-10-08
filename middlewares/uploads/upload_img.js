
const multer = require('multer');
const mkdirp = require('mkdirp');


const uploadImage = (type) => {
    try {
        const url = `./public/uploads/files/${type}`;
        const made = mkdirp.sync(url);

        const _storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, url);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '_' + file.originalname;
                cb(null, uniqueSuffix);
            }
        });

        const upload = multer({
            storage: _storage,
            fileFilter: function (req, file, cb) {
                const imageExtensions = [
                    "jpg",
                    "jpeg",
                    "png",
                    "bmp",
                ];

                const fileExtension = file.originalname.split('.').pop();
                const check = imageExtensions.includes(fileExtension);

                // check ? cb(null, true) : cb(new Error("Extension không hợp lệ!"));
                cb(null, true)
            }
        });

        return upload.single(type);
    } catch (error) {
        console.log("error upload: ", error);

    }
}

module.exports = uploadImage;