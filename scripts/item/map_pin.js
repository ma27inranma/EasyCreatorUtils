import * as MC from '@minecraft/server';



MC.world.beforeEvents.worldInitialize.subscribe(data => {
  data.itemComponentRegistry.registerCustomComponent('sf:component-item-map_pin', {
    onUse: data => {
      
    }
  })
});