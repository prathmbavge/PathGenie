import { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount((prev) => prev + 1);
  const stopLoading = () => setLoadingCount((prev) => Math.max(prev - 1, 0));

  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

export const Loader = () => {
  const { isLoading } = useLoading();
  return isLoading ? (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 border bg-transparent p-2  shadow">
        <div className="animate-spin h-5 w-5 border-2 border-t-white-500 rounded-full"></div>
        <p className="text-white">Processing The Request...</p>
      </div>
    </div>
  ) : null;
};