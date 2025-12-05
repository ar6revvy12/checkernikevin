export type FunctionalStatus = "running" | "not-running" | "not-tested"

export interface FunctionalTest {
  id: string
  gameId: string
  gameName?: string
  testCaseId: string
  module: string
  testScenario: string
  precondition: string
  testSteps: string
  expectedResult: string
  status: FunctionalStatus
  comments: string
  createdAt: number
  updatedAt?: number
}
