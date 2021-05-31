// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as fc from "fast-check"

export type { Arbitrary } from "fast-check"
type FC = typeof fc

export type { FC }

export const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
export const ALPHABET_UC = ALPHABET.toUpperCase()

// uppercase A-Z
const UC_char = (fc: FC) => fc.integer(0x41, 0x5a).map(String.fromCharCode)
export const UC_alphabet = (min: number, max: number) => (fc: FC) =>
  fc.array(UC_char(fc), min, max).map((arr) => arr.join(""))
// lowercase A-Z
const LC_char = (fc: FC) => fc.integer(0x61, 0x7a).map(String.fromCharCode)
export const LC_alphabet = (min: number, max: number) => (fc: FC) =>
  fc.array(LC_char(fc), min, max).map((arr) => arr.join(""))

// numbers 0-9
const N_char = (fc: FC) => fc.integer(0x30, 0x39).map(String.fromCharCode)
export const Numbers = (min: number, max: number) => (fc: FC) =>
  fc.array(N_char(fc), min, max).map((arr) => arr.join(""))
