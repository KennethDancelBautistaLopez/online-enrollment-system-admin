// lib/plugins/auditLoggerPlugin.js
import AuditLog from "@/models/Audit";
import { diff } from "deep-diff";

export function auditLoggerPlugin(schema) {
  schema.pre("save", async function (next) {
    if (!this.isNew) {
      const original = await this.constructor.findById(this._id).lean();
      this._original = original ? JSON.parse(JSON.stringify(original)) : null;
    }
    next();
  });

  schema.post("save", async function () {
    const user = this._auditUser;
    if (!user?.id) return;

    const before = this._original;
    const after = this.toObject({ depopulate: true });
    const action = this.isNew ? "create" : "update";
    const differences = before ? diff(before, after) : null;

    await AuditLog.create({
      action,
      collectionName: this.constructor.modelName,
      documentId: this._id.toString(),
      user: {
        id: user.id,
        email: user.name,
      },
      before,
      after,
      diff: differences,
      timestamp: new Date(),
    });
  });

  schema.pre(["findOneAndUpdate", "findByIdAndUpdate"], async function (next) {
    this._audit = {};
    const docToUpdate = await this.model.findOne(this.getQuery()).lean();
    this._audit.before = docToUpdate
      ? JSON.parse(JSON.stringify(docToUpdate))
      : null;

    const options = this.getOptions();
    this._audit.user = options._auditUser;
    this._audit.meta = options._auditMeta;
    next();
  });

  schema.post(["findOneAndUpdate", "findByIdAndUpdate"], async function (res) {
    const before = this._audit.before;
    const after = res ? res.toObject({ depopulate: true }) : null;
    const user = this._audit.user;

    if (!before || !after || !user?.id) return;

    const differences = diff(before, after);

    await AuditLog.create({
      action: "update",
      collectionName: this.model.modelName,
      documentId: res._id.toString(),
      user: {
        id: user.id,
        email: user.name,
      },
      before,
      after,
      diff: differences,
      timestamp: new Date(),
    });
  });
}
