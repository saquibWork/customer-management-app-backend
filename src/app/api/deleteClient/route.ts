import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/authMiddleware';

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adhaar_number = searchParams.get('adhaar_number');

    // Validate adhaar_number is provided
    if (!adhaar_number) {
      return NextResponse.json(
        { error: 'adhaar_number is required as query parameter' },
        { status: 400 }
      );
    }

    // Check if client exists first
    const { data: existingClient, error: checkError } = await supabase
      .from('customers')
      .select('adhaar_number, name')
      .eq('adhaar_number', adhaar_number)
      .single();

    if (checkError || !existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Delete the client
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('adhaar_number', adhaar_number);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Client deleted successfully',
        deleted: existingClient
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = authMiddleware(handler);

