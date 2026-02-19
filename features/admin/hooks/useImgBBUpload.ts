
import { useState } from 'react';

export const useImgBBUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string> => {
    // Fixed: Used a safer way to access the environment variable to avoid TypeScript errors on ImportMeta
    const apiKey = (import.meta as any).env?.VITE_IMGBB_API_KEY || '';
    if (!apiKey) throw new Error('ImgBB API key is missing');

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error.message || 'Upload failed');

      return result.data.url;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
};
