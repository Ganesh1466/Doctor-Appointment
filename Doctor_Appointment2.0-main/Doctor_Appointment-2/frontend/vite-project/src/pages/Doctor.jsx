import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Doctor = () => {
  const { speciality } = useParams()
  const [filter, setFilter] = useState([])
  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()

  const applyFilter = () => {
    if (speciality) {
      setFilter(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilter(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  return (
    <div className="px-6 md:px-20 py-10 bg-white min-h-screen">
      <Navbar />
      <div className="px-6 md:px-20 py-10 bg-gray-50 min-h-screen">
        <p className="text-2xl font-semibold mb-8 border-b pb-3 text-gray-800">
          Browse through the doctors specialist.
        </p>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col gap-4 text-sm text-gray-600 md:w-1/4">
            <p onClick={() =>
              speciality === 'General physician'
                ? navigate('/doctors')
                : navigate('/doctors/General physician')
            }
              className={`px-5 py-2 border border-black-700 rounded-sm text-center cursor-pointer transition-all ${speciality === 'General physician'
                ? 'bg-indigo-100 text-black'
                : 'hover:bg-indigo-100 hover:text-black'
                }`}
            >
              General Physician
            </p>

            <p onClick={() =>
              speciality === 'Gynecologist'
                ? navigate('/doctors')
                : navigate('/doctors/Gynecologist')
            }
              className={`px-5 py-2 border border-black-700 rounded-md text-center cursor-pointer transition-all ${speciality === 'Gynecologist'
                ? 'bg-indigo-100 text-black'
                : 'hover:bg-indigo-100 hover:text-black'
                }`}
            >
              Gynecologist
            </p>

            <p onClick={() =>
              speciality === 'Dermatologist'
                ? navigate('/doctors')
                : navigate('/doctors/Dermatologist')
            }
              className={`px-5 py-2 border border-black-700 rounded-md text-center cursor-pointer transition-all ${speciality === 'Dermatologist'
                ? 'bg-indigo-100 text-black'
                : 'hover:bg-indigo-100 hover:text-black'
                }`}
            >
              Dermatologist
            </p>

            <p onClick={() =>
              speciality === 'Pediatrician'
                ? navigate('/doctors')
                : navigate('/doctors/Pediatricians')
            }
              className={`px-5 py-2 border border-black-700 rounded-md text-center cursor-pointer transition-all ${speciality === 'Pediatrician'
                ? 'bg-indigo-100 text-black'
                : 'hover:bg-indigo-100 hover:text-black'
                }`}
            >
              Pediatrician
            </p>

            <p onClick={() =>
              speciality === 'Neurologist'
                ? navigate('/doctors')
                : navigate('/doctors/Neurologist')
            }
              className={`px-5 py-2 border border-black-700 rounded-md text-center cursor-pointer transition-all ${speciality === 'Neurologist'
                ? 'bg-indigo-100 text-black'
                : 'hover:bg-indigo-100 hover:text-black'
                }`}
            >
              Neurologist
            </p>

            <p onClick={() =>
              speciality === 'Gastroenterologist'
                ? navigate('/doctors')
                : navigate('/doctors/Gastroenterologist')
            }
              className={`px-5 py-2 border border-black-700 rounded-md text-center cursor-pointer transition-all ${speciality === 'Gastroenterologist'
                ? 'bg-indigo-100 text-black'
                : 'hover:bg-indigo-100 hover:text-black'
                }`}
            >
              Gastroenterologist
            </p>
          </div>

          <div className="w-full grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filter.map((item, index) => (
              <div
                onClick={() => navigate(`/appointment/${item.id}`)}
                key={index}
                className="border border-black-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 bg-white shadow-sm"
              >
                <div className="w-full bg-blue-50 h-64  flex items-center justify-center overflow-hidden">
                  <img
                    className="object-contain bg w-full h-full"
                    src={item.image}
                    alt={item.name}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-green-500 mb-1">
                    <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                    <p>Available</p>
                  </div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-600 text-sm">{item.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Doctor
