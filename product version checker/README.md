## FaxStore Product Version Checker

---

**Installation for Faxstore:**
- Download the `versionChecker.js` and place in your faxstore directory.
- Edit your config for faxstore in the files and `versionChecker.js` to the extraFiles array near the bottom.
- Restart your FaxStore

**Usage in JavaScript:**
```js
let package = require("./package.json");
let version = String(package.version).replaceAll(".","");
let product = package.name;
let res = await axios({
    method: 'get',
    url: `https://yourdomainhere.com/productversioncheck/${version}/${product}`,
    headers: {
        "Accept": 'application/json, text/plain, */*',
        'User-Agent': '*',
    }
});
console.log(res.data)
```
