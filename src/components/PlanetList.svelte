<script lang="ts">
  import { ChevronDown, ChevronUp, Trash2, Edit2 } from 'lucide-svelte'
  import { deletePlanet, updatePlanet } from '$lib/stores/systems'
  import {
    formatAge,
    calculatePlanetRadius,
    calculatePlanetDensity,
    calculateSurfaceGravity,
    calculatePlanetEscapeVelocity,
    planetRadiusToKm,
    gravityToMs2,
    calculatePeriapsis,
    calculateApoapsis,
    calculateOrbitalPeriodDays,
    isHabitable
  } from '$lib/utils/astronomy'
  import type { Planet } from '../types/star'

  export let systemId: string
  export let planets: Planet[]
  export let starMass: number
  export let habitableZoneMin: number = 0
  export let habitableZoneMax: number = 0

  let showRadiusKm = false
  let showGravityMs2 = false
  let showOrbitalPeriodLocalDays = false

  // Sort planets by semi-major axis for orbital ordering
  $: sortedPlanets = [...planets].sort((a, b) => (a.semiMajorAxis || 0) - (b.semiMajorAxis || 0))

  let expandedPlanets: { [key: string]: boolean } = {}
  let editingPlanets: { [key: string]: boolean } = {}
  let editValues: { [key: string]: Partial<Planet> } = {}

  // Initialize expanded state for new planets (immutable updates so Svelte notices)
  $: {
    for (const planet of planets) {
      if (!(planet.id in expandedPlanets)) {
        expandedPlanets = { ...expandedPlanets, [planet.id]: false }
      }
    }
  }

  function toggleExpand(planetId: string) {
    expandedPlanets = { ...expandedPlanets, [planetId]: !expandedPlanets[planetId] }
  }

  function toggleEdit(planet: Planet) {
    if (!editingPlanets[planet.id]) {
      editValues = {
        ...editValues,
        [planet.id]: {
          mass: planet.mass,
          corePercentage: planet.corePercentage,
          semiMajorAxis: planet.semiMajorAxis,
          eccentricity: planet.eccentricity,
          type: planet.type,
          rotationPeriodHours: planet.rotationPeriodHours,
          inclination: planet.inclination,
          axialTilt: planet.axialTilt,
          albedo: planet.albedo,
          atmosphericPressure: planet.atmosphericPressure,
          oxygenPercentage: planet.oxygenPercentage,
          argonPercentage: planet.argonPercentage,
          co2Percentage: planet.co2Percentage
        }
      }
    }
    editingPlanets = { ...editingPlanets, [planet.id]: !editingPlanets[planet.id] }
  }

  function handleSaveEdit(planetId: string, currentPlanet: Planet) {
    if (editValues[planetId]) {
      const updates = editValues[planetId]
      
      // Validate atmospheric composition
      const otherGasesTotal = (updates.oxygenPercentage ?? currentPlanet.oxygenPercentage ?? 0) + 
                               (updates.argonPercentage ?? currentPlanet.argonPercentage ?? 0) + 
                               (updates.co2Percentage ?? currentPlanet.co2Percentage ?? 0)
      if (otherGasesTotal > 100) {
        alert('Oxygen + Argon + CO2 cannot exceed 100%. Current total: ' + otherGasesTotal.toFixed(2) + '%')
        return
      }
      
      // Calculate nitrogen as remainder
      const calculatedNitrogen = 100 - otherGasesTotal
      updates.nitrogenPercentage = parseFloat(calculatedNitrogen.toFixed(2))
      
      // Recalculate properties if mass or type changed
      if (updates.mass || updates.type) {
        const mass = updates.mass ?? currentPlanet.mass
        const type = (updates.type ?? currentPlanet.type) as 'rock' | 'ice' | 'gas'
        
        const radius = calculatePlanetRadius(mass, type)
        const corePerc = updates.corePercentage ?? currentPlanet.corePercentage ?? 0
        const density = calculatePlanetDensity(mass, radius, type, corePerc)
        const surfaceGravity = calculateSurfaceGravity(mass, radius)
        const escapeVelocity = calculatePlanetEscapeVelocity(mass, radius)
        
        updates.radius = parseFloat(radius.toFixed(3))
        updates.density = parseFloat(density.toFixed(4))
        updates.surfaceGravity = parseFloat(surfaceGravity.toFixed(2))
        updates.escapeVelocity = parseFloat(escapeVelocity.toFixed(2))
      }
      
      updatePlanet(systemId, planetId, updates)
      editingPlanets = { ...editingPlanets, [planetId]: false }
    }
  }

  function handleDelete(planetId: string) {
    if (confirm('Delete this planet?')) {
      deletePlanet(systemId, planetId)
    }
  }
</script>

<div class="planets-container">
  <div class="planets-header-row">
    <h3>Planets ({planets.length})</h3>
    <div class="planet-controls">
      <button class="unit-toggle" on:click={() => (showRadiusKm = !showRadiusKm)}>
        {showRadiusKm ? 'Radius: km' : 'Radius: R⊕'}
      </button>
      <button class="unit-toggle" on:click={() => (showGravityMs2 = !showGravityMs2)}>
        {showGravityMs2 ? 'Gravity: m/s²' : 'Gravity: g'}
      </button>
      <button class="unit-toggle" on:click={() => (showOrbitalPeriodLocalDays = !showOrbitalPeriodLocalDays)}>
        {showOrbitalPeriodLocalDays ? 'Orbital: local days' : 'Orbital: Earth days'}
      </button>
    </div>
  </div>

  {#if planets.length === 0}
    <p class="empty-state">No planets in this system yet</p>
  {:else}
    <div class="planets-list">
      {#each sortedPlanets as planet (planet.id)}
        <div class="planet-card">
          <div class="planet-header">
            <button
              class="expand-btn"
              on:click={() => toggleExpand(planet.id)}
              title={expandedPlanets[planet.id] ? 'Collapse' : 'Expand'}
            >
              {#if expandedPlanets[planet.id]}
                <ChevronUp size={20} />
              {:else}
                <ChevronDown size={20} />
              {/if}
            </button>
            <div class="planet-title">
              <strong>{planet.name}</strong>
              <span class="planet-mass">{planet.mass.toFixed(2)} M⊕</span>
              <span class="planet-axis">{planet.semiMajorAxis?.toFixed(3) || 'N/A'} AU</span>
            </div>
            <button
              class="edit-btn"
              on:click={() => toggleEdit(planet)}
              title="Edit planet"
            >
              <Edit2 size={18} />
            </button>
            <button
              class="delete-btn"
              on:click={() => handleDelete(planet.id)}
              title="Delete planet"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {#if expandedPlanets[planet.id]}
            <div class="planet-details">
              {#if editingPlanets[planet.id]}
                <div class="edit-form">
                  <div class="form-group">
                    <label for="mass-{planet.id}">Mass (M⊕)</label>
                    <input
                      id="mass-{planet.id}"
                      type="number"
                      min="0.01"
                      max="1000"
                      step="0.01"
                      bind:value={editValues[planet.id].mass}
                    />
                  </div>
                  <div class="form-group">
                    <label for="type-{planet.id}">Planet Type</label>
                    <select id="type-{planet.id}" bind:value={editValues[planet.id].type}>
                      <option value="rock">Rock</option>
                      <option value="ice">Ice</option>
                      <option value="gas">Gas</option>
                    </select>
                  </div>
                  {#if editValues[planet.id].type !== 'gas'}
                    <div class="form-group">
                      <label for="core-{planet.id}">Core Percentage (%)</label>
                      <input
                        id="core-{planet.id}"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        bind:value={editValues[planet.id].corePercentage}
                      />
                    </div>
                  {/if}
                  <div class="form-group">
                    <label for="axis-{planet.id}">Semi-major Axis (AU)</label>
                    <input
                      id="axis-{planet.id}"
                      type="number"
                      min="0.01"
                      max="1000"
                      step="0.01"
                      bind:value={editValues[planet.id].semiMajorAxis}
                    />
                  </div>
                  <div class="form-group">
                    <label for="ecc-{planet.id}">Eccentricity</label>
                    <input
                      id="ecc-{planet.id}"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      bind:value={editValues[planet.id].eccentricity}
                    />
                  </div>
                  <div class="form-group">
                    <label for="rotation-{planet.id}">Rotation Period (hours)</label>
                    <input
                      id="rotation-{planet.id}"
                      type="number"
                      min="0.1"
                      max="10000"
                      step="0.1"
                      bind:value={editValues[planet.id].rotationPeriodHours}
                    />
                  </div>
                  <div class="form-group">
                    <label for="inclination-{planet.id}">Orbital Inclination (degrees)</label>
                    <input
                      id="inclination-{planet.id}"
                      type="number"
                      min="0"
                      max="180"
                      step="0.1"
                      bind:value={editValues[planet.id].inclination}
                    />
                  </div>
                  <div class="form-group">
                    <label for="axialTilt-{planet.id}">Axial Tilt (degrees)</label>
                    <input
                      id="axialTilt-{planet.id}"
                      type="number"
                      min="0"
                      max="180"
                      step="0.1"
                      bind:value={editValues[planet.id].axialTilt}
                    />
                  </div>
                  <div class="form-group">
                    <label for="albedo-{planet.id}">Albedo</label>
                    <input
                      id="albedo-{planet.id}"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      bind:value={editValues[planet.id].albedo}
                    />
                  </div>
                  <div class="form-group">
                    <label for="atm-pressure-{planet.id}">Atmospheric Pressure (bar)</label>
                    <input
                      id="atm-pressure-{planet.id}"
                      type="number"
                      min="0"
                      max="1000"
                      step="0.01"
                      bind:value={editValues[planet.id].atmosphericPressure}
                    />
                  </div>
                  <div class="form-group">
                    <label for="o2-{planet.id}">Oxygen (%)</label>
                    <input
                      id="o2-{planet.id}"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      bind:value={editValues[planet.id].oxygenPercentage}
                    />
                  </div>
                  <div class="form-group">
                    <label for="n2-{planet.id}">Nitrogen (%) - Calculated</label>
                    <input
                      id="n2-{planet.id}"
                      type="number"
                      readonly
                      value={100 - ((editValues[planet.id].oxygenPercentage ?? 0) + (editValues[planet.id].argonPercentage ?? 0) + (editValues[planet.id].co2Percentage ?? 0))}
                    />
                  </div>
                  <div class="form-group">
                    <label for="ar-{planet.id}">Argon (%)</label>
                    <input
                      id="ar-{planet.id}"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      bind:value={editValues[planet.id].argonPercentage}
                    />
                  </div>
                  <div class="form-group">
                    <label for="co2-{planet.id}">Carbon Dioxide (%)</label>
                    <input
                      id="co2-{planet.id}"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      bind:value={editValues[planet.id].co2Percentage}
                    />
                  </div>
                  <div class="button-group">
                    <button class="btn-save" on:click={() => handleSaveEdit(planet.id, planet)}>
                      Save Changes
                    </button>
                    <button class="btn-cancel" on:click={() => toggleEdit(planet)}>
                      Cancel
                    </button>
                  </div>
                </div>
              {:else}
                <div class="detail-row">
                  <span class="label">Type</span>
                  <span class="value type-badge" class:rock={planet.type === 'rock'} class:ice={planet.type === 'ice'} class:gas={planet.type === 'gas'}>
                    {(planet.type || 'rock').charAt(0).toUpperCase() + (planet.type || 'rock').slice(1)}
                  </span>
                </div>
                {#if planet.type === 'rock'}
                  <div class="detail-row">
                    <span class="label">Habitable</span>
                    <span class="value" class:habitable={isHabitable(planet.type, planet.semiMajorAxis, planet.surfaceGravity, habitableZoneMin, habitableZoneMax)} class:not-habitable={!isHabitable(planet.type, planet.semiMajorAxis, planet.surfaceGravity, habitableZoneMin, habitableZoneMax)}>
                      {isHabitable(planet.type, planet.semiMajorAxis, planet.surfaceGravity, habitableZoneMin, habitableZoneMax) ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                {/if}
                <div class="detail-row">
                  <span class="label">Mass</span>
                  <span class="value">{planet.mass.toFixed(2)} M⊕</span>
                </div>
                <div class="detail-row">
                  <span class="label">Radius</span>
                  <span class="value">
                    {#if showRadiusKm}
                      {planet.radius ? planetRadiusToKm(planet.radius).toFixed(0) + ' km' : 'N/A'}
                    {:else}
                      {planet.radius?.toFixed(3) || 'N/A'} R⊕
                    {/if}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Density</span>
                  <span class="value">{planet.density?.toFixed(4) || 'N/A'} g/cm³</span>
                </div>
                <div class="detail-row">
                  <span class="label">Surface Gravity</span>
                  <span class="value">
                    {#if showGravityMs2}
                      {planet.surfaceGravity ? gravityToMs2(planet.surfaceGravity).toFixed(2) + ' m/s²' : 'N/A'}
                    {:else}
                      {planet.surfaceGravity?.toFixed(2) || 'N/A'} g
                    {/if}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Escape Velocity</span>
                  <span class="value">{planet.escapeVelocity?.toFixed(2) || 'N/A'} km/s</span>
                </div>
                {#if planet.type !== 'gas'}
                  <div class="detail-row">
                    <span class="label">Core Percentage</span>
                    <span class="value">{planet.corePercentage || 0}%</span>
                  </div>
                {/if}
                <div class="detail-row">
                  <span class="label">Age</span>
                  <span class="value">{formatAge(planet.age || 0)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Semi-major Axis</span>
                  <span class="value">{planet.semiMajorAxis?.toFixed(3) || 'N/A'} AU</span>
                </div>
                <div class="detail-row">
                  <span class="label">Eccentricity</span>
                  <span class="value">{planet.eccentricity?.toFixed(3) || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Periapsis</span>
                  <span class="value">{(planet.semiMajorAxis && planet.eccentricity) ? calculatePeriapsis(planet.semiMajorAxis, planet.eccentricity).toFixed(3) + ' AU' : 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Apoapsis</span>
                  <span class="value">{(planet.semiMajorAxis && planet.eccentricity) ? calculateApoapsis(planet.semiMajorAxis, planet.eccentricity).toFixed(3) + ' AU' : 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Rotation Period</span>
                  <span class="value">{planet.rotationPeriodHours?.toFixed(2) || 'N/A'} hours</span>
                </div>
                <div class="detail-row">
                  <span class="label">Orbital Inclination</span>
                  <span class="value">{planet.inclination?.toFixed(2) || 'N/A'}°</span>
                </div>
                <div class="detail-row">
                  <span class="label">Axial Tilt</span>
                  <span class="value">{planet.axialTilt?.toFixed(2) || 'N/A'}°</span>
                </div>
                <div class="detail-row">
                  <span class="label">Orbital Period</span>
                  <span class="value">
                    {#if planet.semiMajorAxis}
                      {#if showOrbitalPeriodLocalDays}
                        {planet.rotationPeriodHours ? (calculateOrbitalPeriodDays(planet.semiMajorAxis, starMass) / (planet.rotationPeriodHours / 24)).toFixed(2) : 'N/A'} local days
                      {:else}
                        {calculateOrbitalPeriodDays(planet.semiMajorAxis, starMass).toFixed(1)} Earth days
                      {/if}
                    {:else}
                      N/A
                    {/if}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Albedo</span>
                  <span class="value">{planet.albedo?.toFixed(3) || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Atmospheric Pressure</span>
                  <span class="value">{planet.atmosphericPressure?.toFixed(2) || 'N/A'} bar</span>
                </div>
                <div class="detail-row">
                  <span class="label">Atmospheric Composition</span>
                  <span class="value">
                    O₂ {planet.oxygenPercentage?.toFixed(2) || 'N/A'}% | 
                    N₂ {planet.nitrogenPercentage?.toFixed(2) || 'N/A'}% | 
                    Ar {planet.argonPercentage?.toFixed(2) || 'N/A'}% | 
                    CO₂ {planet.co2Percentage?.toFixed(2) || 'N/A'}%
                  </span>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .planets-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
  }

  .planets-container h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #61dafb;
  }

  .planets-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .planet-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .unit-toggle {
    background: none;
    border: 1px solid rgba(97, 218, 251, 0.4);
    color: #a0a0a0;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .unit-toggle:hover {
    color: #61dafb;
    border-color: rgba(97, 218, 251, 0.7);
    background: rgba(97, 218, 251, 0.06);
  }

  .empty-state {
    color: #808080;
    font-style: italic;
    margin: 0;
  }

  .planets-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .planet-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .planet-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(97, 218, 251, 0.3);
  }

  .planet-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    cursor: pointer;
  }

  .expand-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .expand-btn:hover {
    color: #61dafb;
  }

  .planet-title {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .planet-title strong {
    color: #e0e0e0;
  }

  .planet-mass {
    color: #a0a0a0;
    font-size: 0.9rem;
    font-weight: normal;
  }

  .planet-axis {
    color: #a0a0a0;
    font-size: 0.9rem;
    font-weight: normal;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .delete-btn:hover {
    color: #ff6b6b;
  }

  .edit-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .edit-btn:hover {
    color: #61dafb;
  }

  .planet-details {
    background: rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    color: #a0a0a0;
    font-weight: 500;
    font-size: 0.85rem;
    margin: 0;
  }

  .form-group input {
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #61dafb;
    background: rgba(97, 218, 251, 0.1);
  }

  .form-group select {
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .button-group {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .btn-save,
  .btn-cancel {
    padding: 8px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    flex: 1;
  }

  .btn-save {
    background: linear-gradient(135deg, #61dafb, #bb86fc);
    color: #1e1e2e;
  }

  .btn-save:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(97, 218, 251, 0.2);
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #a0a0a0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    align-items: center;
  }

  .label {
    color: #a0a0a0;
    font-weight: 500;
  }

  .value {
    color: #61dafb;
    font-weight: 600;
  }

  .type-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .type-badge.rock {
    background: rgba(168, 85, 73, 0.3);
    color: #d4a574;
  }

  .type-badge.ice {
    background: rgba(96, 165, 250, 0.3);
    color: #93c5fd;
  }

  .type-badge.gas {
    background: rgba(168, 162, 142, 0.3);
    color: #d4af85;
  }

  .value.habitable {
    color: #4ade80;
    font-weight: 600;
  }

  .value.not-habitable {
    color: #ef4444;
    font-weight: 600;
  }
</style>
