import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// 🔹 Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import BusinessDetails from "./pages/BusinessDetails";
import Items from "./pages/Items";
import AddItem from "./pages/AddItem";
import AddOrder from "./pages/AddOrder";
import Drafts from "./pages/Drafts";
import PrintPreview from "./pages/PrintPreview";
import OrderReports from "./pages/reports/OrderReports";
import ItemReports from "./pages/reports/ItemReports";
import PSG from "./pages/PSG";

// 🔹 PIN Authentication (shared)
import PinCheck from "./pages/PinCheck";

// 🔹 Components
import ProtectedRoute from "./components/ProtectedRoute";
import PinProtectedRoute from "./components/PinProtectedRoute";
import Layout from "./components/Layout";

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <Routes>
      {/* ---------------- Public Route ---------------- */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* ---------------- Protected Routes ---------------- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="business-details" element={<BusinessDetails />} />
        <Route path="items" element={<Items />} />
        <Route path="items/add" element={<AddItem />} />
        <Route path="add-order" element={<AddOrder />} />
        <Route path="add-order/:orderId" element={<AddOrder />} />
        <Route path="drafts" element={<Drafts />} />
        <Route path="print-preview/:orderId" element={<PrintPreview />} />

        {/* ---------------- Reports (PIN Protected) ---------------- */}
        <Route
          path="reports/orders"
          element={
            <PinProtectedRoute reportType="order">
              <OrderReports />
            </PinProtectedRoute>
          }
        />
        <Route
          path="reports/items"
          element={
            <PinProtectedRoute reportType="item">
              <ItemReports />
            </PinProtectedRoute>
          }
        />

        {/* ---------------- PSG Page ---------------- */}
        <Route path="psg" element={<PSG />} />
      </Route>

      {/* ---------------- PIN Entry (Universal) ---------------- */}
      <Route path="/reports-pin/:type" element={<PinCheck />} />

      {/* ---------------- Fallback ---------------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
