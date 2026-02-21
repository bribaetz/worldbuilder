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
  albedo?: number // Surface albedo (0-1)
  atmosphericPressure?: number // Pressure in bars
  oxygenPercentage?: number // O2 percentage (0-100)
  nitrogenPercentage?: number // N2 percentage (0-100)
  argonPercentage?: number // Ar percentage (0-100)
  co2Percentage?: number // CO2 percentage (0-100)
  greenhouseEffect?: number // Greenhouse effect strength (0-100)
  surfaceTemperature?: number // Average surface temperature in Celsius
  moons?: Moon[] // Array of moons
  createdAt: number
}
export interface Moon {
  id: string
  planetId: string
  name: string
  mass: number // Earth masses
  type: 'rock' | 'ice'
  radius?: number // Earth radii
  density?: number // g/cm³
  semiMajorAxisKm: number // Semi-major axis in km
  eccentricity: number
  atmosphericPressure: number // Pressure in bars (0+)
  orbitalPeriodDays?: number // Orbital period in days
  rotationPeriodHours?: number // Rotation period in hours
  apoapsis?: number // Apoapsis in km
  periapsis?: number // Periapsis in km
  createdAt: number
}

export interface DebrisBelt {
  id: string
  starId: string
  name: string
  type: 'rock' | 'ice' // Debris belt composition
  innerAU: number // Inner radius in AU
  outerAU: number // Outer radius in AU
  age: number // Years (default: 0)
  createdAt: number
}

export interface System {
  id: string
  name: string
  star: Star
  planets: Planet[]
  debrisBelts?: DebrisBelt[]
  createdAt: number
}
