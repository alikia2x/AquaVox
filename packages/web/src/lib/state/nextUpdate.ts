import { writable } from 'svelte/store';
const nextUpdate  = writable(-1);
export default nextUpdate;