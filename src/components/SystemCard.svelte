<script lang="ts">
  import { deleteSystem } from '$lib/stores/systems'
  import type { System } from '../types/star'

  export let system: System
  export let onSelect: (system: System) => void

  function handleDelete() {
    if (confirm(`Delete system "${system.name}"?`)) {
      deleteSystem(system.id)
    }
  }
</script>

<div class="card">
  <div class="card-header">
    <h3>{system.name}</h3>
    <button class="btn-close" on:click={handleDelete} title="Delete system">✕</button>
  </div>

  <div class="card-body">
    <div class="star-info">
      <div class="info-row">
        <span class="label">Star:</span>
        <span class="value">{system.star.name}</span>
      </div>
      <div class="info-row">
        <span class="label">Mass:</span>
        <span class="value">{system.star.mass.toFixed(2)} M☉</span>
      </div>
      <div class="info-row">
        <span class="label">Luminosity:</span>
        <span class="value">{system.star.luminosity?.toFixed(3) || 'N/A'} L☉</span>
      </div>
      <div class="info-row">
        <span class="label">Classification:</span>
        <span class="value">{system.star.classification || 'Unknown'}</span>
      </div>
      <div class="info-row">
        <span class="label">Planets:</span>
        <span class="value">{system.planets.length}</span>
      </div>
    </div>
  </div>

  <button class="btn-view" on:click={() => onSelect(system)}>View & Edit</button>
</div>

<style>
  .card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(97, 218, 251, 0.3);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .btn-close {
    background: none;
    border: none;
    color: #a0a0a0;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .btn-close:hover {
    color: #ff6b6b;
  }

  .card-body {
    padding: 15px;
  }

  .star-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
  }

  .label {
    color: #a0a0a0;
    font-weight: 500;
  }

  .value {
    color: #61dafb;
    font-weight: 600;
  }

  .btn-view {
    width: 100%;
    padding: 10px;
    background: rgba(97, 218, 251, 0.1);
    border: 1px solid rgba(97, 218, 251, 0.3);
    color: #61dafb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .btn-view:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: rgba(97, 218, 251, 0.5);
  }
</style>
