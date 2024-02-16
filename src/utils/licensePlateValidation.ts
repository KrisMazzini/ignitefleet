const LICENSE_PLATE_REGEX = /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/

export function validateLicensePlate(licensePlate: string) {
  return LICENSE_PLATE_REGEX.test(licensePlate.toUpperCase())
}
