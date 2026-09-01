async function yieldToMain() {
  if ('scheduler' in window && typeof scheduler.yield === 'function') {
    await scheduler.yield();
    return;
  }
  await new Promise(resolve => setTimeout(resolve, 0));
}

export async function processItems(items) {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    result.push(expensiveStep(items[i]));
    if (i > 0 && i % 50 === 0) await yieldToMain();
  }
  return result;
}

// Measure. Yielding improves responsiveness but can increase total completion time.
