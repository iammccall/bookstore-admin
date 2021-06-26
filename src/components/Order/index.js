/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, memo } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import Select from 'react-select';
import { isNull } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
   faHistory,
   faPlusCircle,
   faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { getAllCustomer } from 'api/customer';
import { getAllBooks } from 'api/book';
import { deleteBillApi, getAllBill } from 'api/bill';
import SnackBar from 'components/Common/SnackBar';
import DeleteDialog from './DeleteDialog';
import UpdateDialog from './UpdateDialog';
import BookList from './BookList';

function Order() {
   const [customerOption, setCustomerOption] = useState([]);

   const [bookOption, setBookOption] = useState([]);

   const [currentBookList, setCurrentBookList] = useState([]);

   const [selectedBook, setSelectedBook] = useState({ quantity: 1 });

   const [isDisableAddBook, setIsDisableAddBook] = useState(true);

   const [selectedCustomer, setSelectedCustomer] = useState({});

   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

   const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

   const [openSnackBar, setOpenSnackBar] = useState(false);

   const [selectedRow, setSelectedRow] = useState({});

   const [bills, setBill] = useState([]);

   const [totalMoney, setTotalMoney] = useState(0);

   const columns = [
      { field: 'id', headerName: 'Bill ID', width: 150 },
      { field: 'name', headerName: 'Customer Name', width: 200 },
      {
         field: 'phone',
         headerName: 'Phone',
         width: 150,
      },
      {
         field: 'date',
         headerName: 'Create Date',
         width: 150,
      },

      {
         field: 'delete',
         headerName: 'Delete',
         width: 130,
         renderCell: params => (
            <button onClick={deleteBill} className="data-grid-btn delete-btn">
               <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
               <span>Delete</span>
            </button>
         ),
      },
      {
         field: 'update',
         headerName: 'Update',
         width: 130,
         renderCell: params => (
            <button onClick={updateBill} className="data-grid-btn edit-btn">
               <FontAwesomeIcon icon={faHistory}></FontAwesomeIcon>
               <span>Update</span>
            </button>
         ),
      },
   ];

   async function fetchAllBook() {
      const res = await getAllBooks();
      if (isNull(res)) {
         setOpenSnackBar(true);
         return;
      }
      assignBookLabel(res);
   }

   async function fetchAllCustomer() {
      const res = await getAllCustomer();
      if (isNull(res)) {
         setOpenSnackBar(true);
         return;
      }
      assignCustomerLabel(res);
   }

   async function fetchAllBill() {
      const res = await getAllBill();
      if (isNull(res)) {
         setOpenSnackBar(true);
         return;
      }
      console.log(res);
      const temp = [];
      for (const bill of res) {
         try {
            const info = {
               id: bill.billId,
               name: bill.customer.name,
               phone: bill.customer.phoneNumber,
               date: Date(bill.dateTime),
               details: bill.details,
            };
            temp.push(info);
         } catch (error) {
            console.log(error);
            continue;
         }
      }
      setBill(temp);
   }

   const handleCellClick = event => {
      setSelectedRow(event.row);
   };

   const deleteBill = () => {
      setOpenDeleteDialog(true);
   };
   const customerComboboxOnchange = event => {
      setSelectedCustomer(event);
   };

   const bookComboboxOnchange = event => {
      setSelectedBook({ ...selectedBook, info: event });
   };

   const assignCustomerLabel = customers => {
      const temp = [];
      for (const el of customers) {
         temp.push({ ...el, label: `${el.name}, Phone: ${el.phoneNumber}` });
      }
      setCustomerOption(temp);
   };

   const assignBookLabel = books => {
      const temp = [];
      for (const el of books) {
         temp.push({ ...el, label: el.title });
      }
      setBookOption(temp);
   };

   const priceChange = event => {
      setSelectedBook({
         ...selectedBook,
         price: parseInt(event.target.value),
      });
      setIsDisableAddBook(false);
   };

   const addBookList = () => {
      setCurrentBookList([...currentBookList, selectedBook]);
   };

   const removeBook = bookName => {
      const newList = currentBookList.filter(el => el.info.title !== bookName);
      setCurrentBookList(newList);
   };

   const changeQuantity = event => {
      let quantity = parseInt(event.target.value);
      if (quantity < 0) {
         quantity = 1;
      }
      setSelectedBook({ ...selectedBook, quantity: quantity });
   };

   const closeDeleteDialog = isConfirm => {
      setOpenDeleteDialog(false);
      if (isConfirm) {
         deleteBillApi(selectedRow.id);
         setTimeout(fetchAllBill, 2000);
      }
   };

   const closeUpdateDialog = () => {
      setOpenUpdateDialog(false);
   };

   const addNewBill = () => {};

   const updateBill = () => {
      setOpenUpdateDialog(true);
   };

   useEffect(() => {
      fetchAllCustomer();
      fetchAllBook();
      fetchAllBill();
   }, []);

   useEffect(() => {
      let sum = 0;
      for (const el of currentBookList) {
         sum += el.price * el.quantity;
      }
      setTotalMoney(sum);
   }, [currentBookList]);

   return (
      <div className="data-grid">
         <div className="add-area">
            <div>
               <h4 className="main-title">BILL INFO</h4>
               <div className="select-div">
                  <p>Select customer</p>
                  <Select
                     className="select-option"
                     onChange={customerComboboxOnchange}
                     options={customerOption}
                  ></Select>
               </div>
               <div className="select-div">
                  <p>Select book</p>
                  <Select
                     className="select-option"
                     onChange={bookComboboxOnchange}
                     options={bookOption}
                  ></Select>
               </div>
               <div className="select-div">
                  <p>Quantity</p>
                  <input
                     defaultValue="1"
                     onChange={changeQuantity}
                     type="number"
                  ></input>
               </div>
               <div className="select-div">
                  <p>Price</p>
                  <input
                     onChange={priceChange}
                     className="price-input"
                     type="number"
                  ></input>

                  <button
                     disabled={isDisableAddBook}
                     className="order-button"
                     onClick={addBookList}
                  >
                     Add book
                  </button>
               </div>
               <div className="add-bill-div">
                  <button onClick={addNewBill}>
                     <FontAwesomeIcon icon={faPlusCircle}></FontAwesomeIcon>
                     <span>ADD NEW BILL</span>
                  </button>
               </div>
            </div>
            <div className="book-list">
               <h4 className="main-title">CURRENT BOOKS IN BILL</h4>
               {currentBookList.length < 1 ? (
                  <div className="empty-list">
                     <span>Empty</span>
                  </div>
               ) : (
                  <div className="current-book-list">
                     <BookList
                        removeBook={removeBook}
                        books={currentBookList}
                     ></BookList>
                  </div>
               )}
               <p>Total money: {totalMoney}</p>
            </div>
         </div>
         <div className="order-table">
            <h4 className="main-title">ALL BILL</h4>
            <DataGrid
               onCellClick={handleCellClick}
               columns={columns}
               rows={bills}
            ></DataGrid>
         </div>
         <DeleteDialog
            closeDeleteDialog={closeDeleteDialog}
            openDeleteDialog={openDeleteDialog}
         ></DeleteDialog>
         <SnackBar
            openSnackBar={openSnackBar}
            message="Fail to get data"
         ></SnackBar>
         <UpdateDialog
            books={bookOption}
            bilInfo={{
               billId: selectedRow.id,
               // books: selectedRow.detail.books,
            }}
            closeUpdateDialog={closeUpdateDialog}
            openUpdateDialog={openUpdateDialog}
         ></UpdateDialog>
      </div>
   );
}

export default memo(Order);
