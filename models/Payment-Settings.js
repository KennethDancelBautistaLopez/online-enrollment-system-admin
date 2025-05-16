import mongoose from "mongoose";
import { auditLoggerPlugin } from "./plugins/AuditLogger.plugin";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    examPeriod: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    collection: "payment-settings",
  }
);

PaymentSettingsSchema.plugin(auditLoggerPlugin);

const PaymentSettings =
  mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);

export default PaymentSettings;
