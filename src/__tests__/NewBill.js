import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Router from "../app/Router";
import {bills} from "../fixtures/bills";
import {ROUTES, ROUTES_PATH} from "../constants/routes";

import firebase from "../__mocks__/firebase";
import {setSessionStorage, firestore} from "../../setup-jest";
import {localStorageMock} from "../__mocks__/localStorage";
import Bills from "../containers/Bills";
import Firestore from "../app/Firestore";
import userEvent from "@testing-library/user-event";
firebase.firestore = firestore;



const data = []
const loading = false
const error = null

// Session storage - Employee
setSessionStorage('Employee')



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then letter icon in vertical layout should be highlighted", () => {


      // Routing variable
      const pathname = ROUTES_PATH['NewBill']

      // Mock - parameters for bdd Firebase & data fetching
      firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })


      // HTML DOM creation - DIV
      Object.defineProperty(window, "location", { value: { hash: pathname } })
      document.body.innerHTML = `<div id="root"></div>`;

      // Router init to get actives CSS classes
      Router()

      expect(screen.getByTestId("icon-mail")).toBeTruthy()
      expect(screen.getByTestId("icon-mail").classList.contains("active-icon")).toBeTruthy()

    })
  })

  describe("When I choose an wrong image to upload ", () => {
    test("Then the error message should be display", () => {

      // Init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // UI Construction
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // Mock function handleChangeFile
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      // Add Event and fire
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);

      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.exe"], "image.exe", { type: "image/exe" })],
        }
      })

      expect(handleChangeFile).toBeCalled();
      expect(inputFile.files[0].name).toBe("image.exe");
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()

      setTimeout(() => {
        expect(screen.getByText("Le justificatif doit être au format")).toBeTruthy()
      }, 2000);

    })
  })

  describe("When I am on new bill page and I submit the completed form", () => {
    test("Then I should navigate to bills page", () => {

      // Init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // UI Construction
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // Mock function handleSubmit
      const handleSubmit = jest.fn(newBill.handleSubmit)

      // Add Event and fire
      screen.getByTestId("form-new-bill").addEventListener("click", handleSubmit);
      userEvent.click(screen.getByTestId("form-new-bill"), handleSubmit)

      // Promise reception
      setTimeout(() => {
        expect(handleSubmit).toBeCalled()
        expect(screen.getAllByAltText("Envoyer une note de frais")).toBeTruthy()
      }, 2000);
    })
  })

  describe("When I choose an image to upload ", () => {
    test("Then the file input should get the file name", () => {

      // Init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // UI Construction
      const html = NewBillUI();
      document.body.innerHTML = html

      // Init newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // Mock function handleChangeFile
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      // Add Event and fire
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      //console.log(html)

      // MARCHE PAS
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.png"], "image.png", { type: "image/png" })],
        }
      })

      expect(handleChangeFile).toBeCalled();
      expect(inputFile.files[0].name).toBe("image.png");
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      expect(html.includes("<div class=\"hide\" id=\"error-filetype\" data-testid=\"error-file\">")).toBeTruthy()


    })
  })

})








