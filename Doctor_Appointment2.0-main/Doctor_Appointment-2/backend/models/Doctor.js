// import mongoose from "mongoose";

// const doctorSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     speciality: { type: String, required: true },
//     degree: { type: String, required: true },
//     experience: { type: Number, required: true },
//     about: { type: String },
//     available: { type: Boolean, default: true },
//     fees: { type: Number, required: true },
//     address: { type: Object, required: true },
//     date: { type: Number, required: true },
//     slot_booked: { type: Object, default:{}}
// },{minimize: false});

// const Doctor = mongoose.models.doctor || mongoose.model("Doctor", doctorSchema);
// export default Doctor;
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  speciality: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  about: {
    type: String,
  },
  fees: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const doctorModel = mongoose.models.doctor || mongoose.model("Doctor", doctorSchema);
export default doctorModel;
