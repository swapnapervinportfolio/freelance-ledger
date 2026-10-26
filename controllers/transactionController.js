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
      currency: currency || 'USD'
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { title, amount, type, client, date, currency } = req.body;

    if (title !== undefined) transaction.title = title;
    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (date) transaction.date = date;
    if (currency) transaction.currency = currency;

    if (transaction.type === 'income') {
      if (client !== undefined) transaction.client = client;
    } else {
      transaction.client = undefined;
    }

    const updated = await transaction.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get financial summary (separate totals for each currency)
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    const totals = {};
    const clientMap = {};

    transactions.forEach((tx) => {
      const cur = tx.currency || 'USD';

      if (!totals[cur]) {
        totals[cur] = { income: 0, expense: 0, net: 0 };
      }

      if (tx.type === 'income') {
        totals[cur].income += tx.amount;

        if (tx.client) {
          const key = `${tx.client}__${cur}`;
          if (!clientMap[key]) {
            clientMap[key] = { client: tx.client, currency: cur, total: 0 };
          }
          clientMap[key].total += tx.amount;
        }
      } else if (tx.type === 'expense') {
        totals[cur].expense += tx.amount;
      }
    });

    Object.values(totals).forEach((t) => {
      t.net = t.income - t.expense;
    });

    const clientEarnings = Object.values(clientMap).sort((a, b) => b.total - a.total);

    res.json({ totals, clientEarnings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
};