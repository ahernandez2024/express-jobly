const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class Job {
  /** Create a job (from data), update db, return new job data.
   * data should be { title, salary, equity, companyHandle }
   * Returns { id, title, salary, equity, companyHandle }
   * Throws BadRequestError if job already exists in the database.*/
  
  static async create({ title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(
      `SELECT id
       FROM jobs
       WHERE title = $1 AND company_handle = $2`,
      [title, companyHandle]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate job: ${title}`);
    }

    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );

    const job = result.rows[0];
    return job;
  }

  /** Get all jobs. */
  static async getAllJobs() {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs`
    );
    return result.rows;
  }

  /** Get a job by ID. */
  static async getJobById(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = $1`,
      [id]
    );

    const job = result.rows[0];

    if (!job) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }

    return job;
  }

  /** Update job data with `data`.
   *
   * This only allows updating the title, salary, and equity.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { title, salary, equity } = data;
    const { query, values } = sqlForPartialUpdate(
      "jobs",
      { title, salary, equity },
      "id",
      id
    );
    const result = await db.query(query, values);
    const job = result.rows[0];

    if (!job) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }

    return job;
  }

  /** Delete job with matching id. */
  static async delete(id) {
    const result = await db.query(
      `DELETE
       FROM jobs
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    const job = result.rows[0];

    if (!job) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }
  }

  static async getFilteredJobs(filterCriteria = {}) {
    // Initialize variables for constructing the SQL query
    let selectClause = "SELECT id, title, salary, equity, company_handle AS \"companyHandle\"";
    let fromClause = "FROM jobs";
    let whereClause = "";
    let orderByClause = "ORDER BY title";
    let queryValues = [];

    // Extract filter criteria from the input object
    const { title, minSalary, hasEquity } = filterCriteria;

    // Check if title filter is provided
    if (title !== undefined) {
        // Add the title filter value to the query values
        queryValues.push(`%${title}%`);
        // Construct the WHERE clause for title filter
        whereClause += (whereClause === "" ? " WHERE" : " AND") + " title ILIKE $1";
    }

    // Check if minSalary filter is provided
    if (minSalary !== undefined) {
        // Add the minSalary filter value to the query values
        queryValues.push(minSalary);
        // Construct the WHERE clause for minSalary filter
        whereClause += (whereClause === "" ? " WHERE" : " AND") + " salary >= $" + queryValues.length;
    }

    // Check if hasEquity filter is provided
    if (hasEquity !== undefined) {
    // Construct the WHERE clause for hasEquity filter based on its value
      if (hasEquity === 'true' || hasEquity === true) {
      whereClause += (whereClause === "" ? " WHERE" : " AND") + " equity > 0";
  } else if (hasEquity === 'false' || hasEquity === false) {
      whereClause += (whereClause === "" ? " WHERE" : " AND") + " equity = 0";
  }
}


    // Concatenate all parts of the SQL query
    const query = `${selectClause} ${fromClause} ${whereClause} ${orderByClause}`;

    // Execute the SQL query with the constructed query string and values
    const jobsRes = await db.query(query, queryValues);

    // Return the resulting rows from the query
    return jobsRes.rows;
}

static async getJobsByCompanyHandle(companyHandle) {
  const result = await db.query(
    `SELECT id, title, salary, equity
     FROM jobs
     WHERE company_handle = $1`,
    [companyHandle]
  );

  return result.rows;
}

  
}

module.exports = Job;
