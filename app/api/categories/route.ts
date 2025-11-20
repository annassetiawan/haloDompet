import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCategories, createCategory, deleteCategory } from '@/lib/db';

/**
 * GET /api/categories
 * Fetch all categories (default + user's custom categories)
 * Query params: ?type=income|expense (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // Get type filter from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'income' | 'expense' | null;

    const categories = await getCategories(authUser.id, type || undefined);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new custom category
 * Body: { name: string, type: 'income' | 'expense' }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { name, type } = await request.json();

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama kategori harus diisi' },
        { status: 400 }
      );
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe kategori harus "income" atau "expense"' },
        { status: 400 }
      );
    }

    const category = await createCategory(authUser.id, name, type);

    if (!category) {
      return NextResponse.json(
        { error: 'Gagal membuat kategori. Mungkin kategori sudah ada.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Kategori berhasil dibuat!',
    });
  } catch (error: any) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create category',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories
 * Delete a custom category
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'ID kategori harus diisi' },
        { status: 400 }
      );
    }

    const success = await deleteCategory(authUser.id, id);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal menghapus kategori. Mungkin kategori tidak ditemukan atau bukan milik Anda.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus!',
    });
  } catch (error: any) {
    console.error('DELETE /api/categories error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete category',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
