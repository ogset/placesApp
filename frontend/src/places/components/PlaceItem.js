import React, { useState, useContext } from 'react'

import Card from '../../shared/components/UIElements/Card'
import Button from '../../shared/components/FormElements/Button'
import Modal from '../../shared/components/UIElements/Modal'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { AuthContext } from '../../shared/context/auth-context'
import { useHttpClient } from '../../shared/hooks/http-hook'
import './PlaceItem.css'

const PlaceItem = ({
  image,
  title,
  address,
  description,
  id,
  coordinates,
  onDelete,
  creatorId,
}) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient()
  const auth = useContext(AuthContext)
  const [showMap, setShowMap] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const openMapHandler = () => setShowMap(true)
  const closeMapHandler = () => setShowMap(false)

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true)
  }
  const cancelDeleteHandler = () => {
    setShowConfirmModal(false)
  }
  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false)
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${id}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + auth.token }
      )
      onDelete(id)
    } catch (err) {}
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container" style={{ padding: '5px' }}>
          <iframe
            title="map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={
              'https://maps.google.com/maps?q=' +
              coordinates.lat.toString() +
              ',' +
              coordinates.lng.toString() +
              '&t=&z=15&ie=UTF8&iwloc=&output=embed'
            }
          ></iframe>
          <script
            type="text/javascript"
            src="https://embedmaps.com/google-maps-authorization/script.js?id=5a33be79e53caf0a07dfec499abf84b7b481f165"
          ></script>
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </>
        }
      >
        <div>
          {' '}
          <h3>Do you want to proceed and delete this place?</h3>
          <h5>Please note that it can't be undone thereafter.</h5>
        </div>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img src={`http://localhost:5000/${image}`} alt={title} />
          </div>
          <div className="place-item__info">
            <h2>{title}</h2>
            <h3>{address}</h3>
            <p>{description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              View on Map
            </Button>
            {auth.userId === creatorId && (
              <>
                <Button to={`/places/${id}`}>EDIT</Button>{' '}
                <Button danger onClick={showDeleteWarningHandler}>
                  DELETE
                </Button>
              </>
            )}
          </div>
        </Card>
      </li>
    </>
  )
}

export default PlaceItem
