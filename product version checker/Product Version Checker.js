// Config no longer used since v1.9.2 of FaxStore
const products = {
	["product-name"]: { // the product name you'll pass in your query
		version: "1.0.0" // The version that is the most up to date to check against.
	}
}

module.exports = function(app, connection, client, faxstore) {
	// This is the old call, it's been left here for those that haven't fully updated their applications.
	app.get("/productversioncheck/:version/:product", function(req, res) {
		let version = req.params.version;
		let product = req.params.product;
		if (products[product]) {
			if (version == products[product].version.replaceAll(".","")) {
				res.send(true);
			} else {
				res.send(`Product is outdated, newest version is ${products[product].version}`);
			}
		} else {
			res.send(true);
		}
	});

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
