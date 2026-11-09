import time
import asyncio
from app.services.evaluation import evaluate_report
from app.services.llava_service import generate_mri_report
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image
from io import BytesIO

from app.prompts import get_prompt, PROMPTS
from app.schemas import (
    AnalysisResponse,
    MRIReport,
    ComparisonResponse
)

router = APIRouter()


# Supported prompt strategies
PROMPT_TYPES = [
    "generic",
    "tumor_focused",
    "radiology_guided",
    "safety_aware"
]


# Validate uploaded MRI image
async def validate_upload(file: UploadFile):

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds the 10 MB limit"
        )

    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image_format = image.format
            image.verify()

        if image_format not in ["PNG", "JPEG"]:
            raise HTTPException(
                status_code=400,
                detail="Only PNG and JPEG images are supported"
            )

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )

    return image_bytes


# Create a temporary mock report
def create_mock_report():

    return MRIReport(
        findings=(
            "Image received. LLaVA inference "
            "is not connected yet."
        ),
        location="Not assessed",
        lesion_characteristics="Not assessed",
        edema="Not assessed",
        mass_effect="Not assessed",
        interpretation="Mock response for API testing only.",
        uncertainty="No actual MRI analysis has been performed."
    )


# 1. Analyse one MRI using one selected prompt
@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_mri(
    file: UploadFile = File(...),
    prompt_type: str = Form("radiology_guided")
):
    try:
        get_prompt(prompt_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid prompt type"
        )

    image_bytes = await validate_upload(file)

    try:
        # Start timer
        start_time = time.perf_counter()

        # Run LLaVA inference
        report, inference_status = await asyncio.to_thread(
            generate_mri_report,
            image_bytes,
            prompt_type
        )

        # Calculate inference time
        inference_time = round(
            time.perf_counter() - start_time, 2
        )

        return AnalysisResponse(
            status=inference_status,
            prompt_type=prompt_type,
            report=report,
            inference_time_seconds=inference_time,
            evaluation=evaluate_report(report)
        )

    except Exception as error:
        print(f"LLaVA inference error: {error}")

        raise HTTPException(
            status_code=502,
            detail="LLaVA inference failed. Check that Ollama is running and the model is available."
        )


# 2. Compare all four prompt strategies on the same MRI

@router.post("/compare", response_model=ComparisonResponse)
async def compare_prompts(file: UploadFile = File(...)):

    image_bytes = await validate_upload(file)

    results = []
    comparison_start = time.perf_counter()

    try:
        for prompt_type in PROMPT_TYPES:

            prompt_start = time.perf_counter()

            report, inference_status = await asyncio.to_thread(
                generate_mri_report,
                image_bytes,
                prompt_type
            )

            inference_time = round(
                time.perf_counter() - prompt_start, 2
            )

            results.append(
                AnalysisResponse(
                    status=inference_status,
                    prompt_type=prompt_type,
                    report=report,
                    inference_time_seconds=inference_time,
                    evaluation=evaluate_report(report)
                )
            )

        total_duration = round(
            time.perf_counter() - comparison_start, 2
        )

        return ComparisonResponse(
            status="success",
            total_prompts=len(results),
            total_duration_seconds=total_duration,
            results=results
        )

    except Exception as error:
        print(f"Prompt comparison error: {error}")

        raise HTTPException(
            status_code=502,
            detail="Prompt comparison failed during LLaVA inference."
        )
