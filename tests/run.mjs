// Runs every test file in sequence and fails if any of them fails.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const files = [
  'tests/db/security.test.mjs',        // privilege escalation, double booking, price tampering, IDOR...
  'tests/db/payments-kb.test.mjs',     // payment flow, settings RLS, knowledge-base search
  'tests/db/sample-data.test.mjs',     // optional sample data loads and removes cleanly
  'tests/assistant/assistant.test.mjs' // assistant engine + knowledge-base answers
]
const root = fileURLToPath(new URL('../', import.meta.url))
let failed = 0
for (const f of files) {
  console.log(`\n━━ ${f}`)
  const r = spawnSync(process.execPath, [f], { cwd: root, stdio: 'inherit' })
  if (r.status !== 0) { failed++; console.log(`✗ ${f} failed`) }
}
console.log(failed ? `\n${failed} test file(s) failed` : '\nAll test files passed')
process.exit(failed ? 1 : 0)
