import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postsTable, sourcesTable } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET /api/posts/[id] - Fetch single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const posts = await db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, user.id)))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = posts[0];

    // Fetch sources
    const sources = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.postId, post.id));

    return NextResponse.json({
      ...post,
      sources,
    });
  } catch (error) {
    console.error('Fetch post error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PATCH /api/posts/[id] - Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const postId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingPosts = await db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, user.id)))
      .limit(1);

    if (existingPosts.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Update post
    const updatedPosts = await db
      .update(postsTable)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(postsTable.id, postId))
      .returning();

    return NextResponse.json(updatedPosts[0]);
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingPosts = await db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, user.id)))
      .limit(1);

    if (existingPosts.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete post (sources will be cascade deleted)
    await db.delete(postsTable).where(eq(postsTable.id, postId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
