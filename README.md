# Local CSV Insight Agent (Streamlit + pandas)

A small, local AI-style agent that lets you upload a CSV and ask questions in natural language.  
It interprets common questions (total / average / highest / lowest) and runs the correct **pandas** operations, then displays results and a simple chart when relevant.

## Project structure

- `app.py` - Streamlit app + local “insight agent” (rule-based)
- `sample_data.csv` - sample dataset to try immediately
- `requirements.txt` - Python dependencies
- `README.md` - instructions

## Setup

Create and activate a virtual environment (recommended), then install dependencies.

### Windows (PowerShell)

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run the app

```bash
streamlit run app.py
```

Streamlit will print a local URL in your terminal. Open it in your browser.

## How to use

1. In the sidebar, keep **Use sample_data.csv** enabled (or upload your own CSV).
2. Type a question, for example:
   - Which product has the highest revenue?
   - Which product has the highest sales?
   - What is the average units_sold?
   - What is the total revenue?
3. Click **Run**.

## Notes (how the “agent” works)

This project is intentionally simple and runs fully locally:

- It uses **rule-based intent detection** (keywords like “total”, “average”, “highest”).
- It chooses columns by matching your question to column names (and common metric names like `revenue`, `sales`, `units`).
- For questions like “Which product has the highest revenue?”, it automatically performs a `groupby(product)[revenue].sum()` and ranks the result.

If your CSV uses different column names, just mention them in the question (example: “What is the total `Amount`?”).
