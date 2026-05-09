import React from 'react';

const Loading = ({ darkMode = false }) => {
    const bgClass = darkMode ? "bg-green-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50";
    const textClass = darkMode ? "text-gray-100" : "text-gray-800";

    return (
        <div className={`min-h-screen flex items-center justify-center ${bgClass} transition-colors duration-300`}>
            <div className="text-center space-y-6">
                {/* Animated Logo/Icon */}
                <div className="relative">
                    <div className="w-20 h-20 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center animate-bounce-subtle overflow-hidden">
                        <img
                            src="./icons/fav.png"
                            alt="Notes App Logo"
                            className="w-20 h-20 object-contain"
                        />
                    </div>

                    {/* Pulsing rings */}
                    <div className="absolute inset-0 rounded-2xl border-4 border-blue-300 animate-ping opacity-20"></div>
                    <div className="absolute inset-0 rounded-2xl border-4 border-blue-400 animate-ping opacity-10 animation-delay-300"></div>
                </div>

                {/* Loading Text */}
                <div className="space-y-2">
                    <h1 className={`text-5xl font-bold ${textClass}`}> NOTES</h1>
                </div>

                {/* Loading Dots */}
                <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-150"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce animation-delay-250"></div>
                    <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce animation-delay-350"></div>
                </div>

            </div>
        </div>
    );
};

export default Loading;