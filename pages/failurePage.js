import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";

export default function FailurePage() {
  const router = useRouter();
  const { studentId, examPeriod } = router.query;

  const [message, setMessage] = useState("Checking failed payment...");
  const [countdown, setCountdown] = useState(5); // 5 seconds before redirect

  const startCountdown = useCallback(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/paymentsPage"); // ✅ Redirect destination after failure
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [router]);

  useEffect(() => {
    if (!router.isReady || !studentId || !examPeriod) return;

    console.log("Handling failed payment for:", studentId, examPeriod);

    fetch("/api/payments/failure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, examPeriod }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("❌ Payment marked as failed. Redirecting in 5 seconds...");
          startCountdown();
        } else {
          setMessage("⚠️ Could not update failed payment. Redirecting anyway...");
          startCountdown();
        }
      })
      .catch(() => {
        setMessage("⚠️ Error handling failed payment. Redirecting anyway...");
        startCountdown();
      });
  }, [router.isReady, studentId, examPeriod, startCountdown]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        <div className="text-red-500">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="mt-4 text-lg font-semibold text-red-600">{message}</h1>
        <p className="text-gray-500 mt-2">Redirecting in {countdown} seconds...</p>
      </div>
    </div>
  );
}
