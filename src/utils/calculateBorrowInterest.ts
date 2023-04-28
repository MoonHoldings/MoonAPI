const calculateBorrowInterest = (amount: number, duration: number, apy: number) => {
  if (!amount) return 0

  const apr = apy / 1000 // Order book
  const durationSeconds = duration
  const interestRatio = Math.exp((durationSeconds / (365 * 24 * 60 * 60)) * (apr / 100)) - 1
  const totalOwedLamports = amount * (1 + interestRatio)
  const interest = totalOwedLamports - amount

  return interest
}

export default calculateBorrowInterest
