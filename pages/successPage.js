import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();
  const { studentId, examPeriod } = router.query;
  const [status, setStatus] = useState("processing"); // "processing", "success", "error"
  const [countdown, setCountdown] = useState(5); // Start at 5 seconds

  useEffect(() => {
    if (!router.isReady || !studentId || !examPeriod) return;

    console.log("Confirming payment for:", studentId, examPeriod);

    fetch("/api/payments/success", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, examPeriod }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");

          // Start countdown
          const interval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                router.replace("/paymentsPage");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [router.isReady, studentId, examPeriod]);

  const handleRedirectNow = () => {
    router.replace("/paymentsPage");
  };

  const renderContent = () => {
    if (status === "processing") {
      return (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <h2 className="mt-4 text-lg font-semibold text-gray-700">Processing your payment...</h2>
        </>
      );
    }

    if (status === "success") {
      return (
        <>
          <div className="text-green-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-green-600">✅ Payment confirmed successfully!</h2>
          <p className="text-gray-500 mt-2">
            Redirecting to Payment Page in {countdown} second{countdown !== 1 && "s"}...
          </p>

          <button
            onClick={handleRedirectNow}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            Go to Payment Page now
          </button>
        </>
      );
    }

    if (status === "error") {
      return (
        <>
          <div className="text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-red-600">⚠️ Error confirming payment.</h2>
          <p className="text-gray-500 mt-2">Please contact support if this persists.</p>
        </>
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        {renderContent()}
      </div>
    </div>
  );
}
