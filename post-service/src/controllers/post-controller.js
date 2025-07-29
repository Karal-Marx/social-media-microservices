const logger = require('../utils/logger');
const Post = require('../models/Post');
const { validateCreatePost } = require('../utils/validation');


async function invalidatePostCache(req, input) {

    const cachedKey = `post:${input}`
    await req.redisClient.del(cachedKey)

    const keys = await req.redisClient.keys("posts:*");
    if (keys.length > 0){
        await req.redisClient.del(keys) 
    }
}

const createPost = async (req, res) => {
    logger.info('Create post endpoint hit')
    try {

        const { error } = validateCreatePost(req.body);
        if (error){
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const {content, mediaIds} = req.body;
        const newlyCreatedPost =  new Post({
            user : req.user.userId,
            content,
            mediaIds : mediaIds || []
        });
        await newlyCreatedPost.save();
        await invalidatePostCache(req, newlyCreatedPost._id.toString());

        logger.info(`Post created successfully: ${newlyCreatedPost}`);
        res.status(201).json({
            success : true,
            message : 'Post created successfully'
        })
    } catch (error) {
        logger.error(`Error creating post: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error creating post" 
        });
    }
}

const getAllPost = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if (cachedPosts){
            return res.json(JSON.parse(cachedPosts))
        }

        const posts = await Post.find({})
            .sort({createdAt : -1})
            .skip(startIndex)
            .limit(limit);

        const totalNoOfPosts = await Post.countDocuments()

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalNoOfPosts/limit),
            totalPosts : totalNoOfPosts
        }

        //save post in cache
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result))

        res.json(result)
    }catch(error){
        logger.error(`Error fetching posts ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error fetching posts" 
        });
    }
}

const getPost = async (req, res) => {
    try{
        const postId = req.params.id;
        const cachekey = `post:${postId}`;
        
        const cachedPost = await req.redisClient.get(cachekey);

        if (cachedPost){
            return res.json(JSON.parse(cachedPost));
        }

        const singlePostDetailsById = await Post.findById(postId);

        if (!singlePostDetailsById){
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        await req.redisClient.setex(cachekey, 3600, JSON.stringify(singlePostDetailsById))

        res.json(singlePostDetailsById)

    }catch(error){
        logger.error(`Error fetching post ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error fetching post by ID" 
        });
    }
}

const deletePost = async (req, res) => {
    try{
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user : req.user.userId
        })

        if (!post){
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        await invalidatePostCache(req, req.params.id)
        res.json({
            success: true,
            message: "Post deleted successfully"
        })
    }catch(error){
        logger.error(`Error deleting posts ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error deleting posts" 
        });
    }
}

module.exports = { createPost, getAllPost, getPost, deletePost };