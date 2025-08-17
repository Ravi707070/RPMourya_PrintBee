import React from "react";
import { motion } from "framer-motion";
import fulllogo from "../assets/fulllogo.png"; // Replace with your logo path
import pixellogic from "../assets/pixellgoic1.png"
export default function HeroSection() {
    return (
        <section className="bg-gradient-to-r from-blue-100 via-pink-100 to-pink-200 min-h-screen flex flex-col justify-between px-6 py-12">
            <div className="container mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-12 flex-grow">

                {/* Left Side: Logo & Description */}
                <motion.div
                    className="lg:w-1/2 w-full"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                >
                    {/* Logo */}
                    <img
                        src={fulllogo}
                        alt="Print Bee Logo"
                        className="w-60 mb-6 mx-auto lg:mx-0 drop-shadow-lg"
                    />

                    {/* Description */}
                    <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-800 mb-6 text-center lg:text-left leading-tight">
                        Print Bee – Fast, Quality Printing at Your Fingertips
                    </h1>
                    <p className="text-gray-600 mb-8 text-lg text-center lg:text-left max-w-xl">
                        Easily upload your files, choose your printing options, and get your prints delivered quickly.
                        <span className="font-semibold text-gray-800"> Print Bee </span> makes printing hassle-free and efficient.
                    </p>
                    <h3 className="text-2xl lg:text-xl font-bold text-gray-800 mb-6 text-center lg:text-left leading-tight">
                        “Send your printing order to our branch office of RP DIGI PRESS beside Reddy Timbers, <br /> we’ll take care of it quickly! Once your order is placed, give us a call to confirm.”
                    </h3>
                </motion.div>

                {/* Right Side: How to Use + Order Form */}
                <motion.div
                    className="lg:w-1/2 w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                >
                    {/* How to Use Section */}
                    <div className="bg-yellow-100/70 backdrop-blur-md border border-yellow-200 p-6 rounded-xl shadow-sm">
                        <h2 className="font-semibold text-gray-800 mb-3 text-lg">How to Use Print Bee:</h2>
                        <ol className="list-decimal list-inside text-gray-700 space-y-1">
                            <li>Upload your file.</li>
                            <li>Describe your print options (size, material, quantity).</li>
                            <li>Place your order below.</li>
                            <li>Give us a call to confirm your order!</li>
                        </ol>
                    </div>

                    {/* Place Order Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">
                            Place Your Order
                        </h2>

                        <div className="flex justify-center lg:justify-start">
                            <a href="/order">
                                <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold text-lg shadow-md hover:scale-105 transition-transform duration-300">
                                    Order Now
                                </button>
                            </a>
                        </div>

                        <p className="text-gray-500 mt-6 text-sm text-center lg:text-left">
                            💡 Don’t forget to <span className="font-medium text-gray-700">call us</span> after placing the order to confirm it.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Footer Credentials */}
            <footer className="mt-12 text-center border-t border-gray-300 pt-6">
                <p className="text-xs text-gray-600 flex flex-wrap justify-center items-center gap-2">
                    © 2025 <span className="font-semibold text-gray-800">rpmouryaprints</span> ·
                    Developed by <span className="font-medium text-gray-700">Print Bee Team</span> ·
                    Powered by
                    <img src={pixellogic} alt="Pixel Logic Logo" className="h-5 inline-block align-middle" />
                </p>
            </footer>
        </section>
    );
}
