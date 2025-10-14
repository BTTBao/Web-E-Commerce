import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminSidebar(){
  return (
    <div className="border-end pe-3">
      <ul className="list-unstyled">
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/products">Products</Link></li>
        <li><Link to="/admin/orders">Orders</Link></li>
        <li><Link to="/admin/users">Users</Link></li>
      </ul>
    </div>
  );
}
