import {fireEvent, screen} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { Router } from "../app/Router"
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import Bills from "../containers/Bills";
import firestore from "../app/Firestore";
import {localStorageMock} from "../__mocks__/localStorage";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
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
        type: 'employee'
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

