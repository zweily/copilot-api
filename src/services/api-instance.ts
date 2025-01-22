import consola from "consola"
import { FetchError, ofetch } from "ofetch"

import { COPILOT_CONFIG, GITHUB_CONFIG, GITHUB_WEB_CONFIG } from "~/config/api"
import { TOKENS } from "~/lib/tokens"

export const copilot = ofetch.create({
  baseURL: COPILOT_CONFIG.baseURL,
  headers: COPILOT_CONFIG.headers,

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
  baseURL: GITHUB_CONFIG.baseURL,

  onRequest({ options }) {
    options.headers.set("authorization", `token ${TOKENS.GITHUB_TOKEN}`)
  },
})

// Only used for device flow auth
export const _github = ofetch.create({
  baseURL: GITHUB_WEB_CONFIG.baseURL,
})
