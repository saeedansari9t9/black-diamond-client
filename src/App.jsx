import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import SalesReport from "./pages/Reports/SalesReport";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";
import SalesNew from "./pages/Sales/SalesNew";
import CustomerDetail from "./pages/Customers/CustomerDetail";
import InvoicePrint from "./pages/Sales/InvoicePrint";
import Invoices from "./pages/Sales/Invoices";
import Customers from "./pages/Customers/Customers";
import Materials from "./pages/Masters/Materials";
import Shades from "./pages/Masters/Shades";
import Products from "./pages/Masters/Products";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports/sales" element={<SalesReport />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sales/new" element={<SalesNew />} />
          <Route path="/sales/invoices" element={<Invoices />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/invoices/:id" element={<InvoicePrint />} />
          <Route path="/masters/materials" element={<Materials />} />
          <Route path="/masters/shades" element={<Shades />} />
          <Route path="/masters/products" element={<Products />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
