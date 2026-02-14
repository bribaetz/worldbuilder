<script lang="ts">
  import { addSystem } from '$lib/stores/systems'
  import {
    calculateLuminosity,
    calculateLifespan,
    calculateHabitableZone,
    calculateTemperature,
    calculateRadius,
    calculateDensity,
    calculateEscapeVelocity,
    getSpectralClassification,
    formatAge
  } from '$lib/utils/astronomy'
  import { generateId, parseAgeInput } from '$lib/utils/helpers'
  import type { System } from '../types/star'

  let systemName = ''
  let stellarMass = 1.0
  let stellarAgeInput = ''

  $: luminosity = calculateLuminosity(stellarMass)
  $: lifespan = calculateLifespan(stellarMass)
  $: habitableZone = calculateHabitableZone(luminosity)
  $: classification = getSpectralClassification(stellarMass)
  $: temperature = calculateTemperature(stellarMass)
  $: radius = calculateRadius(stellarMass)
  $: density = calculateDensity(stellarMass)
  $: escapeVelocity = calculateEscapeVelocity(stellarMass)

  function handleSave() {
    if (!systemName.trim()) {
      alert('Please enter a system name')
      return
    }

    if (stellarMass <= 0) {
      alert('Stellar mass must be greater than 0')
      return
    }

    const stellarAge = parseAgeInput(stellarAgeInput)

    const newSystem: System = {
      id: generateId(),
      name: systemName,
      star: {
        id: generateId(),
        name: `${systemName} A`,
        mass: stellarMass,
        age: stellarAge,
        luminosity: parseFloat(luminosity.toFixed(3)),
        temperature: Math.round(temperature),
        radius: parseFloat(radius.toFixed(3)),
        density: parseFloat(density.toFixed(3)),
        escapeVelocity: parseFloat(escapeVelocity.toFixed(1)),
        lifespan: parseFloat(lifespan.toFixed(0)),
        classification,
        habitableZoneMin: habitableZone.min,
        habitableZoneMax: habitableZone.max,
        createdAt: Date.now()
      },
      planets: [],
      createdAt: Date.now()
    }

    addSystem(newSystem)
    systemName = ''
    stellarMass = 1.0
    stellarAgeInput = ''
    alert(`System "${newSystem.name}" created successfully!`)
  }
</script>

<div class="calculator">
  <h2>Create New Star System</h2>

  <div class="form-group">
    <label for="systemName">System Name</label>
    <input
      id="systemName"
      type="text"
      placeholder="e.g., Kepler-452"
      bind:value={systemName}
    />
  </div>

  <div class="form-group">
    <label for="stellarMass">Stellar Mass (Solar Masses)</label>
    <input
      id="stellarMass"
      type="number"
      min="0.01"
      max="100"
      step="0.01"
      bind:value={stellarMass}
    />
  </div>

  <div class="form-group">
    <label for="stellarAge">Star Age (e.g., 4.5b, 500m, 4.5 billion)</label>
    <input
      id="stellarAge"
      type="text"
      placeholder="e.g., 4.5b or 4.5 billion years"
      bind:value={stellarAgeInput}
    />
  </div>

  <div class="results">
    <h3>Calculated Properties</h3>

    <div class="result-grid">
      <div class="result-item">
        <span class="label">Luminosity</span>
        <span class="value">{luminosity.toFixed(3)} L☉</span>
      </div>

      <div class="result-item">
        <span class="label">Temperature</span>
        <span class="value">{Math.round(temperature)} K</span>
      </div>

      <div class="result-item">
        <span class="label">Radius</span>
        <span class="value">{radius.toFixed(3)} R☉</span>
      </div>

      <div class="result-item">
        <span class="label">Density</span>
        <span class="value">{density.toFixed(3)} ρ☉</span>
      </div>

      <div class="result-item">
        <span class="label">Escape Velocity</span>
        <span class="value">{escapeVelocity.toFixed(1)} km/s</span>
      </div>

      <div class="result-item">
        <span class="label">Stellar Classification</span>
        <span class="value">{classification}</span>
      </div>

      <div class="result-item">
        <span class="label">Main Sequence Lifespan</span>
        <span class="value">{formatAge(lifespan)}</span>
      </div>

      <div class="result-item">
        <span class="label">Habitable Zone</span>
        <span class="value">{habitableZone.min.toFixed(3)} - {habitableZone.max.toFixed(3)} AU</span>
      </div>
    </div>
  </div>

  <button class="btn-primary" on:click={handleSave}>Create System</button>
</div>

<style>
  .calculator {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h2 {
    margin-top: 0;
    margin-bottom: 25px;
    font-size: 1.5rem;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.95rem;
  }

  input[type='text'],
  input[type='number'] {
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
  input[type='number']:focus {
    outline: none;
    border-color: #61dafb;
    background: rgba(97, 218, 251, 0.1);
  }

  .results {
    margin: 30px 0;
    padding: 20px;
    background: rgba(97, 218, 251, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(97, 218, 251, 0.2);
  }

  .results h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.1rem;
  }

  .result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .result-item {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .result-item .label {
    font-size: 0.85rem;
    color: #a0a0a0;
    margin-bottom: 4px;
  }

  .result-item .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #61dafb;
  }

  .btn-primary {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, #61dafb, #bb86fc);
    color: #1e1e2e;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(97, 218, 251, 0.3);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  @media (max-width: 600px) {
    .result-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
