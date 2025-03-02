import * as z from "zod"

const ContentFilterResultsSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
  hate: z.object({
    filtered: z.boolean(),
    severity: z.string(),
  }),
  self_harm: z.object({
    filtered: z.boolean(),
    severity: z.string(),
  }),
  sexual: z.object({
    filtered: z.boolean(),
    severity: z.string(),
  }),
  violence: z.object({
    filtered: z.boolean(),
    severity: z.string(),
  }),
})

const ContentFilterOffsetsSchema = z.object({
  check_offset: z.number(),
  start_offset: z.number(),
  end_offset: z.number(),
})

const DeltaSchema = z.object({
  content: z.string().optional(),
  role: z.string().optional(),
})

const ChoiceSchema = z.object({
  index: z.number(),
  content_filter_offsets: ContentFilterOffsetsSchema.optional(),
  content_filter_results: ContentFilterResultsSchema.optional(),
  delta: DeltaSchema,
  finish_reason: z.string().nullable().optional(),
})

const PromptFilterResultSchema = z.object({
  content_filter_results: ContentFilterResultsSchema,
  prompt_index: z.number(),
})

const UsageSchema = z.object({
  completion_tokens: z.number(),
  prompt_tokens: z.number(),
  total_tokens: z.number(),
})

export const ChatCompletionChunkSchema = z.object({
  choices: z.array(ChoiceSchema),
  created: z.number(),
  object: z.literal("chat.completion.chunk"),
  id: z.string(),
  model: z.string(),
  system_fingerprint: z.string().optional(),
  prompt_filter_results: z.array(PromptFilterResultSchema).optional(),
  usage: UsageSchema.nullable().optional(),
})

export type ContentFilterResults = z.infer<typeof ContentFilterResultsSchema>
export type ContentFilterOffsets = z.infer<typeof ContentFilterOffsetsSchema>
export type Delta = z.infer<typeof DeltaSchema>
export type Choice = z.infer<typeof ChoiceSchema>
export type PromptFilterResult = z.infer<typeof PromptFilterResultSchema>
export type Usage = z.infer<typeof UsageSchema>
export type ChatCompletionChunk = z.infer<typeof ChatCompletionChunkSchema>
