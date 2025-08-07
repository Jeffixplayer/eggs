import React from 'react';
import RegistrationForm from '../components/RegistrationForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <RegistrationForm />
    </div>
  );
};

export default RegisterPage;