import React from 'react';
import { Bell } from 'react-icons/fi';

const TestIcons = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test de React Icons</h1>
      <Bell size={32} color="blue" />
      <p>Si ves una campana azul, funciona correctamente.</p>
    </div>
  );
};

export default TestIcons;