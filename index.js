const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Import CORS
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors()); // Use CORS
app.use(express.json());

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET;

app.get('/', (req, res) => {
  res.send('Database up');
});



app.post('/api/check-email-exists', async (req, res) => {
  const { email } = req.body;
  const query = 'SELECT 1 FROM users WHERE email = $1';
  const values = [email];

  try {
    const result = await client.query(query, values);
    if (result.rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking email existence:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-user', async (req, res) => {
  const { email, password, fname, lname, role, start_date } = req.body;
  console.log('Received new user data:', { email, password, fname, lname, role, start_date });

//   const hashedPassword = await bcrypt.hash(password, 10);
//   console.log('Hashed password:', hashedPassword);

  const query = `
    INSERT INTO users (email, password, fname, lname, role, start_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  const values = [email, password, fname, lname, role, start_date];

  try {
    const result = await client.query(query, values);
    res.status(200).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fetch a user by email
app.get('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  const query = 'SELECT id, email, password, role FROM users WHERE email = $1';
  const values = [email];

  try {
    const result = await client.query(query, values);
    if (result.rows.length > 0) {
      console.log('User found:', result.rows[0]);
      res.status(200).json(result.rows[0]);
    } else {
      console.log('User not found with email:', email);
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user by email:', error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/user-details/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT fname, lname, role FROM users WHERE id = $1';
    const values = [userId];
  
    try {
      const result = await client.query(query, values);
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/bin-devices', async (req, res) => {
    const query = 'SELECT * FROM devices WHERE is_registered = true';
  
    try {
      const result = await client.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching devices:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/weather-devices', async (req, res) => {
    const query = 'SELECT * FROM weather_sensors WHERE is_registered = true';
  
    try {
      const result = await client.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching weather devices:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/new-bin-devices', async (req, res) => {
    const query = 'SELECT * FROM devices WHERE is_registered = false';
  
    try {
      const result = await client.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching new devices:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/new-weather-devices', async (req, res) => {
    const query = 'SELECT * FROM weather_sensors WHERE is_registered = false';
  
    try {
      const result = await client.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching new weather devices:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/feedbacks', async (req, res) => {
    const query = 'SELECT * FROM feedbacks';
  
    try {
      const result = await client.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching feedbacks:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/feedbacks', async (req, res) => {
    const { device_id, reported_by_id, reported_by_name, title, description, devicetype } = req.body;
    const query = `
      INSERT INTO feedbacks (device_id, reported_by_id, reported_by_name, title, description, devicetype) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;
    const values = [device_id, reported_by_id, reported_by_name, title, description, devicetype];
  
    try {
      const result = await client.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding feedback:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Update feedback by ID
  app.put('/api/feedbacks/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const query = {
      text: `UPDATE feedbacks SET ${Object.keys(updateData).map((key, idx) => `${key} = $${idx + 1}`).join(', ')} WHERE id = $${Object.keys(updateData).length + 1} RETURNING *`,
      values: [...Object.values(updateData), id]
    };

    try {
      const result = await client.query(query);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating feedback:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  
  app.get('/api/historical-data', async (req, res) => {
    const query = 'SELECT * FROM historical';
  
    try {
      const result = await client.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete('/api/historical-data', async (req, res) => {
    const query = 'DELETE FROM historical WHERE id != 0';
  
    try {
      await client.query(query);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error clearing historical data:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.put('/api/update-device-registration', async (req, res) => {
    const { updatedDevice, deviceType } = req.body;
    let updateData = {
      lat: updatedDevice.latitude,
      lng: updatedDevice.longitude,
      is_registered: updatedDevice.is_registered
    };
  
    if (deviceType === 'bin') {
      updateData.bin_height = updatedDevice.bin_height;
    }
  
    const tableName = deviceType === 'bin' ? 'devices' : 'weather_sensors';
    let query;
    let values;
  
    if (deviceType === 'bin') {
      query = `UPDATE ${tableName} SET lat = $1, lng = $2, is_registered = $3, bin_height = $4 WHERE unique_id = $5 RETURNING *`;
      values = [updatedDevice.latitude, updatedDevice.longitude, updatedDevice.is_registered, updatedDevice.bin_height, updatedDevice.id];
    } else {
      query = `UPDATE ${tableName} SET lat = $1, lng = $2, is_registered = $3 WHERE unique_id = $4 RETURNING *`;
      values = [updatedDevice.latitude, updatedDevice.longitude, updatedDevice.is_registered, updatedDevice.id];
    }
  
    try {
      const result = await client.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating device registration:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  
  app.get('/api/recent-routes', async (req, res) => {
    const query = 'SELECT * FROM routes ORDER BY timestamp DESC LIMIT 5';
  
    try {
      const result = await client.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching recent routes:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/routes', async (req, res) => {
    const routeData = req.body;
    let fields = [];
    let values = [];
    let i = 1;
  
    for (let field in routeData) {
      fields.push(field);
      values.push(`$${i}`);
      i++;
    }
  
    const query = `INSERT INTO routes (${fields.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;
    const valueParams = Object.values(routeData);
  
    try {
      const result = await client.query(query, valueParams);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating route:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.put('/api/update-route-status', async (req, res) => {
    const { id, status, timestampField } = req.body;
    const updateData = { status };
    updateData[timestampField] = new Date();
  
    const query = `UPDATE routes SET status = $1, ${timestampField} = $2 WHERE id = $3 RETURNING *`;
    const values = [status, new Date(), id];
  
    try {
      const result = await client.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(`Error updating route status to ${status}:`, error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete('/api/routes/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM routes WHERE id = $1 RETURNING *';
    const values = [id];
  
    try {
      const result = await client.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error deleting route:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.put('/api/update-device', async (req, res) => {
    const { unique_id, updateFields } = req.body;
    let setClause = [];
    let values = [];
    let i = 1;
  
    for (let field in updateFields) {
      setClause.push(`${field} = $${i}`);
      values.push(updateFields[field]);
      i++;
    }
    values.push(unique_id);
  
    const query = `UPDATE devices SET ${setClause.join(', ')} WHERE unique_id = $${i} RETURNING *`;
  
    try {
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating device:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

  app.post('/api/insert-device', async (req, res) => {
    const deviceData = req.body;
    let fields = [];
    let values = [];
    let i = 1;
  
    for (let field in deviceData) {
      fields.push(field);
      values.push(`$${i}`);
      i++;
    }
  
    const query = `INSERT INTO devices (${fields.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;
    const valueParams = Object.values(deviceData);
  
    try {
      const result = await client.query(query, valueParams);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error inserting new device:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/save-historical', async (req, res) => {
    const historicalData = req.body;
    const query = `INSERT INTO historical (unique_id, level_in_percents, saved_time) VALUES ($1, $2, $3) RETURNING *`;
    const values = [historicalData.unique_id, historicalData.level_in_percents, historicalData.saved_time];
  
    try {
      const result = await client.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error saving to historical:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/device/:unique_id', async (req, res) => {
    const { unique_id } = req.params;
    const query = 'SELECT bin_height, is_registered FROM devices WHERE unique_id = $1';
    const values = [unique_id];
  
    try {
      const result = await client.query(query, values);
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Device not found' });
      }
    } catch (error) {
      console.error('Error fetching device:', error.message);
      res.status(500).json({ error: error.message });
    }
  });


  app.put('/api/update-weather-device', async (req, res) => {
    const { unique_id, updateFields } = req.body;
    let setClause = [];
    let values = [];
    let i = 1;
  
    for (let field in updateFields) {
      setClause.push(`${field} = $${i}`);
      values.push(updateFields[field]);
      i++;
    }
    values.push(unique_id);
  
    const query = `UPDATE weather_sensors SET ${setClause.join(', ')} WHERE unique_id = $${i} RETURNING *`;
  
    try {
      const result = await client.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating weather device:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/insert-weather-device', async (req, res) => {
    const deviceData = req.body;
    let fields = [];
    let values = [];
    let i = 1;
  
    for (let field in deviceData) {
      fields.push(field);
      values.push(`$${i}`);
      i++;
    }
  
    const query = `INSERT INTO weather_sensors (${fields.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;
    const valueParams = Object.values(deviceData);
  
    try {
      const result = await client.query(query, valueParams);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error inserting new weather device:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/weather-device/:unique_id', async (req, res) => {
    const { unique_id } = req.params;
    const query = 'SELECT is_registered FROM weather_sensors WHERE unique_id = $1';
    const values = [unique_id];
  
    try {
      const result = await client.query(query, values);
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Weather device not found' });
      }
    } catch (error) {
      console.error('Error fetching weather device:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



