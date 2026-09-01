# QA Checklist

Test at minimum: 320, 360, 390, 430 CSS px plus one medium width.

## Shell
- [ ] primary navigation visible/understandable
- [ ] current destination indicated
- [ ] menu closes correctly
- [ ] long destination labels handled
- [ ] bottom navigation does not overlap content
- [ ] safe-area padding verified

## Content
- [ ] headings wrap without collision
- [ ] images/media preserve intended crop/focus
- [ ] cards do not become absurdly tall due to desktop metadata
- [ ] tables have an intentional compact strategy
- [ ] no clipped controls

## Interaction
- [ ] touch targets not crowded
- [ ] hover-only paths eliminated
- [ ] destructive actions separated/confirmed appropriately
- [ ] sheets/dialogs have clear dismissal
- [ ] gesture alternatives present where needed

## History
- [ ] Back from detail restores parent context
- [ ] Back from filter/sort/menu behaves as expected
- [ ] forward navigation remains coherent
- [ ] refresh on nested state behaves deliberately

## Forms
- [ ] software keyboard does not cover required control
- [ ] input keyboard type is appropriate
- [ ] autocomplete works where expected
- [ ] errors remain visible and understandable
- [ ] focus is not lost after dynamic validation

## Accessibility
- [ ] keyboard navigation still possible on responsive site
- [ ] focus indicator not clipped
- [ ] 200% zoom spot check
- [ ] reduced motion
- [ ] screen-reader names for icon buttons

## Performance
- [ ] important route remains responsive under interaction
- [ ] no duplicate heavy content hidden by CSS
- [ ] responsive images
- [ ] no avoidable layout shift
