import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Supabase User ID
    docId: { type: String, required: true },  // Doctor ID (from Mongoose/Backend)
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true }, // Store name/image etc for display
    docData: { type: Object, required: true },  // Store doctor details
    amount: { type: Number, required: true },
    date: { type: Number, required: true }, // Timestamp
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    status: { type: String, default: 'Pending' } // Pending, Accepted, Rejected
});

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
