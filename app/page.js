import Link from 'next/link';
import { Languages, Map, Settings, ArrowRight, Users, Globe, Zap } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Languages,
      title: 'Smart Translation',
      description: 'Translate text between multiple languages with AI-powered accuracy',
      href: '/translator',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Map,
      title: 'Location Explorer',
      description: 'Discover places and get directions in your preferred language',
      href: '/maps',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Settings,
      title: 'Personalization',
      description: 'Customize your experience with language preferences and settings',
      href: '/settings',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: 'Global Communication',
      description: 'Break language barriers and connect with people worldwide'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant translations with our optimized AI engine'
    },
    {
      icon: Users,
      title: 'User Friendly',
      description: 'Intuitive interface designed for users of all skill levels'
    }
  ];

  return (
    <div className="min-h-screen md:ml-20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Lingo Me</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your personal language companion that breaks down barriers and connects cultures through seamless translation and exploration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/translator"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Translating
            </Link>
            <Link
              href="/maps"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Explore Maps
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 group border border-gray-100"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Why Choose Lingo Me?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Languages Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50M+</div>
              <div className="text-gray-600">Translations Made</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
