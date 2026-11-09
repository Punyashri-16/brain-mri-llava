
from pathlib import Path
import nibabel as nib
import numpy as np

DATASET_DIR = Path("data/dataset/samples/BraTS2021_00495")

MODALITIES = ["t1", "t1ce", "t2", "flair", "seg"]

def inspect_brats():
    shapes = {}

    for modality in MODALITIES:
        files = list(DATASET_DIR.glob(f"*_{{modality}}.nii.gz".format(modality=modality)))

        if not files:
            print(f"Missing file: {modality}")
            continue

        file = files[0]
        image = nib.load(str(file))
        data = np.asarray(image.dataobj)

        shapes[modality] = image.shape

        print(f"\n{modality.upper()}")
        print("File:", file.name)
        print("Dimensions:", image.shape)
        print("Voxel spacing:", image.header.get_zooms())
        print("Data type:", image.get_data_dtype())
        print("Orientation:", nib.aff2axcodes(image.affine))

        if modality == "seg":
            print("Mask labels:", np.unique(data))

    print("\n--- SHAPE VALIDATION ---")

    if len(shapes) == 5:
        if len(set(shapes.values())) == 1:
            print("SUCCESS: All five volumes have matching dimensions.")
        else:
            print("WARNING: Volume dimensions do not match.")
            print(shapes)
    else:
        print("Some files are missing. Check the dataset folder.")

if __name__ == "__main__":
    inspect_brats()
