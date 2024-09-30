import * as MC from '@minecraft/server';

/**@type {Map<string, ((data: MC.EntityHitBlockAfterEvent) => void)[]} */
const playerHitBlockWithItemListeners = new Map();


MC.world.afterEvents.entityHitBlock.subscribe(data => {
  if(!(data.damagingEntity instanceof MC.Player)) return;
  
  /**@type {MC.Container} */
  const inv = data.damagingEntity.getComponent('inventory').container;

  const listeners = playerHitBlockWithItemListeners.get(inv.getItem(data.damagingEntity.selectedSlotIndex)?.typeId);
  if(!listeners) return;

  listeners.forEach(listener => listener(data));
});


/**
 * @param {string} itemTypeId
 * @param {(data: Omit<MC.EntityHitBlockAfterEvent, 'damagingEntity'> & {damagingEntity: MC.Player}) => void} callback
 */
export function subscribePlayerHitBlockWithItem(itemTypeId, callback){
  let list = playerHitBlockWithItemListeners.get(itemTypeId);
  if(!list){
    list = [];
  }

  list.push(callback);

  playerHitBlockWithItemListeners.set(itemTypeId, list);
}