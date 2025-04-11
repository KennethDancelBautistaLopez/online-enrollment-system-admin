// pages/payments/delete/[...id].js
import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast"; // Import toast

export default function DeletePaymentPage() {
  const router = useRouter();
  const { id } = router.query; // Get payment ID from URL
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (!id) return;

    // Fetch the payment details using the payment ID
    axios
      .get(`/api/payments?id=${id}`)
      .then((response) => {
        setPaymentInfo(response.data.data);
      })
      .catch((error) => {
        console.error("❌ Error fetching payment:", error);
        toast.error("Failed to load payment details. 🚨");
      });
  }, [id]);


  function goBack() {
    router.push("/paymentsPage"); // Redirect back to payments list
  }

  async function deletePayment() {
    try {
      await axios.delete(`/api/payments?id=${id}`); // Ensure correct API call
      toast.success("Payment deleted successfully! ✅");
      goBack();
    } catch (error) {
      console.error("❌ Error deleting payment:", error);
      toast.error("Failed to delete payment. Please try again. ❌");
    }
  }

  return (
    <Login>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
          <h1 className="text-lg font-semibold mb-4">
            Are you sure you want to delete payment of <b>{paymentInfo?.fullName || "N/A"}</b> of a reference number
            <b> {paymentInfo?.referenceNumber || "N/A"} </b>  
            with amount of <b>₱{paymentInfo?.amount?.toFixed(2) || "0.00"}</b>?
          </h1>
          <div className="flex justify-center gap-4">
            <button onClick={deletePayment} className="bg-red-500 text-white px-4 py-2 rounded">
              Yes
            </button>
            <button onClick={goBack} className="bg-gray-300 px-4 py-2 rounded">
              No
            </button>
          </div>
        </div>
      </div>
    </Login>
  );
}
