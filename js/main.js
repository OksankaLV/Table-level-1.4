import { config1, config2 } from "./config.js";

/**
 * table construction function
 * @param {*} config - configurations that configure the table
 */
function DataTable(config) {
  // Тут у принципі те саме що й на минулому рівні було
  // тільки якщо не приходить параметр data, то потрібно перевірити,
  // можливо в конфізі є поле apiUrl
  // і тоді дані потрібно брати звідти
   
  //first add place for table
  const place = config.parent;
  const divTable = document.querySelector(place);
  const table = document.createElement('table');
  divTable.appendChild(table);

  // creation of a table header by config
  const thead = addHeaderTable();

  addButtonInsert(thead);

  getData(config.apiUrl).then(req => addData(req.data)).then(data => addColumnsTable(data));
  
  /**
   * the function accepts an object and returns an array of values ​​necessary to fill the table
   * if the property is a function, then an argument is passed to it and it is executed
   * @param {*} obj object of type {1:{val_1: 1, val_2: 2}, 2:{...}...}
   * @returns [{id:1, val_1:1, val_2:2}, {id:2...}...]
   */
  function addData(obj) {
    let data = [];
    for (let i in obj) {
      const user = obj[i]
      let newObj = { id: i };
      for (let j of config.columns) {
        if (typeof j.value !== 'function') {
          newObj = { ...newObj, [j.value]: user[j.value] }
        } else {
          newObj = { ...newObj, [j.value]: j.value(user) }
        }
      }
      data.push(newObj);
    }
    return data;
  }

  // creating the main part of the table
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  //line first
  function addColumnsTable(data) {
    
    for (let i = 0; i < data.length; i++) {
      const tr = document.createElement('tr');
      tbody.appendChild(tr);
      const number = document.createElement('td');
      number.innerHTML = i + 1;
      tr.appendChild(number);

      // columns in each row        
      for (let j = 0; j < config.columns.length; j++) {
        let td = document.createElement('td');
        let key = data[i][config.columns[j].value];
        key == undefined ? td.innerHTML = " " : td.innerHTML = data[i][config.columns[j].value];
         tr.appendChild(td);
      }

      addButton(tr,'Видалити', 'buttonDel', data[i].id, delDate);
      addButton(tr, 'Редагувати', 'buttonRewrite', data[i].id, rewriteRow);
    
    } return data;
  }


    function addInsertRow(event) {
      delInput();
      for (let i = 0; i < config.columns.length; i++) {
        const dataInput = config.columns[i].input;
     
        if (Array.isArray(dataInput)) {
          dataInput.forEach(element => {
            addInput(element, i)
          });
        } else { addInput(dataInput, i) }
      }

      function addInput(oneInput, i) {
        const label = document.createElement('label');
        const thInput = document.createElement('th');
        thInput.className = 'formInput';

        if (oneInput.type != 'select') {
            const input = document.createElement('input');
            input.id = oneInput.name || config.columns[i].value;
            input.name = oneInput.name || config.columns[i].value;
            label.innerHTML = oneInput.name || config.columns[i].title;
            
          for (let k in oneInput) {
            input[k] = oneInput[k]
            input.className = 'inputData'
            if (oneInput.required !== false) { input.required = true }
            input.onkeydown = verifyOutputCell;
            thInput.appendChild(label);
            label.appendChild(input)
            thead.appendChild(thInput) // REWRITED tr
          }
        } else {
          const select = document.createElement('select');
          select.id = oneInput.name || config.columns[i].value;;
          select.name = oneInput.name || config.columns[i].value;
          select.className = 'inputData'
          if (oneInput.required !== false) { select.required = true }
          thInput.appendChild(label);
          oneInput.options.forEach(el => {
          const option = document.createElement('option');
            option.value = el;
            option.innerHTML = el;
            select.appendChild(option)
          })
          label.appendChild(select)
          thead.appendChild(thInput) // REWRITED tr
        }

        function verifyOutputCell(event) {
          if (event.key === "Enter") {
            boderRed('.inputData')
            if (noBoderRedBoolean()){
              document.querySelector("#inputButton").click()
            }
          }

        }
      }
         
      const input = document.createElement('input')
      input.id = 'inputButton';
      input.type = 'button';
      input.value = "Зберегти";
      input.className = 'formInput'
      input.onclick = addNewData;
      const thInput = document.createElement('th');
      thInput.appendChild(input)
      thInput.className = 'formInput';
      thead.appendChild(thInput) //REWRITED tr
    }
    
    async function addNewData() {
      const url = config.apiUrl;
      const res = document.querySelectorAll('.inputData');
      boderRed();
      let obj = {};
      for (let i = 0; i < res.length; i++) {
        let resKey = res[i].id
        let resVal;
        res[i].type !== 'number' ? resVal = res[i].value : resVal = +res[i].value;
        obj = { ...obj, [resKey]: resVal }
    }

       document.querySelector(`${config.parent} table`).remove();
    const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(obj), // body data type must match "Content-Type" header*/
  });
      return response.json().then(req => { if (req.status='200'){DataTable(config)}});
  }

  function addButtonInsert(elemParent) {
    const tr = document.createElement('tr');
    const th = document.createElement('th')
    const buttonInsert = document.createElement('button');
    buttonInsert.innerHTML = 'Додати'
    buttonInsert.onclick = addInsertRow;
    th.appendChild(buttonInsert)
    tr.appendChild(th)
    elemParent.appendChild(tr)

  }
  function rewriteRow(event) {
    delInput()
    const elemParent = event.srcElement;
    const id = elemParent['data-id']
    const tr = document.createElement('tr')
    tr.className = 'formInput'
    elemParent.removeEventListener('click',rewriteRow)
const properties = config.columns
      for (let i = 0; i < properties.length; i++) {
        const dataInput = properties[i].input;
        if (typeof dataInput[0] === 'object') {
          dataInput.forEach(element => {
            addInput(element, i)
          });
        } else { addInput(dataInput, i) }
    } 
  elemParent.parentNode.appendChild(tr);

      function addInput(oneInput, i) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.id = oneInput.name || properties[i].value;
        input.name = oneInput.name || properties[i].value;
        label.innerHTML = oneInput.name || properties[i].title;
        const thInput = document.createElement('th');
         thInput.className = 'formInput'
        if (oneInput.type != 'select') {
          for (let k in oneInput) {
            input[k] = oneInput[k]
            input.className = 'inputData'
            if (oneInput.required !== false) { input.required = true }
            input.onkeydown = verifyOutputCell;
            thInput.appendChild(label);
            label.appendChild(input)
            tr.appendChild(thInput)
          }
        } else {
          const select = document.createElement('select');
          select.id = input.id;
          select.name = input.name;
          select.className = 'inputData'
          if (oneInput.required !== false) { select.required = true }
          thInput.appendChild(label);
          oneInput.options.forEach(el => {
          const option = document.createElement('option');
            option.value = el;
            option.innerHTML = el;
            select.appendChild(option)
          })
          label.appendChild(select)
          tr.appendChild(thInput)
        }

        function verifyOutputCell(event) {
  
          if (event.key === "Enter") {
            document.querySelectorAll(".inputData").forEach(
              el => {
                if (el.value === '') {
                  el.classList.add('.redBorder')
                  el.focus();
                  throw new Error('Not data in verifyOutputCell'); //rewrited error
                } else {
                  el.classList.remove('.redBorder')
                }
              }
            )
            if (document.querySelectorAll('.redBorder').length===0){
              replaceDate(id,config)
            }
          }
        }
      }
  }
  function delDate(event) {
    const id = event.target['data-id'];
    deleteRow(id,config)
  }

function addHeaderTable() {
  
  const thead = document.createElement('thead');
  table.appendChild(thead);

  const trThead = document.createElement('tr');
  thead.appendChild(trThead);

  const thNumber = document.createElement('th');
  thNumber.innerHTML = "№";

  trThead.appendChild(thNumber);
  for (let i in config.columns) {
    const th = document.createElement('th');
    th.innerHTML = config.columns[i].title;
   // const val = config.columns[i].value
   // value.push(val);
    trThead.appendChild(th);
  }
 return thead
}

}

DataTable(config1);
DataTable(config2);

async function getData(url) {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    /*body: JSON.stringify(data), // body data type must match "Content-Type" header*/
  }).catch(error=>console.log(error));
  return await response.json();
  // parses JSON response into native JavaScript objects
}
async function deleteRow(id, config) {
 document.querySelector(`${config.parent} table`).remove();
 const urlDel = `${config.apiUrl}/${id}`;
 
  const response = await fetch(urlDel, {
    method: "DELETE",
    mode: "cors",
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(), // body data type must match "Content-Type" header*/
  });
  return response.json().then(req => {
    if (req.result="Deleted!"){DataTable(config)}
  });
  
}

async function replaceDate(id, config) {
 const urlPut = `${config.apiUrl}/${id}`;

  const res = document.querySelectorAll('.inputData')
    let obj = {};
    for (let i = 0; i < res.length; i++) {
      const resKey = res[i].id
      let resVal;
        res[i].type !== 'number' ? resVal = res[i].value : resVal = +res[i].value;
    obj = { ...obj, [resKey]: resVal }

  }
  document.querySelector(`${config.parent} table`).remove();

  const response = await fetch(urlPut, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(obj), // body data type must match "Content-Type" header*/
  });
  return response.json().then(req => {
    if (req.result="Updated!"){DataTable(config)}
  });;

}

function delInput() {
    const inputNow = document.querySelectorAll('.formInput');
    if (inputNow != null ) { inputNow.forEach(el=>el.remove()) };
}

function addButton(parent, name, className, id, delDate) {
   const button = document.createElement('button')
  button.innerHTML = name
  button.className = className;
  button['data-id'] = id;
  button.onclick = delDate;
  parent.appendChild(button)
};

function boderRed() {
  document.querySelectorAll(".inputData").forEach(
    el => {
      if (el.value === '') {
        el.classList.add('.redBorder')
        el.focus();
        //throw new Error('Not found data'); //REWRITED return error;
      } else {
        el.classList.remove('.redBorder')
      }
    }
  )
}
function noBoderRedBoolean() {
  return (document.querySelectorAll('.redBorder').length===0)
}


/* DELETE const value = [];
   DELETE table.id = place; #
ADD addHeaderTable() from DataTable
  DELETE addActionsColumn(trThead);
in addColumnsTable the condition if value="Action" was removed and the addition of buttons was moved to a loop (parent td rewrite on tr)
in addInsertRow deleted 
      const properties = config.columns.map(el => el);
      and other console.log(..) in all code
in addInsertRow used Array.isArray() DELETE if (typeof dataInput[0] === 'object')
rewrite addInput
  REWRITE 
      return await response.json().then((res) => {
        document.querySelector(`${config.parent} table`).remove(); return res
      }).then(DataTable(config)); // parses JSON response into native JavaScript objects 
      IN ALL FETCH
REWRITED error ON throw new Error('...'); 

not fixed: repeating the addInput functions and editing a record by replacing an existing one

*/
