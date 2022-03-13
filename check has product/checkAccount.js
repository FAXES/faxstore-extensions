const settings = {
    requireSecret: false, // Require a secret for requests to this endpoint
    secret: "cool1234", // The secret to require (like a password)
    logStarts: false // Logs the start of this endpoint
};

module.exports = async function(app, connection) {
    if(settings.logStarts) console.log("/api/checkaccount is now ACTIVE!");
    app.get('/api/checkaccount/:userid/:productid', async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        let userid = req.params.userid.replaceAll("'", "");
        userid = userid.replaceAll('"', '');
        let productid = Number(req.params.productid.replaceAll("'", ""));
        if(isNaN(productid)) {
            console.log(`Product Id is not a number: ${productid}\nType given: ${typeof productid}`);
            return;
        };
        if(!productid || !userid) {
            res.status(400).send({
                error: 'Missing/incorrect parameters'
            });
            return;
        };
        if(settings.requireSecret && !req?.headers?.secret) {
            res.status(401).send({
                error: 'Missing secret'
            });
            return;
        };
        if(settings.requireSecret && req?.headers?.secret != settings.secret) {
            res.status(401).send({
                error: 'Unauthorized, invalid secret provided in headers.'
            });
            return;
        };
        await connection.query(`SELECT * FROM itemsOwned WHERE productId=${productid} AND userId="${userid}"`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) {
                let json_ = {
                    "authorized": false,
                };
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            } else {
                let json_ = {
                    "authorized": true,
                };
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            }
        });
    })
};

// Extension by Hyperz#0001
// Extension by Hyperz#0001
// Extension by Hyperz#0001