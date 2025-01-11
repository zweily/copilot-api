import { Effect } from "effect"

import { copilot } from "../api-instance"

interface Thread {
  id: string
  name: string
  repoID: number
  repoOwnerID: number
  createdAt: string
  updatedAt: string
  associatedRepoIDs: Array<number>
}

interface ThreadResponse {
  thread_id: string
  thread: Thread
}
export const createThread = () =>
  Effect.tryPromise(() =>
    copilot<ThreadResponse>("/github/chat/threads", {
      method: "POST",
      body: null,
    }),
  )
