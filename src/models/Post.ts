import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPost extends Document {
  _id: string;
  captions: string[]; // Array of captions instead of single caption
  image?: string;
  mood?: string; // Store the mood used for generation
  description?: string; // Store the description used
  user?: Types.ObjectId;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  captions: {
    type: [String],
    required: [true, 'Please add at least one caption.'],
    validate: {
      validator: function(captions: string[]) {
        return captions.length >= 1 && captions.length <= 5; // Allow 1-5 captions
      },
      message: 'Must have between 1 and 5 captions.'
    }
  },
  image: {
    type: String,
  },
  mood: {
    type: String,
  },
  description: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Explicitly make it optional
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
