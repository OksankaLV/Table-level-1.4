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
  const value = [];
 
  //first add place for table
  const place = config.parent;
  const divTable = document.querySelector(place);
  const table = document.createElement('table');
  table.id = place;
  divTable.appendChild(table);

  // creation of a table header by config
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
    const val = config.columns[i].value
    value.push(val);
    trThead.appendChild(th);
  }
  addActionsColumn(trThead);
  addButtonInsert(thead);

  postData(config.apiUrl).then(req => addData(req.data)).then(data => addColumnsTable(data));
  
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
      for (let j of value) {
        if (typeof j !== 'function') {
          newObj = { ...newObj, [j]: user[j] }
        } else {
          newObj = { ...newObj, [j]: j(user) }
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
      for (let j = 0; j < value.length; j++) {
        let td = document.createElement('td');
        let key = data[i][value[j]];
        key == undefined ? td.innerHTML = " " : td.innerHTML = data[i][value[j]];
        if (value[j] == 'Action') {
          //td.innerHTML = `<button class="buttonDel" data-id="${i + 1}" onclick='deleteRow( ${data[i].id}, ${JSON.stringify(config)})'>Delete</button>`
          addButton(td,'Видалити', 'buttonDel', data[i].id, delDate);
          addButton(td, 'Редагувати', 'buttonRewrite', data[i].id, rewriteRow);
          
        };   
        tr.appendChild(td);
      }
    } return data;
  }



  function addActionsColumn(elemParent) {
    const th = document.createElement('th')
    th.innerHTML = "Action"
    elemParent.appendChild(th);
    value.push("Action");
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

    function addInsertRow(event) {
      delInput();
      const properties = config.columns.map(el => el);
      console.log(properties)
      for (let i = 0; i < properties.length; i++) {
        const dataInput = properties[i].input;
        console.log(Object.keys(dataInput))
        if (typeof dataInput[0] === 'object') {
          dataInput.forEach(element => {
            addInput(element, i)
          });
        } else { addInput(dataInput, i) }
      }

      function addInput(oneInput, i) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.id = oneInput.name || properties[i].value;
        input.name = oneInput.name || properties[i].value;
        label.innerHTML = oneInput.name || properties[i].title;
        const thInput = document.createElement('th');
        thInput.className = 'formInput';
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
          console.log(event)
          if (event.key === "Enter") {
            boderRed('.inputData')
        /*    document.querySelectorAll(".inputData").forEach(
              el => {
                if (el.value === '') {
                  el.classList.add('.redBorder')
                  el.focus();
                  return error;
                } else {
                  el.classList.remove('.redBorder')
                }
              }
            )*/
            console.log(document.querySelectorAll('.redBorder'))
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
      tr.appendChild(thInput)
    }
    
    async function addNewData() {
      const url = config.apiUrl;
      console.log(url);
      const res = document.querySelectorAll('.inputData');
      boderRed();
      let obj = {};
      for (let i = 0; i < res.length; i++) {
        let resKey = res[i].id
        let resVal;
        res[i].type !== 'number' ? resVal = res[i].value : resVal = +res[i].value;
        console.log(resKey, resVal)
        obj = { ...obj, [resKey]: resVal }
    }
     console.log(obj)
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
      return await response.json().then((res) => {
        document.querySelector(`${config.parent} table`).remove(); return res
      }).then(DataTable(config)); // parses JSON response into native JavaScript objects 
    }
  }
  function rewriteRow(event) {
    delInput()
    const elemParent = event.srcElement;
    const id = elemParent['data-id']
    const tr = document.createElement('tr')
    tr.className = 'formInput'
    elemParent.removeEventListener('click',rewriteRow)
    console.log(event.srcElement)
const properties = config.columns.map(el => el);
      console.log(properties)
      for (let i = 0; i < properties.length; i++) {
        const dataInput = properties[i].input;
        console.log(Object.keys(dataInput))
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
                  return error;
                } else {
                  el.classList.remove('.redBorder')
                }
              }
            )
            console.log(document.querySelectorAll('.redBorder'))
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
}

DataTable(config1);
DataTable(config2);

async function postData(url) {
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
  return await response.json().then((res) => {
        document.querySelector(`${config.parent} table`).remove(); return res
      }).then(DataTable(config));; // parses JSON response into native JavaScript objects 

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
  return await response.json().then((res) => {
        document.querySelector(`${config.parent} table`).remove(); return res
      }).then(DataTable(config));; // parses JSON response into native JavaScript objects 
  
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
        return error;
      } else {
        el.classList.remove('.redBorder')
      }
    }
  )
}
function noBoderRedBoolean() {
  return (document.querySelectorAll('.redBorder').length===0)
}