import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PaymentForm({ paymentData }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const router = useRouter();

  // Pre-fill form with data if editing an existing payment
  useEffect(() => {
    if (paymentData) {
      setAmount(paymentData.amount);
      setDescription(paymentData.description);
      setName(paymentData.billingDetails.name);
      setEmail(paymentData.billingDetails.email);
      setPhone(paymentData.billingDetails.phone);
      setPaymentId(paymentData._id); // Store paymentId if editing
    }
  }, [paymentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || !name || !email || !phone) {
      alert("Please fill in all fields.");
      return;
    }
    if (amount > 9999999.99) {
      alert("Maximum allowed amount is ₱9,999,999.99");
      return;
    }

    await handlePayment(amount, description, name, email, phone);
  };

  const handlePayment = async (amount, description, name, email, phone) => {
    try {
      const res = await fetch(`/api/payments${paymentId ? `/${paymentId}` : ""}`, {
        method: paymentId ? "PUT" : "POST", // PUT if editing, POST if creating
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, description, name, email, phone }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (data?.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        setTimeout(() => {
          router.push("/payments");
        }, 5000);
      } else {
        console.error("Failed to get checkout URL", data);
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {paymentId ? "Edit Payment" : "Tuition Payment"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Amount (PHP)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter phone number"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition duration-300"
        >
          {paymentId ? "Update Payment" : "Pay Now"}
        </button>
      </form>
    </div>
  );
}