import fs from "fs/promises"

const baseUrl = `https://raw.githubusercontent.com/effect-app/boilerplate/refs/heads/main`
const vscode = `${baseUrl}/.vscode`
const snippets = [
  "model.code-snippets",
  "service.code-snippets"
]

export async function sync() {
  await Promise.all(snippets.map(async (snippet) => {
    const url = `${vscode}/${snippet}`
    const res = await fetch(url)
    const content = await res.text()
    await fs.writeFile(`.vscode/${snippet}`, content, "utf-8")
  }))
}
