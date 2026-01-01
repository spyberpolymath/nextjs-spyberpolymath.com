import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { params } = context;
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid subscriber ID' },
                { status: 400 }
            );
        }

        const subscriber: any = await Subscriber.findById(id).lean();

        if (!subscriber) {
            return NextResponse.json(
                { error: 'Subscriber not found' },
                { status: 404 }
            );
        }

        const interestOptions = [
            { value: 'ai-security', label: 'AI & Security' },
            { value: 'threats', label: 'Threats' },
            { value: 'architecture', label: 'Architecture' },
            { value: 'cloud-security', label: 'Cloud Security' },
            { value: 'remote-work', label: 'Remote Work' },
            { value: 'general', label: 'General Cybersecurity' }
        ];

        const formattedSubscriber = {
            id: subscriber._id.toString(),
            name: subscriber.name,
            email: subscriber.email,
            phone: subscriber.phone,
            interest: subscriber.interest,
            interestLabel: interestOptions.find(opt => opt.value === subscriber.interest)?.label || subscriber.interest,
            whatsapp: subscriber.whatsappEnabled,
            source: subscriber.source || 'newsletter',
            frequency: subscriber.frequency || 'weekly',
            subscriptionDate: subscriber.subscribedAt.toISOString().split('T')[0],
            status: subscriber.status,
            lastEmailSent: subscriber.lastEmailSent ? subscriber.lastEmailSent.toISOString().split('T')[0] : undefined,
        };

        return NextResponse.json(formattedSubscriber);
    } catch (error) {
        console.error('Get subscriber error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { params } = context;
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid subscriber ID' },
                { status: 400 }
            );
        }

        const { name, email, phone, interest, whatsapp, status, subscriptionDate, frequency, source } = await request.json();

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

        // Check if email is already taken by another subscriber
        const existingSubscriber = await Subscriber.findOne({
            email: email.toLowerCase().trim(),
            _id: { $ne: id }
        });
        if (existingSubscriber) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        const updateData: any = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : undefined,
            interest,
            whatsappEnabled: whatsapp || false,
            status: status || 'active',
            frequency: frequency || 'weekly',
        };

        if (source) {
            updateData.source = source;
        }

        if (subscriptionDate) {
            updateData.subscribedAt = new Date(subscriptionDate);
        }

        const subscriber = await Subscriber.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!subscriber) {
            return NextResponse.json(
                { error: 'Subscriber not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Subscriber updated successfully' });
    } catch (error) {
        console.error('Update subscriber error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { params } = context;
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid subscriber ID' },
                { status: 400 }
            );
        }

        const subscriber = await Subscriber.findByIdAndDelete(id);

        if (!subscriber) {
            return NextResponse.json(
                { error: 'Subscriber not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Subscriber deleted successfully' });
    } catch (error) {
        console.error('Delete subscriber error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}