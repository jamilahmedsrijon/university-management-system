import { useEffect, useState } from "react";
import api from "../../axios";
import Loader from "../../components/Loader";
import StudentLayout from "../../layouts/StudentLayout";

const images = [
 "https://images.unsplash.com/photo-1562774053-701939374585",
"https://images.unsplash.com/photo-1571260899304-425eee4c7efc",
"https://images.unsplash.com/photo-1607237138185-eedd9c632b0b"
];

const formatLabel = (value) => {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

function StudentDashboard() {
  const [index, setIndex] = useState(0);
  const [summary, setSummary] = useState({
    stats: {
      cgpa: 0,
      fee_status: "not_assigned",
      fee_semester: null,
      status: "active",
    },
    notices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardSummary = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/student/dashboard-summary");

        if (!isMounted) {
          return;
        }

        setSummary({
          stats: response.data?.stats || {
            cgpa: 0,
            fee_status: "not_assigned",
            fee_semester: null,
            status: "active",
          },
          notices: response.data?.notices || [],
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load dashboard data right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StudentLayout title="Dashboard">
      <div className="w-full h-[320px] md:h-[420px] mb-8 rounded-2xl overflow-hidden shadow-xl group relative">
        <img
          src={images[index]}
          alt="University campus"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        <div className="absolute inset-0 bg-black/20" />
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <Loader message="Loading dashboard..." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer">
              <h2 className="text-gray-500 text-sm">CGPA</h2>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {Number(summary.stats.cgpa || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer">
              <h2 className="text-gray-500 text-sm">Fees</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatLabel(summary.stats.fee_status)}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {summary.stats.fee_semester || "No semester assigned"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer">
              <h2 className="text-gray-500 text-sm">Status</h2>
              <p className="text-3xl font-bold text-yellow-500 mt-2">
                {formatLabel(summary.stats.status)}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">
                University Notices
              </h2>

              <span className="text-sm text-blue-500">
                {summary.notices.length} notice
                {summary.notices.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-4">
              {summary.notices.length > 0 ? (
                summary.notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md hover:-translate-y-1 transition duration-300"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                      !
                    </div>

                    <div className="flex-1">
                      <p className="text-gray-700 font-medium">
                        {notice.content}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {notice.time_ago || "Just now"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No notices published yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </StudentLayout>
  );
}

export default StudentDashboard;
