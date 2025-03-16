import React from 'react';

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-base-content">
      {/* Hero Section */}
      <div className="max-w-3xl text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Welcome to InstantChat
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Connect with your friends in real time. Secure, fast, and easy to use.
        </p>
        <p className="mt-1 text-md text-gray-400">
          Switch between themes effortlessly with full customization support.
        </p>

        {/* Call-to-Action Button */}
        <div className="mt-6">
          <Link to="/chat">
            <button className="btn btn-primary btn-lg shadow-md hover:shadow-lg">
              Start Chatting
            </button>
          </Link>
        </div>
      </div>

      {/* Illustration */}
      {/* <div className="mt-10">
        <img
          src="/assets/images/chat.webp"
          alt="Chat Illustration"
          className="max-w-xs md:max-w-md"
        />
      </div> */}
    </div>
  );
};

export default Home;
