const products = {
   ["product-name"]: { // the product name you'll pass in your query
      version: "1.0.0" // The version that is the most up to date to check against.
   }
}
module.exports = function(app) {
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
};
