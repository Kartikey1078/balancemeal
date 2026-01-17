
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin } = useApp();
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
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
          <ProtectedRoute>
            <Layout>
              <MealSelection />
            </Layout>
          </ProtectedRoute>
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
      <Route path="/cart" element={<Layout><Cart /></Layout>} />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Layout>
              <Checkout />
            </Layout>
          </ProtectedRoute>
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
