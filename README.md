# Capacity Forecasting & Recommendation Engine (Prototype)

**Live prototype:** [mindbody-prototype.karlology.com](https://mindbody-prototype.karlology.com/)

This is a prototype of an enterprise-level workflow for forecasting class capacity and generating AI-driven recommendations for class changes, based on historical booking, attendance, and performance data.

The system models two core scenarios: **high-demand sessions** that may need additional seats or trainers, and **underperforming sessions** that may benefit from a schedule change, instructor swap, or class-type replacement. Recommendations are generated using historical patterns (time-of-day attendance trends, instructor performance, class-type fit, and client sentiment) to surface actionable, data-backed suggestions rather than static reports.

## How this was built

This prototype was assembled using a combination of AI tools, each suited to a different part of the build:

- **[Lovable](https://lovable.dev)** was used to create the mock studio-management portal, styled similarly to platforms like Mindbody, giving the prototype a realistic operational interface to build the forecasting features on top of.
- **Claude Code** was used to build the core feature set: the forecasting logic, recommendation engine, capacity modeling, and the underlying data structures driving the scenarios.
- **Cursor** was used for rapid UI iteration and refinement once the base features were in place.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
