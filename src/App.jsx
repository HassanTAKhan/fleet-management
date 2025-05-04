import { useEffect, useState } from "react";
import VehicleForm from "./components/VehicleForm";
import VehicleList from "./components/VehicleList";

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // The three defaults to fetch every time
  const defaultRegistrations = ["DF04BEY", "D1PLO", "MK63XAR"];

  useEffect(() => {
    // Load anything already saved
    const saved = JSON.parse(localStorage.getItem("savedRegistrations")) || [];

    // Build a list that starts with defaults, then any saved ones
    // (but skip duplicates)
    const initialList = [
      ...defaultRegistrations.map((reg) => ({
        registration: reg,
        insuranceExpiry: "",
      })),
      ...saved.filter(
        ({ registration }) =>
          !defaultRegistrations.includes(registration)
      ),
    ];

    initialList.forEach(({ registration, insuranceExpiry }) => {
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
    if (
      reg &&
      !vehicles.some((v) => v.data.registration === reg)
    ) {
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
      <VehicleForm onAdd={handleAdd} />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && (
        <div className="flex justify-center mb-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <VehicleList
        vehicles={vehicles}
        onToggle={handleToggleExpand}
        onRemove={handleRemove}
        onEditInsurance={handleEditInsurance}
      />
    </div>
  );
}

export default App;
