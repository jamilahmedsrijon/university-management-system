import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, {
  clearAuthStorage,
  getDefaultRouteForRole,
  getStoredRole,
  getStoredToken,
} from "../axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const role = getStoredRole();

    if (token && role) {
      navigate(getDefaultRouteForRole(role), { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      if (!token || !user?.role) {
        throw new Error("Invalid login response.");
      }

      clearAuthStorage();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          requestError?.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-cyan-400">
      <h1 className="text-4xl font-bold text-white mb-6">
        University Management System
      </h1>

      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-2xl shadow-xl w-[400px]"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
          Login
        </h2>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 hover:scale-105 transition disabled:cursor-not-allowed disabled:hover:scale-100 disabled:bg-blue-300"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p
          className="text-center text-sm text-gray-500 mt-4 cursor-pointer hover:text-blue-600"
          onClick={() => navigate("/register")}
        >
          Create new account
        </p>
      </form>
    </div>
  );
}

export default Login;
