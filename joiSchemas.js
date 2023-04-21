const BaseJoi = require('joi');
// this joiSchema only catch error if user pass the client side validation anyway (the bootstrap form validation)
// modelSchema : structural design
// joiSchema : validate when user create new question (library joi)


// Joi.string().required() vs Joi.string() 
// Joi.string().required() means the object {key:value} should have the key and value
// Joi.string() means object {key:value} are ok to be empty, but if key are exists, value SHOULD exist too
// Joi.string().allow() means object {key:value} value can be empty



const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': 'Maaf anda tidak bisa memasukkan html tags.',
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean == value) {
                    return clean;
                }
                return helpers.error('string.escapeHTML', { value })
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().allow("").escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        image: Joi.array().allow(null, ''),
        postCategory: Joi.string().escapeHTML(), // not required because edit post disabled post.postCategory in its req.body
        type: Joi.string().escapeHTML(), // not required because edit post disabled post.type in its req.body
        options: Joi.array().allow(null, ''),
        key: Joi.string().allow(null, '').escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        text: Joi.string().escapeHTML(),
        choice: Joi.number(),
    }).required()
})

module.exports.userSchema = Joi.object({
    user: Joi.object({
        name: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        username: Joi.string().required().escapeHTML(),
        password: Joi.string().required().escapeHTML(),
    }).required(),
});
