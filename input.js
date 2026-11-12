// Physical key positions keep controls usable with a Korean keyboard layout.
export function gameKey(event) {
  if (/^Key[WASDE]$/.test(event.code)) return event.code.slice(3).toLowerCase();
  return event.key.toLowerCase();
}
