import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type MockDoctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  pmdc_number: string;
  phone: string;
  fee: number;
  email: string;
};

const MOCK_DOCTORS: MockDoctor[] = [
  { id: "d1", name: "Dr. Ahmed Raza", specialty: "Cardiology", city: "Karachi", pmdc_number: "PMDC-12345", phone: "+92-300-1234567", fee: 1500, email: "ahmed.raza@sahatghar.pk" },
  { id: "d2", name: "Dr. Fatima Shah", specialty: "Pediatrics", city: "Lahore", pmdc_number: "PMDC-23456", phone: "+92-321-2345678", fee: 1200, email: "fatima.shah@sahatghar.pk" },
  { id: "d3", name: "Dr. Bilal Khan", specialty: "Neurology", city: "Islamabad", pmdc_number: "PMDC-34567", phone: "+92-333-3456789", fee: 2000, email: "bilal.khan@sahatghar.pk" },
];

type AuthContextType = {
  doctor: MockDoctor | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  doctor: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<MockDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("sahatghar_doctor_session");
        if (stored) {
          const found = MOCK_DOCTORS.find((d) => d.id === stored);
          if (found) setDoctor(found);
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const found = MOCK_DOCTORS.find(
      (d) => d.email.toLowerCase() === email.toLowerCase()
    );
    if (!found) {
      // Default to first doctor for demo
      if (email.toLowerCase().includes("doctor") || email.toLowerCase().includes("@sahatghar")) {
        const demo = MOCK_DOCTORS[0];
        await AsyncStorage.setItem("sahatghar_doctor_session", demo.id);
        setDoctor(demo);
        return true;
      }
      return false;
    }
    await AsyncStorage.setItem("sahatghar_doctor_session", found.id);
    setDoctor(found);
    return true;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("sahatghar_doctor_session");
    setDoctor(null);
  };

  return (
    <AuthContext.Provider
      value={{ doctor, isLoggedIn: !!doctor, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { MOCK_DOCTORS };
