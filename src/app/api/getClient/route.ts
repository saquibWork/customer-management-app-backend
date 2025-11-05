import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/authMiddleware';
import { convertFromDBFormat } from '@/lib/dateUtils';

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adhaar_number = searchParams.get('adhaar_number');

    // If adhaar_number is provided, get specific client
    if (adhaar_number) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('adhaar_number', adhaar_number)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
          );
        }
        throw error;
      }

      // Convert date format for response
      const responseData = {
        ...data,
        date_of_visit: convertFromDBFormat(data.date_of_visit)
      };

      return NextResponse.json(
        {
          success: true,
          data: responseData
        },
        { status: 200 }
      );
    }

    // Otherwise, get all clients (sorted by most recent visit)
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('date_of_visit', { ascending: false });

    if (error) {
      throw error;
    }

    // Convert date format for all clients
    const responseData = data.map(client => ({
      ...client,
      date_of_visit: convertFromDBFormat(client.date_of_visit)
    }));

    return NextResponse.json(
      {
        success: true,
        count: responseData.length,
        data: responseData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(handler);

