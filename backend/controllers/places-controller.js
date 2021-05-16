import HttpError from '../models/http-error.js'
import Place from '../models/placeModel.js'
import { validationResult } from 'express-validator'
import getCoordsForAddress from '../util/location.js'
import User from '../models/userModel.js'
import mongoose from 'mongoose'
import fs from 'fs'

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid
  const places = await Place.findById(placeId)
  if (!places || places.length === 0) {
    res.status(404)
    throw new Error('Could not find a place for the provided location.')
  }
  res.json({ places })
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid
  const places = await Place.find({ creator: userId })
  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find  places for the provided user.', 404)
    )
  }
  res.json({ places })
}
const createPlace = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError(`Invalid data.`, 422)
  }
  const { title, description, address } = req.body

  let coordinates = getCoordsForAddress(address)

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  })

  const user = await User.findById(req.userData.userId)
  if (user) {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdPlace.save({ session: sess })
    user.places.push(createdPlace)
    await user.save({ session: sess })
    await sess.commitTransaction()
  } else {
    throw new Error('User not found.')
  }

  res.status(201).json({ createdPlace })
}

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid data.', 422)
  }

  const { title, description } = req.body
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    )
    return next(error)
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401)
    return next(error)
  }

  place.title = title
  place.description = description

  try {
    await place.save()
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    )
    return next(error)
  }
  res.status(200).json({ place: place })
}
const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId).populate('creator')
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    )
    return next(error)
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404)
    return next(error)
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    )
    return next(error)
  }

  const imagePath = place.image

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await place.remove({ session: sess })
    place.creator.places.pull(place)
    await place.creator.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    )
    return next(error)
  }

  fs.unlink(imagePath, (err) => {
    console.log(err)
  })

  res.status(200).json({ message: 'Deleted place.' })
}

export {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlaceById,
  deletePlaceById,
}
