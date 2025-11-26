"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const packages = [
  {
    id: "package1",
    name: "Package 1",
    description: "6x5 Reels, Eight of a Kind",
    config: "Max Win: 21,000x",
  },
  {
    id: "package2",
    name: "Package 2",
    description: "5x3 Reels, 20 Paylines",
    config: "Max Win: 6,750x",
  },
  {
    id: "package3",
    name: "Package 3",
    description: "6x5 Reels, Eight of a Kind",
    config: "Max Win: 21,000x",
  },
  {
    id: "package4",
    name: "Package 4",
    description: "3x5 Reels, 10 Winlines",
    config: "Max Win: 2,100x",
  },
  {
    id: "package5",
    name: "Package 5",
    description: "7x7 Grid, 5 Connected",
    config: "Max Win: 2,100x",
  },
]

interface PackageSelectorProps {
  selectedPackage: string
  onPackageChange: (packageId: string) => void
}

export function PackageSelector({ selectedPackage, onPackageChange }: PackageSelectorProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Game Package</h2>
      <Select value={selectedPackage} onValueChange={onPackageChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {packages.map((pkg) => (
            <SelectItem key={pkg.id} value={pkg.id}>
              {pkg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-6 space-y-4">
        {packages.map(
          (pkg) =>
            pkg.id === selectedPackage && (
              <div key={pkg.id} className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                <p className="mt-2 text-sm font-mono text-accent-foreground">{pkg.config}</p>
              </div>
            ),
        )}
      </div>
    </Card>
  )
}
