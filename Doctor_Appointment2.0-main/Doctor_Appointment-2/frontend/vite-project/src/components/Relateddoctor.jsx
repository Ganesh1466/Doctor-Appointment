import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Relateddoctor = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()
  const [relDoc, setRelDoc] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const list = doctors.filter(
        (doc) => doc.speciality === speciality && doc.id !== docId
      )
      setRelDoc(list)
    }
  }, [doctors, speciality, docId])

  return (
    <div className="flex flex-col items-center justify-center gap-4 my-16 text-gray-900 mx-auto max-w-5xl px-4">


      <h1 className="text-3xl text-[#1E3A8A] font-medium">Top Doctors to Book</h1>

      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-5 px-3 sm:px-0">
        {relDoc.slice(0, 5).map((item, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/appointment/${item.id}`);
              scrollTo(0, 0);
            }}
            className="border  border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500"
          >

            <img className="bg-blue-50  w-full" src={item.image} alt={item.name} />
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

      <button
        onClick={() => {
          navigate('/doctors')
          scrollTo(0, 0)
        }}
        className="mt-2 bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
      >
        More
      </button>
    </div>
  )
}

export default Relateddoctor;
