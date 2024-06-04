const { BadRequestError } = require("../expressError");

///Generates SQL syntax for a partial update operation.
// dataToUpdate - An object containing the data to be updated.
// jsToSql - An optional mapping of JavaScript object keys to SQL column names.
// returns An object with SQL syntax for partial update.
// throws an error if no data is provided for update.




function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
