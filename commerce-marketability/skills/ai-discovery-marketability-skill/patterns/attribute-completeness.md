# Pattern: Attribute Completeness by Decision Value

Do not maximize field count blindly. Prioritize fields that affect real qualification decisions.

Procedure:
1. extract constraints from query/decision graph,
2. map each constraint to an attribute,
3. mark attribute `KNOWN / UNKNOWN / NOT-APPLICABLE`,
4. mark volatility `STATIC / PERIODIC / REAL-TIME`,
5. choose source of truth,
6. expose in visible content,
7. mirror in applicable structured feed/schema,
8. assign update owner.

High-decision-value unknowns are content/data defects even if conventional page copy looks complete.
