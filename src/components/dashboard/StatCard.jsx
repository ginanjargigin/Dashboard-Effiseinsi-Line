import { C } from "../../constants/appConstants";

export default function StatCard({
  label,
  value,
  color,
  icon: Icon,
}) {
  return (
    <div
      className="print-card"
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {Icon && <Icon size={12} />}
        {label}
      </div>

      <div
        className="num-field"
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: color || C.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}
