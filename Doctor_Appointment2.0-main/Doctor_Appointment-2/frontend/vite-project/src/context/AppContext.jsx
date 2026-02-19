import { createContext, useEffect, useState } from "react";
// import { doctors } from "../assets/assets"; // Replaced by Supabase
import { supabase } from "../supabase";
import { toast } from "react-toastify";
import {
  doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15
} from "../assets/assets";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = '$'
  const [doctors, setDoctors] = useState([]);

  // Map for text ID to Image Asset
  const imageMap = {
    doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15
  };

  const getDoctorsData = async () => {
    try {
      const { data, error } = await supabase.from('doctors').select('*');
      if (error) {
        toast.error(error.message);
        console.error(error);
      } else {
        // Enrich data with actual image assets
        const enrichedData = data.map(doc => ({
          ...doc,
          image: imageMap[doc.image] || doc.image // Use mapped asset or fallback to original string
        }));
        setDoctors(enrichedData);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getDoctorsData();
  }, [])

  const value = {
    doctors,
    currencySymbol,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
