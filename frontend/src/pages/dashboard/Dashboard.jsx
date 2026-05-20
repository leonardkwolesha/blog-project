import { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import CreateBlog from "../createBlog/CreateBlog";
import ViewBlogs from "../viewBlog/ViewBlogs";
import "./Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("posts");
  const { user } = useUser();

  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn>
        <div className="db-page">
          <div className="db-topbar">
            <div className="db-welcome">
              <h1>Dashboard</h1>
              {user && <p>Welcome back, <strong>{user.firstName || user.username || "Writer"}</strong></p>}
            </div>
          </div>

          <div className="db-tabs">
            <button
              className={`db-tab ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              My Posts
            </button>
            <button
              className={`db-tab ${activeTab === "write" ? "active" : ""}`}
              onClick={() => setActiveTab("write")}
            >
              + Write New Post
            </button>
          </div>

          <div className="db-content">
            {activeTab === "posts" && <ViewBlogs />}
            {activeTab === "write" && <CreateBlog />}
          </div>
        </div>
      </SignedIn>
    </>
  );
}
