const Joi = require('joi');

const validateCreatePost = (data) => {
    const schema = Joi.object({
        content : Joi.string().max(5000).min(3).required()
    })

    return schema.validate(data);
};

module.exports = { validateCreatePost };