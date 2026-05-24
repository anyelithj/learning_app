"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from ".";
// [StoreProvider]: Client Component que monta Redux Provider | [Patrón]: Provider (React Context) | [Principio]: SRP | [Paradigma]: Funcional + JSX

// [Provider]: useRef garantiza UN store por instancia de árbol React (no recrea en re-renders) | [Patrón]: Singleton-by-component
export function StoreProvider({ children }: { children: React.ReactNode }) {
  // [Lazy init]: solo se crea en primer render, persiste en sucesivos
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
