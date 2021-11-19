const Store = window.require('electron-store');
const store = new Store();

const electronStore = {
  set : (key, value)=>{
    return store.set(key, value)
  },
  get:(key)=>{
    return store.get(key)
  },
  delete:(key)=>{
    return store.delete(key)
  },
  clear:()=>{
    store.clear()
  }
}
export default electronStore