import mongoose from 'mongoose';
import dbConnect from './mongodb';

// Counter collection to track sequential IDs
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 1 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

/**
 * Generate next sequential UID (User ID) in format UIDxxxx (e.g., UID0001, UID0002)
 * For admin users, use UID0001 if it's the first
 */
export async function generateUID(isAdmin: boolean = false): Promise<string> {
  try {
    await dbConnect();

    let counterId = 'uid_counter';
    
    // If admin, check if UID0001 exists
    if (isAdmin) {
      const existingAdmin = await mongoose.model('User').findOne({ uid: 'UID0001' });
      if (!existingAdmin) {
        // Create first UID as UID0001 for admin
        return 'UID0001';
      }
    }

    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    const sequence = counter.sequence_value;
    return `UID${sequence.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating UID:', error);
    throw new Error('Failed to generate UID');
  }
}

/**
 * Generate next sequential PID (Payment ID) in format PIDxxxx (e.g., PID0001, PID0002)
 */
export async function generatePID(): Promise<string> {
  try {
    await dbConnect();

    const counterId = 'pid_counter';
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    const sequence = counter.sequence_value;
    return `PID${sequence.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating PID:', error);
    throw new Error('Failed to generate PID');
  }
}

/**
 * Get current sequence values (useful for debugging)
 */
export async function getSequenceValues() {
  try {
    await dbConnect();

    const uidCounter = await Counter.findById('uid_counter');
    const pidCounter = await Counter.findById('pid_counter');

    return {
      uid_sequence: uidCounter?.sequence_value || 0,
      pid_sequence: pidCounter?.sequence_value || 0
    };
  } catch (error) {
    console.error('Error getting sequence values:', error);
    throw new Error('Failed to get sequence values');
  }
}
