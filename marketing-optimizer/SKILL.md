---
name: marketing-optimizer
description: Audit and optimize premium fashion/commerce funnels, positioning, buyer-risk models, conversion UX, and e-commerce architecture.
---

# Premium Fashion Commerce Optimization System

## 1. System structure

Create two separate but cooperating skills:

### Skill 1 — Premium Funnel Auditor & Fixer

Purpose:

* Examine an existing website and sales funnel
* Identify conversion, trust, positioning, usability and technical problems
* Prioritize problems by commercial importance
* Produce specific corrections
* Generate replacement copy, page structures, UX specifications, experiments and implementation instructions
* Optionally modify files or code when the user supplies them and permits editing

### Skill 2 — Premium Funnel Designer

Purpose:

* Design a new website, funnel or major redesign from the beginning
* Determine the correct buying journeys for each product and service type
* Create the information architecture, page system, conversion logic, trust system and content structure
* Produce wireframe-level specifications, component requirements, copy architecture and launch plans
* Avoid inheriting assumptions from conventional inventory-based ecommerce

Both skills should use the same shared:

* Discovery question engine
* Business-context schema
* Product taxonomy
* Buyer-risk model
* Ethical persuasion library
* Brand-positioning model
* Measurement and experimentation framework

The question engine is a shared module, not necessarily a third user-facing skill.

---

# 2. Commercial model the skills must support

The brand does not have one uniform sales funnel. It has at least four distinct commercial paths.

## A. Limited-production collections

The brand produces a limited quantity of predetermined designs.

Possible order states:

* In stock
* Available for preorder
* Production scheduled
* Sold out
* Waitlist available
* Private-order availability

Primary conversion:

* Purchase
* Reserve
* Join waitlist
* Request availability

Important customer questions:

* Is this genuinely limited?
* How many will be produced?
* Is my size available?
* When will it ship?
* Can it be altered?
* Can it be reordered later?
* What makes the piece worth its price?

## B. Made-to-order from an existing design

The design already exists, but no finished inventory is held.

The piece is produced after payment or deposit.

Primary conversion:

* Select design
* Select standard size or options
* Confirm material and color
* Place order
* Submit required information

Important customer questions:

* How long will production take?
* What can be customized?
* Is the design returnable?
* What happens when the fit is wrong?
* At what point can the order no longer be changed?
* Will the final piece look exactly like the photographed sample?

## C. Made-to-measure from an existing design

The customer chooses an existing model, which is adapted to their measurements and possibly their fit preferences.

Primary conversion:

* Choose model
* Choose options
* Complete measurement process
* Review order specification
* Pay deposit or full amount
* Approve final production

Important customer questions:

* How are measurements taken?
* Can somebody assist remotely?
* What happens if the customer measures incorrectly?
* Which dimensions can be modified?
* Is a fitting included?
* Are alterations included?
* What happens when body shape does not correspond to standard pattern assumptions?

## D. Special tailoring from a customer design or reference image

The customer submits a drawing, photograph or conceptual brief. The business evaluates it, creates or modifies a pattern, selects materials, cuts and produces the garment.

This is not a conventional product-page transaction. It is a qualified project funnel.

Primary conversion:

* Submit project
* Receive feasibility assessment
* Consult with designer or tailor
* Receive scope and quotation
* Approve design specification
* Pay development deposit
* Begin pattern and production process

Important customer questions:

* Can the submitted design be produced?
* How closely can it be reproduced?
* What information is needed?
* Who owns the resulting pattern?
* Can the brand reproduce the garment for another customer?
* How many revisions are included?
* What happens when the submitted reference contains impossible construction details?
* What are the estimated price range and delivery period?
* Is a toile, muslin or prototype included?
* Are fittings remote or physical?
* What constitutes approval?
* What is refundable?

The skills must never force these four services into the same generic “Add to cart” path.

---

# 3. Shared discovery and questioning engine

## Objective

The questioning system should gather only the information required for the current task.

It should:

* Ask questions progressively
* Ask one clear dimension at a time
* Avoid repeating previously answered questions
* Use evidence from the website, files and previous answers
* Distinguish facts from assumptions
* Mark missing information explicitly
* Allow “unknown” or “not decided”
* Explain the consequence of an unresolved decision when necessary
* Stop questioning when sufficient information exists to proceed
* Return to questioning later when a new dependency appears

## Question-selection logic

Before asking anything, the skill should determine:

1. What output is being requested?
2. What information is already available?
3. Which missing information materially changes the output?
4. Which question has the highest information value?
5. Can the question be deferred without damaging the current work?

Questions should not be asked merely because they exist in a questionnaire.

## Recommended interaction pattern

Use:

* Single-select questions for mutually exclusive decisions
* Multi-select questions for applicable business models or customer groups
* Short free-text questions for facts and examples
* Structured tables for product, pricing or market data
* File or URL requests when direct inspection is more reliable than description

Avoid:

* Asking the user to describe the entire business in one answer
* Asking several unrelated questions in one sentence
* Asking vague questions such as “What is your vision?”
* Forcing the user to answer low-impact questions before receiving useful work
* Asking questions that can be answered by inspecting supplied materials

## Confidence ledger

Every project profile should distinguish:

* **Confirmed:** directly stated or observed
* **Derived:** calculated or logically derived from confirmed information
* **Working assumption:** temporarily assumed for progress
* **Unknown:** information not available
* **Decision required:** the user must choose before implementation

The skill should never silently convert an unknown into a confirmed fact.

---

# 4. Shared project profile

Both skills should read and update a single structured profile.

## Business

* Brand name
* Company location
* Sales territories
* Languages
* Currencies
* Tax and duty handling
* Current platform
* Team size
* Production capacity
* Customer-service capacity
* Tailoring and pattern-development capacity

## Brand positioning

* Premium, luxury, artisanal, fashion-led, technical or hybrid
* Heritage-led or innovation-led
* Minimal, expressive, avant-garde, classical or another aesthetic position
* Primary brand values
* Desired customer perception
* Competitors and reference brands
* Position on discounts
* Position on exclusivity
* Tone and terminology restrictions

## Product models

For each category:

* Limited production
* Preorder
* Made-to-order
* Made-to-measure
* Full bespoke
* Custom-from-reference
* Accessories
* Services
* Samples or consultations

## Pricing

* Minimum and maximum price
* Typical order value
* Deposit structure
* Remaining-payment timing
* Consultation fees
* Pattern-development fees
* Revision fees
* Rush fees
* Alteration costs
* Shipping, tax and duty treatment

## Production

* Normal production time
* Maximum production capacity
* Material availability
* Production-slot management
* Revision stages
* Fitting stages
* Quality-control process
* Packaging
* Shipping
* Alteration and remake rules

## Customer

* Primary customer segments
* Purchase motivations
* Common objections
* Prior experience with custom clothing
* Geographic distribution
* Measurement confidence
* Purchase urgency
* Self-purchase versus gifting
* Professional, ceremonial or everyday use

## Evidence and assets

* Product photography
* Detail photography
* Video
* Process footage
* Tailor or designer profiles
* Material documentation
* Pattern-development examples
* Testimonials
* Reviews
* Press
* Certifications
* Delivery evidence
* Before-and-after fit examples

## Data

* Traffic
* Traffic sources
* Product views
* Add-to-cart events
* Form starts
* Form completions
* Consultation bookings
* Quote acceptance
* Deposit payments
* Full payments
* Production cancellations
* Returns
* Alterations
* Remakes
* Repeat orders
* Customer-service questions

---

# 5. Skill 1: Premium Funnel Auditor & Fixer

## Operating modes

The auditor should support four modes.

### Rapid audit

Used when the user wants immediate findings.

Output:

* Most serious problems
* Most commercially valuable corrections
* Critical trust and usability failures
* Immediate implementation list

### Full funnel audit

Used for a systematic examination.

Output:

* Funnel map
* Page-by-page findings
* Product-model-specific findings
* Prioritized repair program
* Experiment backlog
* Tracking requirements

### Page or flow audit

Used for one page or journey:

* Homepage
* Collection page
* Product page
* Made-to-order flow
* Measurement flow
* Bespoke submission flow
* Consultation booking
* Checkout
* Post-purchase flow

### Fix implementation mode

Used after the diagnosis.

Output may include:

* Replacement copy
* Revised page hierarchy
* New forms
* Component specifications
* Wireframe descriptions
* Tracking plans
* Technical tickets
* Code modifications
* Test variants

The skill should not rewrite the entire site before identifying which parts are actually responsible for uncertainty or abandonment.

---

# 6. Auditor workflow

## Step 1 — Establish the commercial objective

Examples:

* Increase limited-collection sales
* Increase made-to-order completion
* Increase qualified bespoke inquiries
* Reduce low-quality custom requests
* Increase quote acceptance
* Reduce measurement errors
* Reduce returns and remakes
* Increase average order value
* Improve international conversion

## Step 2 — Identify the relevant product journey

The auditor first determines whether it is examining:

* Immediate purchase
* Preorder
* Made-to-order
* Made-to-measure
* Bespoke inquiry
* Appointment
* Quote and deposit
* Repeat purchase

## Step 3 — Collect evidence

Depending on access:

* Inspect public website
* Inspect supplied screenshots or recordings
* Read analytics
* Read search terms
* Read customer-service conversations
* Review abandoned forms
* Review order data
* Review return and alteration reasons
* Examine mobile and desktop journeys

## Step 4 — Diagnose the funnel

Each relevant stage is audited under the following areas.

### Positioning clarity

* Is the brand category understandable?
* Is the price level psychologically prepared?
* Is the difference between services clear?
* Is craftsmanship translated into customer value?
* Does the website appear premium without becoming vague?

### Buying-route clarity

* Can the visitor distinguish ready, preorder, made-to-order, made-to-measure and bespoke?
* Does each route have a distinct next action?
* Are incompatible routes mistakenly combined?

### Desire construction

* Does the site create a coherent identity and use context?
* Can the buyer imagine wearing or owning the garment?
* Are the designs shown on relevant bodies and in relevant environments?
* Is the product visually differentiated from lower-priced alternatives?

### Risk reduction

* Fit
* Material
* Color
* Construction
* Delivery
* Alterations
* Returns
* Remakes
* Authenticity
* Payment
* International shipping
* Duties
* Privacy of submitted images and measurements

### Proof

* Craftsmanship proof
* Process proof
* Material proof
* Fit proof
* Customer proof
* Professional authority
* Named people responsible for the work
* Evidence of previously completed projects

### Friction

* Navigation
* Mobile usability
* Form length
* Measurement burden
* Account requirements
* Upload problems
* Appointment availability
* Payment limitations
* Unclear next steps
* Missing response-time expectations

### Price communication

* Is the final price visible where it can be fixed?
* Is a reliable range shown where the final price depends on scope?
* Are deposits and development fees explained?
* Are customers surprised by later costs?
* Are price anchors legitimate and useful?
* Are product tiers meaningfully differentiated?

### Psychological integrity

* Is scarcity factual?
* Is urgency operationally justified?
* Are testimonials verifiable?
* Are defaults fair?
* Are refusal and cancellation paths understandable?
* Is personalization based on permission?

### Technical and machine comprehension

* Product structured data
* Variant relationships
* Image information
* Product naming consistency
* Material and measurement data
* Shipping and return information
* Indexable explanatory content
* Performance
* Mobile rendering
* Analytics coverage

## Step 5 — Score the findings

Each issue receives:

* Severity
* Revenue impact
* Customer-risk impact
* Brand impact
* Confidence in diagnosis
* Implementation effort
* Dependency
* Recommended timing

Suggested priority formula:

**Priority = commercial impact × confidence × customer benefit ÷ effort**

Brand and legal risks should be able to override the numeric score.

## Step 6 — Produce repairs

Each repair should include:

* Problem
* Evidence
* Affected audience
* Underlying mechanism
* Proposed correction
* Example implementation
* Required assets
* Effort
* Expected metric
* Guardrail metric
* Test method
* Risks

## Step 7 — Re-audit the proposed fix

Before delivering a change, the skill checks:

* Does it contradict the brand position?
* Does it create a new ambiguity?
* Does it make an unverifiable claim?
* Does it introduce false urgency?
* Does it reduce customer control?
* Does it damage another commercial path?
* Does it work on mobile?
* Can its effect be measured?

---

# 7. Skill 2: Premium Funnel Designer

## Operating modes

### New brand or new website

Design the complete commercial system.

### Existing brand redesign

Preserve useful existing brand equity while replacing the funnel architecture.

### New product-model launch

Examples:

* Introducing made-to-measure
* Introducing bespoke projects
* Introducing limited drops
* Introducing international orders
* Introducing remote fittings

### New campaign or collection

Design a temporary acquisition and sales system without rebuilding the entire website.

---

# 8. Designer workflow

## Step 1 — Create the commercial strategy brief

The skill determines:

* What is being sold?
* To whom?
* At what price?
* Through which order model?
* What prevents purchase?
* What production limits exist?
* What customer action represents success?
* What should not be automated?

## Step 2 — Design separate buying journeys

The site should contain clearly separated routes.

### Route 1: Shop limited collection

Typical flow:

Collection → Product → Size and availability → Delivery information → Purchase or reservation

### Route 2: Made to order

Typical flow:

Choose design → Select available options → Understand production period → Select size → Confirm policy → Purchase

### Route 3: Made to measure

Typical flow:

Choose design → Choose fit options → Select measurement method → Submit measurements → Review specification → Pay → Production updates

### Route 4: Special tailoring

Typical flow:

Understand service → Review examples → Check approximate price and suitability → Submit reference → Feasibility review → Consultation → Scope and quote → Deposit → Development

The site may have a common visual system, but the conversion architecture must remain distinct.

## Step 3 — Create the page inventory

Possible pages:

* Homepage
* Collection index
* Collection story
* Product page
* Made-to-order explanation
* Made-to-measure explanation
* Measurement guide
* Measurement assistance booking
* Special-tailoring service
* Custom-project submission
* Process page
* Craftsmanship page
* Materials page
* Fit and alterations page
* Delivery page
* Returns and cancellation page
* Journal or editorial pages
* Customer project archive
* Designer and tailor profiles
* Consultation booking
* Client account
* Saved designs
* Order and production tracking
* Care, repair and reorder page

Not every brand needs every page. The skill should derive the page inventory from the business model.

## Step 4 — Build the persuasion architecture

The designer should use behavioral mechanisms as controlled design tools.

### Identity congruence

Help the visitor understand what kind of person, practice, occasion or aesthetic the garment supports.

### Mental simulation

Use:

* Full-body imagery
* Movement
* Multiple body types
* Detail views
* Material behavior
* Styling contexts
* Occasion contexts
* Personalized configurations

### Uncertainty reduction

Resolve the most expensive uncertainties before asking for commitment.

### Authority

Show the competence of the people responsible for:

* Design
* Pattern
* Fitting
* Material selection
* Cutting
* Construction
* Quality control

### Commitment and continuity

Allow customers to:

* Save a design
* Save measurements
* Create a project brief
* Resume later
* Share a design
* Book a consultation
* Approve stages progressively

### Endowment through personalization

A saved configuration or project should help the customer perceive the garment as becoming specifically theirs.

The skill must not fabricate a completed personalized product before feasibility has been confirmed.

### Ethical anchoring

Use real distinctions between:

* Standard made-to-order
* Made-to-measure
* Pattern modification
* Full bespoke development

The higher price should correspond to understandable additional work, expertise or service.

### Factual scarcity

Scarcity may be based on:

* Material quantity
* Production slots
* Edition size
* Seasonal access
* Artisan capacity

The source of scarcity must be stated accurately.

## Step 5 — Define the trust system

For this business, trust should not be limited to testimonials.

The site may need:

* Exact description of the process
* Named responsible people
* Real workshop imagery
* Pattern-development examples
* Construction close-ups
* Material sources
* Completed customer projects
* Fit correction examples
* Review and approval stages
* Communication expectations
* Delivery ranges
* Alteration rules
* Cancellation rules
* Privacy treatment of measurements and reference images
* Intellectual-property terms for submitted designs
* Payment protection and invoicing information

## Step 6 — Define interaction components

Possible components:

* Design selector
* Material selector
* Color selector
* Fit-preference selector
* Measurement-method selector
* Measurement guide
* Photo or reference uploader
* Project qualification form
* Production-slot display
* Consultation scheduler
* Quote viewer
* Specification approval
* Deposit payment
* Order timeline
* Production update system
* Alteration request
* Reorder from saved pattern

## Step 7 — Design the measurement experience

Measurement should be treated as a major conversion and operational system.

Possible pathways:

* Standard size
* Customer-submitted measurements
* Guided remote measurement
* Video consultation
* In-person fitting
* Measurements from an existing garment
* Existing saved customer pattern

The interface should make the responsibility model explicit.

Examples:

* Measurements supplied without assistance
* Measurements verified in consultation
* Final garment adjusted after fitting
* Certain alterations included
* Certain corrections charged separately

The system should record:

* Who supplied each measurement
* Measurement date
* Measurement method
* Garment ease preference
* Posture or asymmetry notes
* Approval state
* Changes since previous order

## Step 8 — Design the special-tailoring qualification funnel

The submission form should collect enough information for feasibility without exhausting the applicant.

Initial submission:

* Reference image or drawing
* Garment type
* Intended use
* Required date
* Approximate budget range
* Customer location
* Existing measurements or fitting availability
* Desired degree of fidelity
* Requested materials, when known

After preliminary qualification:

* Detailed construction questions
* Material alternatives
* Pattern-development requirements
* Number of fittings
* Prototype requirements
* Revision limits
* Production schedule
* Intellectual-property conditions
* Quotation

The customer should understand that submitting an image is a request for evaluation, not an automatic production promise.

## Step 9 — Design lifecycle communication

High-value custom orders need a post-payment funnel.

Possible stages:

1. Order accepted
2. Measurements received
3. Measurements reviewed
4. Materials confirmed
5. Pattern preparation
6. Prototype or toile
7. Customer approval
8. Cutting
9. Construction
10. Quality control
11. Final fitting or review
12. Shipping
13. Alteration period
14. Care and reorder

Not every order needs every stage.

The customer should see the next action, responsible party and expected timing.

## Step 10 — Create measurement and experiment plans

The designer should specify analytics before launch.

Separate metrics by funnel.

### Limited collection

* Product-view-to-cart
* Reservation rate
* Checkout completion
* Full-price sell-through
* Waitlist conversion

### Made-to-order

* Configuration completion
* Production-time acceptance
* Order completion
* Cancellation before production
* Return or alteration rate

### Made-to-measure

* Measurement-flow completion
* Consultation booking
* Measurement correction rate
* Production approval
* Alteration and remake rate
* Repeat order using saved measurements

### Special tailoring

* Submission start
* Submission completion
* Qualified-project rate
* Consultation attendance
* Quote acceptance
* Deposit payment
* Revision count
* Project profitability
* Delivery accuracy
* Repeat bespoke work

---

# 9. Shared ethical persuasion library

The skills may recommend:

* Identity-aligned storytelling
* High-quality process evidence
* Human-scale and movement imagery
* Relevant authority
* Verified social proof
* Transparent price architecture
* Real production scarcity
* Permission-based personalization
* Saved projects and configurations
* Clear risk reduction
* Consultative assistance
* Transparent comparison of service levels
* Post-purchase anticipation and progress updates

The skills should reject:

* Fake countdowns
* Fabricated viewing activity
* Invented low-stock messages
* False waitlists
* Permanent “limited” offers
* Hidden development fees
* Suppressed return restrictions
* Preselected paid upgrades
* Misleading price comparisons
* Unexplained use of customer photos
* Pressure based on inferred financial or emotional vulnerability
* Claims that cannot be proven

---

# 10. How the two skills cooperate

## Shared context handoff

After either skill asks a question, the answer is written into the shared project profile.

Example:

* The designer establishes that made-to-measure orders require a 50% deposit.
* The auditor later reads that confirmed policy.
* The auditor does not ask about the deposit again.
* It checks whether the existing website communicates it correctly.

## Designer-to-auditor loop

1. Designer creates funnel specification.
2. Website is implemented.
3. Auditor compares implementation against specification.
4. Auditor identifies deviations and live-data problems.
5. Fixer creates corrections.
6. Experiment results update the shared knowledge.

## Auditor-to-designer loop

1. Auditor discovers that visitors cannot distinguish made-to-order and made-to-measure.
2. Fixing one page is insufficient.
3. Auditor creates a redesign brief.
4. Designer rebuilds service architecture and navigation.
5. Auditor validates the new system.

---

# 11. Recommended outputs

## Auditor & Fixer deliverable

### Executive diagnosis

* Commercial objective
* Relevant journey
* Main constraints
* Highest-priority problems

### Funnel map

* Current journey
* Break points
* Missing paths
* Conflicting paths

### Findings table

For every finding:

* Location
* Problem
* Evidence
* Affected customer
* Commercial effect
* Brand effect
* Recommended change
* Priority
* Confidence

### Fix package

* Replacement copy
* Revised hierarchy
* Component changes
* Form changes
* Technical requirements
* Tracking changes
* Experiment proposal

### Implementation order

* Immediate
* Next release
* Structural redesign
* Later experiment

## Funnel Designer deliverable

### Strategy

* Product and service taxonomy
* Customer segments
* Brand and value architecture
* Commercial constraints

### Funnel system

* Journey map
* Conversion goals
* Qualification rules
* Human-assistance points
* Payment stages

### Website architecture

* Sitemap
* Navigation
* Page inventory
* Page relationships

### Page specifications

For each page:

* Objective
* Audience
* Required sections
* Required proof
* Primary action
* Secondary action
* Data requirements
* Mobile behavior

### Component system

* Product cards
* Service cards
* Configurators
* Measurement tools
* Uploaders
* Consultation components
* Quote components
* Order-status components

### Content requirements

* Photography
* Video
* Process documentation
* Customer examples
* Policy content
* Material content
* Measurement content

### Launch and testing plan

* Analytics events
* Baseline metrics
* Experiments
* Guardrails
* Audit schedule

---

# 12. Initial question flow

The skills should begin with a compact classification sequence.

## Common opening questions

1. What are we designing or auditing?
2. Which sales models are active?
3. Which product or service is the priority?
4. What is the primary customer action?
5. Which countries are being sold to?
6. What platform and assets are available?

## Auditor-specific next questions

1. What performance problem is currently visible?
2. What data is available?
3. Which customer questions occur repeatedly?
4. Where do customers currently abandon?
5. What changes can the skill directly implement?

## Designer-specific next questions

1. What must the brand be known for?
2. Which customer is the first design priority?
3. What can be purchased directly?
4. What requires human review?
5. What production and fitting constraints shape the funnel?
6. Which policies are already decided?

The agent should then branch into relevant questions rather than complete a fixed questionnaire.

---

# 13. Recommended implementation structure

```text
marketing-optimizer/
│
├── SKILL.md                          # Shared system architecture & strategy
│
├── templates/
│   ├── funnel-contract.schema.json   # Declarative contract JSON Schema
│   └── funnel-contract-example.json  # Reference implementation example
│
├── scripts/
│   ├── package.json                  # Script execution configuration
│   ├── funnel-preflight.mjs          # Playwright-driven layout and safety QA
│   ├── gemini-funnel-critique.mjs    # Multimodal design/copy audit
│   └── tracking-interceptor.mjs      # Telemetry / analytics event assertion
│
├── shared/
│   ├── context-schema
│   ├── question-engine
│   ├── product-models
│   ├── persuasion-library
│   ├── ethics-rules
│   ├── scoring-model
│   └── analytics-events
│
├── auditor-fixer/
│   ├── audit-workflow
│   ├── audit-checklists
│   ├── evidence-collection
│   └── prioritization
│
└── funnel-designer/
    ├── discovery-workflow
    ├── journey-designer
    └── information-architecture
```

---

# 14. Core governing principle

The system should optimize for:

**Desire × confidence × suitability × decision ease**

while respecting:

* Production reality
* Customer autonomy
* Brand position
* Long-term trust
* Operational profitability

For custom fashion, increasing the number of inquiries is not automatically an improvement.

The better objective is:

> Increase the number and conversion rate of suitable, informed and commercially viable customers while reducing avoidable uncertainty, production errors, remakes, cancellations and low-quality custom requests.

---

# 15. Automated Funnel Preflight & Verification Suite

To guarantee conversion integrity, the system implements a programmatic preflight & review layer using headless automation and multimodal models.

## A. Viewport and Layout Preflight (`funnel-preflight.mjs`)
Verifies page responsiveness, mobile typography compliance, and tap-target usability.

**Checks performed:**
* **Viewport Overflow Check:** Ensures `window.innerWidth >= document.documentElement.scrollWidth` at each target width (e.g. mobile 390px vs desktop 1440px) to prevent layout breakages.
* **Tap Target Sizing (WCAG 2.1 AA):** Verifies that all clickable elements (`button`, `a`, `input`, custom selects) possess bounding dimensions of at least `44x44px` to eliminate mobile navigation frustration.
* **Text Readability Linter:** Checks that active reading text (paragraphs, labels, items) does not drop below the declared threshold (typically `16px` on mobile screens).
* **Network & Console Check:** Intercepts and flags broken local assets (broken image references, stylesheet failures) and JS console errors.
* **Copywriting Slop Scan:** Scans body elements to filter and ban generic AI jargon (e.g., 'unlock', 'delve', 'tapestry') violating the premium narrative standard.

**Usage:**
```bash
node scripts/funnel-preflight.mjs <url> <path-to-contract.json>
```

## B. Multimodal Copywriting & Visual Critique (`gemini-funnel-critique.mjs`)
Uses the `gemini-flash-latest` model to analyze mobile/desktop screenshots alongside page HTML, grading elements from a CRO, Copywriting, and Premium Art Direction perspective.

**Criteria graded:**
* **Premium Identity Alignment:** Evaluates composition spacing, typography hierarchies, and imagery choices against the brand level (e.g., *artisanal-luxury*).
* **Craftsmanship Proof:** Audits if process evidence (workshops, hand-crafting, pattern development) is clearly communicated.
* **Ethics and Tone Check:** Ensures copywriting is persuasive yet respects the customer's autonomy without resorting to false urgency or manipulative patterns.

**Usage:**
```bash
# Load from the skills repository root .env file, or export it manually:
export GEMINI_API_KEY="your-key-here"
node scripts/gemini-funnel-critique.mjs <url> <path-to-contract.json> [output-dir]
```

## C. Telemetry Network Interceptor (`tracking-interceptor.mjs`)
Runs programmatic user simulations (clicks, form inputs, submissions) and intercepts outbound telemetry packages (Google Analytics, Meta Pixel, custom events) to confirm crucial tracking events are properly dispatched.

**Usage:**
```bash
node scripts/tracking-interceptor.mjs <url> <path-to-contract.json> [click-targets]
```

