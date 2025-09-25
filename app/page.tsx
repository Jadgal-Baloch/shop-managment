export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6 md:p-12 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 text-green-400">
          🛍️ Welcome to Shop Manager
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          Easily manage your <span className="font-semibold text-white">inventory</span>, track{" "}
          <span className="font-semibold text-white">sales</span>, and calculate{" "}
          <span className="font-semibold text-white">profits</span> — all in one place.
        </p>
        <p className="mt-6 text-base sm:text-lg">
          <span className="text-green-400 font-semibold">Use the Navbar above</span>{" "}
          to start managing your shop 🚀
        </p>
      </div>
    </div>
  );
}