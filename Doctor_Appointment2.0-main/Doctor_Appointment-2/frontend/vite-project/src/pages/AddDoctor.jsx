import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';

const AddDoctor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        speciality: 'General physician',
        email: '',
        password: '',
        experience: '1 Year',
        fees: '',
        about: '',
        address1: '',
        address2: ''
    });
    const [imageFile, setImageFile] = useState(null);

    const onChangeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = 'https://via.placeholder.com/150'; // Default

            if (imageFile) {
                // Convert to Base64 to bypass Storage RLS issues
                const reader = new FileReader();
                reader.readAsDataURL(imageFile);
                await new Promise((resolve) => {
                    reader.onload = () => {
                        imageUrl = reader.result;
                        resolve();
                    };
                });
            }

            // Database Insert
            const { error: insertError } = await supabase.from('doctors').insert([{
                name: formData.name,
                speciality: formData.speciality,
                email: formData.email,
                password: formData.password,
                experience: formData.experience,
                fees: Number(formData.fees),
                about: formData.about,
                address: {
                    line1: formData.address1,
                    line2: formData.address2
                },
                image: imageUrl
            }]);

            if (insertError) throw insertError;

            toast.success("Doctor Added Successfully");
            navigate('/all-doctors');

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to add doctor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar />

            <div className="flex-1 p-10 overflow-auto">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Add Doctor</h2>

                <form onSubmit={onSubmitHandler} className="bg-white rounded-xl shadow-md p-8 max-w-4xl text-gray-600">
                    <div className="flex flex-col gap-4 mb-8">
                        <label className="flex items-center gap-4 cursor-pointer">
                            <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-xs text-center px-2">Upload Photo</span>
                                )}
                            </div>
                            <input type="file" onChange={handleImageChange} hidden accept="image/*" required />
                            <span className="text-gray-500">Upload Doctor Picture</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                            <label>Doctor Name</label>
                            <input onChange={onChangeHandler} value={formData.name} name="name" className="border rounded px-3 py-2" type="text" placeholder="Name" required />

                            <label>Doctor Email</label>
                            <input onChange={onChangeHandler} value={formData.email} name="email" className="border rounded px-3 py-2" type="email" placeholder="Email" required />

                            <label>Doctor Password</label>
                            <input onChange={onChangeHandler} value={formData.password} name="password" className="border rounded px-3 py-2" type="password" placeholder="Password" required />

                            <label>Experience</label>
                            <select onChange={onChangeHandler} value={formData.experience} name="experience" className="border rounded px-3 py-2">
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="4 Years">4 Years</option>
                                <option value="5 Years">5 Years</option>
                                <option value="6 Years">6 Years</option>
                                <option value="7 Years">7 Years</option>
                                <option value="8 Years">8 Years</option>
                                <option value="9 Years">9 Years</option>
                                <option value="10 Years">10 Years</option>
                            </select>

                            <label>Fees</label>
                            <input onChange={onChangeHandler} value={formData.fees} name="fees" className="border rounded px-3 py-2" type="number" placeholder="Fees" required />
                        </div>

                        <div className="flex flex-col gap-4">
                            <label>Speciality</label>
                            <select onChange={onChangeHandler} value={formData.speciality} name="speciality" className="border rounded px-3 py-2">
                                <option value="General physician">General physician</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Pediatricians">Pediatricians</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>

                            <label>Address</label>
                            <input onChange={onChangeHandler} value={formData.address1} name="address1" className="border rounded px-3 py-2" type="text" placeholder="Address 1" required />
                            <input onChange={onChangeHandler} value={formData.address2} name="address2" className="border rounded px-3 py-2" type="text" placeholder="Address 2" required />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
                        <label>About Doctor</label>
                        <textarea onChange={onChangeHandler} value={formData.about} name="about" className="border rounded px-3 py-2 w-full" placeholder="Write about doctor" rows={5} required />
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-10 py-3 mt-8 rounded-full hover:bg-blue-700 transition">
                        {loading ? 'Adding...' : 'Add Doctor'}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default AddDoctor;
