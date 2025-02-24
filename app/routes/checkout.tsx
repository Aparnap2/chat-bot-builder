import { useState } from "react";
import { Form } from "@remix-run/react";


export default function Checkout() {
  const [showMessage, setShowMessage] = useState(false);

  const handlePay = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowMessage(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      <div className="flex items-center justify-center py-12 px-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold mb-6 text-center">Upgrade Plan</h2>
          <p className="text-center mb-6">You’ve reached the 10-message limit. Upgrade for unlimited access!</p>
          <Form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-sm">Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Email</label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Pay $29/month
            </button>
          </Form>
          {showMessage && (
            <p className="mt-4 text-center text-green-400">
              Demo mode: No payment processed. Upgrade simulation complete!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}