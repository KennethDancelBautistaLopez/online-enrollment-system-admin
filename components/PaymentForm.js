import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function PaymentForm({ paymentData, studentData }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [examPeriod, setExamPeriod] = useState("");
  const [studentId, setStudentId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (paymentData) {
      setAmount(paymentData.amount);
      setDescription(paymentData.description);
      setPaymentId(paymentData._id);
      setExamPeriod(paymentData.examPeriod || "");
    }

    if (studentData) {
      setStudentId(studentData._studentId);
    }
  }, [paymentData, studentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !description || !examPeriod || !studentId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (amount > 9999999.99) {
      toast.error("Maximum allowed amount is ₱9,999,999.99");
      return;
    }

    await handlePayment(amount, description, examPeriod, studentId);
  };

  const handlePayment = async (amount, description, examPeriod, studentId) => {
    try {
      const res = await fetch(`/api/payments${paymentId ? `/${paymentId}` : ""}`, {
        method: paymentId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount,
          description,
          examPeriod,
          _studentId: studentId,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.checkoutUrl) {
        toast.success("Payment created. Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");

        setTimeout(() => {
          router.push({
            pathname: "/payments",
            query: {
              amount,
              description,
              studentId,
              examPeriod,
            },
          });
        }, 5000);
      } else {
        toast.error(data?.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {paymentId ? "Edit Payment" : "Tuition Payment"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Exam Period */}
        <div>
          <label className="block text-gray-700 font-medium">Exam Period</label>
          <select
            value={examPeriod}
            onChange={(e) => {
              const value = e.target.value;
              setExamPeriod(value);
              if (value === "downpayment" && amount > 2000) {
                setAmount(2000);
              } else if (value !== "" && value !== "downpayment" && amount > 1500) {
                setAmount(1500);
              }
            }}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">Select Exam Period</option>
            <option value="downpayment">Downpayment</option>
            <option value="1st Periodic">1st Periodic</option>
            <option value="Prelim">Prelim</option>
            <option value="2nd Periodic">2nd Periodic</option>
            <option value="Midterm">Midterm</option>
            <option value="3rd Periodic">3rd Periodic</option>
            <option value="Pre-final">Pre-final</option>
            <option value="4th Periodic">4th Periodic</option>
            <option value="Finals">Finals</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-gray-700 font-medium">Amount (PHP)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              const inputAmount = parseFloat(e.target.value);
              const max =
                examPeriod === "downpayment"
                  ? 2000
                  : examPeriod !== ""
                  ? 1500
                  : 9999999.99;
              setAmount(inputAmount > max ? max : inputAmount);
            }}
            max={examPeriod === "downpayment" ? 2000 : examPeriod !== "" ? 1500 : 9999999.99}
            className="w-full p-2 border rounded-lg capitalize"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              const value = e.target.value;
              const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
              setDescription(capitalized);
            }}
            className="w-full p-2 border rounded-lg capitalize"
            placeholder="Enter description"
            required
          />
        </div>

        {/* Student ID */}
        <div>
          <label className="block text-gray-700 font-medium">Student ID</label>
          <input
            type="text"
            value={studentId}
            maxLength={50}
            onChange={(e) => {
              let raw = e.target.value.replace(/[^0-9]/g, "");
              if (raw.length > 4) raw = `${raw.slice(0, 4)}-${raw.slice(4)}`;
              setStudentId(raw);
            }}
            className="w-full p-2 border rounded-lg"
            placeholder="Student Number"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {paymentId ? "Update Payment" : "Submit Payment"}
        </button>
      </form>
    </div>
  );
}
