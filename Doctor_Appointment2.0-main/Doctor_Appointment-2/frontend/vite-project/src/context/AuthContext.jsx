import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Initialize auth session
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Get session once
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    console.error("Auth Session Error:", error.message);
                    if (
                        error.message.includes("Refresh Token Not Found") ||
                        error.message.includes("invalid refresh token")
                    ) {
                        await supabase.auth.signOut();
                    }
                }

                setUser(session?.user ?? null);
            } catch (err) {
                console.error("Unexpected auth error during init:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (mounted) {
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Check if user is admin
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                if (!user) {
                    setIsAdmin(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("admins")
                    .select("email")
                    .eq("email", user.email)
                    .maybeSingle();

                if (error) throw error;

                setIsAdmin(!!data);
            } catch (error) {
                console.error("Admin check error:", error.message);
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, [user]);

    // SIGNUP
    const signUp = async ({ email, password, name }) => {
        try {
            if (!email || !password || !name) {
                return {
                    data: null,
                    error: { message: "All fields are required" }
                };
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
            const response = await fetch(
                `${backendUrl}/api/auth/signup`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name })
                }
            );

            const result = await response.json().catch(() => ({ message: 'Invalid response from server' }));

            if (!response.ok || result.success === false) {
                return {
                    data: null,
                    error: { message: result.error || result.message || "Signup failed" }
                };
            }

            if (!result.user) {
                return { data: null, error: { message: 'Signup succeeded but no user data returned' } };
            }

            return { data: result, error: null };
        } catch (error) {
            console.error("Signup Error:", error);
            return {
                data: null,
                error: { message: "Unable to connect to server" }
            };
        }
    };

    // LOGIN
    const signIn = async ({ email, password }) => {
        try {
            if (!email || !password) {
                return {
                    data: null,
                    error: { message: "Email and password required" }
                };
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
            const response = await fetch(
                `${backendUrl}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                }
            );

            const result = await response.json().catch(() => ({ message: 'Invalid response from server' }));

            if (!response.ok || result.success === false) {
                return {
                    data: null,
                    error: { message: result.error || result.message || "Login failed" }
                };
            }

            if (result.session) {
                const { error } = await supabase.auth.setSession(result.session);
                if (error) throw error;
            }

            return { data: result, error: null };
        } catch (error) {
            console.error("Login Error:", error);
            return {
                data: null,
                error: { message: "Unable to connect to server" }
            };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error("Logout Error:", error.message);
        }
    };

    const value = {
        user,
        isAdmin,
        signUp,
        signIn,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);