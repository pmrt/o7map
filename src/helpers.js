import { DC_AVATAR_ENDPOINT } from "./constants";

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let i = 0, len = cookies.length; i < len; i++) {
    const [key, val] = cookies[i].split("=");
    if (key === name) {
      return val;
    }
  }
}

function parseUserCookie() {
  const c = getCookie("ee_atlas_info");
  if (!c) {
    return null;
  }

  let user = {};
  const pairs = c.split("|");
  for (let i = 0, len = pairs.length; i < len; i++) {
    const [key, val] = pairs[i].split(":");
    user[key] = val;
  }
  return user;
}

export function getUser() {
  const u = parseUserCookie();
  if (typeof u !== "object" || u === null) {
    return null;
  }

  if (Object.keys(u).length === 0) {
    return null;
  }

  return {
    id: u.uid,
    tag: u.t,
    avatarURL: `${DC_AVATAR_ENDPOINT}/${u.uid}/${u.aid}.jpg`,
  };
}
