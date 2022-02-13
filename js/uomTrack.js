'use strict';

const tableClassToEnhance = 'uomTrack'
const statisticsColumns = [5,6,7]; // choose the number of columns for which stats will be displayed

const standingsTables = document.getElementsByClassName(tableClassToEnhance);

function importTableStyles() {
    // This function will import the CSS required to stylize the Runner Standings Table
    
    // Get html "head" element
    let head = document.getElementsByTagName('head')[0];
    
    // create a new link element with the required attributes for the css file import
    let tableCSS = document.createElement('link');
    tableCSS.rel = 'stylesheet';
    tableCSS.type = 'text/css';
    tableCSS.href = 'css/table-editor.css?ver=1.0';
    
    // append the css link element to head element of page
    head.appendChild(tableCSS);
}



function tableEdit(table) {
    // Add a notification to let the user know that editor mode is activated
    document.getElementById('page_title').outerHTML += '<div class="edit_notification">DATA EDITOR MODE: <strong>ACTIVE</strong></div>';
    document.getElementsByTagName('body')[0].classList.add('data_editor_mode');
    
    let tableRows = table.querySelectorAll('tbody tr'); // get all rows

    // for every row of "standings" table instance
    for (let trIndex = 0; trIndex < tableRows.length; trIndex++){
        let tableRowCells = tableRows[trIndex].getElementsByTagName('td'); // get all row cells

        // for every cell of each row of each "standings" table
        for (let tdIndex = 0; tdIndex < tableRowCells.length; tdIndex++) {

            if(tableRowCells[tdIndex].children.length < 1) { // check if there is only one child node inside this particular table cell and convert it to input field
                let tableCellData = tableRowCells[tdIndex].innerText;
                tableRowCells[tdIndex].innerHTML = '<input type="text" value="' + tableCellData + '">';
            }

            if(tableRowCells[tdIndex].getElementsByTagName('img').length > 0) { // if the table cell contains an image, add the required input functionality
                let tableCellImage = tableRowCells[tdIndex].getElementsByTagName('img')[0]; // get the image
                let imgAltTextData = tableRowCells[tdIndex].getElementsByTagName('img')[0].getAttribute('alt'); // get the images alt attribute
                let imgClassData = tableRowCells[tdIndex].getElementsByTagName('img')[0].getAttribute('class'); // get the images class
                // add two input fields: one to request the new country name from the user and another one to request the new image
                tableRowCells[tdIndex].innerHTML = `
                <input type="image" class="image_input ` + imgClassData + `" alt="` + imgAltTextData + `" src="` + tableCellImage.src + `" />
                <input type="file" class="image_uploader" 
                accept="image/*" 
                style="display: none;" />
                `; 
                /* old version
                tableRowCells[tdIndex].innerHTML = `
                <input type="image" class="image_input" alt="` + imgAltTextData + `" src="` + tableCellImage.src + `" />
                <input type="file" class="image_uploader" 
                accept="image/*" 
                onchange="this.parentElement.getElementsByClassName('image_input')[0].src = window.URL.createObjectURL(this.files[0])" 
                style="display: none;" />
                `;
                */
            }
            
        }

        // add the "clone row" and "delete row" buttons in a new column in the table
        tableRows[trIndex].innerHTML += `
        <td class="edit_tools">
        <a class="button rClone"><i class="fa-solid fa-clone" title="Clone Row"></i></a>
        <a class="button rDelete"><i class="fa-solid fa-trash-can" title="Delete Row"></i></a>
        </td> 
        `;

    }

    // add the required listeners by calling the functions below
    addButtonListeners(table);
    addInputListeners(table);
    
    
}

function duplicateRow(evt) {
    // this function duplicates a row - the row is selected by the target of the click event
    let duplicateElement = evt.target.closest('tr').cloneNode(true);
    duplicateElement.classList.add('cloned');
    evt.target.closest('tbody').insertBefore(duplicateElement, evt.target.closest('tr'));
    setTimeout(function () {
        duplicateElement.classList.remove('cloned'); // with setTimeout: remove the class "cloned" after the css animation (of duration .5s) has been completed
    }, 500)
    /* let duplicateElement = evt.target.parentElement.parentElement.parentElement.cloneNode(true); */
    /* evt.target.parentElement.parentElement.parentElement.parentElement.insertBefore(duplicateElement, evt.target.parentElement.parentElement.parentElement); */   
}
    
function deleteRow(evt) {
    // this function deletes a row - the row is selected by the target of the click event
    // make sure that there is at least one row left after deletion
    if(evt.target.closest('tbody').getElementsByTagName('tr').length > 1){
        evt.target.closest('tr').classList.add('removed'); // add the class "removed" to animated the deletion of the row
        setTimeout(function () {
            evt.target.closest('tr').remove(); // with setTimeout: remove the row after the css animation (of duration .5s) has been completed
        }, 500)
    }
    else
        alert("Error: It is not possible to delete all table rows.")
    /* evt.target.parentElement.parentElement.parentElement.remove(); */
}

function buttonClickHandler(e) {
    // this function handles the clicks of the "clone row" and "delete row" buttons
    if (e.target.matches('.rClone i')) {
        duplicateRow(e); // duplicate the row
        tableOverviewStats(e.target.closest('table'), statisticsColumns); // re-calculate the stats
    }
    if (e.target.matches('.rDelete i')) {
        let table = e.target.closest('table'); // get the table
        deleteRow(e); // delete the row
        tableOverviewStats(table, statisticsColumns);  // re-calculate the stats
    }
}

function addButtonListeners(htmlTable) {
        // this function adds a listener for the tool buttons

        htmlTable.querySelectorAll('tbody')[0].addEventListener('click', buttonClickHandler, true);

        /* old version
         let tableRows = htmlTable[0].getElementsByTagName('tr'); // get all table rows
        for (let trIndex = 1; trIndex < tableRows.length; trIndex++){ // for every row
            tableRows[trIndex].parentElement.addEventListener('click', buttonClickHandler, true); // 
        } */
}

function inputClickHandler(e) {
    if (e.target.matches('.image_input')) { // if the target of the (click) event is an image, request additional text info that will be used for consistent sorting
        if (e.target.matches('.nationality')) {
            let countryName = prompt('Please type the Country Name:', '');
            while (countryName === '') { // request the country name until the user provides data, since it is required for consistent sorting
                countryName = prompt('Country Name is required.\nPlease type the Country Name:', '');
            }

            // if the user provided a country name
            if (countryName !== null && countryName !== '') {
                e.target.parentElement.getElementsByClassName('image_input')[0].setAttribute('alt', countryName); // save it to the image as an alt attribute
                e.target.parentElement.getElementsByClassName('image_uploader')[0].click(); // click the hidden input field to update the image file
            }
        }
        else {
            e.target.parentElement.getElementsByClassName('image_input')[0].setAttribute('alt', 'Profile Picture'); // save it to the image as an alt attribute
            e.target.parentElement.getElementsByClassName('image_uploader')[0].click(); // click the hidden input field to update the image file
            /* console.log(e.target.closest('td').nextElementSibling.getElementsByTagName('input')[0].value); */ // gets the name of person to add it as alt attribute
        }
    }
}

function inputChangeHandler(e) {
    if (e.target.matches('.image_uploader')){
        e.target.parentElement.getElementsByClassName('image_input')[0].src = window.URL.createObjectURL(e.target.files[0]);
    }
    else {
        // every time an input of the table changes, recalculate the statistics with the new data
        tableOverviewStats(e.target.closest('table'), statisticsColumns);
    }
}

function addInputListeners(htmlTable) {
    // this function will add appropriate element listeners to the passed html table.
    let tbody = htmlTable.getElementsByTagName('tbody')[0]; // get the tbody of the table
    tbody.addEventListener('change', inputChangeHandler); // add the change event listener to detect changes on the input fielnds inside
    tbody.addEventListener('click', inputClickHandler); // add the click event litener to detect clicks on the input fielnds inside
}

function tableSort(table){
    // this function sorts the table

    let order = 'ASC'; // Default ordering
    let previouslySortedWith; // Remember the column with which previous sorting occured (to toggle ASC/DESC sorting)
    
    let tableHeadings = table.getElementsByTagName('th');

    // for every heading of "standings" table instance
    for (let thIndex = 0; thIndex < tableHeadings.length; thIndex++) {

        if (thIndex != 1){ // skip the second column that contains the runners' profile images (no sorting will be done with the profile images)
            tableHeadings[thIndex].addEventListener('click', function(evt) { // add a listener to every heading

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
                // else if the input is of type: image
                else if (rowCells[tdIndex].getElementsByTagName('input')[0].type === 'image') {
                    let tdValue = rowCells[tdIndex].getElementsByTagName('input')[0].parentElement.innerHTML; // get the innerHTML of the table cell - normal text sorting is used to sort the images,
                                                                                                              // since the images' alt attribute contain the required info to sort with
                    arrayOfThisRow.push(tdValue); // push the innerHTML to the JS array
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
                if(rowCells[arrRowCellIndex].getElementsByTagName('input')[0].type === 'text') // if the input element is of type: text
                    rowCells[arrRowCellIndex].getElementsByTagName('input')[0].value = arrayFromTable[arrRowIndex][arrRowCellIndex]; // update the input value attribute
                else // if the initial HTML table cell did NOT contain an input element
                    rowCells[arrRowCellIndex].innerHTML = arrayFromTable[arrRowIndex][arrRowCellIndex]; // update the entire cell innerHTML (this case is for images)
            }

        }
    }
    
    // get the cells of the selected column by which the sorting is done (so as to highlight them)
    let tSortCol = tableBody.querySelectorAll('td:nth-child(' + (columnIndex+1) + ')');
    // highlight this sorting column (all vertical cells)
    for (let c = 0; c < tSortCol.length; c++)
        tSortCol[c].classList.add('instantHighlight');
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

function tableOverviewStats(table, colNumsToSumArray) {

    // get tbody of the selected table
    let tableBody = table.getElementsByTagName('tbody')[0];

    // get table rows
    let tableRows = tableBody.getElementsByTagName('tr');

    // get table foot content (legend)
    let tableFoot = table.getElementsByTagName('tfoot')[0];
    const initialTableFootContent = tableFoot.querySelectorAll('tr:last-child')[0].innerHTML;

    // remove the previous table foot in order to add a new one with the overview stats (this is done to preserve data consistency)
    if (tableFoot) {
        tableFoot.remove();
    }

    // create a tfoot element and append it to the table
    let tfootNewElement = document.createElement('tfoot');

    // create a tr element and append if to the previously created tfoot element
    let tr_tfootNewElement = document.createElement('tr');
    tfootNewElement.appendChild(tr_tfootNewElement);

    // create a th element and append it to the previously created tr element
    const th_tr_tfootNewElement = document.createElement('th');
    th_tr_tfootNewElement.colSpan = table.getElementsByTagName('th').length + 2;
    th_tr_tfootNewElement.innerHTML = '<span class="title">STATISTICS</span><span class="sub_title">STATISTICS</span>';
    tr_tfootNewElement.appendChild(th_tr_tfootNewElement);

    // for every column for which overview stats are required
    for (let colNumToCalc = 0; colNumToCalc < colNumsToSumArray.length; colNumToCalc++) {

        let colMin = tableRows[0].getElementsByTagName('td')[colNumsToSumArray[colNumToCalc]].getElementsByTagName('input')[0].value; // get the first element of the requested column
        let colMax = tableRows[0].getElementsByTagName('td')[colNumsToSumArray[colNumToCalc]].getElementsByTagName('input')[0].value; // get the first element of the requested column
        let colRows = 0; // initialize the colRows counter (counts the rows of the column)
        let colSum = 0; // initialize the sum of the particular row
    
        //for every table row
        for (let trIndex = 0; trIndex < tableRows.length; trIndex++) {

            let rowCells = tableRows[trIndex].getElementsByTagName('td'); // get the HTML table cells
    
            colRows += 1; // increase the rows counter
            
            let tCellInputElement = rowCells[colNumsToSumArray[colNumToCalc]].getElementsByTagName('input'); // get the contained input HTML element - please read below *
           
            

            // * rowCells contains the cells (td) of the current table row.
            // colNumsToSumArray is the array that contains the NUMBERS of the columns for which the stats are calculated.
            // colNumToCalc is the current columns iteration index, i.e. one of the total amount of columns for which calulation is requested.
            // so colNumToCalc as the ITERRATOR of ARRAY colNumsToSumArray returns the number of each column of the total requested columns to be calculated.
           
           

            // get the minimum of the specified column by comparison
            if (colMin > Number(tCellInputElement[0].value))
                colMin = Number(tCellInputElement[0].value);

            // get the maximum of the specified column by comparison
            if (colMax < Number(tCellInputElement[0].value))
                colMax = Number(tCellInputElement[0].value);

            colSum += Number(tCellInputElement[0].value); // convert the HTML "input" element value to type Number (so as it can be used for math calculations)
        }

        // calculate the colSpan based on the number of columns contained in the table
        let colSpan = Math.floor(table.getElementsByTagName('th').length/(colNumsToSumArray.length+1)); // +1 to include the headings column which labels the rows


        tr_tfootNewElement = document.createElement('tr'); // re-instantiate tr_tfootNewElement so as to have fresh, empty tr elements (the previous included a tr element filled with th elements)
        tfootNewElement.appendChild(tr_tfootNewElement); // append the new tr_tfootNewElement to the tr

        const td_tr_tfootNewElement = document.createElement('td'); // create a "td" element
        td_tr_tfootNewElement.colSpan = colSpan-1; // -1 to make the new headings column which labels the rows a bit smaller than the other columns
        // however, ensure that colspan is at least 1
        if(td_tr_tfootNewElement.colSpan < 1) {
            td_tr_tfootNewElement.colSpan = 1;
        }
        td_tr_tfootNewElement.classList.add('stats_heading');
        td_tr_tfootNewElement.innerText = table.getElementsByTagName('th')[colNumsToSumArray[colNumToCalc]].innerText; // name the row headings the same as the column headings for which the stats are displayed
        
        tr_tfootNewElement.appendChild(td_tr_tfootNewElement);

        // add the columns with the calculated stats (min, max, average) to the row
        tr_tfootNewElement.innerHTML += `
        <td colspan="` + (colSpan) + `" data-type="` + table.getElementsByTagName('th')[colNumsToSumArray[colNumToCalc]].innerText + `">
        <span class="inline_heading">Minimum</span><br>` + colMin + `
        </td>
        `
        +
        `
        <td colspan="` + (colSpan) + `" data-type="` + table.getElementsByTagName('th')[colNumsToSumArray[colNumToCalc]].innerText + `">
        <span class="inline_heading">Maximum</span><br>` + colMax + `
        </td>
        `
        +
        `
        <td colspan="` + (colSpan+3) + `" data-type="` + table.getElementsByTagName('th')[colNumsToSumArray[colNumToCalc]].innerText + `">
        <span class="inline_heading">Average</span><br>` + (colSum/colRows).toFixed(2) + `
        </td>
        `
        ;

    }

    // add the previous table foot content
    tfootNewElement.innerHTML += initialTableFootContent;
    table.appendChild(tfootNewElement);
}


/* CALLING THE FUNCTIONS */
document.addEventListener("DOMContentLoaded", function (){
    importTableStyles();
    for (let t = 0; t < standingsTables.length; t++) {
        tableEdit(standingsTables[t]);
        tableSort(standingsTables[t]);
        tableOverviewStats(standingsTables[t], statisticsColumns);
    }
});

/* let tableEditorAlreadyCalled;
function tableEditor(){
    if (tableEditorAlreadyCalled !== true && (document.readyState === "complete" || document.readyState === "loaded")) {
        importTableStyles();
        for (let t = 0; t < standingsTables.length; t++) {
            tableEdit(standingsTables[t]);
            tableSort(standingsTables[t]);
            tableOverviewStats(standingsTables[t], statisticsColumns);
        }
    }
    else {
        console.log ('Table Editor Functions are already in use.')
    }
}
 */