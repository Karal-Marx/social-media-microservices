const Media = require('../models/Media');
const { uploadMediaToCloudinary } = require('../utils/cloudinary');
const logger = require('../utils/logger');

const uploadMedia = async (req, res) => {
    logger.info('Starting media upload');
    try {
        if (!req.file){
            logger.error("No file found! Please add a file and try again.");
            return res.status(400).json({
                success : false,
                message : "No file found! Please add a file and try again"
            });
        }

        const {originalName, mimeType} = req.file;
        const userId = req.user.userId;

        logger.info(`File details : name=${originalName}, type=${mimeType}`);
        logger.info('Uploading to cloudinary starting...');

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(`Cloudinary uploaded successfully. Public Id: - ${cloudinaryUploadResult.public_id}`);

        const newlyCreatedMedia = new Media({
            publicId : cloudinaryUploadResult.public_id,
            originalName,
            mimeType,
            url : cloudinaryUploadResult.secure_url
        })

        await newlyCreatedMedia.save();

        res.status(201).json({
            success : true,
            mediaId : newlyCreatedMedia._id,
            url : newlyCreatedMedia.url,
            message : 'Media uploaded successfully',
            userId
        })
    } catch(err){
        logger.error('Error while uploading to cloudinary', err);
        res.status(500).json({
            success : false,
            message : 'Error creating post'
        })
    }
}

module.exports = { uploadMedia }