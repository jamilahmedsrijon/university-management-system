import { useEffect, useState } from "react";
import api, { getStoredUser } from "../../axios";
import Loader from "../../components/Loader";
import StudentLayout from "../../layouts/StudentLayout";

const defaultAvatar = "https://i.pravatar.cc/150?img=3";

const mapUserToProfile = (user) => ({
  name: user?.name || "Student Name",
  id: user?.id ?? "N/A",
  email: user?.email || "Not provided",
  phone: user?.phone || "",
  department: user?.department || "Not provided",
  session: user?.session || "Not provided",
  address: user?.address || "",
  cgpa: user?.cgpa ?? "N/A",
  status: user?.status || "Active",
  role: user?.role || "student",
  image: user?.profile_photo_url || user?.image || defaultAvatar,
});

const formatRole = (role) =>
  role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : "Unknown";

const formatText = (value, fallback = "Not provided") => value || fallback;

function Profile() {
  const [edit, setEdit] = useState(false);
  const [student, setStudent] = useState(() =>
    mapUserToProfile(getStoredUser())
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/profile");

        if (!isMounted) {
          return;
        }

        const nextProfile = mapUserToProfile(response.data?.user);
        setStudent(nextProfile);
        localStorage.setItem("user", JSON.stringify(response.data?.user));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        const fallbackUser = getStoredUser();

        if (fallbackUser) {
          setStudent(mapUserToProfile(fallbackUser));
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load your profile right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name !== "phone" && name !== "address") {
      return;
    }

    setStudent((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  };

  const handleImage = (event) => {
    const file = event.target.files[0];

    if (file) {
      setPhotoFile(file);
      setStudent((currentProfile) => ({
        ...currentProfile,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleProfileAction = async () => {
    if (!edit) {
      setEdit(true);
      setError("");
      setSuccessMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      formData.append("phone", student.phone || "");
      formData.append("address", student.address || "");

      if (photoFile) {
        formData.append("profile_photo", photoFile);
      }

      const response = await api.post("/profile", formData);
      const nextProfile = mapUserToProfile(response.data?.user);

      setStudent(nextProfile);
      setPhotoFile(null);
      setEdit(false);
      setSuccessMessage(
        response.data?.message || "Profile updated successfully."
      );
      localStorage.setItem("user", JSON.stringify(response.data?.user));
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          requestError?.response?.data?.message ||
          "Unable to update profile right now."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="My Profile">
        <div className="bg-white rounded-2xl shadow-lg">
          <Loader message="Loading profile..." />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="My Profile">
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 shadow">
          {successMessage}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-xl transition">
        <div className="relative group">
          <img
            src={student.image}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow"
          />

          {edit && (
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 cursor-pointer transition rounded-full">
              Change
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />
            </label>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
          <p className="text-gray-500">ID: {student.id}</p>
          <p className="text-gray-500">Role: {formatRole(student.role)}</p>
          <p className="text-gray-500">{student.department}</p>

          <span className="inline-block mt-2 px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
            {student.status}
          </span>
        </div>

        <button
          onClick={handleProfileAction}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-70"
        >
          {saving ? "Saving..." : edit ? "Save" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Personal Information
          </h2>

          <div className="space-y-3 text-gray-600">
            <div>
              <label className="font-medium">Email:</label>
              <p>{student.email}</p>
            </div>

            <div>
              <label className="font-medium">Phone:</label>
              {edit ? (
                <input
                  name="phone"
                  value={student.phone}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                />
              ) : (
                <p>{formatText(student.phone)}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Address:</label>
              {edit ? (
                <textarea
                  name="address"
                  value={student.address}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  rows="3"
                />
              ) : (
                <p>{formatText(student.address)}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Session:</label>
              <p>{formatText(student.session)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Academic Overview
          </h2>

          <div className="space-y-3 text-gray-600">
            <div>
              <label className="font-medium">Department:</label>
              <p>{formatText(student.department)}</p>
            </div>

            <div>
              <label className="font-medium">CGPA:</label>
              <p>{formatText(student.cgpa, "N/A")}</p>
            </div>

            <div>
              <label className="font-medium">Status:</label>
              <p>{formatText(student.status, "Active")}</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default Profile;
