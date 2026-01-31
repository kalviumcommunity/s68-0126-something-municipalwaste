export default function WasteHome() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Clean City. Better Future.</h2>
        <p className="max-w-xl mx-auto text-gray-600 mb-8">
          Efficient, transparent, and eco-friendly municipal waste management.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-2xl">
          View Collection Schedule
        </button>
      </section>

      {/* Services */}
      <section className="px-8 pb-20 grid gap-6 md:grid-cols-3">
        {[
          { title: "Waste Collection", desc: "Door-to-door waste pickup." },
          { title: "Recycling", desc: "Segregation and recycling services." },
          { title: "Green Initiatives", desc: "Composting & eco programs." },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white p-6 rounded-2xl shadow-sm text-center"
          >
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
