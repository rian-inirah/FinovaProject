// src/components/PinProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PinProtectedRoute = ({ children, reportType }) => {
  const tokenKey = `${reportType}ReportsToken`;
  const token = localStorage.getItem(tokenKey);

  // Redirect to PIN entry if token is missing or invalid
  if (token !== "verified") {
    return <Navigate to={`/reports-pin/${reportType}`} replace />;
  }

  return children;
};

export default PinProtectedRoute;
