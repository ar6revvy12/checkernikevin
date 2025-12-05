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
  status: "running" | "not-running"
  comments: string
  createdAt: number
  updatedAt: number
}

export type FunctionalStatus = FunctionalTest["status"]
