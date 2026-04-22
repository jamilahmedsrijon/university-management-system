import { useEffect, useState } from "react";
import api from "../../axios";
import Loader from "../../components/Loader";
import TeacherLayout from "../../layouts/TeacherLayout";

const getGrade = (marks) => {
  const numericMarks = Number(marks);

  if (numericMarks >= 80) return "A+";
  if (numericMarks >= 75) return "A";
  if (numericMarks >= 70) return "A-";
  if (numericMarks >= 65) return "B+";
  if (numericMarks >= 60) return "B";
  if (numericMarks >= 55) return "B-";
  if (numericMarks >= 50) return "C+";
  if (numericMarks >= 45) return "C";
  if (numericMarks >= 40) return "D";
  return "F";
};

function AddResult() {
  const [form, setForm] = useState({
    resultId: "",
    studentId: "",
    subject: "",
    marks: "",
  });
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      setStudentsLoading(true);

      try {
        const response = await api.get("/teacher/students");

        if (!isMounted) {
          return;
        }

        setStudents(response.data?.students || []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load students right now."
        );
      } finally {
        if (isMounted) {
          setStudentsLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.studentId || !form.subject.trim() || !form.marks) {
      setSuccessMessage("");
      setError("Student, subject, and marks are required.");
      return;
    }

    const numericMarks = Number(form.marks);

    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      setSuccessMessage("");
      setError("Marks must be between 0 and 100.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    const payload = {
      student_id: Number(form.studentId),
      subject: form.subject.trim(),
      marks: numericMarks,
    };

    try {
      const response = form.resultId
        ? await api.put(`/results/${form.resultId}`, payload)
        : await api.post("/results", payload);

      setSuccessMessage(
        response.data?.message ||
          (form.resultId
            ? "Result updated successfully."
            : "Result submitted successfully.")
      );

      setForm({
        resultId: "",
        studentId: "",
        subject: "",
        marks: "",
      });
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          requestError?.response?.data?.message ||
          "Unable to save result right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(form.resultId);

  return (
    <TeacherLayout title="Add Result">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-700">
          {isEditing ? "Update Student Result" : "Add Student Result"}
        </h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {successMessage && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <input
          type="number"
          name="resultId"
          placeholder="Result ID (only for update)"
          value={form.resultId}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
          min="1"
        />

        {studentsLoading ? (
          <div className="rounded-lg border">
            <Loader message="Loading students..." />
          </div>
        ) : (
          <select
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
            required
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.id})
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          name="subject"
          placeholder="Enter Subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
          required
        />

        <input
          type="number"
          name="marks"
          placeholder="Enter Marks"
          value={form.marks}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
          min="0"
          max="100"
          required
        />

        {form.marks && (
          <div className="bg-purple-50 p-3 rounded-lg text-purple-700">
            Grade: <span className="font-bold">{getGrade(form.marks)}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || studentsLoading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 hover:scale-105 transition disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-70"
        >
          {loading
            ? "Saving Result..."
            : isEditing
            ? "Update Result"
            : "Submit Result"}
        </button>
      </form>
    </TeacherLayout>
  );
}

export default AddResult;
