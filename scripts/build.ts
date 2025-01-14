import consola from "consola"
import spawn from "nano-spawn"

const process = await spawn("bun", [
  "build",
  "./src/main.ts",

  "--outfile",
  "./dist/copilot-api",

  "--compile",
  "--minify",
])

consola.log(process.output)
