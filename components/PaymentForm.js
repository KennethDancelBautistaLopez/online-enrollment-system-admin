import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function PaymentForm({ studentData }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [examPeriod, setExamPeriod] = useState("");
  const [studentId, setStudentId] = useState(studentData?._studentId || "");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount); 

    if (!numericAmount || !description || !examPeriod || !studentId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (numericAmount > 9999999.99) {
      toast.error("Maximum allowed amount is ₱9,999,999.99");
      return;
    }
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        amount: numericAmount,
        description,
        examPeriod,
        _studentId: studentId,
      }),
    });
    
    const data = await res.json();
    
    if (res.ok && data?.checkoutUrl) {
      toast.success("Redirecting to checkout...");
      window.open(data.checkoutUrl, "_blank");
      setTimeout(() => {
        router.push({
          pathname: "/paymentsPage",
          query: { amount, description, studentId, examPeriod },
        });
      }, 5000);
    } else {
      toast.error(data?.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Tuition Payment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Exam Period */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">Exam Period</label>
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
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
          <label className="block text-gray-700 dark:text-gray-200 font-medium">Amount (PHP)</label>
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
            className="w-full p-2 border rounded-lg capitalize bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              const value = e.target.value;
              const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
              setDescription(capitalized);
            }}
            className="w-full p-2 border rounded-lg capitalize bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter description"
            required
          />
        </div>

        {/* Student ID */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">Student ID</label>
          <input
            type="text"
            value={studentId}
            maxLength={50}
            onChange={(e) => {
              let raw = e.target.value.replace(/[^0-9]/g, "");
              if (raw.length > 4) raw = `${raw.slice(0, 4)}-${raw.slice(4)}`;
              setStudentId(raw);
            }}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Student Number"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Submit Payment
        </button>
      </form>
    </div>
  );
}
