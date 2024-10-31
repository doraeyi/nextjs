// app/api/semesters/route.js
import { connectToDatabase } from '@/lib/mysql';

export async function GET() {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.query(
      'SELECT id, name, created_at FROM semesters ORDER BY created_at DESC'
    );
    await connection.end();
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch semesters' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    
    if (!name) {
      return new Response(JSON.stringify({ error: 'Semester name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connection = await connectToDatabase();
    const [result] = await connection.query(
      'INSERT INTO semesters (name) VALUES (?)',
      [name]
    );
    
    const [newSemester] = await connection.query(
      'SELECT id, name, created_at FROM semesters WHERE id = ?',
      [result.insertId]
    );

    await connection.end();
    return new Response(JSON.stringify(newSemester[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating semester:', error);
    return new Response(JSON.stringify({ error: 'Failed to create semester' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}