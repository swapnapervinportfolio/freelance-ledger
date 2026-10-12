const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the transaction']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  client: {
    type: String,
    required: function() { return this.type === 'income'; }
  },
  date: {
    type: Date,
    default: Date.now
  },
  // কারেন্সি ফিল্ডটি এখানে ফিল্ডগুলোর ভেতরে থাকবে
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'BDT']
  }
}, {
  timestamps: true // এটি থাকবে স্কিমার অপশন হিসেবে সবার শেষে
});

module.exports = mongoose.model('Transaction', transactionSchema);