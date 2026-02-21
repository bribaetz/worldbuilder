import { writable } from 'svelte/store'
import type { System, Star, Planet, DebrisBelt } from '$lib/../types/star'

export const systems = writable<System[]>([])

const STORAGE_KEY = 'worldbuilder_systems'

export function loadSystems(): void {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      systems.set(JSON.parse(stored))
    } catch (error) {
      console.error('Failed to load systems:', error)
    }
  }
}

export function saveSystems(data: System[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addSystem(system: System): void {
  systems.update((s) => {
    const updated = [...s, system]
    saveSystems(updated)
    return updated
  })
}

export function updateSystem(id: string, updates: Partial<System>): void {
  systems.update((s) => {
    const updated = s.map((system) =>
      system.id === id ? { ...system, ...updates } : system
    )
    saveSystems(updated)
    return updated
  })
}

export function deleteSystem(id: string): void {
  systems.update((s) => {
    const updated = s.filter((system) => system.id !== id)
    saveSystems(updated)
    return updated
  })
}

export function addPlanet(systemId: string, planet: Planet): void {
  systems.update((s) => {
    const updated = s.map((system) =>
      system.id === systemId
        ? { ...system, planets: [...system.planets, planet] }
        : system
    )
    saveSystems(updated)
    return updated
  })
}

export function updatePlanet(systemId: string, planetId: string, updates: Partial<Planet>): void {
  systems.update((s) => {
    const updated = s.map((system) =>
      system.id === systemId
        ? {
            ...system,
            planets: system.planets.map((planet) =>
              planet.id === planetId ? { ...planet, ...updates } : planet
            ),
          }
        : system
    )
    saveSystems(updated)
    return updated
  })
}

export function deletePlanet(systemId: string, planetId: string): void {
  systems.update((s) => {
    const updated = s.map((system) =>
      system.id === systemId
        ? { ...system, planets: system.planets.filter((p) => p.id !== planetId) }
        : system
    )
    saveSystems(updated)
    return updated
  })
}

export function addDebrisBelt(systemId: string, belt: DebrisBelt): void {
  systems.update((s) => {
    const updated = s.map((system) =>
      system.id === systemId
        ? { ...system, debrisBelts: [...(system.debrisBelts || []), belt] }
        : system
    )
    saveSystems(updated)
    return updated
  })
}

export function updateDebrisBelt(systemId: string, beltId: string, updates: Partial<DebrisBelt>): void {
  systems.update((s) => {
    const updated = s.map((system) =>
      system.id === systemId
        ? {
            ...system,
            debrisBelts: (system.debrisBelts || []).map((belt) =>
              belt.id === beltId ? { ...belt, ...updates } : belt
            ),
          }
        : system
    )
    saveSystems(updated)
    return updated
  })
}

export function deleteDebrisBelt(systemId: string, beltId: string): void {
  systems.update((s) => {
    const updated = s.map((system) =>
      system.id === systemId
        ? { ...system, debrisBelts: (system.debrisBelts || []).filter((b) => b.id !== beltId) }
        : system
    )
    saveSystems(updated)
    return updated
  })
}
