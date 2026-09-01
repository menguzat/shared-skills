# Example - Three-Pane Dashboard to Mobile

This is an original illustrative scenario.

## Desktop
- left project navigation
- center record list
- right detail inspector
- toolbar actions across the top

## Wrong conversion
Stack all three panes vertically:
1. project navigation
2. hundreds of records
3. inspector

The user loses context and has to scroll enormous distances.

## Compact architecture

Primary navigation:
- Projects
- Search
- Activity
- Account

Within Projects:
1. project list
2. record list
3. record detail
4. inspector/action subview only when needed

Top app bar changes contextually:
- list: project title + search/filter
- detail: back + record title + high-value action + overflow

State:
- project and record routes are URL-addressable
- filter/query state survives record detail -> Back
- inspector may be a subroute if it is substantial, or a sheet if short and contextual

Desktop layout remains multi-pane at larger widths.

This is a SEQUENCE transformation, not REFLOW.
