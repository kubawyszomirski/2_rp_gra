# German Original: Technical Mechanics and Routing Reference

## Purpose and scope

This document records the implemented mechanics of the German version of *Social Democracy: An Alternate History*: state variables, formulas, thresholds, event routing, election and coalition predicates, ministry gates, combat calculations, ending checks, and known defects.

For a readable account of the campaign, political routes, player choices, and example trajectories, use [GERMAN_ORIGINAL_DESCRIPTIVE_GUIDE.md](GERMAN_ORIGINAL_DESCRIPTIVE_GUIDE.md).

The audited baseline is repository commit `5e2cfef` (`Establish reproducible upstream baseline`). A source citation such as `source/scenes/post_event.scene.dry` means that path at the baseline commit, which can be inspected with:

```text
git show 5e2cfef:source/scenes/post_event.scene.dry
```

This is a code reference. It distinguishes live behavior from comments, dormant scenes, probable defects, and historically descriptive text. None of the German numbers or institutions should be transferred to the Polish game without a separate design and historical decision.

## Third-audit inventory and event routing

The additional audit examined the complete `source/scenes` tree at the baseline rather than only the principal election and ending routes. It found 158 `.scene.dry` files, of which 69 contain an active `event` tag. Four more event files contain a commented-out event tag and are dormant: `economic_recovery`, `nazis_in_crisis`, `kpd_policy`, and `popular_front_dispute`.

These counts describe files, not individual subscenes. A single file can contain a long decision tree, while some event files are short state transitions.

### Event selection order

After an action returns to `post_event`, the engine performs its state recalculation before presenting the next mandatory event:

1. clamp demographic preference values and recalculate normalized polling;
2. normalize faction strengths and calculate overall dissent;
3. if an ordinary monthly action was taken, advance `time` and the calendar by one month;
4. decrement every registered timer and append polling/economic history;
5. apply deficit, inflation, deflation, growth, science, and unemployment feedback;
6. adjust republican legitimacy and apply legitimacy-driven voter movement;
7. apply the year-specific electoral and paramilitary drift;
8. compile all currently eligible members of `#event` and present events before returning to the hand.

Annual January shocks normally have priority `2`. The 1934 terminal transition has priority `3`. The Reichstag election uses priority `-1`, so higher-priority and ordinary-priority events due in the same month can resolve first. Equal-priority eligible events can form a queue rather than a single exclusive chapter.

Sources: `source/scenes/post_event.scene.dry`, `source/scenes/library.scene.dry`, `source/scenes/events/1929.scene.dry` through `1934.scene.dry`, `source/scenes/events/election_1928.scene.dry`, `source/scenes/events/1934_end.scene.dry`, and `node_modules/dendrynexus/lib/engine.js`.

### Event and linked-crisis families found in the full inventory

| Family | Representative live files | Gate type |
|---|---|---|
| Annual shocks | `1929`, `1930`, `1931`, `1932`, `1934`, `black_thursday` | Fixed date or date floor; usually one visit |
| Elections and succession | `election_1928`, `presidential_election_1932`, both Hindenburg-death files, `1934_end` | Scheduled date plus political state |
| Coalition and labor crises | `vote_of_no_confidence`, both unemployment-insurance files, `labor_unrest`, `emergency_cuts`, KPD goals/ultimatum/confidence | Dissent, unemployment, cabinet type, contract timer |
| Party rupture | `left_split`, `centrist_leaders_resign`, `reformist_leaders_resign`, `unions_declare_independence` | Faction dissent at least 60 |
| Economic reaction | `businesses_lose_confidence`, `capital_strike`, `high_inflation`, `economic_expansion`, `banking_crisis`, `hunger_chancellor` | Economic threshold, government, and sometimes cooldown |
| Institutional tests | `weltbuhne`, `weltbuhne_2`, `all_quiet`, `altona_clashes`, `judges_unban_sa`, `judges_unban_sh` | Date combined with Justice, police, Prussian, or ban state |
| Authoritarian escalation | `papen_chancellor`, `prussian_coup`, `schleichers_schemes`, `hitler_chancellor`, `hitler_takes_power` | Hindenburg, failed government, date, legitimacy/security state |
| Armed confrontation | `harzburg_front`, `march_on_berlin`, `civil_war` | Coup pressure, far-right support, bans, and accumulated force |
| Foreign-policy chains | `young_plan`, `austrian_customs_union`, `hoover_moratorium`, `lausanne_conference`, Austrian parliament/civil war, London conference | Date plus prior diplomatic or economic state |

The inventory confirms that the campaign is driven by two distinct forms of chronology. `year` and `month` control historical windows, while monotonic `time` and timers control delays and election intervals. They normally advance together. Direct edits to `month`, or the known double-advance and election-date defects, can desynchronize them and alter reachability.

### Repeating and one-shot pressures

Most historical events use `max-visits: 1`, but several important pressures recur:

- Reichstag elections are not limited to one visit;
- high inflation repeats after a cooldown that becomes shorter at higher inflation;
- emergency cuts can recur four times;
- March on Berlin can recur four times;
- unemployment-insurance disputes have two visits in each of their two variants;
- judges can repeatedly reverse SA or Stahlhelm bans while judicial reform remains below 2;
- economic expansion is repeatable because entry resets its accumulator to zero.

This distinction affects balance. One-time preparation may neutralize a historical event, while recurring structural pressures must be reduced below their trigger or they return.

### Irreversible or route-closing transitions

| Transition | Persistent consequence |
|---|---|
| A faction or the unions leave | Advisers, support, organization, and faction capacity are permanently removed |
| Prussian government is surrendered or defeated | The SPD loses a separate police and institutional base used in later defense |
| An adviser dies | Their action and, in some routes, a unique gate disappear |
| A mutually exclusive economic plan is adopted | The party's official plan is fixed, although later implementation can produce mixed-plan achievements |
| A KPD leadership window is missed | Conciliator leadership cannot be obtained later by merely raising relations |
| Hitler is deported | Nazi candidate and leadership branches change, but the NSDAP remains capable of taking power under other leaders |
| Presidential powers are reduced | Several Hindenburg, Papen, Prussian Coup, and extremist-presidency branches are blocked or contained |
| Return to Normalcy fires | Nazi political and paramilitary strength collapses and later monthly drift changes direction |

These are more consequential than ordinary support adjustments because later actions generally cannot reconstruct the removed route.

## The monthly loop and why choices have delayed effects

### The hand of cards

The main screen is a hand with a maximum of three cards on normal difficulty and four on easy difficulty. It exposes a Party Affairs deck from the beginning and a Government Affairs deck after `time >= 6`. Advisors are pinned alongside the hand. The player draws a card and chooses one of the actions inside it. Most actions add one to `month_actions`; `post_event` then advances the date by one month and resets that counter.

This creates a strict opportunity-cost structure. Raising money, campaigning among workers, improving relations with Zentrum, debating an economic program, building the Reichsbanner, reforming the judiciary, and changing welfare policy generally compete for the same monthly turn. A route that needs four judiciary reforms, three crisis-program debates, and repeated KPD diplomacy is expensive because the player cannot do all of those while also maximizing electoral campaigning.

An action can make more than one numerical change, but the month still advances only once as long as `month_actions >= 1`. Some event sequences and election screens do not consume an extra month. Source: `source/scenes/main.scene.dry`, `source/scenes/post_event.scene.dry`, and the individual card files.

### Advisors are periodic accelerators

The player begins with Otto Wels, Hermann Müller, and Rudolf Hilferding and can retain three advisors. Advisor actions normally share a six-month cooldown. They do not increment `month_actions`, so they are periodic extra actions alongside the ordinary monthly card action. This makes the chosen roster a substantial source of tempo as well as numerical help.

Changing the leadership has a political cost. Appointing many, though not all, replacement advisors strengthens the associated faction; removing one adds faction dissent. The advisor roster is consequently a statement about the party's internal balance as well as an ability loadout.

There is a likely implementation typo: the pinned leadership-shuffle scene increments `month_activities`, while the calendar checks `month_actions`. As written, that action does not advance time. This should not be copied as an intentional design rule without a decision. Sources: `source/scenes/advisors/*.scene.dry`, `source/scenes/advisors/shuffle_leadership_pinned.scene.dry`, `source/scenes/post_event.scene.dry`.

### Mandatory events interrupt the loop

After state updates, `post_event` checks the `#event` collection. Eligible events with the highest priority are presented first. Annual shocks normally use a higher priority than ordinary events; the final ending event is higher still. Elections have low priority, so other events due in the same month can appear before the election.

This matters for causality. A statistic can cross a threshold during the monthly update and immediately trigger a crisis before the player receives another ordinary action. Examples include a capital strike, a vote of no confidence, a coup, and faction rupture.

If several events of the same highest priority are eligible, the player can encounter more than one during the event sequence. The system is therefore less like a single scripted chapter and more like a queue of conditions that have become true.

### Randomness is narrower and stranger than it first appears

The ordinary deck draw chooses uniformly among eligible cards. Scene `frequency` values are used when the engine must select a limited subset of choices, but the Party and Government decks do not set such a limit. The apparent card frequencies therefore do not weight ordinary deck draws in the baseline engine.

When a scene has multiple valid `go-to` destinations, the engine randomly chooses one. This creates some explicit or accidental coin flips. The Grand Coalition attempt after Stresemann's death contains `go-to: beg_dvp_succeed; beg_dvp_fail`, which is an even random choice. The rally scene can similarly have both the normal and SA-disruption destinations valid. Presidential ties can set more than one winner flag and leave the engine to select among valid result destinations.

These are important implementation facts because a player may interpret them as a probability derived from political preparation when the code uses a flat random choice. Sources: `node_modules/dendrynexus/lib/engine.js`, `source/scenes/events/election_1928.scene.dry`, `source/scenes/party_affairs/rally.scene.dry`.

### What the Party Affairs cards build

Party Affairs remains available whether the SPD governs or sits in opposition. Its recurring card families create the political inputs used by later events.

| Card family | Immediate role | Long-run plot effect |
|---|---|---|
| Campaigning and rallies | Shift selected demographic support; spend organization or resources | Determines polling, election results, strike capacity, and some presidential blocs |
| Fundraising and party organization | Gain resources, dues, or organizational reach | Pays for coalition bargains, presidential endorsements, program adoption, and crisis responses |
| Media | Improve communication and support | Helps compensate for bad events, though gains are weakened by dissent |
| Ideology | Choose left, centrist, labor, reformist, or later neorevisionist emphasis | Changes faction balance and which economic, coalition, and party-transformation routes are feasible |
| Interparty relationships | Improve or damage relations with KPD, Zentrum, DDP, or DVP | Opens coalitions, toleration, endorsements, confidence votes, and civil-war alliances |
| Crisis program | Accumulate support for WTB, moderate recovery, or nationalization | Selects the economic strategy used against the Depression |
| Confronting Nazis | Recognize the threat and choose how directly to oppose it | Builds Nazi urgency, Iron Front access, and conditions for policing or deportation |
| Iron Front | Mobilize a broad republican campaign | Raises democratic legitimacy, organization, and anti-fascist readiness |
| Reichsbanner | Recruit, arm, train, restrain, or politically direct the defense organization | Determines effective force in coups and war and can provoke coalition partners |
| Street fighting | Escalate or de-escalate clashes | Changes both republican and Nazi paramilitary capacity and street strife |
| Neorevisionism and People's Party | Develop and then apply a broad democratic strategy | Enables constitutional reform and changes the SPD's demographic coalition |
| Party disunity | Bargain with or confront a dissenting faction | Can reduce dissent or lead to a permanent split |
| Response to antisemitism | Political and moral response to far-right agitation | Changes affected support, republican position, and anti-Nazi strategy |
| International relations | Party-to-party or international socialist activity | Feeds selected diplomatic and ideological outcomes |

The critical point is that no card family owns one ending. Campaigning helps elections and general strikes; interparty relations affect coalitions, presidential elections, and armed allies; ideology affects programs, candidates, and party rupture.

### What the Government Affairs cards build

Government Affairs becomes visible after the opening period, but individual actions require the SPD to govern, tolerate a cabinet, control Prussia, or hold a relevant ministry.

| Card family | Typical requirement | Long-run plot effect |
|---|---|---|
| Coalition affairs | Membership in a coalition | Trades policy concessions and resources for cabinet stability |
| Dealing with toleration | SPD supporting a minority cabinet | Decides whether temporary parliamentary support becomes complicity, withdrawal, or a new election |
| Economic policy | Economic/Finance influence and an adopted program | Implements WTB, moderation, nationalization, or other recovery stages |
| Fiscal policy | Government and fiscal influence | Moves budget, growth, unemployment, inflation, relations, and capital-strike pressure |
| Social welfare | Government influence | Trades budget and partner consent against worker security and legitimacy |
| Labor affairs and rights | Labor portfolio or governing access | Builds worker support and reform, with employer and coalition consequences |
| Economic democracy | Economic authority | Builds works councils and socialization capacity while increasing business resistance |
| Agricultural policy | Agriculture authority and later legal conditions | Affects rural support, tariffs, or land reform |
| Judiciary | Justice Ministry | Accumulates the four reforms needed for constitutional change and strengthens legal defenses |
| Constitutional reform | Justice, four judiciary reforms, neorevisionism, eligible cabinet | Changes electoral threshold, confidence rules, or presidential power |
| Police and domestic enemies | Interior, Prussia, or governing control | Builds police loyalty, investigates extremists, bans organizations, and prepares deportation |
| Deport Hitler | Completed investigation and security/legal prerequisites | Removes Hitler and weakens SA/NSDAP, with a risk of violent failure |
| Prussian affairs | SPD control of Prussia | Develops the police and regional democratic base later tested by the Prussian Coup |
| Military policy | Reichswehr portfolio | Alters army budget, policy, and loyalty used in coup calculations |
| Education and science | Government capacity | Slowly raises republican culture and long-run growth potential |
| Women's and homosexual rights | Suitable government and political support | Delivers social-reform outcomes and can change faction or coalition relations |
| Foreign policy and war guilt | Foreign-policy access | Changes reparations, European cooperation, pacifism, and international outcomes |
| Cabinet shuffle | Coalition leverage or cabinet conditions | Exchanges portfolio control and therefore changes which actions remain available |

Government actions are the bridge between winning office and changing the country. An SPD that enters cabinet without the relevant portfolio can be held responsible for conditions it cannot directly alter. This is why the election's ministry screen is a strategic commitment rather than administrative detail.

## The state model behind the story

### Voters are demographic support pools

The game does not simply add and subtract one national SPD percentage. It keeps a preference score for each party inside several demographic groups:

- workers;
- old middle class;
- new middle class;
- rural population;
- unemployed people;
- Catholics.

The first four class weights sum to 100, while unemployment and Catholic identity overlap them. The calculation nevertheless includes all six as separate weighted groups. Within each group, party preference scores are normalized; the normalized results are multiplied by group weights; party totals are then normalized nationally. Displayed party percentages are rounded independently, so the displayed total can differ from 100.

This lets actions have political shape. A workers' policy may gain SPD support among workers and unemployed people while a People's Party strategy exchanges some worker loyalty for middle-class, rural, and Catholic support. Austerity or failed crisis management can move unemployed workers toward the KPD and middle-class or rural voters toward the NSDAP.

It also means support gains are relative. Adding SPD preference to one group changes every party's normalized share within that group. The final national percentage may move less than the raw effect suggests.

Sources: `source/scenes/root.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/election_algorithm.scene.dry`.

### Parliamentary results are snapshots, not a permanent mirror of polling

`*_votes` tracks current normalized public support. At an election, the code records represented results in `*_r`. Coalition tests use the frozen `*_r` values until another election. This is conceptually sound: changing polling should not silently change Reichstag membership.

The visual parliament multiplies each represented percentage by five and rounds it, approximating a 500-seat chamber. Coalition formation, however, uses percentages and a 50-percent threshold rather than those displayed seat counts. A threshold reform excludes small parties and renormalizes the represented results. The Center calculation includes a fixed three points for the BVP, with three later removed from some coalition formulas.

The design therefore separates public opinion and legislative power, but it does not maintain a single exact seat ledger. That is one source of occasional visual or arithmetic inconsistency.

Sources: `source/scenes/election_algorithm.scene.dry`, `source/scenes/election_simulation.scene.dry`, `source/scenes/events/election_1928.scene.dry`.

### The five SPD factions

The SPD begins with five internal tendencies:

| Faction | Initial strength | Initial dissent | Broad gameplay interest |
|---|---:|---:|---|
| Left | 15 | 20 | KPD cooperation, nationalization, socialist transformation |
| Center | 30 | 0 | Party balance and continuity |
| Labor | 25 | 5 | Trade unions and the WTB employment program |
| Reformist | 25 | 5 | Parliamentary democracy, moderate policy, bourgeois coalitions |
| Neorevisionist | 5 | 10 | Mass democratic strategy, anti-Nazi mobilization, People's Party reform |

Strengths are renormalized after actions. Overall dissent is a strength-weighted average, capped at 95 percent. Many positive support effects are multiplied by `(1 - dissent)`. If overall dissent is 0.40, a nominal gain of 10 is only 6. Internal division therefore reduces the return on campaigning and policy long before a formal split occurs.

At faction dissent above 30, party-disunity content becomes available. At 60 or more, a faction can rupture permanently:

- the left forms the SAPD and takes supporters, advisers, and Reichsbanner members;
- centrist leaders resign and the party loses major figures and organization;
- reformist leaders resign, taking Braun and Severing among others;
- the unions declare independence, producing a large worker, supporter, adviser, and Reichsbanner loss.

This is one of the game's strongest systems. An ideologically coherent policy is easier to execute, but imposing it can destroy the coalition inside the party. Sources: `source/scenes/root.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/party_affairs/party_disunity.scene.dry`, and the four rupture events.

### Relationships are permissions as much as opinions

The principal interparty relationship values begin at approximately:

| Party | Initial relation |
|---|---:|
| Zentrum | 50 |
| KPD | 25 |
| DDP | 60 |
| DVP | 35 |

These numbers do more than influence flavor. They are gates for coalitions, presidential endorsements, toleration, votes of no confidence, KPD help in a civil war, and some event resolutions. Improving a relationship early can create a route years later. Allowing Blutmai, repeatedly attacking a coalition partner, or choosing policies hostile to business can close those routes.

The player cannot maximize every relationship. Moving toward the KPD often antagonizes liberal or conservative partners; moderating for Zentrum and DVP often raises left or labor dissent and harms KPD relations.

### Resources, budget, and leverage are different currencies

- **Resources** represent the SPD's discretionary political capacity. They pay for campaigns, bargaining, propaganda, and some program adoption. Party dues and fundraising replenish them.
- **Budget** represents state fiscal room. Government programs can push it negative; taxes, cuts, and later program stages can replenish it.
- **Leverage** exists mainly during coalition formation and buys ministries. It is not the same as either party resources or public support.

Conflating these would flatten the strategy. A popular SPD can lack resources to recruit an endorsement. A coalition-leading SPD can lack leverage to secure Justice or Interior. A government can have political resources but no budget for an employment program.

### The republic is its own constituency

`pro_republic` measures support for the democratic system. It begins at 59. High unemployment and inflation reduce it. Emergency rule, repeated inconclusive elections, and authoritarian concessions also reduce it. Democratic education, successful mobilization, and economic recovery can raise it.

When pro-republic sentiment falls below the combined support of the Weimar parties, the game applies a monthly drain: some middle-class and rural SPD or liberal support moves toward the NSDAP, and portions of the SPD base erode. Democracy is therefore not merely the sum of democratic parties. If the public's attachment to the system is weaker than the electoral coalition defending it, the coalition loses credibility.

This is a major causal bridge between economic policy and political collapse. A failed economy does not only cost the governing party votes; it changes the electorate's willingness to accept parliamentary democracy.

### Armed organizations are accumulated political capital

Initial raw strengths and militancies produce very different effective forces. The Reichsbanner starts large but with very low militancy; the Stahlhelm, SA, RFB, police, and Reichswehr use different multipliers and loyalty shares. The important point is that head count alone is not combat power.

Reichsbanner investment and street-fighting choices can raise strength and militancy. Police reform can raise loyalty. KPD relations determine how much RFB power joins a republican defense. Party dissent reduces Reichsbanner effectiveness and the general-strike contribution. The president and government determine how much of the Reichswehr supports the republic.

This produces a coherent delayed-defense mechanic: the coup scene reveals the coalition of forces that earlier political work assembled.

### Opening position and difficulty

The campaign opens in January 1928. Hindenburg is president, Wilhelm Marx of Zentrum is chancellor, the SPD is outside the national government, and the SPD controls Prussia. The May 1928 Reichstag election is the first fixed political deadline.

The starting parliamentary percentages are SPD 26, KPD 9, Zentrum 17, DDP 6, DVP 10, DNVP 20, NSDAP 3, and Other 9. These values describe the inherited Reichstag before the first in-game election; current polling is produced from demographic preferences.

Difficulty changes political capacity rather than only scaling one score:

| Mode | Resources | Dues | Reichsbanner | Budget | Political effect |
|---|---:|---:|---:|---:|---|
| Easy | 4 | 3 | 2,500 | 5 | Better partner relationships, less internal pressure, four-card hand |
| Normal | 2 | 2 | 2,000 | 4 | Baseline relationships and faction state, three-card hand |
| Hard | 0 | 1 | 1,000 | 3 | Weaker relationships and substantially higher faction dissent |
| Historical | 2 | 1 | 2,000 | 2 | Harder political state, no saves or polls, and two resources added each year |

Historical mode also fixes or restricts some character choices to keep the route closer to recorded history. This is not a neutral “ironman” switch: it changes information, resources, internal cohesion, and some available alternatives.

Source: `source/scenes/root.scene.dry`, `source/scenes/main.scene.dry`.

## Where the implementation can mislead the player

These observations describe code behavior. Some may be intentional simplifications; others are probable defects.

### Displayed seats and coalition math are not one exact ledger

The election freezes represented percentages, but the parliament chart approximates 500 seats through independent rounding while majority tests use percentages. Displayed vote shares are also independently rounded. A player can see totals that do not add to exactly 100 or a seat display that does not perfectly match coalition availability.

**Polish lesson:** calculate votes once, allocate an exact legal chamber size with a documented method, and use those same integer seats for all majority and coalition checks.

### Frequency metadata does not weight normal deck draws

Cards declare frequency values, but the ordinary unbounded deck draw is uniform among eligible cards in the baseline engine. Designers may believe a card is rare or common when it is not.

**Polish lesson:** either change the engine/deck configuration so frequency applies, or remove the misleading metadata and design availability with explicit cooldowns and conditions.

### Some political uncertainty is a flat coin flip

Multiple valid `go-to` destinations are selected uniformly. The DVP plea can therefore succeed or fail 50/50. Some rally disruptions and tied presidential outcomes can behave similarly.

**Polish lesson:** expose a probability derived from state, resolve deterministically at a threshold, or clearly label a chance event. Do not let an unmarked engine fallback decide an important historical branch.

### The civil-war menu suggests agency after the outcome is fixed

The result is calculated on scene entry. The player then chooses which sources of support to inspect, but those choices cannot change the outcome.

**Polish lesson:** present this as an audit of preparations, or postpone calculation and make commitments carry real costs and effects.

### Event priority can hide causal ordering

When several events are due, priority determines what appears first. Elections are deliberately low-priority. Without clear dates or a queue, a player may not understand why a crisis intervened before the scheduled election.

**Polish lesson:** show a short timeline or “events due this month” panel when order changes what choices remain available.

### Some thresholds are too opaque for long-lead planning

Justice plus four judicial reforms plus neorevisionism plus a specific coalition is a rich route, but a new player may learn the requirement only after it is too late. Similar opacity affects KPD goals, deportation, and armed defense.

**Polish lesson:** advisors, tooltips, or a policy-planning screen should reveal requirements without revealing every future story beat.

### Boolean and variable-name defects can change outcomes

The communist-ending precedence issue and `month_activities`/`month_actions` mismatch are examples. The source also includes some inconsistent singular/plural or legacy names. Such problems are particularly risky in Dendry because a valid-looking scene can silently read or write the wrong state.

**Polish lesson:** centralize important predicates, document canonical variables, and test each terminal route and calendar-consuming action.

### Historical labels sometimes conceal gameplay abstractions

“Seats” are effectively represented percentages in much of the German logic. Demographic groups overlap but are added as if they were separate weights. Coalition labels contain fixed adjustments such as the BVP subtraction. These abstractions may be suitable for the German game's balance, but their names can imply more precision than they have.

**Polish lesson:** label a value as polling, votes, mandates, relationship, or abstract influence according to what it actually represents.

## Source map

All German paths below refer to commit `5e2cfef`.

### Core loop and state

- `source/scenes/root.scene.dry` — initial date, difficulty, factions, parties, demographics, economy, armed forces, relations, and government.
- `source/scenes/main.scene.dry` — Party/Government decks, hand size, and pinned advisers.
- `source/scenes/post_event.scene.dry` — normalization, calendar, timers, economic feedback, legitimacy, yearly political drift, and event routing.
- `source/scenes/status.scene.dry` — player-facing state display.
- `source/scenes/library.scene.dry` — scene collections and card/event membership.
- `node_modules/dendrynexus/lib/engine.js` — deck selection, choice frequency, event priority, and multi-destination routing.

### Elections, cabinets, and parliament

- `source/scenes/election_algorithm.scene.dry` — electoral normalization and represented results.
- `source/scenes/election_simulation.scene.dry` — election display and simulated result handling.
- `source/scenes/events/election_1928.scene.dry` — every main coalition branch, no-majority escalation, chancellors, and ministry bargaining.
- `source/scenes/set_next_election_time.scene.dry` — election scheduling.
- `source/scenes/government_affairs/coalition_affairs.scene.dry` — routine coalition management.
- `source/scenes/events/vote_of_no_confidence.scene.dry` — coalition collapse.
- `source/scenes/events/unemployment_insurance_1.scene.dry` and `unemployment_insurance_weimar.scene.dry` — major coalition-policy dilemma.

### Party strategy

- `source/scenes/party_affairs/ideology.scene.dry` — periodic ideological decision.
- `source/scenes/party_affairs/party_disunity.scene.dry` — dissent response.
- `source/scenes/events/left_split.scene.dry`, `centrist_leaders_resign.scene.dry`, `reformist_leaders_resign.scene.dry`, `unions_declare_independence.scene.dry` — faction ruptures.
- `source/scenes/party_affairs/inter_party_relationships.scene.dry` — party diplomacy.
- `source/scenes/party_affairs/neorevisionism.scene.dry`, `peoples_party.scene.dry`, `peoples_party_campaigning.scene.dry` — democratic mass-party route.
- `source/scenes/party_affairs/confronting_nazis.scene.dry`, `iron_front.scene.dry`, `reichsbanner.scene.dry`, `streetfighting.scene.dry` — anti-fascist organization and coercive preparation.

### Economy and social policy

- `source/scenes/party_affairs/crisis_program.scene.dry` — adoption of WTB, moderate, or nationalization strategy.
- `source/scenes/government_affairs/economic_policy.scene.dry` — implementation.
- `source/scenes/government_affairs/fiscal_policy.scene.dry` — taxes, cuts, tariffs, and fiscal tradeoffs.
- `source/scenes/government_affairs/economic_democracy.scene.dry` — works councils and socialization preparation.
- `source/scenes/government_affairs/social_welfare.scene.dry` — welfare choices.
- `source/scenes/events/black_thursday.scene.dry` and annual `1929`–`1932` scenes — Depression shocks.
- `source/scenes/events/businesses_lose_confidence.scene.dry`, `capital_strike.scene.dry` — accumulated business confrontation and its crisis.
- `source/scenes/events/economic_recovery.scene.dry`, `return_to_normalcy.scene.dry` — late recovery.

### Institutions, presidency, and conflict

- `source/scenes/government_affairs/judiciary.scene.dry` — judicial-reform buildup.
- `source/scenes/government_affairs/constitutional_reform.scene.dry` — threshold, constructive no confidence, and presidential-power amendments.
- `source/scenes/government_affairs/police.scene.dry`, `deport_hitler.scene.dry` — policing and deportation chain.
- `source/scenes/events/presidential_election_1932.scene.dry` — Hindenburg, Braun, Thälmann, and Nazi candidates.
- `source/scenes/events/papen_chancellor.scene.dry`, `prussian_coup.scene.dry`, `schleichers_schemes.scene.dry`, `hitler_chancellor.scene.dry` — authoritarian escalation.
- `source/scenes/events/march_on_berlin.scene.dry`, `civil_war.scene.dry` — coup and war calculations.
- `source/scenes/events/death_of_hindenburg_president.scene.dry`, `death_of_hindenburg_normal.scene.dry` — 1934 succession.

### Endings

- `source/scenes/events/1934_end.scene.dry` — normal terminal routing.
- `source/scenes/events/game_over_1934.scene.dry` — 1934 combination achievements.
- `source/scenes/game_over.scene.dry` — conditional ending panels and achievement ledger.

## Clarifications and numerical reference

This section provides the exact numerical reference behind the descriptive guide. It distinguishes stored variables from descriptive phrases used elsewhere in the report. All predicates and effects below describe the German baseline at commit `5e2cfef`; they are not proposals for Polish mechanics.

### Which strategic concepts are actually numerical?

Most of the German game is numerical, but several useful descriptions are calculated from several variables rather than stored under one name.

| Concept used in this report | What the code actually stores | Initial value | What it means |
|---|---|---:|---|
| Party resources | `resources` | 2 | SPD funds and discretionary political capacity |
| State budget | `budget` | 4 | Abstract fiscal room for government policy |
| Coalition leverage | `leverage` | Set after an election | Temporary points used to obtain the chancellorship and ministries |
| Democratic legitimacy | `pro_republic` | 59 | Public commitment to the republic; normally kept between 0 and 99 |
| Internal party cohesion | Five faction-dissent values plus calculated `dissent` | 5–20 by faction; about 0.05 overall | Faction opposition and the resulting penalty to SPD actions |
| Coalition stability | `coalition_dissent` | 0 | Anger among the SPD's bourgeois or centrist governing partners |
| Communist coalition stability | `kpd_coalition_dissent` | 0 | KPD anger inside a United Left or Popular Front cabinet |
| KPD willingness to govern | `communist_coalition` | 0 | Accumulated normalization of parliamentary cooperation with the KPD |
| Business confrontation | `capital_strike_progress` | 0 | Accumulated pressure toward an investment stoppage; crisis at 10 |
| Right-wing coup preparation | `coup_progress` | 0 | Accumulated provocation and readiness for a right-wing coup; main threshold at 10 |
| SPD recognition of the Nazi threat | `nazi_urgency` | 0 | How seriously the party takes the NSDAP, described in code as a 0–10 scale |
| Broader polarization | `radicalization` and `strife` | 0 and 0 | Separate political-radicalization and street-conflict pressures |
| Armed organizations | Strength, militancy, and sometimes loyalty for each force | Varies | Inputs to coup and civil-war calculations |
| Electoral support | A preference score for every party in every demographic bloc | Varies | Inputs to normalized vote shares |
| Parliamentary strength | `*_r` represented percentages | Set at an election | Frozen coalition arithmetic until the next election |
| Program support and progress | `wtb_support`, `moderate_plan_support`, `nationalization_support`, adoption flags, and progress counters | 0 | Whether a program can be adopted and how far it has been implemented |
| Institutional preparation | `judicial_reform`, `democratization`, `investigate_far_right`, and amendment flags | 0 | Access to constitutional, legal, and security actions |

Three earlier phrases need qualification:

- **Strike capacity is derived.** There is no `strike_capacity` variable. In civil war the code builds it from normalized SPD worker support and, when relations permit, KPD worker support. It then modifies that total by labor dissent and unemployment.
- **Organization is a category.** There is no single general `organization` score. Resources, dues, welfare organizations, cultural organizations, media, youth work, faction cohesion, and Reichsbanner strength all represent different organizational capacities.
- **Effective force is calculated at the confrontation.** The game combines each formation's strength with militancy and, for state forces, loyalty. The Reichsbanner is also weakened by SPD dissent. A displayed head count therefore does not equal combat power.

Several of these values are hidden from the normal status screen. The screen shows resources, budget, economic indicators, relations, faction state, armed strengths and loyalties, polling, and coalition dissent, but does not expose `coup_progress`, `capital_strike_progress`, `communist_coalition`, or `nazi_urgency` as exact numbers. Sources: `source/scenes/root.scene.dry`, `source/scenes/status.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/events/civil_war.scene.dry`.

### Resources, leverage, and budget are three separate currencies

All three are numerical, but they answer different questions.

- **Resources:** can the SPD pay for a party action, political bargain, endorsement, propaganda campaign, or emergency concession? Fundraising and dues replenish them.
- **Leverage:** how much of the cabinet can the SPD claim immediately after an election? It is initialized from the SPD's represented percentage and then spent within the coalition-negotiation sequence.
- **Budget:** can the state finance policy? It changes unemployment, inflation, and economic policy and can become negative.

For example, an SPD represented at 30 percent begins the ordinary negotiation with 30 leverage. Making Braun chancellor costs 10, Interior costs 5, and Justice costs 10, leaving 5 for Labor. This consumes no party resources and no state budget. Dropping a ministry refunds its leverage cost. Conversely, paying three resources to calm a coalition does not repair a negative state budget. A government can therefore be electorally strong, organizationally poor, and fiscally constrained at the same time. Sources: `source/scenes/events/election_1928.scene.dry`, `source/scenes/events/vote_of_no_confidence.scene.dry`.

### How an ordinary deck draw works, in plain language

When the player draws from Party Affairs or Government Affairs, the engine first makes a list of every card that is legal now: its `view-if` is true, it has not exceeded `max-visits`, and it is not already in the hand. It then picks one position from that list with equal probability.

If eight cards are eligible, each has a one-in-eight chance. In the baseline, a `frequency: 300` fundraising card is not twelve times as likely to be drawn as a `frequency: 25` constitutional-reform card. The `frequency` field matters only when the engine must reduce a scene's eligible choices to a configured `max-choices` subset. The main decks use `max-cards` to limit hand size; that is a different setting and does not activate frequency weighting. Mandatory events use separate eligibility and priority routing rather than this ordinary deck draw. Sources: `source/scenes/main.scene.dry`, `node_modules/dendrynexus/lib/engine.js`.

### Complete economic indicator map

The four principal live economic indicators are:

| Indicator | Initial value | Direct gameplay role |
|---|---:|---|
| `unemployed` | 8.6 | Percentage-style unemployment; weighs the unemployed electoral bloc, gates policies and events, damages legitimacy at high levels, and classifies the ending |
| `inflation` | 2.9 | Percentage-style inflation/deflation; deficits raise it, extreme values slow growth, and inflation at 7 or more triggers a political crisis while the SPD governs |
| `economic_growth` | 4.4 | Rate-like growth counter; changes monthly unemployment at thresholds and contributes to accumulated expansion |
| `budget` | 4 | Abstract fiscal points; pays for programs, influences monthly inflation, and triggers a capital strike at −5 while the SPD governs |

Supporting variables complete the economic model:

- `economic_expansion` accumulates favorable or unfavorable economic movement and gates the economic-expansion event;
- `works_program`, `wtb_implemented`, `moderate_plan_progress`, `nationalization_progress`, `socializations`, `works_councils`, and `factory_takeovers` record policy depth;
- `upper_tax_rates`, `lower_tax_rates`, and `tariffs` record fiscal choices;
- `welfare` and `reparations` support specific events and policies, while the calculated `science_bonus` changes the long-run growth floor;
- `income` is initialized to 1,600 but never read or changed elsewhere in the German baseline;
- `capital_strike_progress` measures political-economic confrontation with capital;
- `workers_qol`, `old_middle_qol`, `new_middle_qol`, and `rural_qol` start at 100 but are marked as currently unused in the root scene.

The initial values are conditions, not a one-time bonus. Unemployment at 8.6 gives the unemployed bloc a weight in every election and leaves job-creation actions barely relevant, but it is below the 15 and 30 legitimacy-loss thresholds. Inflation at 2.9 is below the high-inflation crisis threshold of 7. Growth at 4.4 is healthy, but it does not initially lower unemployment: the monthly rule requires unemployment of at least 12 for growth of at least 4, or unemployment of at least 7 together with growth of at least 6. In January 1929 the annual shock subtracts 4 from growth, bringing an unchanged 4.4 close to stagnation.

Growth is not a hidden GDP multiplier. Each month it affects unemployment in steps:

- growth below −0.5 can add 0.1 unemployment;
- growth below −5 can add another 0.1;
- growth of at least 2 can remove 0.1 when unemployment is at least 17;
- growth of at least 4 can remove another 0.1 when unemployment is at least 12;
- growth of at least 6 can remove another 0.1 when unemployment is at least 7;
- growth of at least 8 can remove another 0.1 when unemployment is at least 3.

High positive growth decays over time. Inflation at roughly 7.5 or above and severe deflation also reduce growth. Positive growth while the SPD governs contributes to `economic_expansion`; that event requires expansion of at least 85, unemployment at most 6, inflation at most 6, and an SPD government. The late Return to Normalcy route does not check growth directly. It checks whether the results have reached unemployment at most 13, inflation below 7, republican support at least 50, no Papen or Schleicher chancellor, and coup progress below 9. Sources: `source/scenes/post_event.scene.dry`, `source/scenes/events/1929.scene.dry`, `economic_recovery.scene.dry`, `return_to_normalcy.scene.dry`, `game_over.scene.dry`.

### `coup_progress`, `nazi_urgency`, and capital-strike pressure

`coup_progress` is a hidden abstract counter for how close right-wing forces are to attempting to overthrow an SPD government. It is not a probability and it does not measure the SA alone. Confrontational steps raise it: adopting the nationalization program adds 1; forming a Popular Front adds 2; forming a United Left adds 3; uncompensated nationalization adds 3; worker takeovers add 5; resisting a capital strike through seizures adds 6. Land reform, military cuts, some pacifist or judicial actions, and election postponement can also add points. Successful policing, concessions in foreign policy, recovery, or defeating a march can reduce or reset it.

At 6, the Harzburg Front event can occur early. At 10, from 1930 onward, an SPD government faces the March on Berlin if either SA or Stahlhelm remains legal. A left coalition is checked immediately after its formation, so adding the formation penalty can take an existing 7 or 8 directly into civil war. Return to Normalcy requires less than 9. The practical lesson is to treat 6 as danger, 9 as the last recovery-safe value, and 10 as the main coup trigger. Sources: `source/scenes/events/harzburg_front.scene.dry`, `march_on_berlin.scene.dry`, `election_1928.scene.dry`, `source/scenes/government_affairs/economic_policy.scene.dry`.

`nazi_urgency` means how seriously the SPD takes the Nazi threat. It is not NSDAP popularity, organization, SA strength, or coup readiness. It rises when the player defines the NSDAP as the main enemy, adopts neorevisionism, studies the enemy, investigates the far right, reacts to the Harzburg Front, or uses relevant Mierendorff actions. It unlocks anti-Nazi content: confronting the Nazis needs both meaningful NSDAP representation and urgency above 1; the Iron Front needs at least 3; SA bans, anti-Nazi police work, response to antisemitism, and the deportation route also use urgency thresholds. The root comment calls it a 0–10 scale, but the baseline does not visibly clamp it after every change.

`capital_strike_progress` is the exact business-confrontation counter. A warning scene appears at 6–9 if the SPD governs and the budget is above −5. The capital strike itself occurs once progress reaches 10 **or** the budget reaches −5 while the SPD governs. On arrival it adds 5 unemployment, subtracts 4 growth, cuts SPD worker and unemployed preferences to 70 percent of their former values, damages middle-class and rural support, removes 15 republican legitimacy, worsens Zentrum and DVP relations, and strengthens the NSDAP across several blocs. The response comes after that damage: capital controls or factory seizures can mitigate parts of it, while propaganda repairs political support but not the whole economic shock. Sources: `source/scenes/events/businesses_lose_confidence.scene.dry`, `capital_strike.scene.dry`, `source/scenes/government_affairs/fiscal_policy.scene.dry`, `economic_policy.scene.dry`.

### WTB: funded versus deficit implementation, and what “too late” means

The baseline has no variable or choice called “strong WTB” or “weak WTB.” Those phrases obscured the actual distinction. WTB has repeated implementation stages, and each stage can be funded or deficit-funded.

The player first needs Black Thursday, an open Crisis Program card, and `wtb_support >= 3` to adopt WTB. The Economic Policy card then requires an SPD government and SPD control of either Economic or Finance. It has a 12-month cooldown. Its normal cost begins at 4 budget and falls by 1 if the government has at least two works-council levels, at least one socialization, or at least two pro-labor decisions.

For the first implementation:

- **Funded:** pay the full calculated cost; unemployment falls by 4, inflation rises by 2, growth rises by 2.8, and republican and SPD worker support improve. It adds no business pressure or bourgeois coalition dissent.
- **Deficit-funded:** the budget still falls by the calculated cost; unemployment falls by 4, inflation rises by 3, growth rises by 3, coalition dissent rises by 1, and capital-strike progress rises by 1. Historical mode adds another coalition-dissent point, and Brüning as chancellor adds another.

Both versions add 1 KPD coalition dissent and reduce KPD relations by 5 in a United Left or Popular Front, because the KPD treats WTB as preservation of capitalism.

Later stages have their own branches. An early continuation can restore 1 budget, reduce unemployment by 5 when conditions are especially favorable or otherwise by 3, add 1.5 inflation and 1.2 growth, improve Zentrum/DVP relations, remove 1 coalition dissent, and reduce capital-strike pressure by 1 if it is at least 3. Later fully funded stages cost 3 budget, reduce unemployment by 3, add 2 inflation and 1.6 growth. A later deficit stage is available with budget below 3 but at least −3 and unemployment above 10; it adds 1 coalition dissent and 1 capital-strike pressure, with 3 inflation and 1.6 growth.

The yearly shocks inspect `works_program`, which WTB and other job programs increment:

- in January 1931, one or more stages soften the shock; two or more produce an additional improvement;
- in January 1932, two or more stages gain the favorable offset, while zero stages suffer the full additional unemployment and contraction.

Thus “too late” has two concrete meanings. A first implementation completed only after January 1931 cannot reduce that January shock. Entering January 1932 with fewer than two `works_program` stages misses that year's stronger protection. The 12-month Economic Policy cooldown makes that planning constraint severe. WTB choices also disappear when unemployment is too low, and a late deficit continuation requires unemployment above 10. Sources: `source/scenes/party_affairs/crisis_program.scene.dry`, `source/scenes/government_affairs/economic_policy.scene.dry`, `source/scenes/events/1931.scene.dry`, `1932.scene.dry`.

Deficit WTB does not mechanically trigger a capital strike by itself. Each deficit stage adds only 1 pressure. The danger is interaction: repeated deficit stages accumulate pressure, a budget at −5 independently triggers the strike, and the resulting inflation can reach 7, causing the High Inflation event, which adds another capital-strike point and damages support and legitimacy.

The Moderate plan has the actual full/partial distinction. Its full action costs 2 budget, removes 3 unemployment, and adds 1.6 growth. Its partial action costs 1, removes 2 unemployment, and adds 0.7 growth. Both are compatible with a parliamentary-survival strategy. “Moderate” names the economic program; “parliamentary survival” names the political objective of maintaining a democratic government. A player can pursue parliamentary survival with WTB, moderation, nationalization, or even inaction, although each creates a different level of economic, coalition, and coup risk.

### Coalition dissent and the constructive vote of no confidence

A normal vote of no confidence allows a parliamentary majority to remove a cabinet even if those parties cannot agree on a successor. A **constructive** vote requires the motion to name and support a replacement chancellor at the same time. In the game's abstraction, passing that constitutional amendment sets `constructive_vonc = 1`. It is intended to block the ordinary right-partner and KPD no-confidence events, and the KPD predicate does so explicitly. KPD contract failure then reduces a left cabinet to a minority government rather than immediately voting it out.

`coalition_dissent` begins at 0 after coalition formation. Confrontational labor, welfare, tax, constitutional, military, land, and socialist policies add points; concessions, some foreign-policy successes, coalition management, and certain program continuations remove them. The intended thresholds are:

- 3 for a Grand Coalition, Popular Front's bourgeois partners, or minority government;
- 4 for a Weimar Coalition.

The baseline predicate lacks outer parentheses: the final `spd_r < 50` and `not constructive_vonc` checks appear syntactically attached only to the Weimar branch. This may allow the 3-point branches to fire despite an SPD majority or constructive amendment, depending on Dendry operator precedence. That is an implementation defect or ambiguity, not a design rule to copy.

Crossing the threshold triggers a crisis rather than silently deleting the cabinet. The player may give up Prussia or enact massive austerity to reset dissent to 0; spend 3 resources to remove 1 point; ask the KPD for a replacement left coalition if `communist_coalition >= 3`, KPD relations are at least 50, and KPD seats can replace the departing pivotal partner; or allow the vote. Allowing it schedules an election in three months. Hindenburg installs Brüning; Braun leaves an SPD caretaker cabinet without policy power. Spending resources only removes one point, so a cabinet already at 4 may remain at the 3-point trigger and face the crisis again.

`kpd_coalition_dissent` is a separate counter. It triggers at 3 in a Popular Front and 4 in a United Left, provided the SPD lacks an outright majority and has not passed the constructive amendment. WTB and the Moderate program each add 1; welfare cuts, anti-labor choices, military support, repression of communists, and concessions to bourgeois partners can add more. The player can spend 3 resources to remove 1 before the KPD's formal ultimatum, switch to a viable Weimar or Grand Coalition, appoint Thälmann under President Braun and provoke civil war, or accept collapse. This separation is why a Popular Front is difficult: policy that satisfies Zentrum/DDP can anger the KPD, while nationalization, labor militancy, secular policy, and redistribution can anger the bourgeois partners. Sources: `source/scenes/events/vote_of_no_confidence.scene.dry`, `kpd_vote_of_no_confidence.scene.dry`, `kpd_ultimatum.scene.dry`, `source/scenes/government_affairs/constitutional_reform.scene.dry`.

### Exact parliamentary routes and relations

The routes are not mutually exclusive campaign classes. A player builds overlapping state, then selects among whatever coalition predicates are true after each election. One economic plan is exclusive because adoption sets `economic_plan`, but it can be combined with a coalition route, constitutional reform, a presidential strategy, party broadening, and armed preparation.

The important late coalition alternatives are:

- **New Grand Coalition:** `neo_weimar_coalition >= 50`, ordinary `grand_coalition < 50`, Zentrum relation at least 50, and DVP relation at least 30. Forming it then costs 2 resources.
- **Wirth Government of National Unity:** Joos must lead Zentrum, `neo_weimar_coalition >= 50`, ordinary Weimar Coalition below 50, and Zentrum relation at least 10. Acceptance sets Wirth as chancellor and fixes leverage at 15.
- **Wirth minority toleration under Braun:** Joos must lead Zentrum and Braun must be president.
- **Switching away from an angry KPD:** a Weimar majority needs Zentrum relation at least 40; a Grand majority needs Zentrum at least 45 and DVP at least 30.

The “Neo-Weimar” number is parliamentary arithmetic for the broader constitutional-party bloc. It is not a relationship score. Relations decide whether the arithmetic can become a cabinet. Sources: `source/scenes/events/election_1928.scene.dry`, `kpd_vote_of_no_confidence.scene.dry`.

### `communist_coalition`, KPD rapprochement, and the two left cabinets

`communist_coalition` is a hidden number, not a card, party, or cabinet flag. It records whether cooperation with the KPD has become thinkable. The main ways to raise it are:

- choose the left ideological direction: +1;
- use early interparty outreach to the KPD: +1 on each of the first two applicable attempts;
- use Levi or Rosenfeld to promote cooperation: +1 on early applicable uses;
- infiltrate or investigate Comintern networks: +1 on its first applicable result;
- engineer a Conciliator victory at the KPD conference: +3;
- participate with the KPD on May Day: +2;
- support the KPD/Thälmann presidential line: +2;
- seek KPD toleration in a confidence crisis: +1;
- use Soviet contacts to improve KPD cooperation: +1 on the first applicable use.

Banning the RFB or choosing some anti-KPD police responses reduces it. These points do not replace `kpd_relation`; both must normally be high enough.

KPD rapprochement has action-specific costs rather than one standard tariff. The recurring interparty approach typically adds 6 KPD relation multiplied by party cohesion, but also adds 2 reformist dissent, removes 2 Zentrum relation, and removes 3 DVP relation. After a previous coalition it gives 8 KPD relation but costs 3 with Zentrum and 3 with DVP. Levi gives about +6 KPD relation with +3 reformist dissent; Rosenfeld gives about +4 with +2. Letting the KPD demonstrate on May Day gives +10 KPD relation, costs 3 with Zentrum and DVP, and adds 1 coalition dissent; joining the demonstration gives +15 but costs 10 with each and adds 2 coalition dissent. Therefore “move toward the KPD” is a family of trades whose severity depends on the chosen action. Sources: `source/scenes/party_affairs/inter_party_relationships.scene.dry`, `ideology.scene.dry`, `source/scenes/advisors/levi.scene.dry`, `rosenfeld.scene.dry`, `source/scenes/events/blutmai.scene.dry`.

The **United Left** requires:

1. `left_coalition >= 50` in represented parliamentary arithmetic;
2. `communist_coalition >= 3`;
3. KPD relation at least 50, or at least 40 if the Conciliators lead;
4. at the final settlement, either 3 resources, KPD relation at least 60, or Conciliator leadership; a special Thälmann option also exists with Braun as president and the SPD left stronger than reformists plus neorevisionists.

Success adds 3 coup progress, 2 capital-strike pressure, and 10 KPD relation. If the new coup total is at least 10, civil war follows immediately.

The **Popular Front** needs a represented majority and a larger web of relations because it combines KPD, SPD, Zentrum/BVP, and DDP. The ordinary entry gate requires:

- `communist_coalition >= 3`;
- DDP relation at least 50;
- with Thälmann, KPD relation at least 65; with Conciliators, at least 45;
- with Joos leading Zentrum, Zentrum relation at least 45; otherwise at least 65 with Thälmann or 55 with Conciliators.

A special favorable combination of Joos and Conciliator leadership bypasses the ordinary DDP and `communist_coalition` gates as well: apart from the parliamentary majority, it requires only Zentrum and KPD relationships of at least 30. At the final settlement outside that special branch, the player needs 4 resources, or KPD relation at least 60 together with `communist_coalition >= 3`, or Conciliator leadership, or Braun as president. Success adds 2 coup progress and is immediately checked against 10.

The “incompatible partners” are incompatible in policy objectives, not blocked by a hardcoded ban. The KPD contract demands welfare, nationalization, progressive taxation, labor support, military cuts, and later Soviet relations. Zentrum and the liberals object to many socialist, secular, anti-military, or confrontational measures. The cabinet can therefore have a parliamentary majority while accumulating dissent on both sides. Sources: `source/scenes/events/election_1928.scene.dry`, `kpd_goals.scene.dry`, `kpd_goals_2.scene.dry`.

### How the KPD governing contract is chosen and evaluated

The first successful United Left or Popular Front term generates its contract only if the next election is more than 12 months away. Welfare is always required. Agriculture, nationalization/economic policy, progressive finance, labor support, and military cuts are required when the associated ministry is not held by the KPD. In the implemented coalition-formation route the KPD abstains from taking ministries, so in ordinary play all six become active. Foreign policy is inactive in the first contract.

The starting deadline is 12 months, extended to 16 when KPD relation is at least 60 and to 24 when the Conciliators lead or the constructive-vote amendment exists. Because these assignments occur sequentially, the 24-month rule overrides the 16-month value.

After one successful contract, the next contract is fixed differently: agriculture, economy/nationalization, labor, and improved Soviet relations are active; welfare and finance are inactive. Its deadline is 16 months, 20 with KPD relation at least 60, and 24 with Conciliator leadership. The constructive-vote extension is absent from this second-contract file.

The contract uses completion counters:

- welfare: expand welfare;
- agriculture: enact land reform;
- economy: implement substantial nationalization;
- finance: make taxes more progressive;
- labor: support workers in labor disputes;
- foreign: improve Soviet relations;
- Reichswehr: reduce military funding.

At the ultimatum the code begins `kpd_score` at 6 and subtracts 1 for every active scored goal that remains incomplete. The coalition succeeds only if **every active goal** is complete; a high score by itself is insufficient. Failure immediately costs 10 KPD relation and 8 points of SPD preference among workers and unemployed voters.

The exact six-month extension predicate is:

```text
(kpd_score >= 4 AND kpd_relation > 50 AND kpd_appeal_seen = 0)
OR kpd_party_leader = "Conciliators"
```

Thus Thälmann's KPD grants one appeal only when no more than two scored active goals are unfinished, relations are strictly above 50, and no appeal has already been used. The score always starts at 6, so it is not simply the number of completed goals in a shorter second contract. Conciliator leadership bypasses those three checks in the written predicate. This may even bypass the “one appeal” flag; it should be treated as a likely implementation oversight rather than copied as an intended unlimited extension. The extension adds six months to the remaining timer. Sources: `source/scenes/events/kpd_goals.scene.dry`, `kpd_goals_2.scene.dry`, `kpd_ultimatum.scene.dry`.

### Exact Wittorf-to-Conciliator chain

The Conciliator route has three timed gates:

1. **Wittorf Affair, August–October 1928:** it appears only with KPD relation at least 30 and prior Comintern contact. Concealing the information requires Paul Levi or Kurt Rosenfeld as an adviser. It sets `wittorf_secret = 1` and adds 5 dissent to both reformists and the SPD left.
2. **Foreign Policy before June 1929:** with the secret held, select the Wittorf option during 1928 or January–May 1929. It sets `wittorf_soviet_union = 1` and improves KPD relations by 6 multiplied by party cohesion.
3. **KPD Conference, June–August 1929:** the event needs `wittorf_soviet_union = 1` and KPD relation at least 50. A Conciliator victory additionally requires Levi or Rosenfeld, KPD relation at least 50, and SPD left strength at least equal to reformist strength. Success adds 3 `communist_coalition`, 10 KPD relation multiplied by cohesion, 5 left strength, and removes 8 left dissent.

Missing any date window breaks the chain even if relations are raised later. Sources: `source/scenes/events/wittorf_affair.scene.dry`, `source/scenes/government_affairs/foreign_policy.scene.dry`, `source/scenes/events/kpd_conference.scene.dry`.

### When the People's Party route causes rupture

The People's Party proposal becomes available after neorevisionism and `peoples_party_support >= 3`. Smooth adoption requires support of at least 4 and combined neorevisionist plus reformist strength at least as large as left plus center strength. It then adds 25 left dissent and 20 center dissent. Forced adoption adds 40 to each.

Party-disunity content becomes eligible when any faction exceeds 30 dissent or overall dissent reaches 0.30. Permanent rupture occurs at 60. With the initial left dissent of 20, forced adoption takes the left directly to 60 and therefore makes a split immediately eligible. Smooth adoption takes it to 45, so it does not split the initial party by itself, but any earlier 15 points of left dissent makes it reach the rupture threshold. Center dissent follows the same logic from its current value.

A left split halves left strength, removes worker and unemployed support, subtracts 300 Reichsbanner strength, loses advisers, and worsens KPD relations. A center rupture removes major leaders, sharply reduces its strength, and also costs organization and worker support. This is the exact sense in which electoral expansion can be cancelled by internal rupture. Sources: `source/scenes/party_affairs/peoples_party.scene.dry`, `party_disunity.scene.dry`, `source/scenes/events/left_split.scene.dry`, `centrist_leaders_resign.scene.dry`.

### Ministries as policy routes

Ministries are permissions for action families:

| Portfolio | Principal routes it controls or supports |
|---|---|
| Economic or Finance | Implement WTB, Moderate, or nationalization program; manage economic intervention |
| Finance | Taxes, spending, tariffs, and budget repair; shares access to the crisis plan |
| Interior | Police policy, investigations, bans, and the Hitler-deportation chain |
| Justice | Judicial reform, constitutional amendments, and legal protection for transformative or security policy |
| Labor | Labor disputes, working conditions, and worker-oriented policy |
| Agriculture | Tariffs, rural intervention, and land reform |
| Reichswehr | Military funding, doctrine, loyalty, and the armed balance |
| Foreign | Reparations, Soviet and Western relations, Wittorf diplomacy, customs union, and foreign-policy endings |

The chancellorship is a political and event-routing office rather than another policy card family. Prussian control is also separate from the Reich Interior portfolio and supplies police and regional-government capabilities. Since several actions accept either of two portfolios or use government-wide access, each row is a principal route rather than a claim of exclusive ownership. Sources: `source/scenes/library.scene.dry`, `source/scenes/government_affairs/*.scene.dry`, `source/scenes/events/election_1928.scene.dry`.

### Strong and weak parliamentary survival

Parliamentary survival is strongest when the player combines a represented majority with adequate relations, low coalition dissent, economic stabilization, and constitutional protection. The constructive-vote amendment blocks ordinary destructive no-confidence motions. Reduced presidential powers blocks or changes the Papen appointment, Prussian Coup, emergency-government, and extremist-presidency chains. The electoral threshold can simplify later coalition arithmetic. Justice preparation and control of Prussia add legal and police defenses.

Without those amendments, democratic survival remains possible but is contingent. The player must keep coalition dissent below 3 or 4, retain the exact partner relations for each post-election coalition, avoid the Hindenburg appointment chain, maintain Prussia, and reach recovery before repeated no-majority elections strengthen presidential government. Electing Braun helps because it changes appointment and armed-force branches, but under weak parliamentary arithmetic his emergency cabinet can still trigger a coup or no-confidence vote.

Under Braun, a no-majority emergency cabinet faces an immediate far-right coup when NSDAP plus DNVP represented strength is at least **45 percent**. Below 45, the game calculates a confidence vote. Zentrum, DVP, KPD, and minor parties join the opposition when their relevant relationship test is below 45; if total opposition is greater than 50, the cabinet loses. Braun is therefore a defensive asset, not a substitute for parliament and relationships. Sources: `source/scenes/events/election_1928.scene.dry`, `source/scenes/government_affairs/constitutional_reform.scene.dry`, `source/scenes/events/papen_chancellor.scene.dry`, `prussian_coup.scene.dry`.

### Modes of losing and mixed endings

Routes can be mixed, and so can outcomes. The end screen checks many conditions independently, so a run can avoid Hitler while still end in authoritarian government, mass unemployment, party collapse, or unresolved civil war. The main failure modes are:

1. **Unopposed Nazi seizure:** Hitler or another Nazi reaches the presidency or chancellorship, and the SPD accepts the takeover or does not enter a successful resistance branch.
2. **Military defeat:** in civil war, total allied power below 60 percent of enemy power produces decisive defeat.
3. **Long civil war:** allied power from 60 percent through 110 percent of enemy power produces prolonged, unresolved war rather than a clean republican victory.
4. **Revolutionary polarization:** Thälmann as president or chancellor under unreformed conditions immediately provokes right-wing civil war, whose outcome still depends on accumulated force.
5. **Authoritarian survival without Hitler:** ending under Papen, Schleicher, or Brüning can avoid an immediate Nazi ending while leaving parliamentary democracy broken or gravely weakened.
6. **No-majority ratchet:** repeated failed coalitions and elections move the chancellorship through emergency cabinets toward Papen, Schleicher, and Hitler.
7. **Economic-democratic collapse:** unemployment at 20 or more receives the worst mass-unemployment ending; high inflation and low republican legitimacy strengthen extremist routes before 1934.
8. **Capital strike:** the one-time shock can destroy economic and electoral capacity even if it does not immediately end the game.
9. **Party rupture:** a left, center, reformist, or union split removes advisers, voters, faction strength, and defensive organization.
10. **Loss of Prussia:** surrendering or losing the state government removes a major police and institutional defense and opens later authoritarian action.
11. **Coalition-contract failure:** excessive ordinary/KPD coalition dissent or failure of the KPD goals collapses a cabinet and schedules another election or leaves an obstructed minority.
12. **Far-right electoral strength:** a 50-percent NSDAP–DNVP coalition can install the far right or, under Braun, turn immediately to a coup; the separate Braun emergency threshold is 45.

A “win” is likewise multidimensional. Parliamentary democracy, low unemployment, socialist transformation, party unity, Hitler's removal, a favorable presidency, and victory in civil war are evaluated by different ending panels and achievements. A player can combine parts of several routes, but cannot assume that success on one axis repairs failure on another. Sources: `source/scenes/events/election_1928.scene.dry`, `march_on_berlin.scene.dry`, `civil_war.scene.dry`, `1934_end.scene.dry`, `source/scenes/game_over.scene.dry`.

## Findings from the second full audit

A file-by-file pass beyond the election-to-collapse spine found several systems that are strategically important because they determine whether the player can reach that spine with the necessary permissions and preparation.

### Advisors form a second route-access system

The three advisor slots do more than provide numerical bonuses. Many advisors can reset a card timer and jump directly into that card's menu. This lets the player use a route without waiting to draw the relevant card, or revisit a route sooner than its ordinary cooldown allows. The shared advisor-action timer is normally six months, with Hilferding's faction-balancing action using five.

The most important access shortcuts are:

| Advisor | Route access or strategic function |
|---|---|
| Müller, Braun, Breitscheid, Wels | Coalition repair, party discipline, or calling an early election when the office gate is met |
| Braun, Severing | Prussian policy; Severing also opens national police policy |
| Radbruch | Judiciary and constitutional reform |
| Hilferding | Fiscal policy and economic democracy |
| Woytinsky | Immediate WTB adoption, economic-policy implementation, and a special London Conference recovery option |
| Baade | Agricultural policy and WTB preparation |
| Wissell | Labor rights |
| Breitscheid | International party relations and Foreign Policy |
| Levi, Rosenfeld | KPD rapprochement and the Wittorf/Conciliator route |
| Pfülf, Leber | People's Party development and campaigning |
| Hirschfeld, Pfülf, Siemsen | Homosexual rights, women's rights, education, science, and curriculum access |
| Mierendorff, Stampfer, Schumacher | Iron Front, media, anti-Nazi urgency, and Reichsbanner capacity |

This changes route planning. A portfolio gives legal authority, a card supplies the ordinary opportunity, and the right advisor supplies reliable or accelerated access. The advisor does not waive the policy's substantive conditions: for example, Radbruch can open constitutional reform, but the referendum still needs enough parliamentary and republican support.

The roster also has irreversible calendar pressure. Levi dies from February 1930 onward and Müller from March 1931 onward; either is removed from the active roster automatically. A faction split can remove whole categories of advisors. Removal normally adds faction dissent, while appointment strengthens only some advisors' factions in the actual code. The report's earlier statement that every appointment raises faction strength was too broad and has been corrected. Sources: `source/scenes/advisors/*.scene.dry`, `source/scenes/party_affairs/shuffle_leadership.scene.dry`, `source/scenes/events/death_of_levi.scene.dry`, `death_of_muller.scene.dry`.

### Party leadership changes create long-lead political forks

The December 1928 Center Party conference is one of the earliest choices whose full importance appears years later. If Zentrum relations are at least 70, the player can secure Joseph Joos as leader; at 62–69, the player can spend one resource to campaign for him. Otherwise Ludwig Kaas takes over and Zentrum relations fall by 5.

Joos is not merely favorable flavor text. His leadership:

- lowers the Zentrum relation requirement for keeping its members in a militarized Reichsbanner from 50 to 30;
- adds 5 coalition leverage when forming a Weimar Coalition;
- opens Joseph Wirth as a chancellor and emergency-cabinet option;
- reduces several Zentrum endorsement thresholds in the 1932 and 1934 presidential contests by about 20 points;
- lowers the normal Zentrum gate for a Popular Front from 65 to 45;
- combines with Conciliator KPD leadership to create an exceptional Popular Front gate of only 30 relations with each side.

The practical lesson is that diplomacy with Zentrum before December 1928 is preparation for the presidency, coalition formation, paramilitary unity, and constitutional survival—not simply preparation for the next cabinet.

The DDP has its own programmed decline. From June 1930 it becomes the DStP, losing middle-class and rural support and 5 relationship points. The SPD may recruit its disaffected progressives, gaining new-middle-class support and one People's Party preparation point, but also adding 5 left dissent while strengthening the reformist and neorevisionist factions. Liberal collapse therefore feeds the broad-party route while making internal rupture more likely.

Three deaths also alter the option graph. Stresemann's death from September 1929 reduces DVP relations and changes later attempts to persuade a conservative DVP into a flat random success/failure branch. Levi's death closes the strongest individual KPD bridge. If Müller dies while chancellor, the player must choose a successor immediately: SPD successors cost Zentrum and DVP relations, Brüning improves both, and Wirth is available only under Joos. Sources: `source/scenes/events/center_party_conference.scene.dry`, `ddp_dstp.scene.dry`, `death_of_stresemann.scene.dry`, `death_of_levi.scene.dry`, `death_of_muller.scene.dry`, `source/scenes/events/election_1928.scene.dry`, `presidential_election_1932.scene.dry`, `death_of_hindenburg_president.scene.dry`.

### Prussia is a parallel government, not just a coup objective

While `spd_prussia = 1`, the Prussian Bulwark card recurs every six months without requiring the SPD to hold a national ministry. It can add police loyalty, recruit 20 police strength, purge reactionaries from the bureaucracy, negotiate a Prussian concordat, or ban the SA, Stahlhelm, or RFB. This makes Prussia a second executive platform that remains useful during national opposition or toleration.

The alternatives create different defensive profiles:

- police recruitment raises raw force;
- loyalty work raises the proportion of that force which will obey in a crisis;
- bureaucratic purges add loyalty, democratization, and republican support but also 0.5 coup pressure;
- an SA ban cuts its strength by 10 percent, then by another 25 percent when Prussian police loyalty is at least 0.75;
- a Stahlhelm ban cuts its strength by 15 percent, then by another 30 percent at the same loyalty threshold;
- an RFB ban costs 15 KPD relation and one communist-cooperation point while improving bourgeois relations and police loyalty.

National control of the Interior Ministry supplies a related but deeper menu through the Police card. National bans are stronger, and a banned SA can be reduced by another 30 percent when judicial reform is at least 3 and national police loyalty is at least 0.70. Further action against the Stahlhelm needs judicial reform 4. The RFB route is easier legally but directly damages KPD cooperation and left-cabinet stability.

Judicial reform determines whether security action lasts. Six months after an SA or Stahlhelm ban, judges restore the organization if judicial reform is below 2, adding 100 strength and renewed militancy. Police capacity, legal reform, and political relations are therefore a three-part security system. Any Polish equivalent should preserve that layered logic if it retains institutional defense: authority to act, institutions willing to obey, and courts willing to sustain the action. Sources: `source/scenes/government_affairs/prussian_affairs.scene.dry`, `police.scene.dry`, `domestic_enemies.scene.dry`, `source/scenes/events/judges_unban_sa.scene.dry`, `judges_unban_sh.scene.dry`.

### Hitler's deportation is the payoff of that layered security route

The deportation option first becomes visible with Nazi urgency at least 3 and two prior far-right investigations, provided Hitler has not already been deported and Papen or Schleicher is not chancellor. Selecting it additionally requires judicial reform at least 2, continued SPD control of Prussia, and action before the 1932 presidential event.

If SA strength is below 200, deportation succeeds without a force test. At 200 or above, forcing the issue compares:

```text
Reichsbanner strength × militancy
+ Prussian police strength × militancy × loyalty

against

SA strength × militancy
```

Success deports Hitler, halves the SA, lowers Nazi preference by 10 in every demographic, reduces coup pressure by 2, and replaces him with Goebbels as party leader. A forced successful confrontation also bans the SA. Failure adds 50 SA strength, 5 Nazi preference in every demographic, and 3 coup pressure. The route therefore rewards early legal and police preparation; opening the button after the SA has grown large can be worse than never attempting it. Source: `source/scenes/government_affairs/deport_hitler.scene.dry`.

### Three scripted events test whether institutional preparation is real

The Reichsbanner exodus, *All Quiet on the Western Front*, and Altona events convert abstract preparation into concrete political outcomes.

Once Reichsbanner militancy reaches 0.20, Zentrum and DDP members threaten to leave. The player may halve militancy, accept a 10-percent strength loss and relationship damage, or keep them permanently. Keeping them requires strife at least 5, DDP relations at least 50, and Zentrum relations at least 50—or only 30 under Joos. A larger armed organization can therefore narrow coalition options unless the political case for militarization has already been built.

In December 1930, if the SPD still controls Prussia, the *All Quiet* event tests police loyalty. Banning the anti-war film gives the Nazis a large propaganda and recruitment victory. Allowing it without protection still produces violence and Nazi gains. Loyalty of 0.65 permits effective protection, while 0.75 enables mass public screenings that reduce Nazi support as well as nationalism.

In June 1932, Altona tests the same preparation under harder conditions. Judicial reform 2 permits the march to be prohibited. If the march proceeds with police present, loyalty strictly above 0.75 prevents the massacre and limits the SA gain to 10. At or below 0.75, the police response kills civilians, adds strife, gives the SA 50 strength, costs 8 KPD relation, and removes one communist-cooperation point. Sending no police gives the SA 80 and the RFB 50. These are intermediate examinations of the same capacities later used in the Prussian Coup and civil war. Sources: `source/scenes/events/reichsbanner_zentrum.scene.dry`, `all_quiet.scene.dry`, `altona_clashes.scene.dry`.

### The battlecruiser votes distinguish parliamentary position from executive control

Panzerkreuzer A in 1928 shows that an SPD vote is not automatically an SPD policy. If another party holds the Reichswehr Ministry, voting against construction damages coalition relations and adds dissent, but the ship still passes unless Otto Braun is the SPD chancellor. Müller cannot prevent the parliamentary majority from funding it. Abstention also lets it pass. If the SPD controls the Reichswehr portfolio, the same refusal actually stops construction, gains worker and pacifist support, and costs army loyalty and coalition trust.

Panzerkreuzer B returns from February 1931. A parliamentary vote against it succeeds only when represented SPD, KPD, and DDP strength totals at least 50. Control of the Reichswehr Ministry bypasses that arithmetic and stops it directly. Preventing both ships yields one budget point.

This is a compact demonstration of the game's cabinet design. Some policies depend on a vote, some on the responsible ministry, and some on the chancellor's authority. Coalition seat totals alone do not tell the player which promised policies can actually be delivered. Sources: `source/scenes/events/panzerkreuzer.scene.dry`, `panzerkreuzer_ministry.scene.dry`, `panzerkreuzer_b.scene.dry`.

### Labor and fiscal policy are repeated pressure engines

The first Labor Affairs dispute opens the longer Labor Rights route. Supporting labor raises worker support and faction strength, but adds coalition dissent and may add one capital-strike point for DVP relations at or below 30, another when unemployment exceeds 15, and another above 24. Working-time reform and safety regulation repeat the same basic exchange. Labor policy is therefore most dangerous precisely when mass unemployment and poor business relations make it most politically attractive.

Unemployment insurance is not only a single historical cabinet crisis. Its threshold begins at 10. The Labor Rights card exposes the issue whenever unemployment is at least four points above the stored threshold. Each settlement stores the current unemployment as the new threshold and starts a ten-month timer. A rising crisis can consequently reopen the conflict at successively higher levels.

Fiscal choices select who pays for budget repair:

- taxing the rich gives 2 budget but raises unemployment by 1, lowers inflation and growth, harms DVP relations, and can add up to 3 capital-strike points as rates climb;
- consumption taxes give 2 budget while directly losing workers and aggravating the KPD side;
- a general tax rise gives 3 budget but adds 2 unemployment and produces the strongest deflationary and growth penalty;
- tax cuts spend budget, reduce unemployment, and raise growth and inflation, with the electoral beneficiary determined by which taxes are cut;
- tariffs give 2 budget and rural support but add 1.5 unemployment, harm growth, Western and Eastern relations, reparations negotiations, and European integration;
- tariff cuts cost 2 budget but improve trade relations, growth, and worker/unemployed support.

Budget is thus not a neutral resource meter. The method used to repair it chooses a coalition conflict, voter loss, foreign-policy setback, or business confrontation. Sources: `source/scenes/government_affairs/labor_affairs.scene.dry`, `labor_rights.scene.dry`, `fiscal_policy.scene.dry`, `source/scenes/events/unemployment_insurance_1.scene.dry`.

### Economic democracy is advance investment in cheaper crisis policy

Economic Democracy requires both the Labor portfolio and either Finance or Economic. It is a slow route with a ten-month cooldown. Three stages of works councils each add business pressure and usually coalition friction; the third also reduces unemployment by 2. Socialization and cooperative actions spend budget to reduce unemployment and build institutional capacity.

That capacity changes the price of later transformative policy. WTB implementation falls from 4 budget to 3 when the player has at least two works-council stages, one socialization, or two pro-labor points. Nationalization can become up to 3 budget cheaper: one reduction at works councils 2, another at works councils 3, and a third when socializations plus existing nationalization progress reach 2.

The resulting causal chain is easy to miss because the saving appears in another file months later:

```text
Labor + economic portfolio control
    → works councils / socialization
    → capital and coalition pressure now
    → cheaper WTB or nationalization later
    → faster unemployment reduction before political collapse
```

This is one of the German design's strongest examples of institutional reform changing later action efficiency rather than merely adding an ending label. Sources: `source/scenes/government_affairs/economic_democracy.scene.dry`, `economic_policy.scene.dry`.

### Military policy contains a loyalty-strength paradox

Funding the Reichswehr spends 1 budget, adds 20 strength and 0.07 loyalty, and can calm coalition dissent. It also aggravates the SPD left and KPD, harms relations in both directions, reduces reparations and European progress, and eventually provokes sanctions. A one-time Economic Sanctions event fires above 140 Reichswehr strength, adding 3 unemployment, reducing growth, increasing nationalism, and moving voters toward the Nazis.

Cutting the military earns 1 budget and removes 20 strength, but transfers recruits to the Stahlhelm and SA, lowers Reichswehr loyalty, and adds coup pressure. The coup penalty grows again below loyalty 0.20, below 0.10, and at zero. Reform is more efficient for loyalty, adding 0.15 and reducing militancy when loyalty is low, but still costs budget, relations, and one coup point because the officer corps resists democratization.

The player is balancing raw strength, dependable strength, political loyalty, hostile paramilitary growth, and international reaction. “A stronger army” and “a stronger democratic defense” are not synonymous in the model. Sources: `source/scenes/government_affairs/military_policy.scene.dry`, `source/scenes/events/economic_sanctions.scene.dry`, `source/scenes/events/civil_war.scene.dry`.

### Rights, education, and science are full strategic routes

The `progressive_coalition` variable is recalculated after elections as represented SPD + KPD + DDP + SAPD strength. It is not a cabinet. It is the parliamentary bloc used to decide whether some social reforms can pass.

Women's Rights requires an SPD government and SPD chancellor and recurs every ten months. Employment equality, family law, welfare, and abortion policy have separate effects. Liberalizing abortion succeeds only with `progressive_coalition >= 50`; an attempted failure still costs relations and creates dissent. The late Marie Juchacz presidential route requires extensive prior work: women's-rights progress at least 6, family law at least 2, women's-work reform at least 2, and positive welfare.

Homosexual Rights requires the same SPD executive control plus a progressive majority. Its three steps repeal §175, reform §183, and legalize change of legal sex. Each improves KPD and DDP relations and slightly raises growth, while costing Zentrum relations, Catholic support, and sometimes coalition cohesion.

Education and Science requires SPD national government, continued control of Prussia, and an SPD chancellor. It is normally available only before Black Thursday or after Return to Normalcy, so it rewards either early investment or successful recovery. Its routes include scientific institutes, applied and medical research, public high schools, elected school boards, secularization, and a curriculum fixed for 50 months. A democratic major curriculum adds 0.5 republican support every month until 60; the minor version adds 0.3. Public high schools also improve police loyalty and republican legitimacy. Secularization needs budget plus a represented progressive bloc with DVP support totaling 50 and can immediately provoke a coalition-confidence crisis.

These routes affect presidential candidates as well as ending cards. Einstein, for example, requires science and a scientific curriculum in 1934; Juchacz requires the accumulated women's program. Social policy is therefore one way the player authors the late-game political cast. Sources: `source/scenes/government_affairs/womens_rights.scene.dry`, `homosexual_rights.scene.dry`, `education_science.scene.dry`, `source/scenes/post_event.scene.dry`, `source/scenes/events/death_of_hindenburg_president.scene.dry`.

### Foreign policy is a connected recovery and regime route

Foreign policy is broader than improving abstract relations. The Party Affairs International Relations card can prepare distinct routes: French and British contacts raise Western relations, pacifism, and moderate-plan support; Scandinavian contacts add WTB and moderate-plan support; Comintern observation improves KPD relations and can add communist-cooperation progress; Austrian contacts strengthen the SPD left, Reichsbanner militancy, and later Austrian resistance.

The 1929 Young Plan is an early test of whether prior pacifism can turn an unavoidable treaty dispute into SPD support rather than Nazi mobilization. The Weltbühne case then links Justice control, judicial reform, military loyalty, coup pressure, pacifism, reparations, and foreign relations. Dropping the prosecution improves diplomacy while angering the army and coalition right; allowing it to proceed can lead to conviction in 1931 unless judicial reform has reached 3.

The reparations route can progress through Western diplomacy, pacifism, exposing secret rearmament, the Hoover Moratorium, or the Lausanne Conference. Once reparations are reduced and relations reach West 5 and East 4, two European-integration steps can create the European Union. Formation reduces unemployment, stabilizes extreme inflation, adds budget and growth, raises republican and SPD support, and lowers nationalism.

The Austrian customs union is a rival route. It improves domestic conservative coalition relations when initiated by an SPD foreign minister, but costs two points of both Western and Eastern relations and schedules a banking crisis two months later. If another party controls Foreign in 1931, the event is imposed from outside; the SPD can resist from government or try to end toleration, but parliamentary success then depends on SPD + KPD + DDP reaching 50. The banking crisis adds 3 unemployment and another crisis-urgency point; stabilization costs one budget.

The route continues after German recovery. The March–April 1933 suspension of the Austrian parliament appears only if the SPD controls Foreign or earlier Austrian relations have been built. Diplomatic, EU, party, or material assistance raises `sdapo_strength`. In February–March 1934, strength below 4 means defeat, 4–5 means prolonged war, and 6 means victory. At exactly 5, an SPD foreign minister can instead force a peace. Austrian victory feeds back into German republican support, army loyalty, relations, and reduced coup pressure.

Finally, the June 1933 London Conference distinguishes national from global recovery. German unemployment below 15 routes to a local “Germany has largely recovered” section, while 15 or above routes to a “still deep in crisis” section. Neither local section applies an automatic economic change. Woytinsky with a substantially implemented WTB plan can salvage currency negotiations; a separate peace-and-debt option needs reduced reparations, pacifism at least 3, and either exposed rearmament or adequate Western relations. A separate Global Economic Recovery scene contains automatic unemployment and Nazi-support reductions, but it is disabled and unlinked, as noted below. Sources: `source/scenes/party_affairs/international_relations.scene.dry`, `source/scenes/government_affairs/foreign_policy.scene.dry`, `war_guilt.scene.dry`, `source/scenes/events/young_plan.scene.dry`, `weltbuhne.scene.dry`, `weltbuhne_2.scene.dry`, `hoover_moratorium.scene.dry`, `lausanne_conference.scene.dry`, `austrian_customs_union.scene.dry`, `banking_crisis.scene.dry`, `austrian_parliament.scene.dry`, `austrian_civil_war.scene.dry`, `london_economic_conference.scene.dry`, `economic_recovery.scene.dry`.

### Under-described counters connect otherwise separate routes

Several counters deserve explicit treatment because their effects are distributed across many files:

| Counter | What it actually connects |
|---|---|
| `pacifism` | Young Plan reception, reparations speed, foreign-policy credibility, cultural presidential candidates, and some faction/ending results |
| `democratization` | Republican campaigning, bureaucracy and military reform, education, media effects, and democratic candidate preparation |
| `nationalism` | Nazi electoral growth, treaty and military choices, education, censorship, and final ideological evaluation |
| `socialism` | Ideological direction and some social/economic ending or achievement checks |
| `crisis_urgency` | Whether the party can formulate a Depression program; it is raised by Black Thursday and the banking crisis |
| `strife` | The credibility of Reichsbanner militarization, crisis escalation, Papen-era instability, and the approach to armed confrontation |

These are accumulation variables. A choice that appears to give only a small ideological adjustment may be preparing a later diplomatic, presidential, or security gate. Sources: `source/scenes/root.scene.dry`, `post_event.scene.dry`, `source/scenes/party_affairs/*.scene.dry`, `source/scenes/government_affairs/*.scene.dry`, `source/scenes/events/*.scene.dry`.

### Dormant content and concrete defects should not be read as intended mechanics

The code audit found several places where readable prose is not live gameplay:

- `nazis_in_crisis.scene.dry` describes an automatic late collapse of Nazi support, but its `tags: event` line is commented out and no scene links to it. It is unreachable.
- `economic_recovery.scene.dry` similarly defines a global recovery shock, but its event tag is commented out and no live scene links to that top-level scene. The same short name used by a local London Conference section does not activate the separate event.
- `kpd_policy.scene.dry` and `popular_front_dispute.scene.dry` contain sketches for recurring left-cabinet conflict, but their event tags are commented out. They are disabled and partly unfinished.
- variables including `constitutional_protection`, `kpd_banned`, `nsdap_banned`, and several party-in-government flags are initialized but never used elsewhere in the German source. Their names should not be treated as implemented capabilities.
- the reparations action writes one bonus to `reparations_negotiations` while the live variable is singular, `reparations_negotiation`; the low-nationalism bonus is therefore lost.
- the reparations-reduction reward checks `hoover_memorandum_seen`, while the event sets `hoover_moratorium_seen`. As written, neither conditional budget reward in that action is reached.
- the science bonus checks `science >= 1` before `>= 3` and `>= 5`, making the larger generic science bonuses unreachable. Applied research and `education_science` still add their separate bonuses.
- the second applied-research action adds `economic_growth += 3`, much larger than the first action's 0.5 and the neighboring research effects; this is likely a decimal or balance defect.
- the Labor Rights unemployment-insurance “balance” option and the grand-coalition crisis's accept/compromise branches directly increment `month += 1` even though the normal turn machinery also advances the month, risking a two-month date jump and inconsistency with `time`.
- `set_next_election_time` uses the requested interval for `next_election_time` but hard-codes `next_election_month = month + 3`. Schleicher's successful 13-month postponement can therefore display a date only three calendar months ahead.
- `largest_party` compares only SPD, NSDAP, and KPD. A different party can never receive that label even if simulation changes make it numerically largest.

These findings strengthen the implementation warning above: the Polish iteration should port causal ideas only after checking that the German path is reachable and that its variables actually affect the result. Sources: `source/scenes/events/nazis_in_crisis.scene.dry`, `kpd_policy.scene.dry`, `popular_front_dispute.scene.dry`, `source/scenes/root.scene.dry`, `source/scenes/government_affairs/foreign_policy.scene.dry`, `education_science.scene.dry`, `labor_rights.scene.dry`, `source/scenes/post_event.scene.dry`, `set_next_election_time.scene.dry`, `source/scenes/events/election_1928.scene.dry`, `schleichers_schemes.scene.dry`.
