import React from "react";

const PageLayout = ({ children, maxWidth = "max-w-lg" }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className={`shadow-lg p-2 sm:p-6 w-full ${maxWidth}`}>
      {children}
    </div>
  </div>
);

export default PageLayout;