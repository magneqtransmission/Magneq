import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import CreatePO from "./pages/Purchase/CreatePO";
import Dashboard from "./pages/Dashboard";
import CreateOrder from "./pages/CreateOrder";
import TrackOrder from "./pages/TrackOrder";
import Sales from "./pages/Sales/index";
import Purchase from "./pages/Purchase/index";
import Production from "./pages/Production";
import Ledger from "./pages/Ledger";
import Email from "./pages/Email";
import Chat from "./pages/Chat";
import AddStock from "./pages/Store/AddStock";
import Stores from "./pages/Stores";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Quality from "./pages/Quality/index";
import QualityConcen from "./pages/Quality/QualityConcen";
import CreateTicket from "./pages/Quality/CreateTicket";
import QualityCard from "./pages/Quality/QualityCard";
import ProductionDetails from "./pages/Production/ProductionDetails";
import DailyProduction from "./pages/Production/DailyProduction";
import RawMaterial from "./pages/Stores/RawMaterial";
import RawMaterialDetail from "./pages/Stores/RawMaterialDetail";
import ManageFinishedGood from "./pages/DeveloperPanel/ManageFinishedGood";
import ManageRawMaterials from "./pages/DeveloperPanel/ManageRawMaterials";
import ManageUsers from "./pages/DeveloperPanel/ManageUsers";
import CreateRawMaterial from "./pages/DeveloperPanel/ManageRawMaterials/CreateRawMaterial";
import EditRawMaterial from "./pages/DeveloperPanel/ManageRawMaterials/EditRawMaterial";
import DeveloperRawMaterialDetail from "./pages/DeveloperPanel/ManageRawMaterials/DeveloperRawMaterialDetail";
import CreateFinishedGood from "./pages/DeveloperPanel/ManageFinishedGood/CreateFinishedGood";
import ViewFinishedGood from "./pages/DeveloperPanel/ManageFinishedGood/ViewFinishedGood";
import PurchaseOrder from "./pages/Purchase/PurchaseOrder";
import PurchaseDetails from "./pages/Purchase/PurchaseDetails";
import CreateUserPage from "./pages/DeveloperPanel/ManageUsers/CreateUserPage";
import ViewSalesOrder from "./pages/Sales/ViewSalesOrder";
import ManageSuppliers from "./pages/DeveloperPanel/ManageSuppliers";
import ManageCustomers from "./pages/DeveloperPanel/ManageCustomers";
import CreateSupplier from "./pages/DeveloperPanel/ManageSuppliers/CreateSupplier";
import CreateCustomer from "./pages/DeveloperPanel/ManageCustomers/CreateCustomer";
import EditCustomer from "./pages/DeveloperPanel/ManageCustomers/EditCustomer";
import CustomerOpeningBalance from "./pages/DeveloperPanel/ManageCustomers/CustomerOpeningBalance";
import EditUser from "./pages/DeveloperPanel/ManageUsers/EditUser";
import CreatePRO from "./pages/Production/CreatePRO"
import TrackVendor from "./pages/Purchase/TrackVendor";
import VendorPurchases from "./pages/Purchase/VendorPurchases";
import TestLogin from "./pages/Auth/TestLogin";
import ShortQuantity from "./pages/Purchase/ShortQuantity";
import Invoice from "./pages/Invoice";
import AllInvoices from "./pages/Invoice/AllInvoice";
import AddInvoice from "./pages/Invoice/AddInvoice";
import Delivery from "./pages/Delivery";
import AllDelivery from "./pages/Delivery/AllDelivery";
import AddDelivery from "./pages/Delivery/AddDelivery";
import DeliveryDetail from "./pages/Delivery/DeliveryDetail";
import InvoiceDetail from "./pages/Invoice/InvoiceDetail";
import AddPayment from "./pages/Sales/AddPayment";
import CustomerDashboard from "./pages/CustomerDashboard";
import Export from "./pages/Invoice/Export";
import FgHistory from "./pages/History/FgHistory";
import ProductionHistory from "./pages/History/ProductionHistory";
import RawMaterialHistory from "./pages/History/RawMaterialHistory";

function App() {
  return (
    <div className="App">
      <ReactQueryDevtools initialIsOpen={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/test" element={<TestLogin />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/create_order" element={<CreateOrder />} />
          <Route path="/track_order" element={<TrackOrder />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/payment" element={<AddPayment />} />
          <Route path="/sales/:id" element={<ViewSalesOrder />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/invoice" element={<Invoice />}>
            <Route index element={<AllInvoices />} />
            <Route path="create" element={<AddInvoice />} />
            <Route path=":id" element={<InvoiceDetail />} />
            <Route path="export" element={<Export />} />
          </Route>
          <Route path="/delivery" element={<Delivery />}>
            <Route index element={<AllDelivery />} />
            <Route path="create" element={<AddDelivery />} />
            <Route path=":id" element={<DeliveryDetail />} />
          </Route>
          <Route path="/purchase" element={<Purchase />}>
            <Route index element={<PurchaseOrder />} />
            <Route path="create" element={<CreatePO />} />
            <Route path=":id" element={<PurchaseDetails />} />
            <Route path=":id/list" element={<VendorPurchases />} />
            <Route path="track_vendor" element={<TrackVendor />} />
            <Route path="short" element={<ShortQuantity />} />
          </Route>
          <Route path="/store" element={<Stores />}>
            <Route index element={<RawMaterial />} />
            <Route path="add" element={<AddStock />} />
          </Route>
          <Route
            path="/raw_material/:class_type/:id"
            element={<RawMaterialDetail />}
          />
          <Route path="/production" element={<Production />} />
          <Route path="/create_pro" element={<CreatePRO />} />
          <Route path="/daily_production" element={<DailyProduction />} />
          <Route path="/production/:id" element={<ProductionDetails />} />
          <Route path="/ledger" element={<Ledger />} />

          <Route path="/email" element={<Email />} />
          <Route path="/chat" element={<Chat />} />
          
          <Route path="/history">
            <Route path="fg" element={<FgHistory />} />
            <Route path="production" element={<ProductionHistory />} />
            <Route path="raw_material" element={<RawMaterialHistory />} />
          </Route>

          <Route path="/quality" element={<Quality />}>
            <Route index element={<QualityConcen />} />
            <Route path="create_ticket" element={<CreateTicket />} />
            <Route path=":id" element={<QualityCard />} />
          </Route>

          <Route path="finished_good" element={<ManageFinishedGood />} />
          <Route path="finished_good/:id" element={<ViewFinishedGood />} />
          <Route path="finished_good/create" element={<CreateFinishedGood />} />
          <Route
            path="raw_material/:class_type"
            element={<ManageRawMaterials />}
          />
          <Route
            path="raw_material/:class_type/create"
            element={<CreateRawMaterial />}
          />
          <Route
            path="manage_raw_material/:class_type/:id"
            element={<DeveloperRawMaterialDetail />}
          />
          <Route
            path="manage_raw_material/:class_type/:id/edit"
            element={<EditRawMaterial />}
          />
          <Route path="manage_users" element={<ManageUsers />} />
          <Route path="manage_suppliers" element={<ManageSuppliers />} />
          <Route path="manage_suppliers/create" element={<CreateSupplier />} />
          <Route path="manage_customers" element={<ManageCustomers />} />
          <Route path="manage_customers/create" element={<CreateCustomer />} />
          <Route path="manage_customers/opening-balance" element={<CustomerOpeningBalance />} />
          <Route path="manage_customers/:id/edit" element={<EditCustomer />} />
          <Route path="manage_users/create" element={<CreateUserPage />} />
          <Route path="manage_users/:id/edit" element={<EditUser />} />
        </Route>
      </Routes>
    </div>
  );
}
export default App;
