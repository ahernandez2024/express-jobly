"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies or filter by provided criteria.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async getFilteredCompanies(filterCriteria = {}) {
    let selectClause = "SELECT handle, name, description, num_employees AS \"numEmployees\", logo_url AS \"logoUrl\"";
    let fromClause = "FROM companies";
    let whereClause = "";
    let orderByClause = "ORDER BY name";

    let queryValues = [];

    const { name, minEmployees, maxEmployees } = filterCriteria;

    if (name !== undefined) {
        queryValues.push(`%${name}%`);
        whereClause += (whereClause === "" ? " WHERE" : " AND") + " name ILIKE $1";
    }

    if (minEmployees !== undefined) {
        queryValues.push(minEmployees);
        whereClause += (whereClause === "" ? " WHERE" : " AND") + " num_employees >= $" + queryValues.length;
    }

    if (maxEmployees !== undefined) {
        queryValues.push(maxEmployees);
        whereClause += (whereClause === "" ? " WHERE" : " AND") + " num_employees <= $" + queryValues.length;
    }

    const query = `${selectClause} ${fromClause} ${whereClause} ${orderByClause}`;

    const companiesRes = await db.query(query, queryValues);
    return companiesRes.rows;
}


  // Other methods...

}

module.exports = Company;
