import * as MO from "./Schema"

export const positiveInt = MO.Constructor.for(MO.positiveInt)
export const positiveIntUnsafe = positiveInt["|>"](MO.unsafe)
export const reasonableString = MO.Constructor.for(MO.reasonableString)
export const reasonableStringUnsafe = reasonableString["|>"](MO.unsafe)
export const longString = MO.Constructor.for(MO.longString)
export const longStringUnsafe = longString["|>"](MO.unsafe)

export const nonEmptyString = MO.Constructor.for(MO.nonEmptyString)
export const nonEmptyStringUnsafe = nonEmptyString["|>"](MO.unsafe)

export const email = MO.Constructor.for(MO.Email)
export const emailUnsafe = email["|>"](MO.unsafe)
export const phoneNumber = MO.Constructor.for(MO.PhoneNumber)
export const phoneNumberUnsafe = phoneNumber["|>"](MO.unsafe)

export const uuid = MO.Constructor.for(MO.UUID)
export const uuidUnsafe = uuid["|>"](MO.unsafe)
