import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context'

import './NavLinks.css'

const NavLinks = (props) => {
  const auth = useContext(AuthContext)
  return (
    <ul className="nav-links">
      {auth.userName && (
        <li
          style={{
            fontStyle: 'italic',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          {auth.userName.split(' ')[0][0].toUpperCase() +
            auth.userName.split(' ')[0].slice(1)}
        </li>
      )}
      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <>
          <li>
            <NavLink to={`/${auth.userId}/places`}>MY PLACES</NavLink>
          </li>
          <li>
            <NavLink to="/places/new">ADD PLACE</NavLink>
          </li>
        </>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">Login</NavLink>
        </li>
      )}
      {auth.isLoggedIn && <button onClick={auth.logout}>LOGOUT</button>}
    </ul>
  )
}

export default NavLinks
