const axios = require('axios');

let domain = "https://yourdomain.ext"; // No trailing slash

let body = {
    "user": "USER_TO_INVOICE_ID",
    "title": "INVOICE_TITLE",
    "price": "INVOICE_AMOUNT",
    "description": "INVOICE_DESCRIPTION",
    "username": "YOUR_USERNAME",
    "secret": "API_SECRET"
};

init()

async function init() {
    let request = await axios.post(`${domain}/extensions/invoiceApi/create`, body);
    if(request.data) {
        console.log(request.data);
    };
};