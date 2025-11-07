
import AppRouter from './router/AppRouter'
import './App.css'
import { Toaster } from 'sonner';

function App() {
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
    </>
  );
}

export default App;