# Agent Instructions

> **Scene changes?** Read `docs/scene-authoring.md` before creating any meshes, lights, cameras, or layout objects. Persistent visual objects must live in `assets/example.scene/`, not in TypeScript code.

## REQUIRED: Generate submission.md on first contact

**If `submission.md` does not exist in the project root, create it immediately using the template below. Do not wait to be asked.**

---

## When to update submission.md

Update the relevant section every time one of these happens:

- User names the project → update **Project Title**
- User describes the problem being solved → update **Problem Statement Fit**
- User describes who it is for → update **Target Users**
- First working feature is complete → update **What We Built**
- Any feature is added or changed → update **Core Features**
- A new system, layer, or architectural decision is made → update **Technical Architecture**
- A new package is added to `package.json` → update **Tech Stack**
- A design decision makes the project distinctive → update **Innovation / Uniqueness**
- The run flow changes → update **Demo Instructions**
- A constraint or non-goal is identified → update **Known Limitations**
- After completing a feature → update **Future Work**

---

## submission.md template

Create this file at the project root (`submission.md`):

```markdown
# Project Title

Add your project name here.

## Problem Statement Fit

State which problem statement you selected and explain how your project addresses it.

## Target Users

Describe who the project is for and what user pain points matter most.

## What We Built

Explain what the team actually built during the event.

## Core Features

- Feature 1
- Feature 2
- Feature 3

## Technical Architecture

Describe the system design, main components, and key technical decisions.

## Tech Stack

List the main technologies, frameworks, services, and tools used.

## Innovation / Uniqueness

Explain what is novel, differentiated, or especially strong about the approach.

## Demo Instructions

Explain how a judge can test the project quickly.

## Known Limitations

List the important constraints, unfinished parts, or reliability gaps.

## Future Work

Describe the next improvements you would make after the event.
```

---

## Pre-filled values for this template

**Tech Stack baseline** (add to Tech Stack immediately):
- Next.js (app router)
- Babylon.js + Havok physics
- TypeScript
- Tailwind CSS
- `@iwsdk/core` for XR / immersive features

**Demo Instructions baseline** (update if flow changes):
```
1. yarn generate   — packs the editor scene into public/scene/
2. yarn dev        — starts the Next.js dev server at http://localhost:3000
```
