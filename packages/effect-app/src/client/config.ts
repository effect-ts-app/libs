import { Context, Effect, type HashMap, Layer, type Option } from "../internal/lib.js"

export interface ApiConfig {
  apiUrl: string
  headers: Option<HashMap<string, string>>
}

const tag = Context.GenericTag<ApiConfig>("@services/tag")
export const layer = (config: ApiConfig) => Layer.succeed(tag, config)
export const ApiConfig = {
  Tag: tag,
  layer
}

export const getConfig = <R, E, A>(self: (cfg: ApiConfig) => Effect<A, E, R>) => Effect.flatMap(tag, self)
