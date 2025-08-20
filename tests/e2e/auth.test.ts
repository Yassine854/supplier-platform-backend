import request from 'supertest';
import { app } from '../../src/app';
import jwt from 'jsonwebtoken';
import Manufacturer from '../../src/model/supplier.model';

jest.mock('../../src/model/supplier.model');
jest.mock('jsonwebtoken');

describe('Auth Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  // Test valid superadmin login
//   it('should login superadmin successfully', async () => {
//     const response = await request(app)
//       .post('/api/auth/login')
//       .send({ username: 'admin', password: 'admin' });

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({
//       success: true,
//       token: expect.any(String),
//       user: {
//         role: 'superadmin',
//         username: 'admin'
//       }
//     });
//   });

  
  // Test invalid credentials
  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'abcdefg' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Invalid credentials'
    });
  });

  // Test missing fields
  it('should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Username and password are required'
    });
  });



// Test valid supplier login
it('should login supplier successfully', async () => {
    // Mock database response
    (Manufacturer.findOne as jest.Mock).mockResolvedValue({
      manufacturerId: 9,
      company_name: 'Technofood',
      phone_number: '22218000',
      email: 'test@supplier.com'
    });

    // Mock JWT
    (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Technofood', password: '22218000' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      token: 'fake-jwt-token',
      user: expect.objectContaining({
        role: 'supplier',
        company_name: 'Technofood'
      })
    });
  });



// Test valid admin login
it('should login admin successfully', async () => {
    
    // Mock JWT
    (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      token: 'fake-jwt-token',
      user: expect.objectContaining({
        role: 'superadmin',
        username: 'admin'
      })
    });
  });
  

});