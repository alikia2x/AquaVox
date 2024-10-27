import NodeCache from "node-cache";
export const songData = new NodeCache( { checkperiod: 0 } );
export const songNameCache = new NodeCache( { checkperiod: 0} );
export const globalMemoryStorage = new NodeCache( { checkperiod: 0} );