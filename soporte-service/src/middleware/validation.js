const Joi = require('joi');

/**
 * Validation schemas for ticket operations
 */
const schemas = {
    createTicket: Joi.object({
        idUsuario: Joi.string().required().messages({
            'string.empty': 'idUsuario is required',
            'any.required': 'idUsuario is required'
        }),
        idVenta: Joi.string().optional().allow('').messages({
            'string.base': 'idVenta must be a string'
        }),
        customerName: Joi.string().optional().allow('').messages({
            'string.base': 'customerName must be a string'
        }),
        total: Joi.number().optional().min(0).messages({
            'number.base': 'total must be a number',
            'number.min': 'total must be greater than or equal to 0'
        }),
        statusVenta: Joi.string().optional().allow('').messages({
            'string.base': 'statusVenta must be a string'
        }),
        tipo_ticket: Joi.string().valid('queja', 'devolucion', 'problema').required().messages({
            'string.empty': 'tipo_ticket is required',
            'any.required': 'tipo_ticket is required',
            'any.only': 'tipo_ticket must be one of: queja, devolucion, problema'
        }),
        descripcion: Joi.string().required().min(10).max(2000).messages({
            'string.empty': 'descripcion is required',
            'any.required': 'descripcion is required',
            'string.min': 'descripcion must be at least 10 characters long',
            'string.max': 'descripcion cannot exceed 2000 characters'
        })
    }),

    updateTicket: Joi.object({
        estado_ticket: Joi.string().valid('abierto', 'en_proceso', 'resuelto', 'cerrado').optional().messages({
            'any.only': 'estado_ticket must be one of: abierto, en_proceso, resuelto, cerrado'
        }),
        descripcion: Joi.string().optional().min(10).max(2000).messages({
            'string.min': 'descripcion must be at least 10 characters long',
            'string.max': 'descripcion cannot exceed 2000 characters'
        }),
        fechaResolucion: Joi.date().optional().messages({
            'date.base': 'fechaResolucion must be a valid date'
        })
    }).min(1).messages({
        'object.min': 'At least one field must be provided for update'
    }),

    queryParams: Joi.object({
        usuario: Joi.string().optional(),
        estado: Joi.string().valid('abierto', 'en_proceso', 'resuelto', 'cerrado').optional(),
        tipo: Joi.string().valid('queja', 'devolucion', 'problema').optional(),
        limit: Joi.number().integer().min(1).max(100).optional().default(50),
        offset: Joi.number().integer().min(0).optional().default(0)
    })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to use
 * @param {string} source - Source of data to validate ('body', 'params', 'query')
 */
const validate = (schemaName, source = 'body') => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({
                error: 'Validation schema not found',
                message: `Schema '${schemaName}' is not defined`
            });
        }

        const dataToValidate = req[source];
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false, // Return all validation errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                message: 'The provided data is invalid',
                details: validationErrors
            });
        }

        // Replace the original data with validated and sanitized data
        req[source] = value;
        next();
    };
};

/**
 * UUID validation middleware for route parameters
 */
const validateUUID = (paramName = 'id') => {
    return (req, res, next) => {
        const uuid = req.params[paramName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(uuid)) {
            return res.status(400).json({
                error: 'Invalid UUID format',
                message: `Parameter '${paramName}' must be a valid UUID`
            });
        }

        next();
    };
};

module.exports = {
    validate,
    validateUUID,
    schemas
};