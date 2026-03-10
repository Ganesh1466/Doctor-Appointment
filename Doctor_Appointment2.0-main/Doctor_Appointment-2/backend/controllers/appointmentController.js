import appointmentModel from "../models/Appointment.js";
import doctorModel from "../models/Doctor.js";
import supabase from "../config/supabase.js";

// API to book appointment
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime, userData, amount } = req.body;

        // 1. Fetch doctor from Supabase
        const { data: docData, error: supaError } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', docId)
            .single();

        if (supaError || !docData) {
            return res.json({ success: false, message: "Doctor not available" });
        }

        let slots_booked = docData.slots_booked || {};

        // Convert string slots_booked to object if it's stored as JSON string
        if (typeof slots_booked === 'string') {
            try { slots_booked = JSON.parse(slots_booked); } catch (e) { slots_booked = {}; }
        }

        // Check if slot is available
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot not available" });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount,
            slotTime,
            slotDate,
            date: Date.now(),
            status: 'Pending'
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // Save doctors slot data back to Supabase
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
};

// API to get doctor appointments for Doctor Dashboard
const getDoctorAppointments = async (req, res) => {
    try {
        // Ideally we verify the doctor's token here
        const { docId } = req.body; // Or from req.user if using auth middleware
        const appointments = await appointmentModel.find({ docId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to accept/cancel appointment (Doctor)
const updateStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        await appointmentModel.findByIdAndUpdate(appointmentId, { status });
        res.json({ success: true, message: "Appointment status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { bookAppointment, getDoctorAppointments, updateStatus };
