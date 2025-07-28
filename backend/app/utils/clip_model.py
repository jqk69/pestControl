from PIL import Image
import io
import torch
from transformers import CLIPProcessor, CLIPModel

# Define pest categories
pest_labels = [
    "rat", "mouse", "bandicoot",
    "cockroach", "mosquito", "termite", "housefly", "bed bug", "ant",
    "silverfish", "grasshopper", "locust", "aphid", "mealybug", "thrips",
    "cutworm", "armyworm", "weevil", "fruit fly", "stem borer",
    "slug", "snail",
    "powdery mildew on leaves", "rust fungus", "downy mildew", "rice plant fungus",
    "white grub", "leafhopper", "nematode"
]
prompt_texts = [f"A photo of a {label}" for label in pest_labels]

# Lazy-loaded global variables
_model = None
_processor = None

def load_clip():
    global _model, _processor
    if _model is None or _processor is None:
        _model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to("cpu")
        _processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def predict_pest_from_image(image_bytes):
    """
    Predict pest type from image bytes using CLIP.
    Returns: (predicted_label, confidence)
    """
    load_clip()  # Load model only when needed

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = _processor(text=prompt_texts, images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = _model(**inputs)
        logits = outputs.logits_per_image
        probs = logits.softmax(dim=1)

    top_prob, top_idx = probs[0].topk(1)
    predicted_label = pest_labels[top_idx.item()]
    confidence = float(top_prob.item())

    return predicted_label, confidence
