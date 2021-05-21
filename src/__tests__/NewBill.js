import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Firestore from "../app/Firestore";
import Router from "../app/Router";
import {bills} from "../fixtures/bills";
import {localStorageMock} from "../__mocks__/localStorage";
import {ROUTES, ROUTES_PATH} from "../constants/routes";

const data = []
const loading = false
const error = null


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then letter icon in vertical layout should be highlighted", () => {


      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const pathname = ROUTES_PATH['NewBill']
      const html = ROUTES({
        pathname,
        data,
        loading,
        error
      })
      document.body.innerHTML = html

      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;
      Router()

      expect(screen.getByTestId("icon-mail").classList.contains("active-icon")).toBeTruthy()
    })
  })
})