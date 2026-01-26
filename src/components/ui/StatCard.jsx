// Utility to get color classes
const getColors = (color) => {
  const map = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return map[color] || map.gray;
};

export default function StatCard({ title, value, sub, color = "gray", icon: Icon }) {
  const colors = getColors(color);

  return (
    <div className={`rounded-3xl border p-5 shadow-sm transition-all hover:shadow-md bg-white`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</div>
          {sub ? <div className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
            {sub}
          </div> : null}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${colors}`}>
            <Icon size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
}
