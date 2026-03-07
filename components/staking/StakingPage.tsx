"use client";

import { claimRewards, getStakingPosition, stakeTokens, StakingPositionReponse, unstakeTokens, stakeFromNgnBalance, TxResponse } from "@/lib/config";
import { getNgnBalance, type NgnBalanceResponse } from "@/lib/walletApi";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Loader2, Wallet, Coins, AlertCircle } from "lucide-react";
import { handleError, showSuccessToast } from "@/lib/toast";
import { TransactionStatusPanel, TransactionStatus } from "@/components/transaction/TransactionStatusPanel";

type StakingMode = "ngn_balance" | "usdc";

interface TransactionState {
  status: TransactionStatus;
  txId?: string | null;
  outboxId?: string | null;
  message?: string | null;
  action?: string;
}

export default function StakingPage() {
  const [stakingPosition, setStakingPosition] = useState<StakingPositionReponse | null>(null);
  const [ngnBalance, setNgnBalance] = useState<NgnBalanceResponse | null>(null);
  const [stakingMode, setStakingMode] = useState<StakingMode>("ngn_balance");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [transaction, setTransaction] = useState<TransactionState | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      return;
    }

    getStakingPosition()
      .then((data) => setStakingPosition(data))
      .catch((err: Error) => {
        handleError(err, "Failed to fetch staking position");
      });
  }, []);

  useEffect(() => {
    if (stakingMode === "ngn_balance") {
      setIsLoadingBalance(true);
      getNgnBalance()
        .then((balance) => setNgnBalance(balance))
        .catch((err: Error) => {
          handleError(err, "Failed to fetch NGN balance");
        })
        .finally(() => setIsLoadingBalance(false));
    }
  }, [stakingMode]);





  // Function to map TxResponse status to TransactionStatus
  const mapTxStatus = (status: string): TransactionStatus => {
    switch (status) {
      case "CONFIRMED":
        return "confirmed";
      case "QUEUED":
        return "queued";
      case "FAILED":
        return "failed";
      case "PENDING":
      default:
        return "pending";
    }
  };

  // Function to update transaction state
  const updateTransaction = (res: TxResponse, action: string) => {
    setTransaction({
      status: mapTxStatus(res.status),
      txId: res.txId,
      outboxId: res.outboxId,
      message: res.message,
      action,
    });
  };

  // Function to clear transaction state
  const clearTransaction = () => {
    setTransaction(null);
  };

  //  This function handles balance state in the staking page
  const updatePosition = (updates: {
    stakedDelta?: number
    claimableDelta?: number
  }) => {
    setStakingPosition((prev) => {
      if (!prev) return prev

      const currentStaked = Number(prev.position.staked)
      const currentClaimable = Number(prev.position.claimable)

      return {
        ...prev,
        position: {
          staked: (
            currentStaked + (updates.stakedDelta ?? 0)
          ).toFixed(6),
          claimable: (
            currentClaimable + (updates.claimableDelta ?? 0)
          ).toFixed(6),
        },
      }
    })
  }




  // Function to stake token
  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      setTransaction({
        status: "failed",
        message: "Enter a valid amount to stake",
        action: "Stake",
      });
      return
    }

    const amount = Number(stakeAmount)

    // Validate NGN balance if staking from NGN
    if (stakingMode === "ngn_balance") {
      if (!ngnBalance || amount > ngnBalance.availableNgn) {
        setTransaction({
          status: "failed",
          message: `Insufficient NGN balance. Available: ₦${ngnBalance?.availableNgn.toLocaleString() || 0}`,
          action: "Stake",
        });
        return
      }
    }

    setIsStaking(true)
    setTransaction({
      status: "pending",
      message: stakingMode === "ngn_balance" ? "Converting NGN to USDC and staking..." : "Submitting stake transaction...",
      action: "Stake",
    });

    try {
      if (stakingMode === "ngn_balance") {
        const res = await stakeFromNgnBalance(amount)
        
        updateTransaction(res, "Stake from NGN");
        
        if (res.status === "CONFIRMED") {
          const successMsg = `Successfully staked ${res.amountUsdc || amount} USDC from ₦${amount.toLocaleString()}`
          showSuccessToast(successMsg)
          // Refresh NGN balance
          const updatedBalance = await getNgnBalance()
          setNgnBalance(updatedBalance)
          // Refresh staking position
          const updatedPosition = await getStakingPosition()
          setStakingPosition(updatedPosition)
        }
        
        setStakeAmount("")
      } else {
        const res = await stakeTokens(stakeAmount)

        updateTransaction(res, "Stake USDC");

        if (res.status === "CONFIRMED") {
          showSuccessToast("Stake confirmed on-chain")
        }

        // Add to staked balance
        updatePosition({ stakedDelta: amount })
        setStakeAmount("")
      }
    } catch (err: any) {
      handleError(err, "Failed to stake")
      setTransaction({
        status: "failed",
        message: err.message || "Stake failed",
        action: "Stake",
      });
    } finally {
      setIsStaking(false)
    }
  }



  //  Function to unstake token
  const handleUnstake = async () => {
    if (!unstakeAmount || Number(unstakeAmount) <= 0) {
      setTransaction({
        status: "failed",
        message: "Enter a valid amount to unstake",
        action: "Unstake",
      });
      return
    }

    const amount = Number(unstakeAmount)

    setTransaction({
      status: "pending",
      message: "Submitting unstake transaction...",
      action: "Unstake",
    });

    try {
      const res = await unstakeTokens(unstakeAmount)

      updateTransaction(res, "Unstake");

      if (res.status === "CONFIRMED") {
        showSuccessToast("Unstake confirmed on-chain")
      }

      // Subtract from staked
      updatePosition({ stakedDelta: -amount })

      setUnstakeAmount("")

    } catch (err: any) {
      handleError(err, "Failed to unstake")
      setTransaction({
        status: "failed",
        message: err.message || "Unstake failed",
        action: "Unstake",
      });
    }
  }



  //  Function to claim token
  const handleClaim = async () => {
    setTransaction({
      status: "pending",
      message: "Claiming rewards...",
      action: "Claim Rewards",
    });

    try {
      const claimable = Number(stakingPosition?.position.claimable ?? 0)

      const res = await claimRewards()

      updateTransaction(res, "Claim Rewards");

      if (res.status === "CONFIRMED") {
        showSuccessToast("Rewards claimed successfully")
      }

      // Remove claimable rewards
      updatePosition({ claimableDelta: -claimable })

    } catch (err: any) {
      handleError(err, "Failed to claim rewards")
      setTransaction({
        status: "failed",
        message: err.message || "Claim failed",
        action: "Claim Rewards",
      });
    }
  }


  const handleStakeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Allow empty string to let user clear input
    if (value === '' || !isNaN(Number(value))) {
      setStakeAmount(value);
    }
  }


  const handleUnstakeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Allow empty string to let user clear input
    if (value === '' || !isNaN(Number(value))) {
      setUnstakeAmount(value);
    }
  }




  const formatNgn = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Staking Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Stake your tokens to earn rewards
        </p>
      </div>

      {/* Staking Position Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <CardHeader className="pb-2">
            <CardDescription>Staked Balance</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {stakingPosition ? (
                `${Number(stakingPosition.position.staked).toFixed(2)} USDC`
              ) : (
                "—"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Currently staked</p>
          </CardContent>
        </Card>

        <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <CardHeader className="pb-2">
            <CardDescription>Claimable Rewards</CardDescription>
            <CardTitle className="font-mono text-2xl text-primary">
              {stakingPosition ? (
                `${Number(stakingPosition.position.claimable).toFixed(2)} USDC`
              ) : (
                "—"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Available to claim</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Mode Toggle */}
      <Tabs value={stakingMode} onValueChange={(v) => setStakingMode(v as StakingMode)} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 border-3 border-foreground">
          <TabsTrigger value="ngn_balance" className="data-[state=active]:bg-primary">
            <Wallet className="h-4 w-4 mr-2" />
            Stake with NGN Balance
          </TabsTrigger>
          <TabsTrigger value="usdc" className="data-[state=active]:bg-primary">
            <Coins className="h-4 w-4 mr-2" />
            Stake USDC (Advanced)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ngn_balance" className="mt-4">
          <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <CardHeader>
              <CardTitle>Stake from NGN Balance</CardTitle>
              <CardDescription>
                Convert your NGN wallet balance to USDC and stake it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingBalance ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : ngnBalance ? (
                <>
                  <div className="rounded-md border-2 border-foreground/20 bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available NGN Balance</span>
                      <span className="font-mono font-bold">{formatNgn(ngnBalance.availableNgn)}</span>
                    </div>
                    {ngnBalance.heldNgn > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">Held (Pending)</span>
                        <span className="font-mono text-sm">{formatNgn(ngnBalance.heldNgn)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stake-ngn-amount">Amount (NGN)</Label>
                    <Input
                      id="stake-ngn-amount"
                      type="number"
                      placeholder="Enter amount in NGN"
                      value={stakeAmount}
                      onChange={handleStakeInput}
                      min={100}
                      max={ngnBalance.availableNgn}
                      className="border-2 border-foreground"
                      disabled={isStaking}
                    />
                    <p className="text-xs text-muted-foreground">
                      Min: ₦100 · Max: {formatNgn(ngnBalance.availableNgn)}
                    </p>
                  </div>

                  {/* Transaction Status Panel */}
                  {transaction && (
                    <TransactionStatusPanel
                      status={transaction.status}
                      txId={transaction.txId}
                      outboxId={transaction.outboxId}
                      message={transaction.message}
                      allowRetry={transaction.status === "failed"}
                    />
                  )}

                  <Button
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount || Number(stakeAmount) <= 0}
                    className="w-full border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
                  >
                    {isStaking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Stake from NGN Balance"
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Failed to load NGN balance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usdc" className="mt-4">
          <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <CardHeader>
              <CardTitle>Stake USDC Directly</CardTitle>
              <CardDescription>
                Stake USDC tokens directly (requires USDC in your wallet)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stake-usdc-amount">Amount (USDC)</Label>
                <Input
                  id="stake-usdc-amount"
                  type="text"
                  placeholder="Enter amount in USDC"
                  value={stakeAmount}
                  onChange={handleStakeInput}
                  className="border-2 border-foreground"
                  disabled={isStaking}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the amount in USDC (e.g., 100.50)
                </p>
              </div>

              {/* Transaction Status Panel */}
              {transaction && (
                <TransactionStatusPanel
                  status={transaction.status}
                  txId={transaction.txId}
                  outboxId={transaction.outboxId}
                  message={transaction.message}
                  allowRetry={transaction.status === "failed"}
                />
              )}

              <Button
                onClick={handleStake}
                disabled={isStaking || !stakeAmount || Number(stakeAmount) <= 0}
                className="w-full border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
              >
                {isStaking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Stake USDC"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unstake Form */}
      <Card className="mb-6 border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader>
          <CardTitle>Unstake Tokens</CardTitle>
          <CardDescription>Unstake your USDC tokens from the staking pool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unstake-amount">Amount (USDC)</Label>
            <Input
              id="unstake-amount"
              type="text"
              placeholder="Enter amount to unstake"
              value={unstakeAmount}
              onChange={handleUnstakeInput}
              className="border-2 border-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {stakingPosition ? Number(stakingPosition.position.staked).toFixed(2) : "0"} USDC
            </p>
          </div>

          <Button
            onClick={handleUnstake}
            disabled={!unstakeAmount || Number(unstakeAmount) <= 0}
            className="w-full border-3 border-foreground bg-destructive font-bold text-destructive-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
          >
            Unstake Tokens
          </Button>
        </CardContent>
      </Card>

      {/* Claim Rewards */}
      <Card className="mb-6 border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader>
          <CardTitle>Claim Rewards</CardTitle>
          <CardDescription>
            Claim your staking rewards ({stakingPosition ? Number(stakingPosition.position.claimable).toFixed(2) : "0"} USDC available)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleClaim}
            disabled={!stakingPosition || Number(stakingPosition.position.claimable) <= 0}
            className="w-full border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
          >
            Claim Rewards
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
