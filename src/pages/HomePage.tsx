import { Link } from "react-router-dom";
import { Vote, Users, BarChart3, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center mb-6"
          >
            <Vote className="w-16 h-16 text-blue-600 drop-shadow-lg" />
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              PollFlow
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, share, and analyze polls instantly. Designed for{" "}
            <span className="font-semibold text-gray-800">
              teams, events, classrooms
            </span>{" "}
            and communities.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Vote className="w-5 h-5 mr-2" />
            Create Your First Poll
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-10">
        {[
          {
            icon: <Zap className="w-8 h-8 text-blue-600" />,
            title: "Quick Creation",
            desc: "Create polls in seconds with smart auto-parsing. Just type options, and we’ll handle the rest.",
            bg: "from-blue-50 to-blue-100",
          },
          {
            icon: <Users className="w-8 h-8 text-green-600" />,
            title: "Anonymous Voting",
            desc: "No signup needed. Share via link or QR code. Smart duplicate prevention keeps results fair.",
            bg: "from-green-50 to-green-100",
          },
          {
            icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
            title: "Live Results",
            desc: "Watch real-time charts update as votes come in. Unlock AI-powered insights after 20+ responses.",
            bg: "from-purple-50 to-purple-100",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 transition-all"
          >
            <div
              className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.bg} rounded-full mx-auto mb-6 shadow-sm`}
            >
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 text-center">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-center">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Trust Section */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Trusted by thousands worldwide 🌍
          </h2>
          <p className="text-gray-600 mb-10">
            From startups to classrooms — PollFlow powers decision-making with
            ease.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {["No registration", "Free forever", "Real-time analytics"].map(
              (item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-gray-700 font-medium bg-slate-50 px-4 py-2 rounded-lg shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 shadow-xl text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of users who trust PollFlow for their polling needs.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors duration-300"
          >
            Create a Poll
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm">
            © {new Date().getFullYear()} PollFlow. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
