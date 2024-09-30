import * as MC from '@minecraft/server';
import * as FM from '@minecraft/server-ui';

/**
 * @typedef {{name: string, loc: string, t: number, d: string}} SavedLocation
 */


/**
 * @param {MC.Player} player
 * @returns {SavedLocation[]}
 */
export function getSavedLocations(player){
  /**@type {string[]} */
  const list = JSON.parse(player.getDynamicProperty('MapPin/List') ?? '[]');

  return list.map(pointerName => JSON.parse(player.getDynamicProperty('MapPin/Locations/' + pointerName) ?? '{"name": "[Error]", "loc": "0 0 0", "d": "overworld", "t": 0}'));
}

/**
 * @param {MC.Player} player
 * @param {SavedLocation[]} locations
 */
export function setSavedLocations(player, locations){
  player.getDynamicPropertyIds().forEach(id => {
    if(!id.startsWith('MapPin/Locations/')) return;

    player.setDynamicProperty(id, undefined);
  });

  locations.forEach(location => {
    player.setDynamicProperty('MapPin/Locations/' + location.name, JSON.stringify(location));
  });

  player.setDynamicProperty('MapPin/List', JSON.stringify(locations.map(location => location.name)));
}