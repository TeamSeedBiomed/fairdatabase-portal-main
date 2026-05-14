/**
 * Test script to verify frontend-backend dataset name mapping
 *
 * Run with: npx tsx src/lib/api.test.ts
 * Or import in browser console after building
 */

// Test the name mapping logic
const nameMap: Record<string, string> = {
  "gut": "gut_microbiome",
  "oral": "oral_microbiome",
  "skin": "skin_microbiome",
};

const reverseNameMap: Record<string, string> = {
  "gut_microbiome": "gut",
  "oral_microbiome": "oral",
  "skin_microbiome": "skin",
};

function mapDatasetName(shortName: string): string {
  return nameMap[shortName] || shortName;
}

function reverseMapDatasetName(fullName: string): string {
  return reverseNameMap[fullName] || fullName;
}

// Test cases
const testCases = [
  { input: "gut", expected: "gut_microbiome" },
  { input: "oral", expected: "oral_microbiome" },
  { input: "skin", expected: "skin_microbiome" },
  { input: "unknown", expected: "unknown" },
];

const reverseTestCases = [
  { input: "gut_microbiome", expected: "gut" },
  { input: "oral_microbiome", expected: "oral" },
  { input: "skin_microbiome", expected: "skin" },
  { input: "unknown", expected: "unknown" },
];

console.log("=== Dataset Name Mapping Tests ===\n");

console.log("Forward mapping (frontend -> backend):");
testCases.forEach(({ input, expected }) => {
  const result = mapDatasetName(input);
  const pass = result === expected;
  console.log(`  ${pass ? "✓" : "✗"} ${input} -> ${result} (expected: ${expected})`);
});

console.log("\nReverse mapping (backend -> frontend):");
reverseTestCases.forEach(({ input, expected }) => {
  const result = reverseMapDatasetName(input);
  const pass = result === expected;
  console.log(`  ${pass ? "✓" : "✗"} ${input} -> ${result} (expected: ${expected})`);
});

const allPassed = testCases.every(t => mapDatasetName(t.input) === t.expected) &&
                  reverseTestCases.every(t => reverseMapDatasetName(t.input) === t.expected);

console.log(`\n=== ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"} ===`);

if (allPassed) {
  console.log("\nIntegration ready:");
  console.log("  Frontend 'gut' -> Backend 'gut_microbiome' ✓");
  console.log("  Frontend 'oral' -> Backend 'oral_microbiome' ✓");
  console.log("  Frontend 'skin' -> Backend 'skin_microbiome' ✓");
}

export { mapDatasetName, reverseMapDatasetName };