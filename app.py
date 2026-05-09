import re
from dataclasses import dataclass
from typing import Optional

import altair as alt
import numpy as np
import pandas as pd
import streamlit as st


@dataclass
class AgentAnswer:
    """Structured result returned by the local (rule-based) insight agent."""

    title: str
    text: str
    explanation: Optional[str] = None
    code_snippet: Optional[str] = None
    table: Optional[pd.DataFrame] = None
    chart_df: Optional[pd.DataFrame] = None
    chart_x: Optional[str] = None
    chart_y: Optional[str] = None


def _normalize(s: str) -> str:
    """Lowercase + collapse whitespace for simpler matching."""
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def _pick_numeric_column(df: pd.DataFrame, q: str) -> Optional[str]:
    """
    Choose a numeric column that best matches the question.
    Preference order:
    - explicit mentions in the question
    - common business metrics
    - first numeric column
    """
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    if not numeric_cols:
        return None

    qn = _normalize(q)

    # Explicit mention: "avg revenue", "total units_sold", etc.
    for c in numeric_cols:
        if _normalize(str(c)) in qn:
            return c

    # Common metric names (covers many CSVs)
    preference = [
        "revenue",
        "sales",
        "amount",
        "price",
        "profit",
        "units",
        "quantity",
        "qty",
    ]
    for token in preference:
        for c in numeric_cols:
            if token in _normalize(str(c)):
                return c

    return numeric_cols[0]


def _pick_category_column(df: pd.DataFrame, q: str) -> Optional[str]:
    """
    Choose a categorical column to group by (e.g., product, region).
    Preference order:
    - explicit mention in the question
    - common dimensions (product/name/category/region)
    - first non-numeric column
    """
    qn = _normalize(q)

    non_numeric_cols = [
        c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])
    ]
    if not non_numeric_cols:
        return None

    for c in non_numeric_cols:
        if _normalize(str(c)) in qn:
            return c

    preference = ["product", "name", "category", "region", "state", "city"]
    for token in preference:
        for c in non_numeric_cols:
            if token in _normalize(str(c)):
                return c

    return non_numeric_cols[0]


def _infer_intent(q: str) -> str:
    """
    Classify the question into a small set of supported intents.
    This is a local, rule-based "agent" (no external LLM).
    """
    qn = _normalize(q)

    # Column metadata / schema style questions
    if any(
        phrase in qn
        for phrase in [
            "what are the columns",
            "column names",
            "show columns",
            "list columns",
            "headers",
            "schema",
            "features",
        ]
    ):
        return "columns"

    # Summary / statistics questions
    if any(
        phrase in qn
        for phrase in [
            "summary",
            "describe",
            "statistics",
            "stats",
            "overview",
            "basic info",
        ]
    ):
        return "summary"

    # Highest / top
    if any(w in qn for w in ["highest", "max", "maximum", "top", "most"]):
        return "max"

    # Lowest / min
    if any(w in qn for w in ["lowest", "min", "minimum", "least"]):
        return "min"

    # Average / mean
    if any(w in qn for w in ["average", "avg", "mean"]):
        return "mean"

    # Total / sum
    if any(w in qn for w in ["total", "sum", "overall"]):
        return "sum"

    # Count
    if any(w in qn for w in ["count", "how many", "number of"]):
        return "count"

    # Filtering style questions
    if any(w in qn for w in ["where ", "for ", "only ", "filter"]):
        return "filter"

    return "unknown"


def answer_question(df: pd.DataFrame, question: str) -> AgentAnswer:
    """
    Interpret a natural-language question and compute an answer using pandas.

    Supported patterns:
    - "Which <category> has the highest <metric>?"
    - "What is the average <metric>?"
    - "What is the total <metric>?"
    - "How many rows/records are there?"
    - "Which <category> has the lowest <metric>?"
    """
    if df is None or df.empty:
        return AgentAnswer(
            title="No data",
            text="Upload a CSV (or use the sample data) to ask questions.",
        )

    qn = _normalize(question)
    intent = _infer_intent(question)

    # Metadata / schema and summary questions do not need metric detection
    if intent == "columns":
        return AgentAnswer(
            title="Columns",
            text="Detected column names and dtypes:",
            explanation="I inspected the dataframe's columns and their pandas dtypes.",
            code_snippet="df.dtypes",
            table=pd.DataFrame(
                {
                    "column": df.columns,
                    "dtype": [str(df[c].dtype) for c in df.columns],
                }
            ),
        )

    if intent == "summary":
        summary = df.describe(include="all", datetime_is_numeric=True).T
        return AgentAnswer(
            title="Dataset summary statistics",
            text="High-level summary statistics for your dataset:",
            explanation=(
                "I used pandas.describe() with include='all' to compute count, mean, "
                "standard deviation, min/max and other summary stats for each column."
            ),
            code_snippet="df.describe(include='all', datetime_is_numeric=True).T",
            table=summary,
        )

    metric_col = _pick_numeric_column(df, question)
    category_col = _pick_category_column(df, question)

    # Common "how many rows" phrasing
    if "how many" in qn and any(w in qn for w in ["row", "rows", "record", "records"]):
        return AgentAnswer(
            title="Row count",
            text=f"There are **{len(df):,}** rows in this dataset.",
        )

    if intent == "count":
        return AgentAnswer(
            title="Count",
            text=f"Row count: **{len(df):,}**",
        )

    if (
        metric_col is None
        and intent in {"sum", "mean", "max", "min"}
        and intent not in {"columns", "summary"}
    ):
        return AgentAnswer(
            title="No numeric columns found",
            text="I couldn't find any numeric columns to calculate with. Try a CSV that has numeric values (e.g., revenue, sales, units).",
        )

    # If the question hints at "which product/region..." or "by <category>" we do group-by.
    wants_group = any(w in qn for w in ["which", "by", "per", "each"]) and category_col

    # Grouped highest / lowest
    if intent in {"max", "min"} and wants_group:
        grouped = (
            df.groupby(category_col, dropna=False)[metric_col]
            .sum(min_count=1)
            .sort_values(ascending=(intent == "min"))
        )

        if grouped.dropna().empty:
            return AgentAnswer(
                title="No results",
                text=f"Couldn't compute '{metric_col}' grouped by '{category_col}'.",
            )

        best_label = grouped.index[0]
        best_value = grouped.iloc[0]

        top_n = grouped.head(10).reset_index()
        top_n.columns = [category_col, metric_col]

        return AgentAnswer(
            title=f"{category_col} with {('highest' if intent == 'max' else 'lowest')} {metric_col}",
            text=f"**{best_label}** has the {('highest' if intent == 'max' else 'lowest')} **{metric_col}** (sum): **{best_value:,.4g}**",
            table=top_n,
            chart_df=top_n,
            chart_x=category_col,
            chart_y=metric_col,
        )

    # Grouped totals and averages: "total revenue by product", "average sales per region"
    if intent in {"sum", "mean"} and wants_group and metric_col:
        agg_func = "sum" if intent == "sum" else "mean"
        grouped = (
            df.groupby(category_col, dropna=False)[metric_col]
            .agg(agg_func)
            .sort_values(ascending=False)
        )
        grouped_df = grouped.reset_index()
        grouped_df.columns = [category_col, metric_col]

        return AgentAnswer(
            title=f"{agg_func.title()} {metric_col} by {category_col}",
            text=(
                f"{agg_func.title()} **{metric_col}** grouped by **{category_col}**.\n\n"
                f"Top group: **{grouped.index[0]}** with **{grouped.iloc[0]:,.4g}**."
            ),
            explanation=(
                f"I detected a grouped {agg_func} question and grouped the data by "
                f"'{category_col}', then computed the {agg_func} of '{metric_col}' for each group."
            ),
            code_snippet=(
                f"df.groupby('{category_col}', dropna=False)['{metric_col}']"
                f".agg('{agg_func}').sort_values(ascending=False)"
            ),
            table=grouped_df,
            chart_df=grouped_df,
            chart_x=category_col,
            chart_y=metric_col,
        )

    if intent == "sum" and metric_col:
        total = df[metric_col].sum()
        return AgentAnswer(
            title=f"Total {metric_col}",
            text=f"Total **{metric_col}**: **{total:,.4g}**",
            explanation=(
                f"I interpreted your question as asking for the total of the numeric "
                f"column '{metric_col}' and applied pandas.sum() on that column."
            ),
            code_snippet=f"df['{metric_col}'].sum()",
        )

    if intent == "mean" and metric_col:
        avg = df[metric_col].mean()
        return AgentAnswer(
            title=f"Average {metric_col}",
            text=f"Average **{metric_col}**: **{avg:,.4g}**",
            explanation=(
                f"I interpreted your question as asking for the average of the numeric "
                f"column '{metric_col}' and applied pandas.mean() on that column."
            ),
            code_snippet=f"df['{metric_col}'].mean()",
        )

    if intent in {"max", "min"} and metric_col:
        # Non-grouped max/min
        series = df[metric_col]
        val = series.max() if intent == "max" else series.min()
        idx = series.idxmax() if intent == "max" else series.idxmin()

        # Show the full row where it happened (useful context)
        row = df.loc[[idx]].copy()
        return AgentAnswer(
            title=f"{('Max' if intent == 'max' else 'Min')} {metric_col}",
            text=f"{('Maximum' if intent == 'max' else 'Minimum')} **{metric_col}** is **{val:,.4g}** (row index {idx}).",
            explanation=(
                f"I looked at the column '{metric_col}' and used pandas.idxmax()/idxmin() "
                "to find the row with the extreme value, then returned that full row."
            ),
            code_snippet=(
                f"idx = df['{metric_col}'].idx{'max' if intent == 'max' else 'min'}()\n"
                f"df.loc[[idx]]"
            ),
            table=row,
        )

    # Simple filtering: "sales for product Alpha", "rows for North", etc.
    if intent == "filter" and category_col:
        # Heuristic: take the text after the last "for" or "where" as a value
        value_part = ""
        if " for " in qn:
            value_part = qn.split(" for ", maxsplit=1)[-1]
        elif " where " in qn:
            value_part = qn.split(" where ", maxsplit=1)[-1]

        value_part = value_part.strip().strip("?.,")

        if not value_part:
            return AgentAnswer(
                title="Filter not understood",
                text=(
                    "I couldn't detect what to filter for. "
                    "Try questions like 'sales for product Alpha' or 'rows where region is North'."
                ),
            )

        mask = df[category_col].astype(str).str.lower().str.contains(value_part)
        filtered = df[mask]

        if filtered.empty:
            return AgentAnswer(
                title="No matching rows",
                text=(
                    f"No rows where **{category_col}** looks like `{value_part}`. "
                    "Try another value or check spelling."
                ),
            )

        # Provide optional metric summary for the filtered subset
        summary_text = ""
        if metric_col:
            subset_sum = filtered[metric_col].sum()
            subset_avg = filtered[metric_col].mean()
            summary_text = (
                f"\n\nFor this subset, total **{metric_col}** is **{subset_sum:,.4g}** "
                f"and average **{metric_col}** is **{subset_avg:,.4g}**."
            )

        return AgentAnswer(
            title=f"Filtered rows where {category_col} ≈ {value_part}",
            text=f"Found **{len(filtered):,}** matching rows.{summary_text}",
            explanation=(
                f"I treated '{value_part}' as a value for the column '{category_col}' "
                "and used a case-insensitive contains() filter to keep matching rows."
            ),
            code_snippet=(
                f"mask = df['{category_col}'].astype(str).str.lower().str.contains('{value_part}')\n"
                "filtered = df[mask]"
            ),
            table=filtered,
        )

    return AgentAnswer(
        title="Try a supported question",
        text=(
            "I can answer questions about **totals**, **averages**, **highest/lowest**, "
            "**grouped metrics**, basic **filters**, and quick **summaries**.\n\n"
            "Examples:\n"
            "- Which product has the highest revenue?\n"
            "- What is the average units_sold?\n"
            "- What is the total revenue by region?\n"
            "- Show a summary of the dataset.\n"
            "- What are the column names?\n"
            "- Show rows for product Alpha."
        ),
        explanation=(
            "Right now I only understand a limited set of analytics-style questions "
            "(totals, averages, extremes, grouped metrics, filters, summaries). "
            "Completely free-form questions about the *meaning* of the data are out of "
            "scope for this simple local agent."
        ),
        code_snippet=None,
    )


def main() -> None:
    st.set_page_config(page_title="Local CSV Insight Agent", layout="wide")

    st.title("Local CSV Insight Agent")
    st.caption("Upload a CSV and ask questions in plain English (runs locally, pandas-powered).")

    with st.sidebar:
        st.header("Upload CSV files")
        uploaded_files = st.file_uploader(
            "Choose one or more CSV files", type=["csv"], accept_multiple_files=True
        )

        st.divider()
        st.header("Tips")
        st.markdown(
            "- Upload one or more CSVs with **compatible columns** (e.g., same schema).\n"
            "- I will automatically **stack** them into a single combined table.\n"
            "- Ask about **total**, **average**, **highest**, **lowest**, **grouped** metrics, filters, or **summary**.\n"
            "- Mention a column name if you can (e.g., `revenue`, `units_sold`)."
        )

    # Load and combine data (user can upload multiple files; all are analysed together)
    frames = []
    per_file_info = []
    if uploaded_files:
        for f in uploaded_files:
            try:
                # Reset pointer in case the file-like object was read earlier
                f.seek(0)
                tmp = pd.read_csv(
                    f,
                    engine="python",         # more tolerant parser
                    on_bad_lines="skip",     # skip badly formatted rows instead of failing
                )
                tmp["__source_file"] = f.name
                frames.append(tmp)
                per_file_info.append(
                    {
                        "file": f.name,
                        "rows": len(tmp),
                        "columns": tmp.shape[1],
                        "status": "ok",
                    }
                )
            except Exception as e:
                per_file_info.append(
                    {
                        "file": f.name,
                        "rows": None,
                        "columns": None,
                        "status": f"error: {type(e).__name__}",
                    }
                )

    df = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
    active_label = (
        f"Combined {len(frames)} file(s)"
        if frames
        else "No files (combined dataframe is empty)"
    )

    # Basic cleaning 1: try to parse dates (harmless if none)
    for c in df.columns:
        if pd.api.types.is_object_dtype(df[c]) and any(
            k in _normalize(str(c)) for k in ["date", "time", "timestamp"]
        ):
            df[c] = pd.to_datetime(df[c], errors="ignore")

    # Basic cleaning 2: try to coerce mostly-numeric object columns into real numbers.
    # This helps when CSVs contain strings like "None" or mixed types in marks/score columns.
    for c in df.columns:
        if not pd.api.types.is_object_dtype(df[c]):
            continue

        # Skip columns that look like dates (already handled above)
        if any(k in _normalize(str(c)) for k in ["date", "time", "timestamp"]):
            continue

        # Replace common "missing" strings with NaN, then try to convert.
        series = df[c].replace(
            ["None", "none", "NULL", "null", ""], np.nan
        )
        coerced = pd.to_numeric(series, errors="coerce")

        # If we got at least some numeric values, treat this as numeric.
        non_null = coerced.notna().sum()
        if non_null > 0 and non_null >= len(coerced) * 0.3:
            df[c] = coerced

    left, right = st.columns([1.2, 1])

    with left:
        st.subheader(f"Preview: {active_label}")
        if df.empty:
            st.info("Upload at least one CSV file in the sidebar and select it from the dropdown to see a preview and ask questions.")
        else:
            st.dataframe(df.head(50), use_container_width=True)

    with right:
        st.subheader("Ask a question")
        default_q = "Which product has the highest revenue?"
        question = st.text_input("Your question", value=default_q, placeholder=default_q)
        run = st.button("Run", type="primary")

        if run:
            ans = answer_question(df, question)
            st.markdown(f"### {ans.title}")
            st.markdown(ans.text)

            if ans.explanation or ans.code_snippet:
                with st.expander("How I answered this question"):
                    if ans.explanation:
                        st.markdown(ans.explanation)
                    if ans.code_snippet:
                        st.code(ans.code_snippet, language="python")

            if ans.table is not None:
                st.dataframe(ans.table, use_container_width=True)

            if ans.chart_df is not None and ans.chart_x and ans.chart_y:
                chart = (
                    alt.Chart(ans.chart_df)
                    .mark_bar()
                    .encode(
                        x=alt.X(f"{ans.chart_x}:N", sort="-y", title=ans.chart_x),
                        y=alt.Y(f"{ans.chart_y}:Q", title=ans.chart_y),
                        tooltip=[ans.chart_x, ans.chart_y],
                    )
                    .properties(height=320)
                )
                st.altair_chart(chart, use_container_width=True)

    st.divider()
    st.subheader("Detected columns (combined)")
    if not df.empty:
        numeric = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        non_numeric = [c for c in df.columns if c not in numeric]
        st.write(
            {
                "numeric_columns": numeric,
                "non_numeric_columns": non_numeric,
                "rows": int(len(df)),
                "columns": int(df.shape[1]),
            }
        )

    if per_file_info:
        st.subheader("Per-file overview")
        st.dataframe(pd.DataFrame(per_file_info), use_container_width=True)


if __name__ == "__main__":
    main()
