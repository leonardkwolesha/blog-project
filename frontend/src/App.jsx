import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import "./App.css";

// Layout
import Topbar from "./components/topbar/Topbar";
import Footer from "./components/footer/Footer";
import SyncUser from "./components/syncUser/SyncUser";

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

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <SyncUser />
      <main className="main-content">
        <Routes>
          {/* ===================== */}
          {/* PUBLIC ROUTES */}
          {/* ===================== */}
          <Route path="/" element={<Homepage />} />
          <Route path="/posts" element={<Homepage />} />
          <Route path="/post/:id" element={<Single />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Edit blog is protected but can also handle direct URL access */}
          <Route
            path="/blogs/edit/:blogId"
            element={
              <>
                <SignedIn>
                  <EditBlog />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* ===================== */}
          {/* PROTECTED ROUTES */}
          {/* ===================== */}

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Create Blog */}
          <Route
            path="/create-blog"
            element={
              <>
                <SignedIn>
                  <CreateBlog />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* View Blogs */}
          <Route
            path="/blogs"
            element={
              <>
                <SignedIn>
                  <ViewBlogs />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <>
                <SignedIn>
                  <Settings />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
