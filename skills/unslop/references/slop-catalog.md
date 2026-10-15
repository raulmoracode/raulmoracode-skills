# Slop catalog

Patterns that mark output as mechanically produced rather than thought through, each
with a short before and after. Read it when scanning a file, module, document or diff
for material that adds volume without adding information.

## Structure

### 1. Pass-through wrapper with one caller

```python
def get_user(user_id):
    return user_repository.find_by_id(user_id)
```

Delete it and call the repository. A wrapper earns its place by holding a decision;
this one holds none.

### 2. Over-generalized helper

```python
def process(data, normalize=True, validate=True, retries=3, dry_run=False):
```

Delete the parameters no caller sets. Each unused option is a compatibility promise and
a second code path nobody executes.

### 3. Premature abstraction and speculative interface

```python
class StorageBackend(Protocol): ...
class PostgresBackend(StorageBackend): ...
```

The only caller uses `PostgresBackend` directly. Use the concrete class; extract the
interface when a second implementation actually arrives.

### 4. Duplicate near-identical logic

Two functions identical except for the table name, plus a third call site that was
never updated. Extract one parameterized function.

The exception: duplication across modules with different owners or release trains is
often correct. Share when the copies will change together.

### 5. Magic numbers with no name

```python
if retries > 5 and timeout_ms < 3000:
```

Named constants next to the other configuration. `7`, `3600` and `10485760` have no
surviving explanation once the diff that introduced them is forgotten.

### 6. Defensive validation of internal invariants

```python
assert config is not None
assert isinstance(config, dict)
```

In a function whose only caller just built `config`, no untrusted source can reach it.
Validate where data enters the system, not on the way to your own code.

### 7. Dead code and commented-out blocks

Unused imports, a private method with no callers, forty lines of superseded logic in a
comment. Delete it; version control already remembers it.

### 8. try/except that swallows errors

```python
try:
    result = parse(payload)
except Exception:
    result = None
```

Catching the specific error and handling it, or letting it propagate, or logging with
the cause. A silent `None` turns a bug into a mystery three layers up.

## Comments and documentation

### 9. Comments that restate the code

```python
# Loop over the items

for item in items:
```

Delete. Keep the comment that explains a constraint, a workaround, a rejected
alternative or a link.

### 10. Comments that apologize or narrate

`# I'm keeping this hack for now`, `# this should be refactored later`, `# as mentioned
above`. Either it must be done now or it is not worth writing down; in a generated diff
it is usually a leftover apology for uncertainty nobody resolved.

### 11. Docstrings on trivial functions

A three-line docstring on `get_user_id(user)` that repeats the signature. Document the
contract where it is not obvious: public entry points, non-obvious invariants, units,
failure modes, and the reason for an unusual choice.

## Text

### 12. Placeholder text

- `TODO` with no owner and no trigger condition.
- "Add more here", "coming soon", "various items", "description goes here".
- Lorem ipsum in anything a user or client will read.
- Example data that reads as real: `john@example.com` used as if it were a customer, or
  realistic-looking account numbers and balances in a fixture. Use obviously synthetic
  values such as `test_user_1`.

### 13. Inflated prose

Before: "This is a very important point that must be noted here. Basically, the system
basically works by using the cache."

After: "The cache serves repeat reads."

Also inflated: a summary that repeats the section above it, a preamble restating the
title, "it is important to note that" in front of ordinary information, "it should be
noted", and sentences padded with adverbs where a verb would do.

## UI and markup

### 14. Filler elements

- Wrapper elements with no purpose: a `div` with no class, style or behavior.
- An empty state that says "No data" and gives the user nothing to do next.
- A heading that describes the page it sits on ("Dashboard", "User list") when the
  surrounding chrome already says it.
- Buttons whose label is "Click here" or "Submit" with no object named.

## Not slop

Leave these alone. Over-cleaning them is the same failure in reverse.

- **Validation at a trust boundary.** User input, network responses, file contents.
- **Error handling**, including a handler that logs and degrades deliberately.
- **Authorization checks** that look redundant because every caller also filters.
- **Tests.** Length is not the measure; a long test that protects a regression is
  earning its place.
- **Comments explaining why**, not what.
- **Interface or base class with two or more real callers**, where the seam isolates a
  volatile dependency or a decision.
- **Repeated code that is about to be shared** but whose owners differ.
- **Defensive checks on a path where the invariant is cheap to assert** and the failure
  would be silent.
- **Documentation of a public contract**, including the boring parts.
- **Whitespace, formatting and layout** that a formatter or reviewer will judge.
