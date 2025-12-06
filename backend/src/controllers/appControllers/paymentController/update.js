const mongoose = require('mongoose');

const Model = mongoose.model('Payment');
const Invoice = mongoose.model('Invoice');
const custom = require('@/controllers/pdfController');

const { calculate } = require('@/helpers');

const update = async (req, res) => {
  if (req.body.amount === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    });
  }
  // Find document by id and updates with the required fields
  const previousPayment = await Model.findOne({
    _id: req.params.id,
    removed: false,
  });

  if (!previousPayment) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    });
  }

  const { amount: previousAmount } = previousPayment;
  
  // Get invoice - it might be autopopulated as an object or just an ID
  const invoiceId = previousPayment.invoice._id || previousPayment.invoice;
  const currentInvoice = await Invoice.findOne({ _id: invoiceId, removed: false });
  
  if (!currentInvoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  }
  
  const { total, discount, credit: previousCredit } = currentInvoice;

  const { amount: currentAmount } = req.body;

  const changedAmount = calculate.sub(currentAmount, previousAmount);
  const maxAmount = calculate.sub(total, calculate.add(discount, previousCredit));

  if (changedAmount > maxAmount) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount + previousAmount}`,
      error: `The Max Amount you can add is ${maxAmount + previousAmount}`,
    });
  }

  let paymentStatus =
    calculate.sub(total, discount) === calculate.add(previousCredit, changedAmount)
      ? 'paid'
      : calculate.add(previousCredit, changedAmount) > 0
      ? 'partially'
      : 'unpaid';

  const updatedDate = new Date();
  const updates = {
    number: req.body.number,
    date: req.body.date,
    amount: req.body.amount,
    paymentMode: req.body.paymentMode,
    ref: req.body.ref,
    description: req.body.description,
    updated: updatedDate,
  };

  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $set: updates },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  const resultInvoiceId = result.invoice._id || result.invoice;
  const updateInvoice = await Invoice.findOneAndUpdate(
    { _id: resultInvoiceId.toString() },
    {
      $inc: { credit: changedAmount },
      $set: {
        paymentStatus: paymentStatus,
      },
    },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully updated the Payment ',
  });
};

module.exports = update;
