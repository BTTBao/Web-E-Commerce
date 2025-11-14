import React from 'react';
import AppRouter from './router/AppRouter';
import './App.css';
import { Toaster } from 'sonner';
import ChatWidget from './components/Chat/ChatWidget.jsx'; 
import { useAuth } from './context/useAuth.js';

function App() {

  const { token, user } = useAuth();
  return (
    <>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            fontSize: "16px",    
            padding: "20px 24px",  
            minWidth: "500px",    
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)", 
          },
        }}
      />
      
      <AppRouter />
      
      {/* * Truyền 'token' và 'user' vào ChatWidget.
        * Đổi tên prop 'user' thành 'currentUser' để ChatWidget hiểu.
      */}
      <ChatWidget 
        token={token} 
        currentUser={user} // <--- Truyền 'user' vào prop 'currentUser'
      />
    </>
  );
}

export default App;