export default function HomePage() {
  return (
    <div className="p-12 text-center">
      <h1 className="text-5xl font-extrabold mb-6 text-blue-700">
        🛍️ Welcome to Shop Manager
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">
        Easily manage your <span className="font-semibold">inventory</span>, track{" "}
        <span className="font-semibold">sales</span>, and calculate{" "}
        <span className="font-semibold">profits</span> — all in one place.
      </p>
      <p className="mt-6">
        <span className="text-blue-600 font-semibold">Use the Navbar above</span>{" "}
        to start managing your shop 🚀
      </p>
    </div>
  );
}
