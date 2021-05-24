import $ from 'jquery';
import {localStorageMock} from "./src/__mocks__/localStorage";
global.$ = global.jQuery = $;


export function setSessionsStorage (user) {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
        type: user
    }))
}