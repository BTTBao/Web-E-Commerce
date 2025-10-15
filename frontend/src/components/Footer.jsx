import React from 'react';

export default function Footer(){
  return (
    <footer className="border-top mt-4 py-3">
      <div className="container text-center">
        © {new Date().getFullYear()} Footer
      </div>
    </footer>
  );
}
