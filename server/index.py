from fastapi import FastAPI, File, HTTPException, UploadFile
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.
import os
import base64

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY") )

@app.get("/")
def read_root():
    return {"Hello": "DevCon!"}

@app.post("/")
async def get_openai_response_post(image: UploadFile = File(...)):
  try:
    image_content = await image.read()
    base64_image = base64.b64encode(image_content).decode('utf-8') # convert image to base64

    # send the image to OpenAI's GPT-4 Turbo model
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{
            "role":
            "user",
            "content": [
                {
                    "type": "text",
                    "text": system_prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{base64_image}"
                    },
                },
            ],
        }],
        max_tokens=15, # limits how long the response can be
        top_p=0.1) #uses common and fitting words instead of rare or strange ones so it makes the response more predictable

    # extract the food and price from the response
    
    food, price = response.choices[0].message.content.split('=')
    return {"food": food, "price": price}

    return response.choices[0].message.content

  except Exception as e:
    print(f"Error: {e}")
    raise HTTPException(status_code=500, detail=str(e))


system_prompt = """
You are an agent specialized in tagging images of food and proving its possible price.
You will be provided with an image and your goal is to identify what food it is and it's estimated price.
The price shouldn't be the most updated, just give an estimate from stores like Walmart, Publix, Whole Foods, etc.
Return the food and the price in the format of a string separated with an equal sign, like this: Oldfashioned Oatmeal=3.99
If it's not food or you can't identify the price just return 'unknown' for both price and food.
If there are 2 or more food items in the image, return only one of them.
"""