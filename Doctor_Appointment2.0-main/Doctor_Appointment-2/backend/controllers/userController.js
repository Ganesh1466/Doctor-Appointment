import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import doctorModel from '../models/Doctor.js';
import appointmentModel from '../models/Appointment.js';
import validator from 'validator';
import { v2 as cloudinary } from 'cloudinary';
import supabase from '../config/supabase.js';

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter Valid Email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter Strong Password" });
    }

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token, user });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await User.findById(userId).select('-password');

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await User.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      const imageURL = imageUpload.secure_url;

      await User.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // 1. Fetch doctor from Supabase
    const { data: docData, error: supaError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', docId)
      .single();

    if (supaError || !docData) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked || {};

    // Convert string slots_booked to object if needed
    if (typeof slots_booked === 'string') {
      try { slots_booked = JSON.parse(slots_booked); } catch (e) { slots_booked = {}; }
    }

    // check availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await User.findById(userId).select('-password');
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now()
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data to Supabase
    const { error: updateError } = await supabase
      .from('doctors')
      .update({ slots_booked: JSON.stringify(slots_booked) })
      .eq('id', docId);

    if (updateError) {
      console.error("Supabase slot update error:", updateError);
    }

    res.json({ success: true, message: "Appointment Booked" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API for user appointments listing
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // release doctor slot in Supabase
    const { docId, slotDate, slotTime } = appointmentData;

    // Fetch current slots
    const { data: doctorData, error: getError } = await supabase
      .from('doctors')
      .select('slots_booked')
      .eq('id', docId)
      .single();

    if (!getError && doctorData) {
      let slots_booked = doctorData.slots_booked || {};
      if (typeof slots_booked === 'string') {
        try { slots_booked = JSON.parse(slots_booked); } catch (e) { slots_booked = {}; }
      }

      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
      }

      await supabase
        .from('doctors')
        .update({ slots_booked: JSON.stringify(slots_booked) })
        .eq('id', docId);
    }
    res.json({ success: true, message: "Appointment Cancelled" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to upload image only
const uploadImage = async (req, res) => {
  try {
    const imageFile = req.file;
    if (!imageFile) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageURL = imageUpload.secure_url;

    res.json({ success: true, imageURL });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, uploadImage };
