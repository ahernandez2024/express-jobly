const { sqlForPartialUpdate } = require('/sqlForPartialUpdate');
const { BadRequestError } = require("../expressError");

describe('sqlForPartialUpdate', () => {
  it('should generate SQL syntax for a partial update operation', () => {
    const dataToUpdate = { firstName: 'John', lastName: 'Doe' };
    const expectedSql = {
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ['John', 'Doe']
    };
    expect(sqlForPartialUpdate(dataToUpdate)).toEqual(expectedSql);
  });

  it('should handle JavaScript to SQL column name mapping', () => {
    const dataToUpdate = { firstName: 'John', lastName: 'Doe' };
    const jsToSql = { firstName: 'first_name', lastName: 'last_name' };
    const expectedSql = {
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ['John', 'Doe']
    };
    expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual(expectedSql);
  });

  it('should throw BadRequestError if no data is provided for update', () => {
    const dataToUpdate = {};
    expect(() => {
      sqlForPartialUpdate(dataToUpdate);
    }).toThrow(BadRequestError);
  });

  it('should handle empty jsToSql mapping', () => {
    const dataToUpdate = { firstName: 'John', lastName: 'Doe' };
    const jsToSql = {};
    const expectedSql = {
      setCols: '"firstName"=$1, "lastName"=$2',
      values: ['John', 'Doe']
    };
    expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual(expectedSql);
  });

  it('should handle missing jsToSql mapping', () => {
    const dataToUpdate = { firstName: 'John', lastName: 'Doe' };
    const expectedSql = {
      setCols: '"firstName"=$1, "lastName"=$2',
      values: ['John', 'Doe']
    };
    expect(sqlForPartialUpdate(dataToUpdate)).toEqual(expectedSql);
  });
});