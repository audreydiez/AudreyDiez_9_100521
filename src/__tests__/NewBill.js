import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Firestore from "../app/Firestore";
import Router from "../app/Router";
import {bills} from "../fixtures/bills";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import firestore from "../app/Firestore";
import {setSessionStorage} from "../../setup-jest";
import userEvent from "@testing-library/user-event";

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
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })



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



      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Session storage - Employee
      setSessionStorage('Employee')

      const firestore = null;
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      //
      //
      // //newBill.fileName = "filename.jpeg";
      //
      // //console.log(newBill.fileName)
      //
      // const file = {
      //   name: "filename.jpeg"
      // }
      // const event = {
      //   target: {
      //     value: 'filename.jpeg',
      //   },
      // }
      //
      const submitFile = screen.getByTestId("file");
      submitFile.filename = "filename.exe"
      // //console.log(submitFile)
      //
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      //
      //
      submitFile.addEventListener("change", handleChangeFile);
      fireEvent.change(submitFile)
      // //userEvent.click(submitFile)
      //
      // //console.log(newBill.fileName)
      //
      //
      //
      expect(submitFile.filename).toEqual("filename.jpeg")
      // expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();

      // const submitBtn = screen.getByTestId("file")
      //
      // fireEvent.change(submitBtn, { target: { value: 'filename.jpeg' } })
      // expect(submitBtn.value).toBe('filename.jpeg')

      //const fileInput = screen.getByTestId("file")


      //console.log(fileInput)
    })

  })
})








// error file type
// submition form
// creation bill