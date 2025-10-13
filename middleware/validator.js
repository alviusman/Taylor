const { body, validationResult } = require('express-validator');

const validateOrder = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama harus diisi')
    .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Nomor telepon harus diisi')
    .matches(/^(\+62|62|0)[0-9]{9,12}$/).withMessage('Format nomor telepon tidak valid (contoh: 081234567890)'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format email tidak valid'),
  
  body('serviceId')
    .notEmpty().withMessage('Layanan harus dipilih')
    .isMongoId().withMessage('ID layanan tidak valid'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Catatan maksimal 500 karakter'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Alamat maksimal 200 karakter'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = { validateOrder };