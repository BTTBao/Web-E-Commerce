import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Profile(){
  const { user } = useContext(AuthContext);
  if(!user) return <div>Please login</div>;
  return (
    <div>
      <h3>Profile</h3>
      <p>Username: {user.username}</p>
      <p>Full name: {user.fullName}</p>
    </div>
  );
}
