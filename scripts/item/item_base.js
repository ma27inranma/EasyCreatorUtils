import * as MC from '@minecraft/server';



/**@type {(data: MC.ItemUseBeforeEvent) => void} */
const itemUseBeforeListeners = [];

/**@type {(data: MC.ItemUseBeforeEvent) => void} */
const itemUseAfterListeners = [];