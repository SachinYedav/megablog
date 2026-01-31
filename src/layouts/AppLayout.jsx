import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, Footer, SEO } from "../components/index"; 
import Header from "../components/layout/Header";

function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <SEO title="Share your thoughts" />

      {/* --- DESKTOP SIDEBAR --- */}
      <div
        className={`hidden md:flex flex-shrink-0 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <Sidebar collapsed={!isSidebarOpen} />
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth pb-16 md:pb-0">
        <div className="w-full min-h-full ">
            <Outlet />
          </div>
        </main>

        {/* --- MOBILE BOTTOM NAVIGATION (Footer) --- */}
        <div className="md:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
