from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
from google.cloud import storage
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"--- Using device: {device} ---")

# --- Configuration (Simplified to two mixed-domain models) ---
BUCKET_NAME = "msc-research-mwp-dataset-v1"
# IMPORTANT: You need to create and save these mixed-domain models first
# The paths below are examples. Replace with the actual paths where you save them.
MODELS_INFO = {
    "sinhala": "models/sinhala_mixed_model", # Model trained on Sinhala Simple + Algebraic
    "tamil": "models/tamil_mixed_model",     # Model trained on Tamil Simple + Algebraic
}
LOCAL_MODEL_DIR = "./models"

# --- Model Loading (No changes needed here) ---
def download_model_from_gcs(bucket_name, source_blob_prefix, destination_folder):
    """Downloads a model folder from GCS."""
    if os.path.exists(destination_folder) and os.listdir(destination_folder):
        print(f"Model folder {destination_folder} already contains files. Skipping download.")
        return

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=source_blob_prefix)

    os.makedirs(destination_folder, exist_ok=True)
    print(f"Downloading model from gs://{bucket_name}/{source_blob_prefix} to {destination_folder}...")
    for blob in blobs:
        if not blob.name.endswith('/'):
            relative_path = os.path.relpath(blob.name, source_blob_prefix)
            local_file_path = os.path.join(destination_folder, relative_path)
            local_file_dir = os.path.dirname(local_file_path)
            os.makedirs(local_file_dir, exist_ok=True)
            
            blob.download_to_filename(local_file_path)
            print(f"Downloaded {blob.name} to {local_file_path}.")

# Create a dictionary to hold our loaded models
models = {}

# --- FastAPI App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def load_models():
    """Load all models from GCS into memory when the app starts."""
    print("Downloading and loading models on startup...")
    for model_key, model_path_in_bucket in MODELS_INFO.items():
        local_path = os.path.join(LOCAL_MODEL_DIR, model_key)
        
        download_model_from_gcs(BUCKET_NAME, model_path_in_bucket, local_path)
        
        try:
            model = MBartForConditionalGeneration.from_pretrained(local_path)
            tokenizer = MBart50TokenizerFast.from_pretrained(local_path)
            
            model.to(device)
            print(f"Model '{model_key}' successfully moved to {device}.")

            models[model_key] = {"model": model, "tokenizer": tokenizer}
            print(f"Successfully loaded model: {model_key}")
        except Exception as e:
            print(f"!!!!!!!!!! FAILED to load model {model_key} from {local_path}. Error: {e}")


# --- API Endpoint (Simplified) ---
class GenerationRequest(BaseModel):
    language: str # e.g., "sinhala" or "tamil"
    seed_text: str

@app.get("/")
def read_root():
    return {"status": "MWP Generation Backend is running"}

@app.post("/generate")
def generate_mwp(request: GenerationRequest):
    model_key = request.language # The key is now just "sinhala" or "tamil"
    
    if model_key not in models:
        return {"error": f"Model '{model_key}' not loaded or found. Available models: {list(models.keys())}"}

    loaded_model_info = models[model_key]
    model = loaded_model_info["model"]
    tokenizer = loaded_model_info["tokenizer"]

    try:
        lang_code = ""
        if request.language == "sinhala":
            lang_code = "si_LK"
        elif request.language == "tamil":
            lang_code = "ta_IN"
        else:
            return {"error": "Language not supported by tokenizer"}

        tokenizer.src_lang = lang_code
        
        inputs = tokenizer(request.seed_text, return_tensors="pt", padding=True, truncation=True, max_length=200)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        forced_bos_token_id = tokenizer.lang_code_to_id[lang_code]

        with torch.no_grad():
            generated_tokens = model.generate(
                **inputs,
                max_length=256,
                do_sample=True,
                temperature=1.0,
                num_return_sequences=1,
                forced_bos_token_id=forced_bos_token_id
            )

        generated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
        
        return {"generated_mwp": generated_text}
    except Exception as e:
        return {"error": f"An error occurred during generation: {e}"}