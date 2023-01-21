import * as L from "./lens.js"

/**
 * @tsplus fluent fp-ts/optic/Optic replace_
 */
export function replace_<S, A>(l: Lens<S, A>, s: S, a: A) {
  return l.replace(a)(s)
}

/**
 * @tsplus fluent fp-ts/optic/Optic replaceIfDefined
 */
export const replaceIfDefined_ = L.replaceIfDefined_

/**
 * @tsplus fluent fp-ts/optic/Optic modifyM
 */
export const modifyM_ = L.modifyM_

/**
 * @tsplus fluent fp-ts/optic/Optic modifyConcat
 */
export const modifyConcat = L.modifyConcat

/**
 * @tsplus fluent fp-ts/optic/Optic modifyConcat_
 */
export const modifyConcat__ = L.modifyConcat_

/**
 * @tsplus fluent fp-ts/optic/Optic modifyM_
 */
export const modifyM__ = L.modifyM__

/**
 * @tsplus fluent fp-ts/optic/Optic modify_
 */
export const modify__ = L.modify__

/**
 * @tsplus fluent fp-ts/optic/Optic modify2M_
 */
export const modify2M__ = L.modify2M__

/**
 * @tsplus fluent fp-ts/optic/Optic modify2_
 */
export const modify2__ = L.modify2__

/**
 * @tsplus fluent fp-ts/optic/Optic modify2M
 */
export const modify2M_ = L.modify2M_

/**
 * @tsplus fluent fp-ts/optic/Optic modify2
 */
export const modify2_ = L.modify2_
