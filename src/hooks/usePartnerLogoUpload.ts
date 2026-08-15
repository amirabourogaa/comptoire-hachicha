import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const API_URL = import.meta.env.VITE_API_URL;

export function usePartnerLogoUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadLogo = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const formData = new FormData();
      // formData.append('logo', file);
      // 
      // const response = await fetch(`${API_URL}/api/upload/partner-logo`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: formData
      // });
      // 
      // if (!response.ok) throw new Error('Upload failed');
      // const data = await response.json();
      // return data.url;

      // --- Supabase API (actif) ---
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadLogo, uploading };
}
