import { Check } from "lucide-react";
import { Link } from "@remix-run/react";
import { Navbar } from "../components/layout/navbar";

const PricingTier = ({
  name,
  price,
  features,
  isPopular,
}: {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}) => (
  <div className={`relative p-6 bg-gray-900 rounded-2xl border ${isPopular ? 'border-purple-500' : 'border-gray-800'} backdrop-blur-xl`}>
    {isPopular && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
        Most Popular
      </span>
    )}
    <div className="text-center">
      <h3 className="text-xl font-semibold text-white">{name}</h3>
      <div className="mt-4 flex items-baseline justify-center">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="ml-1 text-gray-400">/month</span>
      </div>
    </div>
    <ul className="mt-6 space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-300">
          <Check className="h-5 w-5 text-purple-500 mr-2" />
          {feature}
        </li>
      ))}
    </ul>
    <Link
      to="/register"
      className={`mt-8 block w-full px-6 py-3 text-center text-sm font-medium rounded-lg ${
        isPopular
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
          : 'bg-gray-800 text-white hover:bg-gray-700'
      } transition-all duration-200`}
    >
      Get Started
    </Link>
  </div>
);

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400">
            Choose the perfect plan for your chatbot needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <PricingTier
            name="Starter"
            price="$29"
            features={[
              "1 Chatbot",
              "Basic Analytics",
              "Standard Templates",
              "Email Support",
              "5,000 Messages/mo",
            ]}
          />
          <PricingTier
            name="Professional"
            price="$79"
            features={[
              "3 Chatbots",
              "Advanced Analytics",
              "Custom Templates",
              "Priority Support",
              "25,000 Messages/mo",
            ]}
            isPopular
          />
          <PricingTier
            name="Enterprise"
            price="$199"
            features={[
              "Unlimited Chatbots",
              "Custom Analytics",
              "Custom Integration",
              "24/7 Support",
              "Unlimited Messages",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;