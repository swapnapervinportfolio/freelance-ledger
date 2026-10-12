const Transaction = require('../models/Transaction');

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    // 1. request body থেকে currency রিসিভ করা
    const { title, amount, type, client, date, currency } = req.body;

    if (!title || !amount || !type) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount,
      type,
      client,
      date,
      currency: currency || 'USD' // 2. currency না দিলে ডিফল্ট USD সেভ হবে
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get financial summary / analytics
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    let totalIncome = 0;
    let totalExpense = 0;
    const clientEarnings = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        if (tx.client) {
          clientEarnings[tx.client] = (clientEarnings[tx.client] || 0) + tx.amount;
        }
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
      }
    });

    const netProfit = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      netProfit,
      clientEarnings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  getTransactionSummary
};