
import AppRouter from './router/AppRouter'
import './App.css'
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </>
  );
}

export default App;