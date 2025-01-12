import { copilotWeb } from "../api-instance"

interface Thread {
  id: string
  name: string
  repoID: number
  repoOwnerID: number
  createdAt: string
  updatedAt: string
  associatedRepoIDs: Array<number>
}

interface CreateThreadResponse {
  thread_id: string
  thread: Thread
}
export const createThread = () =>
  copilotWeb<CreateThreadResponse>("/github/chat/threads", {
    method: "POST",
    body: null,
  })
