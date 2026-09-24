export function formatCurrency(value: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function plannerLabel(type: string) {
  switch (type) {
    case "home":
      return "Home Planner";
    case "party":
      return "Party Planner";
    case "jewelry":
      return "Jewelry Planner";
    default:
      return type;
  }
}
