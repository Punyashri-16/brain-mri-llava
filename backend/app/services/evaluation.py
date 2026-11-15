from app.schemas import MRIReport


REPORT_FIELDS = [
    "findings",
    "location",
    "lesion_characteristics",
    "edema",
    "mass_effect",
    "interpretation",
    "uncertainty"
]


def is_not_assessable(value: str) -> bool:
    text = value.strip().lower()

    indicators = [
        "not assessable",
        "not provided",
        "unable to assess",
        "cannot be assessed",
        "not available"
    ]

    return any(indicator in text for indicator in indicators)


def evaluate_report(report: MRIReport) -> dict:

    assessable_fields = []
    non_assessable_fields = []

    for field in REPORT_FIELDS:
        value = getattr(report, field, "")

        if value and not is_not_assessable(value):
            assessable_fields.append(field)
        else:
            non_assessable_fields.append(field)

    total_fields = len(REPORT_FIELDS)

    completeness = round(
        (len(assessable_fields) / total_fields) * 100, 2
    )

    uncertainty_text = report.uncertainty.strip()

    return {
        "total_fields": total_fields,
        "assessable_fields": assessable_fields,
        "non_assessable_fields": non_assessable_fields,
        "completeness_percentage": completeness,
        "uncertainty_provided": (
            bool(uncertainty_text)
            and not is_not_assessable(uncertainty_text)
        ),
        "evaluation_note": (
            "Structural completeness only. "
            "This does not measure medical accuracy or factual grounding."
        )
    }