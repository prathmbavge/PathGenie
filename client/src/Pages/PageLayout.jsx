import React from "react";

const PageLayout = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center min-w-screen overflow-y-auto">
    <div className={`shadow-lg w-screen`}>
      {children}
    </div>
  </div>
);

export default PageLayout;