export const BUILD_VERSION = `v2026-01-18-autherrors-telemetry`;

export function BuildVersionBadge() {
  return (
    <div className="text-xs text-gray-400 text-center py-2">
      Build: {BUILD_VERSION}
    </div>
  );
}