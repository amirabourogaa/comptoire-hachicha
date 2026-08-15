import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface VendorInfo {
  id: string;
  name: string;
  email: string;
  logo_url: string | null;
}

interface VendorAuthContextType {
  user: User | null;
  session: Session | null;
  vendorInfo: VendorInfo | null;
  isLoading: boolean;
  isVendor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

export function VendorAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVendor, setIsVendor] = useState(false);

  const fetchVendorInfo = async (userId: string) => {
    try {
      // Check if user is a vendor
      const { data: vendorRole } = await supabase
        .from('vendor_roles')
        .select('vendor_id')
        .eq('user_id', userId)
        .single();

      if (vendorRole?.vendor_id) {
        setIsVendor(true);
        
        // Fetch vendor details
        const { data: vendor } = await supabase
          .from('vendors')
          .select('id, name, email, logo_url')
          .eq('id', vendorRole.vendor_id)
          .single();

        if (vendor) {
          setVendorInfo(vendor);
        }
      } else {
        setIsVendor(false);
        setVendorInfo(null);
      }
    } catch (error) {
      console.error('Error fetching vendor info:', error);
      setIsVendor(false);
      setVendorInfo(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer vendor info fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchVendorInfo(session.user.id);
          }, 0);
        } else {
          setIsVendor(false);
          setVendorInfo(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchVendorInfo(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setVendorInfo(null);
    setIsVendor(false);
  };

  return (
    <VendorAuthContext.Provider
      value={{
        user,
        session,
        vendorInfo,
        isLoading,
        isVendor,
        signIn,
        signOut,
      }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
}

export function useVendorAuth() {
  const context = useContext(VendorAuthContext);
  if (context === undefined) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
}
