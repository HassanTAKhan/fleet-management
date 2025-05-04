import VehicleCard from "./VehicleCard";
import { parseISO } from "date-fns";

function VehicleList({ vehicles, onToggle, onRemove, onEditInsurance }) {
  const sorted = [...vehicles].sort((a, b) => {
    const getDate = (v) =>
      v.data.motTests?.[0]?.expiryDate
        ? parseISO(v.data.motTests[0].expiryDate)
        : new Date(8640000000000000);
    return getDate(a) - getDate(b);
  });

  return sorted.map(({ data, expanded, insuranceExpiry }) => (
    <VehicleCard
      key={data.registration}
      vehicle={data}
      expanded={expanded}
      insuranceExpiry={insuranceExpiry}
      onToggle={() => onToggle(data.registration)}
      onRemove={() => onRemove(data.registration)}
      onEditInsurance={onEditInsurance}
    />
  ));
}

export default VehicleList;
