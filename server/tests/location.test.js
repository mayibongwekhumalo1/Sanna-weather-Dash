import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import Location from '../src/models/Location.js';

describe('Location API Endpoints', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-platform-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await Location.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Location.deleteMany({});
  });

  describe('GET /api/locations', () => {
    it('should return empty array when no locations exist', async () => {
      const response = await request(app)
        .get('/api/locations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return all locations', async () => {
      await Location.create([
        { name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.0060 },
        { name: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278 },
      ]);

      const response = await request(app)
        .get('/api/locations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should filter by isActive query', async () => {
      await Location.create([
        { name: 'Active', country: 'Test', latitude: 40.0, longitude: -74.0, isActive: true },
        { name: 'Inactive', country: 'Test', latitude: 41.0, longitude: -74.0, isActive: false },
      ]);

      const response = await request(app)
        .get('/api/locations?isActive=true')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Active');
    });
  });

  describe('GET /api/locations/:id', () => {
    it('should return 404 for non-existent location', async () => {
      const fakeId = '000000000000000000000000';
      const response = await request(app)
        .get(`/api/locations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return location by ID', async () => {
      const location = await Location.create({
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      });

      const response = await request(app)
        .get(`/api/locations/${location._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Paris');
    });
  });

  describe('POST /api/locations', () => {
    it('should create a new location', async () => {
      const locationData = {
        name: 'Tokyo',
        country: 'Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo',
      };

      const response = await request(app)
        .post('/api/locations')
        .send(locationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Tokyo');
      expect(response.body.data.country).toBe('Japan');
    });

    it('should reject duplicate coordinates', async () => {
      await Location.create({
        name: 'First',
        country: 'Test',
        latitude: 40.0,
        longitude: -74.0,
      });

      const response = await request(app)
        .post('/api/locations')
        .send({
          name: 'Second',
          country: 'Test',
          latitude: 40.0,
          longitude: -74.0,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('coordinates');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ name: 'Incomplete' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/locations/:id', () => {
    it('should update location', async () => {
      const location = await Location.create({
        name: 'Old Name',
        country: 'Test',
        latitude: 40.0,
        longitude: -74.0,
      });

      const response = await request(app)
        .put(`/api/locations/${location._id}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(response.body.data.name).toBe('New Name');
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = '000000000000000000000000';
      const response = await request(app)
        .put(`/api/locations/${fakeId}`)
        .send({ name: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/locations/:id', () => {
    it('should delete location', async () => {
      const location = await Location.create({
        name: 'To Delete',
        country: 'Test',
        latitude: 40.0,
        longitude: -74.0,
      });

      await request(app)
        .delete(`/api/locations/${location._id}`)
        .expect(200);

      const found = await Location.findById(location._id);
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = '000000000000000000000000';
      const response = await request(app)
        .delete(`/api/locations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/locations/search', () => {
    it('should search locations by name', async () => {
      await Location.create([
        { name: 'New York', country: 'USA', latitude: 40.7, longitude: -74.0 },
        { name: 'New Delhi', country: 'India', latitude: 28.6, longitude: 77.2 },
        { name: 'London', country: 'UK', latitude: 51.5, longitude: -0.1 },
      ]);

      const response = await request(app)
        .get('/api/locations/search?q=New')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should return 400 without query', async () => {
      const response = await request(app)
        .get('/api/locations/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
