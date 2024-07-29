import mysql from 'mysql2/promise';


export const connectToDatabase = async()=> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      database: process.env.DATABASE_DATABASE,
      password: process.env.DATABASE_PASSWORD
    });
    return connection;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error; // Ensure the error is propagated
  }
}

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

// });

