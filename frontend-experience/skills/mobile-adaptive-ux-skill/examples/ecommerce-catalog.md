# Example - Desktop Commerce Catalog to Mobile

This is an original illustrative scenario.

## Desktop
- mega-menu with 8 top-level categories
- left filter sidebar
- 4-column product grid
- quick actions appear on hover
- sort control in toolbar
- product opens as normal route

## Wrong conversion
- mega-menu hidden behind hamburger
- sidebar moved below product list
- grid becomes one column
- hover actions disappear

This technically responds to width but damages finding and filtering.

## Better compact model

### Header
- logo/back context
- prominent search
- cart/account as needed
- menu entry for hierarchy

### Product list
- result count/scope
- Filter and Sort actions
- applied-filter chips/summary
- two-column or one-column cards based on actual content density
- explicit quick action if it is truly high-value; otherwise remove it rather than recreating hover

### Filter state
- opens contextual sheet/full-screen panel based on complexity
- changes reflected in URL/query if appropriate
- Back closes filter state before leaving listing
- applied filters visible on list

### Detail return
- Back restores search/category, filters, sort, and list position where feasible

## Transformation Matrix excerpt

| Desktop | Transformation | Compact |
|---|---|---|
| Mega-menu | SUBSTITUTE | hierarchical menu/drill-down |
| Left filters | SUBSTITUTE | filter action + focused panel |
| Hover quick-add | SUBSTITUTE/REMOVE | visible action only if task priority supports it |
| 4-col grid | REFLOW | 1-2 columns based on card content |
| Sort toolbar | COMPRESS | explicit Sort action |
