import Cookies from 'js-cookie'

const TokenKey = 'Rubik-Platform-Token'

export function getToken() {
  let token = Cookies.get(TokenKey)
  return token
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
