import * as MC from '@minecraft/server';



export class SavedContainer {
  /**
   * @param {MC.Block} block
   * @param {MC.Container} container
   * @param {string} name
   */
  constructor(block, container, name){
    this.block = block;
    this.container = container;
    this.name = name;

    this.isClosed = false;
  }

  save(){
    MC.world.structureManager.createFromWorld(this.name, this.block.dimension, this.block.location, this.block.location, {includeBlocks: true, saveMode: MC.StructureSaveMode.World, includeEntities: false});
  }

  close(){
    if(this.isClosed) return;

    this.container.clearAll();
    this.block.setType('air');

    this.isClosed = true;
  }
}


/**
 * warning: this saves only 27 slots.
 * @param {MC.Dimension} dim
 * @param {MC.Location} location
 * @param {MC.ItemStack[]} items len: 27
 * @param {string} name
 * @returns {undefined}
 */
export function saveItems(dim, location, items, name){
  dim.setBlockType(location, 'minecraft:chest');

  const block = dim.getBlock(location);
  /**@type {MC.Container} */
  const blockContainer = block.getComponent('inventory').container;

  for(let i = 0; i < 27; i++){
    const item = items[i];
    if(!item) continue;

    blockContainer.setItem(i, item);
  }

  MC.world.structureManager.delete(name);
  MC.world.structureManager.createFromWorld(name, dim, location, location, {includeBlocks: true, saveMode: MC.StructureSaveMode.World, includeEntities: false});

  blockContainer.clearAll();
  block.setType('air');
}

/**
 * @param {MC.Dimension} dim
 * @param {MC.Location} location
 * @param {string} name
 * @returns {SavedContainer}
 */
export function loadContainer(dim, location, name){
  const structure = MC.world.structureManager.get(name);
  if(!structure) return;

  MC.world.structureManager.place(structure, dim, location);

  const block = dim.getBlock(location);
  const container = block.getComponent('inventory').container;

  return new SavedContainer(block, container, name);
}