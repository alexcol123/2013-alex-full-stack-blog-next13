'use client';

import { SessionProvider } from "next-auth/react";

const Provider = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider  >
    {children}
  </SessionProvider>
)

export default Provider;