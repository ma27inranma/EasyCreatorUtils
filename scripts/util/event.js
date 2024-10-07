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
 * @typedef {{listeners: ((player: MC.Player, item: MC.ItemStack, slot: number, container: 'equippable'|'inventory') => void)[], old: string}} InventoryChangeEventInfo
 * @typedef {'equippable'|'inventory'} InventoryChangeContainer
 */

/**@type {Record<string, InventoryChangeEventInfo>} */
const playerInventoryChanges = {};

MC.system.runInterval(() => {
  MC.world.getPlayers().forEach(player => {
    /**@type {MC.Container} */
    const inv = player.getComponent('inventory').container;
    /**@type {MC.EntityEquippableComponent} */
    const equippable = player.getComponent('equippable');
    
    Object.keys(playerInventoryChanges).forEach(key => {
      const containerInfo = key.split(' ');
      /**@type {InventoryChangeContainer} */
      const container = containerInfo[0];

      let item;
      if(container === 'equippable'){
        item = equippable.getEquipment(containerInfo[1]);
      }else{
        item = inv.getItem(Number(containerInfo[1]));
      }
      if(!item) return playerInventoryChanges[key].old = '';

      const savedName = item.nameTag + item.typeId + item.getLore().toString();
      if(savedName === playerInventoryChanges[key].old) return;

      playerInventoryChanges[key].old = savedName;

      playerInventoryChanges[key].listeners.forEach(listener => listener(player, item, containerInfo[1], container));
    });
  });
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

/**
 * @param {string} container
 * @param {string} slot
 * @param {(player: MC.Player, item: MC.ItemStack, slot: number, container: 'equippable'|'inventory') => void} listener
 */
export function subscribePlayerInventoryChange(container, slot, listener){
  playerInventoryChanges[container + ' ' + slot] ??= {
    listeners: []
  }

  playerInventoryChanges[container + ' ' + slot].listeners.push(listener);
}