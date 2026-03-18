"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { ProgressRecordsTab } from "@/features/progress/components/progressRecordsTab"
import { ProgressPhotosTab } from "@/features/progress/components/progressPhotosTab"

interface StudentProgressSectionProps {
  studentId: string
}

export function StudentProgressSection({ studentId }: StudentProgressSectionProps) {
  const [activeTab, setActiveTab] = useState("records")

  return (
    <div className="space-y-4" data-testid="student-progress-section">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="records">Métricas</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4">
          <ProgressRecordsTab studentId={studentId} />
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          <ProgressPhotosTab studentId={studentId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
