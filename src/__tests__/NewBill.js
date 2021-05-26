import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Router from "../app/Router";
import {bills} from "../fixtures/bills";
import {ROUTES, ROUTES_PATH} from "../constants/routes";

import firebase from "../__mocks__/firebase";
import {setSessionStorage, firestore} from "../../setup-jest";
firebase.firestore = firestore;



const data = []
const loading = false
const error = null

// Session storage - Employee
setSessionStorage('Employee')



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then letter icon in vertical layout should be highlighted", () => {


      jest.mock("../app/Firestore");

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
  describe("When I choose an image to upload ", () => {
    test("Then the file input should display the file name", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      const inputFile = screen.getByTestId("file");

      inputFile.addEventListener("change", handleChangeFile);


      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.png"], "image.png", { type: "image/png" })],
        }
      })

      expect(handleChangeFile).toBeCalled();
      expect(inputFile.files[0].name).toBe("image.png");
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()

    })

  })
})








// error file type
// submition form
// creation bill