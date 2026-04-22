import { useEffect, useState } from "react";
import api from "../../axios";
import Loader from "../../components/Loader";
import StudentLayout from "../../layouts/StudentLayout";

const paymentMethods = [
  { label: "Bank", value: "bank" },
  { label: "Mobile Banking", value: "mobile" },
  { label: "Card", value: "card" },
];
const defaultSemesters = ["Spring 2026", "Summer 2026", "Fall 2026"];

const formatAmount = (amount) =>
  `BDT ${new Intl.NumberFormat("en-US").format(Number(amount || 0))}`;

function Fees() {
  const [fee, setFee] = useState(null);
  const [availableSemesters, setAvailableSemesters] = useState(defaultSemesters);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemesters[0]);
  const [selectedMethod, setSelectedMethod] = useState("bank");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchFee = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/my-fee", {
          params: {
            semester: selectedSemester,
          },
        });

        if (!isMounted) {
          return;
        }

        setFee(response.data?.fee || null);
        setAvailableSemesters(
          response.data?.available_semesters?.length
            ? response.data.available_semesters
            : defaultSemesters
        );
        setSelectedSemester(
          response.data?.selected_semester || selectedSemester
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load your fee information right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFee();

    return () => {
      isMounted = false;
    };
  }, [selectedSemester]);

  const handlePayNow = async () => {
    if (!fee?.id) {
      return;
    }

    setPaying(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post(`/pay-fee/${fee.id}`, {
        payment_method: selectedMethod,
      });

      setFee(response.data?.data || fee);
      setSuccessMessage(
        response.data?.message ||
          `Payment successful for ${selectedSemester}.`
      );
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          requestError?.response?.data?.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!fee?.id) {
      return;
    }

    setDownloadingReceipt(true);
    setError("");

    try {
      const response = await api.get(`/receipt/${fee.id}`, {
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type: response.headers["content-type"] || "application/pdf",
        })
      );
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = `${selectedSemester}-receipt.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to download receipt right now."
      );
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const isPaid = fee?.status === "paid";

  return (
    <StudentLayout title="Fees Management">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Semester Fees
          </h2>
          <p className="text-sm text-gray-500">
            Select a semester to view and pay your assigned fee.
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

      {successMessage && (
        <div className="mb-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 shadow">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg">
          <Loader message={`Loading ${selectedSemester} fee details...`} />
        </div>
      ) : !fee ? (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Semester Fee
          </h2>
          <p className="text-gray-500">
            No fee has been assigned for {selectedSemester} yet.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Semester Fee
            </h2>

            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatAmount(fee.amount)}
                </p>
                <p className="mt-2 text-sm text-gray-500">{fee.semester}</p>
              </div>

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold shadow ${
                  isPaid
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </div>

          {!isPaid && (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold mb-6 text-gray-700">
                Choose Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    type="button"
                    key={method.value}
                    onClick={() => setSelectedMethod(method.value)}
                    className={`p-5 rounded-xl border shadow hover:shadow-xl hover:-translate-y-1 transition cursor-pointer bg-gradient-to-br from-gray-50 to-white text-left ${
                      selectedMethod === method.value
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-700">
                      {method.label}
                    </h3>
                  </button>
                ))}
              </div>

              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl shadow hover:scale-105 transition disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-70"
              >
                {paying ? "Processing Payment..." : `Pay ${selectedSemester}`}
              </button>
            </div>
          )}

          {isPaid && (
            <div className="bg-green-50 text-green-700 p-6 rounded-2xl shadow text-center">
              <h2 className="text-xl font-semibold">Payment Successful</h2>
              <button
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {downloadingReceipt
                  ? "Downloading Receipt..."
                  : "Download Receipt"}
              </button>
            </div>
          )}
        </>
      )}
    </StudentLayout>
  );
}

export default Fees;
