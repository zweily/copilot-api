import { chatCompletions } from "./services/copilot-vscode/chat-completions/service"

const gen = chatCompletions({
  messages: [
    {
      content:
        "Hey how do write a factorial function in typescript in functional programming style",
      role: "user",
    },
  ],
  model: "gpt-4o-mini",
})

for await (const chunk of gen) {
  console.log(chunk)
}
