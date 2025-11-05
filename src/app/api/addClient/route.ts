import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/authMiddleware';
import { isValidDateFormat, convertToDBFormat } from '@/lib/dateUtils';

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { adhaar_number, name, date_of_visit, purpose_of_visit, notes } = body;

    // Validate required fields (all except notes)
    if (!adhaar_number || !name || !date_of_visit || !purpose_of_visit) {
      return NextResponse.json(
        { error: 'adhaar_number, name, date_of_visit, and purpose_of_visit are required' },
        { status: 400 }
      );
    }

    // Validate adhaar_number format (12 digits)
    if (!/^\d{12}$/.test(adhaar_number)) {
      return NextResponse.json(
        { error: 'adhaar_number must be exactly 12 digits' },
        { status: 400 }
      );
    }

    // Validate date format (dd-mm-yyyy)
    if (!isValidDateFormat(date_of_visit)) {
      return NextResponse.json(
        { error: 'date_of_visit must be in dd-mm-yyyy format (e.g., 25-12-2023)' },
        { status: 400 }
      );
    }

    // Prepare data to insert
    const clientData: any = {
      adhaar_number,
      name,
      date_of_visit: convertToDBFormat(date_of_visit),
      purpose_of_visit,
      notes: notes || null,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('customers')
      .insert([clientData])
      .select()
      .single();

    if (error) {
      // Handle duplicate adhaar number
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A customer with this Aadhaar number already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Client added successfully',
        data
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(handler);

