import * as L from "../lens.js"

/**
 * @tsplus fluent ets/Lens set_
 */
export function set_<S, A>(l: Lens<S, A>, s: S, a: A) {
  return l.set(a)(s)
}

/**
 * @tsplus fluent ets/Lens setIfDefined
 */
export const setIfDefined_ = L.setIfDefined_

/**
 * @tsplus fluent ets/Lens modifyM
 */
export const modifyM_ = L.modifyM_

/**
 * @tsplus fluent ets/Lens modifyConcat
 */
export const modifyConcat = L.modifyConcat

/**
 * @tsplus fluent ets/Lens modifyConcat_
 */
export const modifyConcat__ = L.modifyConcat_

/**
 * @tsplus fluent ets/Lens modifyM_
 */
export const modifyM__ = L.modifyM__

/**
 * @tsplus fluent ets/Lens modify_
 */
export const modify__ = L.modify__

/**
 * @tsplus fluent ets/Lens modify2M_
 */
export const modify2M__ = L.modify2M__

/**
 * @tsplus fluent ets/Lens modify2_
 */
export const modify2__ = L.modify2__

/**
 * @tsplus fluent ets/Lens modify2M
 */
export const modify2M_ = L.modify2M_

/**
 * @tsplus fluent ets/Lens modify2
 */
export const modify2_ = L.modify2_
