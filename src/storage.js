import { ROOT_STATE_STORAGE_KEY } from "./constants";

class Storage {
  save(data) {
    window.localStorage.setItem(ROOT_STATE_STORAGE_KEY, JSON.stringify(data));
  }

  get() {
    const data = window.localStorage.getItem(ROOT_STATE_STORAGE_KEY);
    return JSON.parse(data);
  }
}

export default Storage;