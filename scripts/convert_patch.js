import fs from "fs"

fs.readdirSync("./patches").filter(_ => _.slice(1).includes("@")).forEach((f) => 
{
  let [packageName_, maybeVersion, version] = f.replace(".patch", "").split("@")
  const packageName = (version ? ("@" + maybeVersion) : packageName_).split("__").join("/")
  version = version ?? maybeVersion
  console.log({packageName, version})
  const content = fs.readFileSync(`./patches/${f}`, "utf-8").replaceAll(" a/", ` a/node_modules/${packageName}/`).replaceAll(" b/", ` b/node_modules/${packageName}/`)
  fs.writeFileSync(`./patches/${packageName.replace("/", "+")}+${version}.patch`, content)
})