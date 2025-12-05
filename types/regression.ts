export interface RegressionTest {
  id: string
  gameId: string
  gameName?: string
  testId: string
  testCaseDescription: string
  priority: "low" | "medium" | "high" | "critical"
  expectedResult: string
  actualResult: string
  status: "pass" | "fail"
  comments: string
  createdAt: number
  updatedAt: number
}

export type RegressionStatus = RegressionTest["status"]
export type RegressionPriority = RegressionTest["priority"]
