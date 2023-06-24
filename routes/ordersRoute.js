const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const Order = require("../models/orderModel");
const stripe = require("stripe")(
  "sk_test_51NJslGSIuMtvk7tZ7RM9YSkZuS9NU4f5evwKSNOVxj75hXA64kyt5B5OLSPBhW4keC6O096upd3l1u6VRgcDobSI00xOQke0W3"
);

router.post("/placeorder", async (req, res) => {
  const { token, subtotal, currentUser, cartItems } = req.body;

  try {
    const customer = await stripe.customers.create({
      email: token.email,

      source: token.id,
    });

    const payment = await stripe.paymentIntents.create(
      {
        amount: subtotal * 100,
        currency: "inr",
        customer: customer.id,
        receipt_email: token.email,
      },
      {
        idempotencyKey: uuidv4(),
      }
    );

    if (payment) {
      const neworder = new Order({
        name: currentUser.name,
        email: currentUser.email,
        userid: currentUser._id,
        orderItems: cartItems,
        orderAmoount: subtotal,
        shippingAddress: {
          street: token.card.address_line1,
          city: token.card.address_city,
          country: token.card.address_country,
          pincode: token.card.address_zip,
        },
        transactionId: payment.id,
      });

      neworder.save();

      res.send("Order Placed Successfully");
    } else {
      res.send("Payment failed");
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong: " + error });
  }
});

router.post("/getuserorders", async (req, res) => {
  const { userid } = req.body;
  try {
    const orders = await Order.find({ userid: userid }).sort({ _id: -1 });

    res.send(orders);
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
});

module.exports = router;
