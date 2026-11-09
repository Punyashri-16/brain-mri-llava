
from pydantic import BaseModel
from typing import Any

class MRIReport(BaseModel):

    findings: str

    location: str

    lesion_characteristics: str

    edema: str

    mass_effect: str

    interpretation: str

    uncertainty: str


from pydantic import BaseModel


class MRIReport(BaseModel):
    findings: str
    location: str
    lesion_characteristics: str
    edema: str
    mass_effect: str
    interpretation: str
    uncertainty: str


class AnalysisResponse(BaseModel):
    status: str
    prompt_type: str
    report: MRIReport
    inference_time_seconds: float = 0.0
    evaluation: dict[str, Any] | None = None
    disclaimer: str = (
        "Research and educational use only. "
        "This output is not a clinical diagnosis."
    )


class ComparisonResponse(BaseModel):
    status: str
    total_prompts: int
    total_duration_seconds: float
    results: list[AnalysisResponse]

