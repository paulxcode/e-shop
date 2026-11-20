"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

let sessionId: string | null = null
function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID()
  }
  return sessionId
}

export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPath = useRef("")

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    if (prevPath.current === url) return
    prevPath.current = url

    fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": getSessionId(),
      },
      body: JSON.stringify({
        event_type: "page_view",
        page_url: url,
      }),
    }).catch(() => {})
  }, [pathname, searchParams])

  const track = (event_type: string, event_data?: Record<string, unknown>) => {
    fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": getSessionId(),
      },
      body: JSON.stringify({
        event_type,
        event_data: event_data || {},
        page_url: pathname,
      }),
    }).catch(() => {})
  }

  return { track }
}
