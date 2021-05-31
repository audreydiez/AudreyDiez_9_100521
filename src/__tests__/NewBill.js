import { fireEvent, screen, waitFor, waitForElementToBeRemoved} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Router from "../app/Router";
import {bills} from "../fixtures/bills";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import BillsUI from '../views/BillsUI.js';


import {setSessionStorage} from "../../setup-jest";
import userEvent from "@testing-library/user-event";

import Firestore from "../app/Firestore";
import firebase from "../__mocks__/firebase";


const onNavigate = (pathname) => {
    document.body.innerHTML = pathname
}

// Session storage - Employee
setSessionStorage('Employee')

const newBill = {
    id: "QcCK3SzECmaZAGRrHjaC",
    status: "refused",
    pct: 20,
    amount: 200,
    email: "a@a",
    name: "newBill",
    vat: "40",
    fileName: "preview-facture-free-201801-pdf-1.jpg",
    date: "2002-02-02",
    commentAdmin: "pas la bonne facture",
    commentary: "test2",
    type: "Restaurants et bars",
    fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
};




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
    test("Then the error message should be display", async () => {

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
        Firestore,
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

      // Wait for error message (removing "hide" class)
      await waitFor(() => {
          expect(screen.getByTestId('error-file').classList).toHaveLength(0)
      })


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

  // Firebase POST Tests
  describe('When I am on NewBill Page and submit the form', () => {

      test('Then it should create a new bill', async () => {

            // Spy on Firebase Mock
            const postSpy = jest.spyOn(firebase, 'post');

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
            };

            const bills = await firebase.post(newBill);

            expect(postSpy).toHaveBeenCalledTimes(1);
            expect(bills.data.length).toBe(5);

        });

      test('Then it adds bill to the API and fails with 404 message error', async () => {
            firebase.post.mockImplementationOnce(() =>
                Promise.reject(new Error('Erreur 404'))
            );
            const html = BillsUI({ error: 'Erreur 404' });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 404/);

            expect(message).toBeTruthy();
        });

      test('Then it adds bill to the API and fails with 500 message error', async () => {
            firebase.post.mockImplementationOnce(() =>
                Promise.reject(new Error('Erreur 500'))
            );
            const html = BillsUI({ error: 'Erreur 500' });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 500/);

            expect(message).toBeTruthy();
        });
    });

  // NewBill submition Tests
  describe('When bill form is submited', () => {
    test('then create Bill and redirect to Bills', async () => {
            const onNavigate = (pathname) => { document.body.innerHTML = pathname }

            const html = NewBillUI()
            document.body.innerHTML = html

            const bill = new NewBill({
                document,
                onNavigate,
                Firestore,
                localStorage: window.localStorage,
            })
            bill.createBill = (bill) => bill

            document.querySelector(`select[data-testid="expense-type"]`).value = newBill.type
            document.querySelector(`input[data-testid="expense-name"]`).value = newBill.name
            document.querySelector(`input[data-testid="amount"]`).value = newBill.amount
            document.querySelector(`input[data-testid="datepicker"]`).value = newBill.date
            document.querySelector(`input[data-testid="vat"]`).value = newBill.vat
            document.querySelector(`input[data-testid="pct"]`).value = newBill.pct
            document.querySelector(`textarea[data-testid="commentary"]`).value = newBill.commentary
            bill.fileUrl = newBill.fileUrl
            bill.fileName = newBill.fileName

            const submit = screen.getByTestId('form-new-bill')


            const handleSubmit = jest.fn((e) => bill.handleSubmit(e))
            submit.addEventListener('click', handleSubmit)
            userEvent.click(submit)

            expect(handleSubmit).toHaveBeenCalled()
            expect(screen.queryAllByText('Vous devez entrer un titre')).toHaveLength(0)
            expect(document.body.innerHTML).toBe('#employee/bills')

        })

    test('then throw error if name length is equal or less than 5',async() => {

        const onNavigate = (pathname) => { document.body.innerHTML = pathname }

        const html = NewBillUI()
        document.body.innerHTML = html

        const bill = new NewBill({
            document,
            onNavigate,
            Firestore,
            localStorage: window.localStorage,
        })
        bill.createBill = (bill) => bill

        document.querySelector(`input[data-testid="expense-name"]`).value = "a"

        const submit = screen.getByTestId('form-new-bill')


        const handleSubmit = jest.fn((e) => bill.handleSubmit(e))
        submit.addEventListener('click', handleSubmit)
        userEvent.click(submit)

        const errorMessage = screen.queryAllByText('Vous devez entrer un titre')
        expect(handleSubmit).toHaveBeenCalled()
        await waitFor(() => {
            expect(screen.getByTestId("error-expensename")).toBeTruthy()
        })
    })
  })
})



