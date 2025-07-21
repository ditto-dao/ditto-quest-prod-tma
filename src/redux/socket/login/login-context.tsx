import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../socket-context';
import { SocketProviderProps } from '../../../utils/types';
import { setTelegramId } from '../../telegram-id-slice';
import { setTelegramUsername } from '../../telegram-username-slice';
import LoginManager from '../../../managers/login-manager';

// Simple context that just holds the manager
interface LoginContextType {
  manager: LoginManager;
}

const LoginContext = createContext<LoginContextType>({
  manager: LoginManager.getInstance()
});

export const useLogin = () => {
  const { manager } = useContext(LoginContext);
  const [state, setState] = React.useState(manager.getState());

  React.useEffect(() => {
    const unsubscribe = manager.subscribe(setState);
    return unsubscribe;
  }, [manager]);

  return {
    ...state,
    manager // Expose manager for advanced use cases
  };
};

export const LoginProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const manager = LoginManager.getInstance();

  // Initialize the manager when socket is ready
  useEffect(() => {
    if (socket) {
      console.log('🚀 Initializing login manager with socket');
      
      // Create dispatch wrapper for the manager
      const dispatchWrapper = (action: any) => {
        if (action.type === 'telegramId/setTelegramId') {
          dispatch(setTelegramId(action.payload));
        } else if (action.type === 'telegramUsername/setTelegramUsername') {
          dispatch(setTelegramUsername(action.payload));
        }
      };

      manager.initialize(socket, dispatchWrapper);
    }
  }, [socket, dispatch, manager]);

  return (
    <LoginContext.Provider value={{ manager }}>
      {children}
    </LoginContext.Provider>
  );
};