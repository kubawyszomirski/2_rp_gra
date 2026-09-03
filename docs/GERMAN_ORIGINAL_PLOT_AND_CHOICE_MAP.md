# German Original: Plot, Choice Architecture, and Endings

## Purpose and scope

This report reconstructs how the German version of *Social Democracy: An Alternate History* actually works as a game. It concentrates on the causal questions needed for the Polish adaptation:

- What does the player repeatedly decide?
- Which choices change the plot immediately, and which prepare consequences months or years later?
- How do elections, coalition formation, ministries, party factions, economic policy, constitutional reform, street violence, and presidential politics connect?
- Which routes lead to democratic survival, authoritarian government, a Nazi victory, or civil war?
- Which parts of the design are worth carrying into the Polish game, and which parts should be replaced or corrected?

The German baseline used here is repository commit `5e2cfef` (`Establish reproducible upstream baseline`). This is the last complete German version before the Polish transition began. Unless a section explicitly says otherwise, every German source reference means the file at that commit, for example:

```text
git show 5e2cfef:source/scenes/events/election_1928.scene.dry
```

This is a code analysis, not a claim that every rule is historically correct. It describes implemented behavior even where that behavior appears unintended. Historical assertions embedded in the game would require separate research before reuse in Poland.

The current Polish worktree contains uncommitted election and presidential work. I treated those files as user-owned and did not modify them. The final comparison section describes only the boundary visible in the current code; it does not approve unresolved historical choices.

### Suggested reading paths

- For the central model, read **Executive reading**, **Choice-to-consequence map**, and **Worked trajectories**.
- For a complete reconstruction of play, read sections **1–10** in order.
- For Polish design work, read **Current Polish boundary**, **Recommendations**, and **Proposed Polish design questions**.
- For verification or further implementation work, use the **Source map**.

## Executive reading: what kind of plot this game has

The German game is not primarily a conventional branching story in which one menu choice sends the player down one permanent path. It is a monthly political state machine. Most choices alter several persistent values, and later scenes check combinations of those values. The plot that the player sees in 1932 or 1933 is therefore often the result of decisions made in 1928–1931.

A useful model is:

```mermaid
flowchart LR
    A[Choose a monthly card] --> B[Change political and economic state]
    B --> C[Advance one month]
    C --> D[Apply economic feedback and yearly shocks]
    D --> E[Check mandatory events and thresholds]
    E --> F[Election, cabinet crisis, coup, or ordinary next month]
    F --> A
```

The central strategic problem is to keep several systems viable at once:

1. **Electoral strength.** The SPD needs enough support to lead coalitions, protect a minority government, or make an SPD presidential candidacy credible.
2. **Party cohesion.** Every economic and coalition strategy angers at least one SPD faction. Dissent reduces the effectiveness of positive campaigning and, at high levels, causes leaders, unions, or the left wing to leave.
3. **Coalition relations.** Relations with Zentrum, DDP, DVP, and KPD decide whether plausible parliamentary arithmetic can become a working government.
4. **Institutional access.** Being in government is not enough. Specific ministries unlock specific actions. The Justice Ministry is especially important because constitutional reform requires it and a long judicial-reform buildup.
5. **Economic stability.** Unemployment and inflation erode support for the republic and push voters toward anti-democratic parties. Deficits can produce inflation and, at an extreme, a capital strike.
6. **Coercive capacity.** The Reichsbanner, Prussian police, KPD-aligned fighters, and loyal parts of the Reichswehr may decide whether a coup is defeated. Their usefulness depends on earlier organization, relations, government control, and faction unity.
7. **Presidential power.** A friendly president is a major defensive asset, but reforming the office itself is often more durable than relying on a favorable person.

The game rewards preparation across these systems. A player who waits for Hitler's appointment or a coup scene before preparing has usually already lost. Conversely, a player can survive without maximizing the SPD vote if they have built a stable coalition, reduced unemployment, reformed the constitution, and kept a credible democratic defense.

## 1. The monthly loop and why choices have delayed effects

### 1.1 The hand of cards

The main screen is a hand with a maximum of three cards on normal difficulty and four on easy difficulty. It exposes a Party Affairs deck from the beginning and a Government Affairs deck after `time >= 6`. Advisors are pinned alongside the hand. The player draws a card and chooses one of the actions inside it. Most actions add one to `month_actions`; `post_event` then advances the date by one month and resets that counter.

This creates a strict opportunity-cost structure. Raising money, campaigning among workers, improving relations with Zentrum, debating an economic program, building the Reichsbanner, reforming the judiciary, and changing welfare policy generally compete for the same monthly turn. A route that needs four judiciary reforms, three crisis-program debates, and repeated KPD diplomacy is expensive because the player cannot do all of those while also maximizing electoral campaigning.

An action can make more than one numerical change, but the month still advances only once as long as `month_actions >= 1`. Some event sequences and election screens do not consume an extra month. Source: `source/scenes/main.scene.dry`, `source/scenes/post_event.scene.dry`, and the individual card files.

### 1.2 Advisors are periodic accelerators

The player begins with Otto Wels, Hermann Müller, and Rudolf Hilferding and can retain three advisors. Advisor actions normally share a six-month cooldown. Advisors therefore provide periodic help with factions, resources, relations, institutions, or policy, but cannot replace the monthly action economy.

Changing the leadership has a political cost. Bringing a figure into the advisor group strengthens the associated faction; removing one adds faction dissent. The advisor roster is consequently a statement about the party's internal balance as well as an ability loadout.

There is a likely implementation typo: the pinned leadership-shuffle scene increments `month_activities`, while the calendar checks `month_actions`. As written, that action does not advance time. This should not be copied as an intentional design rule without a decision. Sources: `source/scenes/advisors/*.scene.dry`, `source/scenes/advisors/shuffle_leadership_pinned.scene.dry`, `source/scenes/post_event.scene.dry`.

### 1.3 Mandatory events interrupt the loop

After state updates, `post_event` checks the `#event` collection. Eligible events with the highest priority are presented first. Annual shocks normally use a higher priority than ordinary events; the final ending event is higher still. Elections have low priority, so other events due in the same month can appear before the election.

This matters for causality. A statistic can cross a threshold during the monthly update and immediately trigger a crisis before the player receives another ordinary action. Examples include a capital strike, a vote of no confidence, a coup, and faction rupture.

If several events of the same highest priority are eligible, the player can encounter more than one during the event sequence. The system is therefore less like a single scripted chapter and more like a queue of conditions that have become true.

### 1.4 Randomness is narrower and stranger than it first appears

The ordinary deck draw chooses uniformly among eligible cards. Scene `frequency` values are used when the engine must select a limited subset of choices, but the Party and Government decks do not set such a limit. The apparent card frequencies therefore do not weight ordinary deck draws in the baseline engine.

When a scene has multiple valid `go-to` destinations, the engine randomly chooses one. This creates some explicit or accidental coin flips. The Grand Coalition attempt after Stresemann's death contains `go-to: beg_dvp_succeed; beg_dvp_fail`, which is an even random choice. The rally scene can similarly have both the normal and SA-disruption destinations valid. Presidential ties can set more than one winner flag and leave the engine to select among valid result destinations.

These are important implementation facts because a player may interpret them as a probability derived from political preparation when the code uses a flat random choice. Sources: `node_modules/dendrynexus/lib/engine.js`, `source/scenes/events/election_1928.scene.dry`, `source/scenes/party_affairs/rally.scene.dry`.

### 1.5 What the Party Affairs cards build

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

### 1.6 What the Government Affairs cards build

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

## 2. The state model behind the story

### 2.1 Voters are demographic support pools

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

### 2.2 Parliamentary results are snapshots, not a permanent mirror of polling

`*_votes` tracks current normalized public support. At an election, the code records represented results in `*_r`. Coalition tests use the frozen `*_r` values until another election. This is conceptually sound: changing polling should not silently change Reichstag membership.

The visual parliament multiplies each represented percentage by five and rounds it, approximating a 500-seat chamber. Coalition formation, however, uses percentages and a 50-percent threshold rather than those displayed seat counts. A threshold reform excludes small parties and renormalizes the represented results. The Center calculation includes a fixed three points for the BVP, with three later removed from some coalition formulas.

The design therefore separates public opinion and legislative power, but it does not maintain a single exact seat ledger. That is one source of occasional visual or arithmetic inconsistency.

Sources: `source/scenes/election_algorithm.scene.dry`, `source/scenes/election_simulation.scene.dry`, `source/scenes/events/election_1928.scene.dry`.

### 2.3 The five SPD factions

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

### 2.4 Relationships are permissions as much as opinions

The principal interparty relationship values begin at approximately:

| Party | Initial relation |
|---|---:|
| Zentrum | 50 |
| KPD | 25 |
| DDP | 60 |
| DVP | 35 |

These numbers do more than influence flavor. They are gates for coalitions, presidential endorsements, toleration, votes of no confidence, KPD help in a civil war, and some event resolutions. Improving a relationship early can create a route years later. Allowing Blutmai, repeatedly attacking a coalition partner, or choosing policies hostile to business can close those routes.

The player cannot maximize every relationship. Moving toward the KPD often antagonizes liberal or conservative partners; moderating for Zentrum and DVP often raises left or labor dissent and harms KPD relations.

### 2.5 Resources, budget, and leverage are different currencies

- **Resources** represent the SPD's discretionary political capacity. They pay for campaigns, bargaining, propaganda, and some program adoption. Party dues and fundraising replenish them.
- **Budget** represents state fiscal room. Government programs can push it negative; taxes, cuts, and later program stages can replenish it.
- **Leverage** exists mainly during coalition formation and buys ministries. It is not the same as either party resources or public support.

Conflating these would flatten the strategy. A popular SPD can lack resources to recruit an endorsement. A coalition-leading SPD can lack leverage to secure Justice or Interior. A government can have political resources but no budget for an employment program.

### 2.6 The republic is its own constituency

`pro_republic` measures support for the democratic system. It begins at 59. High unemployment and inflation reduce it. Emergency rule, repeated inconclusive elections, and authoritarian concessions also reduce it. Democratic education, successful mobilization, and economic recovery can raise it.

When pro-republic sentiment falls below the combined support of the Weimar parties, the game applies a monthly drain: some middle-class and rural SPD or liberal support moves toward the NSDAP, and portions of the SPD base erode. Democracy is therefore not merely the sum of democratic parties. If the public's attachment to the system is weaker than the electoral coalition defending it, the coalition loses credibility.

This is a major causal bridge between economic policy and political collapse. A failed economy does not only cost the governing party votes; it changes the electorate's willingness to accept parliamentary democracy.

### 2.7 Armed organizations are accumulated political capital

Initial raw strengths and militancies produce very different effective forces. The Reichsbanner starts large but with very low militancy; the Stahlhelm, SA, RFB, police, and Reichswehr use different multipliers and loyalty shares. The important point is that head count alone is not combat power.

Reichsbanner investment and street-fighting choices can raise strength and militancy. Police reform can raise loyalty. KPD relations determine how much RFB power joins a republican defense. Party dissent reduces Reichsbanner effectiveness and the general-strike contribution. The president and government determine how much of the Reichswehr supports the republic.

This produces a coherent delayed-defense mechanic: the coup scene reveals the coalition of forces that earlier political work assembled.

### 2.8 Opening position and difficulty

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

## 3. Chronological structure, 1928–1934

The exact order can vary because of elections, card availability, and triggered crises, but the broad campaign arc is fixed.

| Period | Fixed pressure | Main strategic questions |
|---|---|---|
| Jan–May 1928 | Existing bourgeois-right cabinet falls; Reichstag election is due | Build support and decide what coalition or ministry strategy to pursue |
| Mid–late 1928 | Government formation; Panzerkreuzer and coalition tensions; Wittorf Affair | Govern, tolerate, or oppose; choose ministries; decide whether KPD cooperation is imaginable |
| 1929 | Early downturn, May Day/Blutmai, KPD conference, Young Plan, Black Thursday | Contain street conflict; build crisis-program support before the Depression intensifies |
| 1930 | Severe unemployment jump; possible coalition collapse and new elections | Enact an economic program, manage unemployment insurance, prevent presidential-cabinet drift |
| 1931 | Banking and Depression crisis, Harzburg Front, rising armed forces | Keep the economy and coalition alive; prepare institutional and physical defenses |
| 1932 | Further radicalization, presidential election, Papen/Schleicher danger, Prussian Coup | Replace or constrain Hindenburg, retain Prussia, stop repeated elections and authoritarian cabinets |
| 1933 | Hitler appointment or recovery contest; March on Berlin; global recovery | Survive the decisive regime crisis or qualify for Return to Normalcy |
| 1934 | Austrian crisis flavor; Hindenburg dies; succession election | Convert survival into a stable constitutional settlement or face a final presidential seizure |

The calendar applies major economic shocks even if the player has not drawn the relevant policy cards. The annual scenes and monthly background drift make inaction a decision with consequences.

### 3.1 The Depression escalator

The baseline begins with unemployment at 8.6 percent, inflation at 2.9, growth at 4.4, and budget capacity at 4. The shocks then intensify:

- January 1929 reduces growth by 4.
- Black Thursday in October 1929 adds unemployment and radical-party support, reduces budget and dues, and worsens growth.
- January 1930 adds 6.8 unemployment, produces sharp deflation, reduces growth, and may reduce budget.
- January 1931 adds 6 unemployment and severe deflation and contraction. A works program offsets much of this; a further program phase offsets more.
- January 1932 adds another large penalty if no works program exists. Stronger programs can produce an improvement instead.
- Mid-1933 global recovery helps, but whether Germany enters democratic normalization depends on the political and economic state the player has preserved.

At the same time, yearly drift moves middle-class and rural voters toward the NSDAP and workers toward the KPD. The drift is stronger without public works. SA and Stahlhelm strength also rises. The player is racing a compound process: unemployment weakens pro-republic sentiment, declining republican legitimacy moves voters toward extremists, and extremist growth strengthens the political and armed threats.

Sources: `source/scenes/events/1929.scene.dry`, `1930.scene.dry`, `1931.scene.dry`, `1932.scene.dry`, `black_thursday.scene.dry`, `source/scenes/post_event.scene.dry`.

### 3.2 The recovery exit

The late-game democratic off-ramp is `Return to Normalcy`. It requires, in broad terms:

- pro-republic sentiment of at least 50;
- unemployment no higher than 13;
- inflation below 7;
- no Papen or Schleicher chancellorship;
- coup progress below 9.

When it fires, Nazi political and paramilitary strength collapses sharply and more conventional parties recover. This is the game's clearest statement of its theory: fascism is defeated through a combination of economic stabilization, democratic legitimacy, constitutional government, and preventing elite-authoritarian escalation.

The route does not require one exact ideology. It requires the player to arrive at 1933 with the system still functioning.

Source: `source/scenes/events/return_to_normalcy.scene.dry`.

## 4. Elections and government formation

### 4.1 From votes to coalition arithmetic

After an election, the game calculates several named blocs from represented vote percentages:

| Bloc | Implemented composition |
|---|---|
| Weimar Coalition | SPD + DDP + Zentrum − 3 BVP points; SAPD may join under a KPD-relation condition |
| Grand Coalition | SPD + DDP + Zentrum + DVP |
| Bourgeois coalition | DDP + Zentrum + DVP + Other |
| Center-right | Zentrum + DDP + DVP + Other + DNVP |
| Right | Zentrum + DVP + Other + DNVP |
| Far right | DNVP + NSDAP |
| Left | SPD + KPD + SAPD |
| Popular Front | SPD + KPD + Zentrum + DDP − 3 + SAPD |
| Anti-democratic | KPD + NSDAP + DNVP |
| Neo-Weimar | all represented parties except KPD, DNVP, and NSDAP |

The scene resets the old government state and then presents eligible formations. A mathematical majority is necessary but often insufficient. Relations, party leaders, past failures, the president, the number of inconclusive elections, year, resources, and internal faction strength decide what can actually be formed.

### 4.2 SPD majority

At `spd_r >= 50`, the SPD controls every ministry and chooses an SPD chancellor: Braun, Breitscheid, Müller, or later Wels depending on availability and mode. This is the cleanest route but difficult to achieve. It removes coalition bargaining while retaining internal-party tradeoffs and the danger of capital strike or coup.

### 4.3 Weimar Coalition

A Weimar majority puts SPD, Zentrum, and DDP in government. The SPD receives a base five leverage, with another five when the implemented favorable Zentrum leader, Joos, is in place. The player chooses a chancellor and then spends leverage on ministries.

This coalition excludes the DVP and is therefore more permissive for some democratic reforms than the Grand Coalition. It is still vulnerable to conflicts over welfare, economics, policing, and socialist policy.

### 4.4 Grand Coalition

The Grand Coalition adds the DVP. In the first election, or when the SPD is strong enough, it can be SPD-led. In later elections, a weakened SPD under Hindenburg may face a Zentrum-led cabinet under Brüning.

Low DVP relations can make formation fail. If the SPD cannot lead, it may:

- join Brüning's cabinet;
- tolerate Brüning from outside;
- oppose him;
- under favorable Zentrum leadership, join or tolerate a Wirth unity government;
- attempt to recover DVP support, including an implemented 50/50 branch after Stresemann's death.

The coalition is broad but fragile. It can provide a majority and access to ministries, yet its partners resist labor expansion, nationalization, aggressive fiscal policy, and militant anti-fascism. It often asks the player to choose between immediate cabinet survival and long-run economic or democratic survival.

### 4.5 A new constitutional coalition

If the ordinary Grand Coalition is below 50 but the broader Neo-Weimar bloc has a majority, the player can spend two resources to form a new coalition of constitutional parties. A Wirth unity government can also become available under favorable Zentrum leadership. These are recovery mechanisms for a fragmented parliament, but they still depend on relationships built earlier.

### 4.6 United Left

A left majority does not automatically produce a left government. The game checks KPD relations or Conciliator leadership and requires repeated preparation of `communist_coalition`. The final agreement may require three resources, exceptionally strong relations, or a favorable KPD leadership.

The normal success result makes Breitscheid chancellor, gives the SPD every ministry, raises coup progress by 3 and capital-strike progress by 2, and starts the KPD-goals system. If coup progress has already reached 10, civil war begins immediately.

If the SPD left is stronger than the combined reformist and neorevisionist tendency and Braun is president, the player can appoint Thälmann chancellor. That choice immediately drives the game toward civil war. Thus the left-majority route is a demanding coalition-management path, while the communist-chancellor choice is an explicit revolutionary confrontation.

### 4.7 Popular Front

The Popular Front includes democratic center parties as well as SPD and KPD parliamentary support. It has more complicated gates involving KPD and Zentrum relations and leadership. The player may need four resources, a concession about democracy, or pressure from President Braun. With both favorable party leaders, a special easier formation exists.

Breitscheid becomes chancellor, coup progress rises by 2, and the KPD abstains from ministries. SPD leverage is based on the combined SPD and KPD parliamentary strength. The government then receives KPD policy goals and faces a lower coalition-dissent tolerance than the United Left.

The route broadens parliamentary defense but contains incompatible partners. It is a deliberate high-management coalition rather than a simple “all anti-Nazis cooperate” win button.

### 4.8 Far-right majority

If DNVP plus NSDAP has at least 50, the outcome depends on timing and the president:

- from 1932 onward, or if the NSDAP has at least 44, a non-Braun president appoints the Nazi leader;
- earlier, Schleicher takes office and schedules another election;
- President Braun can attempt emergency government, another election, or appointment of the Nazis, but a sufficiently strong far right can launch an immediate coup.

### 4.9 No majority: the collapse ratchet

Under Hindenburg, failure to build a majority starts an escalation:

1. Brüning governs with SPD toleration for up to several inconclusive elections while the anti-democratic bloc remains limited.
2. Further failure or a majority-sized anti-democratic bloc leads to Papen.
3. Another Papen election leads to Schleicher.
4. Another failure under Schleicher leads to Hitler.

Each turn of this ratchet reduces pro-republic sentiment and shifts additional groups toward the NSDAP. Calling another election is therefore not a neutral reroll. It worsens the state that will determine the next election.

President Braun changes this branch. He can support an emergency SPD government, but the government must survive a no-confidence calculation based on party relationships. A far-right bloc of 45 or more instead launches an immediate coup.

### 4.10 Refusing to govern

The player can refuse government even when a coalition or majority is possible. This produces heavy dissent among reformists, labor, centrists, and neorevisionists, harms support, and often leads to a right-wing government or rapid new election. The route exists to permit ideological refusal, but the code treats abandonment of parliamentary responsibility as a major political failure.

### 4.11 Ministries are a capability graph

When the SPD leads a coalition, leverage buys portfolios:

| Portfolio | Leverage cost | Main capabilities associated with it |
|---|---:|---|
| Labor | 5 | Labor policy and worker-facing reform |
| Interior | 5 | Police, domestic security, investigation of the far right |
| Finance | 10 | Fiscal policy and parts of economic response |
| Economic | 10 | Economic policy, works programs, economic democracy |
| Justice | 10 | Judiciary reform; later constitutional reform and legal defenses |
| Foreign | 10 | Reparations, European cooperation, external relations |
| Agriculture | 10 | Agricultural and land policy |
| Reichswehr | 15 | Military policy and loyalty |

The cheapest ministries are useful immediately; the expensive ones create distinct strategic routes. Interior plus Prussian control supports policing and the Hitler-deportation route. Justice is the prerequisite for a long constitutional path. Economic and Finance help implement crisis programs. Reichswehr can improve the military side of a future coup calculation.

This is a strong piece of design because cabinet formation is not merely an ending label. The portfolios determine which verbs the player will have for the next government term.

Source for all government branches and ministry costs: `source/scenes/events/election_1928.scene.dry`.

## 5. The main causal routes

The routes below overlap. A good campaign may combine constitutional reform, a works program, anti-Nazi policing, and a Braun presidency. The headings identify clusters of preparation and consequence rather than exclusive classes.

### 5.1 Parliamentary-democratic survival

This route aims to keep the SPD or a constitutional coalition in office until economic recovery reduces extremist momentum.

The preparation usually consists of:

1. Preserve workable relations with Zentrum and DDP, and often DVP.
2. Win enough support for a Weimar, Grand, or broader constitutional majority.
3. Choose ministries that match the intended policy route.
4. Reduce unemployment before repeated elections and emergency rule destroy pro-republic sentiment.
5. Avoid coalition-dissent thresholds or enact a constructive vote of no confidence.
6. Prevent Papen and Schleicher from becoming the normal solution to parliamentary deadlock.
7. Reach the Return to Normalcy conditions in 1933.

This path is less dramatic than a coup victory but strategically demanding. The central danger is accepting compromises that preserve the cabinet this month while allowing unemployment and republican legitimacy to deteriorate. A cabinet can survive and still lose the regime.

The strongest version combines a workable coalition with constitutional reform. The weaker version relies on good relationships and economic performance alone. If those fail, each no-confidence crisis or inconclusive election moves the game closer to presidential cabinets.

### 5.2 WTB employment route

The WTB program is the labor faction's crisis answer. The player first needs Black Thursday to occur and crisis urgency to open the crisis-program card. Supporting labor raises `wtb_support`; at 3, the party adopts the program. Adoption strengthens labor, lowers labor and reformist dissent, but angers centrists and somewhat the left.

Implementation is expensive in budget and can alarm coalition partners and business. Its benefit is speed: it directly offsets unemployment shocks, increases growth and pro-republic sentiment, and improves SPD support among workers and unemployed people. Later program stages can recover part of the fiscal cost.

The causal chain is:

```text
early crisis recognition
→ spend several scarce turns building WTB support
→ secure the ministries and budget needed to implement it
→ absorb deficit and coalition pressure
→ reduce 1931–1932 unemployment shocks
→ preserve pro-republic sentiment and SPD support
→ weaken the electoral and paramilitary growth of the extremes
→ qualify for democratic recovery
```

The route can fail in four distinct ways:

- the player begins program debate too late;
- the SPD is outside government when implementation is needed;
- coalition concessions dilute or block the program;
- deficit, inflation, or capital-strike pressure creates a second crisis.

The route is therefore not simply “choose Keynesianism and win.” It is a timing and governing-capacity test. Sources: `source/scenes/party_affairs/crisis_program.scene.dry`, `source/scenes/government_affairs/economic_policy.scene.dry`, annual event files, `source/scenes/post_event.scene.dry`.

### 5.3 Moderate recovery route

The moderate plan requires only two support steps and strengthens the reformist faction. It reduces unemployment and improves growth more gently, helps middle-class and rural support, improves Zentrum relations, and can reduce coalition dissent when unemployment is high.

Its advantages are lower political and fiscal risk. Its weakness is that the Depression shocks are large. If adopted late or implemented weakly, the smaller effects may not keep unemployment below the thresholds that erode the republic and feed the NSDAP.

The moderate route is best understood as a coalition-compatible strategy. Its success depends on early adoption and complementary actions. A player who assumes moderation is automatically safe may arrive in 1932 with a stable cabinet but an unstable society.

### 5.4 Radical nationalization route

Supporting the left raises `nationalization_support`; at 3 the SPD adopts nationalization as its economic plan. This strengthens the left, improves KPD relations, and immediately raises coup progress. Implementation can help workers and unemployed people, create works activity, and advance social ownership.

The confrontation risks are explicit:

- ordinary adoption and implementation anger reformists, neorevisionists, labor, or coalition partners;
- works councils and economic democracy can add capital-strike pressure;
- uncompensated nationalization and factory takeovers produce much larger capital-strike and coup increases;
- a capital strike causes a large economic and electoral collapse before the player chooses a response;
- a left government already begins with extra coup and capital-strike pressure.

The route can still succeed if the player has prepared political unity, coercive defense, KPD relations, and sufficient governing control. It is designed as a transformation under counter-mobilization. It should not be evaluated only by the immediate support gains displayed on the policy card.

### 5.5 Centrist inaction

The crisis-program card also allows the player to support the centrist tendency or defer. This preserves the center in the short term but angers labor and the left and does not create an economic plan. Annual shocks then occur with little or no offset.

The consequence is indirect and severe: unemployment rises, pro-republic sentiment falls, extremist parties gain, the coalition becomes harder to reconstruct after elections, and presidential government becomes more likely. The game treats inaction as a plot branch generated by the ordinary economic update rather than a special “failure” scene.

### 5.6 KPD rapprochement, United Left, and Popular Front

The KPD route has several stages, each of which can be missed.

#### Stage 1: create a relationship

The player uses interparty diplomacy, left-wing positioning, certain advisers, and event choices to raise `kpd_relation` from its low starting value. This often costs relations with bourgeois partners or creates reformist dissent.

#### Stage 2: change the KPD's internal environment

The 1928 Wittorf Affair and 1929 KPD conference can help the Conciliators replace the harder leadership. Favorable resolution depends on strong relations, secrecy or intervention choices, left strength, and in some cases having Paul Levi or Kurt Rosenfeld available. Conciliator leadership makes later cooperation and extensions easier.

#### Stage 3: avoid destroying trust on May Day

The May Day confrontation is a pivotal test:

- banning the demonstration destroys KPD relations, reduces coalition willingness, leads to Blutmai, and moves workers away from the SPD;
- allowing it improves relations but can strengthen the KPD and anger bourgeois partners;
- joining it requires good relations and substantially advances both KPD cooperation and broader communist-coalition preparation, while also contributing to right-wing mobilization.

This is a good example of a choice whose gains and risks sit on different axes. Cooperation may improve the future parliamentary left while worsening coalition dissent and street polarization.

#### Stage 4: prepare coalition willingness

A parliamentary left majority is insufficient. `communist_coalition` must be built through repeated choices, and the relationship or Conciliator thresholds must be met. The player may also need resources at the election.

#### Stage 5: fulfill KPD government goals

Once a left or Popular Front government forms, the KPD supplies a policy list. It can include welfare, land reform, nationalization, progressive tax, labor reform, military reduction, and later foreign policy. The government receives a timer, generally between 12 and 24 months depending on relations, leadership, and institutional reform.

The player must complete all required goals. Partial compliance earns a short extension only under favorable conditions. Failure harms relations and support and leads toward a KPD-backed vote of no confidence. Satisfying every goal secures coalition survival for the term.

This turns the coalition from an electoral reward into a governing contract. The player must have prepared ministries and policies before formation; otherwise the timer can be impossible.

#### Stage 6: manage KPD coalition dissent

KPD coalition dissent triggers a crisis at 3 in a Popular Front or 4 in a United Left. The SPD may spend resources to reduce it, accept Thälmann as chancellor and face civil war, replace the left coalition with a centrist one, or call an election.

WTB and moderate programs can themselves increase KPD dissatisfaction because the game frames them as preserving capitalism. Nationalization fits the KPD goal set more naturally.

Sources: `source/scenes/events/wittorf_affair.scene.dry`, `kpd_conference.scene.dry`, `blutmai.scene.dry`, `kpd_goals.scene.dry`, `kpd_goals_2.scene.dry`, `kpd_ultimatum.scene.dry`, `kpd_vote_of_no_confidence.scene.dry`, `source/scenes/party_affairs/inter_party_relationships.scene.dry`.

### 5.7 People's Party route

Neorevisionism emerges as a response to the Nazi threat. It supports a broader democratic mass-party strategy, the Iron Front, and constitutional reform. After building enough support, the SPD can attempt to become a People's Party.

The smoother adoption condition compares reformist plus neorevisionist strength with left plus center strength and expects adequate public support for the proposal. Adoption deliberately exchanges part of the SPD's worker orientation for stronger appeal among rural, middle-class, and Catholic voters. It also improves relations with bourgeois-democratic parties.

Forcing the change over internal opposition creates very high dissent in the left and center. Because dissent reduces future support gains, the immediate demographic expansion can be undermined by the party rupture it causes.

This route can help form broader constitutional coalitions and weaken the NSDAP among non-worker groups. Its design question is whether the SPD can change its social coalition without losing the organization and identity that make it effective.

Sources: `source/scenes/party_affairs/neorevisionism.scene.dry`, `peoples_party.scene.dry`, `peoples_party_campaigning.scene.dry`.

### 5.8 Constitutional-reform route

Constitutional reform is among the most preparation-heavy routes in the game. The card requires:

- the SPD to be in government;
- the Justice Ministry to be controlled by the SPD;
- at least four levels of judicial reform;
- neorevisionism;
- an eligible Weimar, SPD-majority, United Left, or Popular Front government;
- no constitutional-reform cooldown;
- fewer than three completed reforms.

Each reform takes a monthly action and starts a 12-month cooldown. A referendum normally needs 51 percent calculated support; if pro-republic sentiment is below 65, it needs 60 percent. The three central amendments are:

1. **A five-percent electoral threshold.** This removes small parties from future representation and redistributes much of their support. It can simplify coalition arithmetic but angers partners and part of the SPD.
2. **A constructive vote of no confidence.** This prevents the ordinary destructive no-confidence mechanism unless an alternative majority exists. It is the most direct protection against coalition-dissent collapse.
3. **Reduced presidential powers.** This blocks or changes the Papen appointment, Prussian Coup, emergency-government, and later presidential-seizure branches.

The route also interacts with court defenses. Judicial reform can keep paramilitary bans in force, enable land reform and uncompensated nationalization, and allow a constitutional defense when the far right attempts a coup.

This is a classic long-lead route. Choosing Justice during a 1928 coalition negotiation can decide whether the player has a legal answer in 1932–1934. The ministry seems less immediately useful than Labor or Interior, but it changes the shape of the endgame.

Source: `source/scenes/government_affairs/constitutional_reform.scene.dry`, `judiciary.scene.dry`, and the coup and presidential events.

### 5.9 Deport-Hitler route

The deportation action requires:

- Nazi urgency of at least 3;
- Hitler not already deported;
- Papen or Schleicher not currently governing;
- at least two far-right investigations.

The wider action chain also depends on control of Prussia, an effective police apparatus, and judicial reform. If SA strength is below 200, deportation succeeds automatically. At higher strength the game compares police and Reichsbanner power with the SA.

Success halves SA strength, reduces NSDAP support in all demographic groups, lowers coup progress, and replaces Hitler with Goebbels as party leader. Failure raises Nazi support and coup progress and strengthens the SA.

The route is powerful but not an instant elimination of fascism. The ending code explicitly allows a Nazi outcome despite Hitler's deportation, now associated with Goebbels or Göring. The player still needs economic, parliamentary, and constitutional success.

Sources: `source/scenes/government_affairs/police.scene.dry`, `deport_hitler.scene.dry`, `source/scenes/game_over.scene.dry`.

### 5.10 Reichsbanner and Iron Front route

Recognizing the Nazi threat raises urgency and can unlock neorevisionism and Iron Front organization. Rallies and organization increase pro-republic sentiment, electoral reach, or defensive strength. Direct Reichsbanner investment raises membership and militancy.

Militancy is double-edged. It makes the organization more useful in a coup or civil war, but high militancy can make Zentrum and DDP threaten to leave the coalition. Under sufficient street strife and good relations, the SPD can justify the force; otherwise it may have to halve militancy to retain partners.

Street-fighting choices can build arms and training, but the scene also strengthens the SA. Choosing violence therefore changes both sides of the later military comparison. Choosing peace preserves political moderation while leaving less defense if institutions fail.

The best use of this route is often deterrence combined with institutional action. A strong Reichsbanner by itself does not reduce unemployment, preserve parliamentary majorities, or control the police.

Sources: `source/scenes/party_affairs/confronting_nazis.scene.dry`, `iron_front.scene.dry`, `reichsbanner.scene.dry`, `streetfighting.scene.dry`, `source/scenes/events/reichsbanner_zentrum.scene.dry`.

### 5.11 Brüning toleration and austerity route

When no coalition majority exists, the SPD may tolerate Brüning from outside government. This avoids immediate far-right rule and keeps some constitutional continuity, but the SPD lacks ministerial control and shares responsibility for emergency austerity.

The unemployment-insurance and emergency-cuts crises make the tradeoff concrete:

- tolerate benefit cuts and lose worker and unemployed support to KPD and NSDAP while weakening welfare and pro-republic sentiment;
- end toleration and risk another election;
- where available, use resources or relationships to soften the outcome.

The game models toleration as borrowed time. It can be useful if the player is waiting for recovery, a stronger electoral position, or institutional preparation. Repeated reliance becomes the no-majority ratchet that eventually produces Papen, Schleicher, and Hitler.

Sources: `source/scenes/government_affairs/dealing_with_toleration.scene.dry`, `source/scenes/events/emergency_cuts.scene.dry`, `unemployment_insurance_1.scene.dry`, `election_1928.scene.dry`.

### 5.12 Schleicher's authoritarian survival route

Schleicher proposes suspending the Reichstag while enacting a works program. Acceptance costs ten pro-republic points, creates major faction dissent, and damages SPD support. The parliamentary support test can count the SPD, Zentrum at sufficiently good relations, DVP/Other under favorable DVP relations, and in rare circumstances DNVP.

If the scheme succeeds, the next election is delayed for 13 months and Hitler's immediate appointment is blocked. Economically it may reduce pressure. Constitutionally it is an authoritarian outcome: the SPD has helped replace parliamentary government with executive bargaining.

This is not coded as immediate defeat, because it can stop Hitler and permit survival to the end. The ending text, however, treats Schleicher as paving the way for Hitler or a similar authoritarian future. It is a compromised survival branch.

Source: `source/scenes/events/schleichers_schemes.scene.dry`, `source/scenes/game_over.scene.dry`.

### 5.13 Capital-strike route

Capital-strike progress accumulates from aggressive taxation, works councils, economic democracy, nationalization, and some left-coalition choices. At progress 6–9, business-confidence warnings allow concessions. At 10, or when the state budget falls to −5 while the SPD governs, the capital strike triggers.

The event applies its main damage immediately on arrival:

- unemployment rises by 5;
- growth falls by 4;
- SPD worker and unemployed support is multiplied by 0.7;
- SPD middle-class and rural support falls sharply;
- pro-republic sentiment falls by 15;
- Zentrum and DVP relations fall;
- Nazi support rises across demographic groups.

Only after that shock does the player choose a response:

- factory seizure recovers some employment and support but raises coup progress by 6 and coalition dissent;
- capital controls recover a smaller amount of employment and growth;
- propaganda restores political support at a resource cost;
- doing nothing leaves the damage intact.

The lesson is that the threshold must be managed before the event. The response cannot cancel the initiating collapse.

Source: `source/scenes/events/businesses_lose_confidence.scene.dry`, `capital_strike.scene.dry`, fiscal and economic-democracy cards.

## 6. Government crises as threshold machines

### 6.1 Coalition dissent

Coalition dissent is separate from SPD faction dissent. It records how far government partners have been pushed by policy. The rough crisis thresholds are:

- 3 for Grand Coalition, Popular Front, or minority arrangements;
- 4 for a Weimar Coalition;
- special thresholds and logic for the left coalition.

Once crossed, a vote-of-no-confidence event becomes eligible unless the constitution has been reformed. The player may be able to preserve the government by surrendering Prussian control, accepting austerity, spending three resources, or replacing the coalition with a KPD-supported left or Popular Front arrangement. Otherwise an election is scheduled and both republican legitimacy and SPD support suffer.

This makes individual policy costs cumulative. One concession may be affordable; several reforms that each add one dissent can abruptly end the cabinet.

### 6.2 Unemployment insurance as the model coalition dilemma

The unemployment-insurance conflict is a concentrated version of the whole game:

- **Cut benefits:** preserve employer and conservative preferences, but lose SPD base support, expand KPD/NSDAP appeal, lower welfare, raise unemployment, and reduce republican legitimacy.
- **Raise employer contributions:** defend the base and social state, but raise capital-strike pressure and push Grand Coalition dissent to at least 3.
- **Balance the burden:** accept smaller base losses and smaller coalition damage.

No choice is free. The meaningful question is which reserve the player has prepared: public support, coalition tolerance, resources, constitutional protection, or economic space.

### 6.3 Why a constructive vote changes the whole game

Without constitutional reform, coalition dissent can let an alliance of parties remove the cabinet even when those parties cannot agree on a replacement. With a constructive vote, this destructive coalition is insufficient. The amendment does not make partners happy or remove economic pressure, but it changes anger from an automatic government-ending event into a political problem the cabinet may survive.

For the Polish adaptation, this demonstrates how one institutional rule can alter many later event predicates without needing bespoke text in every crisis.

## 7. Presidential politics

### 7.1 The 1932 presidential election

The election is a direct popular contest with two rounds. Party vote shares supply the blocs; relations and resources decide endorsements. The SPD initially chooses among three strategies.

#### Support Hindenburg

This is the default and cheapest anti-Hitler strategy. It can stop an immediate Nazi presidential victory, but preserves the president whose emergency powers enable Brüning, Papen, Schleicher, dismissal of democratic cabinets, and the Prussian Coup. The choice buys short-term electoral coordination at the cost of executive vulnerability.

#### Run Otto Braun

Running Braun costs two resources. The SPD can then seek support from Zentrum, KPD, and DVP. Endorsement depends on party relationships, relative electoral strength, and sometimes further resource expenditure. A Braun victory raises democratic and SPD strength and transforms several later branches:

- an emergency SPD government becomes possible;
- more of the Reichswehr can count on the republican side under the right conditions;
- Hindenburg-specific Papen and Prussian-Coup branches are blocked;
- a no-majority parliament still creates risk, because Braun's government can face a no-confidence vote or a direct far-right coup.

This is a costly alliance-building route whose feasibility is decided before 1932.

#### Support Ernst Thälmann

This requires KPD relations of at least 50 and a left faction stronger than the reformists. It causes major losses among internal moderates and democratic allies. A Thälmann victory provokes an immediate right-wing coup and civil war. The game treats it as a revolutionary polarization route.

#### Ballot resolution

The first round requires a majority; the second uses a plurality. If Braun or Thälmann leads strongly enough, the Nazi candidate can withdraw and endorse Hindenburg. Hitler is replaced by Göring if Hitler has been deported. A Hitler or Göring victory produces Nazi seizure of power.

Source: `source/scenes/events/presidential_election_1932.scene.dry`.

### 7.2 Why reducing presidential powers can be stronger than electing Braun

Braun's presidency changes the occupant of a dangerous institution. Reducing presidential powers changes the institution. The latter blocks multiple chains regardless of the individual winner and can contain an extremist elected in 1934.

The strongest democratic route can do both, but the distinction is important for design: personal control creates contingent protection; institutional reform creates structural protection.

### 7.3 Hindenburg's death and the 1934 succession

Hindenburg dies in July 1934 if still president. The succession event assembles a wide candidate field whose availability depends on political development:

- unity or establishment candidates such as Eckener, Adenauer, or Gessler;
- KPD candidates Thälmann or, with Conciliator development, Münzenberg;
- SPD candidates Braun, Schumacher, or Juchacz, with different prerequisites;
- cultural figures including Einstein, Thomas Mann, or Ossietzky when presidential powers are reduced, pro-republic sentiment is high, pacifism has advanced, and additional candidate conditions are met.

The candidates aggregate current party vote shares. Relationships and resources determine party endorsements. The second round consolidates far-right and bourgeois blocs and allows further bargaining or changed endorsements.

Outcomes divide into several families:

- a democratic, SPD, unity, or cultural winner weakens the Nazi front and proceeds to the normal end;
- a far-right winner installs Hitler as chancellor or otherwise initiates Nazi control;
- if presidential powers were reduced, the player may resist an extremist president through a referendum or armed defense;
- a Thälmann victory under unreformed presidential power causes civil war, while reduced power can contain him;
- Münzenberg does not trigger the same coup response.

The referendum against an extremist use of the presidency combines SPD, DDP, Zentrum, and sometimes KPD or DVP support, then adjusts for SA and Reichsbanner pressure. The late presidential result is thus a summary test of electoral support, alliances, constitutional reform, and organized force.

Sources: `source/scenes/events/death_of_hindenburg_president.scene.dry`, `death_of_hindenburg_normal.scene.dry`, `1934.scene.dry`.

## 8. From parliamentary breakdown to dictatorship

### 8.1 Papen

Papen can replace Brüning or Wirth after May 1932 when Hindenburg remains president, the SPD is outside government, and parliamentary or social conditions have deteriorated. The trigger can be supported by a failed coalition, the NSDAP becoming the largest party, high street strife, an anti-democratic majority, or extreme unemployment. Reduced presidential powers block this route.

His arrival does structural damage:

- two levels of judicial reform are erased;
- the cabinet becomes independent of parliamentary parties;
- a snap election is scheduled;
- the SA is legalized;
- pro-republic sentiment falls;
- control of ministries passes to independents.

Papen is therefore more than a different chancellor portrait. He removes the institutional tools the player spent years developing and accelerates the far right.

### 8.2 The Prussian Coup

The Prussian Coup can occur under Papen or Schleicher, with Hindenburg as president, after the relevant 1932 date, while the SPD is outside the national government, Prussia remains SPD-controlled, and presidential powers remain unreformed.

The player may surrender or resist. Surrender loses Prussia, removes 1,000 Reichsbanner members, halves Reichsbanner militancy, and damages support. Resistance requires at least 200 raw Reichsbanner power to be offered and compares the republican forces with a coalition that includes hostile Reichswehr strength. Defeat can lead to civil war or permanent loss of the most important regional institutional base.

The chain reveals why Prussian control matters throughout the game. It provides police power, a platform for democratic administration, and part of the armed defense. It is also vulnerable if national constitutional reform is neglected.

Source: `source/scenes/events/prussian_coup.scene.dry`.

### 8.3 Schleicher

Schleicher follows another failed Papen election or can appear in other no-majority branches. His works-and-suspension scheme offers a last elite-managed alternative to Hitler. Rejecting or failing the scheme returns the game to the no-majority sequence. Another failed election under Schleicher sends the game directly to Hitler's chancellorship.

### 8.4 Hitler as chancellor

The dedicated appointment condition broadly requires:

- 1933 or later;
- Hindenburg as president;
- Papen or Schleicher as chancellor;
- the SPD outside government;
- the NSDAP as the largest party;
- Hitler not deported;
- unreformed presidential power;
- no successful Schleicher scheme.

When the appointment happens, the player can accept the end or fight, in which case the game moves to civil war. By this point ordinary parliamentary choices have disappeared because the state variables required for appointment encode the collapse of the parliamentary route.

Sources: `source/scenes/events/hitler_chancellor.scene.dry`, `hitler_takes_power.scene.dry`.

### 8.5 March on Berlin

The March on Berlin can trigger when the SPD governs, coup progress is at least 10, the year is after 1930, and the major far-right paramilitaries are legal. A second path can trigger after February 1933 when normalized NSDAP plus DNVP support reaches 50.

The immediate defense compares:

- effective Reichsbanner power after the party-dissent penalty;
- Prussian police if the SPD still controls Prussia;
- a general-strike contribution based on worker support, unemployment, and party unity;
- loyal Reichswehr strength, especially under a Braun presidency and SPD government;

against SA and Stahlhelm power.

If the democratic force exceeds the attackers, an initial confrontation can produce a major victory; a later or weaker success produces a lesser victory. Otherwise resistance becomes civil war. Judicial reform can unlock a court-centered response, and presidential or electoral conditions may permit a new-election response, but these also rely on preparation.

Source: `source/scenes/events/march_on_berlin.scene.dry`.

## 9. Civil war: the final accounting of earlier choices

The civil-war calculation is one of the most important places where visible choice and implemented causality differ.

### 9.1 Power is calculated on entry

As soon as the civil-war scene opens, it calculates the two sides.

The republican side can include:

- Reichsbanner power, reduced by SPD dissent;
- Prussian police if Prussia remains controlled;
- loyal Reichswehr strength, with full value only under favorable presidency and government conditions and reduced value otherwise;
- full RFB power if KPD relations are at least 60, or half at relations of at least 45;
- general-strike power derived from SPD and KPD worker support, unemployment, and SPD dissent.

The opposing side combines:

- SA power;
- Stahlhelm power;
- the hostile share of the Reichswehr.

The scene immediately sets one of three outcomes:

- **Republican victory** if allied power is more than 110 percent of enemy power;
- **Long war** if the allied/enemy ratio is at least 0.6 but below the victory threshold;
- **Total defeat** below that.

### 9.2 The later war prompts do not change the result

The player is then asked to appeal to the army, seek KPD help, call a general strike, or mobilize the police. Those prompts count how many war choices have been inspected and reveal the strengths already included in the calculation. They do not add force or recalculate the result.

This means the real civil-war decisions occurred earlier:

- whether the Reichsbanner was built and made effective;
- whether the SPD remained united;
- whether KPD relations reached 45 or 60;
- whether Prussia and its police were retained;
- whether police and army loyalty were improved;
- whether Braun became president;
- whether SA and Stahlhelm growth was constrained.

Foreign intervention after a long-war result also adds narrative resolution but does not recalculate the initial outcome.

For the Polish iteration, the delayed accounting is valuable, but the presentation should state that the player is activating previously prepared assets or should actually recalculate when a new commitment is made. Otherwise the interface implies agency that the code does not provide.

Source: `source/scenes/events/civil_war.scene.dry`.

## 10. How the endings actually work

### 10.1 There is a terminal date and there are early terminal crises

The normal campaign reaches Hindenburg's death and the 1934 succession, then routes through `1934_end` and `game_over_1934` to the ending menu. Hitler's undisputed takeover, a decisive civil-war defeat, or related crises can end the game earlier.

The campaign does not select one exclusive epilogue that summarizes everything. `game_over.scene.dry` presents every ending card whose condition is true. The player can therefore receive several simultaneous descriptions of the same state: one for the regime, another for the president, another for government, another for unemployment, and another for ideological or social reform.

### 10.2 Regime and conflict endings

The main regime lenses include:

- **Hitler in undisputed control:** Hitler is president or chancellor and there was either total defeat or no civil war.
- **Hitler in power but still opposed:** Hitler holds office during a long civil war.
- **Hitler does not yet control Germany:** neither Hitler condition holds and the player is not in the excluded defeat state. The text may still warn that Papen, Schleicher, Brüning, or defeat in the Prussian Coup points toward future authoritarianism.
- **Nazi power despite Hitler's deportation:** Goebbels or Göring can head a Nazi outcome.
- **Civil war won:** `republic_victory == 1`.
- **Civil war lost:** the total-defeat condition.
- **Germany gripped by civil war:** `long_war == 1`.

Avoid reading “Hitler does not yet control Germany” as a clean democratic victory. The text is deliberately contingent. A Papen or Schleicher government can qualify while leaving Germany on an authoritarian path.

### 10.3 Presidential and government endings

Separate cards recognize outcomes such as:

- Otto Braun victorious;
- Kurt Schumacher victorious;
- Marie Juchacz as president;
- Albert Einstein as president;
- the SPD still governing under an SPD chancellor;
- communist victory;
- an SPD emergency government.

These cards describe who holds office, not the entire health of the regime. The same run can show an SPD-government card and an economic card, or a presidential card and a socialization card.

There is a likely precedence issue in the communist-ending predicate:

```text
chancellor_party == "KPD" or president == "Thälmann" and no defeat and no long war
```

With ordinary boolean precedence, a KPD chancellor qualifies regardless of the defeat/long-war checks, while a Thälmann presidency does not. This should be treated as a bug candidate rather than a deliberate distinction.

### 10.4 Economic endings

The ending menu separately recognizes:

- a works program;
- unemployment reduced below 10;
- unemployment between 10 and 20;
- unemployment still at 20 or above.

These cards show why survival and economic victory are not identical. A player may prevent Hitler but finish with mass unemployment, or achieve a dramatic economic recovery under a politically compromised government.

### 10.5 Ideological and social-program endings

Other cards recognize:

- transformation into a People's Party;
- at least two levels of nationalization;
- at least three levels of works councils;
- creation of a European Union.

These are records of the political project pursued during survival. They allow the ending to answer not only “did democracy live?” but “what kind of social democracy emerged?”

### 10.6 Achievements form a more detailed hidden evaluation

The achievements record is more granular than the visible ending-card structure. It recognizes:

- survival at different difficulties;
- specific coalitions, including sustaining a left or Popular Front government;
- class-pure or broad demographic electoral strategies;
- economic miracle conditions after 1932, including unemployment below the opening 8.6, positive budget, and inflation below 5;
- women's and homosexual rights;
- Heidelberg Program and ideological outcomes;
- constitutional amendments;
- Hitler's deportation;
- special combinations of president and constitutional reform;
- long civil war or victory;
- other policy and foreign-policy achievements.

The 1934 transition also awards a demanding “Brothers to Sun” combination when the campaign ends on normal or higher difficulty with an SPD president, no Hitler, unemployment below 20, no civil war, Hitler deported, substantial reparations progress, and strong women's-rights reform. A separate “Free market” recognition exists for finishing without adopting an economic plan.

The game therefore has two evaluation layers:

1. ending cards explain several dimensions of the final world;
2. achievements recognize difficult routes and combinations.

Sources: `source/scenes/events/1934_end.scene.dry`, `game_over_1934.scene.dry`, `source/scenes/game_over.scene.dry`.

## 11. Choice-to-consequence map

The following table condenses the major delayed connections.

| Earlier decision | State changed | Later consequence |
|---|---|---|
| Campaign within a demographic | Party preference in that group | National polling, then the next election result |
| Change party ideology | Faction strength and dissent; policy support | Which programs and candidates can pass; how effective later campaigning and defense are |
| Improve Zentrum/DDP/DVP relations | Interparty relations | Coalition formation, no-confidence behavior, presidential endorsements |
| Improve KPD relations | KPD relation and coalition willingness | Conciliator route, left/Popular Front, KPD goals, RFB support in civil war |
| Ban or allow May Day | KPD relation, communist coalition, partner dissent, street forces | Feasibility of left cooperation and strength of later conflict |
| Choose Justice Ministry | Portfolio control | Judiciary buildup, constitution, stable bans, land reform, court defense |
| Choose Interior Ministry | Portfolio control | Police loyalty, far-right investigation, Hitler deportation |
| Choose Economic/Finance | Portfolio control and fiscal tools | Ability to implement crisis plan before annual shocks |
| Choose Reichswehr Ministry | Military-policy access | Army loyalty in coup and civil-war calculations |
| Support WTB | WTB support, faction balance | Strong employment program, fiscal/coalition pressure, better recovery chance |
| Support moderate plan | Moderate support and reformist strength | Faster adoption, smaller recovery, easier coalition management |
| Support nationalization | Left strength, coup pressure | Socialist program, capital strike, stronger counterrevolution risk |
| Cut welfare | Budget/coalition relief; base and republic damage | Easier immediate cabinet survival, worse radicalization and elections |
| Tax wealth/business aggressively | Budget and social support; capital-strike progress | More fiscal capacity, possible economic sabotage crisis |
| Build works councils | Worker power and policy efficiency; capital pressure | Cheaper/deeper socialization, higher business confrontation |
| Build Reichsbanner | Strength and militancy | Better coup defense; possible coalition rupture over militancy |
| Preserve Prussia | Regional control and police | Deportation capacity, coup defense, later target of Prussian Coup |
| Elect Braun | Presidency, legitimacy, army alignment | Blocks Hindenburg chain, enables emergency defense, alters coup balance |
| Reduce presidential powers | Constitutional flag | Blocks Papen/Prussian Coup branches and contains later extremist president |
| Enact constructive no confidence | Constitutional flag | Coalition dissent no longer automatically ends a cabinet |
| Repeat elections without a majority | election counters, legitimacy and voter shifts | Brüning → Papen → Schleicher → Hitler escalation |
| Allow budget to reach −5 | Budget threshold | Immediate capital strike while SPD governs |
| Let coup progress reach 10 | Coup threshold | March on Berlin or immediate civil war on radical government formation |
| Keep unemployment above 15/30 | Economy | Monthly republican-legitimacy loss and extremist growth |
| Reach recovery thresholds by 1933 | economy, legitimacy, government, coup | Return to Normalcy and Nazi collapse |

## 12. Worked trajectories

These are causal examples, not guaranteed walkthroughs. Random card access, election results, event order, and difficulty can alter them.

### 12.1 Institutional social-democratic victory

1. Campaign enough to lead a Weimar or Grand Coalition in 1928.
2. Preserve Zentrum and DDP relations while obtaining Justice and Economic or Finance.
3. Begin judiciary reform early; four levels are needed before constitutional reform becomes available.
4. Recognize the Nazi threat and develop neorevisionism.
5. Adopt WTB or a sufficiently early moderate program, then implement enough phases to blunt the 1931–1932 shocks.
6. Pass the constructive vote and reduce presidential powers when referendum support is available.
7. Keep coalition dissent below its threshold; use resources for a crisis only when necessary.
8. Deport Hitler if Interior, police, Prussian, and judiciary preparation also permits it.
9. Enter 1933 with unemployment at 13 or below, pro-republic at 50 or above, inflation below 7, no Papen/Schleicher cabinet, and coup progress below 9.
10. Trigger Return to Normalcy; contest the 1934 succession from a much stronger democratic position.

This route wins by preventing the late crisis from acquiring its prerequisites.

### 12.2 Braun defensive presidency

1. Build SPD support and preserve resources before 1932.
2. Improve relations with Zentrum and at least one of KPD or DVP.
3. Pay to run Braun.
4. Use those relationships and further resources to assemble enough endorsements.
5. Win the second-round plurality.
6. If parliament later lacks a majority, use Braun's authority to support an SPD emergency cabinet.
7. Keep far-right parliamentary strength below the immediate-coup threshold and relations high enough to survive no confidence.
8. Combine the presidency with Prussian control, Reichsbanner strength, and army loyalty so that an attempted coup can be defeated.

The presidency is not a substitute for a parliamentary or military base. If the far right is already too strong, Braun's emergency government simply moves the conflict directly to a coup.

### 12.3 Popular Front survives its term

1. Raise KPD relations early and avoid Blutmai.
2. Help the Conciliators where possible and build `communist_coalition` repeatedly.
3. Preserve workable Zentrum and DDP relations rather than treating every centrist party as an enemy.
4. Build a parliamentary Popular Front majority.
5. Hold enough resources or elect Braun to overcome the final formation barrier.
6. At ministry allocation, secure the portfolios required by likely KPD goals.
7. Pursue those goals immediately; the timer is unforgiving.
8. Avoid moderate or WTB choices that add KPD coalition dissent unless there is enough room to compensate.
9. Keep coup progress below 10 at formation or be ready for civil war.
10. Complete every required goal to secure the coalition for the term.

The route is won before coalition formation by ensuring that the promised program is executable.

### 12.4 Radical transformation and republican victory in civil war

1. Strengthen the SPD left and build support for nationalization.
2. Keep overall party dissent low enough that the Reichsbanner and strike remain effective.
3. Build KPD relations to at least 60 for full RFB participation.
4. Retain Prussia and improve police loyalty.
5. Expand and train the Reichsbanner.
6. If possible, elect Braun and improve Reichswehr loyalty.
7. Adopt and implement nationalization, accepting that coup and capital-strike pressure will rise.
8. When the capital strike or far-right coup arrives, use prepared social and coercive strength rather than expecting the crisis screen to create it.
9. Enter civil war with allied power above 110 percent of the enemy total.

This is the most confrontational route. It can deliver both socialization and republican victory, but every preparation consumes time that could have gone to electoral or economic stabilization.

### 12.5 Historical-style collapse through toleration

1. Fail to secure a durable majority after the initial coalition.
2. Tolerate Brüning to avoid an immediate election or right cabinet.
3. Accept emergency cuts to preserve toleration.
4. Lose worker and unemployed support while unemployment weakens the republic.
5. Enter repeated elections with a larger NSDAP and weaker democratic bloc.
6. Exhaust the limited Brüning no-majority cycle.
7. Hindenburg appoints Papen; judicial progress is rolled back and the SA is legalized.
8. Lose Prussia or fail to resist the coup.
9. Another election produces Schleicher.
10. Reject or fail Schleicher's scheme; the next no-majority result appoints Hitler.
11. Surrender for an immediate Nazi ending or fight with whatever forces earlier policy left available.

No single choice here says “appoint Hitler.” The ending emerges from repeated short-term postponements and degrading state.

### 12.6 Authoritarian anti-Hitler compromise

1. Reach Schleicher after parliamentary failure.
2. Accept the Reichstag suspension and works proposal.
3. Assemble the needed support from SPD plus cooperative center and conservative parties.
4. Delay the next election and block immediate Hitler appointment.
5. Finish without Hitler but under an authoritarian chancellor and with lower pro-republic sentiment and internal SPD cohesion.

The ending may say Hitler does not control Germany while warning that Schleicher's system creates a dangerous future. This is survival without democratic restoration.

### 12.7 Apparent resistance prepared too late

1. Spend the early game almost entirely on polling and immediate support.
2. Neglect KPD relations, Prussian police, Reichsbanner militancy, army loyalty, and Justice reform.
3. Win respectable parliamentary results but fail to form stable coalitions as relationships deteriorate.
4. Allow Papen or a far-right coup to appear.
5. Choose every defiant option in the coup and civil-war prose.
6. Lose because the civil-war scene calculated weak allied power before those options appeared.

This trajectory explains why a player can feel that brave late choices “did nothing.” They are acknowledgements of previous preparation, not fresh inputs to the result.

## 13. What the implementation communicates well

### 13.1 It turns political strategy into connected systems

Economic decisions affect unemployment, unemployment affects legitimacy, legitimacy affects voting, voting affects coalition arithmetic, coalition composition affects available ministries, ministries affect institutional reform, and institutional reform affects whether a coup can occur. This connectedness makes the alternate history feel earned.

### 13.2 It makes compromise costly in different currencies

A policy rarely has a universal “good” or “bad” value. Welfare expansion may help the base while harming budget and coalition stability. Nationalization may improve socialist goals while accelerating capital and military resistance. Moderation may preserve partners while allowing unemployment to remain dangerous. The player chooses which reserve to spend.

### 13.3 It gives the party an internal life

Faction strength and dissent prevent the SPD from functioning as a unitary actor. The player cannot change ideology, abandon labor, embrace the KPD, or broaden into a People's Party without organizational consequences. This is especially useful for a game centered on a political party rather than a state.

### 13.4 It makes cabinet portfolios strategically meaningful

Ministries create long-term capabilities. A coalition negotiation is a choice about the actions that will exist during the term. This is a strong model to retain in a Polish form once the historically appropriate cabinet system and portfolios are researched.

### 13.5 It supports several definitions of success

The ending can recognize survival, economic recovery, constitutional reform, socialist transformation, rights, party realignment, or armed victory. The player is not forced into one score. That fits a political game in which “winning” has ideological content.

## 14. Where the implementation can mislead the player

These observations describe code behavior. Some may be intentional simplifications; others are probable defects.

### 14.1 Displayed seats and coalition math are not one exact ledger

The election freezes represented percentages, but the parliament chart approximates 500 seats through independent rounding while majority tests use percentages. Displayed vote shares are also independently rounded. A player can see totals that do not add to exactly 100 or a seat display that does not perfectly match coalition availability.

**Polish lesson:** calculate votes once, allocate an exact legal chamber size with a documented method, and use those same integer seats for all majority and coalition checks.

### 14.2 Frequency metadata does not weight normal deck draws

Cards declare frequency values, but the ordinary unbounded deck draw is uniform among eligible cards in the baseline engine. Designers may believe a card is rare or common when it is not.

**Polish lesson:** either change the engine/deck configuration so frequency applies, or remove the misleading metadata and design availability with explicit cooldowns and conditions.

### 14.3 Some political uncertainty is a flat coin flip

Multiple valid `go-to` destinations are selected uniformly. The DVP plea can therefore succeed or fail 50/50. Some rally disruptions and tied presidential outcomes can behave similarly.

**Polish lesson:** expose a probability derived from state, resolve deterministically at a threshold, or clearly label a chance event. Do not let an unmarked engine fallback decide an important historical branch.

### 14.4 The civil-war menu suggests agency after the outcome is fixed

The result is calculated on scene entry. The player then chooses which sources of support to inspect, but those choices cannot change the outcome.

**Polish lesson:** present this as an audit of preparations, or postpone calculation and make commitments carry real costs and effects.

### 14.5 Event priority can hide causal ordering

When several events are due, priority determines what appears first. Elections are deliberately low-priority. Without clear dates or a queue, a player may not understand why a crisis intervened before the scheduled election.

**Polish lesson:** show a short timeline or “events due this month” panel when order changes what choices remain available.

### 14.6 Some thresholds are too opaque for long-lead planning

Justice plus four judicial reforms plus neorevisionism plus a specific coalition is a rich route, but a new player may learn the requirement only after it is too late. Similar opacity affects KPD goals, deportation, and armed defense.

**Polish lesson:** advisors, tooltips, or a policy-planning screen should reveal requirements without revealing every future story beat.

### 14.7 Boolean and variable-name defects can change outcomes

The communist-ending precedence issue and `month_activities`/`month_actions` mismatch are examples. The source also includes some inconsistent singular/plural or legacy names. Such problems are particularly risky in Dendry because a valid-looking scene can silently read or write the wrong state.

**Polish lesson:** centralize important predicates, document canonical variables, and test each terminal route and calendar-consuming action.

### 14.8 Historical labels sometimes conceal gameplay abstractions

“Seats” are effectively represented percentages in much of the German logic. Demographic groups overlap but are added as if they were separate weights. Coalition labels contain fixed adjustments such as the BVP subtraction. These abstractions may be suitable for the German game's balance, but their names can imply more precision than they have.

**Polish lesson:** label a value as polling, votes, mandates, relationship, or abstract influence according to what it actually represents.

## 15. Current Polish boundary compared with the German architecture

This section describes the current uncommitted worktree only so that future decisions start from the right boundary.

### 15.1 What has already changed

The Polish November 1922 sequence separates votes from seats. It records voting support once, allocates exactly 444 Sejm mandates, and uses 223 as the majority. ChZJN is displayed as a joint ZLN–PSChD electoral list while those parties remain separate for relations and cabinet membership. Parliamentary results remain fixed between elections. A proportional 111-seat Senate snapshot is derived only for the December National Assembly.

This is already a structural improvement over the German baseline's approximate 500-seat display and percentage-based coalition tests.

Current sources: `source/scenes/sejm_election.scene.dry`, `source/scenes/sejm_election_result.scene.dry`.

### 15.2 Current government outcomes are a transition layer

The election screen exposes six broad outcomes:

1. PPS majority government;
2. Koalicja Lewicy: PPS, PSL Wyzwolenie, and the minority bloc;
3. a centre-left coalition: PPS, PSL Wyzwolenie, PSL Piast, and NPR;
4. a PPS–Wyzwolenie cabinet with external minority-bloc support;
5. a Chjeno-Piast government with PPS in opposition;
6. PPS remaining in opposition.

The source explicitly states that named successor cabinets and ministry allocation are not yet implemented. These choices establish a parliamentary position but do not yet reproduce the German game's deep portfolio-to-action graph.

Current source: `source/scenes/sejm_election.scene.dry`; the linked outcome scenes are currently housed in the inherited election file.

### 15.3 The current presidential sequence is intentionally fixed

The December sequence records the historical ballot candidates, Narutowicz's election, Piłsudski's transfer of support, the assassination, an approved peaceful PPS response, and Wojciechowski's election. Alternative Daszyński choices are visible but unavailable. The recorded decisions do not change support, relationships, factions, resources, militia, government, or portfolios.

The code also correctly distinguishes the March Constitution presidency from the German direct-popular presidency and emergency-power model. It writes a Polish presidency state instead of granting the inherited German `president` and `presidential_powers` mechanics.

This means the current Polish sequence is a fixed historical anchor, not yet an alternate-history contest like the German 1932 and 1934 presidential elections.

Current source: `source/scenes/polish_presidential_sequence.scene.dry`.

### 15.4 Most later causal systems remain German legacy

The current Polish transition documentation marks the economy, later violence, foreign policy, later story events, and endings as largely inherited or unresolved. The temporary 1928 election and German events cannot be treated as approved Polish history. The monthly loop is reusable infrastructure, but its political variables and event meanings require Polish replacements.

Current sources: `TRANSITION_MATRIX.md`, `MECHANICS_MAP.md`, `STATE_VARIABLES.md`, `PLAN.md`.

## 16. Recommendations for the Polish iteration

### 16.1 Preserve the delayed-causality structure

The best feature of the German game is that a 1932 crisis is resolved by earlier choices. The Polish game should retain that idea:

```text
ordinary party decision
→ persistent political capacity or liability
→ later institutional crisis checks it
→ outcome explains which preparation mattered
```

The Polish version should define its own historically appropriate long-running pressures. Placeholders for research could include:

- `[RESEARCH: causes and parliamentary mechanisms of cabinet instability, 1922–1926]`;
- `[RESEARCH: PPS relations with PSL Wyzwolenie, PSL Piast, NPR, minority blocs, communists, and the right]`;
- `[RESEARCH: constitutional powers and conventions of the Sejm, Senate, President, prime minister, and ministers under the March Constitution]`;
- `[RESEARCH: PPS-affiliated or republican self-defense organizations, police influence, and trade-union mobilization]`;
- `[RESEARCH: economic pressures and feasible PPS programs before and after the złoty and fiscal crises]`;
- `[RESEARCH: the political and coercive prerequisites of the May 1926 crisis]`.

These should become explicit state variables only after evidence establishes what they mean.

### 16.2 Keep exact parliamentary representation canonical

The current exact 444-seat model should be the single source of truth. Every coalition screen, investiture test, confidence vote, presidential National Assembly composition, and parliamentary chart should read the same frozen mandate ledger.

If electoral alliances contest jointly but organize separately afterward, store both:

- the list-level votes and mandates used for the election result;
- the attributed party mandates used for parliamentary relations and cabinets.

The current ChZJN treatment follows this principle.

### 16.3 Decide the meaning of each government option

For each of the six current outcomes, the design needs a researched answer to five questions:

1. Who is the prime minister or plausible candidate?
2. Which parties formally enter the cabinet?
3. Which parties provide toleration or confidence-and-supply support?
4. Which portfolios can the PPS realistically demand?
5. What agreement or policy obligations keep the arrangement alive?

This turns a label into a gameplay route. A left coalition should not merely set `in_polish_left_coalition`; it should determine capabilities, obligations, dissent risks, and successor events.

### 16.4 Use portfolios as access to actions, with Polish institutions

The German capability-graph concept is worth retaining, but the portfolio list, competences, and appointment mechanics should be researched rather than translated literally.

A planning matrix can use placeholders:

| Researched Polish portfolio | Immediate actions | Long-lead capacity | Coalition cost | Research status |
|---|---|---|---|---|
| `[PORTFOLIO A]` | `[ACTIONS]` | `[LATER UNLOCK]` | `[BARGAINING COST]` | TBD — historical research required |
| `[PORTFOLIO B]` | `[ACTIONS]` | `[LATER UNLOCK]` | `[BARGAINING COST]` | TBD — historical research required |
| `[PORTFOLIO C]` | `[ACTIONS]` | `[LATER UNLOCK]` | `[BARGAINING COST]` | TBD — historical research required |

The key rule is that a portfolio should give the player a meaningful action family. Purely decorative cabinet posts do not justify a bargaining system.

### 16.5 Give coalition partners specific obligations

The KPD-goals system is effective because forming a coalition creates future duties. Polish coalitions could use researched agreements or red lines:

- a land, labor, minority-rights, education, fiscal, or constitutional promise;
- a timetable for delivering it;
- a relationship or parliamentary consequence for failure;
- a way to renegotiate at a political cost.

Use `[RESEARCH: documented programmatic demands and coalition negotiations]` until those duties are supported by sources. Avoid inventing convenient demands to create balance.

### 16.6 Separate party cohesion from cabinet cohesion

The German distinction is valuable. PPS faction or tendency dissent should measure internal legitimacy; coalition dissent should measure whether other parliamentary partners will continue the government. One policy can improve one while harming the other.

The Polish faction list and ideological boundaries should remain grounded in the project's existing researched faction work. Later cabinet mechanics should consume those same canonical variables rather than introduce parallel anonymous “left/right” meters.

### 16.7 Make the presidency a constitutional office, not a reskinned Hindenburg

The current Polish code already avoids inheriting German presidential powers. Continue this separation. Presidential effects should arise from the March Constitution, parliamentary composition, countersignature, appointment conventions, public legitimacy, and specific crises supported by research.

If future alternate presidential outcomes become playable, define for each candidate:

- how the National Assembly coalition is assembled;
- whether the candidate accepts;
- what constitutional discretion the office actually has;
- how the choice affects cabinet formation and legitimacy;
- which effects are personal influence and which are legal powers.

Use `[RESEARCH: candidate behavior and constitutional practice]` rather than transferring Braun/Hindenburg mechanics.

### 16.8 Decide where history is fixed and where it can diverge

The current December 1922 sequence is fixed. That can work as an opening anchor, but the game should signal the category of each scene:

- documented event with fixed outcome;
- documented event with meaningful PPS response;
- plausible alternate-history branch;
- gameplay abstraction;
- unresolved research question.

The German version often allows history to diverge as soon as a threshold has been prepared. The Polish design should set an explicit divergence policy for each major event rather than expose unavailable choices indefinitely.

### 16.9 Make late-crisis choices real or present them as reports

If a coup, strike, or constitutional crisis calculates its result on arrival, the following screen should explain the assembled balance and offer a “see outcome” action. If the player is asked to request union, police, military, or allied support, the request should modify the calculation, spend a resource, risk refusal, or have another real consequence.

### 16.10 Give advance warning for long-lead routes

A planning screen should show goals such as:

- “Two more `[INSTITUTION]` reforms are needed before `[CONSTITUTIONAL ACTION]`.”
- “Our agreement with `[COALITION PARTNER]` expires in six months; two of four promises are complete.”
- “Cabinet friction is 2/3; another confrontational policy may trigger a confidence crisis.”
- “Our organized defense is weaker than the known opposition, though some forces are uncertain.”

This preserves discovery while allowing deliberate strategy.

### 16.11 Use visible pressure bands before hard thresholds

The German business-confidence warning at capital-strike progress 6–9 is a good pattern. Apply similar bands to cabinet collapse, party rupture, public-order crisis, and constitutional conflict. Exact hidden numbers are optional, but the direction and seriousness should be legible.

### 16.12 Retain multidimensional endings, then add an overall verdict

The German ending menu successfully describes several dimensions, but it can feel fragmented. A Polish ending could present:

1. **Regime:** parliamentary democracy, constrained democracy, authoritarian government, civil conflict, or another researched outcome.
2. **PPS:** governing, tolerating, opposition, split, transformed, or suppressed.
3. **Society and economy:** employment, wages, welfare, agrarian conditions, monetary stability.
4. **Nationalities and civil rights:** results of the policies actually implemented.
5. **Foreign and security position:** only where the campaign and research support it.
6. **Historical divergence:** the principal turning points the player changed.

Then provide one short overall assessment based on explicit priorities chosen by the player or on a transparent set of conditions. Achievements can continue to recognize unusual combinations.

### 16.13 Test causal chains rather than isolated variables

The most useful automated tests will exercise whole routes:

- election votes freeze, exact mandates allocate, and all coalition tests use them;
- a cabinet grants only its assigned portfolio actions;
- crossing a coalition threshold triggers the correct confidence procedure;
- fulfilling every agreement item prevents collapse;
- a presidency change affects only documented powers;
- an economic intervention changes the next scheduled shock correctly;
- a prepared defense materially changes a crisis result;
- each terminal state exposes the correct compatible ending panels.

These tests catch stale German flags and mismatched variable names better than tests that only confirm a scene can load.

## 17. Proposed Polish design questions, in priority order

Before adding later plot, the following decisions would give the greatest clarity.

### Priority 1: What does the November government choice actually create?

For each currently listed government outcome, research and decide the cabinet head, member parties, tolerating parties, starting program, likely duration, and portfolio allocation method. Until this exists, later monthly action availability cannot be designed coherently.

### Priority 2: What are the Polish campaign's principal long-running crises?

Choose a small number of pressures that can connect ordinary turns to later plot. Possible categories require research and might include cabinet instability, currency/fiscal crisis, agrarian conflict, labor unrest, minority relations, civil-military relations, and conflict over constitutional practice. Each pressure needs a documented political meaning and a readable threshold structure.

### Priority 3: What can the PPS prepare before each major historical event?

For every fixed or potential event, define:

```text
advance warning
→ relevant preparations
→ event choices
→ result calculation
→ persistent aftermath
```

If no preparation can affect an event, it is narrative context rather than a strategic branch and should be presented accordingly.

### Priority 4: When does the alternate timeline open?

Decide whether November and December 1922 remain fully fixed, whether government formation can diverge while the presidential succession remains fixed, and at which later point player state can change the identity or outcome of major events. Record this policy in `PLAN.md` after approval.

### Priority 5: What constitutes a campaign ending?

Define the first Polish campaign's terminal date and regime questions before building many middle-game branches. That makes it possible to work backward and ensure early actions feed an ending rather than accumulate unused variables.

## 18. Source map

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

## Final design conclusion

The German original's plot is best understood as a contest between compounding crises and compounding preparation. The Depression, party fragmentation, presidential government, fascist mobilization, and armed reaction reinforce one another. The player answers by building a different reinforcing system: electoral support, internal unity, coalition trust, governing portfolios, economic recovery, constitutional protection, and organized democratic force.

The strongest Polish adaptation would preserve this causal form while replacing every German institution and historical chain with researched Polish equivalents. The current exact Sejm allocation and separate constitutional presidency are sound foundations. The next major step is to turn each November government outcome into a researched cabinet with portfolios, obligations, and pressures that can generate later Polish plot branches.
