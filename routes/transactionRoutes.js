const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  getTransactionSummary
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/summary').get(protect, getTransactionSummary);

module.exports = router;