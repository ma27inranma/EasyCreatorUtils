import * as MC from '@minecraft/server';
import {Vec3} from '../util/vec3';

/**@type {((player: Player) => void)[]} */
export const playerTickEventListeners = [];

/**
 * @typedef {MC.Player & {velocity: MC.Vector3, velocityLength: number, old: {location: MC.Vector3, velocity: MC.Vector3, velocityLength: number, selectedSlotIndex: number}}} Player
 */


MC.system.runInterval(() => {
  MC.world.getPlayers().forEach(player => {
    player.velocity = player.getVelocity();
    player.velocityLength = Vec3.magnitude(player.velocity);

    if(player.old)
      playerTickEventListeners.forEach(listener => listener(player));

    player.old ??= {};
    player.old.location = player.location;
    player.old.velocity = player.velocity;
    player.old.velocityLength = Vec3.magnitude(player.velocity);
    player.old.selectedSlotIndex = player.selectedSlotIndex;
  });
});