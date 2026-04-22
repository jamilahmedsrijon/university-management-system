import { useEffect, useState } from "react";
import api from "../../axios";
import Loader from "../../components/Loader";
import StudentLayout from "../../layouts/StudentLayout";

function MyResults() {
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/my-results");

        if (!isMounted) {
          return;
        }

        setResults(response.data?.results || []);
        setCgpa(
          typeof response.data?.cgpa === "number"
            ? response.data.cgpa.toFixed(2)
            : "0.00"
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load your results right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StudentLayout title="My Results">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Result Overview
        </h2>

        {loading ? (
          <Loader message="Loading results..." />
        ) : error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="p-3">Subject</th>
                <th className="p-3">Marks</th>
                <th className="p-3">Grade</th>
              </tr>
            </thead>

            <tbody>
              {results.length > 0 ? (
                results.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{result.subject}</td>
                    <td className="p-3">{result.marks}</td>

                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {result.grade || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No results found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-2xl shadow text-center">
        <h2 className="text-lg opacity-90">CGPA</h2>
        <p className="text-4xl font-bold mt-2">{cgpa}</p>
      </div>
    </StudentLayout>
  );
}

export default MyResults;
