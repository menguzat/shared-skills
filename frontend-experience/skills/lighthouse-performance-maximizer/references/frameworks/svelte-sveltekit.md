# Svelte / SvelteKit Notes

Inspect:

- SSR vs client-only paths;
- load function waterfalls;
- route chunking;
- eager heavy component imports;
- image/font delivery;
- browser-only initialization;
- third-party SDKs.

Keep initial route JS focused on immediately interactive behavior; lazy-load heavy feature code not needed for the first task.
