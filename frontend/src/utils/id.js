/** Compare Mongo/ObjectId values that may be strings or objects */
export function idEq(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}
