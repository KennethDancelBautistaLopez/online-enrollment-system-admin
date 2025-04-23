// /pages/failurePage.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function FailurePage() {
  const router = useRouter();
  const { studentId, examPeriod } = router.query;
  const [message, setMessage] = useState("Checking failed payment...");

  useEffect(() => {
    if (studentId && examPeriod) {
      fetch("/api/payments/failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, examPeriod }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setMessage("❌ Payment marked as failed.");
          else setMessage("⚠️ Could not update failed payment.");
        })
        .catch(() => setMessage("⚠️ Error handling failed payment."));
    }
  }, [studentId, examPeriod]);

  return <h1>{message}</h1>;
}
