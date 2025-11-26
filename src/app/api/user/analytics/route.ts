import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Post from '@/models/Post';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch all user posts - type assertion needed for Mongoose lean() queries
        const posts = await Post.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .lean()
            .exec() as any[];

        // Calculate analytics
        const analytics = {
            totalCaptions: posts.length,
            totalImages: posts.filter((p: any) => p.image).length,

            // Mood distribution
            moodDistribution: posts.reduce((acc: any, post: any) => {
                const mood = post.mood || 'Unknown';
                acc[mood] = (acc[mood] || 0) + 1;
                return acc;
            }, {}),

            // Average caption length
            averageCaptionLength: posts.length > 0
                ? Math.round(
                    posts.reduce((sum: number, post: any) => {
                        const firstCaption = post.captions?.[0] || '';
                        return sum + firstCaption.length;
                    }, 0) / posts.length
                )
                : 0,

            // Most used mood
            mostUsedMood: (() => {
                const moodCounts: { [key: string]: number } = {};
                posts.forEach((post: any) => {
                    const mood = post.mood || 'Unknown';
                    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                });

                if (Object.keys(moodCounts).length === 0) return 'None';

                return Object.keys(moodCounts).reduce((a, b) =>
                    moodCounts[a] > moodCounts[b] ? a : b
                );
            })(),

            // Activity by day (last 7 days)
            activityByDay: (() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return date.toISOString().split('T')[0];
                }).reverse();

                return last7Days.map(day => ({
                    date: day,
                    count: posts.filter((post: any) => {
                        const postDate = new Date(post.createdAt).toISOString().split('T')[0];
                        return postDate === day;
                    }).length
                }));
            })(),

            // Recent activity (last 6 posts)
            recentActivity: posts.slice(0, 6).map((post: any) => ({
                _id: post._id.toString(),
                image: post.image,
                captions: post.captions || [],
                mood: post.mood,
                createdAt: post.createdAt,
            })),
        };

        return NextResponse.json({
            success: true,
            data: analytics,
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
