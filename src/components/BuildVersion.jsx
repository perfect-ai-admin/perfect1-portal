export const BUILD_VERSION = `v${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 5)}`;

export function BuildVersionBadge() {
  return (
    <div className="text-xs text-gray-400 text-center py-2">
      Build: {BUILD_VERSION}
    </div>
  );
}