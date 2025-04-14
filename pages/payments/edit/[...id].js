import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PaymentForm from "@/components/PaymentForm";
import Login from "@/pages/Login";
import { toast } from "react-hot-toast"; // Import toast
import LoadingSpinner from "@/components/Loading";

export default function EditPaymentPage() {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.id) {
      const queryId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
      setPaymentId(queryId);
      console.log("✅ Payment ID from query:", queryId);
    }
  }, [router.isReady, router.query]);
  
  useEffect(() => {
    if (!paymentId) return;
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      toast.error("You must be logged in to view payments.");
      return;
    }
  
    console.log("🔄 Fetching payment data for ID:", paymentId);
  
    axios
  .get(`/api/payments?id=${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    console.log("✅ Fetched payment data:", response.data);
    setPaymentInfo(response.data);
    toast.success("Payment details loaded successfully! ✅");
  })
  .catch((error) => {
    console.error("❌ Error fetching payment:", error.response?.data?.error || error.message);
    setError("Failed to load payment data");
    toast.error("Failed to load payment details. 🚨");
  })
  .finally(() => {
    setLoading(false);
  })
  }, [paymentId]); 

  const handleFormSubmit = (updatedPayment) => {
    toast.loading("Updating payment...");
    axios
      .put(`/api/payments`, { id: paymentId, ...updatedPayment })
      .then((response) => {
        console.log("✅ Payment updated:", response.data);
        toast.success("Payment updated successfully! 🎉");
        router.push("/payments");
      })
      .catch((error) => {
        console.error("❌ Error updating payment:", error.response?.data?.error || error.message);
        setError("Failed to update payment");
        toast.error("Failed to update payment. Please try again. ❌");
      });
  };

  return (
    <Login>
      <div className="container mx-auto p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 dark:text-white text-gray-700">Edit Payment</h1>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {paymentInfo ? (
                <PaymentForm
                  paymentData={paymentInfo} // Pass the fetched payment data
                  studentData={paymentInfo.student} // Pass the student data within paymentInfo
                  onSubmit={handleFormSubmit}
                />
              ) : (
                !error && <p>Loading payment data...</p>
              )}
          </>
        )}
      </div>
    </Login>
  );
}
