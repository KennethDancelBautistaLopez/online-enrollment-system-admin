import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";

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
  }, [id, session]);
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
      return toast.error(error.response.data.message);
    }
  };
  return (
    <Login>
      <div className="container mx-auto p-4">
        <div className="w-full lg:w-1/2 space-y-6 border p-4 md:p-6 rounded-xl shadow-xl overflow-y-auto max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <h1 className="md:text-xl font-semibold dark:text-white">
              Edit Payment
            </h1>
            <label className="dark:text-white">
              Exam Period
              <input
                type="text"
                className="dark:text-black"
                defaultValue={setting?.examPeriod}
                readOnly
              />
            </label>
            <label className="dark:text-white">
              Amount
              <input
                type="number"
                className="dark:text-black"
                name="amount"
                required
                min={1}
                defaultValue={setting?.amount}
              />
            </label>
            <h1 className="dark:text-white font-bold">Enter Credentials</h1>
            <label className="dark:text-white">
              Email
              <input
                type="email"
                className="dark:text-black"
                name="email"
                required
              />
            </label>
            <label className="dark:text-white">
              Password
              <input
                type="password"
                className="dark:text-black"
                name="password"
                required
              />
            </label>
            <button type="submit">Confirm</button>
          </form>
        </div>
      </div>
    </Login>
  );
}
