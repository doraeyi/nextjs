// src/app/api/subjects/route.js
import { connectToDatabase } from '@/lib/mysql';

export async function GET(req) {
  try {
    const connection = await connectToDatabase();
    const [subjects] = await connection.query('SELECT * FROM subjects');
    return new Response(JSON.stringify(subjects), { status: 200 });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return new Response(JSON.stringify({ error: 'Error fetching subjects' }), { status: 500 });
  }
}
