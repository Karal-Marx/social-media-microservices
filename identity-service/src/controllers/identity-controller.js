const User = require("../models/User");
const { validateRegistration, validateLogin } = require('../utils/validation');
const logger = require('../utils/logger');
const generateTokens = require("../utils/generateTokens");
const { argon2 } = require("argon2");
const RefreshToken = require("../models/RefreshToken");

//User Registration
const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit...')
    try{

        const {error} = validateRegistration(req.body);
        if (error){
            logger.warn(`Registration validation error: ${error.details[0].message}`)
            return res.status(400).json({
                success : false,
                message : error.details[0].message 
            }); 
        }
        const {email, password, username} = req.body

        let user = await User.findOne({ $or : [{email}, {username}]});
        if (user){
            logger.warn("User already exists with the same username or email");
            return res.status(400).json({
                success : false,
                message : "User with same username or email already exists"
            }); 
        }

        user = new User({username, email, password})
        await user.save()
        logger.warn("User saved successfully", user._id);

        const {accessToken, refreshToken} = await generateTokens(user);

        res.status(201).json({
            success : true,
            message : 'User registered successfully',
            accessToken,
            refreshToken
        })

    } catch(err){
        logger.error('Registration error occured', err);
        res.status(500).json({
            success : false,
            message : "Internal server error"
        });
    }
}


//User Login
const loginUser = async (req, res) => {
    logger.info('Login endpoint hit...');
    try{
        const {error} = validateLogin(req.body);
        if (error){
            logger.error(`Login validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success : false,
                message : error.details[0].message 
            });
        }
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if (!user){
            logger.warn('Invalid User');
            return res.status(400).json({
                success : false,
                message : 'Invalid credentials'
            });
        }
        const checkPassword = await user.comparePassword(password);
        if (!checkPassword){
            logger.warn('Invalid password');
            return res.status(400).json({
                success : false,
                message : 'Invalid credentials'
            })
        }

        const {accessToken, refreshToken} = await generateTokens(user);

        return res.status(200).json({
            success : true,
            message : 'Login successful',
            userId : user._id,
            accessToken,
            refreshToken 
        });


    }catch(err){
        logger.error("Login error occured", err);
        res.status(500).json({
            success : false,
            message: "Internal server error"
        });
    }
}

//Refresh Token
const refreshTokenUser = async (req, res) => {
    logger.info('Refresh token endpoint hit...');
    try{
        const {refreshToken} = req.body;
        if (!refreshToken){
            logger.warn('Missing refresh token');
            return res.status(400).json({
                success: false,
                message: 'Missing refresh token'
            });
        }

        const storedToken = await RefreshToken.findOne({token : refreshToken});

        if (!storedToken || storedToken.expiresAt < new Date()){
            logger.warn('Invalid or expired token');

            return res.status(400).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        const user = await User.findById(storedToken.user);
        
        if(!user){
            logger.warn('User not found');

            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const {accessToken: newAccessToken, refreshToken: newRefreshToken} = await generateTokens(user);
        
        //delete existing refresh token
        await RefreshToken.deleteOne({_id: storedToken._id})

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })

    } catch(err){
        logger.error('Refresh token error occured', err);
        return res.status(500).json({
            success: true,
            message: 'Internal server error'
        });
    }
}


//Logout

const logoutUser = async (req, res) => {
    logger.info('Logout endpoint hit...');
    try{
        const {refreshToken} = req.body;
        if (!refreshToken){
            logger.warn('Missing refresh token');
            return res.status(400).json({
                success: false,
                message: 'Missing refresh token'
            });
        }

        await RefreshToken.deleteOne({token: refresh})
        logger.info('Refresh token deleted for logout');

        res.json({
            success: true,
            message: "Successfully logged out"
        })

    }catch(err){
        logger.error('Error while loggin out', err);
        return res.status(500).json({
            success: true,
            message: 'Internal server error'
        });
    }
}
module.exports = { registerUser , loginUser, refreshTokenUser, logoutUser};