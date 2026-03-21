"use client"

import { startTransition, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { authStore } from "@/stores/authStore"
import { LoadingState } from "@/shared/components/loadingState"

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace("/login")
      return
    }
    startTransition(() => setChecking(false))

    const unsubscribe = authStore.subscribe((state) => {
      if (!state.accessToken) {
        router.replace("/login")
      }
    })

    return unsubscribe
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState variant="page" className="max-w-lg" />
      </div>
    )
  }

  return <>{children}</>
}
