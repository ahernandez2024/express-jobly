const express = require("express");
const router = express.Router();
const Job = require("../models/jobs"); 
const { ensureLoggedIn } = require("../middleware/auth");
const { ensureAdmin } = require("../middleware/auth");

/** POST /jobs - Create a new job */
router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const { title, salary, equity, companyHandle } = req.body;

    // Create the job
    const job = await Job.create({ title, salary, equity, companyHandle });

    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /jobs - Get all jobs */
router.get("/", async function (req, res, next) {
    try {
      let { title, minSalary, hasEquity } = req.query;
  
      // Convert minSalary to a number
      minSalary = parseFloat(minSalary);
  
      // Construct filter criteria object
      const filterCriteria = {};
      if (title) {
          filterCriteria.title = title;
      }
      if (minSalary) {
          filterCriteria.minSalary = minSalary;
      }
      if (hasEquity === 'true') {
          filterCriteria.hasEquity = true;
      } else if (hasEquity === 'false') {
          filterCriteria.hasEquity = false;
      }
  
      // Call the getFilteredJobs function from the Job class
      const jobs = await Job.getFilteredJobs(filterCriteria);
  
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });


/** GET /jobs/:idOrHandle - Get a job by ID or handle */
router.get("/:idOrHandle", async function (req, res, next) {
  try {
    const { idOrHandle } = req.params;

    // Check if idOrHandle is a number (ID) or a string (handle)

    const isId = /^\d+$/.test(idOrHandle);     //returns True if it is digits(numbers) and false if it is a string
    
    let job;

    if (isId) {
      // Fetch the job by ID
      job = await Job.getJobById(parseInt(idOrHandle));
    } else {
      // Fetch the job by handle
      job = await Job.getJobsByCompanyHandle(idOrHandle);
    }

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;


/** DELETE /jobs/:id - Delete a job */
router.delete("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const { id } = req.params;

    // Delete the job
    await Job.delete(id);

    return res.json({ message: "Job deleted successfully" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
