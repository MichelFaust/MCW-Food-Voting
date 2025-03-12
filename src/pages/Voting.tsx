import { Link } from "react-router-dom";

const Voting = () => {
  // Dummy-Namen für die Liste
  const dummyNames = [
    "Anna Schmidt",
    "Ben Müller",
    "Clara Wagner",
    "David Hoffmann",
    "Emma Lehmann",
    "Felix Becker",
    "Hannah Klein",
    "Jonas Richter",
  ];

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Zurück-Button in die obere linke Ecke */}
      <div className="absolute top-5 left-5">
        <Link to="/" className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition">
          ⬅️ Zurück
        </Link>
      </div>

      {/* Überschrift */}
      <h1 className="text-5xl font-bold mb-8">Wähle deinen Namen</h1>

      {/* Namensliste (Buttons untereinander in der Mitte) */}
      <div className="flex flex-col space-y-4 w-80">
        {dummyNames.map((name, index) => (
          <button
            key={index}
            className="w-full px-6 py-3 bg-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-700 transition"
            onClick={() => alert(`Auswahl: ${name}`)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Voting;
