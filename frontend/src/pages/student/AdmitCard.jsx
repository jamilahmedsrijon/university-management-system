import { useEffect, useState } from "react";
import api from "../../axios";
import Loader from "../../components/Loader";
import StudentLayout from "../../layouts/StudentLayout";

const defaultSemesters = ["Spring 2026", "Summer 2026", "Fall 2026"];
const formatText = (value, fallback = "N/A") => value || fallback;

function AdmitCard() {
  const [admitCard, setAdmitCard] = useState(null);
  const [availableSemesters] = useState(defaultSemesters);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemesters[0]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAdmitCardInfo = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admit-card-info", {
          params: {
            semester: selectedSemester,
          },
        });

        if (!isMounted) {
          return;
        }

        setAdmitCard(response.data?.admit_card || null);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setAdmitCard(null);
        setError(
          requestError?.response?.data?.message ||
            "Unable to load admit card information right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAdmitCardInfo();

    return () => {
      isMounted = false;
    };
  }, [selectedSemester]);

  const handleDownload = async () => {
    setDownloading(true);
    setError("");

    try {
      const response = await api.get("/admit-card", {
        params: {
          semester: selectedSemester,
        },
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type: response.headers["content-type"] || "application/pdf",
        })
      );
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = `${selectedSemester}-admit-card.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to download admit card right now."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <StudentLayout title="Admit Card">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Admit Card</h2>
          <p className="text-sm text-gray-500">
            Select a semester to view its paid admit card.
          </p>
        </div>

        <select
          value={selectedSemester}
          onChange={(event) => setSelectedSemester(event.target.value)}
          className="rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {availableSemesters.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border">
          {loading ? (
            <Loader message={`Loading ${selectedSemester} admit card...`} />
          ) : admitCard ? (
            <>
              <div className="text-center border-b pb-4 mb-6">
                <h1 className="text-2xl font-bold text-blue-700">
                  {formatText(admitCard.university, "MY University")}
                </h1>
                <p className="text-gray-500">Official Admit Card</p>
              </div>

              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {formatText(admitCard.student_name)}
                  </p>

                  <p>
                    <span className="font-semibold">Student ID:</span>{" "}
                    {formatText(admitCard.student_id)}
                  </p>

                  <p>
                    <span className="font-semibold">Department:</span>{" "}
                    {formatText(admitCard.department)}
                  </p>

                  <p>
                    <span className="font-semibold">Exam:</span>{" "}
                    {formatText(admitCard.exam)}
                  </p>

                  <p>
                    <span className="font-semibold">Semester:</span>{" "}
                    {formatText(admitCard.semester)}
                  </p>
                </div>

                <div className="w-28 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  Photo
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div className="text-center">
                  <div className="border-t w-32 mx-auto mb-1"></div>
                  <p className="text-sm">Student Signature</p>
                </div>

                <div className="text-center">
                  <div className="border-t w-32 mx-auto mb-1"></div>
                  <p className="text-sm">Controller Signature</p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl shadow hover:scale-105 transition disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-70"
              >
                {downloading
                  ? "Downloading Admit Card..."
                  : "Download Admit Card"}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Admit card is not available for {selectedSemester} yet.
            </p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default AdmitCard;
