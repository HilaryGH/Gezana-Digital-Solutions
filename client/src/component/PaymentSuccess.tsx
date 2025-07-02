import { useEffect } from "react";

const PaymentSuccess = () => {
  useEffect(() => {
    // You can call backend here to confirm payment if needed
  }, []);

  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl text-green-700 font-bold">
        Payment Successful 🎉
      </h1>
      <p className="text-gray-600 mt-4">Thank you for your payment.</p>
    </div>
  );
};

export default PaymentSuccess;
