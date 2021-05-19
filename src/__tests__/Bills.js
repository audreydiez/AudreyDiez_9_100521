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
import DashboardFormUI from "../views/DashboardFormUI";
import Dashboard from "../containers/Dashboard";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase";
import DashboardUI from "../views/DashboardUI";

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

      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBeTruthy()


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
  describe("When I click on the eye icon", () => {
    test("A modal should open", () => {


      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user",JSON.stringify({
            type: "Employee",
          })
      );

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();

      const eye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(() =>
          allBills.handleClickIconEye(eye)
      );
      eye.addEventListener("click", handleClickIconEye);
      fireEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy();



    })
  })
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


