

## Clickable Analytics Cards with Metric Descriptions

**What**: Make each analytics card on the Sell page clickable. Tapping a card opens a dialog showing the metric value, a description of what it means, and (for Followers) an additional "engaged followers" sub-metric.

### Data Structure

Extend the `stats` array with `description` and optional `extra` fields:

| Metric | Description |
|--------|-------------|
| Profile Views | Tracks how many people spent longer than 2 seconds on your profile. |
| Search Appearances | Shows how many times your profile or listing appeared in a search. |
| Contact Clicks | Shows how many people clicked the button to get ahold of you. When marketplace settings are enabled, this becomes "Transactions". |
| Followers | Shows how many people are following you. Also displays engaged followers in the last 30 days (those who interacted with your profile, listings, or videos). |

### Changes — `src/pages/Sell.tsx`

1. Add `description` string and optional `extra` object (e.g. `{ label: "Engaged (30d)", value: "89" }`) to each stat entry. All data stays as dummy values, ready for future Tribekiller edge function integration.

2. Add `selectedStat` state to track which card was tapped.

3. Make each analytics `Card` clickable with `onClick` and `cursor-pointer` styling.

4. Add a new `Dialog` that displays:
   - The stat icon in a colored circle
   - The metric name as title
   - The metric value prominently
   - The description text
   - For Followers: an additional row showing engaged followers count
   - A "Close" button

### No new files needed — all changes in `Sell.tsx`.

