<script lang="ts">
  import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-svelte'
  import { addMoon, updateMoon, deleteMoon } from '$lib/stores/systems'
  import { generateId } from '$lib/utils/helpers'
  import {
    calculateMoonRadius,
    calculateMoonDensity,
    calculateMoonOrbitalPeriod,
    calculateMoonApoapsis,
    calculateMoonPeriapsis,
    calculateMoonApparentSize
  } from '$lib/utils/astronomy'
  import type { Moon } from '../types/star'

  export let systemId: string
  export let planetId: string
  export let planetMass: number
  export let moons: Moon[] = []

  let showMoonForm = false
  let expandedMoons: { [key: string]: boolean } = {}
  let editingMoons: { [key: string]: boolean } = {}
  let editValues: { [key: string]: Partial<Moon> } = {}

  // Form state for new moon
  let moonName = ''
  let moonMass = 0.1
  let moonType: 'rock' | 'ice' = 'rock'
  let semiMajorAxisKm = 384400 // Moon distance
  let eccentricity = 0.05
  let atmosphericPressure = 0
  let rotationPeriodHours = 24

  $: sortedMoons = [...moons].sort((a, b) => a.semiMajorAxisKm - b.semiMajorAxisKm)

  function toggleExpand(moonId: string) {
    expandedMoons = { ...expandedMoons, [moonId]: !expandedMoons[moonId] }
  }

  function toggleEdit(moon: Moon) {
    if (!editingMoons[moon.id]) {
      editValues = {
        ...editValues,
        [moon.id]: {
          name: moon.name,
          mass: moon.mass,
          type: moon.type,
          semiMajorAxisKm: moon.semiMajorAxisKm,
          eccentricity: moon.eccentricity,
          atmosphericPressure: moon.atmosphericPressure,
          rotationPeriodHours: moon.rotationPeriodHours
        }
      }
    }
    editingMoons = { ...editingMoons, [moon.id]: !editingMoons[moon.id] }
  }

  function handleAddMoon() {
    if (!moonName.trim()) {
      alert('Please enter a moon name')
      return
    }

    if (moonMass <= 0) {
      alert('Moon mass must be greater than 0')
      return
    }

    if (semiMajorAxisKm <= 0) {
      alert('Semi-major axis must be greater than 0')
      return
    }

    const radius = calculateMoonRadius(moonMass, moonType)
    const density = calculateMoonDensity(moonMass, radius, moonType)
    const orbitalPeriod = calculateMoonOrbitalPeriod(semiMajorAxisKm, planetMass)
    const apoapsis = calculateMoonApoapsis(semiMajorAxisKm, eccentricity)
    const periapsis = calculateMoonPeriapsis(semiMajorAxisKm, eccentricity)

    const newMoon: Moon = {
      id: generateId(),
      planetId,
      name: moonName,
      mass: moonMass,
      type: moonType,
      radius: parseFloat(radius.toFixed(4)),
      density: parseFloat(density.toFixed(4)),
      semiMajorAxisKm,
      eccentricity,
      atmosphericPressure,
      orbitalPeriodDays: parseFloat(orbitalPeriod.toFixed(2)),
      rotationPeriodHours,
      apoapsis: parseFloat(apoapsis.toFixed(0)),
      periapsis: parseFloat(periapsis.toFixed(0)),
      createdAt: Date.now()
    }

    addMoon(systemId, planetId, newMoon)

    // Reset form
    moonName = ''
    moonMass = 0.1
    moonType = 'rock'
    semiMajorAxisKm = 384400
    eccentricity = 0.05
    atmosphericPressure = 0
    rotationPeriodHours = 24
    showMoonForm = false
  }

  function handleSaveEdit(moonId: string, currentMoon: Moon) {
    if (editValues[moonId]) {
      const updates = editValues[moonId]

      // Recalculate properties if mass or type changed
      if (updates.mass || updates.type) {
        const mass = updates.mass ?? currentMoon.mass
        const type = (updates.type ?? currentMoon.type) as 'rock' | 'ice'

        const radius = calculateMoonRadius(mass, type)
        const density = calculateMoonDensity(mass, radius, type)

        updates.radius = parseFloat(radius.toFixed(4))
        updates.density = parseFloat(density.toFixed(4))
      }

      // Recalculate orbital period if semi-major axis changed
      if (updates.semiMajorAxisKm) {
        const orbitalPeriod = calculateMoonOrbitalPeriod(updates.semiMajorAxisKm, planetMass)
        updates.orbitalPeriodDays = parseFloat(orbitalPeriod.toFixed(2))
      }

      // Recalculate apoapsis/periapsis if semi-major axis or eccentricity changed
      if (updates.semiMajorAxisKm || updates.eccentricity !== undefined) {
        const a = updates.semiMajorAxisKm ?? currentMoon.semiMajorAxisKm
        const e = updates.eccentricity ?? currentMoon.eccentricity
        updates.apoapsis = parseFloat(calculateMoonApoapsis(a, e).toFixed(0))
        updates.periapsis = parseFloat(calculateMoonPeriapsis(a, e).toFixed(0))
      }

      updateMoon(systemId, planetId, moonId, updates)
      editingMoons = { ...editingMoons, [moonId]: false }
    }
  }

  function handleDelete(moonId: string) {
    if (confirm('Delete this moon?')) {
      deleteMoon(systemId, planetId, moonId)
    }
  }
</script>

<div class="moons-container">
  <div class="moons-header">
    <h4>Moons ({moons.length})</h4>
    <button class="btn-add-moon" on:click={() => (showMoonForm = !showMoonForm)}>
      {showMoonForm ? 'Hide' : 'Add'} Moon
    </button>
  </div>

  {#if showMoonForm}
    <div class="moon-form">
      <div class="form-group">
        <label for="moonName">Moon Name</label>
        <input
          id="moonName"
          type="text"
          placeholder="e.g., Luna, Europa"
          bind:value={moonName}
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="moonMass">Mass (Earth Masses)</label>
          <input
            id="moonMass"
            type="number"
            min="0.001"
            max="10"
            step="0.001"
            bind:value={moonMass}
          />
        </div>

        <div class="form-group">
          <label for="moonType">Moon Type</label>
          <select id="moonType" bind:value={moonType}>
            <option value="rock">Rock</option>
            <option value="ice">Ice</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="semiMajorAxisKm">Semi-major Axis (km)</label>
          <input
            id="semiMajorAxisKm"
            type="number"
            min="1"
            max="1000000"
            step="100"
            bind:value={semiMajorAxisKm}
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
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="atmosphericPressure">Atmospheric Pressure (bars)</label>
          <input
            id="atmosphericPressure"
            type="number"
            min="0"
            max="1000"
            step="0.01"
            bind:value={atmosphericPressure}
          />
        </div>

        <div class="form-group">
          <label for="rotationPeriodHours">Rotation Period (hours)</label>
          <input
            id="rotationPeriodHours"
            type="number"
            min="0.1"
            max="10000"
            step="0.1"
            bind:value={rotationPeriodHours}
          />
        </div>
      </div>

      <div class="button-group">
        <button class="btn-save" on:click={handleAddMoon}>Add Moon</button>
        <button class="btn-cancel" on:click={() => (showMoonForm = false)}>Cancel</button>
      </div>
    </div>
  {/if}

  {#if moons.length === 0}
    <p class="empty-state">No moons orbiting this planet</p>
  {:else}
    <div class="moons-list">
      {#each sortedMoons as moon (moon.id)}
        <div class="moon-card">
          <div class="moon-header">
            <button
              class="expand-btn"
              on:click={() => toggleExpand(moon.id)}
              title={expandedMoons[moon.id] ? 'Collapse' : 'Expand'}
            >
              {#if expandedMoons[moon.id]}
                <ChevronUp size={20} />
              {:else}
                <ChevronDown size={20} />
              {/if}
            </button>
            <div class="moon-title">
              <strong>{moon.name}</strong>
              <span class="moon-mass">{moon.mass.toFixed(3)} M⊕</span>
              <span class="moon-distance">{moon.semiMajorAxisKm.toFixed(0)} km</span>
            </div>
            <button
              class="edit-btn"
              on:click={() => toggleEdit(moon)}
              title="Edit moon"
            >
              <Edit2 size={18} />
            </button>
            <button
              class="delete-btn"
              on:click={() => handleDelete(moon.id)}
              title="Delete moon"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {#if expandedMoons[moon.id]}
            <div class="moon-details">
              {#if editingMoons[moon.id]}
                <div class="edit-form">
                  <div class="form-group">
                    <label for="edit-name-{moon.id}">Name</label>
                    <input
                      id="edit-name-{moon.id}"
                      type="text"
                      bind:value={editValues[moon.id].name}
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="edit-mass-{moon.id}">Mass (M⊕)</label>
                      <input
                        id="edit-mass-{moon.id}"
                        type="number"
                        min="0.001"
                        max="10"
                        step="0.001"
                        bind:value={editValues[moon.id].mass}
                      />
                    </div>

                    <div class="form-group">
                      <label for="edit-type-{moon.id}">Type</label>
                      <select id="edit-type-{moon.id}" bind:value={editValues[moon.id].type}>
                        <option value="rock">Rock</option>
                        <option value="ice">Ice</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="edit-axis-{moon.id}">Semi-major Axis (km)</label>
                      <input
                        id="edit-axis-{moon.id}"
                        type="number"
                        min="1"
                        max="1000000"
                        step="100"
                        bind:value={editValues[moon.id].semiMajorAxisKm}
                      />
                    </div>

                    <div class="form-group">
                      <label for="edit-ecc-{moon.id}">Eccentricity</label>
                      <input
                        id="edit-ecc-{moon.id}"
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        bind:value={editValues[moon.id].eccentricity}
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="edit-pressure-{moon.id}">Atmospheric Pressure (bars)</label>
                      <input
                        id="edit-pressure-{moon.id}"
                        type="number"
                        min="0"
                        max="1000"
                        step="0.01"
                        bind:value={editValues[moon.id].atmosphericPressure}
                      />
                    </div>

                    <div class="form-group">
                      <label for="edit-rotation-{moon.id}">Rotation Period (hours)</label>
                      <input
                        id="edit-rotation-{moon.id}"
                        type="number"
                        min="0.1"
                        max="10000"
                        step="0.1"
                        bind:value={editValues[moon.id].rotationPeriodHours}
                      />
                    </div>
                  </div>

                  <div class="button-group">
                    <button class="btn-save" on:click={() => handleSaveEdit(moon.id, moon)}>
                      Save Changes
                    </button>
                    <button class="btn-cancel" on:click={() => toggleEdit(moon)}>
                      Cancel
                    </button>
                  </div>
                </div>
              {:else}
                <div class="detail-row">
                  <span class="label">Type</span>
                  <span class="value type-badge" class:rock={moon.type === 'rock'} class:ice={moon.type === 'ice'}>
                    {(moon.type || 'rock').charAt(0).toUpperCase() + (moon.type || 'rock').slice(1)}
                  </span>
                </div>

                <div class="detail-row">
                  <span class="label">Mass</span>
                  <span class="value">{moon.mass.toFixed(3)} M⊕</span>
                </div>

                <div class="detail-row">
                  <span class="label">Radius</span>
                  <span class="value">{moon.radius?.toFixed(4) || 'N/A'} R⊕</span>
                </div>

                <div class="detail-row">
                  <span class="label">Density</span>
                  <span class="value">{moon.density?.toFixed(4) || 'N/A'} g/cm³</span>
                </div>

                <div class="detail-row">
                  <span class="label">Apparent Size</span>
                  <span class="value">{calculateMoonApparentSize(moon.radius || 0, moon.semiMajorAxisKm).toFixed(4)}°</span>
                </div>

                <div class="detail-row">
                  <span class="label">Semi-major Axis</span>
                  <span class="value">{moon.semiMajorAxisKm.toFixed(0)} km</span>
                </div>

                <div class="detail-row">
                  <span class="label">Eccentricity</span>
                  <span class="value">{moon.eccentricity.toFixed(4)}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Periapsis</span>
                  <span class="value">{moon.periapsis?.toFixed(0) || 'N/A'} km</span>
                </div>

                <div class="detail-row">
                  <span class="label">Apoapsis</span>
                  <span class="value">{moon.apoapsis?.toFixed(0) || 'N/A'} km</span>
                </div>

                <div class="detail-row">
                  <span class="label">Orbital Period</span>
                  <span class="value">{moon.orbitalPeriodDays?.toFixed(2) || 'N/A'} days</span>
                </div>

                <div class="detail-row">
                  <span class="label">Rotation Period</span>
                  <span class="value">{moon.rotationPeriodHours?.toFixed(2) || 'N/A'} hours</span>
                </div>

                <div class="detail-row">
                  <span class="label">Atmospheric Pressure</span>
                  <span class="value">{moon.atmosphericPressure.toFixed(2)} bars</span>
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
  .moons-container {
    margin-top: 20px;
    padding: 15px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(97, 218, 251, 0.2);
  }

  .moons-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
  }

  .moons-header h4 {
    color: #61dafb;
    font-size: 1.05rem;
    margin: 0;
  }

  .btn-add-moon {
    padding: 6px 12px;
    background: linear-gradient(135deg, #61dafb 0%, #4da8c0 100%);
    border: none;
    border-radius: 4px;
    color: #0a1a2e;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .btn-add-moon:hover {
    background: linear-gradient(135deg, #4da8c0 0%, #3a7a8e 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(97, 218, 251, 0.3);
  }

  .moon-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    margin-bottom: 15px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
  }

  .form-group input,
  .form-group select {
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

  .button-group {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .btn-save,
  .btn-cancel {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .btn-save {
    background: #4caf50;
    color: white;
  }

  .btn-save:hover {
    background: #45a049;
  }

  .btn-cancel {
    background: #666;
    color: white;
  }

  .btn-cancel:hover {
    background: #555;
  }

  .moons-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .moon-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(97, 218, 251, 0.2);
    border-radius: 6px;
    overflow: hidden;
  }

  .moon-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(97, 218, 251, 0.05);
    cursor: pointer;
  }

  .expand-btn {
    background: none;
    border: none;
    color: #61dafb;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .expand-btn:hover {
    color: #4da8c0;
  }

  .moon-title {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .moon-title strong {
    color: #e0e0e0;
  }

  .moon-mass,
  .moon-distance {
    color: #a0a0a0;
    font-size: 0.9rem;
    font-weight: normal;
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

  .moon-details {
    background: rgba(0, 0, 0, 0.3);
    padding: 12px;
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

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .label {
    color: #a0a0a0;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .value {
    color: #e0e0e0;
    font-weight: 400;
  }

  .type-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .type-badge.rock {
    background: rgba(180, 100, 60, 0.4);
    color: #d4a574;
  }

  .type-badge.ice {
    background: rgba(100, 180, 220, 0.4);
    color: #7ec9ea;
  }

  .empty-state {
    color: #808080;
    font-style: italic;
    text-align: center;
    padding: 15px;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .moon-title {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
</style>
