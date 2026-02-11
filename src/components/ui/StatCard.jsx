// Utility to get color classes
const getTheme = (color) => {
  const themes = {
    blue: {
      card: "bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-blue-500/10",
      icon: "bg-white text-blue-600 shadow-sm",
      text: "text-blue-900",
      sub: "bg-white text-blue-700 shadow-sm"
    },
    green: {
      card: "bg-gradient-to-br from-green-50 to-white border-green-200 hover:shadow-green-500/10",
      icon: "bg-white text-green-600 shadow-sm",
      text: "text-green-900",
      sub: "bg-white text-green-700 shadow-sm"
    },
    purple: {
      card: "bg-gradient-to-br from-purple-50 to-white border-purple-200 hover:shadow-purple-500/10",
      icon: "bg-white text-purple-600 shadow-sm",
      text: "text-purple-900",
      sub: "bg-white text-purple-700 shadow-sm"
    },
    orange: {
      card: "bg-gradient-to-br from-orange-50 to-white border-orange-200 hover:shadow-orange-500/10",
      icon: "bg-white text-orange-600 shadow-sm",
      text: "text-orange-900",
      sub: "bg-white text-orange-700 shadow-sm"
    },
    red: {
      card: "bg-gradient-to-br from-red-50 to-white border-red-200 hover:shadow-red-500/10",
      icon: "bg-white text-red-600 shadow-sm",
      text: "text-red-900",
      sub: "bg-white text-red-700 shadow-sm"
    },
    gray: {
      card: "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:shadow-gray-500/10",
      icon: "bg-white text-gray-600 shadow-sm",
      text: "text-gray-900",
      sub: "bg-white text-gray-700 shadow-sm"
    },
  };
  return themes[color] || themes.gray;
};

export default function StatCard({ title, value, sub, color = "gray", icon: Icon }) {
  const theme = getTheme(color);

  return (
    <div className={`rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${theme.card}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</div>
          {sub ? (
            <div className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${theme.sub}`}>
              {sub}
            </div>
          ) : null}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ring-1 ring-black/5 ${theme.icon}`}>
            <Icon size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
}
