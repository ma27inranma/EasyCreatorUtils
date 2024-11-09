import * as MC from '@minecraft/server';



/**
 * @param {string} stringVec
 * @returns {MC.Vector3}
 */
export function vector3FromString(stringVec){
  const arrayVec = stringVec.trim().replace(/\s+/g, ' ').split(' ');

  return {
    x: Number(arrayVec[0]),
    y: Number(arrayVec[1]),
    z: Number(arrayVec[2])
  }
}


/**
 * @param {MC.Vector3} vector3
 */
export function toStringVec3(vector3){
  return `${vector3.x} ${vector3.y} ${vector3.z}`; 
}