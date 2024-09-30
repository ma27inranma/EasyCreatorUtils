import * as MC from '@minecraft/server';
import * as FM from '@minecraft/server-ui';
import { getSavedLocations, setSavedLocations } from './map_pin';
import * as MapPin from './map_pin';
import { vector3FromString, toStringVec3 } from '../../util/vector';



/**
 * @param {MC.Player} player
 */
export async function menuTeleport(player, deleteMode = false){
  const form = new FM.ActionFormData();
  form.body({rawtext: [{translate: 'text.mappin.click_to_teleport'}]})

  const savedLocations = getSavedLocations(player);

  savedLocations.forEach(location => {
    form.button(`${location.name}`);
  });

  if(!deleteMode){
    form.button({rawtext: [{translate: 'text.mappin.addnew'}]});
    form.button({rawtext: [{translate: 'text.mappin.goremove'}]});
  }

  const res = await form.show(player);
  if(res.canceled) return;

  const selectedLocation = savedLocations[res.selection ?? 0];

  if(res.selection === savedLocations.length){
    // addnew
    savedLocations.push({d: player.dimension.id, loc: toStringVec3(player.location), t: Date.now()});
    return menuEdit(player, savedLocations, savedLocations.length - 1)
  }else if(res.selection === savedLocations.length + 1){
    return menuTeleport(player, true);
  }

  if(!deleteMode){
    const locationVec = vector3FromString(selectedLocation.loc);

    player.teleport(locationVec, {dimension: MC.world.getDimension(selectedLocation.d)});
    player.sendMessage(`§a-> ${selectedLocation.name}`);
    player.playSound('random.orb');
  }else{
    savedLocations.splice(res.selection, 1);

    player.sendMessage(`§c>x< ${selectedLocation.name}`)
    setSavedLocations(player, savedLocations);
  }
}

/**
 * @param {MC.Player} player
 * @param {MapPin.SavedLocation[]} savedLocations
 * @param {number} targetIdx
 */
export async function menuEdit(player, savedLocations, targetIdx){
  const targetElement = savedLocations[targetIdx];
  if(!targetElement) return;

  const menu = new FM.ModalFormData();
  menu.title('Edit/Add');

  menu.textField({rawtext: [{translate: 'text.mappin.name'}]}, 'Lobby', targetElement.name)

  const res = await menu.show(player);
  if(res.canceled) return;

  targetElement.name = res.formValues[0] ?? targetElement.name ?? 'Unknown';

  setSavedLocations(player, savedLocations);
}