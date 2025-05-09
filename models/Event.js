import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    eventType: { type: String, required: true },
    organizer: { type: String, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Registered students
  },
  { timestamps: true }
);

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

export default Event;
