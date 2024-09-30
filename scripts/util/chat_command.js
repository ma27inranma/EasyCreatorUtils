import * as MC from '@minecraft/server';

/**
 * @typedef {{command:string,cancel:boolean,callback:(message:string,player:MC.Player,processedCommandAmount:number)=>void,onerror:((error:Error)=>void)|undefined}} commandDef
*/

/**@type {commandDef[]}*/
let commands=[];



MC.world.beforeEvents.chatSend.subscribe(data=>{
    let processedCommandAmount = 0;

    commands.forEach(commandDef=>{
        if(data.message.startsWith(commandDef.command)){
            data.cancel=commandDef.cancel;

            let message=data.message.substring(commandDef.command.length);
            try{
                commandDef.callback(message,data.sender, processedCommandAmount);
            }catch(error){
                try{commandDef.onerror?.(error);}catch{};
            }

            processedCommandAmount++;
        };
    })
})


/**
 * @param {commandDef['command']} command
 * @param {commandDef['cancel']} cancel
 * @param {commandDef['callback']} callback
 * @param {commandDef['onerror']|undefined} onerror
*/
const create=(command,cancel,callback,onerror)=>{
    commands.push({command,cancel,callback,onerror});
}

export{
    create
}