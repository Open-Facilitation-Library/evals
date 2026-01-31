Annotate the following batch of dialogue turns with Why-How-Who tags.

Context: This is from a **{{methodology}}** facilitation session. The facilitator is labeled "Facilitator".

{{#if previous_turns}}
## Previous turns (for context only — do NOT annotate these)

{{previous_turns}}
{{/if}}

## Turns to annotate

{{turns}}

Return ONLY a JSON array with annotations for the turns above (not the context turns). Each element:

```json
{
  "turn": <number>,
  "why": ["tag", ...],
  "how": ["tag", ...],
  "who": "tag"
}
```
