// eslint-disable-next-line no-unused-vars
import React from 'react';

function ConditionalRendering() {
  const isLoggedIn = true;

  return (
    <div>
      {isLoggedIn ? (
        <h1>Welcome back!</h1>
      ) : (
        <h1>Please sign in.</h1>
      )}
    </div>
  );
}

export default ConditionalRendering;