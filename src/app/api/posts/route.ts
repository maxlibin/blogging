import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postsTable, sourcesTable } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

// GET /api/posts - Fetch all posts for current user
export async function GET() {
  try {
    const user = await getCurrentUser();

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.userId, user.id))
      .orderBy(desc(postsTable.createdAt));

    // Fetch sources for each post
    const postsWithSources = await Promise.all(
      posts.map(async (post) => {
        const sources = await db
          .select()
          .from(sourcesTable)
          .where(eq(sourcesTable.postId, post.id));

        return {
          ...post,
          sources,
        };
      })
    );

    return NextResponse.json(postsWithSources);
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      title,
      content = '',
      status = 'draft',
      researchSummary,
      trendAnalysis,
      featuredImageUrl,
      sources = [],
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create post
    const newPosts = await db
      .insert(postsTable)
      .values({
        userId: user.id,
        title,
        content,
        status,
        researchSummary: researchSummary || null,
        trendAnalysis: trendAnalysis || null,
        featuredImageUrl: featuredImageUrl || null,
      })
      .returning();

    const post = newPosts[0];

    // Insert sources if provided
    if (sources.length > 0) {
      await db.insert(sourcesTable).values(
        sources.map((source: { title: string; uri: string }) => ({
          postId: post.id,
          title: source.title,
          uri: source.uri,
        }))
      );
    }

    // Fetch the created post with sources
    const createdSources = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.postId, post.id));

    return NextResponse.json({
      ...post,
      sources: createdSources,
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
