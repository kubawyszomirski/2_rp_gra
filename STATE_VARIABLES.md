# State Variable Inventory

## Purpose and method

A Dendry **quality** is a persistent game-state value. In embedded JavaScript,
qualities are properties of `Q` (`Q.resources`); in Dendry conditions and text,
the same value appears by name (`resources >= 2`). Scenes can read qualities to
show cards, events, choices, and text, or write them on arrival/departure.
Qdisplays convert numeric qualities into phrases, and the browser serializes
the state for saves.

Most baseline values are initialized in `root.start` in
`source/scenes/root.scene.dry`. Other values are created only when an event or
calculation first needs them. Dendry-generated condition code generally treats
an absent value as false/zero, but embedded JavaScript does not always make the
same fallback explicit. A new value should therefore be initialized unless a
verified lifecycle requires otherwise.

Changing a name can break distant systems because state is shared and because
several families are built from strings. For example, `post_event` combines a
class and party to access `<class>_<party>`, while election code constructs
`old_<party>_r` and `<party>_r_disp`. A search for one literal spelling does not
find every dynamic reader.

### Audit method and count

- All 167 files under `source/` were read: 158 scene files, eight qdisplay
  files, and `source/info.dry`.
- The original baseline audit identified 989 literal or constructible `Q`
  keys. The approved population slice adds 58 identifiable keys: two group
  weights, two quality-of-life placeholders, and two 27-key raw/normalized/
  display class-party families (including SAPD).
- The current expanded inventory is therefore **1,047 identifiable state
  keys**. It includes keys that a dynamic loop can access even if their value
  is absent and consequently behaves as false/zero.
- JavaScript locals such as `party`, `class_votes`, and `candidate_votes` are
  not qualities and are excluded.
- Dendry engine state such as the current hand, visit counts, and current scene
  is persistent runtime state but is not included in the 934 source-quality
  keys.

This is a static evidence inventory. “Appears unread” and “not initialized” do
not prove a defect; dynamic access, runtime code, and route ordering must be
considered. Where behavior remains uncertain, it is labelled **UNCLEAR —
requires code investigation or runtime testing.**

## How to read the contracts

Each table covers the requested fields in compact form:

- **Type / initialization / range** gives the inferred type, where the value is
  first assigned, its initial value, and only ranges or enumerations evidenced
  by source.
- **Writers / readers / display** names representative source files/scenes when
  the complete set is large and notes qdisplay/UI use.
- **Dependencies / kind** states which systems rely on it and whether it is
  persistent simulation state, an event flag, or temporary control/display
  state.
- **Thresholds / uncertainty** records invariants, boundary values, and naming
  or lifecycle risks.
- Every row carries an adaptation field. Approved decisions are recorded
  directly; unresolved fields remain **TBD — user decision required.**

## Time and turn state

| Exact name | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `started` | Number used as boolean; `root.start`, `0` before start and `1` on start | Written/read in `source/scenes/root.scene.dry`; controls start menu vs game | Root routing; persistent control state | Must be set before normal loop | TBD — user decision required. |
| `time` | Integer month counter; `root.start`: `1`; increases by one per spent-action reconciliation | Written in `source/scenes/post_event.scene.dry`; read by cards/events including the government-deck gate | Calendar, events, elections; persistent simulation state | Government deck uses `time >= 6`; relationship to month/year must remain consistent | Retain `1` as the opening relative-time value unless the Polish calendar audit identifies a conflict. |
| `year` | Integer; current `root.start`: `1922`; increments at month rollover | `post_event` and dated event conditions; shown in status | Calendar, events, ending; persistent simulation state | Month 13 resets to 1 and increments year; retained absolute-year German events begin in 1928 and campaign-end events begin in 1934 | Implemented as `1922`. German date gates retain their existing years until researched Polish replacements are approved. |
| `month` | Integer; current `root.start`: `1`; normal values 1–12 | Written by `post_event`; read by scheduled events/elections; `source/qdisplays/month.qdisplay.dry` | Calendar and all scheduled content; persistent simulation state | Must remain 1–12 after reconciliation | Implemented as `1`, representing January. |
| `month_actions` | Integer control count; `root.start`: `0`; most action cards add one | Written throughout party/government scenes and reset by `post_event`; no direct qdisplay | Determines whether time advances; temporary turn control persisted in saves | `>= 1` advances exactly one month; discard/cancel paths subtract one | TBD — user decision required. |
| `timers` | Array of timer base names; initialized in `root.start` | Read by the decrement loop in `post_event`; not directly shown | All card/event cooldowns; persistent configuration state | A `<base>_timer` omitted from this array does not use central decrement | TBD — user decision required. |
| `*_timer` | Nonnegative integer months by convention; many explicit zeros in `root.start`, others created later | Written by matching cards/events; read in `view-if`/choices and decremented in `post_event`; usually player sees availability, not the number | Hand eligibility, events, advisers; persistent cooldown state | Positive values decrement; most cards treat zero/absent as available; inconsistent initialization is a risk | TBD — user decision required. |
| `next_election_year`, `next_election_month`, `next_election_time` | Integers; initialized to May 1928 and relative month `77` in `root.start`; regular election code advances the year by four | Written/read in `source/scenes/events/election_1928.scene.dry`; event date is player-facing | Election scheduling; persistent simulation state | January 1922 is `time = 1`, so May 1928 is `time = 77`; the month/year pair and relative counter must agree | Retain May 1928 only as an interim German-baseline schedule. The first Polish election remains **TBD — historical research required**. |

## Resources and action economy

| Exact name | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `resources` | Integer-like party currency; fixed `root.start`: `2` | Many party/adviser cards spend/add it; shown in status | Party actions, organizations, advisers; persistent simulation state | Costs are embedded across scenes; no demonstrated global min/max | TBD — user decision required. |
| `dues` | Integer-like recurring fundraising capacity; fixed `root.start`: `2` | `source/scenes/party_affairs/fundraising.scene.dry` and initialization; player-facing through resource outcomes/status | Resource income; persistent simulation state | Full runtime range is not established | TBD — user decision required. |
| `budget` | Numeric government fiscal capacity/balance; fixed `root.start`: `4` | Government/economic/fiscal scenes and `post_event`; shown in status | Policy access, inflation feedback, capital strike; persistent simulation state | Negative is legal; `post_event` bands at 0, -2, and -5 alter inflation | TBD — user decision required. |
| `difficulty` | Legacy integer compatibility field; fixed to `0` in `root.start` | Initialized in root and still read by dormant legacy branches or imported content; no player selection | Save/mod compatibility; persistent configuration state | New games must leave it at `0`, the former Normal value | Keep fixed at `0` for compatibility; do not expose a difficulty selection. |
| `historical_mode` | Legacy boolean-like compatibility field; fixed to `0` in `root.start` | Initialized in root and still read by dormant legacy/runtime gates; no player selection | Save/mod compatibility; persistent configuration state | New games must leave it false so saves, polls, and normal event choices remain available | Keep false; do not expose a historical mode, and retain saves and polls. |
| `last_advisor_action`, `last_cabinet_action` | ID/false-like temporary markers; initialized/reset to `0` | Adviser/cabinet actions write; cancellation and `post_event` read/reset | Pinned-card rollback; temporary control state | Must identify the card whose action can be cancelled; type varies between zero and identifiers | TBD — user decision required. |

## Elections and parliamentary state

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `parties` | Array; nine semantic Polish IDs in `root.start`: `kpp`, `pps`, `npr`, `psl_wyzwolenie`, `psl_piast`, `pschd`, `zln`, `minorities_bloc`, `other` | Read by support/election/post-event/game-over loops and charts | Defines active electoral state; persistent configuration/simulation state | Adding/removing/reordering requires initialization, formulas, UI, colors, records and saves to agree | Implemented. Inactive German IDs must not be pushed into this array; the old SAPD event is gated out for Polish games. |
| `player_party`, `polish_party_system`, `party_names`, `party_colors` | Semantic player ID, feature flag, and ID→display maps initialized in root | Election, Library/chart and compatibility code read | Polish party configuration and UI | Keys must cover every member of `parties` | Implemented for the opening-party slice. |
| `legacy_party_map` | Object initialized as `spd`→`pps`, `kpd`→`kpp`, `dvp`→`pschd`, `dnvp`→`zln` | `post_event` and `election_algorithm` transfer deltas; inherited scenes write legacy families | Compatibility layer; persistent transitional state | Transfer bases must be refreshed after each transfer to prevent duplicate effects | Implemented narrowly; no mapping is inferred for Zentrum, DDP or NSDAP. |
| `<party>_normalized` | Fraction number, normally 0–1; calculated by `post_event`/`election_algorithm` | Written in those calculators; read by presidential election, UI/charts, and events | Vote shares, candidate aggregation, achievements; derived persistent state | Party fractions should sum approximately to 1; division denominator must be nonzero | TBD — user decision required. |
| `<party>_votes`, `<party>_votes_dec`, `<party>_votes_disp`, `<party>_votes_display` | Numeric and formatted derived variants; calculators assign rounded values | Election/post-event writers; election narrative/status readers | Player-facing vote representation and downstream election state; derived/display state | Similar suffixes have different rounding/format; `use_decimals` is TODO | TBD — user decision required. |
| `<party>_r`, `<party>_r_disp` | Numeric parliamentary percentage and formatted version; initial base values in `root.start`, recalculated on election | Election writer; coalition formulas, parliament D3, endings, and narrative readers | Seats/proxy, coalitions, UI; persistent election result | Qualifying results are renormalized; source commonly treats percentages as seats proxy | TBD — user decision required. |
| `old_<party>_r`, `change_<party>_r`, `str_change_<party>` | Prior numeric result, numeric delta, formatted signed delta; initialized/calculated in root/election | Election code writes/reads; result screen displays | Election comparison; persistent/display-support state | Must update as one family before overwriting current result | TBD — user decision required. |
| `electoral_threshold` | Numeric percent; `root.start`: `0` | Constitutional-policy writers; election filter reader; policy/result presentation | Election inclusion and coalition totals; persistent rule state | Party is removed when votes are below threshold; “other” has special handling above 1 | TBD — user decision required. |
| `kpd_banned`, `nsdap_banned` and dynamic `<party>_banned` reads | Number used as boolean; explicit two-party flags initialized `0` | Constitutional/institutional scenes write; election loop dynamically reads for every party | Election eligibility; persistent rule/flag state | Only two explicit base flags are evidenced; absent dynamic keys act false in compiled conditions | TBD — user decision required. |
| `n_elections` | Integer counter; initialized in `root.start` | Election event increments; events/endings may read | Campaign progress and conditional content; persistent simulation state | Increment once per completed election | TBD — user decision required. |
| `largest_party`, `has_majority`, `any_majority`, `pass_threshold` | String/boolean-like helpers, assigned during election/government logic | Election and presidential-election code; coalition menus/narrative | Government formation; temporary/derived persistent control state | Recompute after each relevant result; lifecycle outside election is not uniformly documented | TBD — user decision required. |
| Inherited German coalition totals (`weimar_coalition`, `grand_coalition`, `bourgeois_coalition`, `center_right_coalition`, `right_coalition`, `far_right_coalition`, `left_coalition`, `popular_front_coalition`, `anti_democratic_coalition`, `neo_weimar_coalition`, `hitler_right_coalition`, `progressive_coalition`) | Numeric compatibility values in the retained German election branch | Inactive German result/government scenes write/read | Legacy compatibility only for Polish games | The active Polish election no longer routes through these formulas | Preserve until the remaining German event/government routes are replaced; do not use them as Polish coalition state. |
| `election_records` | Array of dated result objects; `root.start`: `[]` | Election code appends; `source/scenes/library.scene.dry`/D3 reads | Election history chart; persistent display-support state | Object keys must match party IDs and chart configuration | TBD — user decision required. |

## Party support and factions

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `classes` | Array of seven active IDs initialized in `root.start`: `workers`, `old_middle`, `new_middle`, `rural`, `bourgeois_landowners`, `unemployed`, `national_minorities` | Support/election/game-over loops read; Library displays Polish labels | Defines demographic dynamic keys; persistent configuration state | Every member requires a weight and a nonzero party-propensity row; `catholics` is deliberately absent | Implemented for new games; old-save migration is out of scope. |
| `workers`, `old_middle`, `new_middle`, `rural`, `bourgeois_landowners` | Numeric main-class shares; root: `27`, `110/9`, `50/9`, `53`, `20/9` | `post_event` updates `workers`/`rural`; support loops weight every field | Five-class structure and elections; persistent simulation state | Total is exactly 100; `workers` rises and `rural` falls linearly by three points over month indexes 0–215; other shares remain fixed | Implemented. December 1939 endpoint is 30/50, although the current campaign normally ends earlier. Historical basis remains **TBD — historical research required**. |
| `unemployed` | Numeric percent-like overlapping economic condition; root: `3` | Year/economic events and policies write; support weighting, status, and graph read | Economy and elections; persistent simulation state | Floored at 1 in `post_event`; not part of the five-class 100% total; differs from `unemployment` | Implemented opening value; existing crisis mechanics preserved. |
| `national_minorities` | Numeric overlapping identity weight; root: `30` | Support loops read; Library displays; currently fixed | Elections; persistent simulation state | Overlaps the main classes; Polacy are the implied complement and have no separate variable; this makes the minority row an additional electoral dimension | Implemented by explicit user-approved design decision; a future intersection model remains optional planned work. |
| `catholics`, `catholics_spd`, `catholics_spd_compat_base` | Legacy compatibility weight/input; `catholics` is not a member of `classes` | Existing German cards may write `catholics_spd`; compatibility code transfers only its delta to `national_minorities_pps` | Transitional mechanics only | Must never overwrite the full minority-party row or be weighted independently | Retained only for inherited PPS-targeting effects. |
| `<class>_<party>` | Numeric opening within-group percentage/raw propensity; matrix initialized in `root.start` | Campaigning and compatibility code write selected cells; support/election loops read dynamically | Core party-support model; persistent simulation state | Negative values are clamped; every implemented opening row totals exactly 100 | Implemented for all nine parties and seven groups. `other` is 8 in every row except `rural`, where it is 12; the eight supplied party values are proportionally scaled to the remainder. |
| `<class>_<party>_normalized`, `<class>_<party>_display` | Numeric percent and rounded display value; generated by calculators | `post_event`, `election_algorithm`, and `game_over` write; conditions/status/achievements read | Elections, achievements, demographic UI; derived/display persistent state | Each class's normalized party values should sum to 100 | Retain the existing calculation for the approved playable slice. |
| `party_support_records` | Array; `root.start`: `[]`; monthly dated objects appended | `post_event` writes; D3 chart in `library` reads | Historical support chart; persistent display-support state | Party keys must follow the nine active `parties` and `party_names`/`party_colors` maps | Implemented for the Polish opening roster. |
| `factions` | Active array `centrum`, `lewica`, `pilsudczycy`; initialized in root | `post_event` normalizes; disunity, split events, status and Library read | PPS faction normalization and dissent; persistent configuration state | Every member requires `_strength` and `_dissent`; Labor is deliberately excluded | Implemented for new games. |
| `centrum_strength`, `lewica_strength`, `pilsudczycy_strength` | Numeric shares; root starts 50/15/35 | Polish disunity/split events and the compatibility bridge write; `post_event` normalizes; UI displays | Overall dissent and split consequences; persistent simulation state | Nonnegative; normalized to total 100; zero total is guarded | Implemented. |
| `centrum_dissent`, `lewica_dissent`, `pilsudczycy_dissent` | Numeric percent-like values; root starts 0/20/5 | Polish disunity and compatibility bridge write; `post_event` clamps; split events read | Overall dissent and split consequences; persistent simulation state | Clamped to 0–99; each consequence triggers at 60 | Implemented gameplay values; historical validation remains TBD. |
| `legacy_factions`, `legacy_faction_map`, `<legacy>_*_compat_base` | Shadow five-field German model and per-field transfer baselines | Inherited cards and inactive legacy adviser scenes may write German fields; `post_event` transfers mapped deltas once, normalizes shadow values and refreshes baselines | Temporary unadapted-card compatibility | Map: Left→Lewica, Center+Reformist→Centrum, Neorevisionist→Piłsudczycy; Labor is unmapped | Implemented technical bridge, explicitly not a historical equivalence. Active Polish advisers write semantic fields directly. |
| `labor_strength`, `labor_dissent` | Numeric inherited union-power-centre values | Inherited union content and Polish disunity card write; status/Library display | Temporary affiliated-union compatibility state | Excluded from `factions`, its normalization and overall `dissent` | Retained until a researched ZSZ mechanic is implemented. |
| `dissent`, `dissent_percent` | Fraction and percent; initialized then recomputed after actions | `post_event` writes; support changes, party-disunity scenes, status and `dissent` qdisplay read | Party support effectiveness and faction consequences; derived persistent state | Weighted from the three active PPS factions only; `dissent` capped at 0.95 | Implemented. |
| `lewica_split`, `centrum_resigned`, `pilsudczycy_split` | Number used as one-shot event flags; root starts `0` | New PPS consequence scenes write/read; UI/disunity checks read | Prevent repeated 60-dissent consequences; persistent event flags | Trigger at corresponding dissent 60 | Implemented; successor parties remain planned. |
| `left_split`, `centrists_resign`, `reformists_resign`, `reformists_resigned`, `unions_independent`, `sapd_formed` | Legacy compatibility flags | Inherited event/card files may read/write them | Transitional inherited mechanics | German faction split/resignation scenes are gated off when `polish_faction_system` is active | Retained compatibility state; not PPS faction outcomes. |

## Coalition and inter-party state

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `in_spd_majority`, `in_polish_left_coalition`, `in_polish_center_left_coalition`, `in_chjeno_piast`, `in_minority_government`, `minorities_toleration` | Number used as related booleans; initialized/reset around the Polish election | Active Polish election routes write; status/Library read; inherited government access still reads `spd_in_government` | First-cycle government identity and access; persistent simulation state | Active result processing resets all six before offering routes; later inherited government events require further adaptation | Implemented first-cycle shell. Minorities toleration requires `minorities_bloc_in_government = 0`. |
| `polish_left_coalition`, `polish_center_left_coalition`, `chjeno_piast_coalition`, `minority_toleration_total`, `anti_democratic_bloc` | Numeric percentage totals calculated after a Polish election | Active election result scene writes; coalition options/tests read | First-cycle coalition availability and reporting | Majority routes use 50; `anti_democratic_bloc` is a metric only | Implemented where specified. Democratic classification and broad-coalition crisis logic remain planned. |
| `coalition_dissent` | Numeric step-like value; initialized/reset around government formation | Government choices/events write; coalition affairs and qdisplay read | Government stability and confidence votes; persistent simulation state | Qdisplay: 0 very low, 1 low, 2 medium, 3 high, 4+ very high | TBD — user decision required. |
| `kpd_coalition_dissent`, `kpd_goals_seen`, `kpd_goals_completed`, `kpd_coalition_success`, `popular_front_success` | Numeric counters/boolean flags created in coalition/event routes | Popular/left-front and KPD event files write/read; narrative/ending use | Specific coalition stability; persistent event/simulation state | Lifecycle depends on entering those routes; several are not root-initialized | TBD — user decision required. |
| `psl_wyzwolenie_relation`, `minorities_bloc_relation`, `psl_piast_relation`, `npr_relation`, `pschd_relation`, `kpp_relation`, `zln_relation` | Numeric relationships initialized to 65/50/45/50/30/10/5 | Polish relationship card writes; status/Library display; first-cycle coalition gates read selected values | Cooperation and coalition eligibility; persistent simulation state | Existing qdisplay bands are authoritative, so 65 displays friendly, 50 neutral, 10 frigid and 5 hostile | Implemented. Legacy German relationship fields remain inactive compatibility state for inherited content. |
| `spd_toleration`, `communist_coalition`, `kpd_truce`, `tried_supporting_kpd` | Numeric policy/route flags; initialized or created by relevant choices | Election, inter-party and KPD routes | Coalition option availability and consequences; persistent choice/event state | Meanings are route-specific rather than one common scale | TBD — user decision required. |
| `chancellor`, `chancellor_party`, `old_chancellor`, `president` | Strings; initialized and reassigned by election/government/head-of-state events | Coalition and major event writers; status, institutions, endings readers | Government, constitutional and terminal routes; persistent simulation state | Named strings are used in exact comparisons; renaming display text can break logic | TBD — user decision required. |

## Advisers, cabinet, and leadership

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `n_advisors` | Integer active-roster count; root: `3` | Polish leadership management and departure/split processing write; the three-slot gate reads | Adviser availability; persistent configuration/simulation state | Must remain between 0 and 3; opening active team is Daszyński, Pużak and Perl | Implemented three active slots. |
| `<name>_advisor` (14 semantic Polish flags) | Number used as boolean; three starting flags are `1`, all other Polish flags `0` | Leadership, split and timed-departure logic write; individual adviser cards read | Active Polish adviser roster; persistent state | Names: `daszynski`, `puzak`, `perl`, `niedzialkowski`, `arciszewski`, `zaremba`, `czapinski`, `prochnik`, `dubois`, `drobner`, `jaworowski`, `moraczewski`, `ziemiecki`, `malinowski` | Implemented. Legacy German flags remain initialized to zero for inherited compatibility only. |
| `<name>_appointed_once` | Boolean-like number; starting three are `1`, other Polish advisers `0` | Leadership appointment writes and reads | Prevents repeatable faction-strength farming; persistent roster history | First appointment adds +5 associated-faction strength; later appointments do not | Implemented. |
| `<name>_left_adviser_pool` | Boolean-like number; root: `0` for all fourteen | Timed departures and named faction splits write; appointment availability reads | Permanent adviser-pool departure; persistent chronology state | A split sets this only for named advisers whose entry date has arrived; therefore a later entrant survives an earlier split | Implemented. Perl: April 1927; Daszyński: beginning of 1931; named split matrix documented in `PLAN.md`. |
| `advisor_action_timer` | Nonnegative integer; root: `0`; Polish adviser actions set `6` | Adviser scenes and cancel helper write/read; availability is player-facing | Shared adviser cooldown; persistent cooldown state | One cooldown is shared by every active adviser; it decrements with monthly timer processing | Implemented six-month assignment, preserving existing subsequent monthly decrement behavior. |
| `leverage` | Numeric ministry-negotiation currency calculated at election | Election coalition/ministry subscenes write/read; allocation choices show costs | Cabinet ownership; temporary election state persisted in saves | Common ministry costs 5/10/15; must not become negative through valid choices | TBD — user decision required. |
| `*_minister_party` | String party ID or false-like value; initialized/reset in root/elections | Election allocation and cabinet changes write; government cards read; status shows ownership | Ministry access and goals; persistent government state | Must agree with current coalition and reset on government change | TBD — user decision required. |
| `*_minister` | String person name; initialized/assigned in root/cabinet routes | Cabinet scenes write; narrative may read; not all have confirmed mechanical readers | Narrative/cabinet identity; persistent display/support state | Some appear write-only in static analysis | TBD — user decision required. |
| `*_goal`, `*_goal_completed` | String/number or boolean-like ministry objectives; initialized/created by cabinet paths | Cabinet/government scenes write/read; goal UI/narrative readers | Cabinet progression; persistent simulation/control state | Type and values differ by ministry; no common enum is enforced | TBD — user decision required. |

## Economy, taxation, and government finance

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `unemployed` | Numeric percent-like value; root: `3` | Year/economic events and policies write; support weighting, status, and graph read | Economy and elections; persistent simulation state | Floored at 1 in `post_event`; differs from `unemployment`; overlaps rather than belonging to the main-class 100% | Opening value implemented; existing crisis behavior retained. |
| `inflation` | Numeric percentage; root: `2.9` | Year events, policies, and monthly budget feedback write; status/graph/events read | Economy, support, crisis events; persistent simulation state | Monthly deficit bands use 0, -2, -5 budget and caps such as 2.5/5/10 | TBD — user decision required. |
| `economic_growth` | Numeric percentage-like value; root: `4.4` | Year events/policies/monthly logic write; status/events read | Economy, unemployment, endings; persistent simulation state | No demonstrated universal clamp or range | TBD — user decision required. |
| `economic_records` | Array of dated objects; root: `[]` | `post_event` appends inflation/unemployment; D3 reads | Economic chart; persistent display-support state | Date and field names must match chart code | TBD — user decision required. |
| `economic_plan` | Integer enum; root: `0`; documented `1` WTB, `2` moderate, `3` nationalization | `source/scenes/party_affairs/crisis_program.scene.dry` writes; government economic policy/events/endings read | Policy tree and political consequences; persistent decision state | Exact numeric comparisons; only 0–3 documented | TBD — user decision required. |
| `wtb_support`, `wtb_adopted`, `wtb_implemented`, `wtb_budget`; `moderate_plan_support`, `moderate_plan_adopted`, `moderate_plan_progress`; `nationalization_support`, `nationalization_adopted`, `nationalization_progress`, `nationalize_budget` | Mixed counters, booleans and numeric costs; many root-initialized at zero | Crisis/economic-policy scenes write/read; events/endings and UI use selected fields | Staged economic programs; persistent simulation state | Similar but nonuniform naming/lifecycles; ranges vary by route | TBD — user decision required. |
| `works_program` | Integer-like policy level; created by economic policy | Year/month economic logic, events and endings read/write | Unemployment/growth/inflation trajectory and endings; persistent simulation state | Later source distinguishes `0`, `>=1`, and `>=2` | TBD — user decision required. |
| `upper_tax_rates`, `lower_tax_rates`, `tariffs` | Signed integer-like policy levels; initialized in root | Fiscal policy writes; qdisplay/relationships/economy read | Budget and political/economic reactions; persistent simulation state | Taxation qdisplay bands from `<=-6` to `>=6` | TBD — user decision required. |
| `capital_strike_progress`, `coup_progress` | Numeric escalation counters; root: `0` | Policy/institution/event writers; threshold event readers | Elite resistance, coup events, endings; persistent simulation state | Trigger logic uses `>=10`; capital confidence event also uses progress 6 and budget -5 | TBD — user decision required. |

## Organizations, loyalty, and militancy

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `pps_militia_stage`, `pps_militia_name`, `akcja_socjalistyczna_formed` | Stage integer 1/2, display name and boolean-like flag; root starts `1`, `Milicja PPS`, `0` | PPS self-defence card writes during one-time reorganization; status, Library and conflict narrative read | Identity of one continuous PPS organization; persistent simulation state | Reorganization preserves strength and cannot repeat | Implemented. Stage 2 is Akcja Socjalistyczna; it is not the Iron Front. |
| `pps_militia_strength` | Numeric active organized members; root starts `200` | Organization/adviser/conflict actions write; rally, coup and civil-war calculations read | PPS self-defence capacity; persistent simulation state | Nonnegative; represents approximate active organized membership, not thousands | Implemented user-approved opening value. |
| `pps_militia_militancy` | Numeric readiness/force multiplier; root starts `0.10` | Training, reorganization and conflict actions write; force calculations and `militancy` qdisplay read | PPS self-defence effectiveness; persistent simulation state | Nonnegative; AS reorganization adds `0.10` | Implemented; exact balance is a conservative provisional value. |
| `pps_militia_banned`, `pps_militia_repressed` | Number used as booleans; root starts `0`/`0` | Status/Library currently read; no Polish repression writer yet | Legal/repression state; persistent simulation state | The organization is initially legal and not repressed | Implemented opening state; later repression mechanics remain planned. |
| `pps_militia_union_cooperation` | Boolean-like number; root starts `0` | Militia card establishes cooperation; street-conflict training and status read; union independence clears | Coordination with affiliated unions | Cooperation adds readiness, never strength or union manpower | Implemented. |
| `pps_militia_opponents` | Array of `nationalist_militias`, `communist_militias`, `state_police` | Root initializes; documentation/tests read | Approved opponent categories | Current opponent numbers remain inherited German compatibility fields | Implemented classification; Polish opponent model remains planned. |
| `rb_strength`, `rb_militancy`, `rb_*_compat_base` | Shadow legacy values initialized from semantic militia state | Unadapted German calculations may write; `post_event` transfers deltas once and resynchronizes | Temporary compatibility only | Must not be displayed as a second organization | Retained for inherited content; not canonical PPS state. |
| `sh_strength`, `sa_strength`, `rfb_strength` and corresponding militancy/ban fields | Inherited numeric opponent state | Existing violence scenes write/read | Temporary nationalist/communist opponent calculations | German identities and scales are not Polish equivalents | Retained pending bounded opponent replacement. |
| `interior_police_loyalty`, `prussian_police_loyalty`, `reichswehr_loyalty` | Fractions; root: 0.45/0.5/0.2 | Police/military/institution events write; coup/conflict calculations and `loyalty` qdisplay read | Institutional response and violence; persistent simulation state | Qdisplay ranges from completely disloyal `<=0.06` to completely loyal `>=0.95` | TBD — user decision required. |
| `prussian_police_strength`, `reichswehr_strength`, `prussian_police_militancy`, `reichswehr_militancy` and interior equivalents | Numeric force inputs initialized in root | Institution cards/events write; conflict code derives power; strength/militancy labels may display | Coup/civil-war balance; persistent simulation state | Different units are multiplied/combined; no common scale is evidenced | TBD — user decision required. |
| `rb_power`, `sh_power`, `sa_power`, `rfb_power`, `prussian_police_power`, `loyal_reichswehr_power`, `hostile_reichswehr_power`, `enemy_power`, `total_power` | Derived numeric helpers created in conflict scenes | `civil_war` and related event code writes/reads; outcome narrative uses results | Violence resolution; temporary derived state persisted in saves | Must be recomputed after changing any strength/militancy/loyalty input | TBD — user decision required. |
| `civil_war_seen`, `coup_victory`, `republic_victory`, `total_defeat`, `long_war`, `resist_coup` | Number used as route/outcome flags; created in terminal event paths | Coup/civil-war events and `game_over` write/read; ending is player-facing | Terminal outcomes and achievements; persistent event/ending state | Multiple flags may coexist unless route logic prevents it | TBD — user decision required. |

## Event scheduling and flags

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `*_seen` | Number used as boolean; some initialized in root, many created by their event | Corresponding event writes and `view-if` reads; narrative/event availability reveals state | One-time event scheduling; persistent event flags | Naming convention is broad but not universal; should pair with `max-visits` review | TBD — user decision required. |
| `has_event` | Number used as boolean/helper; initialized/assigned around event selection | `post_event` flow writes/reads; no direct display | Route control; temporary control state | Exact role alongside tag eligibility is not fully explicit | TBD — user decision required. |
| `black_thursday_seen`, `banking_crisis_seen`, `emergency_cuts_seen`, `presidential_election_seen`, `prussian_coup_seen`, `march_on_berlin_seen` | Boolean-like event flags; event-created or root-initialized depending on flag | Named event files write; related events/cards/endings read | Major chronology/consequence chains; persistent event flags | Several lack explicit root initialization and rely on false/zero default | TBD — user decision required. |
| Progress/phase controls such as `round`, `election_round`, `candidate`, `winner`, `winner_votes`, `winner_desc` | Mixed number/string; initialized within election event routes | Presidential-election code writes/reads and displays | Multi-round presidential election; temporary event control persisted in saves | Dynamic candidate keys are case-sensitive; restarting/resuming mid-event must retain them | TBD — user decision required. |

## Achievements and endings

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `game_over` | Number used as boolean; set in `source/scenes/game_over.scene.dry` | Terminal events/game-over flow write/read; final UI uses game-over scene state | Campaign termination; persistent control state | Must only become true on a terminal route | TBD — user decision required. |
| `achievement_*` | Number used as cross-play achievement state; handled in game-over/achievement logic | `game_over` writes/reads; achievements menu displays | Persistent unlocks across plays | Names are save/public identifiers; rename risks losing unlocks | TBD — user decision required. |
| `game_achievement_*` | Number used as current-play achievement state | `game_over` calculates; ending/achievement display reads | Per-play summary and global unlock assignment | Must remain paired with intended `achievement_*` key | TBD — user decision required. |
| Outcome flags (`hitler_deported`, `deportation_success`, `eu`, `constitutional_reform`, `united_front_success`, and many others) | Usually boolean or progress numbers, initialized in root or relevant path | Policy/event writers; `game_over` ending and achievement predicates read | Ending selection and achievements; persistent simulation/event state | Full meaning is condition-specific; consult exact ending predicate before changing | TBD — user decision required. |

## UI and display-support state

| Exact name or family | Type / initialization / range | Writers / readers / display | Dependencies / kind | Thresholds / uncertainty | Polish adaptation decision |
| --- | --- | --- | --- | --- | --- |
| `*_display`, `*_disp`, `str_change_*` | Usually rounded number or string; generated by calculations | Election/support calculations write; scene interpolation/status reads | Presentation; derived display state persisted in saves | Suffixes are not interchangeable and rounding differs | TBD — user decision required. |
| `dissent_percent`, `pro_republic_disp` | Rounded/percent display helpers; generated from simulation values | `post_event`/relevant scenes write; status/narrative read | Player-facing presentation | Can become stale if raw value changes outside recomputation | TBD — user decision required. |
| `pinnedCardsDescription` | String/HTML-like runtime support state initialized in root | Browser hand UI reads; no gameplay formula confirmed | Pinned-card presentation; persistent UI-support state | Runtime coupling is outside ordinary Dendry conditions | TBD — user decision required. |
| `mods_table` | Runtime/configuration data referenced by mod UI | Root/runtime mod loader interaction; browser-facing | Mod support; UI/runtime state | Network, schema, and trust behavior are untested | TBD — user decision required. |
| `election_records`, `party_support_records`, `economic_records` | Arrays of dated objects; initialized empty in root | Election/post-event writers; D3 readers | Charts and save size; persistent display-support state | Object schema and party IDs must match `library` figure code | TBD — user decision required. |

## Variables whose purpose is unclear or inconsistent

The following findings are evidence for follow-up, not instructions to delete or
rename anything.

### Appear written but not read literally

Dynamic and runtime reads were excluded where identifiable. These keys still
appear to lack a confirmed source reader:

- `advisor_action_time` appears in source alongside the active
  `advisor_action_timer` convention.
- `DNVP_relation` and `NSDAP_relation` are initialized, while later conditions
  use `dnvp_relation` and `nsdap_relation`.
- `kpd_leader` and `z_leader` coexist with actively used
  `kpd_party_leader` and `z_party_leader`.
- `hindenburg_relation` and `hindenburg_enabled` have initialization evidence
  but no confirmed active mechanical reader in the compiled source.
- `workers_qol`, `rural_qol`, `unemployed_qol`, `old_middle_qol`,
  `new_middle_qol`, `bourgeois_landowners_qol`, and
  `national_minorities_qol` are explicitly described in source as currently
  unused.
- Some named minister fields appear to be written for narrative completeness
  while access checks use only `<ministry>_minister_party`.
- Flags including `harzburg_front_seen`, `muller_died_in_office`, and
  `panzerkreuzer_b_funded` require a targeted route/runtime check before any
  conclusion.

For every item above: **UNCLEAR — requires code investigation or runtime
testing.**

### Appear read without explicit root initialization

Many event flags are intentionally created only when their route occurs. The
following high-impact examples are read without a confirmed explicit
`root.start` value and therefore rely on absent-as-false behavior or earlier
route assignment:

- Timers: `party_disunity_timer`, `dealing_with_toleration_timer`,
  `constitutional_reform_timer`, `labor_rights_timer`,
  `education_science_timer`, and `curriculum_timer`.
- Policy/control values: `peoples_party`, `strife`, `spd_caretaker`,
  `progressive_coalition`, `works_councils`, `rural_policy`, and `workers_aid`.
- Event flags: `black_thursday_seen`, `banking_crisis_seen`,
  `austrian_civil_war_seen`, and numerous other route-specific `_seen` keys.
- Dynamic families: SAPD class propensities and display fields before/after the
  party is added; candidate bonus/running/vote keys for candidates not selected;
  `<party>_banned` for parties other than the two explicit ban flags.

This may be deliberate Dendry style, but embedded JavaScript accesses should
be checked independently. **UNCLEAR — requires code investigation or runtime
testing.**

### Similar or confusing names

| Names | Risk |
| --- | --- |
| `DNVP_relation` / `dnvp_relation`; `NSDAP_relation` / `nsdap_relation` | JavaScript state keys are case-sensitive; initialization and readers may not meet. |
| `Hitler_votes` / `hitler_votes`; `Braun_running` / `braun_campaign` and other candidate capitalization variants | Presidential-election dynamic keys use capitalized candidate names while party/election keys are lower-case. |
| `streseman_dead` / `stresemann_dead` | Spelling variants may represent separate flags. |
| `reformists_resign` / `reformists_resigned` | Two near-identical faction consequence flags. |
| `advisor_action_time` / `advisor_action_timer` | Only the `_timer` name fits the central timer convention. |
| `unemployed` / `unemployment` | One is the main economic/demographic value; some scenes read the other. |
| `workers_other` / `workers_others` | Singular/plural raw-support names. |
| `moderate_economic_plan` / `moderate_plan_adopted` | Potentially overlapping plan-state meanings. |
| `hoover_memorandum_seen` / `hoover_moratorium_seen` | Similar event spelling with different words. |
| `reparations_negotiation` / `reparations_negotiations` | Singular/plural state split. |
| `center_dissent` / `centrist_dissent` | Faction field versus apparently separate similarly named value. |
| `month_actions` / `month_activities` | The former drives time; the latter's lifecycle is not equally clear. |
| `democratization` / `democratization-2`; `pacifism` / `pacifism-2` | Hyphenated identifiers appear in compiled expressions and may be parsed as quality names rather than subtraction as intended. |

### Highest-risk shared variables

1. `time`, `year`, `month`, `month_actions`, `timers`, and all `*_timer` keys.
2. `classes`, `parties`, every dynamic class-party field, and normalized vote
   families.
3. `factions`, faction strength/dissent, `dissent`, and `dissent_percent`.
4. Party result, prior result, change, coalition total, and government flag
   families.
5. `budget`, `unemployed`, `inflation`, `economic_growth`, program-stage fields,
   `capital_strike_progress`, and `coup_progress`.
6. Organization strength/militancy, institutional loyalty, and derived power
   helpers.
7. `chancellor`, `president`, ministry ownership, and constitutional flags.
8. Achievement, ending, and save-visible identifiers.

## Appendix: complete expanded state-key index

This appendix lists the original 989 literal or concretely constructible `Q`
keys found by the audit, followed by the 58 population-model additions.
Constructible entries are included because loops can access them even when no
explicit assignment exists. Alphabetization inside each block is
case-insensitive; case variants remain separate exact keys.

<!-- COMPLETE_VARIABLE_INDEX -->
`abortion`, `abortion_rights`, `achievement_anders_als_die_andern`, `achievement_arbeiter_von_wien`, `achievement_ausnahmezustand`, `achievement_bauernrevolution`, `achievement_bollwerk_der_demokratie`, `achievement_bruder_zur_sonne`
`achievement_bundesrepublik`, `achievement_civil_war`, `achievement_constitutional_coalition`, `achievement_deport_hitler`, `achievement_die_rote_fahne`, `achievement_drei_pfeile`, `achievement_einheitsfront`, `achievement_einheitsfront_2`
`achievement_einigkeit`, `achievement_einigkeit_und_recht`, `achievement_einigkeit_und_recht_und_freiheit`, `achievement_eiserne_front`, `achievement_equality`, `achievement_eu`, `achievement_freie_marktwirtschaft`, `achievement_game_completed`
`achievement_grosse_volksfront`, `achievement_grosse_volkspartei`, `achievement_heidelberger_programm`, `achievement_hirschfeld`, `achievement_katholischer_sozialismus`, `achievement_klassenkampf`, `achievement_majority_party`, `achievement_minderheitsregierung`
`achievement_panik_im_mittelstand`, `achievement_polykrise`, `achievement_raterepublik`, `achievement_red_tzar_of_prussia`, `achievement_republik_der_wissenschaft`, `achievement_rote_millionar`, `achievement_schwarz_rot_gold`, `achievement_sohn_seiner_klasse`
`achievement_stolperstein`, `achievement_syndikalismus`, `achievement_verfassungsreform`, `achievement_versohnler`, `achievement_victory_for_the_republic`, `achievement_volksfront`, `achievement_volksfront_2`, `achievement_volkspartei`
`achievement_wahlrechts`, `achievement_weimar_coalition`, `achievement_wirtschaftsexperiment`, `achievement_wirtschaftspolitik`, `achievement_wirtschaftswunder`, `achievement_women_reichsbanner`, `achievement_zeppelin_kapitan`, `Adenauer_bonus`
`adenauer_drops_out`, `Adenauer_running`, `Adenauer_votes`, `Adenauer_votes_disp`, `advisor_action_time`, `advisor_action_timer`, `agricultural_finance`, `agricultural_policy`
`agricultural_policy_timer`, `agriculture_goal`, `agriculture_goal_completed`, `agriculture_minister`, `agriculture_minister_party`, `anti_democratic_coalition`, `any_majority`, `applied_research`
`aufhauser_advisor`, `austerity`, `austria_civil_war`, `austria_defeat`, `austria_peace`, `austria_relation`, `austria_victory`, `austrian_civil_war_seen`
`austrian_parliament_seen`, `baade_advisor`, `banking_crisis_seen`, `banking_crisis_timer`, `black_thursday_seen`, `blutmai`, `bourgeois_coalition`, `braun_advisor`
`Braun_bonus`, `braun_campaign`, `braun_majority`, `braun_plurality`, `Braun_running`, `braun_votes`, `Braun_votes`, `braun_votes_disp`
`Braun_votes_disp`, `breitscheid_advisor`, `budget`, `bureaucratic_reform`, `campaign_media`, `candidate`, `capital_strike_progress`, `capital_strike_seen`
`catholics`, `catholics_ddp`, `catholics_ddp_display`, `catholics_ddp_normalized`, `catholics_dnvp`, `catholics_dnvp_display`, `catholics_dnvp_normalized`, `catholics_dvp`
`catholics_dvp_display`, `catholics_dvp_normalized`, `catholics_kpd`, `catholics_kpd_display`, `catholics_kpd_normalized`, `catholics_nsdap`, `catholics_nsdap_display`, `catholics_nsdap_normalized`
`catholics_other`, `catholics_other_display`, `catholics_other_normalized`, `catholics_sapd`, `catholics_sapd_display`, `catholics_sapd_normalized`, `catholics_spd`, `catholics_spd_display`
`catholics_spd_normalized`, `catholics_z`, `catholics_z_display`, `catholics_z_normalized`, `center_dissent`, `center_right_coalition`, `center_strength`, `centrist_dissent`
`centrists_resign`, `chancellor`, `chancellor_party`, `change_ddp_r`, `change_dnvp_r`, `change_dvp_r`, `change_kpd_r`, `change_nsdap_r`
`change_other_r`, `change_sapd_r`, `change_sex`, `change_spd_r`, `change_z_r`, `changed`, `civil_war_seen`, `classes`
`coalition_affairs_timer`, `coalition_dissent`, `comintern_seen`, `commercialized_media`, `communist_coalition`, `confronting_antisemitism`, `confronting_nazis_seen`, `confronting_nazis_timer`
`constitutional_crisis`, `constitutional_protection`, `constitutional_reform`, `constitutional_reform_timer`, `constructive_vonc`, `cooperatives`, `coup_progress`, `coup_victory`
`crisis_program_timer`, `crisis_urgency`, `crispien_advisor`, `cultural_organizations`, `curriculum_timer`, `customs_union`, `customs_union_seen`, `ddp_banned`
`ddp_candidate`, `ddp_dstp_seen`, `ddp_in_government`, `ddp_name`, `ddp_normalized`, `ddp_r`, `ddp_r_disp`, `ddp_relation`
`ddp_support`, `ddp_votes`, `ddp_votes_dec`, `ddp_votes_disp`, `ddp_votes_display`, `dealing_with_toleration_timer`, `defense_strength`, `democratization`
`democratization-2`, `deportation_success`, `difficulty`, `dissent`, `dissent_percent`, `dnvp_banned`, `dnvp_candidate`, `dnvp_in_government`
`dnvp_normalized`, `dnvp_r`, `dnvp_r_disp`, `dnvp_relation`, `DNVP_relation`, `dnvp_support`, `dnvp_votes`, `dnvp_votes_dec`
`dnvp_votes_disp`, `dnvp_votes_display`, `domestic_enemies_timer`, `dues`, `dvp_banned`, `dvp_candidate`, `dvp_in_government`, `dvp_no_confidence`
`dvp_normalized`, `dvp_r`, `dvp_r_disp`, `dvp_relation`, `dvp_support`, `dvp_support_braun`, `dvp_votes`, `dvp_votes_dec`
`dvp_votes_disp`, `dvp_votes_display`, `east_aid`, `east_relation`, `Eckener_bonus`, `Eckener_running`, `Eckener_votes`, `Eckener_votes_disp`
`economic_democracy`, `economic_democracy_timer`, `economic_expansion`, `economic_growth`, `economic_growth_2`, `economic_minister`, `economic_minister_party`, `economic_plan`
`economic_policy_timer`, `economic_records`, `economy_goal`, `economy_goal_completed`, `education_science`, `education_science_timer`, `Einstein_bonus`, `Einstein_running`
`Einstein_votes`, `Einstein_votes_disp`, `election_records`, `election_round`, `electoral_threshold`, `emergency_cuts_seen`, `emergency_cuts_timer`, `emergency_rule`
`enemies`, `enemies_timer`, `enemy_power`, `enemy_strength`, `eu`, `eu_austria`, `eu_progress`, `factions`
`factory_takeovers`, `family_law`, `far_right_coalition`, `finance_goal`, `finance_goal_completed`, `finance_minister`, `finance_minister_party`, `fiscal_policy_timer`
`foreign_goal`, `foreign_goal_completed`, `foreign_minister`, `foreign_minister_party`, `foreign_policy_timer`, `funded_reichsbanner`, `fundraising_timer`, `game_achievement_anders_als_die_andern`
`game_achievement_arbeiter_von_wien`, `game_achievement_ausnahmezustand`, `game_achievement_bauernrevolution`, `game_achievement_bollwerk_der_demokratie`, `game_achievement_bruder_zur_sonne`, `game_achievement_bundesrepublik`, `game_achievement_civil_war`, `game_achievement_constitutional_coalition`
`game_achievement_deport_hitler`, `game_achievement_die_rote_fahne`, `game_achievement_drei_pfeile`, `game_achievement_einheitsfront`, `game_achievement_einheitsfront_2`, `game_achievement_einigkeit`, `game_achievement_einigkeit_und_recht`, `game_achievement_einigkeit_und_recht_und_freiheit`
`game_achievement_eiserne_front`, `game_achievement_equality`, `game_achievement_eu`, `game_achievement_freie_marktwirtschaft`, `game_achievement_grosse_volksfront`, `game_achievement_grosse_volkspartei`, `game_achievement_heidelberger_programm`, `game_achievement_hirschfeld`
`game_achievement_katholischer_sozialismus`, `game_achievement_klassenkampf`, `game_achievement_majority_party`, `game_achievement_minderheitsregierung`, `game_achievement_panik_im_mittelstand`, `game_achievement_polykrise`, `game_achievement_raterepublik`, `game_achievement_red_tzar_of_prussia`
`game_achievement_republik_der_wissenschaft`, `game_achievement_rote_millionar`, `game_achievement_schwarz_rot_gold`, `game_achievement_sohn_seiner_klasse`, `game_achievement_stolperstein`, `game_achievement_syndikalismus`, `game_achievement_verfassungsreform`, `game_achievement_versohnler`
`game_achievement_victory_for_the_republic`, `game_achievement_volksfront`, `game_achievement_volksfront_2`, `game_achievement_volkspartei`, `game_achievement_wahlrechts`, `game_achievement_weimar_coalition`, `game_achievement_wirtschaftsexperiment`, `game_achievement_wirtschaftspolitik`
`game_achievement_wirtschaftswunder`, `game_achievement_women_reichsbanner`, `game_achievement_zeppelin_kapitan`, `game_over`, `Gessler_bonus`, `gessler_drops_out`, `Gessler_running`, `Gessler_votes`
`Gessler_votes_disp`, `Goring_bonus`, `Goring_running`, `Goring_votes`, `Goring_votes_disp`, `grand_coalition`, `grand_coalition_failed`, `harzburg_front_seen`
`has_event`, `has_majority`, `high_inflation_timer`, `hilferding_advisor`, `hindenburg_dead`, `hindenburg_enabled`, `hindenburg_majority`, `hindenburg_plurality`
`hindenburg_relation`, `hindenburg_to_braun_bonus`, `hindenburg_votes`, `hindenburg_votes_disp`, `hirschfeld_advisor`, `historical_mode`, `Hitler_bonus`, `hitler_deported`
`hitler_majority`, `hitler_plurality`, `hitler_right_coalition`, `Hitler_running`, `hitler_support_hindenburg`, `hitler_votes`, `Hitler_votes`, `hitler_votes_disp`
`Hitler_votes_disp`, `homosexual_rights`, `homosexual_rights_timer`, `hoover_memorandum_seen`, `hoover_moratorium_seen`, `hostile_reichswehr_power`, `ideology`, `ideology_timer`
`in_election`, `in_emergency_government`, `in_grand_coalition`, `in_left_front`, `in_minority_government`, `in_popular_front`, `in_right_coalition`, `in_spd_majority`
`in_unity_government`, `in_weimar_coalition`, `income`, `inflation`, `inflation_2`, `inter_party_relationships_timer`, `interior_goal`, `interior_goal_completed`
`interior_minister`, `interior_minister_party`, `interior_police_loyalty`, `interior_police_militancy`, `interior_police_strength`, `international_relations_timer`, `investigate_corruption`, `investigate_far_right`
`iron_front_formed`, `iron_front_timer`, `is_cultural_candidate`, `is_favorable`, `is_unity_candidate`, `juchacz_advisor`, `Juchacz_bonus`, `Juchacz_running`
`Juchacz_votes`, `Juchacz_votes_disp`, `judicial_reform`, `judiciary_timer`, `justice_minister`, `justice_minister_party`, `kellogg_briand_seen`, `kellogg_briand_signed`
`kpd_appeal_seen`, `kpd_banned`, `kpd_candidate`, `kpd_coalition_dissent`, `kpd_coalition_success`, `kpd_cooperation_seen`, `kpd_foreign_seen`, `kpd_goals_completed`
`kpd_goals_seen`, `kpd_in_government`, `kpd_influence`, `kpd_inter_party_seen`, `kpd_labor_support`, `kpd_leader`, `kpd_no_confidence`, `kpd_normalized`
`kpd_party_conference_seen`, `kpd_party_leader`, `kpd_policy_timer`, `kpd_r`, `kpd_r_disp`, `kpd_rectified_history`, `kpd_relation`, `kpd_score`
`kpd_support`, `kpd_support_braun`, `kpd_truce`, `kpd_ultimatum_seen`, `kpd_ultimatum_timer`, `kpd_votes`, `kpd_votes_dec`, `kpd_votes_disp`
`kpd_votes_display`, `kwg_research`, `labor_affairs_seen`, `labor_affairs_timer`, `labor_dissent`, `labor_goal`, `labor_goal_completed`, `labor_minister`
`labor_minister_party`, `labor_rights_timer`, `labor_strength`, `land_reform`, `largest_party`, `last_advisor_action`, `last_cabinet_action`, `leber_advisor`
`left_coalition`, `left_dissent`, `left_split`, `left_strength`, `leipart_advisor`, `leverage`, `levi_advisor`, `levi_dead`
`london_economic_conference_seen`, `long_war`, `lower_tax_rates`, `loyal_reichswehr_power`, `major_curriculum`, `Mann_bonus`, `Mann_running`, `Mann_votes`
`Mann_votes_disp`, `march_on_berlin_seen`, `march_on_berlin_timer`, `media_timer`, `medical_research`, `mierendorff_advisor`, `military_policy_timer`, `military_reform`
`minor_curriculum`, `minority_government`, `moderate_economic_plan`, `moderate_plan_adopted`, `moderate_plan_progress`, `moderate_plan_support`, `mods_table`, `month`
`month_actions`, `month_activities`, `muller_advisor`, `muller_dead`, `muller_died_in_office`, `Munzenberg_bonus`, `Munzenberg_running`, `Munzenberg_votes`
`Munzenberg_votes_disp`, `n_advisors`, `n_elections`, `n_rfb_banned`, `n_rfb_persecuted`, `nationalism`, `nationalism_disp`, `nationalization_adopted`
`nationalization_progress`, `nationalization_support`, `nationalize_budget`, `nazi_urgency`, `neo_weimar_coalition`, `neorevisionism`, `neorevisionist_dissent`, `neorevisionist_strength`
`new_middle`, `new_middle_ddp`, `new_middle_ddp_display`, `new_middle_ddp_normalized`, `new_middle_dnvp`, `new_middle_dnvp_display`, `new_middle_dnvp_normalized`, `new_middle_dvp`
`new_middle_dvp_display`, `new_middle_dvp_normalized`, `new_middle_kpd`, `new_middle_kpd_display`, `new_middle_kpd_normalized`, `new_middle_nsdap`, `new_middle_nsdap_display`, `new_middle_nsdap_normalized`
`new_middle_other`, `new_middle_other_display`, `new_middle_other_normalized`, `new_middle_qol`, `new_middle_sapd`, `new_middle_sapd_display`, `new_middle_sapd_normalized`, `new_middle_spd`
`new_middle_spd_display`, `new_middle_spd_normalized`, `new_middle_z`, `new_middle_z_display`, `new_middle_z_normalized`, `next_election_month`, `next_election_time`, `next_election_year`
`no_confidence_against_spd`, `no_confidence_succeeds`, `no_confidence_votes`, `no_majority_bruning_elections`, `no_majority_elections`, `no_majority_papen_elections`, `normalized_workers_kpd`, `normalized_workers_spd`
`normalized_workers_total`, `nsdap_banned`, `nsdap_candidate`, `nsdap_in_government`, `nsdap_leader`, `nsdap_normalized`, `nsdap_r`, `nsdap_r_disp`
`nsdap_relation`, `NSDAP_relation`, `nsdap_support`, `nsdap_votes`, `nsdap_votes_dec`, `nsdap_votes_disp`, `nsdap_votes_display`, `nsdap_workers`
`old_chancellor`, `old_ddp_r`, `old_demographics`, `old_dnvp_r`, `old_dvp_r`, `old_ideology`, `old_kpd_r`, `old_middle`
`old_middle_ddp`, `old_middle_ddp_display`, `old_middle_ddp_normalized`, `old_middle_dnvp`, `old_middle_dnvp_display`, `old_middle_dnvp_normalized`, `old_middle_dvp`, `old_middle_dvp_display`
`old_middle_dvp_normalized`, `old_middle_kpd`, `old_middle_kpd_display`, `old_middle_kpd_normalized`, `old_middle_nsdap`, `old_middle_nsdap_display`, `old_middle_nsdap_normalized`, `old_middle_other`
`old_middle_other_display`, `old_middle_other_normalized`, `old_middle_qol`, `old_middle_sapd`, `old_middle_sapd_display`, `old_middle_sapd_normalized`, `old_middle_spd`, `old_middle_spd_display`
`old_middle_spd_normalized`, `old_middle_z`, `old_middle_z_display`, `old_middle_z_normalized`, `old_nsdap_r`, `old_other_r`, `old_sapd_r`, `old_spd_r`
`old_z_r`, `Ossietzky_bonus`, `Ossietzky_running`, `Ossietzky_votes`, `Ossietzky_votes_disp`, `other_banned`, `other_candidate`, `other_no_confidence`
`other_normalized`, `other_r`, `other_r_disp`, `other_support`, `other_votes`, `other_votes_dec`, `other_votes_disp`, `other_votes_display`
`pacifism`, `pacifism-2`, `panzerkreuzer_b_funded`, `panzerkreuzer_b_seen`, `panzerkreuzer_failed`, `panzerkreuzer_funded`, `panzerkreuzer_seen`, `papen_chancellor_timer`
`papenomics_timer`, `parties`, `party_disunity_timer`, `party_organizations_timer`, `party_support_records`, `pass_threshold`, `peoples_party`, `peoples_party_support`
`peoples_party_timer`, `pfulf_advisor`, `pinnedCardsDescription`, `police_protect_success`, `police_timer`, `popular_front_coalition`, `popular_front_dispute_timer`, `popular_front_success`
`president`, `presidential_election_seen`, `presidential_powers`, `pro_consumer`, `pro_democracy_votes`, `pro_labor`, `pro_republic`, `pro_republic_disp`
`progressive_coalition`, `prussian_affairs_timer`, `prussian_concordat`, `prussian_concordat_progress`, `prussian_coup_seen`, `prussian_government`, `prussian_police_loyalty`, `prussian_police_militancy`
`prussian_police_power`, `prussian_police_strength`, `prussian_police_training`, `public_hs`, `radbruch_advisor`, `radicalization`, `radio`, `rally_timer`
`rb_banned`, `rb_exit`, `rb_investment`, `rb_militancy`, `rb_militarization_cost`, `rb_power`, `rb_stay`, `rb_strength`
`rb_strength_2`, `rb_success`, `rearmament_exposed`, `reform_support`, `reformed_183`, `reformist_dissent`, `reformist_strength`, `reformists_resign`
`reformists_resigned`, `reichsbanner_timer`, `reichskonkordat`, `reichskonkordat_progress`, `reichswehr_goal`, `reichswehr_goal_completed`, `reichswehr_loyalty`, `reichswehr_militancy`
`reichswehr_minister`, `reichswehr_minister_party`, `reichswehr_strength`, `reparations`, `reparations_negotiation`, `reparations_negotiations`, `repealed_175`, `republic_victory`
`resist_coup`, `resources`, `return_to_normalcy`, `rfb_banned`, `rfb_banned_prussia`, `rfb_militancy`, `rfb_power`, `rfb_strength`
`rfb_strength_2`, `right_coalition`, `rosenfeld_advisor`, `round`, `rural`, `rural_ddp`, `rural_ddp_display`, `rural_ddp_normalized`
`rural_dnvp`, `rural_dnvp_display`, `rural_dnvp_normalized`, `rural_dvp`, `rural_dvp_display`, `rural_dvp_normalized`, `rural_kpd`, `rural_kpd_display`
`rural_kpd_normalized`, `rural_nsdap`, `rural_nsdap_display`, `rural_nsdap_normalized`, `rural_other`, `rural_other_display`, `rural_other_normalized`, `rural_policy`
`rural_qol`, `rural_sapd`, `rural_sapd_display`, `rural_sapd_normalized`, `rural_sol`, `rural_spd`, `rural_spd_display`, `rural_spd_normalized`
`rural_z`, `rural_z_display`, `rural_z_normalized`, `sa_ban_timer`, `sa_banned`, `sa_banned_prussia`, `sa_militancy`, `sa_power`
`sa_strength`, `sa_strength_2`, `sapd_banned`, `sapd_candidate`, `sapd_formed`, `sapd_normalized`, `sapd_r`, `sapd_r_disp`
`sapd_support`, `sapd_votes`, `sapd_votes_dec`, `sapd_votes_disp`, `sapd_votes_display`, `schleicher_support`, `schleichers_scheme_success`, `schleichers_schemes_timer`
`school_boards`, `schumacher_advisor`, `Schumacher_bonus`, `Schumacher_running`, `Schumacher_votes`, `Schumacher_votes_disp`, `science`, `science_bonus`
`science_funding`, `sdapo_strength`, `secularized`, `Seldte_bonus`, `Seldte_running`, `Seldte_votes`, `Seldte_votes_disp`, `sender_advisor`
`severing_advisor`, `seydewitz_advisor`, `sh_ban_timer`, `sh_banned`, `sh_banned_prussia`, `sh_militancy`, `sh_power`, `sh_strength`
`sh_strength_2`, `shuffle_cabinet_timer`, `shuffle_leadership_timer`, `siemsen_advisor`, `social_welfare_timer`, `socialism`, `socialism_disp`, `socializations`
`soviet_aid`, `soviet_relation`, `spd_banned`, `spd_candidate`, `spd_caretaker`, `spd_in_government`, `spd_militancy`, `spd_no_confidence`
`spd_normalized`, `spd_prussia`, `spd_r`, `spd_r_disp`, `spd_support`, `spd_support_thalmann`, `spd_toleration`, `spd_votes`
`spd_votes_dec`, `spd_votes_disp`, `spd_votes_display`, `stampfer_advisor`, `started`, `state_buyer`, `str_change_ddp`, `str_change_dnvp`
`str_change_dvp`, `str_change_kpd`, `str_change_nsdap`, `str_change_other`, `str_change_sapd`, `str_change_spd`, `str_change_z`, `streetfighting_timer`
`streseman_dead`, `stresemann_dead`, `strife`, `strike_term_seen`, `tariffs`, `Thalmann_bonus`, `thalmann_majority`, `thalmann_plurality`
`Thalmann_running`, `thalmann_to_braun_bonus`, `thalmann_votes`, `Thalmann_votes`, `thalmann_votes_disp`, `Thalmann_votes_disp`, `time`, `time_to_election`
`timers`, `total_defeat`, `total_power`, `trans_rights`, `tried_supporting_kpd`, `understanding_enemy_seen`, `understanding_enemy_timer`, `unemployed`
`unemployed_2`, `unemployed_ddp`, `unemployed_ddp_display`, `unemployed_ddp_normalized`, `unemployed_dnvp`, `unemployed_dnvp_display`, `unemployed_dnvp_normalized`, `unemployed_dvp`
`unemployed_dvp_display`, `unemployed_dvp_normalized`, `unemployed_kpd`, `unemployed_kpd_display`, `unemployed_kpd_normalized`, `unemployed_nsdap`, `unemployed_nsdap_display`, `unemployed_nsdap_normalized`
`unemployed_other`, `unemployed_other_display`, `unemployed_other_normalized`, `unemployed_qol`, `unemployed_sapd`, `unemployed_sapd_display`, `unemployed_sapd_normalized`, `unemployed_spd`
`unemployed_spd_display`, `unemployed_spd_normalized`, `unemployed_z`, `unemployed_z_display`, `unemployed_z_normalized`, `unemployment`, `unemployment_insurance_crisis`, `unemployment_insurance_seen`
`unemployment_insurance_threshold`, `unemployment_insurance_timer`, `unions_independent`, `united_front_coalition`, `united_front_success`, `upper_tax_rates`, `use_decimals`, `war_choices`
`war_guilt`, `war_guilt_timer`, `weimar_coalition`, `welfare`, `welfare_goal`, `welfare_goal_completed`, `wels_advisor`, `weltbuhne_conclusion`
`weltbuhne_dropped`, `weltbuhne_seen`, `west_aid`, `west_relation`, `winner`, `winner_desc`, `winner_votes`, `winner_votes_disp`
`wissell_advisor`, `wittorf_affair_seen`, `wittorf_secret`, `wittorf_soviet_union`, `women_in_rb`, `womens_rights`, `womens_rights_timer`, `womens_work`
`workers`, `workers_aid`, `workers_ddp`, `workers_ddp_display`, `workers_ddp_normalized`, `workers_dnvp`, `workers_dnvp_display`, `workers_dnvp_normalized`
`workers_dvp`, `workers_dvp_display`, `workers_dvp_normalized`, `workers_kpd`, `workers_kpd_display`, `workers_kpd_normalized`, `workers_nsdap`, `workers_nsdap_display`
`workers_nsdap_normalized`, `workers_other`, `workers_other_display`, `workers_other_normalized`, `workers_others`, `workers_qol`, `workers_safety`, `workers_sapd`
`workers_sapd_display`, `workers_sapd_normalized`, `workers_sol`, `workers_spd`, `workers_spd_display`, `workers_spd_normalized`, `workers_z`, `workers_z_display`
`workers_z_normalized`, `working_hours`, `works_councils`, `works_program`, `woytinsky_advisor`, `wtb_adopted`, `wtb_budget`, `wtb_implemented`
`wtb_support`, `year`, `young_plan_seen`, `young_socialists`, `z_banned`, `z_candidate`, `z_in_government`, `z_leader`
`z_minus_bvp_r`, `z_no_confidence`, `z_normalized`, `z_party_leader`, `z_r`, `z_r_disp`, `z_relation`, `z_support`
`z_support_braun`, `z_votes`, `z_votes_dec`, `z_votes_disp`, `z_votes_display`

### Population-model additions

`bourgeois_landowners`, `bourgeois_landowners_ddp`, `bourgeois_landowners_ddp_display`, `bourgeois_landowners_ddp_normalized`, `bourgeois_landowners_dnvp`, `bourgeois_landowners_dnvp_display`, `bourgeois_landowners_dnvp_normalized`, `bourgeois_landowners_dvp`
`bourgeois_landowners_dvp_display`, `bourgeois_landowners_dvp_normalized`, `bourgeois_landowners_kpd`, `bourgeois_landowners_kpd_display`, `bourgeois_landowners_kpd_normalized`, `bourgeois_landowners_nsdap`, `bourgeois_landowners_nsdap_display`, `bourgeois_landowners_nsdap_normalized`
`bourgeois_landowners_other`, `bourgeois_landowners_other_display`, `bourgeois_landowners_other_normalized`, `bourgeois_landowners_qol`, `bourgeois_landowners_sapd`, `bourgeois_landowners_sapd_display`, `bourgeois_landowners_sapd_normalized`, `bourgeois_landowners_spd`
`bourgeois_landowners_spd_display`, `bourgeois_landowners_spd_normalized`, `bourgeois_landowners_z`, `bourgeois_landowners_z_display`, `bourgeois_landowners_z_normalized`
`national_minorities`, `national_minorities_ddp`, `national_minorities_ddp_display`, `national_minorities_ddp_normalized`, `national_minorities_dnvp`, `national_minorities_dnvp_display`, `national_minorities_dnvp_normalized`, `national_minorities_dvp`
`national_minorities_dvp_display`, `national_minorities_dvp_normalized`, `national_minorities_kpd`, `national_minorities_kpd_display`, `national_minorities_kpd_normalized`, `national_minorities_nsdap`, `national_minorities_nsdap_display`, `national_minorities_nsdap_normalized`
`national_minorities_other`, `national_minorities_other_display`, `national_minorities_other_normalized`, `national_minorities_qol`, `national_minorities_sapd`, `national_minorities_sapd_display`, `national_minorities_sapd_normalized`, `national_minorities_spd`
`national_minorities_spd_display`, `national_minorities_spd_normalized`, `national_minorities_z`, `national_minorities_z_display`, `national_minorities_z_normalized`

## Dynamic-family provenance

The expanded keys above come from these source constructs:

- Active support groups: `workers`, `old_middle`, `new_middle`, `rural`,
  `bourgeois_landowners`, `unemployed`, and `national_minorities` from
  `source/scenes/root.scene.dry`. `catholics` remains only as compatibility
  state feeding `national_minorities_*`.
- Parties: `spd`, `kpd`, `z`, `ddp`, `dvp`, `dnvp`, `nsdap`, `other`, plus
  `sapd` added by `source/scenes/events/sapd_formed.scene.dry`.
- Class-party families: raw, `_normalized`, and `_display`, constructed in
  `source/scenes/post_event.scene.dry`,
  `source/scenes/election_algorithm.scene.dry`, and
  `source/scenes/game_over.scene.dry`.
- Party-result families: `_support`, `_normalized`, `_votes`, `_votes_display`,
  `_votes_dec`, `_votes_disp`, `_r`, `_r_disp`, `old_*_r`, `change_*_r`,
  `str_change_*`, `_candidate`, and `_banned`, constructed in support/election
  and presidential-election code.
- Timer family: every base in `Q.timers` plus `_timer`, decremented by
  `source/scenes/post_event.scene.dry`.
- Presidential candidates: capitalized candidate names combined with `_running`,
  `_bonus`, `_votes`, and `_votes_disp` in
  `source/scenes/events/death_of_hindenburg_president.scene.dry`.
