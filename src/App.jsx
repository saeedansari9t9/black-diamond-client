import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import SalesReport from "./pages/Reports/SalesReport";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";
import SalesNew from "./pages/Sales/SalesNew";
import CustomerDetail from "./pages/Customers/CustomerDetail";
import CustomerLedger from "./pages/Customers/CustomerLedger";
import InvoicePrint from "./pages/Sales/InvoicePrint";
import InvoicePrintThermal from "./pages/Sales/InvoicePrintThermal";
import Invoices from "./pages/Sales/Invoices";
import Customers from "./pages/Customers/Customers";
import Materials from "./pages/Masters/Materials";
import Products from "./pages/Masters/Products";
import ProductPrices from "./pages/Masters/ProductPrices";
import Suppliers from "./pages/Purchases/Suppliers";
import PurchaseList from "./pages/Purchases/PurchaseList";
import NewPurchase from "./pages/Purchases/NewPurchase";
import PurchaseDetail from "./pages/Purchases/PurchaseDetail";
import SupplierLedger from "./pages/Purchases/SupplierLedger";
import Stock from "./pages/Inventory/Stock";
import AdjustStock from "./pages/Inventory/AdjustStock";
import ProductionEntry from "./pages/Inventory/ProductionEntry";
import RawMaterials from "./pages/Inventory/RawMaterials";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
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
          <Route path="/sales/invoices/:id/print" element={<InvoicePrint />} />
          <Route path="/sales/invoices/:id/print/thermal" element={<InvoicePrintThermal />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/ledger" element={<CustomerLedger />} />
          <Route path="/masters/materials" element={<Materials />} />
          <Route path="/masters/products" element={<Products />} />
          <Route path="/masters/product-prices" element={<ProductPrices />} />

          {/* Purchase Routes */}
          <Route path="/purchases" element={<PurchaseList />} />
          <Route path="/purchases/suppliers" element={<Suppliers />} />
          <Route path="/purchases/suppliers/:id/ledger" element={<SupplierLedger />} />
          <Route path="/purchases/new" element={<NewPurchase />} />
          <Route path="/purchases/:id" element={<PurchaseDetail />} />

          {/* Inventory Routes */}
          <Route path="/inventory/stock" element={<Stock />} />
          <Route path="/inventory/adjust-stock" element={<AdjustStock />} />
          <Route path="/inventory/production" element={<ProductionEntry />} />
          <Route path="/inventory/raw-materials" element={<RawMaterials />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
