import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Header(){
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Skynet-Commerce</Link>
        <div>
          <Link className="nav-link d-inline" to="/cart">Cart ({cart.length})</Link>
          {user ? (
            <>
              <span className="mx-2">Hi, {user?.fullName || user?.username}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="nav-link d-inline" to="/login">Login</Link>
              <Link className="nav-link d-inline" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
