import mongoose from 'mongoose';

const infernoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cult',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inferno',
    },
  ],
});

const Inferno =
  mongoose.models.Inferno || mongoose.model('Inferno', infernoSchema);

export default Inferno;
