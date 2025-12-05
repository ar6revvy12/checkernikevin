export type RegressionStatus = "pass" | "fail" | "not-tested"
export type RegressionPriority = "low" | "medium" | "high" | "critical"

export interface RegressionTest {
  id: string
  gameId: string
  gameName?: string
  testId: string
  testCaseDescription: string
  priority: RegressionPriority
  expectedResult: string
  actualResult: string
  status: RegressionStatus
  comments: string
  createdAt: number
  updatedAt?: number
}
