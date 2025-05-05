import { useEffect, useRef, useState } from "react";
import VehicleForm from "./components/VehicleForm";
import VehicleList from "./components/VehicleList";
import DriverCheck from "./components/DriverCheck";

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("vehicles");

  const defaultRegistrations = ["DF04BEY", "D1PLO", "MK63XAR"];

  // Keep track of which regs we've already fetched
  const fetchedRegs = useRef(new Set());

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedRegistrations")) || [];

    const initialList = [
      ...defaultRegistrations.map((reg) => ({ registration: reg, insuranceExpiry: "" })),
      ...saved.filter(({ registration }) => !defaultRegistrations.includes(registration)),
    ];

    // Deduplicate by registration just in case
    const uniqueList = initialList.reduce((acc, cur) => {
      if (!acc.find((item) => item.registration === cur.registration)) {
        acc.push(cur);
      }
      return acc;
    }, []);

    uniqueList.forEach(({ registration, insuranceExpiry }) => {
      fetchVehicleData(registration, insuranceExpiry);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dataToSave = vehicles.map((v) => ({
      registration: v.data.registration,
      insuranceExpiry: v.insuranceExpiry || "",
    }));
    localStorage.setItem("savedRegistrations", JSON.stringify(dataToSave));
  }, [vehicles]);

  const fetchVehicleData = async (registration, insuranceExpiry = "") => {
    // **Skip** if we already fetched this one
    if (fetchedRegs.current.has(registration)) return;
    fetchedRegs.current.add(registration);

    try {
      setLoading(true);
      const response = await fetch(`/api/vehicle/${registration}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || response.statusText);
      }
      const data = await response.json();
      setVehicles((prev) => [
        ...prev,
        { data, expanded: false, insuranceExpiry },
      ]);
      setError("");
    } catch (err) {
      setError(`Error fetching ${registration}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (registration) => {
    const reg = registration.trim().toUpperCase();
    if (reg && !fetchedRegs.current.has(reg)) {
      fetchVehicleData(reg);
    }
  };

  const handleRemove = (registration) => {
    setVehicles((prev) =>
      prev.filter((v) => v.data.registration !== registration)
    );
  };

  const handleToggleExpand = (registration) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.data.registration === registration
          ? { ...v, expanded: !v.expanded }
          : v
      )
    );
  };

  const handleEditInsurance = (registration, newDate) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.data.registration === registration
          ? { ...v, insuranceExpiry: newDate }
          : v
      )
    );
  };

  return (
    <div className="p-6 font-sans max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Fleet Management</h1>

      <nav className="flex border-b mb-4">
        <button
          onClick={() => setTab("vehicles")}
          className={`px-4 py-2 -mb-px font-medium ${
            tab === "vehicles"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Vehicles
        </button>
        <button
          onClick={() => setTab("drivers")}
          className={`ml-4 px-4 py-2 -mb-px font-medium ${
            tab === "drivers"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Drivers
        </button>
      </nav>

      {tab === "vehicles" ? (
        <>
          <VehicleForm onAdd={handleAdd} />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {loading && (
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <VehicleList
            vehicles={vehicles}
            onToggle={handleToggleExpand}
            onRemove={handleRemove}
            onEditInsurance={handleEditInsurance}
          />
        </>
      ) : (
        <DriverCheck />
      )}
    </div>
  );
}

export default App;
