const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);

// '/summary' must stay above '/:id'
router.route('/summary').get(protect, getTransactionSummary);

router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;