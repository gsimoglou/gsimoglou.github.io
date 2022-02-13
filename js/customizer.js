'use strict';

// on window load execute register Service Worker function
window.addEventListener('load', () => {
    registerSW();
});

// Register the Service Worker
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
        await navigator
                .serviceWorker
                .register('serviceworker.js');
        }
        catch (e) {
        console.log('SW registration failed');
        }
    }
}




// if there are no entries in local storage
if(window.localStorage.length < 1 ){
    document.getElementById("table_generator_form").style.display = "block";
}
else {
    document.getElementById("generated_table_controls").style.display = "block";
    localStorageLoad();
}


document.querySelector("#table_generator_submit_button").addEventListener("click", tableGenerator); // add submit button listener to generate table based on form options
document.getElementById("generated_table_wrapper").addEventListener("change", tableInputChangeHandler); // add on-change listener to the table wrapper (to capture changes on the table)
  

// Table Generator Function (Generates the table)
function tableGenerator(){
    document.getElementById("generated_table_wrapper").innerHTML = ""; // Delete any previous table upon (re-)generation of a table.

    // Capture form values and store them in variables
    let tableTitle = document.querySelector("#table_generator_form #table_title").value;
    let tableColumns = Number(document.querySelector("#table_generator_form #table_columns").value);
    let tableRows = Number(document.querySelector("#table_generator_form #table_rows").value);
    let includeColumnHeads = document.querySelector("#table_generator_form #include_column_headings").checked;

    document.getElementById("page_title").textContent = tableTitle; // Change page title.

    let new_table = document.createElement('table'); // Create table
    new_table.setAttribute("id", "generated_table"); // Assign an ID to the table

    let new_tbody = document.createElement('tbody'); // Create a <tbody> element
    let new_thead = document.createElement('thead'); // Create a <thead> element (table head)
    let new_table_row = document.createElement('tr'); // Create a <tr> elelement (table row)

    if(includeColumnHeads){ // If the user wants to include column heads
        for(let j = 0; j < tableColumns; j++){ // For every column, generate a header <th> element
        new_table_row.innerHTML += "<th><a class=\"button sort\"><i class=\"fa-solid fa-list\" title=\"Sort Column\"></i></a><input placeholder=\"Enter Column Name...\"></th>"
        }
    }
    else{
        new_table.classList.add("no_column_heads"); // add the class "no_column_heads" if the user requested no column heads for future use
        for(let j = 0; j < tableColumns; j++){ // For every column, generate a header <th> element
        new_table_row.innerHTML += "<th><a class=\"button sort\"><i class=\"fa-solid fa-list\" title=\"Sort Column\"></i></a>Column " + (j+1) + "</th>"
        }
    }

    new_table_row.innerHTML += "<th><div>TOOLS</div><a class=\"button add_new_row\"><i class=\"fa-solid fa-plus-square\" title=\"Add New Table Row\"></i></a></th>" // add a last <th> element for the "TOOLS" column

    new_thead.appendChild(new_table_row); // append the row to table head
    new_table.appendChild(new_thead); // append the table head to the table

    for(let i = 0; i < tableRows; i++){ // For every row

        let new_table_row = document.createElement('tr'); // Create a <tr> elelement (table row) 

        for(let j = 0; j < tableColumns; j++){ // For every Column, generate a table data cell <td> element
        new_table_row.innerHTML += "<td><input type=\"text\"></td>"
        }

        // add a last column that will contain the tools for every table row
        new_table_row.innerHTML += `
            <td class="edit_tools">
            <a class="button rClone"><i class="fa-solid fa-clone" title="Clone Row"></i></a>
            <a class="button rDelete"><i class="fa-solid fa-trash-can" title="Delete Row"></i></a>
            </td> 
            `;

        new_tbody.addEventListener('click', buttonClickHandler, true); // register a click listener to the table body so as to capture the clicks to the "TOOLS" buttons

        new_tbody.appendChild(new_table_row); // append the generated row to the table body (tbody)
    }
    new_table.appendChild(new_tbody); // append the table body (tbody) to the table

    document.getElementById("generated_table_wrapper").appendChild(new_table); // append the table to its wrapper

    tableSort(document.getElementById("generated_table")); // make the table sortable

    document.querySelector(".add_new_row").addEventListener("click", addNewTableRow); // register a click listener to the "add new row" button
    
    document.getElementById("table_generator_form").style.display = "none"; // since the table is generated, hide the generator form
    document.getElementById("generated_table_controls").style.display = "block"; // display the table filters

    columnsFilter(); // enable functionality of "columns filter" to display selected columns
    topThreeFilter(); // enable functionality of "show top 3 rows" filter
    localStorageDelete(); // enable functionality of "Erase All Data" button
}


function tableInputChangeHandler(e) {
    // if any table input field was changed, set the changed value as a "value" attribute on the HTML element so as it can be saved to local storage
    if (e.target.nodeName === "INPUT"){
        e.target.setAttribute("value", e.target.value)
        if (e.target.parentNode.nodeName === "TH") {
        document.querySelector(".table_controls_label.show_cols .filter").innerHTML = "";
        columnsFilter();
        }
    }
    localStorageSave(); // save to local storage
}
  
  
function addNewTableRow(){
    // capture DOM elements and store them in variables
    let tableBody = document.querySelector("#generated_table tbody");
    let tableRows = tableBody.getElementsByTagName("tr");
    let lastTableRow = tableRows[tableRows.length - 1];

    // duplicate the last table row
    let duplicateRow = lastTableRow.cloneNode(true);

    // capture last table row's input fields
    let duplicateRowCellInputs = duplicateRow.getElementsByTagName("input");

    // clear all last table row's input values
    for (let i = 0; i < duplicateRowCellInputs.length; i++) {
        duplicateRowCellInputs[i].value = "";
        duplicateRowCellInputs[i].setAttribute("value","");
        duplicateRowCellInputs[i].parentNode.classList.remove('instantHighlight');
    }

    // append the new and cleared row to the end of the table
    tableBody.appendChild(duplicateRow);
}
  
function buttonClickHandler(e) {
    // this function handles the clicks of the "clone row" and "delete row" buttons
    if (e.target.matches('.rClone i')) {
        duplicateRow(e); // duplicate the row (custom function)
    }
    if (e.target.matches('.rDelete i')) {
        let table = e.target.closest('table'); // get the table
        deleteRow(e); // delete the row (custom function)
    }
}

function duplicateRow(evt) {
    // this function duplicates a row - the row is selected by the target of the click event
    let duplicateElement = evt.target.closest('tr').cloneNode(true);
    duplicateElement.classList.add('cloned');
    evt.target.closest('tbody').insertBefore(duplicateElement, evt.target.closest('tr'));
    setTimeout(function () {
        duplicateElement.classList.remove('cloned'); // with setTimeout: remove the class "cloned" after the css animation (of duration .5s) has been completed
        localStorageSave(); // save to local storage
    }, 500)
}
      
function deleteRow(evt) {
    // this function deletes a row - the row is selected by the target of the click event
    // make sure that there is at least one row left after deletion
    if(evt.target.closest('tbody').getElementsByTagName('tr').length > 1){
        evt.target.closest('tr').classList.add('removed'); // add the class "removed" to animated the deletion of the row
        setTimeout(function () {
            evt.target.closest('tr').remove(); // with setTimeout: remove the row after the css animation (of duration .5s) has been completed
            localStorageSave(); // save to local storage
        }, 500)
    }
    else
        alert("Error: It is not possible to delete all table rows.")
}
  
 
function columnsFilter(){
    // capture DOM elements and store them to variables
    let table = document.querySelector("#generated_table");
    let tableColHeads = table.querySelectorAll("th");

    let htmlToReturn = ""; // initialize htmlToReturn variable

    // for every table column head
    for (let i = 0; i < tableColHeads.length - 1; i++) {

        // generate the HTML for each column's filter depending on the user's choice to include column heads or not
        if (table.classList.contains("no_column_heads")) {
        htmlToReturn += "<div class=\"option\"><input type=\"checkbox\" id=\"column_" + i + "\" name=\"column_" + i + "\"><label for=\"column_" + i + "\">" + tableColHeads[i].textContent + "</label></div>";
        }
        else {
        htmlToReturn += "<div class=\"option\"><input type=\"checkbox\" id=\"column_" + i + "\" name=\"column_" + i + "\"><label for=\"column_" + i + "\">" + tableColHeads[i].getElementsByTagName("input")[0].value + "</label></div>";
        }

    }

    document.querySelector(".table_controls_label.show_cols .filter").innerHTML += htmlToReturn; // append the generated HTML for the filters to the table controls area

    // register click listener to the columns filter area so as to capture clicks on the individual included column filters
    document.querySelector(".table_controls_label.show_cols").addEventListener('click', function(evt) {
        let selectedCheckboxes = document.querySelectorAll(".table_controls_label.show_cols .option input"); // stores filter inputs
        let selectedColumnsToShow = []; // initializes empty array

        // for every column filter
        for (let j = 0; j < selectedCheckboxes.length; j++) {
            // if any of them is selected, remember it by storing its number (which is in respect with the column numbers) to the array
            if (selectedCheckboxes[j].checked) {
                selectedColumnsToShow.push(j);
            }
        }

        // store DOM table elements
        let tableRows = table.querySelectorAll("tr");
        let columnsHeads = tableRows[0].getElementsByTagName("th");

        // for every table row
        for (let z = 0; z < tableRows.length; z++) {
            let rowCells = tableRows[z].getElementsByTagName("td"); // store the cells of this row
            
            // for every cell of this row
            for (let c = 0; c < rowCells.length - 1; c++) {

                // if any column filter was indeed requested by the user (array contains items)
                if (selectedColumnsToShow.length > 0) {
                    // if this column is not included in the ones which were selected by the user as visible, hide it
                    if (!selectedColumnsToShow.includes(c)) {
                        columnsHeads[c].style.display = "none";
                        rowCells[c].style.display = "none";
                    }
                    // else display it
                    else{
                        columnsHeads[c].style.display = "table-cell";
                        rowCells[c].style.display = "table-cell";
                    }
                }
                // if no column filter was requested by the user, show the cell normaly
                else {
                    columnsHeads[c].style.display = "table-cell";
                    rowCells[c].style.display = "table-cell";
                }

            }
        }

    });
}
  

function topThreeFilter() {
    // make sure the filter is unselected (to prevent the checkbox staying checked upon page reloads)
    document.querySelector(".table_controls_label.top_three input").checked = false;

    // store DOM elements to variables 
    let table = document.querySelector("#generated_table");
    let tableRows = table.querySelectorAll("#generated_table tbody tr");

    // make sure that all table rows are indeed visible
    for(let i = 0; i < tableRows.length; i++) {
        tableRows[i].style.display = "table-row";
    }

    // register click listener to the "show top 3 rows" table filter
    document.querySelector(".table_controls_label.top_three").addEventListener('click', function(evt) {
		tableRows = table.querySelectorAll("#generated_table tbody tr");
        let topThreeCheckbox = document.querySelector(".table_controls_label.top_three input");
        // if the checkbox is checked
        if(topThreeCheckbox.checked){
            // hide all rows starting from the fourth one
            for(let i = 3; i < tableRows.length; i++) {
                tableRows[i].style.display = "none";
            }
        }
        // if the checkbox is not checked (we want all rows)
        else {
            // show all rows
            for(let i = 0; i < tableRows.length; i++) {
                tableRows[i].style.display = "table-row";
            }
        }
    });
}

// Save to local storage
function localStorageSave(){
    let  pageTitle = document.getElementById("page_title").textContent; // store the page title in variable
    let  table = document.querySelectorAll('#generated_table')[0].outerHTML; // store the table's HTML in variable
    let pageTitleJSON = JSON.stringify(pageTitle); // convert the page title to JSON string
    let tableJSON = JSON.stringify(table); // convert the table's HTML to JSON string
    
    // save data to local storage
    window.localStorage.setItem('pageTitle', pageTitleJSON);
    window.localStorage.setItem('savedTable', tableJSON);
}
  
// Retrieve from local storage
function localStorageLoad(){
    // store the variables as JSON the retrieved data from local storage
    let pageTitleJSON = JSON.parse(window.localStorage.getItem('pageTitle'));
    let tableJSON = JSON.parse(window.localStorage.getItem('savedTable'));

    // update DOM with the data retrieved from local storage
    document.getElementById("page_title").textContent = pageTitleJSON;
    document.getElementById("generated_table_wrapper").innerHTML = tableJSON;

    // store table headings and cells to variables
    let tds = document.querySelectorAll('#generated_table_wrapper td');
    let ths = document.querySelectorAll('#generated_table_wrapper th');

    // for all the cells
    for (let i = 0; i < tds.length; i++) {
        tds[i].classList.remove('instantHighlight'); // remove the sorting class "instantHighlight" (if existing/saved) from previous sorting
        tds[i].style.display = "table-cell"; // ensure display: table-cell since some filters hide cells by display: none
    }

    for (let i = 0; i < ths.length; i++) {
        ths[i].style.display = "table-cell"; // ensure display: table-cell since some filters hide cells by display: none
    }
    
    document.querySelectorAll('#generated_table_wrapper tbody')[0].addEventListener('click', buttonClickHandler, true); // add click listener to the table's body for the row clone and delete buttons
    
    tableSort(document.getElementById("generated_table")); // enable table sorting functionality

    document.querySelector(".add_new_row").addEventListener("click", addNewTableRow); // add click listener to the "add new row" button

    columnsFilter(); // enable functionality of "columns filter" to display selected columns

    topThreeFilter(); // enable functionality of "show top 3 rows" filter
    
    localStorageDelete(); // enable functionality of "Erase All Data" button
}
  
  
function localStorageDelete() {
    // deletes all data stored in local storage

    // register click listener to the "Erase All Data" button
    document.querySelector("#generated_table_controls #clearEverything").addEventListener('click', function(evt) {
        // create verification popup
        let verification = confirm("This operation will destroy the table and delete all the saved data in it. Are you sure you want to continue?")
        // if user really wants to erase everyting
        if (verification){
            // ask again to be sure
            let secondVerification = confirm("You have requested to delete everything. Are you sure you want to continue?")
            // if the user is really sure, clear local storage and reload the page to start the setup process over
            if (secondVerification) {
                localStorage.clear();
                window.location.reload();
            }
        }
    });
}
  

function tableSort(table){
    // this function sorts the table

    let order = 'ASC'; // Default ordering
    let previouslySortedWith; // Remember the column with which previous sorting occured (to toggle ASC/DESC sorting)
    
    let tableHeadings = table.getElementsByTagName('th');

    // for every heading of "standings" table instance
    for (let thIndex = 0; thIndex < tableHeadings.length-1; thIndex++) {

    tableHeadings[thIndex].classList.remove('sortedWith','ascOrder','descOrder');

    tableHeadings[thIndex].querySelector("a.button.sort").addEventListener('click', function(evt) { // add a listener to every heading
    
        if (typeof previouslySortedWith !== 'undefined') { // if this is not the first time a sorting occurs, remove the highlighting from the previous column to add it to the new sorted column
            tableHeadings[previouslySortedWith].classList.remove('sortedWith');
            tableHeadings[previouslySortedWith].classList.remove('ascOrder');
            tableHeadings[previouslySortedWith].classList.remove('descOrder');
        }

        if (previouslySortedWith === thIndex){ // sorting order toggle - if the same column heading was clicked twice in a row
            if (order === 'ASC')
                order = 'DESC'; // swich the sorting direction
            else
                order = 'ASC'; // swich the sorting direction
        }
        else // if this is not the same column; the sorting is carried out with another column
            order = 'ASC'; // swich the sorting direction


        // call tColumnSort function
        tColumnSort(table, thIndex, order);

        // mark the column by which the sorting was done
        tableHeadings[thIndex].classList.add('sortedWith'); // add the class "sortedWith" to the selected column in order to style the heading accordingly
        if (order === 'ASC')
            tableHeadings[thIndex].classList.add('ascOrder'); // add the class "ascOrder" to the sorted column in order to style the heading accordingly
        else
            tableHeadings[thIndex].classList.add('descOrder'); // add the class "descOrder" to the sorted column in order to style the heading accordingly
        previouslySortedWith = thIndex; // keep the column by which the sorting was done in order to compare it with the next selected sorting column
        });
    }
}
  

function tColumnSort(table, columnIndex, sortingOrder) {
    // this function receives the table, the corresponding column index, and the order (ASC/DESC) to sort with.

    // get tbody of the selected table
    let tableBody = table.getElementsByTagName('tbody')[0];

    // get table rows
    let tableRows = tableBody.getElementsByTagName('tr');

    // remove the highlighter class from all column cells (td)
    for (let c = 0; c < tableBody.getElementsByTagName('td').length; c++) {
        tableBody.getElementsByTagName('td')[c].classList.remove('instantHighlight');
        tableBody.getElementsByTagName('td')[c].offsetHeight; // This is used to trigger a reflow between removing and adding the class name (later in this function).
                                                            // reading the property requires a recalc which does the trick.
    }

    // JS array that will be populated with the HTML table data. Later the HTML table is converted to JS array in order to use the JS built-in "sort" function as it is the most efficient way of sorting.
    let arrayFromTable = []; // 1D array that will contain other (row) arrays to mimic a 2D array
    
    //for every table row 
    for (let trIndex = 0; trIndex < tableRows.length; trIndex++) {

        let rowCells = tableRows[trIndex].getElementsByTagName('td');     
        let arrayOfThisRow = []; // 1D array that will contain each table row td elements

        // for every HTML table cell
        for (let tdIndex = 0; tdIndex < rowCells.length; tdIndex++) {

            // check if the table cell contains an HTML input element, i.e. comparable data
            if(rowCells[tdIndex].getElementsByTagName('input')[0] instanceof HTMLInputElement) {

                // if the input element is of type: text
                if (rowCells[tdIndex].getElementsByTagName('input')[0].type === 'text') {

                    let tdValue = rowCells[tdIndex].getElementsByTagName('input')[0].value; // get HTML table cell input values
                    let regex = /^\d+\.*\d*$/; // create a regex to check if the cell values are of numeric format
    
                    // if the regex test reveals that cell values are of numeric format, push them as type "number" to the JS array
                    if (regex.test(tdValue))
                        arrayOfThisRow.push(Number(tdValue));
                    // otherwise, push the actual values untouched (string)
                    else
                        arrayOfThisRow.push(tdValue);

                }
            }
            // in case the table cell does NOT contain comparable information, push the actual values untouched (string)
            else {
                let tdValue = rowCells[tdIndex].innerHTML;
                arrayOfThisRow.push(tdValue);
            }

        }

        // push each HTML table row data to the JS array
        arrayFromTable.push(arrayOfThisRow);

    }
    
    // sort the JS array employing the custom comparator "columnDataComparator"
    arrayFromTable.sort(columnDataComparator(columnIndex, sortingOrder));

    // since the JS array is now sorted, the HTML table needs to be updated with the new (sorted) values
    for (let arrRowIndex = 0; arrRowIndex < arrayFromTable.length; arrRowIndex++){ // for every JS array row
        let rowCells = tableRows[arrRowIndex].getElementsByTagName('td'); // get the corresponding HTML table tbdoy row
        for (let arrRowCellIndex = 0; arrRowCellIndex < arrayFromTable[arrRowIndex].length-1; arrRowCellIndex++) { // for every JS array cell

            if(rowCells[arrRowCellIndex].getElementsByTagName('input').length > 0){ // if the initial HTML table cell contains an input element
            rowCells[arrRowCellIndex].getElementsByTagName('input')[0].value = arrayFromTable[arrRowIndex][arrRowCellIndex]; // update the input value
            rowCells[arrRowCellIndex].getElementsByTagName('input')[0].setAttribute("value",arrayFromTable[arrRowIndex][arrRowCellIndex]); // update the input value attribute
            }

        }
    }
    
    // get the cells of the selected column by which the sorting is done (so as to highlight them)
    let tSortCol = tableBody.querySelectorAll('td:nth-child(' + (columnIndex+1) + ')');
    // highlight this sorting column (all vertical cells)
    for (let c = 0; c < tSortCol.length; c++)
        tSortCol[c].classList.add('instantHighlight');


    setTimeout(function () { 
    for (let c = 0; c < tSortCol.length; c++)
        tSortCol[c].classList.remove('instantHighlight');
    }, 500);

    localStorageSave(); // save data to local storage
}
  

function columnDataComparator(columnToSort, sortingOrder) {
    // this is a custom comparator used to better compare (and sort) the different type values
    // this comparator takes as an argument the column of the table which will be used for the table sorting and the sorting direction (ASC/DESC)

    return function(a, b) { // return the comparator function
        if(sortingOrder === 'ASC'){
            if (typeof a[columnToSort] === 'string' && typeof b[columnToSort] === 'string') // if comparing strings, use the localeCompare function to compare
                return a[columnToSort].localeCompare(b[columnToSort])
            if (typeof a[columnToSort] === 'number' && typeof b[columnToSort] === 'number') // if comparing numbers, evaluate their difference
                return a[columnToSort] - b[columnToSort];
        }
        else {
            if (typeof a[columnToSort] === 'string' && typeof b[columnToSort] === 'string') // if comparing strings, use the localeCompare function to compare
                return b[columnToSort].localeCompare(a[columnToSort])
            if (typeof a[columnToSort] === 'number' && typeof b[columnToSort] === 'number') // if comparing numbers, evaluate their difference
                return b[columnToSort] - a[columnToSort];
        }
        return 0;
    }
}

    
 /* 
  // Parse HTML table element to JSON array of objects
  function table2json() {
      let jsonArr = [];
      let obj = {};
      let thNum = document.querySelectorAll('#generated_table th').length; // number of all table headings (th)
  // document.querySelectorAll('#generated_table tr:first-child td').length; ALTERNATIVE WAY TO FIND HOW MANY HEADINGS WE HAVE
      let arrLength = document.querySelectorAll('#generated_table td').length; // number of all table cells (td)
      
      for(let i = 0; i < arrLength; i++){ // for every table row
          if(i%thNum === 0){ // i%thNum uses modulo to split all table cells in chunks (practically to rows), so as to create new objects to add to the JSON array "jsonArr"
                         // if modulo calculation = 0, then a full row has been parsed
              obj = {}; // create new empty object
        jsonArr.push(obj); // push this object to the JSON array "jsonArr"
          }
      // get respective values from HTML table
          let head = document.querySelectorAll('#generated_table th input')[i%thNum].value;
          let content = document.querySelectorAll('#generated_table td input')[i].value;
          obj[head] = content; // assign pair of key-value to the empty object created in this iteration
      }
      console.log(JSON.stringify(jsonArr));
  }
  */
