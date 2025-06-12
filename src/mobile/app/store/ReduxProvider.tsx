import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, setupListeners } from './index';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    // Setup RTK Query listeners when the component mounts
    const unsubscribeListeners = setupListeners();
    
    // Cleanup listeners when component unmounts
    return () => {
      if (unsubscribeListeners) {
        unsubscribeListeners();
      }
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
