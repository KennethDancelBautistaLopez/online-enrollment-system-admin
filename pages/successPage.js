// /pages/successPage.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();
  const { studentId, examPeriod } = router.query;
  const [message, setMessage] = useState("Processing payment...");

  useEffect(() => {
    if (studentId && examPeriod) {
      fetch("/api/payments/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, examPeriod }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setMessage("✅ Payment confirmed successfully.");
          else setMessage("⚠️ Payment success, but confirmation failed.");
        })
        .catch(() => setMessage("⚠️ Error verifying payment."));
    }
  }, [studentId, examPeriod]);

  return <h1>{message}</h1>;
}
