import { Config, Context, Effect, HashMap, Layer, Option } from "../internal/lib.js"

import { HttpClient, HttpClientRequest } from "../http.js"

export interface ApiConfig {
  url: string
  headers: Option<HashMap<string, string>>
}

export const DefaultApiConfig = Config.all({
  url: Config.string("apiUrl").pipe(Config.withDefault("/api")),
  headers: Config
    .hashMap(
      Config.string(),
      "headers"
    )
    .pipe(Config.option)
})

const apiClient = (config: ApiConfig) =>
  Effect.gen(function*() {
    const client = yield* HttpClient.HttpClient
    return {
      client: client.pipe(
        HttpClient.mapRequest(HttpClientRequest.prependUrl(config.url + "/rpc")),
        HttpClient.mapRequest(
          HttpClientRequest.setHeaders(config.headers.pipe(Option.getOrElse(() => HashMap.empty())))
        )
      )
    }
  })

export class ApiClient extends Context.TagId("ApiClient")<ApiClient, Effect.Success<ReturnType<typeof apiClient>>>() {
  static layer = (apiConfig: ApiConfig) => this.toLayer(apiClient(apiConfig))
  static layerFromConfig = DefaultApiConfig.pipe(Effect.map(this.layer), Layer.unwrapEffect)
}
