import validator from 'validator';
import { v2 as cloudinary } from 'cloudinary';
import supabase from '../config/supabase.js';
import supabaseAdmin from '../config/supabaseAdmin.js';
import { getIO } from '../socket.js';

// API to register user
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      return res.json({ success: false, message: error.message });
    }

    // Sync to 'users' table
    const { error: syncError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: data.user.id,
        email: email,
        name: name
      });

    if (syncError) console.error("Sync error:", syncError);

    res.json({ success: true, user: data.user, session: data.session });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.json({ success: false, message: error.message });
    }

    res.json({ success: true, session: data.session, user: data.user });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    const userEmail = req.user.email;
    const supaId = req.user.id;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    let imageURL = "";
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageURL = imageUpload.secure_url;
    }

    const updateData = {
      name,
      phone,
      address: typeof address === 'string' ? JSON.parse(address) : address,
      dob,
      gender
    };

    if (imageURL) updateData.image = imageURL;

    const { error: supaError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', supaId);

    if (supaError) {
      throw supaError;
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
    const { docId, slotDate, slotTime } = req.body;
    const supaId = req.user.id;

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
    if (typeof slots_booked === 'string') {
      try { slots_booked = JSON.parse(slots_booked); } catch (e) { slots_booked = {}; }
    }

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    // Fetch user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supaId)
      .single();

    if (userError) throw userError;

    const appointmentDate = Date.now();

    // 2. Save into Supabase 'appointments' table
    const { error: bookingError } = await supabaseAdmin
      .from('appointments')
      .insert([{
        user_id: supaId,
        doc_id: docId,
        slot_date: slotDate,
        slot_time: slotTime,
        user_data: userData,
        doc_data: { ...docData, slots_booked: undefined },
        amount: docData.fees,
        date: appointmentDate,
        status: 'Pending',
        patient_name: userData.name
      }]);

    if (bookingError) throw bookingError;

    // save new slots data to Supabase
    await supabase
      .from('doctors')
      .update({ slots_booked: JSON.stringify(slots_booked) })
      .eq('id', docId);

    // Emit real-time event
    try {
        const io = getIO();
        io.emit('newUserRegistered', { type: 'appointment', date: appointmentDate });
    } catch (socketError) {
        console.error("Socket emit error:", socketError);
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
    const supaId = req.user.id;
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', supaId);

    if (error) throw error;

    res.json({ success: true, appointments });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const supaId = req.user.id;

    const { data: appointmentData, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointmentData) throw new Error("Appointment not found");

    if (appointmentData.user_id !== supaId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await supabaseAdmin
      .from('appointments')
      .update({ status: 'Cancelled' })
      .eq('id', appointmentId);

    // release doctor slot
    const { doc_id, slot_date, slot_time } = appointmentData;

    const { data: doctorData, error: getError } = await supabase
      .from('doctors')
      .select('slots_booked')
      .eq('id', doc_id)
      .single();

    if (!getError && doctorData) {
      let slots_booked = doctorData.slots_booked || {};
      if (typeof slots_booked === 'string') {
        try { slots_booked = JSON.parse(slots_booked); } catch (e) { slots_booked = {}; }
      }

      if (slots_booked[slot_date]) {
        slots_booked[slot_date] = slots_booked[slot_date].filter(e => e !== slot_time);
      }

      await supabase
        .from('doctors')
        .update({ slots_booked: JSON.stringify(slots_booked) })
        .eq('id', doc_id);
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
