import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminIndex from "./pages/admin/AdminIndex";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import SelectRolePage from "./pages/auth/SelectRolePage";
import DoctorLoginPage from "./pages/auth/DoctorLoginPage";
import NurseLoginPage from "./pages/auth/NurseLoginPage";
import UserManage from "./pages/admin/UserManage";
import NurseIndex from "./pages/nurse/NurseIndex";
import PatientManagement from "./pages/nurse/PatientManagement";
import QueueVitals from "./pages/nurse/QueueVitals";
import DoctorIndex from "./pages/doctor/DoctorIndex";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";
import PharmacyDispense from "./pages/nurse/PharmacyDispense";
import BillingPayment from "./pages/nurse/BillingPayment";
import MedicineStock from "./pages/admin/MedicineStock";
import UserDetail from "./pages/admin/UserDetail";
import MedicineDetail from "./pages/admin/MedicineDetail";
import Profile from "./pages/Profile";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import ICD10Manage from "./pages/admin/ICD10Manage";
import PatientDatabase from "./pages/doctor/PatientDatabase";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SelectRolePage />} />
      <Route path="/admin/login/" element={<AdminLoginPage />} />
      <Route path="/doctor/login/" element={<DoctorLoginPage />} />
      <Route path="/nurse/login/" element={<NurseLoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminIndex />} />
        <Route path="users" element={<UserManage />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="medicines" element={<MedicineStock />} />
        <Route path="medicines/:id" element={<MedicineDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="ICD10" element={<ICD10Manage />} />
      </Route>

      <Route
        path="/nurse"
        element={
          <ProtectedRoute allowedRoles={["nurse"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NurseIndex />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="queue" element={<QueueVitals />} />
        <Route path="pharmacy" element={<PharmacyDispense />} />
        <Route path="billing" element={<BillingPayment />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorIndex />} />
        <Route path="queue" element={<DoctorConsultation />} />
        <Route path="profile" element={<Profile />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patient-history" element={<PatientDatabase />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
