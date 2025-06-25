// src/components/auth/LoginForm.jsx
import React from 'react';

   function LoginForm() {
     return (
       <form className="max-w-sm mx-auto p-6 bg-white rounded shadow">
         <h2 className="text-2xl font-bold mb-4">Login</h2>
         <input
           className="block w-full mb-3 p-2 border border-gray-300 rounded"
           type="text"
           placeholder="Username"
         />
         <input
           className="block w-full mb-3 p-2 border border-gray-300 rounded"
           type="password"
           placeholder="Password"
         />
         <button
           className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
           type="submit"
         >
           Login
         </button>
       </form>
     );
   }
   export default LoginForm;

