import type { StateCreator, StoreMutatorIdentifier } from "zustand";

type Logger = <
  T,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mis, Mos>,
  name: string
) => StateCreator<T, Mis, Mos>;

export const logger: Logger = (config, name) => (set, get, api) => {
  const loggedSet = ((...args: any[]) => {
    if (globalThis.window !== undefined && (globalThis as any).__DEV__) {
      console.log(`  [Zustand Store: ${name}] applying:`, args[0]);
    }
    (set as any)(...args);
    if (globalThis.window !== undefined && (globalThis as any).__DEV__) {
      console.log(`  [Zustand Store: ${name}] new state:`, get());
    }
  }) as any;

  return config(loggedSet, get, api);
};