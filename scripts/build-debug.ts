import consola from "consola"
import spawn from "nano-spawn"

const process = await spawn("bun", [
  "build",
  "./src/main.ts",

  "--outfile",
  "./dist/copilot-api-debug",

  "--compile",
  "--sourcemap",
])

consola.log(process.output)
