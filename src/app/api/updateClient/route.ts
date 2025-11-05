import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/authMiddleware';
import { isValidDateFormat, convertToDBFormat } from '@/lib/dateUtils';

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { adhaar_number, ...updateFields } = body;

    // Validate adhaar_number is provided
    if (!adhaar_number) {
      return NextResponse.json(
        { error: 'adhaar_number is required' },
        { status: 400 }
      );
    }

    // Check if there are fields to update
    const allowedFields = ['name', 'date_of_visit', 'purpose_of_visit', 'notes'];
    const fieldsToUpdate: any = {};

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        // Validate and convert date format if date_of_visit is being updated
        if (field === 'date_of_visit' && updateFields[field]) {
          if (!isValidDateFormat(updateFields[field])) {
            return NextResponse.json(
              { error: 'date_of_visit must be in dd-mm-yyyy format (e.g., 25-12-2023)' },
              { status: 400 }
            );
          }
          fieldsToUpdate[field] = convertToDBFormat(updateFields[field]);
        } else {
          fieldsToUpdate[field] = updateFields[field];
        }
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Check if client exists first
    const { data: existingClient, error: checkError } = await supabase
      .from('customers')
      .select('adhaar_number')
      .eq('adhaar_number', adhaar_number)
      .single();

    if (checkError || !existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Update the client
    const { data, error } = await supabase
      .from('customers')
      .update(fieldsToUpdate)
      .eq('adhaar_number', adhaar_number)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Client updated successfully',
        data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = authMiddleware(handler);
export const PATCH = authMiddleware(handler);

