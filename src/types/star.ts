export interface Star {
  id: string
  name: string
  mass: number // Solar masses
  age: number // Years (default: 0)
  luminosity?: number
  temperature?: number // Kelvin
  radius?: number // Solar radii
  density?: number // Relative to Sun
  escapeVelocity?: number // km/s
  lifespan?: number
  classification?: string
  habitableZoneMin?: number
  habitableZoneMax?: number
  createdAt: number
}

export interface Planet {
  id: string
  starId: string
  name: string
  mass: number // Earth masses
  age: number // Years (default: 0)
  corePercentage: number // 0-100
  semiMajorAxis: number // AU
  eccentricity: number
  type: 'rock' | 'ice' | 'gas' // Planet type
  radius?: number // Earth radii
  density?: number // g/cm³
  surfaceGravity?: number // Earth gravities
  escapeVelocity?: number // km/s
  rotationPeriodHours?: number // Day length in hours
  inclination?: number // Orbital inclination in degrees
  axialTilt?: number // Axial tilt in degrees
  createdAt: number
}

export interface System {
  id: string
  name: string
  star: Star
  planets: Planet[]
  createdAt: number
}
