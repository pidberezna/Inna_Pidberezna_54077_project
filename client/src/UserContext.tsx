import axios from 'axios';
import { createContext, ReactNode, useEffect, useState } from 'react';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  ready: null,
});

export interface UserContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  ready: any;
}

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    axios
      .get('/profile', { withCredentials: true })
      .then(({ data }) => {
        setUser(data);
        setReady(true);
      })
      .catch(() => {
        setReady(true);
      });
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
