<script lang="ts">
  import { onMount } from 'svelte'
  import { Edit2 } from 'lucide-svelte'
  import { systems, loadSystems, updateSystem } from '$lib/stores/systems'
  import {
    calculateLuminosity,
    calculateLifespan,
    calculateHabitableZone,
    getSpectralClassification,
    calculateTemperature,
    calculateRadius,
    calculateDensity,
    calculateEscapeVelocity,
    radiusToKm,
    densityToGcm3,
    getStarColor,
    formatAge,
    isInMainSequence,
    getStellarStage
  } from '$lib/utils/astronomy'
  import { parseAgeInput } from '$lib/utils/helpers'
  import StarCalculator from '$components/StarCalculator.svelte'
  import SystemCard from '$components/SystemCard.svelte'
  import PlanetForm from '$components/PlanetForm.svelte'
  import PlanetList from '$components/PlanetList.svelte'
  import BodesLawCalculator from '$components/BodesLawCalculator.svelte'
  import type { System } from './types/star'

  let selectedSystemId: string | null = null
  let viewMode: 'create' | 'view' = 'create'
  let editMode = false
  let editMass = 0
  let editAgeInput = ''
  let showRadiusKm = false
  let showDensityGcm3 = false

  $: selectedSystem = selectedSystemId
    ? $systems.find((s) => s.id === selectedSystemId) || null
    : null

  onMount(() => {
    loadSystems()
  })

  function handleSelectSystem(system: System) {
    selectedSystemId = system.id
    editMass = system.star.mass
    editAgeInput = formatAge(system.star.age || 0)
    viewMode = 'view'
    editMode = false
  }

  function handleBackToList() {
    selectedSystemId = null
    viewMode = 'create'
    editMode = false
  }

  function toggleEditMode() {
    editMode = !editMode
    if (selectedSystem) {
      editMass = selectedSystem.star.mass
    }
  }

  function handleSaveMass() {
    if (!selectedSystem || editMass <= 0) return

    const editAge = parseAgeInput(editAgeInput)

    const luminosity = calculateLuminosity(editMass)
    const lifespan = calculateLifespan(editMass)
    const temperature = calculateTemperature(editMass)
    const radius = calculateRadius(editMass)
    const density = calculateDensity(editMass)
    const escapeVelocity = calculateEscapeVelocity(editMass)
    const habitableZone = calculateHabitableZone(luminosity)
    const classification = getSpectralClassification(editMass)

    const updatedSystem: System = {
      ...selectedSystem,
      star: {
        ...selectedSystem.star,
        mass: editMass,
        age: editAge,
        luminosity: parseFloat(luminosity.toFixed(3)),
        temperature: Math.round(temperature),
        radius: parseFloat(radius.toFixed(3)),
        density: parseFloat(density.toFixed(3)),
        escapeVelocity: parseFloat(escapeVelocity.toFixed(1)),
        lifespan: parseFloat(lifespan.toFixed(0)),
        classification,
        habitableZoneMin: habitableZone.min,
        habitableZoneMax: habitableZone.max
      }
    }

    updateSystem(selectedSystem.id, updatedSystem)
    editMode = false
  }

  function handleCancelEdit() {
    editMode = false
    if (selectedSystem) {
      editMass = selectedSystem.star.mass
      editAgeInput = formatAge(selectedSystem.star.age || 0)
    }
  }
</script>

<main>
  <div class="container">
    <header>
      <h1>🌟 World Builder</h1>
      <p>Create and configure stellar systems</p>
    </header>

    {#if selectedSystem && viewMode === 'view'}
      <div class="view-header">
        <button class="btn-back" on:click={handleBackToList}>← Back to Systems</button>
      </div>
    {/if}

    <div class="content">
      <section class="sidebar">
        <h2>Your Systems ({$systems.length})</h2>
        {#if $systems.length === 0}
          <p class="empty-state">No systems yet. Create one to get started!</p>
        {:else}
          <div class="system-list">
            {#each $systems as system (system.id)}
              <SystemCard {system} onSelect={handleSelectSystem} />
            {/each}
          </div>
        {/if}
      </section>

      <section class="main">
        {#if selectedSystem && viewMode === 'view'}
          <h2>{selectedSystem.name}</h2>
          <div class="system-details">
            <div class="star-header">
              <div class="star-visual">
                <div
                  class="star-circle"
                  style="background-color: {getStarColor(selectedSystem.star.temperature || 5778)}"
                  title="{selectedSystem.star.temperature || 5778} K"
                />
              </div>
              <div>
                <h3>Star: {selectedSystem.star.name}</h3>
                <p class="temperature-label">{selectedSystem.star.temperature || 'N/A'} K</p>
              </div>
            </div>

            {#if editMode}
              <div class="edit-section">
                <div class="form-group">
                  <label for="editMass">Stellar Mass (Solar Masses)</label>
                  <input
                    id="editMass"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    bind:value={editMass}
                  />
                </div>
                <div class="form-group">
                  <label for="editAge">Star Age (e.g., 4.5b, 500m)</label>
                  <input
                    id="editAge"
                    type="text"
                    placeholder="e.g., 4.5b or 4.5 billion years"
                    bind:value={editAgeInput}
                  />
                </div>
                <div class="button-group">
                  <button class="btn-save" on:click={handleSaveMass}>Save Changes</button>
                  <button class="btn-cancel" on:click={handleCancelEdit}>Cancel</button>
                </div>
              </div>
            {/if}

            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-header">
                  <span class="label">Mass</span>
                  {#if !editMode}
                    <button class="icon-btn" on:click={toggleEditMode} title="Edit properties">
                      <Edit2 size={16} />
                    </button>
                  {/if}
                </div>
                {#if editMode}
                  <span class="value">{editMass.toFixed(2)} M☉</span>
                {:else}
                  <span class="value">{selectedSystem.star.mass.toFixed(2)} M☉</span>
                {/if}
              </div>
              <div class="detail-item">
                <div class="detail-header">
                  <span class="label">Age</span>
                  {#if !editMode}
                    <button class="icon-btn" on:click={toggleEditMode} title="Edit properties">
                      <Edit2 size={16} />
                    </button>
                  {/if}
                </div>
                {#if editMode}
                  <span class="value">{formatAge(parseAgeInput(editAgeInput))}</span>
                {:else}
                  <span class="value">{formatAge(selectedSystem.star.age || 0)}</span>
                {/if}
              </div>
              <div class="detail-item">
                <span class="label">Luminosity</span>
                <span class="value">{selectedSystem.star.luminosity?.toFixed(3) || 'N/A'} L☉</span>
              </div>
              <div class="detail-item">
                <span class="label">Temperature</span>
                <span class="value">{selectedSystem.star.temperature || 'N/A'} K</span>
              </div>
              <div class="detail-item">
                <div class="detail-header">
                  <span class="label">Radius</span>
                  <button class="unit-toggle" on:click={() => (showRadiusKm = !showRadiusKm)}>
                    {showRadiusKm ? 'km' : 'R☉'}
                  </button>
                </div>
                <span class="value">
                  {showRadiusKm
                    ? (radiusToKm(selectedSystem.star.radius || 0).toFixed(0) + ' km')
                    : ((selectedSystem.star.radius || 0).toFixed(3) + ' R☉')}
                </span>
              </div>
              <div class="detail-item">
                <div class="detail-header">
                  <span class="label">Density</span>
                  <button class="unit-toggle" on:click={() => (showDensityGcm3 = !showDensityGcm3)}>
                    {showDensityGcm3 ? 'g/cm³' : 'ρ☉'}
                  </button>
                </div>
                <span class="value">
                  {showDensityGcm3
                    ? (densityToGcm3(selectedSystem.star.density || 0).toFixed(3) + ' g/cm³')
                    : ((selectedSystem.star.density || 0).toFixed(3) + ' ρ☉')}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Escape Velocity</span>
                <span class="value">{selectedSystem.star.escapeVelocity?.toFixed(1) || 'N/A'} km/s</span>
              </div>
              <div class="detail-item">
                <span class="label">Classification</span>
                <span class="value">{selectedSystem.star.classification || 'Unknown'}</span>
              </div>
              <div class="detail-item">
                <span class="label">Main Sequence Lifespan</span>
                <span class="value">{selectedSystem.star.lifespan ? formatAge(selectedSystem.star.lifespan) : 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="label">Stellar Stage</span>
                <span class="value {isInMainSequence(selectedSystem.star.age || 0, selectedSystem.star.lifespan || 0) ? 'status-active' : 'status-inactive'}">
                  {getStellarStage(selectedSystem.star.age || 0, selectedSystem.star.lifespan || 0)}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Habitable Zone</span>
                <span class="value"
                  >{selectedSystem.star.habitableZoneMin?.toFixed(3) || 'N/A'} - {selectedSystem
                    .star.habitableZoneMax?.toFixed(3) || 'N/A'} AU</span
                >
              </div>
            </div>

            <div class="planets-section">
              <h2>Planets</h2>
              <PlanetForm systemId={selectedSystem.id} habitableZoneMin={selectedSystem.star.habitableZoneMin || 0} habitableZoneMax={selectedSystem.star.habitableZoneMax || 0} />
              <PlanetList systemId={selectedSystem.id} planets={selectedSystem.planets} starMass={selectedSystem.star.mass} habitableZoneMin={selectedSystem.star.habitableZoneMin || 0} habitableZoneMax={selectedSystem.star.habitableZoneMax || 0} />
              <BodesLawCalculator starMass={selectedSystem.star.mass} />
            </div>
          </div>
        {:else}
          <StarCalculator />
        {/if}
      </section>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, sans-serif;
    background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
    color: #e0e0e0;
  }

  main {
    min-height: 100vh;
    padding: 20px;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 40px;
  }

  header h1 {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #61dafb, #bb86fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  header p {
    margin: 0;
    color: #a0a0a0;
  }

  .view-header {
    margin-bottom: 20px;
  }

  .btn-back {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #61dafb;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .btn-back:hover {
    background: rgba(97, 218, 251, 0.1);
    border-color: rgba(97, 218, 251, 0.3);
  }

  .content {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 20px;
  }

  .sidebar {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 80vh;
    overflow-y: auto;
  }

  .sidebar h2 {
    margin-top: 0;
    font-size: 1.2rem;
    margin-bottom: 20px;
  }

  .empty-state {
    color: #808080;
    font-style: italic;
    margin: 0;
  }

  .system-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .main {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .main h2 {
    margin-top: 0;
    font-size: 2rem;
    margin-bottom: 30px;
  }

  .system-details {
    background: rgba(97, 218, 251, 0.05);
    border: 1px solid rgba(97, 218, 251, 0.2);
    border-radius: 8px;
    padding: 20px;
  }

  .system-details h3 {
    margin: 0 0 10px 0;
    color: #61dafb;
  }

  .star-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(97, 218, 251, 0.2);
  }

  .star-visual {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .star-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.2);
    border: none;
    opacity: 1;
    filter: brightness(1.1) saturate(1.2);
    color-space: srgb;
  }

  .temperature-label {
    margin: 5px 0 0 0;
    color: #a0a0a0;
    font-size: 0.9rem;
  }

  .edit-section {
    background: rgba(97, 218, 251, 0.1);
    border: 1px solid rgba(97, 218, 251, 0.3);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.95rem;
  }

  .form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: #61dafb;
    background: rgba(97, 218, 251, 0.1);
  }

  .button-group {
    display: flex;
    gap: 10px;
  }

  .btn-edit,
  .btn-save,
  .btn-cancel {
    padding: 10px 15px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .btn-edit {
    background: rgba(97, 218, 251, 0.1);
    color: #61dafb;
    border: 1px solid rgba(97, 218, 251, 0.3);
  }

  .btn-edit:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: rgba(97, 218, 251, 0.5);
  }

  .btn-save {
    background: linear-gradient(135deg, #61dafb, #bb86fc);
    color: #1e1e2e;
    flex: 1;
  }

  .btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(97, 218, 251, 0.3);
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #a0a0a0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    flex: 1;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin: 20px 0;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    padding: 15px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .detail-item .label {
    font-size: 0.85rem;
    color: #a0a0a0;
  }

  .detail-item .value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #61dafb;
  }

  .icon-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .icon-btn:hover {
    color: #61dafb;
  }

  .unit-toggle {
    background: none;
    border: 1px solid rgba(97, 218, 251, 0.4);
    color: #a0a0a0;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.75rem;
    transition: all 0.2s ease;
  }

  .unit-toggle:hover {
    color: #61dafb;
    border-color: rgba(97, 218, 251, 0.7);
    background: rgba(97, 218, 251, 0.1);
  }

  .status-active {
    color: #4ade80 !important;
  }

  .status-inactive {
    color: #f87171 !important;
  }

  .planets-section {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid rgba(97, 218, 251, 0.2);
  }

  .planets-section h2 {
    color: #61dafb;
    font-size: 1.3rem;
    margin: 0 0 20px 0;
  }

  @media (max-width: 1024px) {
    .content {
      grid-template-columns: 1fr;
    }

    .sidebar {
      max-height: none;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    header h1 {
      font-size: 1.8rem;
    }

    .main {
      padding: 20px;
    }
  }
</style>
