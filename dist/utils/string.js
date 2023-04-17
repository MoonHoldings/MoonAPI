"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePasswordReset = exports.generateEmailHTML = exports.removedKey = exports.removeEmailAddressesFromString = exports.generateRandomString = void 0;
const crypto_1 = __importDefault(require("crypto"));
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto_1.default.randomBytes(length);
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        const byte = bytes[i];
        result[i] = chars[byte % chars.length];
    }
    return result.join('');
}
exports.generateRandomString = generateRandomString;
function removeEmailAddressesFromString(str) {
    return str.split('@')[0];
}
exports.removeEmailAddressesFromString = removeEmailAddressesFromString;
function removedKey(str) {
    return str.split('=')[1];
}
exports.removedKey = removedKey;
function generateEmailHTML(username, randomToken) {
    return `<h1>Hello ${username}!</h1>
    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      Yes we gave you that randomly generated username, no worries there<br/>
      will be a way in the future to change it :)<br/>
      Please confirm your email address to complete sign up
    </div>

    <br/><br/>

    <a href="http://localhost:80/verify_email/token=${randomToken}">
    <button style="background-color: #00FFFF; color: #000000; font-size: 16px; font-weight: bold; padding: 12px 24px; border: 2px solid #FFFFFF; border-radius: 5px;">Confirm Email</button>
    </a>

    <br/><br/>

    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      Thanks!
    </div>

    <br/><br/>

    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      The Moon Holdings Team
    </div>`;
}
exports.generateEmailHTML = generateEmailHTML;
function generatePasswordReset(username, randomToken) {
    return `<h1>Hello ${username}!</h1>
    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
    You are receiving this email because you have requested to reset your password. 
    To complete the password reset process, please click on the link below:
    </div>

    <br/><br/>

    <a href="http://localhost:80/reset_password_callback/token=${randomToken}"">
     <button style="background-color: #00FFFF; color: #000000; font-size: 16px; font-weight: bold; padding: 12px 24px; border: 2px solid #FFFFFF; border-radius: 5px;">Confirm Email</button>
   </a>

    <br/><br/>

    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      Thanks!
    </div>

    <br/><br/>

    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      The Moon Holdings Team
    </div>`;
}
exports.generatePasswordReset = generatePasswordReset;
//# sourceMappingURL=string.js.map