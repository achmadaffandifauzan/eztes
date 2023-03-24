const BaseJoi = require('joi');
// this joiSchema only catch error if user pass the client side validation anyway (the bootstrap form validation)
// modelSchema : structural design
// joiSchema : validate when user create new question

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
        title: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        postCategory: Joi.string().required().escapeHTML(),
        type: Joi.string().required().escapeHTML(),
        options: Joi.object().allow(""),
        key: Joi.string().allow("").escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        text: Joi.string().required().escapeHTML(),
    }).required()
})
