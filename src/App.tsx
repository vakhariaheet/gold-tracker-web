import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoldRateProvider } from './context/GoldRateContext';
import { PurchasesProvider } from './context/PurchasesContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import PurchasesPage from './pages/PurchasesPage';
import AddEditPurchasePage from './pages/AddEditPurchasePage';
import ProfilePage from './pages/ProfilePage';

function AppRoutes() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/otp-verification" element={<OTPVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {isLoggedIn ? (
        <Route
          path="/*"
          element={
            <GoldRateProvider>
              <PurchasesProvider>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/purchases" element={<PurchasesPage />} />
                    <Route path="/add" element={<AddEditPurchasePage />} />
                    <Route path="/edit/:id" element={<AddEditPurchasePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </PurchasesProvider>
            </GoldRateProvider>
          }
        />
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
