
// Helper to safely access environment variables in Vite/TypeScript environment
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return (import.meta.env && import.meta.env[key]) || (process.env && process.env[key]) || '';
  } catch {
    return '';
  }
};

export const uploadToImgBB = async (file: File): Promise<string> => {
  const apiKey = getEnv('VITE_IMGBB_API_KEY');
  if (!apiKey) throw new Error('VITE_IMGBB_API_KEY is missing');
  
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (result.success) {
    return result.data.url;
  }
  throw new Error('ImgBB Upload Failed');
};
export const uploadToImgBB = async (file: File) => {
  const formData = new FormData()
  formData.append("image", file)

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await response.json()

  if (!data.success) {
    throw new Error("Upload failed")
  }

  return data.data.url
}
