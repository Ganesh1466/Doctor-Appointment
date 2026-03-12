import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import supabase from "../config/supabase.js";
import supabaseAdmin from "../config/supabaseAdmin.js";

export const signupDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address, date } = req.body;

    const { data: existingDoctor } = await supabase
      .from('doctors')
      .select('email')
      .eq('email', email)
      .single();

    if (existingDoctor) return res.status(400).json({ message: "Doctor already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctorData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      date: date || new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from('doctors')
      .insert([doctorData]);

    if (error) throw error;

    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !doctor) return res.status(400).json({ message: "Doctor not found" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: doctor.id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ success: true, token });
  } catch (err) {
    console.error("Doctor Login Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// API to get doctor appointments for doctor panel
export const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doc_id', docId);

    if (error) throw error;

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to mark appointment completed
export const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    
    const { data: appointmentData, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointmentData) throw new Error("Appointment not found");

    if (appointmentData.doc_id === docId) {
      const { error: updateError } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'Completed', isCompleted: true })
        .eq('id', appointmentId);

      if (updateError) throw updateError;
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to cancel appointment
export const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const { data: appointmentData, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointmentData) throw new Error("Appointment not found");

    if (appointmentData.doc_id === docId) {
      const { error: updateError } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'Cancelled', cancelled: true })
        .eq('id', appointmentId);

      if (updateError) throw updateError;
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed" });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to get dashboard data
export const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doc_id', docId);

    if (error) throw error;

    let earnings = 0;
    let patients = [];

    appointments.map((item) => {
      if (item.status === 'Completed' || item.isCompleted || item.payment) {
        earnings += item.amount;
      }
      if (!patients.includes(item.user_id)) {
        patients.push(item.user_id);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    };

    res.json({ success: true, dashData });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to get all doctors list for frontend
export const doctorList = async (req, res) => {
  try {
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('id, name, image, speciality, degree, experience, about, fees, address, available');

    if (error) {
      return res.json({ success: false, message: error.message });
    }

    res.json({ success: true, doctors });
  } catch (error) {
    console.log("Doctor List Error:", error);
    res.json({ success: false, message: error.message });
  }
}
