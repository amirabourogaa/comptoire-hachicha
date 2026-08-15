import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];

    for (const file of files) {
      const url = await uploadImage(file);
      if (url) {
        urls.push(url);
      }
    }

    setUploading(false);
    return urls;
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/product-images/');
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      return !error;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  return { uploadImages, deleteImage, uploading };
}
