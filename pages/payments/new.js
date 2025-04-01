import Login from "@/pages/Login";
import PaymentForm from "@/components/PaymentForm";

export default function NewPayment() {
  return (
    <Login>
      <h1 className="text-2xl font-bold mb-4">New Payment</h1>
      <PaymentForm />
    </Login>
  );
}