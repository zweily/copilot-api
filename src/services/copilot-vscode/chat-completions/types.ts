interface Message {
  role: string
  content: string
}

export interface ChatCompletionsPayload {
  messages: Array<Message>
  model: string
  temperature?: number
  top_p?: number
  max_tokens?: number
  stop?: Array<string>
  n?: number
  stream?: boolean
}

// Response types

interface ContentFilterResult {
  filtered: boolean
  severity: "safe" | "low" | "medium" | "high" // Added possible severity values
}

interface ContentFilterResults {
  hate: ContentFilterResult
  self_harm: ContentFilterResult
  sexual: ContentFilterResult
  violence: ContentFilterResult
}

interface Choice {
  content_filter_results: ContentFilterResults
  finish_reason: string
  index: number
  message: {
    content: string
    role: "assistant" | "user" // Added possible role values
  }
}

interface PromptFilterResult {
  content_filter_results: ContentFilterResults
  prompt_index: number
}

interface UsageDetails {
  reasoning_tokens?: number
  cached_tokens?: number
}

interface Usage {
  completion_tokens: number
  completion_tokens_details: UsageDetails
  prompt_tokens: number
  prompt_tokens_details: UsageDetails
  total_tokens: number
}

export interface ChatCompletionResponse {
  choices: Array<Choice>
  created: number
  id: string
  model: string
  prompt_filter_results: Array<PromptFilterResult>
  system_fingerprint: string
  usage: Usage
}
