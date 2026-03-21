import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 p-6 pb-20">
        <Outlet /> {/* Nested routes render here */}
      </main>

      {/* Optional footer */}
      <footer className="bg-gray-100 text-center p-4 text-sm">
        &copy; Finova by SmartStack Technologies
      </footer>
    </div>
  );
};

export default Layout;
