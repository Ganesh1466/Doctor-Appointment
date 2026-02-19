import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user) {
                try {
                    const { data } = await supabase
                        .from('admins')
                        .select('email')
                        .eq('email', user.email)
                        .maybeSingle(); // Use maybeSingle to avoid 406 if not found

                    setIsAdmin(!!data); // True if record found
                } catch (err) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    const signUp = async (data) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    name: data.options?.data?.name // Extract name from data.options
                }),
            });
            const result = await response.json();

            if (!response.ok) {
                return { data: null, error: { message: result.message || 'Signup failed' } };
            }

            // Backend success
            return { data: { user: result.user }, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const value = {
        signUp,
        signIn: async (data) => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();

                if (!response.ok) {
                    return { data: null, error: { message: result.message || 'Login failed' } };
                }

                // Hydrate the session
                if (result.session) {
                    const { error } = await supabase.auth.setSession(result.session);
                    if (error) throw error;
                    // User is automatically updated via onAuthStateChange
                }

                return { data: { user: result.user, session: result.session }, error: null };
            } catch (error) {
                console.error("Login Error:", error);
                return { data: null, error };
            }
        },
        signOut: () => supabase.auth.signOut(),
        user,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
