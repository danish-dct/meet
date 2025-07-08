'use client';

import React, { createContext, useContext, useState } from 'react';
import { ConnectionDetails } from '@/lib/types';

interface ConnectionContextType {
  connectionDetails?: ConnectionDetails;
  setConnectionDetails: (details: ConnectionDetails) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>();

  return (
    <ConnectionContext.Provider value={{ connectionDetails, setConnectionDetails }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
