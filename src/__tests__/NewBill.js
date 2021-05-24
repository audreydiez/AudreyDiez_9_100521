import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Firestore from "../app/Firestore";
import Router from "../app/Router";
import {bills} from "../fixtures/bills";
import {ROUTES_PATH} from "../constants/routes";
import firestore from "../app/Firestore";
import {setSessionStorage} from "../../setup-jest";

const data = []
const loading = false
const error = null


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then letter icon in vertical layout should be highlighted", () => {

      // Routing variable
      const pathname = ROUTES_PATH['NewBill']

      // Mock - parameters for bdd Firebase & data fetching
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })

      // Session storage - Employee
      setSessionStorage('Employee')

      // HTML DOM creation - DIV
      Object.defineProperty(window, "location", { value: { hash: pathname } })
      document.body.innerHTML = `<div id="root"></div>`;

      // Router init to get actives CSS classes
      Router()

      expect(screen.getByTestId("icon-mail")).toBeTruthy()
      expect(screen.getByTestId("icon-mail").classList.contains("active-icon")).toBeTruthy()

    })

  })
  describe("When I choose a file to upload who is not a png, jpg or jpeg", () => {
    test("Then the file input should stay empty and an error message should display", () => {



      const html = NewBillUI()
      document.body.innerHTML = html

      const newBills = new NewBill({ document, onNavigate, firestore, localStorage  })

      const handleChangeFile = jest.fn(newBills.handleChangeFile);

      $("[data-testid='btn-new-bill']").click(handleChangeFile)

    })

  })
})








// error file type
// submition form
// creation bill