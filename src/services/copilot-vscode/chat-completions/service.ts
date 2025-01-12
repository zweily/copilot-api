import { FetchError } from "ofetch"

import type { ChatCompletionsPayload } from "./types"

import {
  COPILOT_VSCODE_BASE_URL,
  COPILOT_VSCODE_HEADERS,
  copilotVSCode,
} from "../api-instance"

export async function* chatCompletions(payload: ChatCompletionsPayload) {
  try {
    const response = await copilotVSCode.native(
      COPILOT_VSCODE_BASE_URL + "/chat/completions",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: COPILOT_VSCODE_HEADERS,
      },
    )

    console.log(await response.text())

    // if (!response.body) {
    //   throw new Error("No response body")
    // }

    // const reader = response.body.getReader()

    // // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    // while (true) {
    //   const { done, value } = await reader.read()

    //   if (done) {
    //     console.log("done")
    //     console.log(value)
    //     break
    //   }

    //   console.log("value", value)
    // }

    // for await (const chunk of response.body) {
    //   console.log(chunk)
    // }

    yield "tono"
  } catch (e) {
    console.error(e)
    if (e instanceof FetchError) {
      console.error(e.response?._data)
    }
  }
}
