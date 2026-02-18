
import React, { useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          // Attempt to fetch profile but handle errors gracefully (e.g., table missing)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.warn("Profile fetch error - usually means profiles table isn't created yet:", profileError.message);
          }
          
          setAuth(session.user, profile || { id: session.user.id, full_name: 'Auth User', role: 'customer' });
        } else {
          setAuth(null, null);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        setAuth(null, null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          setAuth(session.user, profile || { id: session.user.id, full_name: 'Auth User', role: 'customer' });
        } catch (e) {
          setAuth(session.user, { id: session.user.id, full_name: 'Auth User', role: 'customer' });
        }
      } else {
        setAuth(null, null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth, setLoading]);

  return (
    <>
      {!isConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 p-2 text-center flex items-center justify-center gap-2 text-amber-800 text-xs font-medium sticky top-0 z-[60]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Supabase not configured. Running in UI Preview Mode.</span>
        </div>
      )}
      {children}
    </>
  );
};
