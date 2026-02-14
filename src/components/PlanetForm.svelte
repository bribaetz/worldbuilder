<script lang="ts">
  import { addPlanet } from '$lib/stores/systems'
  import { generateId, parseAgeInput } from '$lib/utils/helpers'
  import {
    calculatePlanetRadius,
    calculatePlanetDensity,
    calculateSurfaceGravity,
    calculatePlanetEscapeVelocity,
    isHabitable
  } from '$lib/utils/astronomy'
  import type { Planet } from '../types/star'

  export let systemId: string
  export let habitableZoneMin: number = 0
  export let habitableZoneMax: number = 0

  let planetName = ''
  let planetMass = 1.0
  let corePercentage = 33
  let planetAgeInput = ''
  let semiMajorAxis = 1.0
  let eccentricity = 0
  let planetType: 'rock' | 'ice' | 'gas' = 'rock'
  let rotationPeriodHours = 24
  let inclination = 0
  let axialTilt = 0

  let surfaceGravity = 0

  $: {
    // Recalculate surface gravity for habitability check
    const radius = calculatePlanetRadius(planetMass, planetType)
    surfaceGravity = calculateSurfaceGravity(planetMass, radius)
  }

  $: isHabitableIndicator = isHabitable(planetType, semiMajorAxis, surfaceGravity, habitableZoneMin, habitableZoneMax)

  function handleSave() {
    if (!planetName.trim()) {
      alert('Please enter a planet name')
      return
    }

    if (planetMass <= 0) {
      alert('Planet mass must be greater than 0')
      return
    }

    if (corePercentage < 0 || corePercentage > 100) {
      alert('Core percentage must be between 0 and 100')
      return
    }

    const planetAge = parseAgeInput(planetAgeInput)

    // Calculate derived properties
    const radius = calculatePlanetRadius(planetMass, planetType)
    const density = calculatePlanetDensity(planetMass, radius, planetType, corePercentage)
    const surfaceGravity = calculateSurfaceGravity(planetMass, radius)
    const escapeVelocity = calculatePlanetEscapeVelocity(planetMass, radius)

    const newPlanet: Planet = {
      id: generateId(),
      starId: systemId,
      name: planetName,
      mass: planetMass,
      age: planetAge,
      corePercentage,
      semiMajorAxis,
      eccentricity,
      type: planetType,
      radius: parseFloat(radius.toFixed(3)),
      density: parseFloat(density.toFixed(4)),
      surfaceGravity: parseFloat(surfaceGravity.toFixed(2)),
      escapeVelocity: parseFloat(escapeVelocity.toFixed(2)),
      rotationPeriodHours,
      inclination,
      axialTilt,
      createdAt: Date.now()
    }

    addPlanet(systemId, newPlanet)
    planetName = ''
    planetMass = 1.0
    corePercentage = 33
    planetAgeInput = ''
    semiMajorAxis = 1.0
    eccentricity = 0
    planetType = 'rock'
    rotationPeriodHours = 24
    inclination = 0
    axialTilt = 0
  }

  function handleCancel() {
    planetName = ''
    planetMass = 1.0
    corePercentage = 33
    planetAgeInput = ''
    semiMajorAxis = 1.0
    eccentricity = 0
    planetType = 'rock'
    rotationPeriodHours = 24
    inclination = 0
    axialTilt = 0
  }
</script>

<div class="planet-form">
  <h3>Add New Planet</h3>

  <div class="form-group">
    <label for="planetName">Planet Name</label>
    <input
      id="planetName"
      type="text"
      placeholder="e.g., Earth, Kepler-452b"
      bind:value={planetName}
    />
  </div>

  <div class="form-group">
    <label for="planetMass">Mass (Earth Masses)</label>
    <input
      id="planetMass"
      type="number"
      min="0.01"
      max="1000"
      step="0.01"
      bind:value={planetMass}
    />
  </div>

  {#if planetType !== 'gas'}
    <div class="form-group">
      <label for="corePercentage">Core Percentage (%)</label>
      <input
        id="corePercentage"
        type="number"
        min="0"
        max="100"
        step="1"
        bind:value={corePercentage}
      />
    </div>
  {/if}

  <div class="form-group">
    <label for="planetAge">Planet Age (e.g., 4.5b, 500m)</label>
    <input
      id="planetAge"
      type="text"
      placeholder="e.g., 4.5b or 4.5 billion years"
      bind:value={planetAgeInput}
    />
  </div>

  <div class="form-group">
    <label for="planetType">Planet Type</label>
    <select id="planetType" bind:value={planetType}>
      <option value="rock">Rock</option>
      <option value="ice">Ice</option>
      <option value="gas">Gas</option>
    </select>
  </div>

  {#if planetType === 'rock'}
    <div class="habitability-indicator">
      <span class="label">Habitability:</span>
      {#if isHabitableIndicator}
        <span class="habitable">✓ Habitable</span>
      {:else}
        <span class="not-habitable">✗ Not Habitable</span>
      {/if}
    </div>
  {/if}

  <div class="form-group">
    <label for="semiMajorAxis">Semi-major Axis (AU)</label>
    <input
      id="semiMajorAxis"
      type="number"
      min="0.01"
      max="1000"
      step="0.01"
      bind:value={semiMajorAxis}
    />
  </div>

  <div class="form-group">
    <label for="eccentricity">Eccentricity</label>
    <input
      id="eccentricity"
      type="number"
      min="0"
      max="1"
      step="0.01"
      bind:value={eccentricity}
    />
  </div>

  <div class="form-group">
    <label for="rotationPeriod">Rotation Period (hours)</label>
    <input
      id="rotationPeriod"
      type="number"
      min="0.1"
      max="10000"
      step="0.1"
      bind:value={rotationPeriodHours}
    />
  </div>

  <div class="form-group">
    <label for="inclination">Orbital Inclination (degrees)</label>
    <input
      id="inclination"
      type="number"
      min="0"
      max="180"
      step="0.1"
      bind:value={inclination}
    />
  </div>

  <div class="form-group">
    <label for="axialTilt">Axial Tilt (degrees)</label>
    <input
      id="axialTilt"
      type="number"
      min="0"
      max="180"
      step="0.1"
      bind:value={axialTilt}
    />
  </div>

  <div class="button-group">
    <button class="btn-save" on:click={handleSave}>Add Planet</button>
    <button class="btn-cancel" on:click={handleCancel}>Cancel</button>
  </div>
</div>

<style>
  .planet-form {
    background: rgba(97, 218, 251, 0.1);
    border: 1px solid rgba(97, 218, 251, 0.3);
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }

  .planet-form h3 {
    margin-top: 0;
    color: #61dafb;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.95rem;
  }

  input[type='text'],
  input[type='number'],
  select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  input[type='text']:focus,
  input[type='number']:focus,
  select:focus {
    outline: none;
    border-color: #61dafb;
    background: rgba(97, 218, 251, 0.1);
  }

  .button-group {
    display: flex;
    gap: 10px;
  }

  .habitability-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    margin: 15px 0;
  }

  .habitability-indicator .label {
    font-weight: 600;
    color: #a0a0a0;
  }

  .habitable {
    color: #4ade80;
    font-weight: 600;
  }

  .not-habitable {
    color: #ef4444;
    font-weight: 600;
  }

  .btn-save,
  .btn-cancel {
    padding: 10px 15px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    flex: 1;
  }

  .btn-save {
    background: linear-gradient(135deg, #61dafb, #bb86fc);
    color: #1e1e2e;
  }

  .btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(97, 218, 251, 0.3);
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #a0a0a0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
</style>
