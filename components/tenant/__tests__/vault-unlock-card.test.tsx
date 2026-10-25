import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VaultUnlockCard } from "../vault-unlock-card";

const api = vi.hoisted(() => ({ requestVaultCode: vi.fn(), unlockVault: vi.fn() }));
vi.mock("@/lib/vaultUnlockApi", () => api);

describe("VaultUnlockCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("emails a code, then unlocks with it", async () => {
    api.requestVaultCode.mockResolvedValue(undefined);
    api.unlockVault.mockResolvedValue({ unlocked: true });
    const onUnlocked = vi.fn();
    render(<VaultUnlockCard onUnlocked={onUnlocked} />);

    await userEvent.click(screen.getByRole("button", { name: "Email me a code" }));
    await userEvent.type(await screen.findByLabelText(/enter the code/i), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Unlock vault" }));

    await waitFor(() => expect(onUnlocked).toHaveBeenCalled());
    expect(api.unlockVault).toHaveBeenCalledWith("123456");
  });

  it("shows the error and stays locked on a wrong code", async () => {
    api.requestVaultCode.mockResolvedValue(undefined);
    api.unlockVault.mockRejectedValue(new Error("That code is not right."));
    const onUnlocked = vi.fn();
    render(<VaultUnlockCard onUnlocked={onUnlocked} />);

    await userEvent.click(screen.getByRole("button", { name: "Email me a code" }));
    await userEvent.type(await screen.findByLabelText(/enter the code/i), "000000");
    await userEvent.click(screen.getByRole("button", { name: "Unlock vault" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That code is not right.");
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it("only enables Unlock once all six digits are in", async () => {
    api.requestVaultCode.mockResolvedValue(undefined);
    render(<VaultUnlockCard onUnlocked={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Email me a code" }));
    await userEvent.type(await screen.findByLabelText(/enter the code/i), "123");
    expect(screen.getByRole("button", { name: "Unlock vault" })).toBeDisabled();
  });
});
