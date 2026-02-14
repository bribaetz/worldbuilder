/**
 * Astronomy calculations for star properties





































































































































































































</style>  }    padding: 0 8px;  .col-period {  .col-distance,  .col-orbit,  }    background: rgba(97, 218, 251, 0.05);  .table-row:hover {  }    border-bottom: none;  .table-row:last-child {  }    color: #e0e0e0;    font-size: 0.9rem;    font-family: monospace;    border-bottom: 1px solid rgba(255, 255, 255, 0.05);    padding: 10px 12px;    gap: 1px;    grid-template-columns: 80px 150px 150px 1fr;    display: grid;  .table-row {  }    border-bottom: 1px solid rgba(97, 218, 251, 0.2);    font-size: 0.85rem;    color: #61dafb;    font-weight: 600;    padding: 12px;    background: rgba(97, 218, 251, 0.1);    gap: 1px;    grid-template-columns: 80px 150px 150px 1fr;    display: grid;  .table-header {  }    border: 1px solid rgba(255, 255, 255, 0.05);    overflow: hidden;    border-radius: 4px;    background: rgba(0, 0, 0, 0.2);    gap: 0;    flex-direction: column;    display: flex;  .orbits-table {  }    color: #61dafb;    margin-bottom: 12px;    margin-top: 0;  .orbits-display h4 {  }    margin-top: 20px;  .orbits-display {  }    background: rgba(97, 218, 251, 0.08);    border-color: #61dafb;    outline: none;  .form-group input:focus {  }    font-family: monospace;    font-size: 0.95rem;    border-radius: 4px;    padding: 8px 12px;    color: #e0e0e0;    border: 1px solid rgba(255, 255, 255, 0.1);    background: rgba(255, 255, 255, 0.05);  .form-group input {  }    font-weight: 500;    color: #a0a0a0;    font-size: 0.9rem;  .form-group label {  }    gap: 5px;    flex-direction: column;    display: flex;  .form-group {  }    margin-bottom: 20px;    gap: 15px;    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));    display: grid;  .calculator-form {  }    font-size: 0.9rem;    color: #a0a0a0;    margin: 0 0 15px 0;  .description {  }    color: #61dafb;    margin-bottom: 10px;    margin-top: 0;  .bodes-calculator h3 {  }    margin-top: 20px;    padding: 20px;    border-radius: 8px;    border: 1px solid rgba(255, 255, 255, 0.1);    background: rgba(255, 255, 255, 0.03);  .bodes-calculator {<style></div>  {/if}    </div>      </div>        {/each}          </div>            <div class="col-period">{calculateOrbitalPeriodDays(orbit, starMass).toFixed(1)}</div>            <div class="col-distance">{(orbit * 149_597_871).toFixed(0)}</div>            <div class="col-distance">{orbit.toFixed(4)}</div>            <div class="col-orbit">{idx + 1}</div>          <div class="table-row">        {#each orbits as orbit, idx (idx)}        </div>          <div class="col-period">Orbital Period (days)</div>          <div class="col-distance">Distance (km)</div>          <div class="col-distance">Distance (AU)</div>          <div class="col-orbit">Orbit #</div>        <div class="table-header">      <div class="orbits-table">      <h4>Generated Orbits</h4>    <div class="orbits-display">  {#if orbits.length > 0}  </div>    </div>      />        bind:value={numOrbits}        step="1"        max="20"        min="1"        type="number"        id="numOrbits"      <input      <label for="numOrbits">Number of Orbits</label>    <div class="form-group">    </div>      />        bind:value={spacingFactor}        step="0.01"        max="10"        min="0.01"        type="number"        id="spacingFactor"      <input      <label for="spacingFactor">Spacing Factor</label>    <div class="form-group">    </div>      />        bind:value={initialDistance}        step="0.01"        max="100"        min="0.01"        type="number"        id="initialDistance"      <input      <label for="initialDistance">Initial Orbital Distance (AU)</label>    <div class="form-group">  <div class="calculator-form">  <p class="description">Generate a list of stable planetary orbits using Bode's Law</p>  <h3>Bode's Law Orbit Calculator</h3><div class="bodes-calculator"></script>  }    calculateOrbits()  $: {  // Calculate on mount with defaults  }    orbits = generateBodesLawOrbits(initialDistance, spacingFactor, numOrbits)  function calculateOrbits() {  let orbits: number[] = []  let numOrbits = 8  let spacingFactor = 0.3  let initialDistance = 0.4  export let starMass: number = 1.0 */

// Constants
const SOLAR_LUMINOSITY = 3.828e26 // watts
const SOLAR_MASS = 1.989e30 // kg
const SOLAR_LIFETIME = 10e9 // years
const STEFAN_BOLTZMANN = 5.670374419e-8 // W·m⁻²·K⁻⁴

/**
 * Calculate star luminosity from mass using main sequence relation
 * Using: L/Lsun ≈ (M/Msun)^3.5 for typical stars
 */
export function calculateLuminosity(mass: number): number {
  if (mass <= 0) return 0

  // Use user-supplied piecewise log10 relations where available.
  // For extremely low masses below the first provided range, fallback to a gentle power law.
  if (mass <= 0.179) {
    return 0.23 * Math.pow(mass, 2.3)
  }

  const logM = Math.log10(mass)

  if (mass <= 0.45) {
    // 0.179 < M <= 0.45: L ≈ 10^(2.2028*logM - 0.976)
    return Math.pow(10, 2.2028 * logM - 0.976)
  }

  if (mass <= 0.72) {
    // 0.45 -> 0.72: L ≈ 10^(4.572*logM - 0.102)
    return Math.pow(10, 4.572 * logM - 0.102)
  }

  if (mass <= 1.05) {
    // 0.72 -> 1.05: L ≈ 10^(5.743*logM - 0.007)
    // adjust offset so L(1.0) == 1.0
    return Math.pow(10, 5.743 * logM + 0.0)
  }

  if (mass <= 2.4) {
    // 1.05 -> 2.4: L ≈ 10^(4.329*logM + 0.010)
    return Math.pow(10, 4.329 * logM + 0.01)
  }

  if (mass <= 7) {
    // 2.4 -> 7: L ≈ 10^(3.967*logM + 0.093)
    return Math.pow(10, 3.967 * logM + 0.093)
  }

  // 7+ : L ≈ 10^(2.865*logM + 1.105)
  return Math.pow(10, 2.865 * logM + 1.105)
}

/**
 * Calculate main sequence lifespan from mass
 * Using: t/tsun ≈ (M/Msun)^-2.5
 */
export function calculateLifespan(mass: number): number {
  if (mass <= 0) return 0

  // Use fuel / luminosity approximation: t ≈ t_sun * (M / L)
  // This reflects that main-sequence lifetime scales with available fuel (≈ mass)
  // divided by the rate of consumption (luminosity).
  const luminosity = calculateLuminosity(mass)
  if (luminosity <= 0) return 0
  return SOLAR_LIFETIME * (mass / luminosity)
}

/**
 * Calculate habitable zone boundaries (conservative estimate)
 * Using Earth as reference and inverse square law
 */
export function calculateHabitableZone(luminosity: number): { min: number; max: number } {
  // Conservative habitable zone (Venus-Mars equivalent distances)
  const min = Math.sqrt(luminosity / 1.5)
  const max = Math.sqrt(luminosity / 0.3)
  return { min: parseFloat(min.toFixed(3)), max: parseFloat(max.toFixed(3)) }
}

/**
 * Get stellar classification from mass
 * Returns full spectral classification (e.g., K9V, G2V, O5V)
 * Includes spectral type, subtype, and luminosity class
 */
export function getSpectralClassification(mass: number): string {
  let spectralType: string
  let subType: number

  // Spectral type based on mass
  if (mass > 16) {
    spectralType = 'O'
    subType = Math.max(0, Math.min(9, Math.floor((mass - 16) / 10 * 9)))
  } else if (mass > 2.1) {
    spectralType = 'B'
    subType = Math.max(0, Math.min(9, Math.floor(10 - (mass - 2.1) / 3.9 * 10)))
  } else if (mass > 1.4) {
    spectralType = 'A'
    subType = Math.max(0, Math.min(9, Math.floor(10 - (mass - 1.4) / 0.7 * 10)))
  } else if (mass > 1.04) {
    spectralType = 'F'
    subType = Math.max(0, Math.min(9, Math.floor(10 - (mass - 1.04) / 0.36 * 10)))
  } else if (mass > 0.8) {
    spectralType = 'G'
    subType = Math.max(0, Math.min(9, Math.floor(10 - (mass - 0.8) / 0.24 * 10)))
  } else if (mass > 0.45) {
    spectralType = 'K'
    subType = Math.max(0, Math.min(9, Math.floor(10 - (mass - 0.45) / 0.35 * 10)))
  } else {
    spectralType = 'M'
    subType = Math.max(0, Math.min(9, Math.floor(10 - mass / 0.45 * 10)))
  }

  // Luminosity class (main sequence = V)
  const luminosityClass = 'V'

  return `${spectralType}${subType}${luminosityClass}`
}

/**
 * Convert age in years to human-readable format
 */
export function formatAge(years: number): string {
  if (years < 1000) return `${years.toFixed(0)} years`
  if (years < 1e6) return `${(years / 1000).toFixed(1)}k years`
  if (years < 1e9) return `${(years / 1e6).toFixed(1)}M years`
  return `${(years / 1e9).toFixed(2)}B years`
}

/**
 * Calculate orbital period using Kepler's third law
 * P^2 = a^3 (where P is in years, a is in AU)
 */
export function calculateOrbitalPeriod(semiMajorAxis: number): number {
  return Math.sqrt(Math.pow(semiMajorAxis, 3))
}

/**
 * Check if a star is currently in the main sequence
 * A star is in main sequence if its age < lifespan
 */
export function isInMainSequence(age: number, lifespan: number): boolean {
  return age < lifespan
}

/**
 * Calculate stellar evolution stage
 */
export function getStellarStage(age: number, lifespan: number): string {
  const fraction = age / lifespan
  if (fraction < 0.1) return 'Early Main Sequence'
  if (fraction < 0.9) return 'Main Sequence'
  if (fraction < 1.0) return 'Late Main Sequence'
  return 'Post-Main Sequence'
}

/**
 * Calculate stellar surface temperature from mass
 * Uses main sequence mass-temperature relationship
 * Returns temperature in Kelvin
 */
export function calculateTemperature(mass: number): number {
  // Compute effective temperature using Stefan-Boltzmann law:
  // L = 4πR²σT⁴  =>  T = (L / (4πR²σ))^(1/4)
  if (mass <= 0) return 0

  const lumSolar = calculateLuminosity(mass)
  const radiusSolar = calculateRadius(mass)
  if (lumSolar <= 0 || radiusSolar <= 0) return 0

  const luminosityWatts = lumSolar * SOLAR_LUMINOSITY
  const radiusMeters = radiusSolar * SOLAR_RADIUS_KM * 1000

  const temp = Math.pow(luminosityWatts / (4 * Math.PI * STEFAN_BOLTZMANN * Math.pow(radiusMeters, 2)), 0.25)
  return temp
}

/**
 * Get star color from temperature (hex color)
 * Uses accurate stellar color mapping based on effective temperature
 * Colors are optimized for brightness and visibility
 */
export function getStarColor(temperature: number): string {
  // O-type stars: 30,000K+ (bright blue)
  if (temperature >= 30000) return '#0080ff'
  // B-type stars: 10,000-30,000K (blue)
  if (temperature >= 10000) return '#0099ff'
  // A-type stars: 7,500-10,000K (bright white-blue)
  if (temperature >= 7500) return '#ffffff'
  // F-type stars: 6,000-7,500K (white)
  if (temperature >= 6000) return '#fffaf0'
  // G-type stars: 5,200-6,000K (yellow, like our Sun at 5778K)
  if (temperature >= 5200) return '#ffff99'
  // K-type stars: 3,700-5,200K (orange)
  if (temperature >= 3700) return '#ffcc00'
  // M-type stars: <3,700K (red)
  return '#ff6600'
}

/**
 * Calculate stellar radius from mass using mass-radius relationship
 * For main sequence stars: R ≈ M^0.57 (empirical relationship)
 * Returns radius in solar radii (R☉)
 */
export function calculateRadius(mass: number): number {
  if (mass <= 0) return 0

  // Use polynomial approximation supplied by user where reasonable:
  // R ≈ 0.438 M^2 + 0.479 M + 0.075 (units: solar radii)
  // tweak constant term so R(1.0) == 1.0
  const r = 0.438 * mass * mass + 0.479 * mass + 0.083

  // For extremely high masses the polynomial may not be suitable; fall back to a power law
  if (mass > 50) {
    return Math.pow(mass, 0.57)
  }

  return r
}

/**
 * Calculate stellar density
 * Returns density relative to the Sun (solar densities)
 * Sun's density = 1.408 g/cm³
 */
export function calculateDensity(mass: number): number {
  if (mass <= 0) return 0
  const radius = calculateRadius(mass)
  if (radius === 0) return 0
  // Density = Mass / Volume
  // Volume of sphere = (4/3) * π * r³
  // Relative to sun: ρ = M / R³
  return mass / Math.pow(radius, 3)
}

/**
 * Calculate escape velocity from a star's surface
 * Returns velocity in km/s
 * Formula: v_e = sqrt(2 * G * M / R)
 */
export function calculateEscapeVelocity(mass: number): number {
  if (mass <= 0) return 0
  const radius = calculateRadius(mass)
  if (radius === 0) return 0
  // Solar escape velocity = 617.5 km/s
  // v_e ∝ sqrt(M/R)
  const solarEscapeVelocity = 617.5
  return solarEscapeVelocity * Math.sqrt(mass / radius)
}

// Constants for unit conversions
export const SOLAR_RADIUS_KM = 695700
export const SOLAR_DENSITY_G_CM3 = 1.408
export const EARTH_RADIUS_KM = 6371
export const EARTH_MASS_KG = 5.972e24
export const EARTH_SURFACE_GRAVITY_MS2 = 9.80665

/**
 * Convert stellar radius from solar radii to kilometers
 */
export function radiusToKm(radiusSolar: number): number {
  return radiusSolar * SOLAR_RADIUS_KM
}

/**
 * Convert stellar density from solar densities to g/cm³
 */
export function densityToGcm3(densitySolar: number): number {
  return densitySolar * SOLAR_DENSITY_G_CM3
}

/**
 * Calculate planet radius from mass and type
 * Uses empirical relationships for different planet types
 * Type: 'rock' | 'ice' | 'gas'
 */
export function calculatePlanetRadius(mass: number, type: 'rock' | 'ice' | 'gas'): number {
  if (mass <= 0) return 0

  // Empirical mass-radius relations for different planet types
  if (type === 'rock' || type === 'terrestrial') {
    // Terrestrial: R ≈ M^0.27 (rocky planets like Earth)
    return Math.pow(mass, 0.27)
  } else if (type === 'ice') {
    // Ice/Neptune-like: R ≈ M^0.33 (larger for same mass due to ices)
    return Math.pow(mass, 0.33)
  } else {
    // Gas giants: adopt a Jupiter-normalized plateau for large gas giants.
    // For small gas planets keep a gentle scaling; for large planets return near-Jupiter radius.
    const jupiterMassEarth = 317.8
    const jupiterRadiusEarth = 11.209 // approximate Jupiter radius in Earth radii

    if (mass < 50) {
      // low-mass gas/mini-Neptune regime: gentle scaling
      return Math.pow(mass, 0.2) + 0.8
    }

    // Above ~50 Earth masses radius varies weakly with mass; use a very small exponent around Jupiter
    const exponent = 0.01
    return jupiterRadiusEarth * Math.pow(mass / jupiterMassEarth, exponent)
  }
}

/**
 * Calculate planet density from mass and radius
 * Returns density in g/cm³
 */
export function calculatePlanetDensity(
  massEarth: number,
  radiusEarth: number,
  type: 'rock' | 'ice' | 'gas' = 'rock',
  corePercentage: number = 0
): number {
  if (radiusEarth <= 0) return 0

  // Base physical density from mass/volume (g/cm³)
  const masKg = massEarth * EARTH_MASS_KG
  const radiusKm = radiusEarth * EARTH_RADIUS_KM
  const volumeKm3 = (4 / 3) * Math.PI * Math.pow(radiusKm, 3)
  const volumeCm3 = volumeKm3 * 1e15
  const massG = masKg * 1000
  let baseDensity = massG / volumeCm3

  // Apply type adjustment multipliers to reflect composition differences
  // ice planets are less dense; gas giants use a slight boost to match Jupiter's actual density
  const typeMultiplier = type === 'ice' ? 0.65 : type === 'gas' ? 1.063 : 1.0
  baseDensity = baseDensity * typeMultiplier

  // For gas planets, use the calculated density as-is (no distinct core model).
  // For rock and ice planets, blend in a dense core component.
  if (type === 'gas') {
    return baseDensity
  }

  // Blend core contribution for rock/ice: tuned core density to match Earth's actual density
  // Core density set to ~5.6 g/cm³ to produce Earth (1 M⊕, 33% core) ≈ 5.51 g/cm³
  const coreFrac = Math.max(0, Math.min(100, corePercentage)) / 100
  const coreDensity = type === 'ice' ? 5.0 : 5.6
  const finalDensity = baseDensity * (1 - coreFrac) + coreDensity * coreFrac
  return finalDensity
}

/**
 * Calculate planet surface gravity
 * Returns g (Earth gravities, where Earth = 1.0)
 */
export function calculateSurfaceGravity(massEarth: number, radiusEarth: number): number {
  if (radiusEarth <= 0) return 0

  // Surface gravity: g = GM/R²
  // Relative to Earth: g_planet = (M_planet/M_earth) / (R_planet/R_earth)²
  return massEarth / (radiusEarth * radiusEarth)
}

/**
 * Calculate planet escape velocity
 * Returns velocity in km/s
 */
export function calculatePlanetEscapeVelocity(
  massEarth: number,
  radiusEarth: number
): number {
  if (radiusEarth <= 0) return 0

  // Earth's surface escape velocity is 11.2 km/s
  // v_escape = v_earth * sqrt(M_planet/M_earth) / (R_planet/R_earth)
  const earthEscapeVelocity = 11.2

  return (
    earthEscapeVelocity *
    Math.sqrt(massEarth) /
    radiusEarth
  )
}

/**
 * Convert planet radius from Earth radii to kilometers
 */
export function planetRadiusToKm(radiusEarth: number): number {
  return radiusEarth * EARTH_RADIUS_KM
}

/**
 * Convert gravity from Earth g to m/s^2
 */
export function gravityToMs2(gEarth: number): number {
  return gEarth * EARTH_SURFACE_GRAVITY_MS2
}

/**
 * Calculate periapsis (closest approach) from semi-major axis and eccentricity (AU)
 */
export function calculatePeriapsis(aAU: number, e: number): number {
  return aAU * (1 - e)
}

/**
 * Calculate apoapsis (farthest distance) from semi-major axis and eccentricity (AU)
 */
export function calculateApoapsis(aAU: number, e: number): number {
  return aAU * (1 + e)
}

/**
 * Calculate orbital period (in days) using Kepler's third law
 * a in AU, M in solar masses -> P(years) = sqrt(a^3 / M)
 */
export function calculateOrbitalPeriodDays(aAU: number, starMassSolar: number): number {
  if (aAU <= 0 || starMassSolar <= 0) return 0
  const periodYears = Math.sqrt(Math.pow(aAU, 3) / starMassSolar)
  return periodYears * 365.25
}

/**
 * Generate a list of potential planetary orbits using Bode's Law
 * Bode's Law: a_n = a0 + spacing * 2^n (where a0 is initial distance, spacing is the growth factor)
 * Returns an array of semi-major axes in AU
 */
export function generateBodesLawOrbits(
  initialDistance: number,
  spacingFactor: number,
  numOrbits: number = 12
): number[] {
  if (initialDistance <= 0 || spacingFactor <= 0 || numOrbits <= 0) {
    return []
  }

  const orbits: number[] = []
  for (let n = 0; n < numOrbits; n++) {
    const semiMajorAxis = initialDistance + spacingFactor * Math.pow(2, n)
    orbits.push(parseFloat(semiMajorAxis.toFixed(4)))
  }
  return orbits
}

