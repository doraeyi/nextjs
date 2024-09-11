import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mysql';

export async function POST(req) {
  let connection;
  try {
    console.log('Received request to update user picture');
    const { imageUrl } = await req.json();
    console.log('Received imageUrl:', imageUrl);

    if (!imageUrl) {
      console.log('Image URL is missing');
      return NextResponse.json({ message: 'Image URL is required' }, { status: 400 });
    }

    console.log('Attempting to connect to database...');
    connection = await connectToDatabase();
    console.log('Database connection successful');

    console.log('Executing update query...');
    const [result] = await connection.execute(
      'UPDATE user SET pic = ? WHERE id = ?',  // 注意這裡的表名改為 'user'
      [imageUrl, 1]  // 注意：這裡使用了硬編碼的 ID 1
    );
    console.log('Update query executed. Result:', result);

    if (result.affectedRows > 0) {
      console.log('User picture updated successfully');
      return NextResponse.json({ message: 'User picture updated successfully' }, { status: 200 });
    } else {
      console.log('User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  } finally {
    if (connection) {
      console.log('Closing database connection');
      await connection.end();
    }
  }
}