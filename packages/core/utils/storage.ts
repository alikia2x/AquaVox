import localforage from "localforage";

localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'audioDB'
});

export default localforage;