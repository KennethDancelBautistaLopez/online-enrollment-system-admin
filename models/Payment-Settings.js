import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    examPeriod: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    collection: "payment-settings",
  }
);

const PaymentSettings =
  mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);

export default PaymentSettings;
