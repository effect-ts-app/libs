export interface ApiConfig {
  apiUrl: string
  headers: Option<HashMap<string, string>>
}

const tag = Tag<ApiConfig>()
export const Live = (config: Config<ApiConfig>) => config.toLayer(tag)
export const ApiConfig = {
  Tag: tag,
  Live
}

export const getConfig = <R, E, A>(self: (cfg: ApiConfig) => Effect<R, E, A>) => tag.flatMap(self)
