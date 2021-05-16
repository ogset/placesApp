import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],
  isAdmin: { type: Boolean, required: true, default: false },
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

export default User
