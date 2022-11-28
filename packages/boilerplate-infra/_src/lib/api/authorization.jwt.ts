// import { configM, UserSVC } from "@/services.js"
import * as Ex from "@effect-ts-app/infra/express/index"
import { expressjwt } from "express-jwt"
import jwtAuthz from "express-jwt-authz"
import jwksRsa from "jwks-rsa"

// Authorization middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
export const checkJwt = (audience: string, issuer: string) =>
  expressjwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}/.well-known/jwks.json`
    }) as jwksRsa.GetVerificationKey,

    // Validate the audience and the issuer.
    audience,
    issuer: [issuer + "/"],
    algorithms: ["RS256"]
  })

const demandScopes = jwtAuthz([])

// export const auth = configM(
//   (cfg) =>
//     cfg.AUTH_DISABLED
//       ? Effect.unit
//       : Ex.use(Ex.classic(checkJwt)) > Ex.use(Ex.classic(demandScopes)) // TODO
// )
export const scopes = Ex.classic(demandScopes)

/*
Layer.fromEffect(UserProfile)(
  configM(cfg => {
  const handleJwt = Ex.classic(
    checkJwt(cfg.AUTH0_AUDIENCE, cfg.AUTH0_ISSUER_BASE_URL)
  )
  return (
    cfg.AUTH_DISABLED
      ? Effect(null)
      : // eslint-disable-next-line @typescript-eslint/no-empty-function
        handleJwt(req, res, () => scopes(req, res, () => {}))
  ).zipRight(
    cfg.AUTH_DISABLED
   // ..
*/
