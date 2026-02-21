export const uploadToImgBB = async (file: File): Promise<string> => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY

  if (!apiKey) {
    throw new Error("ImgBB API key not found")
  }

  const formData = new FormData()
  formData.append("image", file)

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await response.json()

  if (!data.success) {
    console.error("ImgBB Error:", data)
    throw new Error("ImgBB Upload Failed")
  }

  return data.data.url
}
