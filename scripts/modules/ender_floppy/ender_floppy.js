import * as MC from '@minecraft/server';
import * as FM from '@minecraft/server-ui';
import * as Event from '../../util/event';
import * as ContainerSaver from '../../util/container_saver';



Event.subscribePlayerInventoryChange('inventory', 17, (player, item, slot, container) => {
  if(!item.typeId.startsWith('sf:ender_floppy')) return;

  if(!player.dimension.getBlock(player.location).isAir){
    player.sendMessage({rawtext: [{translate: 'text.ender_floppy.block_occupied'}]});
    return;
  }

  /**@type {MC.Container} */
  const playerInv = player.getComponent('inventory').container;
  if(playerInv.getItem(16)) return player.sendMessage({rawtext: [{translate: 'text.ender_floppy.output_occupied'}]});

  const saveName = `EnderFloppy-${item.typeId}-${player.name}`;

  let items = [];
  for(let i = 0; i < 27; i++){
    let slot = i < 9 ? i : i + 9;
    items.push(playerInv.getItem(slot));
  }

  ContainerSaver.saveItems(player.dimension, player.location, items, saveName);

  playerInv.setItem(16, item);
  playerInv.setItem(17, undefined);
});

Event.subscribePlayerInventoryChange('equippable', MC.EquipmentSlot.Offhand, (player, item, slot, container) => {
  if(!item.typeId.startsWith('sf:ender_floppy')) return;

  if(!player.dimension.getBlock(player.location).isAir){
    player.sendMessage({rawtext: [{translate: 'text.ender_floppy.block_occupied'}]});
    return;
  }

  /**@type {MC.Container} */
  const playerInv = player.getComponent('inventory').container;
  if(playerInv.getItem(16)) return player.sendMessage({rawtext: [{translate: 'text.ender_floppy.output_occupied'}]});

  /**@type {MC.EntityEquippableComponent} */
  const playerEquippable = player.getComponent('equippable');
  const saveName = `EnderFloppy-${item.typeId}-${player.name}`;

  const savedContainer = ContainerSaver.loadContainer(player.dimension, player.location, saveName);

  for(let i = 0; i < savedContainer.container.size; i++){
    const item = savedContainer.container.getItem(i);

    let slot = i < 9 ? i : i + 9;

    playerInv.setItem(slot, item);
  }

  savedContainer.close();

  playerInv.setItem(16, item);
  playerEquippable.setEquipment(MC.EquipmentSlot.Offhand, undefined);
});
