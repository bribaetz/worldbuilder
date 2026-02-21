<script lang="ts">
  import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-svelte'
  import { addDebrisBelt, deleteDebrisBelt } from '$lib/stores/systems'
  import { generateId, parseAgeInput } from '$lib/utils/helpers'
  import { formatAge } from '$lib/utils/astronomy'
  import type { DebrisBelt } from '../types/star'

  export let systemId: string
  export let debrisBelts: DebrisBelt[] = []

  let isExpanded = false
  let showForm = false
  let newBeltName = ''
  let newBeltType: 'rock' | 'ice' = 'rock'
  let newBeltInner = 2.0
  let newBeltOuter = 3.0
  let newBeltAgeInput = ''

  let expandedBelts: { [key: string]: boolean } = {}

  $: {
    for (const belt of debrisBelts) {
      if (!(belt.id in expandedBelts)) {
        expandedBelts = { ...expandedBelts, [belt.id]: false }
      }
    }
  }

  function toggleExpand(beltId: string) {
    expandedBelts = { ...expandedBelts, [beltId]: !expandedBelts[beltId] }
  }

  function handleAddBelt() {
    if (!newBeltName.trim()) {
      alert('Please enter a belt name')
      return
    }

    if (newBeltInner <= 0 || newBeltOuter <= 0 || newBeltInner >= newBeltOuter) {
      alert('Inner and outer distances must be positive and outer > inner')
      return
    }

    const age = parseAgeInput(newBeltAgeInput)

    const newBelt: DebrisBelt = {
      id: generateId(),
      starId: systemId,
      name: newBeltName,
      type: newBeltType,
      innerAU: newBeltInner,
      outerAU: newBeltOuter,
      age,
      createdAt: Date.now()
    }

    addDebrisBelt(systemId, newBelt)
    newBeltName = ''
    newBeltType = 'rock'
    newBeltInner = 2.0
    newBeltOuter = 3.0
    newBeltAgeInput = ''
    showForm = false
  }

  function handleDelete(beltId: string) {
    if (confirm('Delete this debris belt?')) {
      deleteDebrisBelt(systemId, beltId)
    }
  }
</script>

<div class="debris-belts-container">
  <button class="header-button" on:click={() => (isExpanded = !isExpanded)}>
    <div class="header-content">
      {#if isExpanded}
        <ChevronUp size={20} />
      {:else}
        <ChevronDown size={20} />
      {/if}
      <h3>Debris Belts ({debrisBelts.length})</h3>
    </div>
  </button>

  {#if isExpanded}
    <div class="belts-content">
      {#if debrisBelts.length === 0}
        <p class="empty-state">No debris belts in this system yet</p>
      {:else}
        <div class="belts-list">
          {#each debrisBelts as belt (belt.id)}
            <div class="belt-card">
              <div class="belt-header">
                <button
                  class="expand-btn"
                  on:click={() => toggleExpand(belt.id)}
                  title={expandedBelts[belt.id] ? 'Collapse' : 'Expand'}
                >
                  {#if expandedBelts[belt.id]}
                    <ChevronUp size={20} />
                  {:else}
                    <ChevronDown size={20} />
                  {/if}
                </button>
                <div class="belt-title">
                  <strong>{belt.name}</strong>
                  <span class="belt-type" class:rock={belt.type === 'rock'} class:ice={belt.type === 'ice'}>
                    {belt.type.charAt(0).toUpperCase() + belt.type.slice(1)}
                  </span>
                </div>
                <button
                  class="delete-btn"
                  on:click={() => handleDelete(belt.id)}
                  title="Delete belt"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {#if expandedBelts[belt.id]}
                <div class="belt-details">
                  <div class="detail-row">
                    <span class="label">Inner Distance</span>
                    <span class="value">{belt.innerAU.toFixed(3)} AU</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Outer Distance</span>
                    <span class="value">{belt.outerAU.toFixed(3)} AU</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Belt Width</span>
                    <span class="value">{(belt.outerAU - belt.innerAU).toFixed(3)} AU</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Age</span>
                    <span class="value">{belt.age ? formatAge(belt.age) : 'Unknown'}</span>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <button class="btn-add-belt" on:click={() => (showForm = !showForm)}>
        <Plus size={18} />
        {showForm ? 'Cancel' : 'Add Debris Belt'}
      </button>

      {#if showForm}
        <div class="belt-form">
          <h4>New Debris Belt</h4>
          <div class="form-group">
            <label for="beltName">Belt Name</label>
            <input
              id="beltName"
              type="text"
              placeholder="e.g., Asteroid Belt, Kuiper Belt"
              bind:value={newBeltName}
            />
          </div>

          <div class="form-group">
            <label for="beltType">Belt Type</label>
            <select id="beltType" bind:value={newBeltType}>
              <option value="rock">Rock</option>
              <option value="ice">Ice</option>
            </select>
          </div>

          <div class="form-group">
            <label for="beltInner">Inner Distance (AU)</label>
            <input
              id="beltInner"
              type="number"
              min="0.01"
              max="1000"
              step="0.01"
              bind:value={newBeltInner}
            />
          </div>

          <div class="form-group">
            <label for="beltOuter">Outer Distance (AU)</label>
            <input
              id="beltOuter"
              type="number"
              min="0.01"
              max="1000"
              step="0.01"
              bind:value={newBeltOuter}
            />
          </div>

          <div class="form-group">
            <label for="beltAge">Age (e.g., 4.5b, 500m)</label>
            <input
              id="beltAge"
              type="text"
              placeholder="e.g., 4.5b or 4.5 billion years"
              bind:value={newBeltAgeInput}
            />
          </div>

          <button class="btn-save" on:click={handleAddBelt}>Create Belt</button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .debris-belts-container {
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

  .belts-content {
    padding: 0 20px 20px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .empty-state {
    color: #808080;
    font-style: italic;
    margin: 10px 0;
  }

  .belts-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }

  .belt-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
  }

  .belt-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(97, 218, 251, 0.3);
  }

  .belt-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
  }

  .expand-btn {
    background: none;
    border: none;
    color: #61dafb;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .belt-title {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .belt-title strong {
    color: #e0e0e0;
  }

  .belt-type {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .belt-type.rock {
    background: rgba(168, 85, 73, 0.3);
    color: #d4a574;
  }

  .belt-type.ice {
    background: rgba(96, 165, 250, 0.3);
    color: #93c5fd;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;
  }

  .delete-btn:hover {
    color: #ff6b6b;
  }

  .belt-details {
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 0.9rem;
  }

  .label {
    color: #a0a0a0;
    font-weight: 500;
  }

  .value {
    color: #e0e0e0;
    font-family: monospace;
  }

  .btn-add-belt {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(97, 218, 251, 0.1);
    border: 1px solid rgba(97, 218, 251, 0.3);
    color: #61dafb;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-bottom: 15px;
  }

  .btn-add-belt:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: rgba(97, 218, 251, 0.5);
  }

  .belt-form {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 15px;
  }

  .belt-form h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #61dafb;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 12px;
  }

  .form-group label {
    font-size: 0.9rem;
    color: #a0a0a0;
    font-weight: 500;
  }

  .form-group input,
  .form-group select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.95rem;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #61dafb;
    background: rgba(97, 218, 251, 0.08);
  }

  .btn-save {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
    color: #4ade80;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .btn-save:hover {
    background: rgba(74, 222, 128, 0.2);
    border-color: rgba(74, 222, 128, 0.5);
  }
</style>
