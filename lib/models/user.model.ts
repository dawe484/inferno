import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  infernos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inferno',
    },
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  cults: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cult',
    },
  ],
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
