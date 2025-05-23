import React from "react"
import { useState, useEffect } from "react"
import { Plus, Save, MessageSquare } from "lucide-react"
import Table from "../common/Table"
import Modal from "../common/Modal"
import FormField from "../common/FormField"

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([])
  const [faculties, setFaculties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    publish_date: "",
    expiry_date: "",
    category: "",
    faculty_id: "",
    is_featured: false,
    status: "draft",
  })

  // Get auth token from local storage
  const getAuthToken = () => {
    return localStorage.getItem("token")
  }

  // Create headers with auth token
  const createHeaders = (includeContentType = true) => {
    const token = getAuthToken()
    const headers = {
      Authorization: token ? `Bearer ${token}` : "",
    }

    if (includeContentType) {
      headers["Content-Type"] = "application/json"
    }

    return headers
  }

  // Fetch announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://127.0.0.1:4400/api/v1/announcement/", {
          headers: createHeaders(),
        })
        const data = await response.json()
        console.log("API Response:", data)

        if (data.success && data.data) {
          setAnnouncements(data.data)
        } else {
          console.error("Unexpected API response structure:", data)
          setAnnouncements([])
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
        setAnnouncements([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Fetch faculties from API
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch("http://127.0.0.1:4400/api/v1/faculty/", {
          headers: createHeaders(),
        })
        const data = await response.json()
        console.log("Faculty API Response:", data)

        if (data.status === "success" && data.data && data.data.faculties) {
          setFaculties(data.data.faculties)
        } else {
          console.error("Unexpected faculty API response structure:", data)
          setFaculties([])
        }
      } catch (error) {
        console.error("Error fetching faculties:", error)
        setFaculties([])
      }
    }

    fetchFaculties()
  }, [])

  // Table columns configuration
  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-3">
            <MessageSquare size={16} />
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.title}</p>
            <p className="text-xs text-gray-500">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Publish Date",
      accessor: "publish_date",
      render: (row) => formatDate(row.publish_date),
    },
    {
      header: "Expiry Date",
      accessor: "expiry_date",
      render: (row) => formatDate(row.expiry_date),
    },
    {
      header: "Featured",
      accessor: "is_featured",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.is_featured ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.is_featured ? "Featured" : "Regular"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "published"
              ? "bg-green-100 text-green-800"
              : row.status === "draft"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleAddAnnouncement = async () => {
    try {
      const response = await fetch("http://127.0.0.1:4400/api/v1/announcement/", {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the announcements list
        const refreshResponse = await fetch("http://127.0.0.1:4400/api/v1/announcement/", {
          headers: createHeaders(),
        })
        const refreshData = await refreshResponse.json()

        if (refreshData.success && refreshData.data) {
          setAnnouncements(refreshData.data)
        }

        setIsAddModalOpen(false)
        resetForm()
      } else {
        console.error("Error adding announcement:", data)
        alert("Failed to add announcement. Please try again.")
      }
    } catch (error) {
      console.error("Error adding announcement:", error)
      alert("Failed to add announcement. Please try again.")
    }
  }

  const handleEditAnnouncement = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:4400/api/v1/announcement/${currentAnnouncement._id}`, {
        method: "PATCH",
        headers: createHeaders(),
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the announcements list
        const refreshResponse = await fetch("http://127.0.0.1:4400/api/v1/announcement/", {
          headers: createHeaders(),
        })
        const refreshData = await refreshResponse.json()

        if (refreshData.success && refreshData.data) {
          setAnnouncements(refreshData.data)
        }

        setIsEditModalOpen(false)
        resetForm()
      } else {
        console.error("Error updating announcement:", data)
        alert("Failed to update announcement. Please try again.")
      }
    } catch (error) {
      console.error("Error updating announcement:", error)
      alert("Failed to update announcement. Please try again.")
    }
  }

  const handleDeleteAnnouncement = async (announcement) => {
    if (window.confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      try {
        const response = await fetch(`http://127.0.0.1:4400/api/v1/announcement/${announcement._id}`, {
          method: "DELETE",
          headers: createHeaders(),
        })

        const data = await response.json()

        if (data.success) {
          // Refresh the announcements list
          const refreshResponse = await fetch("http://127.0.0.1:4400/api/v1/announcement/", {
            headers: createHeaders(),
          })
          const refreshData = await refreshResponse.json()

          if (refreshData.success && refreshData.data) {
            setAnnouncements(refreshData.data)
          } else {
            // If refresh fails, just remove the deleted item from the current state
            setAnnouncements(announcements.filter((a) => a._id !== announcement._id))
          }
        } else {
          console.error("Error deleting announcement:", data)
          alert("Failed to delete announcement. Please try again.")
        }
      } catch (error) {
        console.error("Error deleting announcement:", error)
        alert("Failed to delete announcement. Please try again.")
      }
    }
  }

  const openEditModal = (announcement) => {
    setCurrentAnnouncement(announcement)
    setFormData({
      title: announcement.title || "",
      content: announcement.content || "",
      publish_date: announcement.publish_date || "",
      expiry_date: announcement.expiry_date || "",
      category: announcement.category || "",
      faculty_id: announcement.faculty_id || "",
      is_featured: announcement.is_featured || false,
      status: announcement.status || "draft",
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (announcement) => {
    setCurrentAnnouncement(announcement)
    setIsViewModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      publish_date: "",
      expiry_date: "",
      category: "",
      faculty_id: "",
      is_featured: false,
      status: "draft",
    })
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format date for input field
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  // Get faculty name by ID
  const getFacultyNameById = (id) => {
    const faculty = faculties.find((f) => f._id === id)
    return faculty ? faculty.name : `Faculty ID: ${id}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Announcement Management</h2>
        <button
          className="flex items-center px-4 py-2 bg-[#004B87] text-white rounded-md hover:bg-[#003a6a] transition-colors"
          onClick={() => {
            resetForm()
            setIsAddModalOpen(true)
          }}
        >
          <Plus size={18} className="mr-2" />
          Add New Announcement
        </button>
      </div>

      {/* Announcement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-[#004B87] bg-opacity-10 flex items-center justify-center mr-4">
            <span className="text-[#004B87] font-bold">{announcements.length}</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Announcements</p>
            <p className="text-lg font-semibold text-gray-800">{announcements.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-[#F4B400] bg-opacity-10 flex items-center justify-center mr-4">
            <span className="text-[#F4B400] font-bold">{announcements.filter((item) => item.is_featured).length}</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Featured Items</p>
            <p className="text-lg font-semibold text-gray-800">{announcements.filter((item) => item.is_featured).length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-500 bg-opacity-10 flex items-center justify-center mr-4">
            <span className="text-green-500 font-bold">{new Set(announcements.map((item) => item.category)).size}</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Categories</p>
            <p className="text-lg font-semibold text-gray-800">{new Set(announcements.map((item) => item.category)).size}</p>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p>Loading announcements...</p>
        </div>
      ) : announcements.length > 0 ? (
        <Table
          columns={columns}
          data={announcements}
          actions={true}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={handleDeleteAnnouncement}
        />
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p>No announcements found. Add your first announcement.</p>
        </div>
      )}

      {/* Add Announcement Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Announcement">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAddAnnouncement()
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            <FormField label="Title" name="title" value={formData.title} onChange={handleInputChange} required />
            <FormField
              label="Content"
              name="content"
              type="textarea"
              value={formData.content}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Publish Date"
                name="publish_date"
                type="datetime-local"
                value={formData.publish_date ? formatDateForInput(formData.publish_date) : ""}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Expiry Date"
                name="expiry_date"
                type="datetime-local"
                value={formData.expiry_date ? formatDateForInput(formData.expiry_date) : ""}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Category"
                name="category"
                type="select"
                value={formData.category}
                onChange={handleInputChange}
                options={[
                  { value: "academic", label: "Academic" },
                  { value: "workshop", label: "Workshop" },
                  { value: "seminar", label: "Seminar" },
                  { value: "other", label: "Other" },
                ]}
                required
              />
              <FormField
                label="Faculty"
                name="faculty_id"
                type="select"
                value={formData.faculty_id}
                onChange={handleInputChange}
                options={faculties.map((faculty) => ({
                  value: faculty._id,
                  label: faculty.name,
                }))}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#004B87] focus:ring-[#004B87] border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                Feature this announcement
              </label>
            </div>
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              required
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004B87] text-white rounded-md hover:bg-[#003a6a] transition-colors"
            >
              <Save size={18} className="inline mr-2" />
              Save Announcement
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Announcement">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleEditAnnouncement()
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            <FormField label="Title" name="title" value={formData.title} onChange={handleInputChange} required />
            <FormField
              label="Content"
              name="content"
              type="textarea"
              value={formData.content}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Publish Date"
                name="publish_date"
                type="datetime-local"
                value={formData.publish_date ? formatDateForInput(formData.publish_date) : ""}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Expiry Date"
                name="expiry_date"
                type="datetime-local"
                value={formData.expiry_date ? formatDateForInput(formData.expiry_date) : ""}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Category"
                name="category"
                type="select"
                value={formData.category}
                onChange={handleInputChange}
                options={[
                  { value: "academic", label: "Academic" },
                  { value: "workshop", label: "Workshop" },
                  { value: "seminar", label: "Seminar" },
                  { value: "other", label: "Other" },
                ]}
                required
              />
              <FormField
                label="Faculty"
                name="faculty_id"
                type="select"
                value={formData.faculty_id}
                onChange={handleInputChange}
                options={faculties.map((faculty) => ({
                  value: faculty._id,
                  label: faculty.name,
                }))}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured_edit"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#004B87] focus:ring-[#004B87] border-gray-300 rounded"
              />
              <label htmlFor="is_featured_edit" className="text-sm font-medium text-gray-700">
                Feature this announcement
              </label>
            </div>
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              required
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004B87] text-white rounded-md hover:bg-[#003a6a] transition-colors"
            >
              <Save size={18} className="inline mr-2" />
              Update Announcement
            </button>
          </div>
        </form>
      </Modal>

      {/* View Announcement Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Announcement Details" size="lg">
        {currentAnnouncement && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentAnnouncement.title}</h3>
                {currentAnnouncement.is_featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Featured</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    currentAnnouncement.category === "academic"
                      ? "bg-blue-100 text-blue-800"
                      : currentAnnouncement.category === "workshop"
                        ? "bg-green-100 text-green-800"
                        : currentAnnouncement.category === "seminar"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {currentAnnouncement.category.charAt(0).toUpperCase() + currentAnnouncement.category.slice(1)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    currentAnnouncement.status === "published"
                      ? "bg-green-100 text-green-800"
                      : currentAnnouncement.status === "draft"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {currentAnnouncement.status.charAt(0).toUpperCase() + currentAnnouncement.status.slice(1)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Content</h4>
              <div className="bg-white border border-gray-200 p-6 rounded-md">
                <p className="text-gray-700 whitespace-pre-line">{currentAnnouncement.content}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">Publication Period</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Publish Date</p>
                  <p className="text-gray-800 mb-2">{formatDate(currentAnnouncement.publish_date)}</p>
                  <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                  <p className="text-gray-800">{formatDate(currentAnnouncement.expiry_date)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">Faculty</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800">{getFacultyNameById(currentAnnouncement.faculty_id)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AnnouncementManagement
