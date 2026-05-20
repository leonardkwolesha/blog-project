import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./App.css";

// Layout
import Topbar from "./components/topbar/Topbar";
import Footer from "./components/footer/Footer";

// Pages
import Homepage from "./pages/homepage/Homepage";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Single from "./pages/single/Single";
import Settings from "./pages/settings/Settings";
import CreateBlog from "./pages/createBlog/CreateBlog";
import ViewBlogs from "./pages/viewBlog/ViewBlogs";
import EditBlog from "./pages/edit/EditBlog";
import Dashboard from "./pages/dashboard/Dashboard";
import SearchResults from "./pages/searchResults/SearchResults";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword";
import ResetPassword from "./pages/resetPassword/ResetPassword";

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <main className="main-content">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Homepage />} />
          <Route path="/posts" element={<Homepage />} />
          <Route path="/post/:id" element={<Single />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* PROTECTED */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
          <Route path="/blogs" element={<ProtectedRoute><ViewBlogs /></ProtectedRoute>} />
          <Route path="/blogs/edit/:blogId" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
