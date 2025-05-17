import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["create", "archive", "update"],
      required: true,
    },
    collectionName: { type: String, required: true },
    documentId: { type: String, required: true },

    timestamp: { type: Date, default: Date.now },

    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      email: { type: String, required: true },
    },

    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    diff: { type: mongoose.Schema.Types.Mixed },

    ip: String,
    userAgent: String,
  },
  {
    strict: true, // keep this if your `before/after/diff` structure varies
  }
);

AuditLogSchema.index({ collectionName: 1, documentId: 1, timestamp: -1 });
AuditLogSchema.index({ "user.id": 1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);
