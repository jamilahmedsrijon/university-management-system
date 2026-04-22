import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

const departmentOptions = ["CSE", "EEE", "BBA"];

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (role === "student" && !department) {
      setError("Please select a department.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        role,
        department: role === "student" ? department : null,
      });

      navigate("/login");
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          requestError?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-green-400 to-blue-500">
      <h1 className="text-3xl text-white font-bold mb-6">
        University Management System
      </h1>

      <div className="bg-white p-8 rounded-xl shadow w-[400px]">
        <h2 className="text-xl font-semibold mb-4 text-center">Register</h2>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 mb-3 border rounded"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={loading}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 border rounded"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-3 border rounded"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 mb-3 border rounded"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={loading}
        />

        <select
          className="w-full p-3 mb-3 border rounded"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={loading}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        {role === "student" && (
          <select
            className="w-full p-3 mb-4 border rounded"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            disabled={loading}
          >
            <option value="">Select Department</option>
            {departmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}

export default Register;
