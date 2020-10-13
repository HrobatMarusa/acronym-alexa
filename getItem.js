var AWS = require("aws-sdk");

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({ region: "eu-west-1" });
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var params = {
  TableName: 'testtablename',
  Key: {
    'acroP': {S: "s. i."}
  },
};

// Call DynamoDB to read the item from the table
ddb.getItem(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.Item);
    data = data.Item;
    acroP = data.acroP['S'];
    console.log(acroP)
    definition = data.definition['S'];
    console.log(definition)
    description = data.description['S'];
    console.log(description)
  }
});
//console.log('finished')