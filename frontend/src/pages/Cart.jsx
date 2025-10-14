import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { Link } from 'react-router-dom';

export default function Cart(){
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  const total = cart.reduce((s,i)=>s + (i.price||0) * (i.quantity||1), 0);

  return (
    <div>
      <h2>Your cart</h2>
      {cart.length === 0 ? <p>No items. <Link to="/">Go shopping</Link></p> : (
        <>
          <ul className="list-group mb-3">
            {cart.map(item=>(
              <li className="list-group-item d-flex justify-content-between align-items-center" key={item.productID}>
                <div>
                  <img src={item.imageURL} alt={item.name} style={{width:60}} className="me-2" />
                  {item.name}
                </div>
                <div>
                  {formatPrice(item.price)} x {item.quantity}
                  <button className="btn btn-sm btn-danger ms-3" onClick={()=>removeFromCart(item.productID)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="d-flex justify-content-between">
            <strong>Total: {formatPrice(total)}</strong>
            <div>
              <button className="btn btn-secondary me-2" onClick={clearCart}>Clear</button>
              <Link className="btn btn-primary" to="/checkout">Checkout</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
