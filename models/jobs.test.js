const request = require('supertest');
const app = require('../app');

describe('GET /jobs', () => {
  test('should return jobs with equity when equity=true is provided', async () => {
    const response = await request(app).get('/jobs?equity=true');
    expect(response.status).toBe(200);
   
  });

  test('should return jobs without equity when equity=false is provided', async () => {
    const response = await request(app).get('/jobs?equity=false');
    expect(response.status).toBe(200);
    
  });

  test('should return jobs with minimum salary when minSalary is provided', async () => {
    const response = await request(app).get('/jobs?minSalary=50000');
    expect(response.status).toBe(200);
    
  });

  test('should return jobs with matching title when title is provided', async () => {
    const response = await request(app).get('/jobs?title=developer');
    expect(response.status).toBe(200);
  });

  test('should return all jobs when no filters are provided', async () => {
    const response = await request(app).get('/jobs');
    expect(response.status).toBe(200);
   
  });
});
