## FaxStore - Product Version Checker API

**Installation:**
- Download the `Product Version Checker.js` file and place it into your FaxStore extensions folder.
- Restart FaxStore. Once loaded a message will appear in the FaxStore console.

**Usage in JavaScript:**
```js
const appVersion = '1.2.3';
const productId = 12;
const https = require('https');


https.get(`/api/version/check?version=${encodeURIComponent(appVersion)}&product=${productId}`, (res) => {
    res.on('data', (d) => {
        if(d.same) {
            console.log(`You're application is up to date!`);
        } else {
            console.log(`You're application is outdated`, `Version Changelog:`, d.release?.changelog);
        }
    });
})

/* Expected Output (JSON)
{
    same: true,
    release: {
        version: '1.2.3',
        title: 'My Product Release 1.2.3',
        changelog: 'This version fixes the error that John Doe identified.',
        createdAt: '1641451685943'
    }
}
*/
```

**Creators:**
- [PlutoTheDev](github.com/braxtongpoll)
- [FAXES](github.com/faxes)