import { useState } from "react"
import { uploadToImgBB } from "../../../lib/imgbb"
import { useTourForm } from "../hooks/useTourForm"
import { useTourMutation } from "../hooks/useTourMutation"

export default function TourEditor() {
  const { form, setForm } = useTourForm()
  const { saveTour } = useTourMutation()

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Image Upload Handler (ImgBB)
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const imageUrl = await uploadToImgBB(file)

      setForm(prev => ({
        ...prev,
        image_url: imageUrl
      }))
    } catch (err: any) {
      console.error("Image upload failed:", err)
      setError("Image upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    await handleImageUpload(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveTour(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div>
        <label className="block mb-1 font-medium">Tour Title</label>
        <input
          type="text"
          value={form.title || ""}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              title: e.target.value
            }))
          }
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          value={form.description || ""}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              description: e.target.value
            }))
          }
          className="w-full border rounded px-3 py-2"
          rows={4}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block mb-1 font-medium">Tour Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {uploading && (
          <p className="text-sm text-gray-500 mt-2">
            Uploading image...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-2">
            {error}
          </p>
        )}

        {form.image_url && (
          <div className="mt-3">
            <img
              src={form.image_url}
              alt="Tour preview"
              className="w-64 rounded shadow"
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save Tour
        </button>
      </div>

    </form>
  )
}
