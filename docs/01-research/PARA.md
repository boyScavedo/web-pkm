# PARA Method

## Overview

PARA is Tiago Forte's information organization system. It classifies all
information into four categories based on actionability:

- **Projects**: Active efforts with a deadline and defined outcome
- **Areas**: Ongoing responsibilities with no end date
- **Resources**: Topics of interest, reference material
- **Archives**: Completed or inactive items from the other three

## What PARA is good at

- Answering "where is this useful in my life?"
- Separating actionable from reference material
- Providing a simple mental model for filing
- Surfacing what needs attention vs. what's stored

## What PARA is not good at

- Topic-based organization (use tags and links for that)
- Knowledge relationships (use wikilinks for that)
- Temporal organization (use dates and journaling for that)

## Implementation in web-pkm

- PARA is a first-class enum column on notes: `inbox | project | area | resource | archive`
- A note lives in exactly one PARA category
- Cross-references between PARA categories use the link graph
- The `inbox` category is added beyond traditional PARA for GTD capture workflow
- PARA classification can change as a note's actionability changes

## Storage impact

PARA is a single enum column + partial index. Negligible storage.
