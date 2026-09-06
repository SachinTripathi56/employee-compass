import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/api/auth";
import { registerTokenGetter } from "@/api/client";
import { CLERK_ENABLED, CLERK_PUBLISHABLE_KEY } from "@/lib/env";
import { setDemoRole } from "@/api/mock/handler";
import type { CurrentUser, UserRole } from "@/api/types";

interface AuthState {
  /** Auth system finished initialising */
  isLoaded: boolean;
  isSignedIn: boolean;
  /** Backend profile — the only trusted source for role display */
  user: CurrentUser | null;
  role: UserRole | null;
  isProfileLoading: boolean;
  profileError: unknown;
  signOut: () => Promise<void>;
  /** Demo-only helper, no effect when Clerk is configured */
  demoSignIn: (role: UserRole) => void;
  usingDemoAuth: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

const DEMO_KEY = "demo_signed_in";

function useBackendProfile(isSignedIn: boolean) {
  return useQuery({
    queryKey: ["me", isSignedIn],
    queryFn: getCurrentUser,
    enabled: isSignedIn,
    staleTime: 60_000,
    retry: 1,
  });
}

function ClerkBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();

  useEffect(() => {
    registerTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  const profile = useBackendProfile(Boolean(isSignedIn));

  const value = useMemo<AuthState>(
    () => ({
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      user: profile.data ?? null,
      role: profile.data?.role ?? null,
      isProfileLoading: profile.isLoading,
      profileError: profile.error,
      signOut: async () => {
        await signOut();
      },
      demoSignIn: () => {},
      usingDemoAuth: false,
    }),
    [isLoaded, isSignedIn, profile.data, profile.isLoading, profile.error, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    registerTokenGetter(async () => null);
    setSignedIn(localStorage.getItem(DEMO_KEY) === "true");
    setReady(true);
  }, []);

  const profile = useBackendProfile(signedIn);

  const demoSignIn = useCallback((role: UserRole) => {
    setDemoRole(role);
    localStorage.setItem(DEMO_KEY, "true");
    setSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_KEY);
    setSignedIn(false);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isLoaded: ready,
      isSignedIn: signedIn,
      user: profile.data ?? null,
      role: profile.data?.role ?? null,
      isProfileLoading: profile.isLoading,
      profileError: profile.error,
      signOut,
      demoSignIn,
      usingDemoAuth: true,
    }),
    [ready, signedIn, profile.data, profile.isLoading, profile.error, signOut, demoSignIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!CLERK_ENABLED) return <DemoAuthProvider>{children}</DemoAuthProvider>;
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
