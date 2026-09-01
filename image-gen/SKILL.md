---
name: image-gen
description: >
  Generate and edit images using Google's Nano Banana (Gemini 3.1/3/2.5) API via the google-genai SDK.
  Covers text-to-image, image editing (text-and-image-to-image), multi-turn chat editing,
  aspect ratios, resolutions, and using reference images. Use when user wants to generate
  product mockups, illustrations, or edit existing images with the Gemini API.
---

# Nano Banana Image Generation Skill

> [!NOTE]
> For a detailed reference guide on using Nano Banana, including JavaScript, Go, Java, and REST code samples, see the companion [reference.md](reference.md).

## Prerequisites

```bash
pip install google-genai pillow
```

Set `GEMINI_API_KEY` environment variable or pass it to the client constructor.

---

## Model Variants

| Model | Code | Speed | Best For |
|-------|------|-------|----------|
| **Nano Banana 2** (Gemini 3.1 Flash Image) | `gemini-3.1-flash-image-preview` | Fast | High-volume developer use cases |
| **Nano Banana Pro** (Gemini 3 Pro Image) | `gemini-3-pro-image-preview` | Standard | Professional asset production, complex instructions, text rendering |
| **Nano Banana** (Gemini 2.5 Flash Image) | `gemini-2.5-flash-image` | Fastest | High-volume, low-latency tasks |

All generated images include a SynthID watermark.

---

## 1. Image generation (text-to-image)

```python
from google import genai
from google.genai import types

client = genai.Client()

prompt = "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme"
response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",
    contents=[prompt],
)

for part in response.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = part.as_image()
        image.save("generated_image.png")
```

---

## 2. Image editing (text-and-image-to-image)

Provide an image and use text prompts to add, remove, or modify elements, change the style, or adjust the color grading.

```python
from google import genai
from PIL import Image

client = genai.Client()

prompt = "Create a picture of my cat eating a nano-banana in a fancy restaurant under the Gemini constellation"
image = Image.open("/path/to/cat_image.png")

response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",
    contents=[prompt, image],
)

for part in response.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        generated_image = part.as_image()
        generated_image.save("edited_image.png")
```

---

## 3. Multi-turn image editing

Keep generating and editing images conversationally. Chat or multi-turn conversation is the recommended way to iterate on images.

```python
from google import genai
from google.genai import types

client = genai.Client()

# 1. Start a chat session with image capabilities
chat = client.chats.create(
    model="gemini-3.1-flash-image-preview",
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        tools=[{"google_search": {}}] # Optional: grounding
    )
)

# 2. Initial generation
message = "Create a vibrant infographic about photosynthesis suitable for a 4th grader."
response = chat.send_message(message)

for part in response.parts:
    if part.inline_data is not None:
        part.as_image().save("photosynthesis.png")

# 3. Iterate/Edit with new prompt and parameters
edit_message = "Update this infographic to be in Spanish. Do not change any other elements of the image."
aspect_ratio = "16:9" # Options: 1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9
resolution = "2K"     # Options: 512, 1K, 2K, 4K

response = chat.send_message(
    edit_message,
    config=types.GenerateContentConfig(
        response_format={"image": {"aspect_ratio": aspect_ratio, "image_size": resolution}},
    )
)

for part in response.parts:
    if part.inline_data is not None:
        part.as_image().save("photosynthesis_spanish.png")
```

---

## 4. Reference Images (Gemini 3 models)

Gemini 3 image models allow mixing up to 14 reference images (e.g., preserving subjects, characters, objects).
*   **3.1 Flash Image:** Up to 10 objects, 4 characters.
*   **3 Pro Image:** Up to 6 objects, 5 characters.

```python
from google import genai
from google.genai import types
from PIL import Image

client = genai.Client()

prompt = "An office group photo of these people, they are making funny faces."
aspect_ratio = "5:4"
resolution = "2K"

response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",
    contents=[
        prompt,
        Image.open('person1.png'),
        Image.open('person2.png'),
        Image.open('person3.png'),
    ],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        response_format={"image": {"aspect_ratio": aspect_ratio, "image_size": resolution}},
    )
)

for part in response.parts:
    if part.inline_data is not None:
        part.as_image().save("office.png")
```

---

## 5. Config Parameters Reference

*   **aspect_ratio**: `"1:1"`, `"1:4"`, `"1:8"`, `"2:3"`, `"3:2"`, `"3:4"`, `"4:1"`, `"4:3"`, `"4:5"`, `"5:4"`, `"8:1"`, `"9:16"`, `"16:9"`, `"21:9"`
*   **image_size (Resolution)**: `"512"` (3.1 Flash only), `"1K"`, `"2K"`, `"4K"`
*   **response_modalities**: Must include `'IMAGE'` in chat to get image data back.

---

## 6. Advanced Features

*   **Grounding with Google Search**: Models can use Google Search to verify facts and generate imagery based on real-time data. Add `tools=[{"google_search": {}}]` to the config.
*   **Thinking mode** (Gemini 3 Pro Image): Reasons through complex prompts to refine the composition before outputting the final result.

---

## References

*   [Nano Banana Image API Reference Guide](reference.md)
