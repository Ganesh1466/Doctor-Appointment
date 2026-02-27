import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { supabase } from '../supabase';
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.email === 'admin@prescripto.com') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const googleLogin = async (e) => {
    e.preventDefault();

    console.log("Google Login Clicked");

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

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Sign Up') {
      // Signup Logic
      const { data, error } = await signUp({ email, password, options: { data: { name } } });

      if (error) {
        toast.error(`Signup Failed: ${error.message}`);
      } else {
        // Custom Toast with OK Button
        const VerificationMsg = ({ closeToast }) => (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Signup successful! Please check your email for verification.</p>
            <button
              onClick={() => {
                setState('Login');
                closeToast();
              }}
              className="mt-2 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-xs px-3 py-1.5 w-fit self-end transition-colors"
            >
              OK
            </button>
          </div>
        );

        toast(<VerificationMsg />, {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        });
        setState('Login');
      }

    } else {
      // Login Logic
      const { data, error } = await signIn({ email, password });

      if (error) {
        toast.error(`Login Failed: ${error.message}`);
      } else {
        toast.success("Login Successful");

        if (email === 'admin@prescripto.com') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full h-screen flex items-center justify-center bg-blue-50">
        <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-blue-900">
            {state === 'Sign Up' ? 'Create Account' : 'Login'}
          </h2>

          <p className="text-sm text-blue-600 mt-1 mb-5">
            Please {state === 'Sign Up' ? 'sign up' : 'login'} to book appointment
          </p>

          {state === 'Sign Up' && (
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

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-4 text-sm"
          />

          <button
            onClick={onSubmitHandler}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm mb-4"
          >
            {state === 'Sign Up' ? 'Sign Up' : 'Login'}
          </button>

          <button
            onClick={googleLogin}
            className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm mb-4 flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <p className="text-blue-700 text-sm">
            {state === 'Sign Up' ? (
              <span
                onClick={() => setState('Login')}
                className="cursor-pointer font-semibold hover:underline"
              >
                Already have an account? Login
              </span>
            ) : (
              <span
                onClick={() => setState('Sign Up')}
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
