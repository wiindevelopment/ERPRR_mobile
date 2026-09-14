import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/services';
import { AssignedProject, LoginResponse } from '../types';

const STORAGE_KEY = 'meter_fuel_user';
const PROJECT_STORAGE_KEY = 'meter_fuel_selected_project';

type AuthContextType = {
  user: LoginResponse | null;
  loading: boolean;
  selectedProject: AssignedProject | null;
  selectProject: (project: AssignedProject) => void;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [selectedProject, setSelectedProject] = useState<AssignedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedProject] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(PROJECT_STORAGE_KEY),
        ]);
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedProject) setSelectedProject(JSON.parse(storedProject));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    const result = await authApi.login(username, password);
    if (!result?.employeeCode) {
      const receivedKeys = result ? Object.keys(result).join(', ') : 'none';
      throw new Error(`Login response does not contain employeeCode. Received fields: ${receivedKeys}`);
    }
    setUser(result);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result));

    const defaultProject = result.assignedProjects?.[0] ?? null;
    setSelectedProject(defaultProject);
    if (defaultProject) {
      await AsyncStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(defaultProject));
    } else {
      await AsyncStorage.removeItem(PROJECT_STORAGE_KEY);
    }
  };

  const selectProject = (project: AssignedProject) => {
    setSelectedProject(project);
    AsyncStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
  };

  const signOut = async () => {
    setUser(null);
    setSelectedProject(null);
    await AsyncStorage.multiRemove([STORAGE_KEY, PROJECT_STORAGE_KEY]);
  };

  return (
    <AuthContext.Provider value={{ user, loading, selectedProject, selectProject, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
