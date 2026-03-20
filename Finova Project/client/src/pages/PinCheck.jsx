// src/pages/PinCheck.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const PinCheck = () => {
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { type } = useParams(); // "order" or "item"

  const handleVerifyPin = (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN must be a 4-digit number");
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      if (pin === "1266") {
        // Store verified flag in localStorage
        localStorage.setItem(`${type}ReportsToken`, "verified");

        toast.success("Access granted!");
        navigate(`/reports/${type === "order" ? "orders" : "items"}`, { replace: true });
      } else {
        toast.error("Invalid PIN. Try again.");
      }
      setIsVerifying(false);
    }, 300); // Slight delay for UX
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
          Enter {type === "order" ? "Order" : "Item"} Reports PIN
        </h2>
        <form onSubmit={handleVerifyPin} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            className="border w-full text-center text-lg tracking-widest rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="••••"
            disabled={isVerifying}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify PIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinCheck;
