export function formatTrigger(trigger: string): string {
  return trigger
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
