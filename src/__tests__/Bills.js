import {screen} from "@testing-library/dom"
import firebase from "../__mocks__/firebase";
import {setSessionStorage} from "../../setup-jest";

import Router from "../app/Router.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import Bills from "../containers/Bills"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Firestore from "../app/Firestore";
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {

      // Routing variable
      const pathname = ROUTES_PATH['Bills']

      // Mock - parameters for bdd Firebase & data fetching
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });

      // Session storage - Employee
      setSessionStorage('Employee')

      // HTML DOM creation - DIV
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;

      // Router init to get actives CSS classes
      Router()

      expect(screen.getByTestId("icon-window")).toBeTruthy()
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBeTruthy()


    })
    test("Then bills should be ordered from earliest to latest", () => {

      // UI Construction
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      // Get text from HTML
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      // Filter by date
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on the button 'Nouvelle note de frais'", () => {
    test("Then I should navigate to bill/new", () => {

      // Session storage - Employee
      setSessionStorage('Employee')

      // UI Construction
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      // Init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // init Bills for icon eye display
      const newBills = new Bills({
        document,
        onNavigate,
        Firestore,
        localStorage: window.localStorage,
      });

      // Mock handleClickNewBill
      const handleClickNewBill = jest.fn(newBills.handleClickNewBill);

      // Get button eye in DOM
      const newBillButton = screen.getByTestId("btn-new-bill");

      // Add event and fire
      newBillButton.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillButton);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    })

  })
  describe("When I click on the eye icon", () => {
    test("A modal should open", () => {


      // Session storage - Employee
      setSessionStorage('Employee')

      // UI Construction
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      // Init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Init firestore
      const firestore = null;

      // Init bills
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // Mock modal comportment
      $.fn.modal = jest.fn();

      // Get button eye in DOM
      const eye = screen.getAllByTestId("icon-eye")[0];


      // Mock function handleClickIconEye
      const handleClickIconEye = jest.fn(() =>
          allBills.handleClickIconEye(eye)
      );

      // Add Event and fire
      eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye)

      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy();

    })
  })

  // Integration tests GET
  describe("When I navigate to Bills UI", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


