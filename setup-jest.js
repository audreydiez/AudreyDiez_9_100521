import $ from 'jquery';
import {localStorageMock} from "./src/__mocks__/localStorage";
import {ROUTES} from "./src/constants/routes";
import NewBillUI from "./src/views/NewBillUI";
global.$ = global.jQuery = $;




const docData = { data: "MOCK_DATA" };
const docResult = {
    // simulate firestore get doc.data() function
    data: () => docData
};
const get = jest.fn(() => Promise.resolve(docResult));
const set = jest.fn();
const doc = jest.fn(() => {
    return {
        set,
        get
    };
});
const firestore = () => {
    return { doc };
};
firestore.FieldValue = {
    serverTimestamp: () => {
        return "MOCK_TIME";
    }
};

export { firestore };

export function setSessionStorage (user) {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
        type: user
    }))
}

