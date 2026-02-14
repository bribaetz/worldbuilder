<script lang="ts">
  import { ChevronDown, ChevronUp } from 'lucide-svelte'
  import { generateBodesLawOrbits, calculateOrbitalPeriodDays } from '$lib/utils/astronomy'

  export let starMass: number = 1.0

  let initialDistance = 0.4
  let spacingFactor = 0.3
  let numOrbits = 8
  let orbits: number[] = []
  let isExpanded = false

  // Update orbits reactively when parameters change
  $: orbits = generateBodesLawOrbits(initialDistance, spacingFactor, numOrbits)
</script>

<div class="bodes-calculator">
  <button class="header-button" on:click={() => (isExpanded = !isExpanded)}>
    <div class="header-content">
      {#if isExpanded}
        <ChevronUp size={20} />
      {:else}
        <ChevronDown size={20} />
      {/if}
      <h3>Bode's Law Orbit Calculator</h3>
    </div>
  </button>

  {#if isExpanded}
    <div class="calculator-content">
      <p class="description">Generate a list of stable planetary orbits using Bode's Law</p>

      <div class="calculator-form">
        <div class="form-group">
          <label for="initialDistance">Initial Orbital Distance (AU)</label>
          <input
            id="initialDistance"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            bind:value={initialDistance}
          />
        </div>

        <div class="form-group">
          <label for="spacingFactor">Spacing Factor</label>
          <input
            id="spacingFactor"
            type="number"
            min="0.01"
            max="10"
            step="0.01"
            bind:value={spacingFactor}
          />
        </div>

        <div class="form-group">
          <label for="numOrbits">Number of Orbits</label>
          <input
            id="numOrbits"
            type="number"
            min="1"
            max="20"
            step="1"
            bind:value={numOrbits}
          />
        </div>
      </div>

      {#if orbits.length > 0}
        <div class="orbits-display">
          <h4>Generated Orbits</h4>
          <div class="orbits-table">
            <div class="table-header">
              <div class="col-orbit">Orbit #</div>
              <div class="col-distance">Distance (AU)</div>
              <div class="col-distance">Distance (km)</div>
              <div class="col-period">Orbital Period (days)</div>
            </div>
            {#each orbits as orbit, idx (idx)}
              <div class="table-row">
                <div class="col-orbit">{idx + 1}</div>
                <div class="col-distance">{orbit.toFixed(4)}</div>
                <div class="col-distance">{(orbit * 149_597_871).toFixed(0)}</div>
                <div class="col-period">{calculateOrbitalPeriodDays(orbit, starMass).toFixed(1)}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .bodes-calculator {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 20px;
  }

  .header-button {
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
  }

  .header-button:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 20px;
    color: #61dafb;
  }

  .header-button h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .calculator-content {
    padding: 0 20px 20px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .description {
    margin: 15px 0;
    color: #a0a0a0;
    font-size: 0.9rem;
  }

  .calculator-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-group label {
    font-size: 0.9rem;
    color: #a0a0a0;
    font-weight: 500;
  }

  .form-group input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.95rem;
    font-family: monospace;
  }

  .form-group input:focus {
    outline: none;
    border-color: #61dafb;
    background: rgba(97, 218, 251, 0.08);
  }

  .orbits-display {
    margin-top: 20px;
  }

  .orbits-display h4 {
    margin-top: 0;
    margin-bottom: 12px;
    color: #61dafb;
  }

  .orbits-table {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .table-header {
    display: grid;
    grid-template-columns: 80px 150px 150px 1fr;
    gap: 1px;
    background: rgba(97, 218, 251, 0.1);
    padding: 12px;
    font-weight: 600;
    color: #61dafb;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(97, 218, 251, 0.2);
  }

  .table-row {
    display: grid;
    grid-template-columns: 80px 150px 150px 1fr;
    gap: 1px;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-family: monospace;
    font-size: 0.9rem;
    color: #e0e0e0;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-row:hover {
    background: rgba(97, 218, 251, 0.05);
  }

  .col-orbit,
  .col-distance,
  .col-period {
    padding: 0 8px;
  }
</style>
