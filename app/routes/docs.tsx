import { Navbar } from "../components/layout/navbar";
import { Search } from "lucide-react";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4 text-center">
            Documentation
          </h1>
          
          <div className="relative mt-8 mb-12">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <div className="space-y-12">
            <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-2">Quick Start Guide</h3>
                  <p className="text-gray-400">Learn how to create your first chatbot in minutes</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-2">Installation</h3>
                  <p className="text-gray-400">Set up and configure your chatbot environment</p>
                </div>
              </div>
            </section>

            <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Core Concepts</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-2">Bot Builder</h3>
                  <p className="text-gray-400">Understanding the visual bot builder interface</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-2">Analytics</h3>
                  <p className="text-gray-400">Track and analyze your chatbot's performance</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;