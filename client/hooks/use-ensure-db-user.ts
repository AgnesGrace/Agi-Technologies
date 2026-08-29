"use client"

import { useSyncClerkUserMutation } from "@/state/api"
import { useUser } from "@clerk/nextjs"
import { useEffect, useRef } from "react"

/**
 * Upserts the signed-in Clerk user into our Postgres `User` table once per
 * dashboard session. Course authoring and enrollments require that row.
 */
export function useEnsureDbUser() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [syncClerkUser] = useSyncClerkUserMutation()
  const syncedForUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return
    if (syncedForUserId.current === user.id) return

    syncedForUserId.current = user.id
    void syncClerkUser()
  }, [isLoaded, isSignedIn, user?.id, syncClerkUser])
}
