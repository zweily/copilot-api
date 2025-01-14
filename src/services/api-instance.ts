import consola from "consola"
import { FetchError, ofetch } from "ofetch"

import { TOKENS } from "~/config/tokens"

export const copilot = ofetch.create({
  baseURL: "https://api.individual.githubcopilot.com",
  headers: {
    "copilot-integration-id": "vscode-chat",
  },

  onRequest({ options }) {
    options.headers.set("authorization", `Bearer ${TOKENS.COPILOT_TOKEN}`)
  },

  onRequestError({ error, options }) {
    if (error instanceof FetchError) {
      consola.error(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        `Request failed: ${options.body} \n ${error}`,
      )
    }
  },

  onResponseError({ error, response, options }) {
    if (error instanceof FetchError) {
      consola.error(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        `Request failed: ${options.body} \n ${error} \n with response: ${JSON.stringify(response)}`,
      )
    }
  },
})

export const github = ofetch.create({
  baseURL: "https://api.github.com",

  onRequest({ options }) {
    options.headers.set("authorization", `token ${TOKENS.GITHUB_TOKEN}`)
  },
})

// Only used for device flow auth
export const _github = ofetch.create({
  baseURL: "https://github.com",
})
