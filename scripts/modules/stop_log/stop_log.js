// Entry
import * as MC from '@minecraft/server';
import { playerTickEventListeners } from '../tick';
import { Vec3 } from '../../util/vec3';

/**
 * @typedef {{loc: MC.Vector3, dim: string, rot: MC.Vector3, date: number}} SavedLocation
 */

const Threshold = 100;
const MaxLogLength = 100;


playerTickEventListeners.push((player) => {
  if(player.stopLogMode) return;
  if(Math.floor(player.velocityLength * Threshold) !== 0) return;
  if(Math.floor(player.old.velocityLength * Threshold) == 0) return;

  /**@type {SavedLocation[]} */
  const savedLocations = JSON.parse(player.getDynamicProperty('StopLog/SavedLocations') ?? '[]');
  if(savedLocations.length > 100) savedLocations.splice(0, 1);

  savedLocations.push({date: Date.now(), dim: player.dimension.id, loc: player.location, rot: player.getRotation()});

  player.setDynamicProperty('StopLog/SavedLocations', JSON.stringify(savedLocations));

  player.stopLogSelectedPoint = undefined; // resets when new log
});

playerTickEventListeners.push((player) => {
  /**@type {number} */
  let streak = player.stopLogModeStreak ?? 0;
  if(streak%2 === 0 && player.selectedSlotIndex > player.old.selectedSlotIndex){
    streak++;
  }else if(streak%2 !== 0 && player.selectedSlotIndex < player.old.selectedSlotIndex){
    streak++;
  }

  if(streak >= 6){
    player.stopLogMode = true;
  }

  if(MC.system.currentTick%30 === 0 && streak > 0)
    streak--;

  player.stopLogModeStreak = streak;


  if(!player.hasTag('Util:Op')) return;
  
  if(player.stopLogMode){
    if(Math.floor(player.getRotation().x) <= -90){
      player.stopLogMode = false;
      player.stopLogModeStreak = 0;
    }

    player.onScreenDisplay.setTitle({rawtext:[{translate: 'text.stop_log.mode_enabled'}]}, {fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 2, subtitle: {rawtext:[{translate: 'text.stop_log.usage'}]}});

    /**@type {SavedLocation[]} */
    const savedLocations = JSON.parse(player.getDynamicProperty('StopLog/SavedLocations') ?? '[]');
    let selectedPoint = player.stopLogSelectedPoint ?? 0;

    if(player.selectedSlotIndex > player.old.selectedSlotIndex || player.selectedSlotIndex === 0 && player.old.selectedSlotIndex === 8){
      if(selectedPoint === 0) return;

      selectedPoint--;
    }else if(player.selectedSlotIndex < player.old.selectedSlotIndex || player.selectedSlotIndex === 8 && player.old.selectedSlotIndex === 0){
      if(selectedPoint + 1 >= savedLocations.length) return;

      selectedPoint++;
    }else{
      return;
    }

    const point = savedLocations[savedLocations.length - selectedPoint];
    if(!point){
      player.stopLogSelectedPoint = selectedPoint;
      return;
    }

    player.stopLogBusy = true;

    const toPoint = Vec3.subtract(point.loc, player.location);
    const toPointLengthXZ = Vec3.magnitude({x: toPoint.x, y: 0, z: toPoint.z});

    player.applyKnockback(toPoint.x, toPoint.z, toPointLengthXZ + (3 - toPointLengthXZ) * 0.6, toPoint.y + (1.25 - toPoint.y) * 0.6);

    MC.system.runTimeout(() => {
      player.teleport(point.loc, {dimension: MC.world.getDimension(point.dim), rotation: point.rot});

      player.stopLogBusy = false;
    }, 2);

    player.onScreenDisplay.setActionBar({rawtext:[{translate: 'text.stop_log.teleported', with: {rawtext:[{text: `${Math.floor(point.loc.x)} ${Math.floor(point.loc.y)} ${Math.floor(point.loc.z)}`}, {text: '' + selectedPoint}]}}]});
    
    player.stopLogSelectedPoint = selectedPoint;
  }
});