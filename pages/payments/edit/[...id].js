import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PaymentForm from "@/components/PaymentForm";

export default function EditPaymentPage() {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const router = useRouter();
  const { paymentId } = router.query;

  useEffect(() => {
    if (!paymentId) {
      return;
    }
    axios.get('/api/payments?id=' + paymentId).then(response => {
      setPaymentInfo(response.data);
    });
  }, [paymentId]);

  return (
    <Login>
      <h1>Edit Payment</h1>
      {paymentInfo && <PaymentForm {...paymentInfo} />}
    </Login>
  );
}
