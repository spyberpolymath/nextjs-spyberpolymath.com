import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import BlogPost from '@/models/BlogPost';
import ContactMessage from '@/models/ContactMessage';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/requireAuth';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();

    // Get all stats in parallel
    const [
      totalUsers,
      activeUsers,
      totalBlogPosts,
      publishedBlogPosts,
      totalContacts,
      newContacts,
      totalProjects,
      publishedProjects,
      totalPayments,
      completedPayments,
      failedPayments,
      loginStats,
      users
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      BlogPost.countDocuments({}),
      BlogPost.countDocuments({ status: 'published' }),
      ContactMessage.countDocuments({}),
      ContactMessage.countDocuments({ status: 'new' }),
      Project.countDocuments({}),
      Project.countDocuments({ published: true }),
      User.aggregate([
        { $unwind: '$paymentHistory' },
        { $count: 'total' }
      ]),
      User.aggregate([
        { $unwind: '$paymentHistory' },
        { $match: { 'paymentHistory.status': 'completed' } },
        { $count: 'total' }
      ]),
      User.aggregate([
        { $unwind: '$paymentHistory' },
        { $match: { 'paymentHistory.status': 'failed' } },
        { $count: 'total' }
      ]),
      User.aggregate([
        { $unwind: '$loginHistory' },
        {
          $group: {
            _id: '$loginHistory.success',
            count: { $sum: 1 }
          }
        }
      ]),
      User.find({}, 'email name role joinedDate uid')
    ]);

    // Calculate total revenue
    const revenueResult = await User.aggregate([
      { $unwind: '$paymentHistory' },
      { $match: { 'paymentHistory.status': 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$paymentHistory.amount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get blog views
    const blogViews = await BlogPost.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$views' }
        }
      }
    ]);

    const totalBlogViews = blogViews.length > 0 ? blogViews[0].total : 0;

    // Process login stats
    const successfulLogins = loginStats.find(stat => stat._id === true)?.count || 0;
    const failedLogins = loginStats.find(stat => stat._id === false)?.count || 0;
    const totalLoginAttempts = successfulLogins + failedLogins;

    // Get recent users
    const recentUsers = users
      .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())
      .slice(0, 5);

    return NextResponse.json(
      {
        summary: {
          totalUsers,
          activeUsers,
          activeUsersPercent: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
          totalBlogPosts,
          publishedBlogPosts,
          totalBlogViews,
          totalContacts,
          newContacts,
          totalProjects,
          publishedProjects,
          totalPayments: totalPayments.length > 0 ? totalPayments[0].total : 0,
          completedPayments: completedPayments.length > 0 ? completedPayments[0].total : 0,
          failedPayments: failedPayments.length > 0 ? failedPayments[0].total : 0,
          totalRevenue: totalRevenue.toFixed(2),
          totalLoginAttempts,
          successfulLogins,
          failedLogins,
          loginSuccessRate: totalLoginAttempts > 0 ? Math.round((successfulLogins / totalLoginAttempts) * 100) : 0
        },
        recentUsers: recentUsers.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          uid: user.uid,
          role: user.role,
          joinedDate: user.joinedDate
        }))
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
