const validateCouponCreation = (req, res, next) => {
  const { code, discount, valid_from, valid_until, usage_limit } = req.body;
  const errors = [];

  // Validate code
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    errors.push('Code is required and must be a non-empty string');
  } else if (code.length > 50) {
    errors.push('Code must be 50 characters or less');
  }

  // Validate discount
  if (!discount || typeof discount !== 'number' || discount <= 0) {
    errors.push('Discount is required and must be a positive number');
  } else if (discount > 100) {
    errors.push('Discount cannot exceed 100%');
  }

  // Validate dates if provided
  if (valid_from && !isValidDate(valid_from)) {
    errors.push('valid_from must be a valid ISO date string');
  }

  if (valid_until && !isValidDate(valid_until)) {
    errors.push('valid_until must be a valid ISO date string');
  }

  // Validate date logic
  if (valid_from && valid_until && new Date(valid_from) >= new Date(valid_until)) {
    errors.push('valid_from must be before valid_until');
  }

  // Validate usage_limit
  if (usage_limit !== null && usage_limit !== undefined) {
    if (!Number.isInteger(usage_limit) || usage_limit <= 0) {
      errors.push('usage_limit must be a positive integer');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

const validateCouponUpdate = (req, res, next) => {
  const { code, discount, valid_from, valid_until, usage_limit } = req.body;
  const errors = [];

  // Validate code if provided
  if (code !== undefined) {
    if (typeof code !== 'string' || code.trim().length === 0) {
      errors.push('Code must be a non-empty string');
    } else if (code.length > 50) {
      errors.push('Code must be 50 characters or less');
    }
  }

  // Validate discount if provided
  if (discount !== undefined) {
    if (typeof discount !== 'number' || discount <= 0) {
      errors.push('Discount must be a positive number');
    } else if (discount > 100) {
      errors.push('Discount cannot exceed 100%');
    }
  }

  // Validate dates if provided
  if (valid_from !== undefined && valid_from !== null && !isValidDate(valid_from)) {
    errors.push('valid_from must be a valid ISO date string');
  }

  if (valid_until !== undefined && valid_until !== null && !isValidDate(valid_until)) {
    errors.push('valid_until must be a valid ISO date string');
  }

  // Validate usage_limit if provided
  if (usage_limit !== undefined && usage_limit !== null) {
    if (!Number.isInteger(usage_limit) || usage_limit <= 0) {
      errors.push('usage_limit must be a positive integer');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

module.exports = {
  validateCouponCreation,
  validateCouponUpdate
};