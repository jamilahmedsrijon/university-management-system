import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

      {/* Navbar */}
      <div className="flex justify-between items-center px-6 md:px-10 py-4 bg-white shadow">

        <h1 className="text-2xl font-bold text-blue-600">
          My University
        </h1>

        <button
          onClick={() => navigate("/login")}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>

      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center">

        <div className="w-full max-w-6xl mx-6">

          {/* Hero Box */}
          <div className="relative h-[45vh] w-full mb-8">

            <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl">

              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585"
                alt="university"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center px-6">
                  Smart University Management System
                </h2>
              </div>

            </div>

          </div>

          {/* Content Box */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

            <h2 className="text-3xl font-bold text-blue-600 mb-4">
              Welcome To My University
            </h2>

            <p className="text-gray-700 leading-7 mb-4">
              MY University is committed to excellence in education, research,
              and innovation. Our platform helps students, teachers, and
              administrators manage academic activities efficiently.
            </p>

            <p className="text-gray-700 leading-7 mb-6">
              A vibrant environment, friendly community, and endless 
              opportunities to learn, grow 
              and create unforgettable memories every single day
            </p>

            {/* Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate("/register")}
                className="border border-blue-500 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition"
              >
                Create Account
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;