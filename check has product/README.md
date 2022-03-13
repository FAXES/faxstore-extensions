# Check Account
The purpose of Check Account is to allow users to make a simple API call to FaxStore V2 and see if a certain user has a certain product in their account, it will simply just return a true or false value.

---

# Code Example
```javascript
const axios = require('axios');
let userid = 'USER_ID_HERE'; // The user Id account to check for a product
let productid = 7 // The product Id in FaxStore V2

run();
async function run() {
    let res = await axios({
        method: 'get',
        url: `https://yourdomainhere.com/api/checkaccount/${userid}/${productid}`,
        headers: {
            "Accept": 'application/json, text/plain, */*',
            'User-Agent': '*',
            'secret': 'cool1234'
        }
    });
    console.log(res.data);
};
```

---

# Credits
Created by [@Hyperz](https://store.hyperz.net)