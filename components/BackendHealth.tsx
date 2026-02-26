"use client";

import { useEffect, useState } from "react";
import { getHealth, HealthResponse } from "@/lib/config";

type State =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; data: HealthResponse };

export default function BackendHealth() {
  const [state, setState] = useState<State>({ type: "loading" });

  useEffect(() => {
    getHealth()
      .then((data) => setState({ type: "success", data }))
      .catch((err: Error) =>
        setState({ type: "error", message: err.message })
      );
  }, []);

  return (
    <div className="border p-4 rounded-lg mt-6 bg-white shadow-sm flex flex-col items-center justify-center ">
      <h3 className="font-semibold mb-3 text-lg">
        Backend Health
      </h3>

      {state.type === "loading" && (
        <p className="text-gray-500">Loading...</p>
      )}

      {state.type === "error" && (
        <p className="text-red-500">
          Error: {state.message}
        </p>
      )}

      {state.type === "success" && (
        <div className="space-y-1">
          <p>
            <strong>OK:</strong> {state.data.ok ? "Yes" : "No"}
          </p>
          <p>
            <strong>Service:</strong> {state.data.service}
          </p>
          <p>
            <strong>Environment:</strong> {state.data.env}
          </p>
        </div>
      )}
    </div>
  );
}