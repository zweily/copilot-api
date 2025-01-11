interface ChunkContent {
  type: "content"
  body: string
}

interface Reference {
  type: string
  ref: string
  repoID: number
  repoName: string
  repoOwner: string
  url: string
  path: string
  commitOID: string
  languageName: string
  languageID: number
  fileSize: number
  range: {
    start: number
    end: number
  }
  contents: string
  score: number
  algorithm: string
}

interface ChunkFunctionCall {
  type: "functionCall"
  name: string
  status: string
  arguments: string
  references: Array<Reference>
}

interface ChunkComplete {
  type: "complete"
  id: string
  turnId: string
  createdAt: string
  references: Array<Reference>
}

export type MessageChunk = ChunkContent | ChunkFunctionCall | ChunkComplete
