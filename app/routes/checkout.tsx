// app/routes/checkout.tsx
import { useState } from "react";
import { Form } from "@remix-run/react";

export default function Checkout() {
  const [showMessage, setShowMessage] = useState(false);

  const handlePay = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowMessage(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Desktop Background */}
        <div className="hidden lg:block absolute inset-0 overflow-hidden">
          <div className="parallax-layer absolute inset-0">
            <div className="cube-1"></div>
            <div className="cube-2"></div>
            <div className="cube-3"></div>
          </div>
        </div>

        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 bg-blue-500"></div>

        {/* Checkout Card */}
        <div className="card w-full max-w-md bg-base-100 shadow-xl z-10">
          <div className="card-body">
            <h2 className="card-title text-3xl text-center mb-6">Checkout</h2>
            <Form onSubmit={handlePay} className="form-control">
              <div className="mb-4">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">
                  <span className="label-text">Card Number</span>
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Expiry Date</span>
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">CVV</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>
              <div className="card-actions justify-center">
                <button type="submit" className="btn btn-primary w-full">
                  Pay
                </button>
              </div>
            </Form>
            {showMessage && (
              <div className="mt-4 text-center">
                <p className="text-xl font-bold text-green-600">
                  Just kidding! This is a demo, no payment was processed. Your money is safe!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}