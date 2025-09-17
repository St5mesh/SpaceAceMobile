# SpaceAceMobile
A mobile app to track and document a Space Aces: Voyages in Infinite Space playthrough. 

1) Objectives and scope

Objective: Provide a fast, offline, single-player companion app that serves as a live character and ship sheet, a galaxy and mission tracker, and a structured campaign journal with lightweight automation.

In scope: Character and ship management, galaxy hex tracking, missions and objectives, encounters and NPCs, inventory, session logs, dice roller (D20, D6), local persistence, export/share as file or text.

Out of scope: Multiplayer collaboration, cross-device sync or cloud backups, reminders or notifications.


2) Target user and constraints

Persona: Solo player or GM-less player who wants everything on a phone during sessions, minimal taps, legible on small screens, works offline.

Constraints: No dependence on internet, low cognitive load, one-hand use when possible.


3) Core features

1. Dashboard (Today’s Session)

Quick stats: Character name, Heat, Fame, Sway, Ship Shields/Hull/Drive Range, current Sector.

One-tap access to Dice Roller and Quick Log.



2. Character management

Species, career/background, traits, abilities.

Derived/read-only fields where appropriate, editable notes for house rules.

Inventory and special items, with tags and quantity.



3. Ship management

Purpose, Personality, Shields, Hull, Drive Range, modules/quirks.

Simple damage and repair flows, history of changes kept in the session log.



4. Galaxy & sectors (hex tracking)

Hex-grid browser with pinch/drag, tap a hex to open sector details.

Sector fields: name, type, discovered date, notable locations, encountered events, danger/Heat notes.

“Hypersurf” move action records travel, optional fuel/drive notes, auto-stamps into the log.



5. Missions & objectives

Mission card with primary/secondary/tertiary objectives, status, rewards, related sectors and NPCs.

Progress checklist, completion record added to the log with rewards and fame/sway adjustments.



6. Encounters & NPCs

Encounter entries linked to sector, mission, and session.

NPC records: species, role, disposition, tags, relationship meter, cross-links to sessions and sectors.



7. Session journal

Dated entries with rich-text basics, quick actions to insert “Character update”, “Ship damage”, “Hypersurf to Sector X”, “Encounter result”.

Filters by session, mission, or sector.



8. Dice roller (D20 & D6 only)

One-tap D20 and D6 with roll history, optional advantage/disadvantage style roll-two-keep-highest/lowest presets, configurable labels, haptic feedback.



9. Local storage and export

All data stored locally on device.

Export options: single JSON, or human-readable Markdown/PDF session report; manual import from JSON.




4) Data model (entities and key fields)

Character: id, name, species, career, notes, fame, sway, tags, inventory[].

Ship: id, name, purpose, personality, shields, hull, drive_range, modules[], quirks[], notes.

Sector: id, hex_qr or axial coordinates, name, type, discovered_at, notes, linked_encounters[], linked_missions[].

Mission: id, title, description, objectives[{text, status}], rewards, fame_delta, sway_delta, related_sector_ids[], npc_ids[].

Encounter: id, title, type, sector_id, mission_id, date, outcome, heat_context, notes.

NPC: id, name, species, role, disposition, relationship, sector_ids[], mission_ids[], notes.

Session: id, date_range, summary, entries[].

LogEntry: id, timestamp, type(enum: note, roll, travel, damage, reward…), data(json), references to entity ids.

Roll: id, die_type(enum:d20,d6), result, modifiers[], mode(enum: normal, advantage, disadvantage), note, timestamp.


5) Key screens and UX

1. Home/Dashboard

Top: Character/Ship summary chips, current Sector.

Centre: “Start/Continue Session” and latest mission cards.

Bottom dock: Tabs for Galaxy, Missions, Journal, Character, Ship, More.



2. Galaxy

Zoomable hex map, search by name, colour badges for discovered vs undiscovered, danger markers.

FAB: “Hypersurf here”, which creates travel log entry and optionally updates Drive notes.



3. Missions

Kanban-like list: Not Started, In Progress, Complete.

Mission detail with objective checklist and quick-add log button.



4. Journal

Timeline view, filters, “Quick Add” with templates, inline dice insert.



5. Character / Ship

Collapsible sections with large tap targets, edit vs view modes.



6. Dice Roller

Full-screen modal or pull-up panel, big D20 and D6 buttons, roll presets, history list, “Add to Log” toggle.



7. Encounters & NPCs

Lightweight creation from any screen, links back to sector/mission.




6) Core flows

Start a session → create Session, pin it to the Dashboard.

Move sector → tap hex → Hypersurf → auto log entry.

Apply ship damage/repair → confirm delta → snapshot change in log.

Complete objective → tick checkbox → optional reward/fame/sway prompts → log.

Record encounter → from Galaxy or Mission, add type/outcome → log.

Roll dice → tap D20/D6 → result, optional add-to-log.


7) Dice roller details

Modes: Normal, roll 2 keep highest (advantage-style), roll 2 keep lowest (disadvantage-style).

Options: Add note, link the roll to a Mission/Encounter, “auto-append to current Session log”.

Fairness: Use secure RNG from OS, show seed source as “system secure random”, store roll history locally.


8) Technical architecture

Platform: Cross-platform mobile, e.g. Flutter or React Native.

State management:

Flutter: Riverpod or Bloc, feature-scoped providers.

React Native: Redux Toolkit or Zustand.


Storage: Local, schema-migrated. Options:

SQLite via Drift/Room/WatermelonDB, or a typed KV store (MMKV/SecureStore) for small preferences.

File export/import as JSON, on-device share sheet for Markdown/PDF exports.


Hex map: Custom canvas with axial coordinates, cached tiles, off-main-thread rendering where possible for smooth pan/zoom.

Navigation: Hierarchical with preserved state per tab, deep links to entities.


9) Performance and offline

60 fps target on Galaxy view, memoised selectors to avoid re-renders.

All features fully offline, no network permissions required.

On-device image caching for any sector or NPC images the user attaches.

10) Security and privacy

No analytics by default, optional toggle for basic anonymised diagnostics.

Sensitive fields (if any) can be protected behind an app PIN/biometric gate.

Explicit user consent before any export or file sharing.


11) Accessibility and UX quality

Large tap targets, dynamic type support, high-contrast theme.

Haptics for rolls and key confirmations.

Undo/redo for edits, soft confirmation on destructive actions.
