import { v4 as uuidv4 } from 'uuid'
import HttpError from '../models/http-error.js'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const getUsers = async (req, res, next) => {
  const users = await User.find({}, '-password')
  res.json({ users })
}
const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid data.', 422)
  }
  const { name, email, password, isAdmin } = req.body

  const userExist = await User.findOne({ email })
  if (userExist) {
    throw new HttpError('Email already exist, please login.', 422)
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again later.',
      500
    )
    return next(error)
  }

  const newUser = await User.create({
    id: uuidv4(),
    email,
    name,
    password: hashedPassword,
    image: req.file.path,
    places: [],
    isAdmin,
  })

  let token
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again later.',
      500
    )
    return next(error)
  }

  res.status(201).json({
    userId: newUser.id,
    email: newUser.email,
    token: token,
    name: newUser.name,
  })
}
// const login = asyncHandler(async (req, res) => {
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     throw new HttpError('Invalid data.', 422)
//   }
//   const { email, password } = req.body

//   const identifiedUser = await User.findOne({ email })

//   if (!identifiedUser) {
//     throw new HttpError(
//       'Could not identify user, credentials seem to be wrong.',
//       401
//     )
//   }

//   let isValidPassword = false

//   try {
//     isValidPassword = await bcrypt.compare(password, identifiedUser.password)
//   } catch (err) {
//     const error = new HttpError(
//       'Could not log you in, please check your password or email.',
//       500
//     )
//     return next(error)
//   }

//   if (!isValidPassword) {
//     throw new HttpError('Invalid Password', 401)
//   }
//   let token
//   try {
//     token = jwt.sign(
//       { userId: identifiedUser.id, email: identifiedUser.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '30m' }
//     )
//   } catch (err) {
//     const error = new HttpError('Login failed. please try again later.', 500)
//     return next(error)
//   }

//   res.json({
//     userId: identifiedUser.id,
//     email: identifiedUser.email,
//     token: token,
//   })
// })
const login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser

  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    )
    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    )
    return next(error)
  }

  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    )
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    )
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    )
    return next(error)
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    token: token,
  })
}

export { getUsers, signup, login }
