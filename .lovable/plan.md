

## "Go Live" Coming Soon Dialog

**What**: Replace the Go Live button's action with a dialog/modal announcing the feature is coming soon, with a message about live streaming's purpose.

### Changes — `src/pages/Sell.tsx`

1. Import `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription` from `@/components/ui/dialog`
2. Add `const [liveDialogOpen, setLiveDialogOpen] = useState(false)` state
3. Wire the Go Live button's `onClick` to `() => setLiveDialogOpen(true)`
4. Add a `<Dialog>` with copy:
   - **Title**: "Coming Soon"
   - **Description**: "Live streaming is on its way — a new way to deepen your connection with buyers and the community. Take them along your bakes, tour your coop, and more. We believe that our connection to food and each other is vital for our health and community."
   - A close/OK button at the bottom

