import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const interest = searchParams.get('interest') || '';
        const source = searchParams.get('source') || '';

        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (interest && interest !== 'all') {
            query.interest = interest;
        }

        if (source && source !== 'all') {
            query.source = source;
        }

        console.log('Query:', query);
        console.log('Source parameter:', source);

        const skip = (page - 1) * limit;

        const subscribers = await Subscriber.find(query)
            .sort({ subscribedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Subscriber.countDocuments(query);

        const interestOptions = [
            { value: 'ai-security', label: 'AI & Security' },
            { value: 'threats', label: 'Threats' },
            { value: 'architecture', label: 'Architecture' },
            { value: 'cloud-security', label: 'Cloud Security' },
            { value: 'remote-work', label: 'Remote Work' },
            { value: 'general', label: 'General Cybersecurity' }
        ];

        const formattedSubscribers = subscribers.map(sub => {
            const s = sub as any;
            return {
                id: s._id?.toString?.() ?? String(s._id),
                name: s.name,
                email: s.email,
                phone: s.phone,
                interest: s.interest,
                interestLabel: interestOptions.find(opt => opt.value === s.interest)?.label || s.interest,
                whatsapp: s.whatsappEnabled,
                source: s.source || 'newsletter',
                frequency: s.frequency || 'weekly',
                subscriptionDate: s.subscribedAt ? new Date(s.subscribedAt).toISOString().split('T')[0] : undefined,
                status: s.status,
                lastEmailSent: s.lastEmailSent ? new Date(s.lastEmailSent).toISOString().split('T')[0] : undefined,
            };
        });

        return NextResponse.json({
            subscribers: formattedSubscribers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { name, email, phone, interest, whatsapp, status, subscriptionDate, source, frequency } = await request.json();

        // Validate required fields
        if (!name || !email || !interest) {
            return NextResponse.json(
                { error: 'Name, email, and interest are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check if subscriber already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Create new subscriber
        const subscriber = new Subscriber({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : undefined,
            interest,
            whatsappEnabled: whatsapp || false,
            source: source || 'newsletter',
            frequency: frequency || 'weekly',
            status: status || 'active',
            subscribedAt: subscriptionDate ? new Date(subscriptionDate) : new Date(),
        });

        await subscriber.save();

        return NextResponse.json(
            { message: 'Subscriber created successfully', id: subscriber._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create subscriber error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}