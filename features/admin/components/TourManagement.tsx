import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import TourEditor from "./TourEditor"

interface Tour {
  id: string
  title: string
  image_url?: string
  created_at?: string
}

export default function TourManagement() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setTours(data || [])
    } catch (err: any) {
      console.error("Error fetching tours:", err)
      setError("Failed to load tours.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour)
  }

  const handleBack = () => {
    setSelectedTour(null)
    fetchTours()
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading tours...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (selectedTour) {
    return (
      <div className="p-6">
        <button
          onClick={handleBack}
          className="mb-4 bg-gray-200 px-3 py-1 rounded"
        >
          Back to Inventory
        </button>

        <TourEditor existingTour={selectedTour} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tour Inventory</h1>

      <button
        onClick={() => setSelectedTour({} as Tour)}
        className="mb-6 bg-black text-white px-4 py-2 rounded"
      >
        Add New Tour
      </button>

      {tours.length === 0 ? (
        <p>No tours found.</p>
      ) : (
        <div className="space-y-4">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="font-medium">{tour.title}</h2>
                {tour.image_url && (
                  <img
                    src={tour.image_url}
                    alt={tour.title}
                    className="w-32 mt-2 rounded"
                  />
                )}
              </div>

              <button
                onClick={() => handleEdit(tour)}
                className="bg-gray-800 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
