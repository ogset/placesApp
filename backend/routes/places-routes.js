import express from 'express'
import {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlaceById,
  deletePlaceById,
} from '../controllers/places-controller.js'
import { check } from 'express-validator'
import fileUpload from '../middleware/fileUploadMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()

router.get('/:pid', getPlaceById)
router.get('/user/:uid', getPlacesByUserId)

router.use(authMiddleware)
router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  updatePlaceById
)
router.delete('/:pid', deletePlaceById)

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  createPlace
)

//module.exports= router
export default router
