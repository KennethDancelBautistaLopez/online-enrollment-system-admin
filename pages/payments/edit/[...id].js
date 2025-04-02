import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PaymentForm from "@/components/PaymentForm";
import Login from "@/pages/Login";
import { toast } from "react-hot-toast"; // Import toast

export default function EditPaymentPage() {
  const [paymentInfo, setPaymentInfo] = useState(null);
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

    console.log("🔄 Fetching payment data for ID:", paymentId);

    axios
      .get(`/api/payments`, { params: { id: paymentId } })
      .then((response) => {
        console.log("✅ Fetched payment data:", response.data);

        if (response.data) {
          setPaymentInfo(response.data);
          toast.success("Payment details loaded successfully! ✅"); // Show success toast
        } else {
          setError("Payment not found");
          toast.error("Payment not found. ❌"); // Show error toast if payment not found
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching payment:", error.response?.data?.error || error.message);
        setError("Failed to load payment data");
        toast.error("Failed to load payment details. 🚨"); // Show error toast on failure
      });
  }, [paymentId]);

  // Handle the form submission when editing the payment
  const handleFormSubmit = (updatedPayment) => {
    toast.loading("Updating payment..."); // Show loading toast while updating payment

    axios
      .put(`/api/payments`, { id: paymentId, ...updatedPayment })
      .then((response) => {
        console.log("✅ Payment updated:", response.data);
        toast.success("Payment updated successfully! 🎉"); // Show success toast on successful update
        router.push("/payments"); // Redirect back to payments list after update
      })
      .catch((error) => {
        console.error("❌ Error updating payment:", error.response?.data?.error || error.message);
        setError("Failed to update payment");
        toast.error("Failed to update payment. Please try again. ❌"); // Show error toast on failure
      });
  };

  return (
    <Login>
      <div>
        <h1 className="text-2xl font-bold mb-4">Edit Payment</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {paymentInfo ? (
          <PaymentForm
            paymentInfo={paymentInfo}
            onSubmit={handleFormSubmit} // Pass the submit handler for form
          />
        ) : (
          !error && <p>Loading payment data...</p>
        )}
      </div>
    </Login>
  );
}