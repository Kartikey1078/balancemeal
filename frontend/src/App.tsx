import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Plans } from './pages/Plans';
import { MealSelection } from './pages/MealSelection';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Success } from './pages/Success';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/Admin';
import { OrderDashboard } from './pages/OrderDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { Recipes } from './pages/Recipes';
import { RecipeDetail } from './pages/RecipeDetail';
import { ResetPassword } from './pages/ResetPassword';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PlanRequiredRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, selectedPlan } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!selectedPlan) return <Navigate to="/plans" replace />;
  return <>{children}</>;
};

const CartRequiredRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, selectedPlan, cart } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!selectedPlan) return <Navigate to="/plans" replace />;
  if (cart.length === 0) return <Navigate to="/meals" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, adminUser, adminLogout } = useApp();
  const [isVerified, setIsVerified] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const verifyAdmin = async () => {
      if (!isAdmin || !adminUser?.token) {
        if (isMounted) {
          setIsAllowed(false);
          setIsVerified(true);
        }
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/admin/verify`, {
          headers: { 'Authorization': `Bearer ${adminUser.token}` },
        });
        if (!res.ok) {
          if (isMounted) {
            setIsAllowed(false);
            setIsVerified(true);
          }
          if (res.status === 401 || res.status === 403) {
            adminLogout();
          }
          return;
        }
        if (isMounted) {
          setIsAllowed(true);
          setIsVerified(true);
        }
      } catch {
        if (isMounted) {
          setIsAllowed(false);
          setIsVerified(true);
        }
      }
    };
    verifyAdmin();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, adminUser?.token]);

  if (!isVerified) return null;
  if (!isAllowed) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/plans" element={<Layout><Plans /></Layout>} />
      
      {/* Protected Customer Routes */}
      <Route 
        path="/meals" 
        element={
          <PlanRequiredRoute>
            <Layout>
              <MealSelection />
            </Layout>
          </PlanRequiredRoute>
        } 
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Layout>
              <Recipes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <RecipeDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <CartRequiredRoute>
            <Layout>
              <Cart />
            </Layout>
          </CartRequiredRoute>
        }
      />
      <Route 
        path="/checkout" 
        element={
          <CartRequiredRoute>
            <Layout>
              <Checkout />
            </Layout>
          </CartRequiredRoute>
        } 
      />
      <Route 
        path="/success" 
        element={
          <ProtectedRoute>
            <Layout>
              <Success />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <OrderDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Protected Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
