import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

afterEach(() => {
  cleanup();
  if (typeof localStorage?.clear === "function") {
    localStorage.clear();
  }
  vi.restoreAllMocks();
});

// Components render outside the App Router in tests, where next/navigation's
// hooks throw "expected app router to be mounted". This default stands in for
// it; a test that needs particular router behaviour mocks the module itself.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Testing Library's waitFor advances fake timers only when it finds a global
// `jest` (it checks for jest.advanceTimersByTime). Point that at Vitest so
// waitFor works in tests that call vi.useFakeTimers(); with real timers the
// shim is ignored.
(globalThis as typeof globalThis & { jest?: unknown }).jest = {
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
};
