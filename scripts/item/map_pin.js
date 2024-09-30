import * as MC from '@minecraft/server';
import { menuTeleport } from '../modules/map_pin/ui';



MC.world.beforeEvents.worldInitialize.subscribe(data => {
  data.itemComponentRegistry.registerCustomComponent('sf:component-item-map_pin', {
    onUse: data => {
      menuTeleport(data.source);
    }
  })
});