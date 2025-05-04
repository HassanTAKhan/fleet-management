import { differenceInDays, parseISO } from "date-fns";
import MotHistory from "./MotHistory";

function getMotExpiryInfo(vehicle) {
  if (!vehicle?.motTests?.length) return null;
  const latest = vehicle.motTests[0];
  const expiry = parseISO(latest.expiryDate);
  const days = differenceInDays(expiry, new Date());
  let color = "bg-green-200";
  if (days <= 60 && days > 30) color = "bg-yellow-200";
  else if (days <= 30) color = "bg-red-200";
  return { daysRemaining: days, expiryDate: expiry.toDateString(), color };
}

function VehicleCard({
  vehicle,
  expanded,
  insuranceExpiry,
  onToggle,
  onRemove,
  onEditInsurance,
}) {
  const motInfo = getMotExpiryInfo(vehicle);

  const renderInsuranceExpiry = () => {
    const days = differenceInDays(parseISO(insuranceExpiry), new Date());
    const color =
      days <= 30
        ? "text-red-600"
        : days <= 60
        ? "text-yellow-600"
        : "text-green-700";

    return (
      <span className={`text-sm ${color}`}>
        ({days} day{days !== 1 ? "s" : ""} remaining)
      </span>
    );
  };

  return (
    <div
      className={`relative p-4 rounded shadow mb-4 cursor-pointer transition-all duration-200 ${
        motInfo?.color || "bg-gray-100"
      }`}
      onClick={onToggle}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        aria-label={`Remove ${vehicle.registration}`}
      >
        &times;
      </button>

      <p className="text-xl font-semibold">{vehicle.registration}</p>
      {motInfo && (
        <p className="text-sm text-gray-700">
          MOT due: {motInfo.expiryDate} ({motInfo.daysRemaining} days)
        </p>
      )}

      {expanded && (
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Make:</strong> {vehicle.make}</p>
          <p><strong>Model:</strong> {vehicle.model}</p>
          <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
          <p><strong>Primary Colour:</strong> {vehicle.primaryColour}</p>

          <div className="mt-2">
            <label className="block font-medium mb-1">Insurance Expiry:</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={insuranceExpiry}
                onChange={(e) =>
                  onEditInsurance(vehicle.registration, e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
              />
              {insuranceExpiry && renderInsuranceExpiry()}
            </div>
          </div>

          <MotHistory tests={vehicle.motTests?.slice(0, 3)} />
        </div>
      )}
    </div>
  );
}

export default VehicleCard;
