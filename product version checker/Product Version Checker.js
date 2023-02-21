// Config no longer used since v1.9.2 of FaxStore
const products = {
	["product-name"]: { // the product name you'll pass in your query
		version: "1.0.0" // The version that is the most up to date to check against.
	}
}

module.exports = function(app, connection, client, faxstore) {
	faxstore.registerExtension({
	    name: 'Version Checker API',
	    description: 'This extension adds an API endpoint to allow you to check for the latest version of a product - ',
	    version: '1.0.1',
	    author: 'FAXES',
	}, __filename);

	app.get("/api/version/check", function(req, res) {
		let appVersion = decodeURIComponent(req.query.version).replaceAll("'","''");
		let product = Number(req.query.product) || 0;
		connection.query(`SELECT * FROM productDownloads WHERE productId = ${product} ORDER BY id DESC`, (err, result) => {
			if(result[0]) {
				if(appVersion == result[0].version) { // up to date
					res.json({
						same: true,
						release: {
							version: result[0].version,
							title: result[0].title,
							changelog: result[0].changelog,
							createdAt: result[0].createdAt
						}
					});
				} else {
					res.json({
						same: false,
						release: {
							version: result[0].version,
							title: result[0].title,
							changelog: result[0].changelog,
							createdAt: result[0].createdAt
						}
					});
				}
			} else {
				res.json({
					same: false,
					release: null
				});
			}
		});
		
	});
};
