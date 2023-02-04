const BaseJoi = require('joi');
// this joiSchema only catch error if user pass the client side validation anyway (the bootstrap form validation)

const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': 'Should not contain any html tags.',
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
        hashtag: Joi.string().allow("").escapeHTML(),
        postCategory: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        text: Joi.string().required().escapeHTML(),
    }).required()
})
