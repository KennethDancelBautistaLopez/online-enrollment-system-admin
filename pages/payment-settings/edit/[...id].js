import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

export default function EditPaymentSetting() {
  const [setting, setSetting] = useState();
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!session) return;
    if (!id) return;
    if (!["superAdmin"].includes(session.user.role)) {
      router.push("/");
    }

    const fetchPaymentSetting = async () => {
      try {
        const response = await axios.get(`/api/payment-settings/${id}`);
        setSetting(response.data.setting);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPaymentSetting();
  }, [id, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const email = formData.get("email");
    const password = formData.get("password");
    if (!amount || !email || !password) {
      return toast.error("Fields cannot be empty");
    }
    if (amount <= 0) {
      return toast.error("Amount cannot be less than 1");
    }

    const form = {
      amount: amount,
      id: id,
      email: email,
      password: password,
    };

    try {
      const response = await axios.patch(`/api/payment-settings`, form);
      if (response.status === 200) {
        toast.success("Exam Period updated.");
        router.push("/payment-settings");
      }
    } catch (error) {
      console.error(error);
      return toast.error(error.response?.data?.message || "Error updating.");
    }
  };

  return (
    <Login>
      <div className="container mx-auto p-4 flex justify-center">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Edit Payment Setting
            </h1>
            <div className="flex items-center space-x-2 text-gray-900 dark:text-white ">
              <Link
                className="hover:underline text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 transition duration-300 ease-in-out"
                href="/payment-settings"
              >
                Back
              </Link>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="examPeriod"
                className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
              >
                Exam Period
              </label>
              <input
                id="examPeriod"
                type="text"
                defaultValue={setting?.examPeriod}
                readOnly
                className="w-full rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
              >
                Amount (₱)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min={1}
                required
                defaultValue={setting?.amount}
                className="w-full rounded-md border border-gray-300 px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Enter Credentials
            </h2>

            <div>
              <label
                htmlFor="email"
                className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
    </Login>
  );
}
