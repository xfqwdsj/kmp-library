# AGENTS.md

**This repository is a template, not a library.** It ships no source code: `module/` is an empty Kotlin Multiplatform
module whose only content is the scaffolding a new library should start from. Everything else about it — the build setup,
the version catalog, publishing, CI and dependency updates — exists so that a new project can begin from a working
scaffold instead of an empty directory. Read this file as instructions for that scaffold, plus the rules that are meant to
carry over into the projects built from it.

Guidance for agents working in this repository. Everything here was verified against the code; keep it current when
behavior changes.

Keep this file to persistent design and rules: facts that go stale quickly — version numbers, target or file lists, test
counts — belong in the code, and this file points to the source instead of copying it. That matters more here than
anywhere else, because a derived project inherits this file before it inherits any code.

## What this is

- A Kotlin Multiplatform library template: one module, `module/`, with no sources at all. `commonTest` is wired to
  `kotlin("test")` and there is nothing to test yet.
- The module carries the parts every library needs and nobody wants to write twice: `explicitApi()`, `mavenPublishing`
  to Maven Central plus a GitHub Packages repository, Dokka with a `sourceLink` and documented visibilities, and
  `spotless` with ktfmt over the Kotlin sources and over the build scripts.
- Dependency and plugin versions are declared in `gradle/libs.versions.toml` and referred to by alias from the build
  files, so a new dependency joins the catalog rather than a build file.
- `explicitApi()` stays on: every public declaration in the library states its visibility explicitly.
- `.github/workflows/` runs the test suite on every pull request to `main` and publishes on a release;
  `.github/dependabot.yaml` keeps the Gradle dependencies and the actions current.
- The declared target set is deliberately maximal and reaches platforms most libraries never ship, with
  `binaries.executable()` on JS and Wasm. The list lives in `module/build.gradle.kts`; a real library trims it.
- `README.md` is a stub on purpose; the derived project writes its own.

## Making a project from this template

- Rename the module and the root project: `include(":module")` and `rootProject.name` in `settings.gradle.kts`, the
  directory itself, and every `:module` reference. The comments in `settings.gradle.kts` describe subprojects this
  template does not have; fix them while renaming.
- Replace the identity in `module/build.gradle.kts`: `group`, the whole POM block, the GitHub Packages URL and its
  owner, and the Dokka `sourceLink`. Replace `LICENSE` to match the POM's license, and set `version` in
  `gradle.properties`.
- Trim the target list and the JVM target to what the library is actually for. `explicitApi()` is already switched on,
  so the sources the project adds declare their visibilities explicitly from the first commit.
- Give the repository its own secrets for the publish workflow — Maven Central credentials, the GPG key and passphrase —
  and its own GitHub Packages owner, which the workflow passes explicitly.
- Write the README and write the project's own `AGENTS.md` (next section).
- Commit `kotlin-js-store/yarn.lock`: `kotlinUpgradeYarnLock` writes it and keeps it current, it is what makes the JS
  and Wasm dependency set reproducible, and a stale lock fails the build. This template leaves it out only to stay small
  and easy to maintain.

## General rules to carry into a derived project

- Conventional commits with a scope; one concern per commit, and a fix stays separate from its regression test.
- The version catalog is the single source of versions. Nothing declares a version inline, and a new dependency is added
  to the catalog rather than to a build file.
- Comments and KDoc are English: describe current behavior positively, never the change history, and state a concrete
  reason for surprising behavior.
- Reproduce before fixing: verify a claim about the compiler, the library or the platform with a minimal probe and quote
  its output in the report instead of reasoning from memory.
- Probes, clones and temporary copies live outside the repository; never modify the repository from a probe and never
  commit one.
- Run the formatter, the build and the tests before considering a change done. Bypass the build cache when you need a
  result you can trust, since it can serve a stale one.

## Writing AGENTS.md for the real project

- Start from the shape of this file, then delete everything that does not apply. An AGENTS.md that still describes the
  template it came from is worse than no file at all.
- Cover the four things a newcomer cannot infer: what the project is and is not; the exact commands to run; the rules
  that are not visible in the code; and the deliberate decisions a fresh reader would mistake for mistakes.
- Keep every claim reproducible in that repository today. Version numbers, target lists, file lists and test counts go
  stale — name the file that owns the value instead of copying it.
- Record the reason behind anything surprising. A rule with its reason survives review; a rule without one gets deleted
  by the next agent.
- Prefer deleting a rule that no longer holds over leaving it in place, because a stale line teaches the wrong thing.
- Write for someone who has never seen the project and cannot ask questions.

## Maintaining this file

- This file ships with the template, so a change here reaches every project created afterwards. Keep it free of
  project-specific facts and of anything that holds for only one library.
- Update it when the scaffold changes what an agent has to do — a task renamed, a check added or removed — when a rule
  turns out to be wrong, or when the same question has been answered twice.
- Keep the shape: preamble, what this is, how a project is made from it, the general rules, how to write the derived
  file, and this section. Add a section instead of letting one grow to cover everything.
- Before committing a change here, run the commands this file names. A document that describes a build nobody can run is
  worse than a shorter document that is accurate.

## Deliberate decisions (do not "fix")

- The module has no sources and no sample application. An empty module is the finished state of a scaffold; adding code
  belongs to the derived project.
- `kotlin-js-store/yarn.lock` is not committed here: it would add size and upkeep to a scaffold with no sources, and a
  library that ships JS or Wasm code commits it instead.
- The maximal target list stays even though most projects trim it: the template exists to show the whole surface.
- `README.md` stays a stub, written by the derived project rather than by the template.
