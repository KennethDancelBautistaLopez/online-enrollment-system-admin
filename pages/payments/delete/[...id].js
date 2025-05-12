// pages/payments/delete/[...id].js
import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast"; // Import toast
import LoadingSpinner from "@/components/Loading";

export default function DeletePaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { id } = router.query; // Get payment ID from URL
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (!id) return;

    // Fetch the payment details using the payment ID
    axios
      .get(`/api/payments?id=${id}`)
      .then((response) => {
        setPaymentInfo(response.data.data);
        toast.success("Payment details loaded successfully! ✅");
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch payment details.";
        toast.error(`Error loading payment details: ${errorMessage}`);
        console.error("Error fetching payment details:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);


  function goBack() {
    router.push("/paymentsPage"); // Redirect back to payments list
  }

  async function deletePayment() {
  try {
    await axios.delete(`/api/payments?id=${id}`);
    toast.success("Payment deleted successfully! ✅");
    goBack();
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete payment.";
    toast.error(`Error deleting payment: ${errorMessage}`);
    console.error("Error deleting payment:", error);
  }
}

  return (
    <Login>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
              <h1 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Are you sure you want to delete payment of <b>{paymentInfo?.fullName || "N/A"}</b> of a reference number
                <b> {paymentInfo?.referenceNumber || "N/A"} </b>  
                with amount of <b>₱{paymentInfo?.amount?.toFixed(2) || "0.00"}</b>?
              </h1>
              <div className="flex justify-center gap-4">
                <button onClick={deletePayment} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Yes
                </button>
                <button onClick={goBack} className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400">
                  No
                </button>
              </div>
            </div>
          </>)}
      </div>
    </Login>
  );
}
