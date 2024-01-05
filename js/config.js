
const nsurname = `olashkevych`;

export const config1 = {
  parent: '#usersTable',
  columns: [
    {title: 'Ім’я', value: 'name', input: { type: 'text' }},
    {title: 'Прізвище', value: 'surname', input: { type: 'text' }},
    {title: 'Вік', value: (user) => getAge(user.birthday),  input: { type: 'date', name: 'birthday', label: 'День народження' }}, // функцію getAge вам потрібно створити*/
    { title: 'Фото',  value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`, input: {type: 'text', name: 'avatar', label: 'Фото'}}
  ],
  apiUrl: `https://mock-api.shpp.me/${nsurname}/users`
};

export const config2 = {
  parent: '#productsTable',
  columns: [
    {title: 'Назва', value: 'title', input: { type: 'text' }},
    {title: 'Ціна', value: (product) => `${product.price} ${product.currency}`,  input: [
        { type: 'number', name: 'price', label: 'Ціна' },
        { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
      ]},
    {title: 'Колір', value: (product) => getColorLabel(product.color),  input: { type: 'color', name: 'color' }}, // функцію getColorLabel вам потрібно створити
  ],
  apiUrl: `https://mock-api.shpp.me/${nsurname}/products`
};

/**
 * function calculates the number of years to date
 * @param {*} birthday birthday in format "2023-12-18T04:34:03.046Z"
 */
function getAge(birthday) {
  const nowDay = new Date();
  const birthDayDate = new Date(birthday);
  const age = Math.floor((nowDay.getTime()-birthDayDate.getTime())/(365.25*24*60*60*1000));
  return age;
}

/**
 * the function takes a color and returns an html string with a block of the appropriate color and certain styles
 * @param {*} color - color
 * @returns div element html 
 */
function getColorLabel(color) {
  return `<div style="background:${color}; width: 100%;height: 20px;border-radius: 50%"></div>`;
}