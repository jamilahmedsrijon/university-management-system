import { useEffect, useState } from "react";
import api from "../../axios";
import Loader from "../../components/Loader";
import TeacherLayout from "../../layouts/TeacherLayout";

function Notices() {
  const [text, setText] = useState("");
  const [notices, setNotices] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchNotices = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/notices");

        if (!isMounted) {
          return;
        }

        setNotices(response.data?.notices || []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load notices right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotices();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setSuccessMessage("");
      setError("Please write a notice first.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = editId
        ? await api.put(`/notices/${editId}`, { content: text.trim() })
        : await api.post("/notices", { content: text.trim() });

      const savedNotice = response.data?.notice;

      if (editId) {
        setNotices((currentNotices) =>
          currentNotices.map((notice) =>
            notice.id === editId ? savedNotice : notice
          )
        );
      } else {
        setNotices((currentNotices) => [savedNotice, ...currentNotices]);
      }

      setSuccessMessage(
        response.data?.message ||
          (editId ? "Notice updated successfully." : "Notice published.")
      );
      setText("");
      setEditId(null);
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          requestError?.response?.data?.message ||
          "Unable to save notice right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.delete(`/notices/${id}`);

      setNotices((currentNotices) =>
        currentNotices.filter((notice) => notice.id !== id)
      );
      setSuccessMessage(response.data?.message || "Notice deleted.");

      if (editId === id) {
        setEditId(null);
        setText("");
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to delete notice right now."
      );
    }
  };

  const handleEdit = (notice) => {
    setText(notice.content);
    setEditId(notice.id);
    setError("");
    setSuccessMessage("");
  };

  return (
    <TeacherLayout title="Notices">
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editId ? "Edit Notice" : "Create Notice"}
        </h2>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="mb-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write notice..."
          className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-purple-400"
          rows="4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting
            ? editId
              ? "Updating..."
              : "Publishing..."
            : editId
            ? "Update"
            : "Publish"}
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow">
          <Loader message="Loading notices..." />
        </div>
      ) : (
        <div className="space-y-4">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition flex justify-between items-center gap-4"
              >
                <div>
                  <p className="text-gray-700">{notice.content}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {notice.author ? `${notice.author} - ` : ""}
                    {notice.time_ago || "Just now"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-5 rounded-2xl shadow text-sm text-gray-500">
              No notices available yet.
            </div>
          )}
        </div>
      )}
    </TeacherLayout>
  );
}

export default Notices;
