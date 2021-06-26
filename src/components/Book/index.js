import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DataGrid } from '@material-ui/data-grid';
import { useEffect, useState, memo } from 'react';
import {
   faPenAlt,
   faPlusCircle,
   faTrash,
   faUpload,
} from '@fortawesome/free-solid-svg-icons';
import {
   addNewBook,
   deleteBook,
   getAllBooks,
   getAllCategory,
   upDateBook,
} from 'api/book';
import EditDiaLog from './EditBookDialog';
import AddNewBookDialog from './AddBookDialog';
import DeleteDialog from './DeleteDialog';
import SnackBar from 'components/Common/SnackBar';

function Books() {
   const [openEditDialog, setOpenEditDialog] = useState(false);

   const [openAddDialog, setOpenAddDialog] = useState(false);

   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

   const [openSnackBar, setOpenSnackBar] = useState(false);

   const [snackBarMessage, setSnackBarMessage] = useState('');
   const [selectedRow, setSelectedRow] = useState({});

   const [category, setCategory] = useState([]);

   const [loading, setLoading] = useState(true);

   const columns = [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'name', headerName: 'Name', width: 350 },
      {
         field: 'category',
         headerName: 'Category',
         width: 150,
         renderCell: params => <span>{params.value.name}</span>,
      },
      {
         field: 'author',
         headerName: 'Author',
         width: 150,
      },
      {
         field: 'amount',
         headerName: 'Amount',
         type: 'number',
         width: 150,
      },
      {
         field: 'edit',
         headerName: 'Edit',
         width: 110,
         renderCell: params => (
            <button
               className="data-grid-btn edit-btn"
               onClick={editButtonClick}
            >
               <FontAwesomeIcon icon={faPenAlt}></FontAwesomeIcon>
               <span>Edit</span>
            </button>
         ),
      },
      {
         field: 'delete',
         headerName: 'Delete',
         width: 130,
         renderCell: params => (
            <button
               className="data-grid-btn delete-btn"
               onClick={deleteButtonClick}
            >
               <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
               <span>Delete</span>
            </button>
         ),
      },
   ];

   async function fetchAllCategory() {
      const res = await getAllCategory();
      if (res !== null) {
         setCategory(res);
      }
   }

   async function fetchAllBook() {
      setLoading(true);
      const res = await getAllBooks();
      if (res !== null) {
         const rowData = [];
         for (const element of res) {
            rowData.push({
               id: element.id,
               name: element.title,
               category: element.type,
               author: element.author,
               amount: element.currentAmount,
            });
         }
         setRows(rowData);
         setOpenSnackBar(false);
         setLoading(false);
      } else {
         setLoading(false);
         setOpenSnackBar(true);
         setSnackBarMessage('Fail to get data');
      }
   }
   useEffect(() => {
      fetchAllBook();
      fetchAllCategory();
   }, []);

   const [rows, setRows] = useState([]);
   const editButtonClick = el => {
      setOpenEditDialog(true);
   };
   const deleteButtonClick = el => {
      setOpenDeleteDialog(true);
   };
   const handleCellClick = el => {
      setSelectedRow(el.row);
   };

   const closeEditDialog = (newBook, isCancel) => {
      setOpenEditDialog(false);
      if (!isCancel) {
         const result = upDateBook(newBook);
         if (result) {
            setOpenSnackBar(true);
            setSnackBarMessage('Action completed loading data...');
            setTimeout(fetchAllBook, 2000);
         }
      }
   };

   const addBookClick = () => {
      setOpenAddDialog(true);
   };
   const closeAdddDialog = (newBook, isCancel) => {
      setOpenAddDialog(false);
      if (!isCancel) {
         const result = addNewBook(newBook);
         if (result) {
            setOpenSnackBar(true);
            setSnackBarMessage('Action completed loading data...');
            setTimeout(fetchAllBook, 2000);
         }
      }
   };
   const closeDeleteDialog = isConfirm => {
      setOpenDeleteDialog(false);
      if (isConfirm) {
         const result = deleteBook(selectedRow.id);
         if (result) {
            setOpenSnackBar(true);
            setSnackBarMessage('Action completed loading data...');
            setTimeout(fetchAllBook, 2000);
         }
      }
   };

   return (
      <div className="data-grid">
         <div className="table">
            {loading && (
               <div className="loading-row">
                  <p>Loading...</p>
                  <div className="lds-ellipsis">
                     <div></div>
                     <div></div>
                     <div></div>
                     <div></div>
                  </div>
               </div>
            )}

            <div className="outside-button">
               <button
                  onClick={addBookClick}
                  className="add-button data-grid-btn"
               >
                  <FontAwesomeIcon icon={faPlusCircle}></FontAwesomeIcon>
                  <span>Add new book</span>
               </button>
               <button className="import-button data-grid-btn">
                  <input
                     accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     type="file"
                     name="file"
                     id="file"
                     className="inputFile"
                  />
                  <label htmlFor="file">
                     <FontAwesomeIcon icon={faUpload}></FontAwesomeIcon>
                     <span>Import from excel</span>
                  </label>
               </button>
            </div>
            <DataGrid
               onCellClick={handleCellClick}
               rows={rows}
               columns={columns}
               pageSize={5}
            />
         </div>
         <EditDiaLog
            openEditDialog={openEditDialog}
            book={selectedRow}
            closeEditDialog={closeEditDialog}
            category={category}
         ></EditDiaLog>
         <AddNewBookDialog
            openAddDialog={openAddDialog}
            closeAddDialog={closeAdddDialog}
            category={category}
         ></AddNewBookDialog>
         <DeleteDialog
            closeDeleteDialog={closeDeleteDialog}
            openDeleteDialog={openDeleteDialog}
         ></DeleteDialog>
         <SnackBar
            openSnackBar={openSnackBar}
            message={snackBarMessage}
         ></SnackBar>
      </div>
   );
}

export default memo(Books);
