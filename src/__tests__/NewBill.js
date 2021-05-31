import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Router from "../app/Router";
import {bills} from "../fixtures/bills";
import {ROUTES, ROUTES_PATH} from "../constants/routes";


import {setSessionStorage, firestore} from "../../setup-jest";
import userEvent from "@testing-library/user-event";
import Firebase from "../__mocks__/firebase";
import Firestore from "../app/Firestore";
import DashboardUI from "../views/DashboardUI";
import firebase from "../__mocks__/firebase";
//firebase.firestore = firestore;



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
          console.log(screen)
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
        firestore : null,
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

  // Copie dashboard
  describe("When I create a new bill", () => {
    test("Then the API get one more bill", async () => {

      const postSpy = jest.spyOn(Firebase, "post")

      const newBill = {
        id: "QcCK3SzECmaZAGRrHjaC",
        status: "refused",
        pct: 20,
        amount: 200,
        email: "a@a",
        name: "test2",
        vat: "40",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2002-02-02",
        commentAdmin: "pas la bonne facture",
        commentary: "test2",
        type: "Restaurants et bars",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
      }

      //mock handlesubmit
      // expect havebenncalled

      const bills = await Firebase.post(newBill)

      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(5)
    })

// moyen
    test("POST a newBill and fails with 500 message error", async () => {
      Firebase.post.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
      )
      const html = NewBillUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })

  })


})



