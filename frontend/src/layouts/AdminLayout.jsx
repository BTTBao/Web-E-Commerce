import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout(){
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2 bg-light vh-100">
          <AdminSidebar />
        </div>
        <div className="col-10 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
