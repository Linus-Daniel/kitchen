"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";
type Props = {
    children:ReactNode
}

export function ThemeProvider({ children, ...props }:Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}