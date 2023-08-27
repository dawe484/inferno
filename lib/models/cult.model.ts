import mongoose from 'mongoose';

const cultSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  infernos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inferno',
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const Cult = mongoose.models.Cult || mongoose.model('Cult', cultSchema);

export default Cult;
