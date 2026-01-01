import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/requireAuth';
import { validateBody, userUpdateSchema } from '@/lib/validation';
import { safeObjectIdToString, isValidObjectId } from '@/lib/objectIdUtils';
import { sendEmailWithPreferences } from '@/lib/resend';

function sanitizeUser(user: any) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.emailOtpCode;
    delete obj.emailOtpExpires;
    delete obj.twoFactorSecret;
    delete obj.paymentHistory; // Payment history fetched separately
    obj.id = obj._id?.toString() || obj.id;
    return obj;
}

// GET /api/user - Get current user profile
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const payload = await requireAuth(req);

        if (payload instanceof NextResponse) {
            return payload;
        }

        const userId = safeObjectIdToString(payload.id);
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: sanitizeUser(user) });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
}

// PUT /api/user - Update current user profile
export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const payload = await requireAuth(req);

        if (payload instanceof NextResponse) {
            return payload;
        }

        const body = await req.json();

        // Clean up empty strings before validation
        const cleanBody: any = {};
        for (const [key, value] of Object.entries(body)) {
            cleanBody[key] = value;
        }

        // Validate using schema
        try {
            const validated = userUpdateSchema.parse(cleanBody);
            
            // Now convert dateOfBirth if it exists
            if (validated.dateOfBirth) {
                validated.dateOfBirth = new Date(validated.dateOfBirth) as any;
            }

            const userId = safeObjectIdToString(payload.id);
            if (!isValidObjectId(userId)) {
                return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
            }

            // Update user
            const user = await User.findByIdAndUpdate(
                userId,
                validated,
                { new: true, runValidators: true }
            );

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Send account change notification email if enabled (asynchronously)
            sendEmailWithPreferences(
                userId,
                'account-changes',
                user.email,
                'Account Profile Updated - SpyberPolymath',
                `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <title>Account Profile Updated</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                      <h1>Account Profile Updated</h1>
                      <p>Your account profile has been successfully updated.</p>
                      <p>If you did not make this change, please contact support immediately.</p>
                      <p>Updated at: ${new Date().toLocaleString()}</p>
                    </body>
                    </html>
                `
            ).catch(emailError => console.error('Account change notification email failed:', emailError));

            return NextResponse.json({ 
                message: 'Profile updated successfully',
                user: sanitizeUser(user) 
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const errorDetails = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
                console.error('Profile update validation error:', errorDetails);
                return NextResponse.json({ error: 'Validation failed', details: errorDetails }, { status: 400 });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }
}