import * as MC from '@minecraft/server';
import { menuTeleport } from '../modules/map_pin/ui';
import { subscribePlayerHitBlockWithItem } from '../util/event';



MC.world.beforeEvents.worldInitialize.subscribe(data => {
  data.itemComponentRegistry.registerCustomComponent('sf:component-item-map_pin', {
    onUse: data => {
      menuTeleport(data.source);
    }
  })
});

subscribePlayerHitBlockWithItem('sf:map_pin', data => {
  const player = data.damagingEntity;

  if(player.getGameMode() !== MC.GameMode.creative){
    player.sendMessage({rawtext: [{translate: 'text.mappin.noclip.onlyAvailableInCreative'}]});
    return;
  }

  player.sendMessage({rawtext: [{translate: 'text.mappin.noclip.started'}]});
  player.setGameMode(MC.GameMode.spectator);

  MC.system.runTimeout(() => {
    player.setGameMode(MC.GameMode.creative);
  }, 20);
});