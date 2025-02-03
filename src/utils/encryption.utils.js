import CryptoJS from "crypto-js";


export const Encryption = async ({value, key} = {}) => {
  return CryptoJS.AES.encrypt(JSON.stringify(value), key).toString();
}

export const Decryption = async ({cipher, key} = {}) => {
  return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
}