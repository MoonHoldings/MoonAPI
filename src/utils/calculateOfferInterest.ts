const calculateOfferInterest = (amount: number, duration: number, apy: number, feePermillicentage: number) => {
  if (!amount) return 0

  const apr = apy / 1000
  const interestRatio = Math.exp((duration / (365 * 24 * 60 * 60)) * (apr / 100)) - 1
  const interestLamports = amount * interestRatio * (1 - feePermillicentage / 100_000)

  return interestLamports
}

export default calculateOfferInterest
