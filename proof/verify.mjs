import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE_URL = pathToFileURL(path.resolve('todo-list.html')).href;

let pass = 0, fail = 0;
const failures = [];

function ok(label) { pass++; console.log(`  ${label} ✓`); }
function bad(label, expected, observed) {
  fail++;
  const msg = `  ${label} ✗  expected=${JSON.stringify(expected)} observed=${JSON.stringify(observed)}`;
  console.log(msg);
  failures.push(msg);
}
function check(cond, label, expected, observed) {
  if (cond) ok(label); else bad(label, expected, observed);
}

let page;

// --- test primitives over the real page ---
async function freshLoad() {
  await page.goto(FILE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.goto(FILE_URL); // reload with clean storage
}
async function reloadKeepStorage() {
  await page.reload();
}
async function addTask(text, { enter = false } = {}) {
  await page.fill('#new-todo', text);
  if (enter) await page.press('#new-todo', 'Enter');
  else await page.click('#add-btn');
}
async function items() {
  return page.$$('#todo-list > .todo-item');
}
async function texts() {
  return page.$$eval('#todo-list > .todo-item .todo-text', els => els.map(e => e.textContent));
}
async function completedFlags() {
  return page.$$eval('#todo-list > .todo-item', els => els.map(e => e.getAttribute('data-completed')));
}
async function count() {
  return page.$eval('#active-count', el => parseInt(el.getAttribute('data-value'), 10));
}
async function inputValue() {
  return page.$eval('#new-todo', el => el.value);
}
async function toggleAt(i) {
  const tg = await page.$$('#todo-list > .todo-item .todo-toggle');
  await tg[i].click();
}
async function deleteAt(i) {
  const dl = await page.$$('#todo-list > .todo-item .todo-delete');
  await dl[i].click();
}

async function main() {
  const browser = await chromium.launch();
  page = await browser.newPage();
  page.on('pageerror', e => { fail++; failures.push('  pageerror: ' + e.message); console.log('  pageerror:', e.message); });

  // 1. Empty start
  await freshLoad();
  {
    const n = (await items()).length, c = await count();
    check(n === 0 && c === 0, `[1] empty start → items 0, count 0`, { items: 0, count: 0 }, { items: n, count: c });
  }

  // 2. Add three
  await freshLoad();
  await addTask('Buy milk');
  const afterFirst = await inputValue();
  await addTask('Walk dog', { enter: true }); // exercise Enter path too
  await addTask('Write seed');
  {
    const n = (await items()).length, c = await count();
    const t = await texts(), flags = await completedFlags();
    const orderOk = JSON.stringify(t) === JSON.stringify(['Buy milk', 'Walk dog', 'Write seed']);
    const allActive = flags.every(f => f === 'false');
    const inputEmpty = (await inputValue()) === '' && afterFirst === '';
    check(n === 3 && c === 3 && orderOk && allActive && inputEmpty,
      `[2] add three → items 3, order, all active, input cleared, count 3`,
      { items: 3, count: 3, order: ['Buy milk', 'Walk dog', 'Write seed'], allActive: true, inputEmpty: true },
      { items: n, count: c, order: t, allActive, inputEmpty });
  }

  // 3. Reject whitespace
  await addTask('   ');
  {
    const n = (await items()).length, c = await count();
    check(n === 3 && c === 3, `[3] reject whitespace → still 3, count 3`, { items: 3, count: 3 }, { items: n, count: c });
  }

  // 4. Toggle index 1
  await toggleAt(1);
  {
    const flags = await completedFlags(), c = await count(), t = await texts();
    const orderOk = JSON.stringify(t) === JSON.stringify(['Buy milk', 'Walk dog', 'Write seed']);
    const flagsOk = JSON.stringify(flags) === JSON.stringify(['false', 'true', 'false']);
    check(flagsOk && c === 2 && orderOk, `[4] toggle index 1 → count 2, flags [f,t,f], order kept`,
      { flags: ['false', 'true', 'false'], count: 2 }, { flags, count: c, order: t });
  }

  // 5. Filter active
  await page.click('#filter-active');
  {
    const t = await texts(), c = await count();
    const okk = JSON.stringify(t) === JSON.stringify(['Buy milk', 'Write seed']) && c === 2;
    check(okk, `[5] filter active → [Buy milk, Write seed], count 2`,
      { texts: ['Buy milk', 'Write seed'], count: 2 }, { texts: t, count: c });
  }

  // 6. Filter completed
  await page.click('#filter-completed');
  {
    const t = await texts(), c = await count();
    const okk = JSON.stringify(t) === JSON.stringify(['Walk dog']) && c === 2;
    check(okk, `[6] filter completed → [Walk dog], count 2`,
      { texts: ['Walk dog'], count: 2 }, { texts: t, count: c });
  }

  // 7. Filter all
  await page.click('#filter-all');
  {
    const t = await texts();
    const okk = JSON.stringify(t) === JSON.stringify(['Buy milk', 'Walk dog', 'Write seed']);
    check(okk, `[7] filter all → all 3 in order`,
      { texts: ['Buy milk', 'Walk dog', 'Write seed'] }, { texts: t });
  }

  // 8. Delete index 1 (Walk dog, completed)
  await deleteAt(1);
  {
    const t = await texts(), c = await count(), n = (await items()).length;
    const okk = n === 2 && JSON.stringify(t) === JSON.stringify(['Buy milk', 'Write seed']) && c === 2;
    check(okk, `[8] delete index 1 → [Buy milk, Write seed], count 2`,
      { texts: ['Buy milk', 'Write seed'], count: 2 }, { texts: t, count: c, items: n });
  }

  // 9. Clear completed
  await toggleAt(0); // Buy milk -> completed
  const cAfterToggle = await count();
  await page.click('#clear-completed');
  {
    const t = await texts(), c = await count(), n = (await items()).length, flags = await completedFlags();
    const okk = cAfterToggle === 1 && n === 1 &&
      JSON.stringify(t) === JSON.stringify(['Write seed']) &&
      JSON.stringify(flags) === JSON.stringify(['false']) && c === 1;
    check(okk, `[9] clear completed → [Write seed] active, count 1`,
      { afterToggle: 1, texts: ['Write seed'], flags: ['false'], count: 1 },
      { afterToggle: cAfterToggle, texts: t, flags, count: c });
  }

  // 10. Persistence across reload
  await freshLoad();
  await addTask('alpha');
  await addTask('beta');
  await addTask('gamma');
  await toggleAt(1); // beta -> completed
  await reloadKeepStorage();
  {
    const t = await texts(), c = await count(), n = (await items()).length, flags = await completedFlags();
    const okk = n === 3 &&
      JSON.stringify(t) === JSON.stringify(['alpha', 'beta', 'gamma']) &&
      JSON.stringify(flags) === JSON.stringify(['false', 'true', 'false']) && c === 2;
    check(okk, `[10] persistence across reload → [alpha,beta,gamma], beta done, count 2`,
      { texts: ['alpha', 'beta', 'gamma'], flags: ['false', 'true', 'false'], count: 2 },
      { texts: t, flags, count: c, items: n });
  }

  await browser.close();

  const total = pass + fail;
  console.log('');
  if (fail === 0) {
    console.log(`VERIFY: ${pass}/${total} scenarios passed`);
    process.exit(0);
  } else {
    console.log(`VERIFY: ${pass}/${total} scenarios passed, ${fail} FAILED`);
    failures.forEach(f => console.log('FAIL' + f));
    process.exit(1);
  }
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
