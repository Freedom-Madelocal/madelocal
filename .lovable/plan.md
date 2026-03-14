

## Fix Location Button Behavior

**Current**: Button text changes from "Use location" to "Near me" when activated, using `variant="secondary"`.

**Desired**: Button text always shows the radius (default "5 mi"), and when active it gets a green styling instead of changing text.

### Changes — `src/pages/Index.tsx`

1. Replace the button text logic:
   - Inactive: `"5 mi"` with outline style
   - Active: `"5 mi"` with green background/text (e.g. `bg-green-100 text-green-700 border-green-300`)
   - Loading: keep the spinner

2. Replace `variant={location ? "secondary" : "outline"}` with `variant="outline"` and conditionally add green classes when `location` is truthy.

```tsx
<Button
  variant="outline"
  size="sm"
  className={cn(
    "shrink-0 rounded-full gap-1.5",
    location && "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
  )}
  onClick={requestLocation}
  disabled={locLoading}
>
  {locLoading ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin" />
  ) : (
    <MapPin className="h-3.5 w-3.5" />
  )}
  5 mi
</Button>
```

3. Add `cn` import from `@/lib/utils` if not already present.

