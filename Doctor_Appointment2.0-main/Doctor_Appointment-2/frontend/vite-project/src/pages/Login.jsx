import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../supabase";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const ADMIN_EMAIL = "admin1466@gmail.com";

  useEffect(() => {
    if (user) {
      if (user.email === ADMIN_EMAIL) {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    if (state === "Sign Up" && !name) {
      toast.error("Name is required");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (state === "Sign Up") {
        // Signup Logic
        const { error } = await signUp({ email, password, name });

        if (error) {
          toast.error(`Signup Failed: ${error.message}`);
        } else {
          toast.success("Signup successful! Please check your email to verify your account before logging in.");
          setState("Login");
        }
      } else {
        // Login Logic
        const { error } = await signIn({ email, password });

        if (error) {
          toast.error(`Login Failed: ${error.message}`);
        } else {
          toast.success("Login Successful");
          if (email === ADMIN_EMAIL) {
            navigate("/admin-dashboard");
          } else {
            navigate("/");
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (e) => {
    if (e) e.preventDefault();

    try {
      let redirectUrl = window.location.origin;
      // Use main production URL for Vercel deployments to ensure Google OAuth callback matches
      if (redirectUrl.includes("vercel.app")) {
        redirectUrl = "https://doctor-appointment-nine-phi.vercel.app";
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl }
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full h-screen flex items-center justify-center bg-blue-50">
        <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-blue-900">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </h2>

          <p className="text-sm text-blue-600 mt-1 mb-5">
            Please {state === "Sign Up" ? "sign up" : "login"} to book appointment
          </p>

          <form onSubmit={onSubmitHandler}>
            {state === "Sign Up" && (
              <input
                type="text"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-3 text-sm"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-3 text-sm"
            />

            <div className="relative w-full mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none text-sm pr-12"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm mb-4 disabled:bg-blue-300"
            >
              {loading ? "Processing..." : state}
            </button>
          </form>

          <button
            onClick={googleLogin}
            className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm mb-4 flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <p className="text-blue-700 text-sm">
            {state === "Sign Up" ? (
              <span
                onClick={() => setState("Login")}
                className="cursor-pointer font-semibold hover:underline"
              >
                Already have an account? Login
              </span>
            ) : (
              <span
                onClick={() => setState("Sign Up")}
                className="cursor-pointer font-semibold hover:underline"
              >
                Create an account
              </span>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;