import { useState } from 'react';
import { fileService } from '../services/fileService'; 

export const useFileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const uuid = await fileService.uploadFile(file);
      return uuid;
    } catch (err: any) {
      setError('Erreur lors de l’upload');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleUpload,
    loading,
    error,
  };
};
