export interface ApiConfig {
  apiUrl: string
  headers: Option<HashMap<string, string>>
}

const tag = GenericTag<ApiConfig>("@services/tag")
export const layer = (config: ApiConfig) => tag.makeLayer(config)
export const ApiConfig = {
  Tag: tag,
  layer
}

export const getConfig = <R, E, A>(self: (cfg: ApiConfig) => Effect<A, E, R>) => tag.flatMap(self)
