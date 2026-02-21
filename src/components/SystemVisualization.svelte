<script lang="ts">
  import { getStarColor } from '$lib/utils/astronomy'
  import type { System, Planet, DebrisBelt } from '../types/star'

  export let system: System

  // Canvas dimensions - make it responsive but fixed aspect
  const canvasWidth = 800
  const canvasHeight = 500
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  const maxVisualizationRadius = 240 // How far from center we want objects to reach

  // Calculate visualization scale using logarithmic spacing
  function getVisualDistance(realDistanceAU: number): number {
    if (realDistanceAU <= 0) return 0
    // Use logarithmic scale so distant objects are still visible
    // log(x+1) ensures we have good spacing even for close objects
    const logDist = Math.log(realDistanceAU + 1) * 60
    // Scale all distances proportionally so furthest object reaches near panel edge
    const scaledDist = (logDist / maxLogDistance) * maxVisualizationRadius
    return Math.min(scaledDist, maxVisualizationRadius)
  }

  // Calculate the maximum log distance to use for scaling
  const allDistances = [
    ...system.planets.map((p) => p.semiMajorAxis || 0),
    ...(system.debrisBelts || []).map((b) => b.outerAU || 0)
  ]
  const maxRealDistance = Math.max(...allDistances, 1)
  const maxLogDistance = Math.log(maxRealDistance + 1) * 60

  // Scale planet radius for visibility
  function getPlanetRadius(radiusEarth: number): number {
    // Make planets visible but not overwhelming
    // Scale is logarithmic to handle small and large planets
    const logRadius = Math.log(radiusEarth + 0.5) * 3
    return Math.max(4, Math.min(logRadius, 25))
  }

  // Get color for planet based on type
  function getPlanetColor(type: string): string {
    switch (type) {
      case 'rock':
        return '#8B4513' // Brown
      case 'ice':
        return '#B0E0E6' // Powder blue
      case 'gas':
        return '#FFB6C1' // Light pink
      default:
        return '#808080' // Gray
    }
  }

  // Get color for debris belt
  function getBeltColor(type: string): string {
    switch (type) {
      case 'rock':
        return '#A0522D' // Sienna
      case 'ice':
        return '#87CEEB' // Sky blue
      default:
        return '#808080' // Gray
    }
  }

  // Get the 2 largest moons for a planet
  function getLargestMoons(moons: any[] = []): any[] {
    return moons
      .sort((a, b) => (b.mass || 0) - (a.mass || 0))
      .slice(0, 2)
  }

  // Combine planets and debris belts, sort by distance
  function getCombinedBodies() {
    const bodies: Array<{ type: 'planet' | 'belt'; data: any; distance: number }> = []

    // Add planets
    system.planets.forEach((planet) => {
      bodies.push({
        type: 'planet',
        data: planet,
        distance: planet.semiMajorAxis || 0
      })
    })

    // Add debris belts
    ;(system.debrisBelts || []).forEach((belt) => {
      bodies.push({
        type: 'belt',
        data: belt,
        distance: belt.innerAU || 0
      })
    })

    return bodies.sort((a, b) => a.distance - b.distance)
  }

  const combinedBodies = getCombinedBodies()
  const maxDistance = Math.max(...combinedBodies.map((b) => b.distance), 1)
</script>

<div class="visualization-container">
  <svg width="100%" height="100%" viewBox="0 0 {canvasWidth} {canvasHeight}" class="system-viz" preserveAspectRatio="xMidYMid meet">
    <!-- Filters -->
    <defs>
      <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.8" flood-color="#000000" />
      </filter>
      <!-- Masks for debris belts (donut shapes) -->
      {#each (system.debrisBelts || []) as belt (belt.id)}
        <mask id="belt-{belt.id}">
          <rect width={canvasWidth} height={canvasHeight} fill="white" />
          <circle cx={centerX} cy={centerY} r={getVisualDistance(belt.innerAU || 0)} fill="black" />
        </mask>
      {/each}
    </defs>

    <!-- Background - transparent -->
    <rect width={canvasWidth} height={canvasHeight} fill="transparent" />

    <!-- Orbital paths and bodies -->
    {#each combinedBodies as body, bodyIdx (body.type === 'planet' ? body.data.id : body.data.id)}
      {#if body.type === 'planet'}
        {@const planet = body.data}
        {@const vizDist = getVisualDistance(body.data.semiMajorAxis || 0)}
        {@const planetRadius = getPlanetRadius(body.data.radius || 1)}
        {@const eccentricity = body.data.eccentricity || 0}
        {@const semiMinorAxis = vizDist * Math.sqrt(1 - eccentricity * eccentricity)}

        <!-- Orbit ellipse (scaled by eccentricity) -->
        <ellipse cx={centerX} cy={centerY} rx={vizDist} ry={semiMinorAxis} fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

        <!-- Planet -->
        <circle
          cx={centerX + vizDist}
          cy={centerY}
          r={planetRadius}
          fill={getPlanetColor(planet.type)}
          stroke="rgba(255,255,255,0.3)"
          stroke-width="1"
        />

        <!-- Moons (2 largest) -->
        {#each getLargestMoons(planet.moons) as moon, moonIdx}
          {@const moonRadius = getPlanetRadius(moon.radius || 0.1) * 0.4}
          {@const moonAngle = (moonIdx * 180) - 90}
          {@const moonAngleRad = (moonAngle * Math.PI) / 180}
          {@const moonOffsetDistance = planetRadius + moonRadius + 4}
          {@const moonX = (centerX + vizDist) + Math.cos(moonAngleRad) * moonOffsetDistance}
          {@const moonY = centerY + Math.sin(moonAngleRad) * moonOffsetDistance}

          <circle
            cx={moonX}
            cy={moonY}
            r={moonRadius}
            fill={getPlanetColor(moon.type)}
            stroke="rgba(255,255,255,0.2)"
            stroke-width="0.5"
            opacity="0.8"
          />
        {/each}

        <!-- Planet label with leader line -->
        {@const labelRadialAngle = bodyIdx % 2 === 0 ? (Math.PI / 6) : (-Math.PI / 6)}
        {@const labelX = centerX + vizDist + Math.cos(labelRadialAngle) * 70}
        {@const labelY = centerY + Math.sin(labelRadialAngle) * 70}

        <!-- Leader line from body to label -->
        <line
          x1={centerX + vizDist}
          y1={centerY}
          x2={labelX}
          y2={labelY}
          stroke="rgba(255,255,255,0.1)"
          stroke-width="1"
        />

        <text
          x={labelX}
          y={labelY - 8}
          text-anchor="middle"
          fill="#e0e0e0"
          font-size="13"
          font-weight="bold"
          filter="url(#textShadow)"
        >
          {planet.name}
        </text>

        <!-- Distance label -->
        <text
          x={labelX}
          y={labelY + 8}
          text-anchor="middle"
          fill="#b0b0b0"
          font-size="11"
          filter="url(#textShadow)"
        >
          {(body.data.semiMajorAxis?.toFixed(2) || 'N/A')} AU
        </text>
      {:else}
        {@const belt = body.data}
        {@const vizDist = getVisualDistance(body.data.outerAU || 0)}
        {@const innerVizDist = getVisualDistance(body.data.innerAU || 0)}

        <!-- Inner edge of belt -->
        <circle
          cx={centerX}
          cy={centerY}
          r={innerVizDist}
          fill="none"
          stroke={getBeltColor(belt.type)}
          stroke-width="2"
          opacity="0.6"
        />

        <!-- Outer edge of belt -->
        <circle cx={centerX} cy={centerY} r={vizDist} fill="none" stroke={getBeltColor(belt.type)} stroke-width="2" opacity="0.6" />

        <!-- Translucent fill between inner and outer edges (donut shape) -->
        <circle
          cx={centerX}
          cy={centerY}
          r={vizDist}
          fill={getBeltColor(belt.type)}
          opacity="0.15"
          mask="url(#belt-{belt.id})"
        />

        <!-- Belt label with leader line -->
        {@const beltLabelDistance = vizDist + 45}
        {@const beltLabelAngle = bodyIdx % 2 === 0 ? (Math.PI / 4) : (-Math.PI / 4)}
        {@const beltLabelX = centerX + Math.cos(beltLabelAngle) * beltLabelDistance}
        {@const beltLabelY = centerY + Math.sin(beltLabelAngle) * beltLabelDistance}

        <!-- Leader line from belt to label -->
        <line
          x1={centerX + vizDist}
          y1={centerY}
          x2={beltLabelX}
          y2={beltLabelY}
          stroke="rgba(255,255,255,0.1)"
          stroke-width="1"
        />

        <text
          x={beltLabelX}
          y={beltLabelY - 10}
          text-anchor="middle"
          fill="#d0d0d0"
          font-size="12"
          font-weight="bold"
          filter="url(#textShadow)"
        >
          {belt.name}
        </text>
        <text
          x={beltLabelX}
          y={beltLabelY + 5}
          text-anchor="middle"
          fill="#a0a0a0"
          font-size="10"
          filter="url(#textShadow)"
        >
          {(body.data.innerAU).toFixed(2)}-{(body.data.outerAU).toFixed(2)} AU
        </text>
      {/if}
    {/each}

    <!-- Star at center -->
    <circle
      cx={centerX}
      cy={centerY}
      r="12"
      fill={getStarColor(system.star.temperature || 5778)}
      stroke="rgba(255,255,255,0.5)"
      stroke-width="1"
    />

    <!-- Star name label -->
    <text x={centerX} y={centerY - 20} text-anchor="middle" fill="#e0e0e0" font-size="13" font-weight="bold" filter="url(#textShadow)">
      {system.star.name}
    </text>
  </svg>
</div>

<style>
  .visualization-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    padding: 15px;
    background: transparent;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-height: 500px;
  }

  .system-viz {
    width: 100%;
    height: 100%;
    max-width: 100%;
  }
</style>
