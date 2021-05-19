import {fireEvent, screen} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Router from "../app/Router.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import Bills from "../containers/Bills";
import firestore from "../app/Firestore";
import {localStorageMock} from "../__mocks__/localStorage";
import VerticalLayout from "../views/VerticalLayout";
import Firestore from "../app/Firestore";

const data = []
const loading = false
const error = null

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {

      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const pathname = ROUTES_PATH['Bills']
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

      expect(
          screen.getByTestId("icon-window").classList.contains("active-icon")
      ).toBeTruthy()


    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on the button 'Nouvelle note de frais'", () => {
    test("Then I should navigate to bill/new", () => {

      //const html = BillsUI({ data: bills })

      //expect($("[data-testid='btn-new-bill']").length).toEqual(1)

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      //window.addEventListener = jest.fn();
      const bills = new Bills({ document, onNavigate, firestore, localStorage  })


      const handleClickNewBill = jest.fn(bills.handleClickNewBill);

      $("[data-testid='btn-new-bill']").click(handleClickNewBill)

      // $("[data-testid='btn-new-bill']").addEventListener("click", handleClickNewBill)
      //fireEvent.click($("[data-testid='btn-new-bill']"))

      setTimeout(() => {
        expect(handleClickNewBill).toBeCalled()
        expect(screen.getAllByAltText("Envoyer une note de frais")).toBeTruthy()
      }, 2000);


    })

  })
})

