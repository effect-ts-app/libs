export interface ApiConfig {
  apiUrl: string
  headers?: Record<string, string>
}

const tag = Tag<ApiConfig>()
export const Live = (config: ApiConfig) => Layer.fromValue(tag, config)
export const ApiConfig = {
  Tag: tag,
  Live
}

export const getConfig = <R, E, A>(self: (cfg: ApiConfig) => Effect<R, E, A>) => Effect.serviceWithEffect(tag, self)
