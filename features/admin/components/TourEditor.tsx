import { useEffect, useState } from "react"
import { uploadToImgBB } from "../../../lib/imgbb"
import { supabase } from "../../../lib/supabase"

interface Props {
  existingTour?: any
}

export default function TourEditor({ existingTour }: Props) {
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    image_url: ""
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existingTour && existingTour.id) {
      setForm(existingTour)
    }
  }, [existingTour])

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const imageUrl = await uploadToImgBB(file)

      setForm(prev => ({
        ...prev,
        image_url: imageUrl
      }))
    } catch (err) {
      console.error(err)
      alert("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      if (form.id) {
        await supabase
          .from("tours")
          .update(form)
          .eq("id", form.id)
      } else {
        await supabase
          .from("tours")
          .insert([form])
      }

      alert("Tour saved successfully")
    } catch (err) {
      console.error(err)
      alert("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div>
        <label className="block mb-1">Title</label>
        <input
          type="text"
          value={form.title || ""}
          onChange={(e) =>
            setForm(prev => ({ ...prev, title: e.target.value }))
          }
          className="border w-full px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <textarea
          value={form.description || ""}
          onChange={(e) =>
            setForm(prev => ({ ...prev, description: e.target.value }))
          }
          className="border w-full px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1">Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files) return
            handleImageUpload(e.target.files[0])
          }}
        />

        {uploading && <p>Uploading...</p>}

        {form.image_url && (
          <img
            src={form.image_url}
            alt="Preview"
            className="w-48 mt-3 rounded"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Tour"}
      </button>

    </form>
  )
}
